import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { FirebaseProvider } from './lib/FirebaseProvider';
import { Navbar } from './components/Navbar';
import Home from './pages/Home';
import LearningMode from './pages/LearningMode';
import WordDropGame from './pages/WordDropGame';
import Analytics from './pages/Analytics';

export default function App() {
  return (
    <FirebaseProvider>
      <Router>
        <div className="min-h-screen bg-bg-dark font-sans selection:bg-primary/30 selection:text-primary">
          <Navbar />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/learn" element={<LearningMode />} />
            <Route path="/game" element={<WordDropGame />} />
            <Route path="/analytics" element={<Analytics />} />
          </Routes>
        </div>
      </Router>
    </FirebaseProvider>
  );
}
