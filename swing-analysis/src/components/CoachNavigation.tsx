import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { SwingShopHeader } from './SwingShopHeader';

export function CoachNavigation() {
  const navigate = useNavigate();
  const location = useLocation();
  
  const isActive = (path: string) => location.pathname === path;
  
  return (
    <>
      <SwingShopHeader />
      <nav className="bg-teal-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center space-x-6">
            <button
              onClick={() => navigate('/coach/queue')}
              className={isActive('/coach/queue') ? 'text-cyan-300 font-semibold' : 'hover:text-cyan-300'}
            >
              Queue
            </button>
            <button
              onClick={() => navigate('/coach/get-started')}
              className={isActive('/coach/get-started') ? 'text-cyan-300 font-semibold' : 'hover:text-cyan-300'}
            >
              Get Started
            </button>
            <button
              onClick={() => navigate('/coach/how-it-works')}
              className={isActive('/coach/how-it-works') ? 'text-cyan-300 font-semibold' : 'hover:text-cyan-300'}
            >
              How It Works
            </button>
            <button
              onClick={() => navigate('/coach/profile')}
              className={isActive('/coach/profile') ? 'text-cyan-300 font-semibold' : 'hover:text-cyan-300'}
            >
              Profile
            </button>
            <button
              onClick={() => {
                localStorage.removeItem('coachToken');
                localStorage.removeItem('coachData');
                navigate('/coach/login');
              }}
              className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
    </>
  );
}