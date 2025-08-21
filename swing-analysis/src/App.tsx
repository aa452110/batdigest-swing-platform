import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import NeedAnalysisPage from './app/NeedAnalysisPage';
import LoadVideoPage from './app/LoadVideoPage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<NeedAnalysisPage />} />
        <Route path="/analyzer" element={<LoadVideoPage />} />
      </Routes>
    </Router>
  );
}

export default App;
