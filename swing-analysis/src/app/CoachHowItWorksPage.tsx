import React from 'react';
import { useNavigate } from 'react-router-dom';
import { CoachNavigation } from '../components/CoachNavigation';

export function CoachHowItWorksPage() {
  const navigate = useNavigate();
  const coachData = localStorage.getItem('coachData');
  const coach = coachData ? JSON.parse(coachData) : null;

  return (
    <div className="min-h-screen bg-gray-50">
      <CoachNavigation />

      {/* Content */}
      <div className="max-w-5xl mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">How It Works</h1>
        
        {/* Overview */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-bold text-teal-900 mb-6">Platform Overview</h2>
          <p className="text-gray-700 mb-4">
            Swing Shop connects baseball and softball coaches with players for professional swing analysis. 
            Here's how the platform works:
          </p>
        </div>

        {/* Process Steps */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-bold text-teal-900 mb-6">The Process</h2>
          
          <div className="space-y-6">
            <div className="flex gap-4">
              <div className="w-12 h-12 bg-teal-500 text-white rounded-full flex items-center justify-center flex-shrink-0 text-xl font-bold">1</div>
              <div>
                <h3 className="text-xl font-bold mb-2">Players Submit Videos</h3>
                <p className="text-gray-600">Players use the iOS app to record and submit their swings using your coach code: <span className="font-bold text-teal-600">{coach?.inviteCode}</span></p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="w-12 h-12 bg-teal-500 text-white rounded-full flex items-center justify-center flex-shrink-0 text-xl font-bold">2</div>
              <div>
                <h3 className="text-xl font-bold mb-2">Videos Appear in Your Queue</h3>
                <p className="text-gray-600">All submissions from your players automatically appear in your personal queue</p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="w-12 h-12 bg-teal-500 text-white rounded-full flex items-center justify-center flex-shrink-0 text-xl font-bold">3</div>
              <div>
                <h3 className="text-xl font-bold mb-2">You Analyze & Record</h3>
                <p className="text-gray-600">Use our tools to annotate the video and record your voice-over analysis</p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="w-12 h-12 bg-teal-500 text-white rounded-full flex items-center justify-center flex-shrink-0 text-xl font-bold">4</div>
              <div>
                <h3 className="text-xl font-bold mb-2">Player Receives Analysis</h3>
                <p className="text-gray-600">Your recorded analysis is automatically delivered to the player's app</p>
              </div>
            </div>
          </div>
        </div>

        {/* Revenue Share */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-bold text-teal-900 mb-6">Revenue Share*</h2>
          <div className="space-y-4">
            <div className="border-l-4 border-teal-500 pl-4">
              <h3 className="font-bold text-lg">First 20 Players</h3>
              <p className="text-gray-600">60% of subscription revenue</p>
            </div>
            <div className="border-l-4 border-teal-500 pl-4">
              <h3 className="font-bold text-lg">21-50 Players</h3>
              <p className="text-gray-600">75% of subscription revenue</p>
            </div>
            <div className="border-l-4 border-teal-500 pl-4">
              <h3 className="font-bold text-lg">51+ Players</h3>
              <p className="text-gray-600">90% of subscription revenue</p>
            </div>
          </div>
          <p className="text-sm text-gray-500 mt-4">
            * After payment processing fees. Must analyze all submitted videos during subscription period to qualify for revenue share.
          </p>
        </div>

        {/* Quick Actions */}
        <div className="flex gap-4">
          <button
            onClick={() => navigate('/coach/queue')}
            className="flex-1 bg-teal-600 hover:bg-teal-700 text-white py-3 px-6 rounded-lg font-semibold"
          >
            Go to Video Queue
          </button>
          <button
            onClick={() => navigate('/coach/get-started')}
            className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-3 px-6 rounded-lg font-semibold"
          >
            Getting Started Guide
          </button>
        </div>
      </div>
    </div>
  );
}