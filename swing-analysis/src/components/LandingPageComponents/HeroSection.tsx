import React from 'react';

type Audience = 'player' | 'coach';

interface HeroSectionProps {
  audience: Audience;
  setAudience: (a: Audience) => void;
}

const HeroSection: React.FC<HeroSectionProps> = ({ audience, setAudience }) => {
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
            <h1 className="text-5xl font-black mb-4 leading-tight">The Mechanics, Not the Metal.</h1>
            <p className="text-2xl mb-3 text-gray-100">Turn your $150 bat into a $500 swing.</p>
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
                <li className="flex gap-2 items-start"><span className="text-cyan-300">✓</span>Fix swing flaws with frame-by-frame breakdowns.</li>
                <li className="flex gap-2 items-start"><span className="text-cyan-300">✓</span>Use your current coach or get matched with verified pros.</li>
                <li className="flex gap-2 items-start"><span className="text-cyan-300">✓</span>Personalized drills and progress tracking.</li>
              </ul>
            ) : (
              <ul className="text-sm md:text-base space-y-2 mb-8 text-gray-100">
                <li className="flex gap-2 items-start"><span className="text-cyan-300">✓</span>We bring the platform, you bring the insight.</li>
                <li className="flex gap-2 items-start"><span className="text-cyan-300">✓</span>Keep your roster. Coach them remotely in one place.</li>
                <li className="flex gap-2 items-start"><span className="text-cyan-300">✓</span>Expand your reach without losing ownership of your players.</li>
                <li className="flex gap-2 items-start"><span className="text-cyan-300">✓</span>Earn 90% after processing—no facility, no scheduling headaches.</li>
              </ul>
            )}

            <div className="flex flex-wrap gap-4 mb-8">
              <a href="#pricing" className="bg-cyan-500 text-white px-8 py-4 rounded-lg font-bold text-lg hover:bg-cyan-600 transform hover:-translate-y-1 transition-all">Start as Player</a>
              <a href="/coach/signup" className="bg-transparent border-2 border-white text-white px-8 py-4 rounded-lg font-bold text-lg hover:bg-white hover:text-teal-800 transform hover:-translate-y-1 transition-all">Join as Coach</a>
            </div>
          </div>

          <div className="bg-white rounded-xl p-5 shadow-2xl">
            <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center">
              <div className="w-20 h-20 bg-cyan-500 rounded-full flex items-center justify-center cursor-pointer hover:scale-110 transition-transform">
                <div className="w-0 h-0 border-l-[25px] border-l-white border-t-[15px] border-t-transparent border-b-[15px] border-b-transparent ml-2" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;

