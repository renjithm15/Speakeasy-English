import { useEffect, useState } from "react";
import dailyLessons from "../data/dailyLessons";
import interviewQuestions from "../data/interviewQuestions";
import officeEnglish from "../data/officeEnglish";

export default function Home() {
  const [mode, setMode] = useState("free");
  const [lessonIndex, setLessonIndex] = useState(0);
  const [interviewIndex, setInterviewIndex] = useState(0);
  const [officeIndex, setOfficeIndex] = useState(0);

  const [spoken, setSpoken] = useState("");
  const [replyEn, setReplyEn] = useState("");
  const [replyMl, setReplyMl] = useState("");

  // Progress
  const [sessions, setSessions] = useState(0);
  const [lessonsDone, setLessonsDone] = useState(0);
  const [streak, setStreak] = useState(0);

  const [voices, setVoices] = useState([]);

  /* ---------- INIT ---------- */
  useEffect(() => {
    const loadVoices = () => {
      const v = window.speechSynthesis.getVoices();
      if (v.length > 0) setVoices(v);
    };
    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;

    const saved = JSON.parse(localStorage.getItem("progress"));
    if (saved) {
      setSessions(saved.sessions || 0);
      setLessonsDone(saved.lessonsDone || 0);
      setStreak(saved.streak || 0);
    }
  }, []);

  const SpeechRecognition =
    typeof window !== "undefined" &&
    (window.SpeechRecognition || window.webkitSpeechRecognition);

  const speak = (text, lang) => {
    const u = new SpeechSynthesisUtterance(text);
    u.lang = lang;
    const matched = voices.find(v => v.lang === lang);
    if (matched) u.voice = matched;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(u);
  };

  /* ---------- SMART HUMAN TUTOR ---------- */
  const smartTutor = (text) => {
    const t = text.toLowerCase();

    if (t.includes("am having") || t.includes("is having")) {
      return {
        en: "I understand you. But in natural English, we say: I have experience. Please try again.",
        ml: "`am having` ഇവിടെ ഉപയോഗിക്കാറില്ല. `I have experience` എന്നാണ് പറയേണ്ടത്."
      };
    }

    if (t.includes("years experience") && !t.includes("of")) {
      return {
        en: "Say it this way: I have two years of experience. This sounds natural.",
        ml: "`experience` മുമ്പ് `of` വേണം."
      };
    }

    if (t.startsWith("he have") || t.startsWith("she have")) {
      return {
        en: "Small correction. With he or she, we use has. Say: He has experience.",
        ml: "`He / She` വന്നാൽ `has` ആണ് ശരി."
      };
    }

    if (t.includes("yesterday") && t.includes("go")) {
      return {
        en: "Because you said yesterday, use past tense. Say: I went yesterday.",
        ml: "`yesterday` വന്നാൽ past tense വേണം."
      };
    }

    if (t.includes("do not") || t.includes("i am") || t.includes("it is")) {
      return {
        en: "In speaking, we usually use short forms like don’t, I’m, it’s. Try using them.",
        ml: "സംസാരിക്കുമ്പോൾ short forms ആണ് നാചുറൽ: don’t, I’m, it’s."
      };
    }

    return {
      en: "That sounds okay. Now say the same sentence a little more smoothly.",
      ml: "വാക്യം ശരിയാണ്. ഇനി അല്പം നാചുറലായി പറയൂ."
    };
  };

  const updateProgress = () => {
    const newSessions = sessions + 1;
    const newLessons =
      mode !== "free" ? lessonsDone + 1 : lessonsDone;
    const newStreak = streak + 1;

    setSessions(newSessions);
    setLessonsDone(newLessons);
    setStreak(newStreak);

    localStorage.setItem(
      "progress",
      JSON.stringify({
        sessions: newSessions,
        lessonsDone: newLessons,
        streak: newStreak
      })
    );
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

      const tutor = smartTutor(text);
      setReplyEn(tutor.en);
      setReplyMl(tutor.ml);

      speak(tutor.en, "en-IN");
      setTimeout(() => speak(tutor.ml, "ml-IN"), 900);

      updateProgress();
    };
  };

  return (
    <div style={{ padding: 20, maxWidth: 500, margin: "auto" }}>
      <h2>SpeakEasy English 🇮🇳</h2>
      <p>Human-like English tutor with Malayalam support</p>

      <div style={{ marginBottom: 15 }}>
        <button onClick={() => setMode("free")}>Free</button>{" "}
        <button onClick={() => setMode("daily")}>Daily</button>{" "}
        <button onClick={() => setMode("interview")}>Interview</button>{" "}
        <button onClick={() => setMode("office")}>Office</button>
      </div>

      {mode === "daily" && <p><b>Malayalam:</b> {dailyLessons[lessonIndex].ml}</p>}
      {mode === "interview" && <p><b>Question:</b> {interviewQuestions[interviewIndex].q}</p>}
      {mode === "office" && <p><b>Malayalam:</b> {officeEnglish[officeIndex].ml}</p>}

      <button
        onClick={startListening}
        style={{ fontSize: 18, padding: 12, marginTop: 15 }}
      >
        🎤 Speak English
      </button>

      {spoken && (
        <div style={{ marginTop: 20 }}>
          <p><b>You:</b> {spoken}</p>
          <p><b>Tutor (English):</b> {replyEn}</p>
          <p><b>Tutor (Malayalam):</b> {replyMl}</p>
        </div>
      )}

      <div style={{ marginTop: 25, padding: 15, border: "1px solid #ccc" }}>
        <h3>📊 Progress</h3>
        <p>Speaking Sessions: {sessions}</p>
        <p>Lessons Completed: {lessonsDone}</p>
        <p>Practice Streak: {streak} 🔥</p>
      </div>
    </div>
  );
}
