import { useEffect, useState } from "react";

export default function Home() {
  const [spoken, setSpoken] = useState("");
  const [aiEn, setAiEn] = useState("");
  const [aiMl, setAiMl] = useState("");
  const [voices, setVoices] = useState([]);
  const [step, setStep] = useState(0);

  /* ---------- Load voices (Android safe) ---------- */
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

  const speakEnglish = (text) => {
    const u = new SpeechSynthesisUtterance(text);
    u.lang = "en-IN";
    const voice = voices.find(v => v.lang === "en-IN");
    if (voice) u.voice = voice;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(u);
  };

  const speakMalayalam = (text) => {
    const u = new SpeechSynthesisUtterance(text);
    u.lang = "ml-IN";
    const voice = voices.find(v => v.lang === "ml-IN");
    if (voice) u.voice = voice;
    window.speechSynthesis.speak(u);
  };

  /* ---------- CORRECTION + CONVERSATION ENGINE ---------- */
  const respond = (text) => {
    const t = text.toLowerCase();

    // 🔴 Corrections (HIGH PRIORITY)
    if (t.includes("am having") || t.includes("is having")) {
      return {
        en: "You can say: I have experience. Where are you working now?",
        ml: "`am having` ഒഴിവാക്കി `I have` ഉപയോഗിക്കുക."
      };
    }

    if (t.includes("years experience") && !t.includes("of")) {
      return {
        en: "A natural way is: I have two years of experience. What is your role?",
        ml: "`experience` മുമ്പ് `of` വേണം."
      };
    }

    if (t.startsWith("he have") || t.startsWith("she have")) {
      return {
        en: "You can say: he has experience. What does he do?",
        ml: "`He / She` വന്നാൽ `has`."
      };
    }

    if (t.includes("yesterday") && t.includes("go")) {
      return {
        en: "You can say: I went yesterday. What did you do there?",
        ml: "`yesterday` വന്നാൽ past tense."
      };
    }

    // 🟢 Conversation flow (only if no correction)
    const flow = [
      "Okay. What do you do for work?",
      "That’s good. How long have you been doing this?",
      "What skills are you improving now?",
      "What is your next career goal?"
    ];

    return {
      en: flow[step % flow.length],
      ml: "തുടരൂ."
    };
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

      const ai = respond(text);
      setAiEn(ai.en);
      setAiMl(ai.ml);

      // ✅ English ALWAYS speaks
      speakEnglish(ai.en);

      // Malayalam only after delay
      if (ai.ml) {
        setTimeout(() => speakMalayalam(ai.ml), 900);
      }

      setStep(step + 1);
    };
  };

  return (
    <div style={{ padding: 20, maxWidth: 520, margin: "auto" }}>
      <h2>SpeakEasy English 🇮🇳</h2>
      <p>AI Conversation Practice</p>

      <button
        onClick={startListening}
        style={{ fontSize: 18, padding: 12 }}
      >
        🎤 Speak
      </button>

      {spoken && (
        <div style={{ marginTop: 20 }}>
          <p><b>You:</b> {spoken}</p>
          <p><b>AI (English):</b> {aiEn}</p>
          <p style={{ fontSize: 14 }}>{aiMl}</p>
        </div>
      )}
    </div>
  );
}
