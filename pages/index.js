export default function Home() {

  const speakIndianEnglish = () => {
    const text = "Hello Renjith. Welcome to SpeakEasy English.";

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "en-IN"; // 🇮🇳 Indian English

    const voices = speechSynthesis.getVoices();

    // Try to find Indian English voice
    const indianVoice = voices.find(
      v =>
        v.lang === "en-IN" ||
        v.name.toLowerCase().includes("india") ||
        v.name.toLowerCase().includes("ravi") ||
        v.name.toLowerCase().includes("heera")
    );

    if (indianVoice) {
      utterance.voice = indianVoice;
    }

    speechSynthesis.speak(utterance);
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>SpeakEasy English 🇮🇳</h2>
      <p>Indian English speaking practice app</p>

      <button
        onClick={speakIndianEnglish}
        style={{ fontSize: 18, padding: 12 }}
      >
        🔊 Indian English Voice
      </button>
    </div>
  );
}
