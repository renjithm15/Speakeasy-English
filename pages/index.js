import { useEffect, useState } from "react";

export default function Home() {
  const [spoken, setSpoken] = useState("");
  const [aiEn, setAiEn] = useState("");
  const [aiMl, setAiMl] = useState("");
  const [voices, setVoices] = useState([]);
  const [step, setStep] = useState(0);

  /* ---------- Load voices ---------- */
  useEffect(() => {
    const load = () => {
      const v = window.speechSynthesis.getVoices();
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

  /* ---------- GUIDED CONVERSATION ENGINE ---------- */
  const aiConversation = (text) => {
    const t = text.toLowerCase();

    // Soft corrections (Indian English)
    if (t.includes("am having") || t.includes("is having")) {
      return {
        en: "You can say, I have experience. What kind of work do you do?",
        ml: "`am having` ഒഴിവാക്കി `I have` ഉപയോഗിക്കുക."
      };
    }

    if (t.includes("years experience") && !t.includes("of")) {
      return {
        en: "A natural way is, I have two years of experience. Where are you working now?",
        ml: "`experience` മുമ്പ് `of` വരണം."
      };
    }

    if (t.startsWith("he have") || t.startsWith("she have")) {
      return {
        en: "You can say, he has experience. What does he do?",
        ml: "`He / She` വന്നാൽ `has`."
      };
    }

    if (t.includes("joined company")) {
      return {
        en: "You can say, I joined a company. Is it a private company or a startup?",
        ml: "`company` മുമ്പ് `a` വേണം."
      };
    }

    // Conversation flow (no correction needed)
    const flows = [
      "Okay. Can you tell me about your job?",
      "That’s good. What do you do daily at work?",
      "Nice. How long have you been doing this work?",
      "Understood. Do you like this job?",
      "Good. What are you planning next in your career?"
    ];

    return {
      en: flows[step % flows.length],
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

      const ai = aiConversation(text);
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

      <button
        onClick={startListening}
        style={{ fontSize: 18, padding: 12, marginTop: 15 }}
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
