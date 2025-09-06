import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const PLANS = [
  {
    id: 'starter',
    name: 'Starter',
    price: '$25',
    period: '/month',
    features: [
      '2 analyses',
      'Pro feedback',
      'Progress tracking',
      'iOS app'
    ]
  },
  {
    id: 'performance',
    name: 'Performance',
    price: '$40',
    period: '/month',
    features: [
      '4 analyses/month',
      'All features'
    ],
    popular: true
  },
  {
    id: 'sixmonth',
    name: '6-Month Performance',
    price: '$200',
    period: '/6 months',
    features: [
      '24 analyses total',
      'Save $40 vs monthly'
    ]
  }
];

export function LandingPage() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="absolute top-0 left-0 right-0 z-50 bg-transparent">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center gap-3">
              <img 
                src="/swing-shop-icon.png" 
                alt="Swing Shop" 
                className="w-8 h-8 md:w-10 md:h-10 object-contain"
              />
              <span className="text-xl md:text-2xl font-bold text-white">Swing Shop</span>
            </div>
            
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
              <div className="flex gap-2">
                <a href="#pricing" className="bg-cyan-500 text-white px-3 md:px-4 py-2 rounded-lg hover:bg-cyan-600 text-sm md:text-base">
                  Sign Up
                </a>
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
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
          />
        )}
      </nav>

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-slate-900 via-teal-800 to-teal-600 text-white py-32 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.03'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
          }}></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-5xl font-black mb-4 leading-tight">
                The Mechanics, not the Metal.
              </h1>
              <p className="text-2xl mb-8 text-gray-100">
                Turn your $150 bat into a $500 swing.
              </p>
              <p className="text-lg mb-8 text-gray-200">
                Real coaches. Real feedback. Real improvement—right on your phone.
              </p>
              <div className="flex flex-wrap gap-4 mb-8">
                <a href="#pricing" className="bg-cyan-500 text-white px-8 py-4 rounded-lg font-bold text-lg hover:bg-cyan-600 transform hover:-translate-y-1 transition-all">Start as Player</a>
                <Link to="/coach/signup" className="bg-transparent border-2 border-white text-white px-8 py-4 rounded-lg font-bold text-lg hover:bg-white hover:text-teal-800 transform hover:-translate-y-1 transition-all">Join as Coach</Link>
              </div>
              <div className="flex flex-wrap gap-6 text-sm">
                <div className="flex items-center gap-2">
                  <span className="text-cyan-400">✓</span>
                  <span>Work with YOUR coach remotely</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-cyan-400">✓</span>
                  <span>Get matched with verified coaches and D1 level players</span>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-xl p-5 shadow-2xl">
              <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center">
                <div className="w-20 h-20 bg-cyan-500 rounded-full flex items-center justify-center cursor-pointer hover:scale-110 transition-transform">
                  <div className="w-0 h-0 border-l-[25px] border-l-white border-t-[15px] border-t-transparent border-b-[15px] border-b-transparent ml-2"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Swing Shop */}
      <section className="py-16 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-center mb-8 text-gray-900">Why Swing Shop</h2>
          <ul className="grid md:grid-cols-2 gap-4 text-lg text-gray-700">
            <li className="flex items-start gap-3"><span className="text-cyan-600 mt-1">✓</span> Bats don’t fix swing flaws—coaches do.</li>
            <li className="flex items-start gap-3"><span className="text-cyan-600 mt-1">✓</span> Frame-by-frame breakdowns show exactly what to change.</li>
            <li className="flex items-start gap-3"><span className="text-cyan-600 mt-1">✓</span> Drills tailored to your swing. Track progress over time.</li>
            <li className="flex items-start gap-3"><span className="text-cyan-600 mt-1">✓</span> Use your current coach or get matched with verified coaches and D1 players.</li>
          </ul>
        </div>
      </section>

      {/* How it Works (Players) */}
      <section className="py-12 bg-gray-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h3 className="text-3xl font-bold mb-6 text-gray-900">How it Works (Players)</h3>
          <ol className="space-y-3 text-gray-700 text-lg list-decimal list-inside">
            <li>Sign Up – Pick a plan</li>
            <li>Get the iOS App – Android coming soon</li>
            <li>Upload a Video – Chest-high, live swing</li>
            <li>Get Results – Detailed feedback within 72 hours</li>
          </ol>
        </div>
      </section>

      {/* For Coaches */}
      <section className="py-12 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h3 className="text-3xl font-bold mb-4 text-gray-900">For Coaches (the short version)</h3>
          <ul className="space-y-2 text-gray-700 text-lg">
            <li>Share your expertise. Grow your reach. Get paid fairly.</li>
            <li>Keep your players, add new ones—no facility needed</li>
            <li>Coach on your schedule, from anywhere</li>
            <li>Earn 90% of subscription fees*</li>
          </ul>
          <p className="text-sm text-gray-500 mt-2">*After payment processing, when all player videos are analyzed during the period</p>
          <div className="mt-4">
            <Link to="/coach/signup" className="inline-block bg-cyan-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-cyan-600">Join as Coach →</Link>
          </div>
        </div>
      </section>

      {/* Problem/Solution Section (kept) */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-center mb-16 text-gray-900">The Truth About Bat Performance</h2>
          
          <div className="grid md:grid-cols-2 gap-12">
            <div className="bg-red-50 p-8 rounded-xl border-2 border-red-200">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-red-500 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                  ✗
                </div>
                <h3 className="text-2xl font-bold text-red-900">The Problem</h3>
              </div>
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <span className="w-2 h-2 bg-red-400 rounded-full mt-2 flex-shrink-0"></span>
                  <span className="text-gray-700">Parents often invest $500+ in the latest bats, hoping for a quick fix</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-2 h-2 bg-red-400 rounded-full mt-2 flex-shrink-0"></span>
                  <span className="text-gray-700">New models come out every year, but the real swing issues remain</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-2 h-2 bg-red-400 rounded-full mt-2 flex-shrink-0"></span>
                  <span className="text-gray-700">It's easy to blame the gear when mechanics are the issue</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-2 h-2 bg-red-400 rounded-full mt-2 flex-shrink-0"></span>
                  <span className="text-gray-700">Bat brands rarely focus on helping players actually improve</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-2 h-2 bg-red-400 rounded-full mt-2 flex-shrink-0"></span>
                  <span className="text-gray-700">Skills—not another new bat—are what break the cycle</span>
                </li>
              </ul>
            </div>
            
            <div className="bg-green-50 p-8 rounded-xl border-2 border-green-200">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                  ✓
                </div>
                <h3 className="text-2xl font-bold text-green-900">The Solution</h3>
              </div>
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <span className="w-2 h-2 bg-green-400 rounded-full mt-2 flex-shrink-0"></span>
                  <span className="text-gray-700">College Players and Legit Coaches analyze your Swing Mechanics</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-2 h-2 bg-green-400 rounded-full mt-2 flex-shrink-0"></span>
                  <span className="text-gray-700">Frame-by-frame breakdown shows exactly what to fix</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-2 h-2 bg-green-400 rounded-full mt-2 flex-shrink-0"></span>
                  <span className="text-gray-700">Personalized drills target your specific issues</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-2 h-2 bg-green-400 rounded-full mt-2 flex-shrink-0"></span>
                  <span className="text-gray-700">Track progress over time with multiple analyses</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-2 h-2 bg-green-400 rounded-full mt-2 flex-shrink-0"></span>
                  <span className="text-gray-700">Invest in skills that last, not gear that doesn't</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Logo Divider */}
      <div className="py-8 bg-white flex justify-center">
        <img 
          src="/swing-shop-icon.png" 
          alt="Swing Shop" 
          className="w-16 h-16 md:w-20 md:h-20 opacity-20"
        />
      </div>

      {/* Coach Value Prop Section */}
      <section className="py-20 bg-teal-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">Coaches: Turn Your Expertise Into Income</h2>
            <p className="text-xl text-teal-200">Earn 90% of subscription fees*. We handle the tech, you do what you love.</p>
            <p className="text-sm text-teal-300 mt-2">*After payment processing fees, when all player videos are analyzed during subscription period</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 mb-12">
            <div className="bg-teal-800 p-6 rounded-xl">
              <h3 className="text-xl font-bold mb-3 text-cyan-300">Expand Your Reach</h3>
              <p>Help players anywhere, not just in your local area. Build a nationwide client base.</p>
            </div>
            <div className="bg-teal-800 p-6 rounded-xl">
              <h3 className="text-xl font-bold mb-3 text-cyan-300">Year-Round Revenue</h3>
              <p>Keep earning during off-season. Your players stay subscribed, you keep coaching.</p>
            </div>
            <div className="bg-teal-800 p-6 rounded-xl">
              <h3 className="text-xl font-bold mb-3 text-cyan-300">Zero Overhead</h3>
              <p>No facility fees, no scheduling hassles. Just login to the coach dashboard and start coaching.</p>
            </div>
          </div>
          
          <div className="text-center">
            <Link to="/coach/signup" className="bg-cyan-500 text-white px-8 py-4 rounded-lg font-bold text-lg hover:bg-cyan-600 inline-block">
              Join as a Coach →
            </Link>
          </div>
        </div>
      </section>

      {/* Logo Divider */}
      <div className="py-6 bg-gray-50 flex justify-center">
        <img 
          src="/swing-shop-icon.png" 
          alt="" 
          className="w-12 h-12 md:w-16 md:h-16 opacity-10"
        />
      </div>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-center mb-6 text-gray-900">
            Getting Better Has Never Been Easier
          </h2>
          <p className="text-xl text-center mb-4 text-gray-700 font-semibold">
            Just upload a video of your hitter and get pro feedback in 72 hours
          </p>
          <p className="text-lg text-center mb-16 text-gray-600">
            Use an existing video from your phone or record a new one. Film from chest-high during a live at-bat. It's that simple.
          </p>
          
          <div className="grid md:grid-cols-4 gap-6 mb-12">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-cyan-500 to-teal-600 rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4">
                1
              </div>
              <h3 className="text-lg font-bold mb-2">Sign Up</h3>
              <p className="text-sm text-gray-600">Choose the plan that fits your needs and budget</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-cyan-500 to-teal-600 rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4">
                2
              </div>
              <h3 className="text-lg font-bold mb-2">Download the App</h3>
              <p className="text-sm text-gray-600">Get our iOS app from the Apple App Store</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-cyan-500 to-teal-600 rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4">
                3
              </div>
              <h3 className="text-lg font-bold mb-2">Upload Video</h3>
              <p className="text-sm text-gray-600">Submit an existing video or record a new one</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-cyan-500 to-teal-600 rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4">
                4
              </div>
              <h3 className="text-lg font-bold mb-2">Get Results</h3>
              <p className="text-sm text-gray-600">Receive detailed analysis within 72 hours</p>
            </div>
          </div>
          
          {/* iPhone availability notice */}
          <div className="bg-gray-50 rounded-xl p-6 max-w-3xl mx-auto">
            <div className="flex items-center justify-center gap-4 mb-4">
              <svg className="w-8 h-8 text-gray-700" fill="currentColor" viewBox="0 0 24 24">
                <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
              </svg>
              <span className="text-lg font-semibold text-gray-700">Currently Available for iPhone</span>
            </div>
            <p className="text-center text-gray-600">
              Our iOS app makes submitting videos incredibly easy. Android version coming soon!
            </p>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-center mb-16 text-gray-900">
            What Players & Parents Say
          </h2>
          
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

      {/* Pricing Section */}
      <section className="py-20 bg-gray-100" id="pricing">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-center mb-4 text-gray-900">
            Start Improving Today
          </h2>
          <p className="text-center text-gray-600 mb-3">
            Join with your coach's code or get matched with our pros
          </p>
          <p className="text-center text-gray-500 text-sm mb-12">
            Monthly subscriptions. Cancel anytime.
          </p>
          
          <div className="grid md:grid-cols-3 gap-8">
            {PLANS.map((plan) => (
              <div key={plan.id} className={`bg-white rounded-xl p-8 relative ${plan.popular ? 'ring-4 ring-cyan-500 transform scale-105' : ''}`}>
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-cyan-500 text-white px-4 py-1 rounded-full text-sm font-bold">
                    MOST POPULAR
                  </div>
                )}
                
                <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                <div className="text-4xl font-bold mb-1">
                  {plan.price}<span className="text-lg font-normal text-gray-600">{plan.period}</span>
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
                
                <Link 
                  to={`/checkout?plan=${plan.id}`}
                  className="block w-full bg-cyan-500 text-white text-center py-3 rounded-lg font-bold hover:bg-cyan-600 transition-colors"
                >
                  Get Started
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-slate-900 via-teal-800 to-teal-600 text-white">
        <div className="max-w-4xl mx-auto text-center px-4">
          <h2 className="text-4xl font-bold mb-6">The Mechanics, not the Metal.</h2>
          <p className="text-xl mb-8">
            A community where hitters get better and coaches share what works.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <a href="#pricing" className="inline-block bg-cyan-500 text-white px-10 py-5 rounded-lg font-bold text-xl hover:bg-cyan-600 transform hover:-translate-y-1 transition-all">Sign Up as Player</a>
            <Link to="/coach/signup" className="inline-block bg-white text-teal-800 px-10 py-5 rounded-lg font-bold text-xl hover:bg-gray-100 transform hover:-translate-y-1 transition-all">Join as Coach</Link>
          </div>
          <p className="mt-8 text-cyan-200">Turn your $150 bat into a $500 swing</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="flex flex-col md:flex-row items-center gap-6">
              <img 
                src="/swing-shop-icon.png" 
                alt="Swing Shop" 
                className="w-12 h-12 opacity-50"
              />
              <div className="text-center md:text-left">
                <p className="text-gray-400">© 2024 Swing Shop. All rights reserved.</p>
                <p className="text-gray-400 text-sm mt-2">The Mechanic, Not the Metal.</p>
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
