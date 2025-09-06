import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import HeroSection from '../components/LandingPageComponents/HeroSection';
import WhySection from '../components/LandingPageComponents/WhySection';
import DifferentiatorsSection from '../components/LandingPageComponents/DifferentiatorsSection';
import HowItWorksSection from '../components/LandingPageComponents/HowItWorksSection';
import LogoDivider from '../components/LandingPageComponents/LogoDivider';
import TestimonialsSection from '../components/LandingPageComponents/TestimonialsSection';
import PricingSection, { type Plan } from '../components/LandingPageComponents/PricingSection';
import FinalCTA from '../components/LandingPageComponents/FinalCTA';

// -----------------------------
// Pricing (unchanged IDs so checkout links keep working)
// -----------------------------
const PLANS: Plan[] = [
  {
    id: 'starter',
    name: 'Starter',
    price: '$25',
    period: '/month',
    features: ['2 analyses', 'Pro feedback', 'Progress tracking', 'iOS app']
  },
  {
    id: 'performance',
    name: 'Performance',
    price: '$45',
    period: '/month',
    features: ['4 analyses/month', 'All features in Starter', '2 athletes'],
    popular: true
  },
  {
    id: 'sixmonth',
    name: '6-Month Performance',
    price: '$249',
    period: '/6 months',
    features: ['24 analyses total', 'Save $40 vs monthly']
  }
];

