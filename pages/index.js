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

  // 🔥 Progress tracking
  const [sessions, setSessions] = useState(0);
  const [lessonsDone, setLessonsDone] = useState(0);
  const [streak, setStreak] = useState(0);

  const [voices, setVoices] = useState([]);

  // Load voices + progress (Android safe)
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

  const updateProgress = () => {
    const newSessions = sessions + 1;
    const newLessons =
      mode === "daily" || mode === "interview" || mode === "office"
        ? lessonsDone + 1
        : lessonsDone;
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

      let en = "Good try. Speak clearly.";
      let ml = "നല്ല ശ്രമമാണ്. വ്യക്തമായി സംസാരിക്കൂ.";

      if (mode === "daily") {
        const expected = dailyLessons[lessonIndex].en.toLowerCase();
        if (text.toLowerCase().includes(expected)) {
          en = "Excellent! Correct sentence.";
          ml = "വളരെ നല്ലത്! ശരിയായ വാക്യം.";
        } else {
          en = "Almost correct. Try again.";
          ml = "ശരിയാകാൻ അടുത്തിരിക്കുന്നു. വീണ്ടും ശ്രമിക്കൂ.";
        }
      }

      if (mode === "interview") {
        en = "Good interview answer. Add one example.";
        ml = "നല്ല ഇന്റർവ്യൂ ഉത്തരമാണ്. ഒരു ഉദാഹരണം ചേർക്കൂ.";
      }

      if (mode === "office") {
        const expected = officeEnglish[officeIndex].en.toLowerCase();
        if (text.toLowerCase().includes(expected)) {
          en = "Well done. Professional English.";
          ml = "വളരെ നല്ലത്. ഇത് പ്രൊഫഷണൽ ഇംഗ്ലീഷാണ്.";
        } else {
          en = "Good attempt. Try exact sentence.";
          ml = "നല്ല ശ്രമമാണ്. കൃത്യമായ വാക്യം ശ്രമിക്കൂ.";
        }
      }

      setReplyEn(en);
      setReplyMl(ml);

      speak(en, "en-IN");
      setTimeout(() => speak(ml, "ml-IN"), 900);

      updateProgress();
    };
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>SpeakEasy English 🇮🇳</h2>
      <p>Malayalam supported English speaking for career growth</p>

      {/* Modes */}
      <div style={{ marginBottom: 15 }}>
        <button onClick={() => setMode("free")}>Free</button>{" "}
        <button onClick={() => setMode("daily")}>Daily</button>{" "}
        <button onClick={() => setMode("interview")}>Interview</button>{" "}
        <button onClick={() => setMode("office")}>Office</button>
      </div>

      {/* Content */}
      {mode === "daily" && (
        <div>
          <p><b>Malayalam:</b> {dailyLessons[lessonIndex].ml}</p>
          <p><b>English:</b> {dailyLessons[lessonIndex].en}</p>
          <button onClick={() => setLessonIndex((lessonIndex + 1) % dailyLessons.length)}>
            Next
          </button>
        </div>
      )}

      {mode === "interview" && (
        <div>
          <p><b>Question:</b> {interviewQuestions[interviewIndex].q}</p>
          <p><b>Hint:</b> {interviewQuestions[interviewIndex].hintMl}</p>
          <button onClick={() => setInterviewIndex((interviewIndex + 1) % interviewQuestions.length)}>
            Next
          </button>
        </div>
      )}

      {mode === "office" && (
        <div>
          <p><b>Malayalam:</b> {officeEnglish[officeIndex].ml}</p>
          <p><b>English:</b> {officeEnglish[officeIndex].en}</p>
          <button onClick={() => setOfficeIndex((officeIndex + 1) % officeEnglish.length)}>
            Next
          </button>
        </div>
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
          <p><b>AI (English):</b> {replyEn}</p>
          <p><b>AI (Malayalam):</b> {replyMl}</p>
        </div>
      )}

      {/* Progress */}
      <div style={{ marginTop: 25, padding: 15, border: "1px solid #ccc" }}>
        <h3>📊 Your Progress</h3>
        <p>Speaking Sessions: {sessions}</p>
        <p>Lessons Completed: {lessonsDone}</p>
        <p>Practice Streak: {streak} 🔥</p>
      </div>
    </div>
  );
}
{/* Certificate */}
{sessions >= 50 && lessonsDone >= 20 && (
  <div style={{ marginTop: 30, padding: 20, border: "2px solid #000" }}>
    <h2>🎓 Certificate of Completion</h2>
    <p>This certifies that</p>
    <h3 style={{ margin: "10px 0" }}>Renjith</h3>
    <p>
      has successfully completed the <b>Career English Speaking Course</b>
      <br />
      with Malayalam support.
    </p>
    <p>Date: {new Date().toLocaleDateString()}</p>

    <button
      onClick={() => window.print()}
      style={{ marginTop: 15, padding: 10, fontSize: 16 }}
    >
      🧾 Download / Print Certificate
    </button>
  </div>
)}

