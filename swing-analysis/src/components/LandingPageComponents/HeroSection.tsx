import React from 'react';

type Audience = 'player' | 'coach';

interface HeroSectionProps {
  audience: Audience;
  setAudience: (a: Audience) => void;
}

const HeroSection: React.FC<HeroSectionProps> = ({ audience, setAudience }) => {
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
    <section className="relative bg-gradient-to-br from-slate-900 via-teal-800 to-teal-600 text-white py-32 overflow-hidden">
      <div className="absolute inset-0 opacity-10">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.03'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")",
          }}
        />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <h1 className="text-5xl font-black mb-4 leading-tight">Get the Most From Your Bat.</h1>
            <p className="text-2xl mb-3 text-gray-100">Turn any bat into your best swing.</p>
            <p className="text-lg mb-6 text-gray-200">Real coaches. Real feedback. Real results. Right on your phone.</p>

            {/* Player/Coach toggle for messaging */}
            <div className="inline-flex items-center rounded-full bg-white/10 p-1 mb-6">
              <button
                type="button"
                onClick={() => setAudience('player')}
                className={`px-4 py-2 rounded-full text-sm font-semibold transition ${
                  audience === 'player' ? 'bg-white text-teal-800' : 'text-white'
                }`}
              >
                For Players
              </button>
              <button
                type="button"
                onClick={() => setAudience('coach')}
                className={`px-4 py-2 rounded-full text-sm font-semibold transition ${
                  audience === 'coach' ? 'bg-white text-teal-800' : 'text-white'
                }`}
              >
                For Coaches
              </button>
            </div>

            {audience === 'player' ? (
              <ul className="text-sm md:text-base space-y-2 mb-8 text-gray-100">
                <li className="flex gap-2 items-start"><span className="text-cyan-300">✓</span>Maximize your bat's performance with pro analysis.</li>
                <li className="flex gap-2 items-start"><span className="text-cyan-300">✓</span>Use your current coach or get matched with one.</li>
                <li className="flex gap-2 items-start"><span className="text-cyan-300">✓</span>Personalized drills and progress tracking.</li>
              </ul>
            ) : (
              <ul className="text-sm md:text-base space-y-2 mb-8 text-gray-100">
                <li className="flex gap-2 items-start"><span className="text-cyan-300">✓</span>We bring the platform, you bring the insight.</li>
                <li className="flex gap-2 items-start"><span className="text-cyan-300">✓</span>Keep your roster. Coach them remotely in one place.</li>
                <li className="flex gap-2 items-start"><span className="text-cyan-300">✓</span>Expand your reach, keep up to 90%.</li>
              </ul>
            )}

            <div className="flex flex-wrap gap-4 mb-8">
              <a 
                href="#pricing" 
                onClick={() => trackButtonClick('join_as_player_hero', '#pricing')}
                className="bg-cyan-500 text-white px-8 py-4 rounded-lg font-bold text-lg hover:bg-cyan-600 transform hover:-translate-y-1 transition-all"
              >
                Join as Player
              </a>
              <a 
                href="/coach/signup" 
                onClick={() => trackButtonClick('join_as_coach_hero', '/coach/signup')}
                className="bg-transparent border-2 border-white text-white px-8 py-4 rounded-lg font-bold text-lg hover:bg-white hover:text-teal-800 transform hover:-translate-y-1 transition-all"
              >
                Join as Coach
              </a>
            </div>
          </div>

          <div className="bg-white rounded-xl p-5 shadow-2xl">
            <div className="aspect-video rounded-lg overflow-hidden">
              <video
                src="/swing_analysis_hero.mp4"
                poster="/swing_analysis_feature_image.png"
                className="w-full h-full object-cover"
                autoPlay
                muted
                loop
                playsInline
                preload="metadata"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
