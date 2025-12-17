import { useState } from "react";

export default function Home() {
  const [spoken, setSpoken] = useState("");
  const [replyEn, setReplyEn] = useState("");
  const [replyMl, setReplyMl] = useState("");

  const SpeechRecognition =
    typeof window !== "undefined" &&
    (window.SpeechRecognition || window.webkitSpeechRecognition);

  const speak = (text, lang) => {
    const u = new SpeechSynthesisUtterance(text);
    u.lang = lang;

    const voices = speechSynthesis.getVoices();
    if (lang === "en-IN") {
      const indian = voices.find(v =>
        v.lang === "en-IN" ||
        v.name.toLowerCase().includes("india") ||
        v.name.toLowerCase().includes("ravi") ||
        v.name.toLowerCase().includes("heera")
      );
      if (indian) u.voice = indian;
    }

    speechSynthesis.speak(u);
  };

  const startListening = () => {
    if (!SpeechRecognition) {
      alert("Please use Chrome browser");
      return;
    }

    const r = new SpeechRecognition();
    r.lang = "en-IN";
    r.start();

    r.onresult = (e) => {
      const text = e.results[0][0].transcript;
      setSpoken(text);

      let en = "Good try. Speak slowly and confidently.";
      let ml = "നല്ല ശ്രമമാണ്. പതുക്കെയും ആത്മവിശ്വാസത്തോടെയും സംസാരിക്കൂ.";

      if (text.split(" ").length > 4) {
        en = "Very good. Your sentence is clear.";
        ml = "വളരെ നല്ലതാണ്. നിങ്ങളുടെ വാക്യം വ്യക്തമാണ്.";
      }

      setReplyEn(en);
      setReplyMl(ml);

      speak(en, "en-IN");
      speak(ml, "ml-IN");
    };
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>SpeakEasy English 🇮🇳</h2>
      <p>English speaking practice with Malayalam help</p>

      <button
        onClick={startListening}
        style={{ fontSize: 18, padding: 12 }}
      >
        🎤 Speak English
      </button>

      {spoken && (
        <div style={{ marginTop: 20 }}>
          <p><b>You said:</b> {spoken}</p>
          <p><b>AI (English):</b> {replyEn}</p>
          <p><b>AI (Malayalam):</b> {replyMl}</p>
        </div>
