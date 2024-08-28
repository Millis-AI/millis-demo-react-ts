import React, { useRef, useEffect } from 'react';

interface AudioVisualizerProps {
  analyser: AnalyserNode | null;
}

const AudioVisualizer: React.FC<AudioVisualizerProps> = ({ analyser }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const requestRef = useRef<number>(0);

  const draw = () => {
    if (!analyser) {
      if (canvasRef.current) {
        // Clear the canvas if there's no live audio
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
        }
      }
      return; // Exit the draw function early if analyser is null
    }

    if (canvasRef.current && analyser) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');

      if (ctx) {
        const bufferLength = analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);
        analyser.getByteFrequencyData(dataArray);

        const WIDTH = canvas.width;
        const HEIGHT = canvas.height;
        const centerX = WIDTH / 2;
        const centerY = HEIGHT / 2;
        const innerRadius = 80;
        const outerRadius = 120;

        ctx.clearRect(0, 0, WIDTH, HEIGHT);

        ctx.lineWidth = 6; // Width of the light paths
        ctx.lineCap = 'butt';
        ctx.globalAlpha = 0.5;

        for (let i = 0; i < bufferLength - 15; i+=16) {
          const angle = (i / bufferLength) * 2 * Math.PI;
          const value = dataArray[i];
          const barLength = Math.max(4, innerRadius + value / 255 * (outerRadius - innerRadius) - innerRadius); // Bar length scales with value

          const x1 = centerX + innerRadius * Math.cos(angle);
          const y1 = centerY + innerRadius * Math.sin(angle);

          // Calculate the end points of the light paths
          const endX = centerX + (innerRadius + barLength) * Math.cos(angle);
          const endY = centerY + (innerRadius + barLength) * Math.sin(angle);
          const gradient = ctx.createLinearGradient(0, 0, WIDTH, 0);
          gradient.addColorStop(0, "magenta");
          gradient.addColorStop(0.5, "green");
          gradient.addColorStop(1.0, "yellow");

          ctx.strokeStyle = gradient;
          ctx.beginPath();
          ctx.moveTo(x1, y1); // Start at the center
          ctx.lineTo(endX, endY); // Draw a line outward
          ctx.stroke(); // Render the path
        }
      }
    }

    requestRef.current = requestAnimationFrame(draw);
  };

  useEffect(() => {
    requestRef.current = requestAnimationFrame(draw);
    return () => {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
    };
  }, [draw, analyser]);

  return (
    <div style={{ position: 'relative', width: '240px', height: '240px' }}>
      {analyser && <canvas ref={canvasRef} width="240" height="240" style={{ display: 'block' }} />}
    </div>
  );
};

export default AudioVisualizer;