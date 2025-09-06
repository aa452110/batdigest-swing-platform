import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import HowItWorksSection from '../components/LandingPageComponents/HowItWorksSection';

// -----------------------------
// Pricing (unchanged IDs so checkout links keep working)
// -----------------------------
const PLANS = [
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
    price: '$40',
    period: '/month',
    features: ['4 analyses/month', 'All features'],
    popular: true
  },
  {
    id: 'sixmonth',
    name: '6-Month Performance',
    price: '$200',
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
      <section className="relative bg-gradient-to-br from-slate-900 via-teal-800 to-teal-600 text-white py-32 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage:
                "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.03'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")"
            }}
          ></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-5xl font-black mb-4 leading-tight">The Mechanics, Not the Metal.</h1>
              <p className="text-2xl mb-3 text-gray-100">Turn your $150 bat into a $500 swing.</p>
              <p className="text-lg mb-6 text-gray-200">Real coaches. Real feedback. Real results—right on your phone.</p>

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
                <Link to="/coach/signup" className="bg-transparent border-2 border-white text-white px-8 py-4 rounded-lg font-bold text-lg hover:bg-white hover:text-teal-800 transform hover:-translate-y-1 transition-all">Join as Coach</Link>
              </div>

              <p className="text-sm text-cyan-200">Bring your coach with you—ask, “Are you on Swing Shop?” and add their code at signup.</p>
            </div>

            {/* Video/Card */}
            <div className="bg-white rounded-xl p-5 shadow-2xl">
              <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center">
                <div className="w-20 h-20 bg-cyan-500 rounded-full flex items-center justify-center cursor-pointer hover:scale-110 transition-transform" aria-label="Play demo">
                  <div className="w-0 h-0 border-l-[25px] border-l-white border-t-[15px] border-t-transparent border-b-[15px] border-b-transparent ml-2"></div>
                </div>
              </div>
              <p className="text-center text-sm text-gray-600 mt-4">See how a coach marks up a swing and assigns drills in under 5 minutes.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Why Swing Shop (tightened) */}
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

      {/* Anti-SaaS reassurance */}
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

      

      

      {/* Logo Divider */}
      <div className="py-8 bg-white flex justify-center">
        <img src="/swing-shop-icon.png" alt="Swing Shop" className="w-16 h-16 md:w-20 md:h-20 opacity-20" />
      </div>

      {/* Testimonials */}
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

      {/* Pricing */}
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

      {/* Final CTA */}
      <section className="py-20 bg-gradient-to-br from-slate-900 via-teal-800 to-teal-600 text-white">
        <div className="max-w-4xl mx-auto text-center px-4">
          <h2 className="text-4xl font-bold mb-6">The Mechanics, Not the Metal.</h2>
          <p className="text-xl mb-3">A community where hitters get better and coaches share what works.</p>
          <p className="text-lg mb-8 text-cyan-100">We bring the platform and tech — you bring the expertise.</p>
          <div className="flex gap-4 justify-center flex-wrap">
            <a href="#pricing" className="inline-block bg-cyan-500 text-white px-10 py-5 rounded-lg font-bold text-xl hover:bg-cyan-600 transform hover:-translate-y-1 transition-all">Sign Up as Player</a>
            <Link to="/coach/signup" className="inline-block bg-white text-teal-800 px-10 py-5 rounded-lg font-bold text-xl hover:bg-gray-100 transform hover:-translate-y-1 transition-all">Join as Coach</Link>
          </div>
          <p className="mt-8 text-cyan-200">It’s the body, not the bat.</p>
        </div>
      </section>

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
