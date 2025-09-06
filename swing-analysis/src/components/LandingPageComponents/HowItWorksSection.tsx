import React from 'react';

type Audience = 'player' | 'coach';

interface HowItWorksSectionProps {
  audience: Audience;
  setAudience: (a: Audience) => void;
}

const HowItWorksSection: React.FC<HowItWorksSectionProps> = ({ audience, setAudience }) => {
  return (
    <section className="py-12 bg-white" id="how-it-works">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-4 mb-6">
          <h2 className="text-4xl font-bold text-gray-900">How It Works</h2>
          <div className="inline-flex items-center rounded-full bg-gray-100 p-1">
            <button
              type="button"
              onClick={() => setAudience('player')}
              className={`px-4 py-2 rounded-full text-sm font-semibold transition ${
                audience === 'player' ? 'bg-white text-teal-800 shadow' : 'text-gray-700'
              }`}
              aria-pressed={audience === 'player'}
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
            >
              Coaches
            </button>
          </div>
        </div>

        {audience === 'player' ? (
          <>
            <div className="grid md:grid-cols-4 gap-6 mb-12">
              {[1, 2, 3, 4].map((n) => (
                <div className="text-center" key={n}>
                  <div className="w-16 h-16 bg-gradient-to-br from-cyan-500 to-teal-600 rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4">{n}</div>
                  {n === 1 && (<><h3 className="text-lg font-bold mb-2">Sign Up</h3><p className="text-sm text-gray-600">Pick a plan</p></>)}
                  {n === 2 && (<><h3 className="text-lg font-bold mb-2">Download the App</h3><p className="text-sm text-gray-600">iOS today; Android soon</p></>)}
                  {n === 3 && (<><h3 className="text-lg font-bold mb-2">Upload Video</h3><p className="text-sm text-gray-600">Chest-high, live swing</p></>)}
                  {n === 4 && (<><h3 className="text-lg font-bold mb-2">Get Results</h3><p className="text-sm text-gray-600">Fixes + drills in 72 hrs</p></>)}
                </div>
              ))}
            </div>

            <div className="bg-gray-50 rounded-xl p-6 max-w-3xl mx-auto">
              <div className="flex items-center justify-center gap-4 mb-2">
                <svg className="w-6 h-6 text-gray-700" fill="currentColor" viewBox="0 0 24 24"><path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/></svg>
                <span className="text-base font-semibold text-gray-700">Currently Available for iPhone</span>
              </div>
              <p className="text-center text-gray-600">Android version coming soon.</p>
            </div>
          </>
        ) : (
          <div className="max-w-3xl mx-auto">
            <ol className="space-y-3 text-gray-700 text-lg list-decimal list-inside">
              <li>Sign up as coach</li>
              <li>Get familiar with our video web analyzer</li>
              <li>Give your players their code. Pick up players looking for coaches.</li>
              <li>Make better hitters</li>
              <li>Coaches keep up to 90% of the revenue. More details after sign up.</li>
            </ol>
          </div>
        )}
      </div>
    </section>
  );
};

export default HowItWorksSection;

