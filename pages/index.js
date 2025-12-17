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

  const [sessions, setSessions] = useState(0);
  const [lessonsDone, setLessonsDone] = useState(0);
  const [streak, setStreak] = useState(0);

  const [voices, setVoices] = useState([]);

  /* -------------------- INIT -------------------- */
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

  /* ---------------- SMART TUTOR LOGIC ---------------- */

  const smartTutor = (text) => {
    const lower = text.toLowerCase();

    // ❌ am having / is having
    if (lower.includes("am having") || lower.includes("is having")) {
      return {
        en: "This sentence is not correct. Say: I have experience.",
        ml: "`am having` ഇംഗ്ലീഷിൽ ഇവിടെ ഉപയോഗിക്കരുത്. `I have experience` എന്ന് പറയണം."
      };
    }

    // ❌ experience count
    if (lower.includes("two years experience")) {
      return {
        en: "Say: I have two years of experience.",
        ml: "`experience` മുൻപിൽ `of` വേണം."
      };
    }

    // ❌ he/she misuse
    if (lower.startsWith("he have") || lower.startsWith("she have")) {
      return {
        en: "Use has. Say: He has experience.",
        ml: "`He / She` ഉപയോഗിക്കുമ്പോൾ `has` ആണ് ശരി."
      };
    }

    // ❌ tense issue
    if (lower.includes("yesterday") && lower.includes("go")) {
      return {
        en: "Use past tense. Say: I went yesterday.",
        ml: "`yesterday` വന്നാൽ past tense വേണം."
      };
    }

    // ✅ Default positive tutor
    return {
      en: "Good sentence. Now try to speak a little more confidently.",
      ml: "വാക്യം ശരിയാണ്. ഇനി ആത്മവിശ്വാസത്തോടെ പറയൂ."
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
    <div style={{ padding: 20 }}>
      <h2>SpeakEasy English 🇮🇳</h2>
      <p>Smart English Tutor with Malayalam Support</p>

      <div style={{ marginBottom: 15 }}>
        <button onClick={() => setMode("free")}>Free</button>{" "}
        <button onClick={() => setMode("daily")}>Daily</button>{" "}
        <button onClick={() => setMode("interview")}>Interview</button>{" "}
        <button onClick={() => setMode("office")}>Office</button>
      </div>

      {mode === "daily" && (
        <p><b>Malayalam:</b> {dailyLessons[lessonIndex].ml}</p>
      )}
      {mode === "interview" && (
        <p><b>Question:</b> {interviewQuestions[interviewIndex].q}</p>
      )}
      {mode === "office" && (
        <p><b>Malayalam:</b> {officeEnglish[officeIndex].ml}</p>
      )}

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
        <p>Sessions: {sessions}</p>
        <p>Lessons Done: {lessonsDone}</p>
        <p>Streak: {streak} 🔥</p>
      </div>
    </div>
  );
}
