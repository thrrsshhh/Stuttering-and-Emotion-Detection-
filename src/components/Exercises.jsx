import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom"; // 1. Import useNavigate
import "./Exercises.css";

const Exercises = () => {
  const navigate = useNavigate(); // 2. Initialize navigate
  const [summary, setSummary] = useState({
    completed: 0,
    total: 3,
    time: "0 mins",
    streak: 0,
    percent: 0,
  });

  const [exercises, setExercises] = useState([
    {
      id: "breathing",
      title: "Breathing Control",
      level: "Beginner",
      done: "0/1 Sessions",
      progress: 0,
      path: "/breathing-control",
    },
    {
      id: "softonset",
      title: "Soft Onset Practice",
      level: "Intermediate",
      done: "0/1 Sessions",
      progress: 0,
      path: "/soft-onset",
    },
    {
      id: "prolonged",
      title: "Prolonged Speech",
      level: "Advanced",
      done: "0/1 Sessions",
      progress: 0,
      path: "/prolonged-speech",
    },
  ]);

  useEffect(() => {
    const bDone = localStorage.getItem("ex_breathing") === "done";
    const sDone = localStorage.getItem("ex_softonset") === "done";
    const pDone = localStorage.getItem("ex_prolonged") === "done";

    const statusMap = {
      breathing: bDone,
      softonset: sDone,
      prolonged: pDone,
    };

    const updatedExercises = exercises.map((ex) => {
      if (statusMap[ex.id]) {
        return { ...ex, done: "1/1 Sessions", progress: 100 };
      }
      return ex;
    });

    const completedCount = [bDone, sDone, pDone].filter(Boolean).length;
    const totalExercises = 3;
    const percentage = Math.round((completedCount / totalExercises) * 100);

    setExercises(updatedExercises);
    setSummary({
      completed: completedCount,
      total: totalExercises,
      time: completedCount > 0 ? `${completedCount * 5} mins` : "0 mins",
      streak: completedCount > 0 ? 1 : 0,
      percent: percentage,
    });
  }, []);

  return (
    <main className="exercises-container">
      <header>
        {/* 3. Add the Back Button here */}
        <button 
          className="back-btn" 
          onClick={() => navigate("/")} 
          style={{ 
            background: "none", 
            border: "none", 
            color: "#3498db", 
            cursor: "pointer", 
            fontSize: "1rem",
            marginBottom: "10px",
            display: "flex",
            alignItems: "center"
          }}
        >
          ⬅ Back to Dashboard
        </button>
        
        <h1 className="title">Exercises</h1>
        <p className="subtitle">
          Welcome back! Here’s your speech therapy progress.
        </p>
      </header>

      <section className="progress-summary">
        <div className="summary-text">
          <h2>Today's Progress</h2>
          <p>{summary.percent === 100 ? "All caught up! Great job." : "Complete sessions to see your progress."}</p>
        </div>

        <div className="summary-stats">
          <div>
            <strong>{summary.completed}/{summary.total}</strong>
            <br />Exercises Completed
          </div>
          <div>
            <strong>{summary.time}</strong>
            <br />Practice Time
          </div>
          <div>
            <strong>{summary.streak}</strong>
            <br />Day Streak
          </div>
        </div>

        <div className="progress-bar large">
          <div
            className="fill"
            style={{ width: `${summary.percent}%`, transition: 'width 1s ease-in-out' }}
          ></div>
        </div>
      </section>

      <section className="exercise-list">
        {exercises.map((ex) => (
          <article key={ex.id} className="exercise-card">
            <div className="card-header">
              <h3>{ex.title}</h3>
              <span className={`level ${ex.level.toLowerCase()}`}>
                {ex.level}
              </span>
            </div>

            <p className="meta">{ex.done}</p>

            <div className="progress-bar small">
              <div
                className="fill"
                style={{ width: `${ex.progress}%`, transition: 'width 1s ease-in-out' }}
              ></div>
            </div>

            <Link to={ex.path}>
              <button className="start-btn">
                {ex.progress === 100 ? "✓ Completed" : "▶ Start Exercise"}
              </button>
            </Link>
          </article>
        ))}
      </section>
    </main>
  );
};

export default Exercises;