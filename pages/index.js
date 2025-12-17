import { useState, useEffect } from "react";

export default function Home() {
  const [mode, setMode] = useState("free");
  const [spoken, setSpoken] = useState("");
  const [replyEn, setReplyEn] = useState("");
  const [replyMl, setReplyMl] = useState("");
  const [voices, setVoices] = useState([]);

  useEffect(() => {
    const loadVoices = () => {
      const v = speechSynthesis.getVoices();
      if (v.length > 0) setVoices(v);
    };
    loadVoices();
    speechSynthesis.onvoiceschanged = loadVoices;
  }, []);

  const SpeechRecognition =
    typeof window !== "undefined" &&
    (window.SpeechRecognition || window.webkitSpeechRecognition);

  const speak = (text, lang) => {
    const u = new SpeechSynthesisUtterance(text);
    u.lang = lang;
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

      let en = "Good try. Speak slowly.";
      let ml = "നല്ല ശ്രമമാണ്. പതുക്കെ സംസാരിക്കൂ.";

      setReplyEn(en);
      setReplyMl(ml);

      speak(en, "en-IN");
    };
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>SpeakEasy English 🇮🇳</h2>
      <p>Malayalam supported English speaking app</p>

      {/* MODE BUTTONS */}
      <div style={{ marginBottom: 20 }}>
        <button onClick={() => setMode("free")}>Free Speak</button>{" "}
        <button onClick={() => setMode("daily")}>Daily</button>{" "}
        <button onClick={() => setMode("interview")}>Interview</button>{" "}
        <button onClick={() => setMode("office")}>Office</button>
      </div>

      {/* MODE TITLE */}
      <h3>
        {mode === "free" && "Free Speaking Practice"}
        {mode === "daily" && "Daily Lessons"}
        {mode === "interview" && "Interview Practice"}
        {mode === "office" && "Office English"}
      </h3>

      {/* FREE MODE */}
      {mode === "free" && (
        <button
          onClick={startListening}
          style={{ fontSize: 18, padding: 12 }}
        >
          🎤 Speak English
        </button>
      )}

      {spoken && (
        <div style={{ marginTop: 20 }}>
          <p><b>You said:</b> {spoken}</p>
          <p><b>AI (English):</b> {replyEn}</p>
          <p><b>AI (Malayalam):</b> {replyMl}</p>
        </div>
      )}
    </div>
  );
}
