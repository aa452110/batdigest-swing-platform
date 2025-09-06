import React from 'react';

const WhySection: React.FC = () => {
  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-4xl font-bold mb-8 text-gray-900 text-center md:text-left">Why Swing Shop</h2>
        <div className="grid md:grid-cols-2 gap-10 items-stretch">
          {/* Left: Bullets */}
          <div>
            <ul className="space-y-4 text-lg text-gray-700">
              <li className="flex items-start gap-3"><span className="text-cyan-600 mt-1">✓</span> Bats don’t hit bombs—mechanics do.</li>
              <li className="flex items-start gap-3"><span className="text-cyan-600 mt-1">✓</span> Frame‑by‑frame breakdowns to your phone show exactly what to work on.</li>
              <li className="flex items-start gap-3"><span className="text-cyan-600 mt-1">✓</span> Drills tailored to your swing.</li>
              <li className="flex items-start gap-3"><span className="text-cyan-600 mt-1">✓</span> Bring your current coach or get matched with one of ours.</li>
            </ul>
          </div>
          {/* Right: Simple callout */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 flex flex-col justify-center text-center md:text-left">
            <div className="text-2xl font-extrabold text-teal-700 mb-2">Mechanics over metal.</div>
            <p className="text-gray-700">Real feedback, no gadgets. Fix the swing, not the shopping cart. Your path to more barrels starts with clear breakdowns and targeted work.</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default WhySection;
