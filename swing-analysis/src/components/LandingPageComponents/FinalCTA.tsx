import React from 'react';
import { Link } from 'react-router-dom';

const FinalCTA: React.FC = () => {
  const trackButtonClick = (buttonName: string, destination: string) => {
    const sessionId = localStorage.getItem('analyticsSessionId') || 
      `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    console.log(`[Analytics] Button clicked: ${buttonName}`, {
      destination,
      timestamp: new Date().toISOString()
    });
    
    fetch(`${import.meta.env.VITE_API_BASE || 'http://localhost:8787'}/api/analytics/track`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        event_type: 'button_click',
        page_path: '/',
        plan_id: buttonName,
        plan_name: destination,
        session_id: sessionId
      })
    }).catch(err => console.log('Analytics error:', err));
  };

  return (
  <section className="py-20 bg-gradient-to-br from-slate-900 via-teal-800 to-teal-600 text-white">
    <div className="max-w-5xl mx-auto text-center px-4">
      <h2 className="text-4xl font-bold mb-6">The Mechanics, Not the Metal.</h2>
      <p className="text-xl mb-6">The Swing Shop is where we bring the tech, coaches bring the expertise, and hitters bring their swing.</p>
      <div className="flex gap-4 justify-center flex-wrap">
        <a 
          href="#pricing" 
          onClick={() => trackButtonClick('join_as_player_final', '#pricing')}
          className="inline-block bg-cyan-500 text-white px-10 py-5 rounded-lg font-bold text-xl hover:bg-cyan-600 transform hover:-translate-y-1 transition-all"
        >
          Join as Player
        </a>
        <Link 
          to="/coach/signup" 
          onClick={() => trackButtonClick('join_as_coach_final', '/coach/signup')}
          className="inline-block bg-white text-teal-800 px-10 py-5 rounded-lg font-bold text-xl hover:bg-gray-100 transform hover:-translate-y-1 transition-all"
        >
          Join as Coach
        </Link>
      </div>
      <p className="mt-8 text-cyan-200">It's the body, not the bat.</p>
    </div>
  </section>
  );
};

export default FinalCTA;
