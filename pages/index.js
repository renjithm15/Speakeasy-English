import { useEffect, useState } from "react";
import dailyLessons from "../data/dailyLessons";
import interviewQuestions from "../data/interviewQuestions";
import officeEnglish from "../data/officeEnglish";

export default function Home() {
  const [mode, setMode] = useState("free");
  const [spoken, setSpoken] = useState("");
  const [aiEn, setAiEn] = useState("");
  const [aiMl, setAiMl] = useState("");
  const [voices, setVoices] = useState([]);

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

  /* ---------- APP-LIKE AI TUTOR ---------- */
  const aiTutor = (text) => {
    const t = text.toLowerCase();

    // Pattern-based corrections (Indian English focused)
    if (t.includes("am having") || t.includes("is having")) {
      return {
        en: "You can say: I have experience.",
        ml: "ഇവിടെ `I have experience` എന്നാണ് നാചുറൽ."
      };
    }

    if (t.includes("years experience") && !t.includes("of")) {
      return {
        en: "A natural way is: I have two years of experience.",
        ml: "`experience` മുമ്പ് `of` വരണം."
      };
    }

    if (t.startsWith("he have") || t.startsWith("she have")) {
      return {
        en: "Try saying: He has experience.",
        ml: "`He / She` വന്നാൽ `has` ആണ്."
      };
    }

    if (t.includes("yesterday") && t.includes("go")) {
      return {
        en: "You can say: I went yesterday.",
        ml: "`yesterday` വന്നാൽ past tense."
      };
    }

    if (t.includes("joined company")) {
      return {
        en: "A better way is: I joined a company.",
        ml: "`company` മുമ്പ് `a` വരണം."
      };
    }

    // If sentence is okay → still give polished Indian English
    return {
      en: "You can also say it like this: " + polishEnglish(text),
      ml: "ഇത് കൂടുതൽ നാചുറൽ ആയി പറഞ്ഞതാണ്."
    };
  };

  // Simple polishing (keeps meaning, improves flow)
  const polishEnglish = (text) => {
    return text
      .replace("I am", "I’m")
      .replace("do not", "don’t")
      .replace("it is", "it’s");
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

      const ai = aiTutor(text);
      setAiEn(ai.en);
      setAiMl(ai.ml);

      speak(ai.en, "en-IN");
      setTimeout(() => speak(ai.ml, "ml-IN"), 800);
    };
  };

  return (
    <div style={{ padding: 20, maxWidth: 520, margin: "auto" }}>
      <h2>SpeakEasy English 🇮🇳</h2>
      <p>AI English Tutor (App-style)</p>

      <div style={{ marginBottom: 15 }}>
        <button onClick={() => setMode("free")}>Free</button>{" "}
        <button onClick={() => setMode("daily")}>Daily</button>{" "}
        <button onClick={() => setMode("interview")}>Interview</button>{" "}
        <button onClick={() => setMode("office")}>Office</button>
      </div>

      {mode === "daily" && <p><b>Malayalam:</b> {dailyLessons[0].ml}</p>}
      {mode === "interview" && <p><b>Question:</b> {interviewQuestions[0].q}</p>}
      {mode === "office" && <p><b>Malayalam:</b> {officeEnglish[0].ml}</p>}

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
