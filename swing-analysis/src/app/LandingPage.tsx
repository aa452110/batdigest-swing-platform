import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import HeroSection from '../components/LandingPageComponents/HeroSection';
import WhySection from '../components/LandingPageComponents/WhySection';
import DifferentiatorsSection from '../components/LandingPageComponents/DifferentiatorsSection';
import HowItWorksSection from '../components/LandingPageComponents/HowItWorksSection';
import LogoDivider from '../components/LandingPageComponents/LogoDivider';
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
    features: ['2 analyses/month', 'Pro feedback', 'Progress tracking', 'iOS app']
  },
  {
    id: 'performance',
    name: 'Performance',
    price: '$45',
    period: '/month',
    features: ['4 analyses/month', 'All features in Starter', '2 athletes', '≈ 10% the price of a new bat'],
    popular: true
  },
  {
    id: 'sixmonth',
    name: '6-Month Performance',
    price: '$249',
    period: '/6 months',
    features: ['24 analyses total', 'Save $21 vs monthly', '≈ 50% the price of a new bat']
  }
];

export function LandingPage() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [audience, setAudience] = useState('player');

  useEffect(() => {
    // Track homepage visit
    const sessionId = localStorage.getItem('analyticsSessionId') || 
      `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    if (!localStorage.getItem('analyticsSessionId')) {
      localStorage.setItem('analyticsSessionId', sessionId);
    }
    
    // Send analytics event
    fetch(`${import.meta.env.VITE_API_BASE || 'http://localhost:8787'}/api/analytics/track`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        event_type: 'homepage_view',
        page_path: '/',
        session_id: sessionId,
        referrer: document.referrer,
        user_agent: navigator.userAgent
      })
    }).catch(err => console.log('Analytics tracking:', err));
    
    // Also log to console for debugging
    console.log('[Analytics] Homepage view tracked', {
      sessionId,
      referrer: document.referrer,
      timestamp: new Date().toISOString()
    });
  }, []);

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
              <a
                href="https://apps.apple.com/us/app/swingshop/id6751605848"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white hover:text-cyan-300 text-sm md:text-base"
              >
                The App
              </a>
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
              <a
                href="https://apps.apple.com/us/app/swingshop/id6751605848"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white text-lg hover:text-cyan-300 transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                The App
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

      

      <WhySection audience={audience as any} />

      {/* How It Works (modularized, includes combined player steps) */}
      <HowItWorksSection audience={audience as any} setAudience={setAudience as any} />

      <DifferentiatorsSection />

      

      


      

      <PricingSection plans={PLANS} />

      

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
              <Link to="/support" className="text-gray-400 hover:text-white">Support</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
