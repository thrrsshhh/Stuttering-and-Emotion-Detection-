import React from "react";
import "./Progress.css";

const Progress = () => {
  return (
    <div className="progress-container">
      <h2>Progress</h2>
      <p>Welcome back! Here's your speech therapy progress.</p>

      {/* Top Stats */}
      <div className="stats-grid">
        <div className="stat-card">
          <h3>Session Streak</h3>
          <p className="big">14 days</p>
          <span>Personal best: 21 days</span>
        </div>
        <div className="stat-card">
          <h3>Total Practice Time</h3>
          <p className="big">24.5h</p>
          <span>↑ 3.2h this week</span>
        </div>
      </div>

      {/* Exercise Completion */}
      <div className="exercise-section">
        <h3>Exercise Completion Rates</h3>
        <div className="exercise-list">
          <div className="exercise-item">
            <span>Soft Onset</span>
            <div className="bar">
              <div className="fill" style={{ width: "90%" }}></div>
            </div>
            <small>45/50</small>
          </div>
          <div className="exercise-item">
            <span>Prolonged Speech</span>
            <div className="bar">
              <div className="fill" style={{ width: "84%" }}></div>
            </div>
            <small>38/45</small>
          </div>
          <div className="exercise-item">
            <span>Mirror Talk</span>
            <div className="bar">
              <div className="fill" style={{ width: "80%" }}></div>
            </div>
            <small>28/35</small>
          </div>
          <div className="exercise-item">
            <span>Breathing Exercises</span>
            <div className="bar">
              <div className="fill" style={{ width: "88%" }}></div>
            </div>
            <small>42/48</small>
          </div>
          <div className="exercise-item">
            <span>Rhythm Practice</span>
            <div className="bar">
              <div className="fill" style={{ width: "83%" }}></div>
            </div>
            <small>25/30</small>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Progress;
