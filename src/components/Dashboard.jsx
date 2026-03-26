import React, { useState, useRef } from "react";
import "./Dashboard.css";
import Sidebar from "./Sidebar";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const navigate = useNavigate();
  const [isRecording, setIsRecording] = useState(false);
  const [status, setStatus] = useState("Inactive");
  const [stutterResult, setStutterResult] = useState(null);
  const [emotionResult, setEmotionResult] = useState(null); // <-- 1. Added Emotion State
  
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  const toggleRecording = async () => {
    if (isRecording) {
      // STOP RECORDING
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setStatus("Analyzing AI Model...");
    } else {
      // START RECORDING
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
          formData.append("file", audioBlob, "live_session.wav");

          // THIS IS THE CONNECTION TO THE BACKEND
          try {
            const response = await fetch("http://127.0.0.1:8000/analyze-audio",{
              method: "POST",
              body: formData,
            });
            const data = await response.json();
            
            if(data.status === "success") {
              setStutterResult(data.prediction);
              setEmotionResult(data.emotion); // <-- 2. Catch Emotion Data
              setStatus("Analysis Complete");
            } else {
              setStutterResult("Error reading audio");
              setEmotionResult("Error");
              setStatus("Failed");
            }
          } catch (error) {
            console.error("Backend connection error:", error);
            setStutterResult("Backend Offline");
            setEmotionResult("Offline");
            setStatus("Connection Error");
          }
        };

        mediaRecorderRef.current.start(250);
        setIsRecording(true);
        setStatus("Recording Voice...");
        setStutterResult(null); 
        setEmotionResult(null); // <-- 3. Clear old data on new recording
        
      } catch (err) {
        alert("Please allow microphone access.");
      }
    }
  };

  // Helper function to color-code emotions
  const getEmotionColor = (emotion) => {
    if (!emotion) return "#7f8c8d";
    if (emotion === "Happy" || emotion === "Neutral") return "#2ecc71"; // Green
    if (emotion === "Angry" || emotion === "Sad") return "#e67e22"; // Orange
    return "#3498db"; // Blue default
  };

  return (
    <div className="dashboard-container">
      <Sidebar onNavigate={navigate} />
      <div className="dashboard">
        <div className="header">
          <h1>Live Session</h1>
          <p>Welcome back! Here’s your speech therapy progress.</p>
        </div>

        <div className="session-controls">
          <div className="left">
            <h2>Session Controls</h2>
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: isRecording ? "100%" : "0%", transition: "width 2s" }}></div>
            </div>
            <span className="audio-level">Audio Level: {isRecording ? "Active" : "0%"}</span>
          </div>
          <div className="right">
            <span className="status">{status}</span>
            <button 
              className="start-btn" 
              onClick={toggleRecording}
              style={{ backgroundColor: isRecording ? "#ff4d4d" : "" }}
            >
              {isRecording ? "Stop & Analyze" : "Start Session"}
            </button>
          </div>
        </div>

        <div className="big-cards">
          <div className="big-card">
            <h3>Real-time Stuttering Detection</h3>
            <p className="small-text">AI-powered analysis of speech disfluencies</p>
            <p className={isRecording ? "active-text" : "inactive"}>{status}</p>
            <div className="placeholder" style={{ fontSize: "1.2rem", fontWeight: "bold", color: stutterResult === "Stuttering Detected" ? "#ff4d4d" : "#2ecc71" }}>
              {stutterResult ? `AI Result: ${stutterResult}` : "Keep speaking to see real-time analysis"}
            </div>
          </div>
          <div className="big-card">
            <h3>Emotion Analysis</h3>
            <p className="small-text">Real-time emotional state detection</p>
            <p className={isRecording ? "active-text" : "inactive"}>{status}</p>
            
            {/* 4. Display Emotion Data Dynamically */}
            <div className="placeholder" style={{ fontSize: "1.2rem", fontWeight: "bold", color: getEmotionColor(emotionResult) }}>
              {emotionResult ? `Detected Emotion: ${emotionResult}` : "Keep speaking to see real-time analysis"}
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;