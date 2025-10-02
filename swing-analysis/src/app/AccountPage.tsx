import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { AccountSettings } from '../modules/account/AccountSettings';
import { SubscriptionManager } from '../modules/account/SubscriptionManager';
import { PasswordChange } from '../modules/account/PasswordChange';

export function AccountPage() {
  const navigate = useNavigate();
  const { user, token, isAuthenticated, loadFromStorage, logout } = useAuthStore();
  const [activeTab, setActiveTab] = useState<'account' | 'subscription' | 'password' | 'videos'>('account');

  useEffect(() => {
    loadFromStorage();
    if (!isAuthenticated && !token) {
      navigate('/login');
    }
  }, []);

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500">Loading...</p>
        </div>
      </div>
    );
  }

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
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
                <span className="text-white text-sm md:text-base">Welcome, {user.firstName}</span>
                <a href="https://batdigest.com" className="text-white hover:text-cyan-300 text-sm md:text-base">
                  BatDigest
                </a>
                <button
                  onClick={handleLogout}
                  className="bg-cyan-500 text-white px-3 md:px-4 py-2 rounded-lg hover:bg-cyan-600 text-sm md:text-base"
                >
                  Sign Out
                </button>
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
            <span className="text-white text-lg">Welcome, {user.firstName}</span>
            <a 
              href="https://batdigest.com" 
              className="text-white text-lg hover:text-cyan-300 transition-colors"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              BatDigest
            </a>
            <button
              onClick={() => { handleLogout(); setIsMobileMenuOpen(false); }}
              className="bg-cyan-500 text-white px-6 py-3 rounded-lg hover:bg-cyan-600 text-center font-semibold"
            >
              Sign Out
            </button>
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
      
      <div className="flex-grow max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8 w-full">
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
            <div>
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Account Management
              </h3>
              <p className="mt-1 max-w-2xl text-sm text-gray-500">
                Manage your account settings and subscription
              </p>
            </div>
          </div>

          <div className="border-b border-gray-200">
            <nav className="-mb-px flex justify-between items-center">
              <div className="flex">
                <button
                  onClick={() => setActiveTab('account')}
                  className={`py-2 px-6 border-b-2 font-medium text-sm ${
                    activeTab === 'account'
                      ? 'border-indigo-500 text-indigo-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Account Info
                </button>
                <button
                  onClick={() => setActiveTab('subscription')}
                  className={`py-2 px-6 border-b-2 font-medium text-sm ${
                    activeTab === 'subscription'
                      ? 'border-indigo-500 text-indigo-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Subscription
                </button>
                <button
                  onClick={() => setActiveTab('password')}
                  className={`py-2 px-6 border-b-2 font-medium text-sm ${
                    activeTab === 'password'
                      ? 'border-indigo-500 text-indigo-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Password
                </button>
              </div>
              <div className="flex items-center gap-4 px-6">
                <span className="text-sm text-gray-600">Welcome, {user.firstName}</span>
                <button
                  onClick={() => navigate('/account/dashboard')}
                  className="text-sm font-medium text-indigo-600 hover:text-indigo-500"
                >
                  My Videos →
                </button>
              </div>
            </nav>
          </div>

          <div className="px-4 py-5 sm:p-6">
            {activeTab === 'account' && <AccountSettings user={user} token={token} />}
            {activeTab === 'subscription' && <SubscriptionManager user={user} token={token} />}
            {activeTab === 'password' && <PasswordChange token={token} />}
          </div>
        </div>

        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-800">
            <strong>Note:</strong> To view your swing analysis videos and submit new videos, 
            please use the mobile app. This portal is for account management only.
          </p>
        </div>
      </div>
      
      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 mt-auto">
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
              <Link to="/" className="text-gray-400 hover:text-white">Home</Link>
              <Link to="/privacy" className="text-gray-400 hover:text-white">Privacy</Link>
              <Link to="/support" className="text-gray-400 hover:text-white">Support</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}