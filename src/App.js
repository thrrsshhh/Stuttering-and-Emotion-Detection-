import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Dashboard from "./components/Dashboard";
import Exercises from "./components/Exercises";
import Progress from "./components/Progress";   
import SoftOnset from "./components/SoftOnset";
import ProlongedSpeech from "./components/ProlongedSpeech";
import BreathingControl from "./components/BreathingControl";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/progress" element={<Progress />} />  
        <Route path="/exercises" element={<Exercises />} />
        <Route path="/soft-onset" element={<SoftOnset />} />
        <Route path="/prolonged-speech" element={<ProlongedSpeech />} />
        <Route path="/breathing-control" element={<BreathingControl />} />
      </Routes>
    </Router>
  );
}

export default App;
