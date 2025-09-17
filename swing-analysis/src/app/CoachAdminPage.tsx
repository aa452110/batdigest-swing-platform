import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface Coach {
  id: number;
  email: string;
  full_name: string;
  organization: string;
  invite_code: string;
  is_verified: number;
  subscription_tier: string;
  max_players: number;
  created_at: string;
}

export function CoachAdminPage() {
  const navigate = useNavigate();
  const [coaches, setCoaches] = useState<Coach[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');

  useEffect(() => {
    const isAuth = sessionStorage.getItem('adminAuth') === 'true';
    setIsAuthenticated(isAuth);
    if (isAuth) {
      fetchCoaches();
    } else {
      setLoading(false);
    }
  }, []);

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === 'coach500admin') {
      sessionStorage.setItem('adminAuth', 'true');
      setIsAuthenticated(true);
      fetchCoaches();
    } else {
      setError('Invalid password');
    }
  };

  const fetchCoaches = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE || 'https://swing-platform.brianduryea.workers.dev'}/api/admin/coaches`,
        {
          headers: {
            'X-Admin-Password': 'coach500admin'
          }
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch coaches');
      }

      const data = await response.json();
      setCoaches(data.coaches || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load coaches');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCoach = async (coachId: number, coachEmail: string) => {
    if (!confirm(`Are you sure you want to delete coach ${coachEmail}? This action cannot be undone.`)) {
      return;
    }

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE || 'https://swing-platform.brianduryea.workers.dev'}/api/admin/coach/${coachId}`,
        {
          method: 'DELETE',
          headers: {
            'X-Admin-Password': 'coach500admin'
          }
        }
      );

      if (!response.ok) {
        throw new Error('Failed to delete coach');
      }

      // Refresh the list
      await fetchCoaches();
      alert(`Coach ${coachEmail} has been deleted successfully.`);
    } catch (err) {
      alert(`Error deleting coach: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
          <h2 className="text-2xl font-bold mb-4">Admin Authentication</h2>
          {error && <p className="text-red-500 mb-4">{error}</p>}
          <form onSubmit={handlePasswordSubmit}>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter admin password"
              className="w-full px-3 py-2 border border-gray-300 rounded-md mb-4"
              autoFocus
            />
            <button
              type="submit"
              className="w-full bg-indigo-600 text-white py-2 rounded-md hover:bg-indigo-700"
            >
              Login
            </button>
          </form>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4">Loading coaches...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-600">Error: {error}</p>
            <button
              onClick={fetchCoaches}
              className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Coach Accounts</h1>
            <p className="text-gray-600 mt-1">Total: {coaches.length} coaches registered</p>
          </div>
          <button
            onClick={() => navigate('/admin/queue')}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
          >
            Back to Queue
          </button>
        </div>

        {coaches.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-gray-500 text-center">No coaches have signed up yet.</p>
          </div>
        ) : (
          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Organization
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Invite Code
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tier
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Joined
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {coaches.map((coach) => (
                  <tr key={coach.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {coach.full_name || 'Not provided'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{coach.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {coach.organization || 'Not provided'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 text-xs font-semibold bg-blue-100 text-blue-800 rounded">
                        {coach.invite_code}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {coach.is_verified ? (
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                          Verified
                        </span>
                      ) : (
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                          Unverified
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {coach.subscription_tier}
                      </div>
                      <div className="text-xs text-gray-500">
                        Max: {coach.max_players} players
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(coach.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <button
                        onClick={() => handleDeleteCoach(coach.id, coach.email)}
                        className="text-red-600 hover:text-red-900 font-medium"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="text-sm font-semibold text-blue-900 mb-2">Quick Stats</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-blue-800">
                Verified: {coaches.filter(c => c.is_verified).length}
              </p>
            </div>
            <div>
              <p className="text-sm text-blue-800">
                Unverified: {coaches.filter(c => !c.is_verified).length}
              </p>
            </div>
            <div>
              <p className="text-sm text-blue-800">
                Total: {coaches.length}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}