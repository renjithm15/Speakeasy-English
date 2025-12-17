import { useState, useEffect } from "react";

export default function Home() {
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

    if (lang === "en-IN") {
      const indian = voices.find(v => v.lang === "en-IN");
      if (indian) u.voice = indian;
    }

    if (lang === "ml-IN") {
      const mal = voices.find(v => v.lang === "ml-IN");
      if (mal) u.voice = mal;
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

      // ALWAYS set Malayalam text
      let en = "Good try. Speak slowly and confidently.";
      let ml = "നല്ല ശ്രമമാണ്. പതുക്കെയും ആത്മവിശ്വാസത്തോടെയും സംസാരിക്കൂ.";

      if (text.split(" ").length > 4) {
        en = "Very good. Your sentence is clear.";
        ml = "വളരെ നല്ലതാണ്. നിങ്ങളുടെ വാക്യം വ്യക്തമാണ്.";
      }

      setReplyEn(en);
      setReplyMl(ml);

      // Speak English always
      speak(en, "en-IN");

      // Try Malayalam voice (if available)
      setTimeout(() => {
        speak(ml, "ml-IN");
      }, 700);
    };
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>SpeakEasy English 🇮🇳</h2>
      <p>English speaking practice with Malayalam support</p>

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
      )}
    </div>
  );
}
