import React, { useState } from 'react';
import { Link } from 'react-router-dom';

export const SupportPage: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Gradient Background for Nav */}
      <div className="bg-gradient-to-br from-slate-900 via-teal-800 to-teal-600">
        {/* Navigation */}
        <nav className="relative z-50 bg-transparent">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-6">
              <Link to="/" className="flex items-center gap-3">
                <img 
                  src="/swing-shop-icon.png" 
                  alt="Swing Shop" 
                  className="w-8 h-8 md:w-10 md:h-10 object-contain"
                />
                <span className="text-xl md:text-2xl font-bold text-white">Swing Shop</span>
              </Link>
              
              {/* Desktop Navigation */}
              <div className="hidden md:flex items-center space-x-4 md:space-x-6">
                <a href="https://batdigest.com" className="text-white hover:text-cyan-300 text-sm md:text-base">
                  BatDigest
                </a>
                <Link to="/login" className="text-white hover:text-cyan-300 text-sm md:text-base">
                  Player Login
                </Link>
                <Link to="/coach/login" className="text-white hover:text-cyan-300 text-sm md:text-base">
                  Coach Login
                </Link>
                <a href="/#pricing" className="bg-cyan-500 text-white px-3 md:px-4 py-2 rounded-lg hover:bg-cyan-600 text-sm md:text-base">
                  Sign Up
                </a>
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
        </nav>

        {/* Hero - now inside the same gradient background */}
        <section className="text-white py-16">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-4xl font-extrabold mb-3">Support</h1>
            <p className="text-lg text-teal-100">We're here to help. Reach out anytime.</p>
          </div>
        </section>
      </div>

      {/* Mobile Menu Slide-out */}
      <div className={`fixed top-0 right-0 h-full w-64 bg-slate-900 transform transition-transform duration-300 ease-in-out z-50 ${
        isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
      } md:hidden`}>
        <div className="p-6">
          <button
            className="absolute top-6 right-6 text-white"
            onClick={() => setIsMobileMenuOpen(false)}
          >
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
              href="/#pricing" 
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
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Content */}
      <main className="flex-1">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10">
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 md:p-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Contact Us</h2>
            <p className="text-gray-700 mb-6">For account questions, analysis issues, or general feedback, contact us directly:</p>

            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="mt-1">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-teal-600"><path d="M1.5 8.67v8.58A2.25 2.25 0 003.75 19.5h16.5a2.25 2.25 0 002.25-2.25V8.67l-8.708 5.232a3.75 3.75 0 01-3.784 0L1.5 8.67z"/><path d="M22.5 6.908V6.75A2.25 2.25 0 0020.25 4.5H3.75A2.25 2.25 0 001.5 6.75v.158l9.612 5.774a2.25 2.25 0 002.276 0L22.5 6.908z"/></svg>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Email</div>
                  <a href="mailto:brian@batdigest.com" className="text-teal-700 hover:underline">brian@batdigest.com</a>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="mt-1">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-teal-600"><path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zm-1.28 6.53a.75.75 0 10-1.06 1.06L10.94 11l-1.28 1.16a.75.75 0 101.02 1.1l2-1.8a.75.75 0 000-1.1l-2-1.8zm5.56 0a.75.75 0 10-1.06 1.06L16.5 11l-1.28 1.16a.75.75 0 101.02 1.1l2-1.8a.75.75 0 000-1.1l-2-1.8z" clipRule="evenodd"/></svg>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Social</div>
                  <div className="flex gap-4 mt-1">
                    <a href="https://twitter.com/batdigest" target="_blank" rel="noopener noreferrer" className="text-teal-700 hover:underline">Twitter/X</a>
                    <a href="https://instagram.com/batdigest" target="_blank" rel="noopener noreferrer" className="text-teal-700 hover:underline">Instagram</a>
                    <a href="https://www.youtube.com/@batdigest" target="_blank" rel="noopener noreferrer" className="text-teal-700 hover:underline">YouTube</a>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8">
              <Link to="/" className="inline-block text-sm text-gray-600 hover:text-gray-900 underline">← Back to Home</Link>
            </div>
          </div>
        </div>
      </main>

      {/* Footer (same style as home) */}
      <footer className="bg-gray-900 text-white py-12 mt-12">
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
};

export default SupportPage;

