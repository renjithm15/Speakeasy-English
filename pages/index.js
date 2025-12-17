export default function Home() {
  const speak = () => {
    const msg = new SpeechSynthesisUtterance(
      "Hello Renjith. Welcome to SpeakEasy English."
    );
    msg.lang = "en-US";
    speechSynthesis.speak(msg);
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>SpeakEasy English</h2>
      <p>Malayalam English speaking practice app</p>

      <button onClick={speak} style={{ fontSize: 18, padding: 10 }}>
        🔊 Test Voice
      </button>
    </div>
  );
}
