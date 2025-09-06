import React from 'react';

const WhySection: React.FC = () => {
  return (
    <section className="py-16 bg-white">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-4xl font-bold text-center mb-8 text-gray-900">Why Swing Shop</h2>
        <ul className="grid md:grid-cols-2 gap-4 text-lg text-gray-700">
          <li className="flex items-start gap-3"><span className="text-cyan-600 mt-1">✓</span> Bats don’t hit bombs—mechanics do.</li>
          <li className="flex items-start gap-3"><span className="text-cyan-600 mt-1">✓</span> Frame‑by‑frame breakdowns sent to your phone show exactly what to work on.</li>
          <li className="flex items-start gap-3"><span className="text-cyan-600 mt-1">✓</span> Drills tailored to your swing.</li>
          <li className="flex items-start gap-3"><span className="text-cyan-600 mt-1">✓</span> Bring your current coach or get matched with one of ours.</li>
        </ul>
      </div>
    </section>
  );
};

export default WhySection;
