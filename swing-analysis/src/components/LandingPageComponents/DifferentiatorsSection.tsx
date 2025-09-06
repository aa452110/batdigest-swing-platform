import React from 'react';

const DifferentiatorsSection: React.FC = () => {
  return (
    <section className="py-12 bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <h3 className="text-3xl font-bold mb-4 text-gray-900">How We’re Different</h3>
        <div className="grid md:grid-cols-3 gap-6 text-gray-700">
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
            <h4 className="font-bold mb-2">Coach-First, Player-Focused</h4>
            <p>We’re a clubhouse, not a marketplace. Coaches keep their players. Players keep their coach.</p>
          </div>
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
            <h4 className="font-bold mb-2">Results, Not Dashboard</h4>
            <p>No vanity analytics. No “AI” metrics or special devices that report information that isn’t useful. Just clear fixes and targeted drills that move the needle for your swing.</p>
          </div>
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
            <h4 className="font-bold mb-2">Bring Your Own Coach</h4>
            <p>Already have a coach you trust? Add their code and keep working together remotely.</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default DifferentiatorsSection;
