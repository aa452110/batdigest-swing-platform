import React from 'react';
import { Link } from 'react-router-dom';

const PLANS = [
  {
    id: 'starter',
    name: 'Starter',
    price: '$20',
    period: '/month',
    features: [
      '1 analysis/month',
      'Pro coach feedback',
      'Frame-by-frame analysis',
      'Progress tracking',
      'iOS app access'
    ]
  },
  {
    id: 'performance',
    name: 'Performance',
    price: '$40',
    period: '/month',
    features: [
      '4 analyses/month',
      'Pro coach feedback',
      'Frame-by-frame analysis',
      'Progress tracking',
      'iOS app access',
      'Priority support'
    ],
    popular: true
  },
  {
    id: 'sixmonth',
    name: '6-Month Performance',
    price: '$200',
    period: '/6 months',
    features: [
      '4 analyses/month',
      '24 total analyses',
      'Pro coach feedback',
      'Frame-by-frame analysis',
      'Progress tracking',
      'iOS app access',
      'Priority support',
      'Save $40 vs monthly'
    ]
  }
];

export function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="absolute top-0 left-0 right-0 z-50 bg-transparent">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <span className="text-2xl font-bold text-white">Swing Shop</span>
            </div>
            <div className="flex items-center space-x-6">
              <Link to="/login" className="text-white hover:text-gray-200">
                Login
              </Link>
              <a href="#pricing" className="bg-cyan-500 text-white px-4 py-2 rounded-lg hover:bg-cyan-600">
                Get Started
              </a>
            </div>
          </div>
        </div>
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
              <h1 className="text-5xl font-black mb-6 leading-tight">
                Turn Your <s className="opacity-50">$500</s> $150 Bat Into a $500 Swing
              </h1>
              <p className="text-xl mb-8 text-gray-100">
                The industry doesn't care how well you swing—just that you think the next bat is better. 
                We tell you the truth: it's the mechanic, not the metal.
              </p>
              <div className="flex flex-wrap gap-4 mb-8">
                <a href="#pricing" className="bg-cyan-500 text-white px-8 py-4 rounded-lg font-bold text-lg hover:bg-cyan-600 transform hover:-translate-y-1 transition-all">
                  Get Started
                </a>
              </div>
              <div className="flex flex-wrap gap-6 text-sm">
                <div className="flex items-center gap-2">
                  <span className="text-cyan-400">✓</span>
                  <span>Used by Travel Players</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-cyan-400">✓</span>
                  <span>Used by College Players</span>
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

      {/* Problem/Solution Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-center mb-16 text-gray-900">
            The Truth About Bat Performance
          </h2>
          
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
                  <span className="text-gray-700">Real college players analyze your swing mechanics</span>
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

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-center mb-16 text-gray-900">
            How It Works
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-20 h-20 bg-cyan-500 rounded-full flex items-center justify-center text-white text-3xl font-bold mx-auto mb-6">
                1
              </div>
              <h3 className="text-xl font-bold mb-3">Upload Your Swing</h3>
              <p className="text-gray-600">Record from any angle with your phone or camera. Our app makes it simple.</p>
            </div>
            
            <div className="text-center">
              <div className="w-20 h-20 bg-cyan-500 rounded-full flex items-center justify-center text-white text-3xl font-bold mx-auto mb-6">
                2
              </div>
              <h3 className="text-xl font-bold mb-3">Get Pro Analysis</h3>
              <p className="text-gray-600">Real D1 and JUCO players break down your mechanics frame by frame.</p>
            </div>
            
            <div className="text-center">
              <div className="w-20 h-20 bg-cyan-500 rounded-full flex items-center justify-center text-white text-3xl font-bold mx-auto mb-6">
                3
              </div>
              <h3 className="text-xl font-bold mb-3">Improve & Track</h3>
              <p className="text-gray-600">Follow personalized feedback, track your progress over time, and watch your performance improve.</p>
            </div>
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
              <p className="text-gray-700 mb-6 italic">
                "My son went from striking out twice a game to leading his team in batting average. 
                The difference wasn't a new bat—it was understanding his swing mechanics."
              </p>
              <div className="font-bold">— Michael T., Parent</div>
            </div>
            
            <div className="bg-white p-8 rounded-xl shadow-lg">
              <p className="text-gray-700 mb-6 italic">
                "We bought our kid the best bat and it might have improved his performance by 1%. 
                In 3 months with Swing Shop he's almost doubled his Average and hit more home runs 
                in the last weekend than he did all last year."
              </p>
              <div className="font-bold">— Jennifer R., Parent</div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20 bg-gray-100" id="pricing">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-center mb-4 text-gray-900">
            Choose Your Plan
          </h2>
          <p className="text-center text-gray-600 mb-12">
            Recurring charges. Cancel anytime.
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
          <h2 className="text-4xl font-bold mb-6">
            Stop Buying Equipment. Start Building Skills.
          </h2>
          <p className="text-xl mb-8">
            Join hundreds of players improving their swing at the Swing Shop
          </p>
          <a 
            href="#pricing" 
            className="inline-block bg-cyan-500 text-white px-10 py-5 rounded-lg font-bold text-xl hover:bg-cyan-600 transform hover:-translate-y-1 transition-all"
          >
            Get Started Today
          </a>
          <p className="mt-8 text-cyan-200">
            🔥 Join the hundreds of other players improving their swing
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-gray-400">© 2024 Swing Shop. All rights reserved.</p>
              <p className="text-gray-400 text-sm mt-2">A BatDigest.com Initiative</p>
            </div>
            <div className="flex gap-6">
              <Link to="/login" className="text-gray-400 hover:text-white">Login</Link>
              <Link to="/account" className="text-gray-400 hover:text-white">Account</Link>
              <a href="mailto:support@batdigest.com" className="text-gray-400 hover:text-white">Support</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}