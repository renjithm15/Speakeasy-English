import { useEffect, useState } from "react";

export default function Home() {
  const [spoken, setSpoken] = useState("");
  const [replyEn, setReplyEn] = useState("");
  const [replyMl, setReplyMl] = useState("");
  const [voices, setVoices] = useState([]);

  // ✅ Load voices correctly (Android safe)
  useEffect(() => {
    const load = () => {
      const v = window.speechSynthesis.getVoices();
      if (v.length > 0) setVoices(v);
    };
    load();
    window.speechSynthesis.onvoiceschanged = load;
  }, []);

  const SpeechRecognition =
    typeof window !== "undefined" &&
    (window.SpeechRecognition || window.webkitSpeechRecognition);

  const speak = (text, lang) => {
    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = lang;

    // ✅ Explicit voice binding
    const matched = voices.find(v => v.lang === lang);
    if (matched) utter.voice = matched;

    window.speechSynthesis.cancel(); // IMPORTANT on Android
    window.speechSynthesis.speak(utter);
  };

  const startListening = () => {
    if (!SpeechRecognition) {
      alert("Please use Chrome browser");
      return;
    }

    const recog = new SpeechRecognition();
    recog.lang = "en-IN";
    recog.start();

    recog.onresult = e => {
      const text = e.results[0][0].transcript;
      setSpoken(text);

      let en = "Good try. Speak slowly.";
      let ml = "നല്ല ശ്രമമാണ്. പതുക്കെ സംസാരിക്കൂ.";

      if (text.split(" ").length > 4) {
        en = "Very good. Your sentence is clear.";
        ml = "വളരെ നല്ലതാണ്. നിങ്ങളുടെ വാക്യം വ്യക്തമാണ്.";
      }

      setReplyEn(en);
      setReplyMl(ml);

      // ✅ English first
      speak(en, "en-IN");

      // ✅ Malayalam after short delay
      setTimeout(() => {
        speak(ml, "ml-IN");
      }, 900);
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
