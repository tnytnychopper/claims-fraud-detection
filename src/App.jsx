import React from 'react';
import HeroSection from './components/HeroSection';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { LandingPage } from './pages/LandingPage';
import { LiveCheckPage } from './pages/LiveCheckPage';
import { BulkAnalysisPage } from './pages/BulkAnalysisPage';
import { Navbar } from './components/Navbar';
import './index.css';
export function App() {
  return <Router>
      <div className="min-h-screen bg-[#0A0F1A] text-white font-sans">
        <HeroSection />
        <Navbar />
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/live-check" element={<LiveCheckPage />} />
          <Route path="/bulk-analysis" element={<BulkAnalysisPage />} />
        </Routes>
      </div>
    </Router>;
}