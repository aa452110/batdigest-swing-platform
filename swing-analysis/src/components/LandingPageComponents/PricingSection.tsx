import React from 'react';
import { Link } from 'react-router-dom';

export interface Plan {
  id: string;
  name: string;
  price: string;
  period: string;
  features: string[];
  popular?: boolean;
}

const PricingSection: React.FC<{ plans: Plan[] }> = ({ plans }) => {
  const trackPricingClick = (planId: string, planName: string) => {
    const sessionId = localStorage.getItem('analyticsSessionId') || 
      `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    console.log(`[Analytics] Pricing button clicked: ${planName}`, {
      planId,
      timestamp: new Date().toISOString()
    });
    
    fetch(`${import.meta.env.VITE_API_BASE || 'http://localhost:8787'}/api/analytics/track`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        event_type: 'pricing_click',
        page_path: '/',
        plan_id: planId,
        plan_name: planName,
        session_id: sessionId
      })
    }).catch(err => console.log('Analytics error:', err));
  };

  return (
  <section className="py-20 bg-gray-100" id="pricing">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <h2 className="text-4xl font-bold text-center mb-4 text-gray-900">Start Improving Today</h2>
      <p className="text-center text-gray-600 mb-3">Join with your coach's code or get matched with our pros</p>
      <p className="text-center text-gray-500 text-sm mb-12">Monthly subscriptions. Cancel anytime.</p>

      <div className="grid md:grid-cols-3 gap-8">
        {plans.map((plan) => (
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
            <Link 
              to={`/checkout?plan=${plan.id}`} 
              onClick={() => trackPricingClick(plan.id, plan.name)}
              className="block w-full bg-cyan-500 text-white text-center py-3 rounded-lg font-bold hover:bg-cyan-600 transition-colors"
            >
              Get Started
            </Link>
          </div>
        ))}
      </div>
    </div>
  </section>
  );
};

export default PricingSection;
