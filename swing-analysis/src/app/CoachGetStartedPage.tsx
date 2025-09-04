import React from 'react';
import { useNavigate } from 'react-router-dom';
import { CoachNavigation } from '../components/CoachNavigation';

export function CoachGetStartedPage() {
  const navigate = useNavigate();
  const coachData = localStorage.getItem('coachData');
  const coach = coachData ? JSON.parse(coachData) : null;

  return (
    <div className="min-h-screen bg-gray-50">
      <CoachNavigation />

      {/* Content */}
      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Welcome Message */}
        <div className="bg-gradient-to-r from-teal-600 to-teal-700 text-white rounded-xl p-6 mb-8">
          <h1 className="text-3xl font-bold">Welcome Coach {coach?.fullName?.split(' ')[0] || 'Coach'}!</h1>
          <p className="text-teal-100 mt-2">Everything you need to get started analyzing swings and helping players improve</p>
        </div>
        
        <h1 className="text-4xl font-bold text-gray-900 mb-8">Get Started as a Coach</h1>
        
        {/* Quick Start */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-bold text-teal-900 mb-6">Quick Start Checklist</h2>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-teal-500 text-white rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">1</div>
              <div>
                <h3 className="font-bold text-lg">Share Your Coach Code</h3>
                <p className="text-gray-600">Your code: <span className="font-bold text-teal-600 text-xl">{coach?.inviteCode}</span></p>
                <p className="text-gray-600 text-sm mt-1">Have players enter this when signing up in the iOS app</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-teal-500 text-white rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">2</div>
              <div>
                <h3 className="font-bold text-lg">Monitor Your Queue</h3>
                <p className="text-gray-600">Check your queue regularly for new video submissions</p>
                <button
                  onClick={() => navigate('/coach/queue')}
                  className="text-teal-600 hover:text-teal-700 font-semibold text-sm mt-1"
                >
                  Go to Queue →
                </button>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-teal-500 text-white rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">3</div>
              <div>
                <h3 className="font-bold text-lg">Analyze Videos</h3>
                <p className="text-gray-600">Review at least 75% of submissions to qualify for revenue share</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-teal-500 text-white rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">4</div>
              <div>
                <h3 className="font-bold text-lg">Get Paid Monthly</h3>
                <p className="text-gray-600">Earn 90% of subscription revenue from your players*</p>
              </div>
            </div>
          </div>
        </div>

        {/* Using the Analyzer */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-bold text-teal-900 mb-6">Using the Video Analyzer</h2>
          
          <div className="space-y-6">
            <div>
              <h3 className="font-bold text-lg mb-3">Basic Controls</h3>
              <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                <div className="flex justify-between">
                  <span className="font-medium">Play/Pause:</span>
                  <span className="text-gray-600">Spacebar</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Frame Forward:</span>
                  <span className="text-gray-600">Right Arrow</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Frame Back:</span>
                  <span className="text-gray-600">Left Arrow</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Speed Control:</span>
                  <span className="text-gray-600">0.25x to 2x playback</span>
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-bold text-lg mb-3">Annotation Tools</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-8 h-8 bg-gray-300 rounded flex items-center justify-center">✏️</div>
                    <span className="font-medium">Pen Tool</span>
                  </div>
                  <p className="text-sm text-gray-600">Draw freehand to highlight swing path</p>
                </div>
                
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-8 h-8 bg-gray-300 rounded flex items-center justify-center">📏</div>
                    <span className="font-medium">Line Tool</span>
                  </div>
                  <p className="text-sm text-gray-600">Draw straight lines for angles</p>
                </div>
                
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-8 h-8 bg-gray-300 rounded flex items-center justify-center">⭕</div>
                    <span className="font-medium">Dot Tool</span>
                  </div>
                  <p className="text-sm text-gray-600">Mark specific points of interest</p>
                </div>
                
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-8 h-8 bg-gray-300 rounded flex items-center justify-center">⬜</div>
                    <span className="font-medium">Box Tool</span>
                  </div>
                  <p className="text-sm text-gray-600">Highlight areas or zones</p>
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-bold text-lg mb-3">Recording Your Analysis</h3>
              <ol className="space-y-3">
                <li className="flex gap-3">
                  <span className="font-bold text-teal-600">1.</span>
                  <div>
                    <p className="font-medium">Click "Start Recording"</p>
                    <p className="text-sm text-gray-600">This captures your screen and microphone</p>
                  </div>
                </li>
                <li className="flex gap-3">
                  <span className="font-bold text-teal-600">2.</span>
                  <div>
                    <p className="font-medium">Analyze the swing</p>
                    <p className="text-sm text-gray-600">Use annotations while providing verbal feedback</p>
                  </div>
                </li>
                <li className="flex gap-3">
                  <span className="font-bold text-teal-600">3.</span>
                  <div>
                    <p className="font-medium">Stop & Upload</p>
                    <p className="text-sm text-gray-600">Your analysis is automatically converted to MP4 for iPhone compatibility</p>
                  </div>
                </li>
              </ol>
            </div>

            <div>
              <h3 className="font-bold text-lg mb-3">Adding Reference Videos</h3>
              <p className="text-gray-600 mb-3">You can upload your own drill and reference videos to use during analysis:</p>
              <ol className="space-y-2 text-gray-600">
                <li>1. Go to the analyzer page</li>
                <li>2. Click "Manage Reference Videos" in the sidebar</li>
                <li>3. Upload your own drill videos or technique examples</li>
                <li>4. These will be saved locally for all your future sessions</li>
              </ol>
            </div>
          </div>
        </div>

        {/* Getting Players */}
        <div className="bg-white rounded-xl shadow-lg p-8">
          <h2 className="text-2xl font-bold text-teal-900 mb-6">Getting Players to Sign Up</h2>
          
          <div className="space-y-6">
            <div>
              <h3 className="font-bold text-lg mb-3">Share Your Code</h3>
              <div className="bg-teal-50 rounded-lg p-6 text-center">
                <p className="text-gray-700 mb-3">Your unique coach code is:</p>
                <div className="text-4xl font-bold text-teal-600 mb-4">{coach?.inviteCode}</div>
                <button
                  onClick={() => {
                    const text = `Join me on Swing Shop! Download the app and use my coach code: ${coach?.inviteCode}`;
                    navigator.clipboard.writeText(text);
                    alert('Message copied to clipboard!');
                  }}
                  className="bg-teal-600 hover:bg-teal-700 text-white px-6 py-2 rounded-lg"
                >
                  Copy Share Message
                </button>
              </div>
            </div>

            <div>
              <h3 className="font-bold text-lg mb-3">Ways to Promote</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="border rounded-lg p-4">
                  <h4 className="font-semibold mb-2">Current Players</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Send to your team group chat</li>
                    <li>• Include in practice emails</li>
                    <li>• Post in team social media</li>
                  </ul>
                </div>
                
                <div className="border rounded-lg p-4">
                  <h4 className="font-semibold mb-2">New Players</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Add to your coaching bio</li>
                    <li>• Mention in camps/clinics</li>
                    <li>• Social media promotion</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h4 className="font-bold text-yellow-900 mb-2">📌 Remember</h4>
              <p className="text-sm text-gray-700">
                Players can also change their coach code in their profile if they initially signed up without one. 
                Just have them enter your code: <strong className="text-teal-600">{coach?.inviteCode}</strong>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}