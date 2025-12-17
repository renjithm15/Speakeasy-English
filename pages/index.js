import { useEffect, useState } from "react";
import dailyLessons from "../data/dailyLessons";
import interviewQuestions from "../data/interviewQuestions";

export default function Home() {
  const [mode, setMode] = useState("free");
  const [lessonIndex, setLessonIndex] = useState(0);
  const [interviewIndex, setInterviewIndex] = useState(0);
  const [spoken, setSpoken] = useState("");
  const [replyEn, setReplyEn] = useState("");
  const [replyMl, setReplyMl] = useState("");
  const [voices, setVoices] = useState([]);

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
    const u = new SpeechSynthesisUtterance(text);
    u.lang = lang;
    const matched = voices.find(v => v.lang === lang);
    if (matched) u.voice = matched;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(u);
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

      let en = "Good answer. Try to speak clearly.";
      let ml = "നല്ല ഉത്തരമാണ്. വ്യക്തമായി സംസാരിക്കൂ.";

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
        en = "Good answer. Add one example if possible.";
        ml = "നല്ല ഉത്തരമാണ്. ഒരു ഉദാഹരണം കൂടി ചേർക്കാം.";
      }

      setReplyEn(en);
      setReplyMl(ml);

      speak(en, "en-IN");
      setTimeout(() => speak(ml, "ml-IN"), 900);
    };
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>SpeakEasy English 🇮🇳</h2>
      <p>Malayalam supported English speaking practice</p>

      {/* Mode buttons */}
      <div style={{ marginBottom: 20 }}>
        <button onClick={() => setMode("free")}>Free Speak</button>{" "}
        <button onClick={() => setMode("daily")}>Daily Lessons</button>{" "}
        <button onClick={() => setMode("interview")}>Interview</button>
      </div>

      {/* Daily lessons */}
      {mode === "daily" && (
        <div style={{ marginBottom: 20 }}>
          <h3>Daily Lesson</h3>
          <p><b>Malayalam:</b> {dailyLessons[lessonIndex].ml}</p>
          <p><b>English:</b> {dailyLessons[lessonIndex].en}</p>
          <button
            onClick={() =>
              setLessonIndex((lessonIndex + 1) % dailyLessons.length)
            }
          >
            Next Lesson
          </button>
        </div>
      )}

      {/* Interview practice */}
      {mode === "interview" && (
        <div style={{ marginBottom: 20 }}>
          <h3>Interview Question</h3>
          <p><b>Question:</b> {interviewQuestions[interviewIndex].q}</p>
          <p><b>Hint (Malayalam):</b> {interviewQuestions[interviewIndex].hintMl}</p>
          <button
            onClick={() =>
              setInterviewIndex(
                (interviewIndex + 1) % interviewQuestions.length
              )
            }
          >
            Next Question
          </button>
        </div>
      )}

      {/* Speak */}
      <button
        onClick={startListening}
        style={{ fontSize: 18, padding: 12 }}
      >
        🎤 Speak English
      </button>

      {/* Feedback */}
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
