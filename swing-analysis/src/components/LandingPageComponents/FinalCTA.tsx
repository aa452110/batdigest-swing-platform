import React from 'react';
import { Link } from 'react-router-dom';

const FinalCTA: React.FC = () => (
  <section className="py-20 bg-gradient-to-br from-slate-900 via-teal-800 to-teal-600 text-white">
    <div className="max-w-4xl mx-auto text-center px-4">
      <h2 className="text-4xl font-bold mb-6">The Mechanics, Not the Metal.</h2>
      <p className="text-xl mb-6">The Swing Shop is where we bring the tech, coaches bring the expertise, and hitters bring their swing.</p>
      <div className="flex gap-4 justify-center flex-wrap">
        <a href="#pricing" className="inline-block bg-cyan-500 text-white px-10 py-5 rounded-lg font-bold text-xl hover:bg-cyan-600 transform hover:-translate-y-1 transition-all">Sign Up as Player</a>
        <Link to="/coach/signup" className="inline-block bg-white text-teal-800 px-10 py-5 rounded-lg font-bold text-xl hover:bg-gray-100 transform hover:-translate-y-1 transition-all">Join as Coach</Link>
      </div>
      <p className="mt-8 text-cyan-200">It’s the body, not the bat.</p>
    </div>
  </section>
);

export default FinalCTA;
