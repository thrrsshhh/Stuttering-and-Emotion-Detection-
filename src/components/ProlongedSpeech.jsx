import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "./ProlongedSpeech.css";

export default function ProlongedSpeech() {
  const navigate = useNavigate();
  const [index, setIndex] = useState(0);

  const [isRecording, setIsRecording] = useState(false);
  const [status, setStatus] = useState("");
  const [feedback, setFeedback] = useState(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  const phrases = [
    { text: "I am speaking slowly", difficulty: "Easy" },
    { text: "The ocean waves are beautiful", difficulty: "Medium" },
    { text: "Every morning I enjoy coffee", difficulty: "Medium" },
    { text: "Understanding takes time and patience", difficulty: "Hard" },
  ];

  const nextPhrase = () => {
    if (index < phrases.length - 1) setIndex(index + 1);
    setFeedback(null);
  };

  const prevPhrase = () => {
    if (index > 0) setIndex(index - 1);
    setFeedback(null);
  };

  const toggleRecording = async () => {
    if (isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setStatus("AI is analyzing your speech...");
    } else {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaRecorderRef.current = new MediaRecorder(stream);
        audioChunksRef.current = [];

        mediaRecorderRef.current.ondataavailable = (event) => {
          if (event.data.size > 0) audioChunksRef.current.push(event.data);
        };

        mediaRecorderRef.current.onstop = async () => {
          const audioBlob = new Blob(audioChunksRef.current, { type: "audio/wav" });
          const formData = new FormData();
          formData.append("file", audioBlob, "exercise.wav");

          try {
            const response = await fetch("http://127.0.0.1:8000/analyze-audio", {
              method: "POST",
              body: formData,
            });
            const data = await response.json();

            if (data.status === "success") {
              localStorage.setItem("ex_prolonged", "done");
              window.dispatchEvent(new Event("exerciseCompleted"));
              if (data.prediction === "Fluent") {
                setFeedback({
                  message: `Excellent! Fluency maintained. Detected Emotion: ${data.emotion}`,
                  color: "green",
                });
              } else {
                setFeedback({
                  message: `Block detected. Try stretching the vowels more. Emotion: ${data.emotion}`,
                  color: "red",
                });
              }
              setStatus("Exercise Complete");
            } else {
              setFeedback({ message: "Error analyzing audio.", color: "red" });
              setStatus("Failed");
            }
          } catch (error) {
            setFeedback({
              message: "Backend Offline. Please check terminal.",
              color: "red",
            });
            setStatus("Connection Error");
          }
        };

        mediaRecorderRef.current.start(250);
        setIsRecording(true);
        setStatus("Listening... Read the phrase aloud!");
        setFeedback(null);
      } catch (err) {
        alert("Please allow microphone access.");
      }
    }
  };

  return (
    <div className="prolonged-container">
      <button className="back-btn" onClick={() => navigate("/exercises")}>
        ← Back to Exercises
      </button>

      <h2>Prolonged Speech</h2>
      <p>Extend vowel sounds to improve speech fluency</p>

      <div className="prolonged-main">
        <div className="current-phrase">
          <div className="exercise-header">
            <span className="level">{phrases[index].difficulty}</span>
          </div>
          <h3>"{phrases[index].text}"</h3>
          <p className="desc">Extend vowels: "I aaam speeaaaking slooowly"</p>

          <div className="speech-rate">
            <span>Very Slow</span>
            <input type="range" min="0" max="100" defaultValue="50" readOnly />
            <span>Normal</span>
          </div>

          <button
            className="record-btn"
            onClick={toggleRecording}
            style={{ backgroundColor: isRecording ? "#ff4d4d" : "" }}
          >
            {isRecording ? "Stop Recording" : "Start Recording"}
          </button>

          <div style={{ marginTop: "15px", minHeight: "40px" }}>
            <p style={{ fontStyle: "italic", color: "#666", margin: "5px 0" }}>
              {status}
            </p>
            {feedback && (
              <p style={{ color: feedback.color, fontWeight: "bold", margin: "5px 0" }}>
                {feedback.message}
              </p>
            )}
          </div>

          <div className="phrase-nav">
            <button disabled={index === 0} onClick={prevPhrase}>
              Previous
            </button>
            <button disabled={index === phrases.length - 1} onClick={nextPhrase}>
              Next
            </button>
          </div>
        </div>

        <div className="tips">
          <h4>Prolonged Speech Technique</h4>
          <ul>
            <li>Extend vowel sounds naturally</li>
            <li>Maintain consistent slow pace</li>
            <li>Keep normal volume and pitch</li>
            <li>Gradually increase to normal rate</li>
          </ul>
        </div>
      </div>

      <div className="practice-phrases">
        {phrases.map((p, i) => (
          <button
            key={i}
            className={i === index ? "active" : ""}
            onClick={() => {
              setIndex(i);
              setFeedback(null);
            }}
          >
            "{p.text}"
          </button>
        ))}
      </div>
    </div>
  );
}