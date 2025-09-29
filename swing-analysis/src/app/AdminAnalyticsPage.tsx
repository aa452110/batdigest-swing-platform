import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_BASE } from '../services/api';

interface AnalyticsSummary {
  totalHomepageViews: number;
  totalViews: number;
  totalConversions: number;
  conversionRate: number;
  checkoutClickRate: number;
  homepage_views_today: number;
  checkout_views_today: number;
  conversions_today: number;
  unique_visitors_today: number;
}

interface DailyStat {
  date: string;
  homepage_views: number;
  checkout_views: number;
  begin_checkouts: number;
  checkout_progress: number;
  unique_sessions: number;
}

interface PlanBreakdown {
  plan_id: string;
  plan_name: string;
  views: number;
  conversions: number;
}

interface RecentEvent {
  event_type: string;
  plan_name: string;
  user_email: string;
  created_at: string;
}

export function AdminAnalyticsPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null);
  const [dailyStats, setDailyStats] = useState<DailyStat[]>([]);
  const [planBreakdown, setPlanBreakdown] = useState<PlanBreakdown[]>([]);
  const [recentEvents, setRecentEvents] = useState<RecentEvent[]>([]);
  const [days, setDays] = useState(7);
  const [error, setError] = useState('');
  const [password, setPassword] = useState('');
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    const savedPassword = localStorage.getItem('adminPassword');
    if (savedPassword === 'coach500admin') {
      setAuthenticated(true);
      loadAnalytics();
    }
  }, [days]);

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === 'coach500admin') {
      localStorage.setItem('adminPassword', password);
      setAuthenticated(true);
      loadAnalytics();
    } else {
      setError('Invalid password');
    }
  };

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE}/api/analytics/dashboard?days=${days}`, {
        headers: {
          'X-Admin-Password': 'coach500admin'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to load analytics');
      }

      const data = await response.json();
      setSummary(data.summary);
      setDailyStats(data.dailyStats || []);
      setPlanBreakdown(data.planBreakdown || []);
      setRecentEvents(data.recentEvents || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!authenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <form onSubmit={handlePasswordSubmit} className="bg-white p-8 rounded-lg shadow-lg w-96">
          <h2 className="text-2xl font-bold mb-4">Admin Access Required</h2>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter admin password"
            className="w-full px-4 py-2 border rounded mb-4"
          />
          {error && <div className="text-red-600 mb-4">{error}</div>}
          <button
            type="submit"
            className="w-full bg-teal-600 text-white py-2 rounded hover:bg-teal-700"
          >
            Access Analytics
          </button>
        </form>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600">Loading analytics...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-teal-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <h1 className="text-xl font-bold">Analytics Dashboard</h1>
            <div className="flex items-center space-x-4">
              <select
                value={days}
                onChange={(e) => setDays(Number(e.target.value))}
                className="bg-teal-800 text-white px-3 py-1 rounded"
              >
                <option value={1}>Last 24 hours</option>
                <option value={7}>Last 7 days</option>
                <option value={14}>Last 14 days</option>
                <option value={30}>Last 30 days</option>
                <option value={90}>Last 90 days</option>
              </select>
              <button
                onClick={() => navigate('/admin/queue')}
                className="hover:text-cyan-300"
              >
                Video Queue
              </button>
              <button
                onClick={() => navigate('/admin')}
                className="hover:text-cyan-300"
              >
                Admin Dashboard
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="text-3xl font-bold text-gray-800">
              {summary?.totalHomepageViews || 0}
            </div>
            <div className="text-sm text-gray-500">Homepage Visits</div>
            <div className="text-xs text-gray-400 mt-1">
              Today: {summary?.homepage_views_today || 0}
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="text-3xl font-bold text-gray-800">
              {summary?.totalViews || 0}
            </div>
            <div className="text-sm text-gray-500">Checkout Views</div>
            <div className="text-xs text-gray-400 mt-1">
              Today: {summary?.checkout_views_today || 0}
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="text-3xl font-bold text-gray-800">
              {summary?.totalConversions || 0}
            </div>
            <div className="text-sm text-gray-500">Proceeded to Payment</div>
            <div className="text-xs text-gray-400 mt-1">
              Today: {summary?.conversions_today || 0}
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="text-3xl font-bold text-gray-800">
              {summary?.checkoutClickRate || 0}%
            </div>
            <div className="text-sm text-gray-500">Homepage → Checkout</div>
            <div className="text-xs text-gray-400 mt-1">
              Click-through rate
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="text-3xl font-bold text-gray-800">
              {summary?.unique_visitors_today || 0}
            </div>
            <div className="text-sm text-gray-500">Unique Today</div>
            <div className="text-xs text-gray-400 mt-1">
              Unique sessions
            </div>
          </div>
        </div>

        {/* Plan Breakdown */}
        <div className="bg-white rounded-lg shadow mb-8">
          <div className="p-6 border-b">
            <h2 className="text-lg font-semibold">Plan Performance</h2>
          </div>
          <div className="p-6">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left pb-2">Plan</th>
                  <th className="text-right pb-2">Views</th>
                  <th className="text-right pb-2">Conversions</th>
                  <th className="text-right pb-2">Rate</th>
                </tr>
              </thead>
              <tbody>
                {planBreakdown.map((plan) => (
                  <tr key={plan.plan_id} className="border-b">
                    <td className="py-2">{plan.plan_name || plan.plan_id}</td>
                    <td className="text-right">{plan.views}</td>
                    <td className="text-right">{plan.conversions}</td>
                    <td className="text-right">
                      {plan.views > 0 
                        ? `${((plan.conversions / plan.views) * 100).toFixed(1)}%`
                        : '0%'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Daily Stats */}
        <div className="bg-white rounded-lg shadow mb-8">
          <div className="p-6 border-b">
            <h2 className="text-lg font-semibold">Daily Breakdown</h2>
          </div>
          <div className="p-6">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left pb-2">Date</th>
                  <th className="text-right pb-2">Homepage</th>
                  <th className="text-right pb-2">Checkout Page</th>
                  <th className="text-right pb-2">Started Form</th>
                  <th className="text-right pb-2">To Stripe</th>
                  <th className="text-right pb-2">CTR</th>
                </tr>
              </thead>
              <tbody>
                {dailyStats.map((stat) => (
                  <tr key={stat.date} className="border-b">
                    <td className="py-2">{new Date(stat.date).toLocaleDateString()}</td>
                    <td className="text-right">{stat.homepage_views || 0}</td>
                    <td className="text-right">{stat.checkout_views}</td>
                    <td className="text-right">{stat.begin_checkouts}</td>
                    <td className="text-right">{stat.checkout_progress}</td>
                    <td className="text-right">
                      {stat.homepage_views > 0 
                        ? `${((stat.checkout_views / stat.homepage_views) * 100).toFixed(1)}%`
                        : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Events */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b">
            <h2 className="text-lg font-semibold">Recent Activity</h2>
          </div>
          <div className="p-6">
            <div className="space-y-2">
              {recentEvents.map((event, idx) => (
                <div key={idx} className="flex items-center justify-between py-2 border-b">
                  <div>
                    <span className={`px-2 py-1 text-xs rounded ${
                      event.event_type === 'checkout_progress' 
                        ? 'bg-green-100 text-green-800'
                        : event.event_type === 'begin_checkout'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {event.event_type}
                    </span>
                    <span className="ml-2 text-sm">{event.plan_name}</span>
                    {event.user_email && (
                      <span className="ml-2 text-xs text-gray-500">{event.user_email}</span>
                    )}
                  </div>
                  <div className="text-xs text-gray-400">
                    {new Date(event.created_at).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}