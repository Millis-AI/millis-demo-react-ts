import React, { useEffect, useState } from 'react';
import './App.css';
import Millis from '@millisai/web-sdk';
import AudioVisualizer from './AudioVisualizer';

const client = Millis.createClient({publicKey: "<YOUR_MILLIS_PUBLIC_KEY>"});

enum State {
  IDLE,
  CONNECTING,
  READY,
}

function App() {
  const [callState, setCallState] = useState(State.IDLE);
  const [transcript, setTranscript] = useState("");
  const [analyzer, setAnalyzer] = useState<AnalyserNode | null>(null);
  const [latency, setLatency] = useState(0);

  useEffect(() => {
    client.on("onopen", () => {
    });

    client.on("onready", () => {
      setCallState(State.READY);
    });

    client.on("onaudio", (audio: Uint8Array) => {
    });

    client.on("onresponsetext", (text: string) => {
      setTranscript(text);
    });

    client.on("onlatency", (latency: number) => {
      setLatency(latency);
    });

    client.on("analyzer", (analyzer: AnalyserNode) => {
      setAnalyzer(analyzer);
    });

    client.on("onclose", ({ code, reason }) => {
      setCallState(State.IDLE);
      setAnalyzer(null);
      setTranscript("");
    });

    client.on("onerror", (error) => {
      console.error("An error occurred:", error);
      setCallState(State.IDLE);
      setAnalyzer(null);
      setTranscript("");
    });

    client.on("ontranscript", (data) => {
      setTranscript(data);
    });
  }, []);

  const toggleConversation = async () => {
    if (callState === State.READY) {
      client.stop();
    } else if (callState === State.IDLE) {
      client
          .start({
            prompt: "You're a helpful assistant",
            voice: {provider: "elevenlabs", voice_id: "Rachel"},
          })
          .catch(console.error);
      setCallState(State.CONNECTING);
    }
  };

  const btnText = () => {
    switch (callState) {
      case State.READY: return "Stop Demo";
      case State.CONNECTING: return "Connecting...";
      default: return "Start Demo";
    }
  }

  return (
    <div className="App" style={{background: 'black', width: '100%', height: '100vh', color: 'white'}}>
      <div style={{position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)"}}>
        {callState === State.READY && <AudioVisualizer analyser={analyzer} />}
      </div>
      <div style={{position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)"}}>
        <button style={{ filter: "drop-shadow(0 0 25px rgba(169 252 129 / 50%))", backgroundImage: 'linear-gradient(115deg, rgb(46 46 46 / 100%), rgb(46 46 46 / 82%))', border: "1px solid rgb(255 255 255 / 24%)", fontSize: 14, width: 160, height: 160, borderRadius: "50%", cursor: "pointer"}} onClick={toggleConversation}>
          {btnText()}
        </button>
      </div>
      <div className="text-transcript" style={{position: "absolute", top: "75%", left: "50%", transform: "translate(-50%, -50%)"}}>
        {transcript}
      </div>
      <div style={{position: "absolute", bottom: "8px", left: "50%", transform: "translate(-50%, 0%)"}}>
        <div style={{display:"flex", flexDirection:"row", justifyContent: "center", gap: "8px", marginTop: "16px", fontSize: 14}}>
          <span className="text-grey">Latency: </span>
          <span>{latency}ms</span>
        </div>
      </div>
    </div>
  );
}

export default App;