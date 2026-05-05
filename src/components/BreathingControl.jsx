import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "./BreathingControl.css";

export default function BreathingControl() {
  const navigate = useNavigate();
  const [activePattern, setActivePattern] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [status, setStatus] = useState("");
  const [feedback, setFeedback] = useState(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  const patterns = [
    {
      id: "478",
      title: "4-7-8 Breathing",
      desc: "Inhale for 4, hold for 7, exhale for 8",
      tag: "Beginner",
      level: "beginner",
      extra: "Recommended: 4 cycles • Helps reduce stress and calm nerves",
    },
    {
      id: "box",
      title: "Box Breathing",
      desc: "Equal timing for all phases",
      tag: "Beginner",
      level: "beginner",
      extra: "Recommended: 6 cycles • Great for focus and grounding",
    },
    {
      id: "speech",
      title: "Speech Preparation",
      desc: "Breathing pattern for speech readiness",
      tag: "Advanced",
      level: "advanced",
      extra: "Recommended: 5 cycles • Boosts voice control and fluency",
    },
  ];

  const toggleRecording = async () => {
    if (isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setStatus("Analyzing...");
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
              localStorage.setItem("ex_breathing", "done");
              setFeedback(null); // no feedback message
              setStatus("Exercise Completed");
            } else {
              setStatus("Failed");
            }
          } catch (error) {
            setStatus("Backend not connected");
          }
        };

        mediaRecorderRef.current.start(250);
        setIsRecording(true);
        setStatus("Recording... Follow breathing pattern");
        setFeedback(null);
      } catch (err) {
        alert("Please allow microphone access.");
      }
    }
  };

  return (
    <div className="breathing-container">
      <button className="back-btn" onClick={() => navigate("/exercises")}>
        ← Back to Exercises
      </button>

      <h2 className="page-title">Breathing Control</h2>
      <p className="subtitle">Develop proper breathing techniques for speech</p>

      <div className="training-card">
        <h3>Breathing Control Training</h3>
        <p>Master proper breathing techniques for speech</p>
      </div>

      <div className="main-section">
        <div className="timer-card">
          <h4 className="card-title">4-7-8 Breathing</h4>
          <p className="card-subtitle">Inhale for 4, hold for 7, exhale for 8</p>

          <div className="timer-circle">
            Ready <br /> Press Start
          </div>

          <div className="timer-actions">
            <button
              className="start-btn"
              onClick={toggleRecording}
              style={{ backgroundColor: isRecording ? "#ff4d4d" : "" }}
            >
              {isRecording ? "Stop & Analyze" : "Start Exercise"}
            </button>
            <button className="reset-btn">Reset</button>
          </div>

          <div style={{ marginTop: "15px", textAlign: "center", minHeight: "40px" }}>
            <p style={{ fontStyle: "italic", color: "#666", margin: "5px 0" }}>
              {status}
            </p>
          </div>

          <div className="phase-times">
            <div>
              <strong>4s</strong>
              <br /> Inhale
            </div>
            <div>
              <strong>7s</strong>
              <br /> Hold
            </div>
            <div>
              <strong>8s</strong>
              <br /> Exhale
            </div>
          </div>
        </div>

        <div className="instructions-card">
          <h4>Breathing Technique Guide</h4>
          <ul>
            <li>Sit comfortably with your back straight</li>
            <li>Place one hand on chest, one on belly</li>
            <li>Follow the visual guide and timing</li>
            <li>Focus on belly movement, not chest</li>
          </ul>

          <h4>Benefits for Speech</h4>
          <ul>
            <li>Reduces speech anxiety and tension</li>
            <li>Improves voice support and projection</li>
            <li>Enhances speech fluency and rhythm</li>
            <li>Promotes overall relaxation</li>
          </ul>
        </div>
      </div>

      <div className="patterns-section">
        <h3>Breathing Patterns</h3>
        <p>Choose different breathing exercises based on your needs</p>

        <div className="patterns-grid">
          {patterns.map((pattern) => (
            <div
              key={pattern.id}
              className={`pattern-card ${pattern.level} ${
                activePattern === pattern.id ? "active" : ""
              }`}
              onClick={() =>
                setActivePattern(
                  activePattern === pattern.id ? null : pattern.id
                )
              }
            >
              <h4>{pattern.title}</h4>
              <p>{pattern.desc}</p>
              <span className="tag">{pattern.tag}</span>
              <div className="extra-info">{pattern.extra}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}