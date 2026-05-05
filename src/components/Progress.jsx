import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Progress.css";

const Progress = () => {
  const navigate = useNavigate();

  const [summary, setSummary] = useState({
    completed: 0,
    total: 3,
    streak: 0,
    percent: 0,
  });

  useEffect(() => {
    const loadRealTimeProgress = () => {
      const bDone = localStorage.getItem("ex_breathing") === "done";
      const sDone = localStorage.getItem("ex_softonset") === "done";
      const pDone = localStorage.getItem("ex_prolonged") === "done";

      const completedCount = [bDone, sDone, pDone].filter(Boolean).length;
      const totalExercises = 3;
      const percentage = Math.round((completedCount / totalExercises) * 100);

      setSummary({
        completed: completedCount,
        total: totalExercises,
        streak: completedCount > 0 ? 1 : 0,
        percent: percentage,
      });
    };

    loadRealTimeProgress();

    window.addEventListener("storage", loadRealTimeProgress);
    window.addEventListener("exerciseCompleted", loadRealTimeProgress);

    return () => {
      window.removeEventListener("storage", loadRealTimeProgress);
      window.removeEventListener("exerciseCompleted", loadRealTimeProgress);
    };
  }, []);

  return (
    <div className="progress-container">
      <div style={{ width: "100%", maxWidth: "900px" }}>

        <header>
          <button
            className="back-btn"
            onClick={() => navigate("/")}
            style={{
              background: "none",
              border: "none",
              color: "#16a34a",
              cursor: "pointer",
              fontSize: "1rem",
              marginBottom: "10px",
              display: "flex",
              alignItems: "center",
            }}
          >
            ⬅ Back to Dashboard
          </button>

          <h2>Today's Progress</h2>
          <p>Track your daily speech therapy activity.</p>
        </header>

        <section className="progress-summary">
          <div className="summary-text">
            <h3>
              {summary.percent === 100
                ? "All caught up! Great job "
                : "Complete sessions to see your progress"}
            </h3>
          </div>
          
          <div
            style={{
              fontSize: "3rem",
              fontWeight: "bold",
              color: "#16a34a",
              textAlign: "center",
            }}
          >
            {summary.percent}%
          </div>

          <div className="summary-stats">
            <div>
              <strong>{summary.completed}/{summary.total}</strong>
              <br />Exercises Completed
            </div>

            <div>
              <strong>{summary.streak}</strong>
              <br />Day Streak
            </div>
          </div>

          <div className="progress-bar large">
            <div
              className="fill"
              style={{
                width: `${summary.percent}%`,
                transition: "width 1s ease-in-out",
              }}
            ></div>
          </div>
        </section>

      </div>
    </div>
  );
};

export default Progress;