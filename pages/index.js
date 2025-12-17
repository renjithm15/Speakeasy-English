import { useEffect, useState } from "react";

export default function Home() {
  const [mode, setMode] = useState("daily"); // daily | interview | office
  const [spoken, setSpoken] = useState("");
  const [aiEn, setAiEn] = useState("");
  const [aiMl, setAiMl] = useState("");
  const [voices, setVoices] = useState([]);
  const [step, setStep] = useState(0);
  const [confidence, setConfidence] = useState(50); // 0–100

  /* ---------- Load voices ---------- */
  useEffect(() => {
    const load = () => {
      const v = speechSynthesis.getVoices();
      if (v.length > 0) setVoices(v);
    };
    load();
    speechSynthesis.onvoiceschanged = load;
  }, []);

  const SpeechRecognition =
    typeof window !== "undefined" &&
    (window.SpeechRecognition || window.webkitSpeechRecognition);

  const speak = (text, lang) => {
    const u = new SpeechSynthesisUtterance(text);
    u.lang = lang;
    const voice = voices.find(v => v.lang === lang);
    if (voice) u.voice = voice;
    speechSynthesis.cancel();
    speechSynthesis.speak(u);
  };

  /* ---------- CONFIDENCE LOGIC ---------- */
  const updateConfidence = (text) => {
    let score = confidence;
    if (text.split(" ").length >= 5) score += 2;
    if (!text.toLowerCase().includes("am having")) score += 1;
    if (score > 100) score = 100;
    setConfidence(score);
  };

  /* ---------- CONVERSATION ENGINE ---------- */
  const respond = (text) => {
    const t = text.toLowerCase();

    // Soft corrections (Indian English)
    if (t.includes("am having")) {
      return {
        en: "You can say, I have experience. Where are you working now?",
        ml: "`am having` ഒഴിവാക്കി `I have`."
      };
    }

    if (t.includes("years experience") && !t.includes("of")) {
      return {
        en: "A natural way is, I have two years of experience. What is your role?",
        ml: "`experience` മുമ്പ് `of`."
      };
    }

    if (t.startsWith("he have") || t.startsWith("she have")) {
      return {
        en: "You can say, he has experience. What does he do?",
        ml: "`He / She` വന്നാൽ `has`."
      };
    }

    // Mode-based conversation
    if (mode === "interview") {
      const interviewFlow = [
        "Tell me about yourself.",
        "What are your main skills?",
        "Why should we hire you?",
        "What are your career goals?"
      ];
      return {
        en: interviewFlow[step % interviewFlow.length],
        ml: "ഇന്റർവ്യൂ ചോദ്യമാണ്."
      };
    }

    if (mode === "office") {
      const officeFlow = [
        "What are you working on today?",
        "Did you complete the task?",
        "Any issue with the deadline?",
        "Please explain your update."
      ];
      return {
        en: officeFlow[step % officeFlow.length],
        ml: "ഓഫീസ് സംഭാഷണം."
      };
    }

    // Daily talk
    const dailyFlow = [
      "Okay. What do you do daily?",
      "How was your day?",
      "What are you learning now?",
      "What is your plan for tomorrow?"
    ];

    return {
      en: dailyFlow[step % dailyFlow.length],
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

      updateConfidence(text);

      const ai = respond(text);
      setAiEn(ai.en);
      setAiMl(ai.ml);

      speak(ai.en, "en-IN");
      setTimeout(() => speak(ai.ml, "ml-IN"), 800);

      setStep(step + 1);
    };
  };

  return (
    <div style={{ padding: 20, maxWidth: 520, margin: "auto" }}>
      <h2>SpeakEasy English 🇮🇳</h2>
      <p>AI Conversation Practice</p>

      {/* Modes */}
      <div style={{ marginBottom: 10 }}>
        <button onClick={() => setMode("daily")}>Daily Talk</button>{" "}
        <button onClick={() => setMode("interview")}>Interview</button>{" "}
        <button onClick={() => setMode("office")}>Office Call</button>
      </div>

      {/* Confidence */}
      <div style={{ marginBottom: 10 }}>
        <b>Confidence:</b> {confidence}%
      </div>

      <button
        onClick={startListening}
        style={{ fontSize: 18, padding: 12 }}
      >
        🎤 Speak
      </button>

      {spoken && (
        <div style={{ marginTop: 20 }}>
          <p><b>You:</b> {spoken}</p>
          <p><b>AI:</b> {aiEn}</p>
          <p style={{ fontSize: 14 }}>{aiMl}</p>
        </div>
      )}
    </div>
  );
}
