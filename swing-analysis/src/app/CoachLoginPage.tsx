import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

export function CoachLoginPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('https://swing-platform.brianduryea.workers.dev/api/coach/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Invalid email or password');
      }

      // Store coach data and token
      localStorage.setItem('coachToken', data.token);
      localStorage.setItem('coachData', JSON.stringify({
        id: data.coach.id,
        email: data.coach.email,
        fullName: data.coach.fullName,
        inviteCode: data.coach.inviteCode
      }));

      // Navigate to coach queue
      navigate('/coach/queue');

    } catch (err: any) {
      setError(err.message || 'Failed to sign in');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-teal-800 to-teal-600">
      {/* Navigation */}
      <nav className="absolute top-0 left-0 right-0 z-50 bg-transparent">
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
              <Link to="/coach/signup" className="bg-cyan-500 text-white px-3 md:px-4 py-2 rounded-lg hover:bg-cyan-600 text-sm md:text-base">
                Coach Sign Up
              </Link>
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
              <span className="text-cyan-300 text-lg font-semibold">
                Coach Login
              </span>
              <Link 
                to="/coach/signup" 
                className="bg-cyan-500 text-white px-6 py-3 rounded-lg hover:bg-cyan-600 text-center font-semibold"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Coach Sign Up
              </Link>
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
      </nav>
      
      <div className="flex items-center justify-center p-4 min-h-screen pt-20">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Coach Login
          </h1>
          <p className="text-gray-600">
            Sign in to your coach account
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Email Address
            </label>
            <input
              type="email"
              id="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
              placeholder="coach@example.com"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <input
              type="password"
              id="password"
              required
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
              placeholder="••••••••"
            />
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-cyan-600 text-white py-3 rounded-lg font-semibold hover:bg-cyan-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {loading ? 'Signing In...' : 'Sign In'}
          </button>

          <div className="text-center">
            <Link to="/coach/forgot-password" className="text-sm text-cyan-600 hover:text-cyan-700">
              Forgot your password?
            </Link>
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-gray-500">New coach?</span>
            </div>
          </div>

          <Link
            to="/coach/signup"
            className="block w-full text-center border border-gray-300 py-3 rounded-lg font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Create Coach Account
          </Link>
        </form>

        <div className="mt-6 pt-6 border-t border-gray-200">
          <div className="bg-blue-50 rounded-lg p-4">
            <p className="text-xs text-blue-800">
              <strong>Your Coach Code:</strong> After logging in, you'll see your unique invite code that players use to link their submissions to you.
            </p>
          </div>
        </div>
      </div>
      </div>
    </div>
  );
}