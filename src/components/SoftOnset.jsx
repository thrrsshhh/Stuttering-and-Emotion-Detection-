import React, { useState, useRef } from "react";
import { Link } from "react-router-dom";
import "./SoftOnset.css";

function SoftOnset() {
  const practiceWords = [
    { word: "Apple", phonetic: "/ˈæpəl/", hint: "Start with a gentle 'ah' sound" },
    { word: "Ocean", phonetic: "/ˈoʊʃən/", hint: "Begin softly with 'oh'" },
    { word: "Eagle", phonetic: "/ˈiːɡəl/", hint: "Ease into the 'ee' sound" },
    { word: "Island", phonetic: "/ˈaɪlənd/", hint: "Start smoothly with 'eye'" },
    { word: "Under", phonetic: "/ˈʌndər/", hint: "Use gentle 'uh' to start" },
    { word: "Orange", phonetic: "/ˈɔːrɪndʒ/", hint: "Start with soft 'or'" },
    { word: "Elephant", phonetic: "/ˈɛlɪfənt/", hint: "Begin softly with 'el'" },
    { word: "Umbrella", phonetic: "/ʌmˈbrɛlə/", hint: "Start gently with 'um'" }
  ];

  const [currentIndex, setCurrentIndex] = useState(0);
  const currentWord = practiceWords[currentIndex];

  // --- AI STATE ---
  const [isRecording, setIsRecording] = useState(false);
  const [status, setStatus] = useState("");
  const [feedback, setFeedback] = useState(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  const handleNext = () => {
    if (currentIndex < practiceWords.length - 1) setCurrentIndex(currentIndex + 1);
    setFeedback(null);
  };

  const handlePrevious = () => {
    if (currentIndex > 0) setCurrentIndex(currentIndex - 1);
    setFeedback(null);
  };

  // --- RECORDING LOGIC ---
  const toggleRecording = async () => {
    if (isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setStatus("Analyzing your vocal onset...");
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
              localStorage.setItem("ex_softonset", "done");

              if (data.prediction === "Fluent") {
                setFeedback({
                  message: `Perfect soft onset! Emotion: ${data.emotion}`,
                  color: "green",
                });
              } else {
                setFeedback({
                  message: `Hard block detected. Try adding more breath before the vowel. Emotion: ${data.emotion}`,
                  color: "red",
                });
              }
              setStatus("Complete");
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
        setStatus(`Listening... Say "${currentWord.word}"`);
        setFeedback(null);
      } catch (err) {
        alert("Please allow microphone access.");
      }
    }
  };

  return (
    <div className="soft-container">
      <div className="soft-main">
        <div className="header">
          <h2>Exercises</h2>
          <p>Welcome back! Here’s your speech therapy progress.</p>
        </div>

        <div className="soft-top">
          <Link to="/exercises">
            <button className="back-btn">⬅ Back to Exercises</button>
          </Link>
          <div className="exercise-header">
            <h3>Soft Onset</h3>
            <span className="level">Beginner</span>
          </div>
          <p className="desc">
            Practice gentle speech initiation to reduce hard attacks
          </p>
        </div>

        <div className="session-progress">
          <h4>Session Progress</h4>
          <p>Word {currentIndex + 1} of {practiceWords.length}</p>
        </div>

        <div className="practice-section">
          <div className="practice-word">
            <h1>{currentWord.word}</h1>
            <p className="phonetic">{currentWord.phonetic}</p>
            <p className="hint">{currentWord.hint}</p>

            <div className="buttons">
              <button
                className="record-btn"
                onClick={toggleRecording}
                style={{ backgroundColor: isRecording ? "#ff4d4d" : "", color: "white" }}
              >
                {isRecording ? "⬛ Stop & Check" : "🎤 Record"}
              </button>
            </div>

            <div style={{ marginTop: "10px", minHeight: "40px", textAlign: "center" }}>
              <p style={{ fontStyle: "italic", color: "#666", margin: "5px 0" }}>
                {status}
              </p>
              {feedback && (
                <p style={{ color: feedback.color, fontWeight: "bold", margin: "5px 0" }}>
                  {feedback.message}
                </p>
              )}
            </div>

            <div className="nav-buttons">
              <button onClick={handlePrevious} disabled={currentIndex === 0}>
                Previous
              </button>
              <button onClick={handleNext} disabled={currentIndex === practiceWords.length - 1}>
                Next
              </button>
            </div>
          </div>

          <div className="instructions">
            <h4>Exercise Instructions</h4>
            <ul>
              <li>Listen to the example pronunciation</li>
              <li>Take a gentle breath before speaking</li>
              <li>Begin the word with a soft, gentle sound</li>
              <li>Record yourself and receive AI feedback</li>
            </ul>

            <h4>Tips for Success:</h4>
            <ul>
              <li>Avoid hard glottal stops at the beginning</li>
              <li>Start with airflow before voicing</li>
              <li>Practice in front of a mirror</li>
              <li>Focus on relaxed throat muscles</li>
            </ul>
          </div>
        </div>

        <div className="practice-words">
          {practiceWords.map((item, index) => (
            <button
              key={index}
              onClick={() => {
                setCurrentIndex(index);
                setFeedback(null);
              }}
              className={index === currentIndex ? "active" : ""}
            >
              {item.word}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default SoftOnset;