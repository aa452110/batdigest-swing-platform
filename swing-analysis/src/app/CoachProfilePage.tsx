import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CoachNavigation } from '../components/CoachNavigation';

export function CoachProfilePage() {
  const navigate = useNavigate();
  const [coach, setCoach] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('coachToken');
    const coachData = localStorage.getItem('coachData');
    
    if (!token || !coachData) {
      navigate('/coach/login');
      return;
    }
    
    setCoach(JSON.parse(coachData));
    setLoading(false);
  }, [navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <CoachNavigation />

      {/* Profile Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-xl shadow-lg p-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">Coach Profile</h2>
          
          {/* Basic Info */}
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Full Name</label>
              <div className="text-lg font-semibold text-gray-900">{coach.fullName}</div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Email</label>
              <div className="text-lg text-gray-900">{coach.email}</div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Organization</label>
              <div className="text-lg text-gray-900">{coach.organization || 'Not specified'}</div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Coach Code</label>
              <div className="flex items-center gap-3">
                <span className="text-2xl font-bold text-teal-600">{coach.inviteCode}</span>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(coach.inviteCode);
                    alert('Code copied to clipboard!');
                  }}
                  className="text-sm bg-gray-100 hover:bg-gray-200 px-3 py-1 rounded"
                >
                  Copy
                </button>
              </div>
            </div>
          </div>

          {/* Invite Code Section */}
          <div className="bg-teal-50 rounded-lg p-6 mb-8">
            <h3 className="text-xl font-bold text-teal-900 mb-3">Your Invite Code</h3>
            <div className="text-center py-4">
              <div className="text-5xl font-bold text-teal-600 mb-3">{coach.inviteCode}</div>
              <p className="text-gray-700 mb-4">Share this code with your players</p>
              <div className="bg-white rounded-lg p-4 text-left max-w-md mx-auto">
                <p className="text-sm text-gray-600 mb-2">
                  <strong>Instructions for players:</strong>
                </p>
                <ol className="text-sm text-gray-600 space-y-1">
                  <li>1. Download the Swing Shop iOS app</li>
                  <li>2. Sign up with code: <strong className="text-teal-600">{coach.inviteCode}</strong></li>
                  <li>3. Submit videos for analysis</li>
                </ol>
              </div>
            </div>
          </div>

          {/* Account Status */}
          <div className="border-t pt-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Account Status</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-gray-600">Verification Status</span>
                <span className="text-green-600 font-semibold">✓ Verified</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-gray-600">Account Type</span>
                <span className="font-semibold">Coach Account</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-gray-600">Member Since</span>
                <span className="font-semibold">
                  {new Date(coach.createdAt || Date.now()).toLocaleDateString()}
                </span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-gray-600">Revenue Tier</span>
                <span className="font-semibold">60% (First 20 players)</span>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="mt-8 flex gap-4">
            <button
              onClick={() => navigate('/coach/queue')}
              className="flex-1 bg-teal-600 hover:bg-teal-700 text-white py-3 px-6 rounded-lg font-semibold"
            >
              View Video Queue
            </button>
            <button
              onClick={() => navigate('/coach/get-started')}
              className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-3 px-6 rounded-lg font-semibold"
            >
              Get Started Guide
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}