export function LandingPage() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [audience, setAudience] = useState('player');

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="absolute top-0 left-0 right-0 z-50 bg-transparent">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center gap-3">
              <img src="/swing-shop-icon.png" alt="Swing Shop" className="w-8 h-8 md:w-10 md:h-10 object-contain" />
              <span className="text-xl md:text-2xl font-bold text-white">Swing Shop</span>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-4 md:space-x-6">
              <a href="https://batdigest.com" className="text-white hover:text-cyan-300 text-sm md:text-base">BatDigest</a>
              <Link to="/login" className="text-white hover:text-cyan-300 text-sm md:text-base">Player Login</Link>
              <Link to="/coach/login" className="text-white hover:text-cyan-300 text-sm md:text-base">Coach Login</Link>
              <div className="flex gap-2">
                <a href="#pricing" className="bg-cyan-500 text-white px-3 md:px-4 py-2 rounded-lg hover:bg-cyan-600 text-sm md:text-base">Sign Up</a>
              </div>
            </div>

            {/* Mobile Hamburger Button */}
            <button
              className="md:hidden text-white p-2"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu Slide-out */}
        <div
          className={`fixed top-0 right-0 h-full w-64 bg-slate-900 transform transition-transform duration-300 ease-in-out z-50 ${
            isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
          } md:hidden`}
        >
          <div className="p-6">
            <button className="absolute top-6 right-6 text-white" onClick={() => setIsMobileMenuOpen(false)}>
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <div className="mt-16 flex flex-col space-y-6">
              <a
                href="https://batdigest.com"
                className="text-white text-lg hover:text-cyan-300 transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                BatDigest
              </a>
              <Link
                to="/login"
                className="text-white text-lg hover:text-cyan-300 transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Player Login
              </Link>
              <Link
                to="/coach/login"
                className="text-white text-lg hover:text-cyan-300 transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Coach Login
              </Link>
              <a
                href="#pricing"
                className="bg-cyan-500 text-white px-6 py-3 rounded-lg hover:bg-cyan-600 text-center font-semibold"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Sign Up
              </a>
            </div>
          </div>
        </div>

        {/* Overlay */}
        {isMobileMenuOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden" onClick={() => setIsMobileMenuOpen(false)} />
        )}
      </nav>

      {/* Hero Section */}
      <HeroSection audience={audience as any} setAudience={setAudience as any} />

      

      <WhySection />

      <section className="py-16 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-center mb-8 text-gray-900">Why Swing Shop</h2>
          <ul className="grid md:grid-cols-2 gap-4 text-lg text-gray-700">
            <li className="flex items-start gap-3"><span className="text-cyan-600 mt-1">✓</span> Bats don’t fix swing flaws—mechanics do.</li>
            <li className="flex items-start gap-3"><span className="text-cyan-600 mt-1">✓</span> Frame-by-frame breakdowns show exactly what to change.</li>
            <li className="flex items-start gap-3"><span className="text-cyan-600 mt-1">✓</span> Drills tailored to your swing. Track progress over time.</li>
            <li className="flex items-start gap-3"><span className="text-cyan-600 mt-1">✓</span> Use your current coach or get matched with verified coaches and D1 players.</li>
          </ul>
        </div>
      </section>

      <DifferentiatorsSection />

      <section className="py-12 bg-gray-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h3 className="text-3xl font-bold mb-4 text-gray-900">How We’re Different</h3>
          <div className="grid md:grid-cols-3 gap-6 text-gray-700">
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
              <h4 className="font-bold mb-2">Coach-First, Player-Focused</h4>
              <p>We’re a clubhouse, not a marketplace. Coaches keep their players. Players keep their coach.</p>
            </div>
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
              <h4 className="font-bold mb-2">Results, Not Dashboards</h4>
              <p>No vanity analytics. Just clear fixes and targeted drills that move the needle.</p>
            </div>
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
              <h4 className="font-bold mb-2">Bring Your Own Coach</h4>
              <p>Already have a coach you trust? Add their code and keep working together remotely.</p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works (modularized, includes combined player steps) */}
      <HowItWorksSection audience={audience as any} setAudience={setAudience as any} />

      

      

      <LogoDivider />

      <TestimonialsSection />

      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-center mb-16 text-gray-900">What Players & Parents Say</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white p-8 rounded-xl shadow-lg">
              <p className="text-gray-700 mb-6 italic">“We bought the $500 bat and maybe got 1%. Three months on Swing Shop, my kid doubled his average and hit more homers in one weekend than last year.”</p>
              <div className="font-bold">— Jennifer R., Parent</div>
            </div>
            <div className="bg-white p-8 rounded-xl shadow-lg">
              <p className="text-gray-700 mb-6 italic">“The difference wasn’t the bat—it was finally understanding the swing.”</p>
              <div className="font-bold">— Michael T., Parent</div>
            </div>
          </div>
        </div>
      </section>

      <PricingSection plans={PLANS} />

      <section className="py-20 bg-gray-100" id="pricing">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-center mb-4 text-gray-900">Start Improving Today</h2>
          <p className="text-center text-gray-600 mb-3">Join with your coach's code or get matched with our pros</p>
          <p className="text-center text-gray-500 text-sm mb-12">Monthly subscriptions. Cancel anytime.</p>

          <div className="grid md:grid-cols-3 gap-8">
            {PLANS.map((plan) => (
              <div key={plan.id} className={`bg-white rounded-xl p-8 relative ${plan.popular ? 'ring-4 ring-cyan-500 transform scale-105' : ''}`}>
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-cyan-500 text-white px-4 py-1 rounded-full text-sm font-bold">MOST POPULAR</div>
                )}
                <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                <div className="text-4xl font-bold mb-1">
                  {plan.price}
                  <span className="text-lg font-normal text-gray-600">{plan.period}</span>
                </div>
                <ul className="mt-8 mb-8 space-y-3">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <svg className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>
                <Link to={`/checkout?plan=${plan.id}`} className="block w-full bg-cyan-500 text-white text-center py-3 rounded-lg font-bold hover:bg-cyan-600 transition-colors">Get Started</Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      <FinalCTA />

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="flex flex-col md:flex-row items-center gap-6">
              <img src="/swing-shop-icon.png" alt="Swing Shop" className="w-12 h-12 opacity-50" />
              <div className="text-center md:text-left">
                <p className="text-gray-400">© 2024 Swing Shop. All rights reserved.</p>
                <p className="text-gray-400 text-sm mt-2">The Mechanics, Not the Metal.</p>
                <p className="text-gray-400 text-sm mt-1">A BatDigest.com Initiative</p>
              </div>
            </div>
            <div className="flex gap-6 flex-wrap">
              <a href="https://batdigest.com" className="text-gray-400 hover:text-white">BatDigest.com</a>
              <Link to="/login" className="text-gray-400 hover:text-white">Player Login</Link>
              <Link to="/coach/login" className="text-gray-400 hover:text-white">Coach Login</Link>
              <Link to="/account" className="text-gray-400 hover:text-white">My Account</Link>
              <Link to="/privacy" className="text-gray-400 hover:text-white">Privacy</Link>
              <a href="mailto:support@batdigest.com" className="text-gray-400 hover:text-white">Support</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
