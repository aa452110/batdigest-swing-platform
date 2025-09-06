import React from 'react';

type Audience = 'player' | 'coach';

interface HowItWorksSectionProps {
  audience: Audience;
  setAudience: (a: Audience) => void;
}

const HowItWorksSection: React.FC<HowItWorksSectionProps> = ({ audience, setAudience }) => {
  // Unified card renderer for consistent layout across toggles
  const renderCards = (items: { title: string; subtitle?: string }[]) => (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6 mb-8">
      {items.map((it, idx) => (
        <div className="text-center" key={idx}>
          <div className="w-16 h-16 bg-gradient-to-br from-cyan-500 to-teal-600 rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4">
            {idx + 1}
          </div>
          <h3 className="text-base font-bold mb-1">{it.title}</h3>
          {it.subtitle && <p className="text-sm text-gray-600">{it.subtitle}</p>}
        </div>
      ))}
    </div>
  );

  const playerItems = [
    { title: 'Sign Up', subtitle: 'Pick a plan' },
    { title: 'Download the App', subtitle: 'iOS today; Android soon' },
    { title: 'Upload Video', subtitle: 'Chest-high, live swing' },
    { title: 'Get Results', subtitle: 'Fixes + drills in 72 hrs' },
  ];

  const coachItems = [
    { title: 'Sign up as coach', subtitle: '(Free)' },
    { title: 'Build Your Team', subtitle: 'Add players with your code; get players from the portal' },
    { title: 'Coach', subtitle: 'Make < 5 minute analysis videos with our world‑class interface' },
    { title: 'See Real Results' },
  ];

  return (
    <section className="py-12 bg-white" id="how-it-works">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-6">
          <h2 className="text-4xl font-bold text-gray-900">How It Works</h2>
          <div className="inline-flex items-center rounded-full bg-gray-100 p-1 self-start md:self-auto" role="tablist" aria-label="Audience toggle">
            <button
              type="button"
              onClick={() => setAudience('player')}
              className={`px-4 py-2 rounded-full text-sm font-semibold transition ${
                audience === 'player' ? 'bg-white text-teal-800 shadow' : 'text-gray-700'
              }`}
              aria-pressed={audience === 'player'}
              role="tab"
            >
              Players
            </button>
            <button
              type="button"
              onClick={() => setAudience('coach')}
              className={`px-4 py-2 rounded-full text-sm font-semibold transition ${
                audience === 'coach' ? 'bg-white text-teal-800 shadow' : 'text-gray-700'
              }`}
              aria-pressed={audience === 'coach'}
              role="tab"
            >
              Coaches
            </button>
          </div>
        </div>

        {renderCards(audience === 'player' ? playerItems : coachItems)}

        {audience === 'player' && (
          <div className="bg-gray-50 rounded-xl p-5 max-w-3xl mx-auto text-center">
            <div className="flex items-center justify-center gap-3 mb-1">
              <span className="text-xl" role="img" aria-label="phone">📱</span>
              <span className="text-sm font-semibold text-gray-700">Currently Available for iPhone</span>
            </div>
            <p className="text-center text-gray-600 text-sm">Android version coming soon.</p>
          </div>
        )}

        {audience === 'coach' && (
          <div className="bg-gray-50 rounded-xl p-5 max-w-4xl mx-auto text-center">
            <div className="flex items-center justify-center gap-3 mb-1">
              <span className="text-xl" role="img" aria-label="laptop">💻</span>
              <span className="text-sm font-semibold text-gray-700">Coach on your terms</span>
            </div>
            <p className="text-gray-600 text-sm">
              Our easy‑to‑learn, web‑based analyzer runs in your browser so you can coach at your convenience from a good laptop or desktop.
              We offer free training to make your targeted feedback as useful as possible — even new coaches will help hitters improve.
              Coaches earn up to 90%. More details after you sign up.
            </p>
          </div>
        )}
      </div>
    </section>
  );
};

export default HowItWorksSection;
