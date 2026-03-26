import React from "react";
import { NavLink } from "react-router-dom";
import { LayoutDashboard, TrendingUp, Dumbbell } from "lucide-react";
import "./Sidebar.css";

export default function Sidebar() {
  return (
    <div className="sidebar">
      {/* Logo */}
      <div className="logo">SpeechFlow</div>

      {/* Navigation */}
      <ul className="nav">
        <li>
          <NavLink
            to="/"
            end
            className={({ isActive }) => (isActive ? "active" : "")}
          >
            <LayoutDashboard size={18} />
            <span>Dashboard</span>
          </NavLink>
        </li>
        <li>
          <NavLink
            to="/progress"
            className={({ isActive }) => (isActive ? "active" : "")}
          >
            <TrendingUp size={18} />
            <span>Progress</span>
          </NavLink>
        </li>
        <li>
          <NavLink
            to="/exercises"
            className={({ isActive }) => (isActive ? "active" : "")}
          >
            <Dumbbell size={18} />
            <span>Exercises</span>
          </NavLink>
        </li>
      </ul>
    </div>
  );
}
