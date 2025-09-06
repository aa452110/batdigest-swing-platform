import React from 'react';

const TestimonialsSection: React.FC = () => (
  <section className="py-20 bg-white">
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
      <h2 className="text-4xl font-bold mb-8 text-gray-900">What Players & Parents Say</h2>
      <div className="grid md:grid-cols-2 gap-8">
        <div className="bg-gray-50 border border-gray-200 p-8 rounded-xl">
          <p className="text-gray-700 mb-6 italic">“We bought the $500 bat and maybe got 1%. Three months on Swing Shop, my kid doubled his average and hit more homers in one weekend than last year.”</p>
          <div className="font-bold">— Jennifer R., Parent</div>
        </div>
        <div className="bg-gray-50 border border-gray-200 p-8 rounded-xl">
          <p className="text-gray-700 mb-6 italic">“The difference wasn’t the bat—it was finally understanding the swing.”</p>
          <div className="font-bold">— Michael T., Parent</div>
        </div>
      </div>
    </div>
  </section>
);

export default TestimonialsSection;
