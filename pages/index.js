import { useState } from "react";

export default function Home() {
  const [spoken, setSpoken] = useState("");
  const [reply, setReply] = useState("");

  const SpeechRecognition =
    typeof window !== "undefined" &&
    (window.SpeechRecognition || window.webkitSpeechRecognition);

  const speakIndian = (text) => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "en-IN";

    const voices = speechSynthesis.getVoices();
    const indianVoice = voices.find(v =>
      v.lang === "en-IN" ||
      v.name.toLowerCase().includes("india") ||
      v.name.toLowerCase().includes("ravi") ||
      v.name.toLowerCase().includes("heera")
    );

    if (indianVoice) utterance.voice = indianVoice;
    speechSynthesis.speak(utterance);
  };

  const startListening = () => {
    if (!SpeechRecognition) {
      alert("Please use Chrome browser");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "en-IN";
    recognition.start();

    recognition.onresult = (event) => {
      const text = event.results[0][0].transcript;
      setSpoken(text);

      let response = "Good try. Speak slowly and confidently.";
      if (text.split(" ").length > 4) {
        response = "Very good. Your sentence is clear.";
      }

      setReply(response);
      speakIndian(response);
    };
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>SpeakEasy English 🇮🇳</h2>
      <p>Speak in English. I will help you.</p>

      <button
        onClick={startListening}
        style={{ fontSize: 18, padding: 12 }}
      >
        🎤 Start Speaking
      </button>

      {spoken && (
        <div style={{ marginTop: 20 }}>
          <p><b>You said:</b> {spoken}</p>
          <p><b>AI:</b> {reply}</p>
        </div>
      )}
    </div>
  );
}
