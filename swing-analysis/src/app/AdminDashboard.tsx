import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { SwingShopHeader } from '../components/SwingShopHeader';

interface User {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  plan_type: string;
  subscription_status: string;
  created_at: string;
  next_billing_date?: string;
  video_count?: number;
  analyzed_count?: number;
}

interface Stats {
  totalUsers: number;
  activeUsers: number;
  totalVideos: number;
  analyzedVideos: number;
}

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [users, setUsers] = useState<User[]>([]);
  const [stats, setStats] = useState<Stats>({
    totalUsers: 0,
    activeUsers: 0,
    totalVideos: 0,
    analyzedVideos: 0
  });
  const [loading, setLoading] = useState(true);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const response = await fetch('https://swing-platform.brianduryea.workers.dev/api/admin/users');
      const data = await response.json();
      setUsers(data.users);
      setStats(data.stats);
      setLoading(false);
    } catch (error) {
      console.error('Failed to load users:', error);
      setLoading(false);
    }
  };

  const formatDate = (dateStr: string | undefined) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString();
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
    setShowEditModal(true);
  };

  const handleSave = async () => {
    if (!editingUser) return;

    try {
      await fetch('https://swing-platform.brianduryea.workers.dev/api/admin/user/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: editingUser.id,
          firstName: editingUser.first_name,
          lastName: editingUser.last_name,
          planType: editingUser.plan_type,
          status: editingUser.subscription_status
        })
      });
      setShowEditModal(false);
      loadUsers();
    } catch (error) {
      alert('Failed to update user');
    }
  };

  const resendWelcomeEmail = async (userId: number) => {
    if (!confirm('Resend welcome email to this user?')) return;

    try {
      await fetch('https://swing-platform.brianduryea.workers.dev/api/admin/resend-welcome', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId })
      });
      alert('Welcome email sent!');
    } catch (error) {
      alert('Failed to send email');
    }
  };

  const deleteUser = async (userId: number, email: string) => {
    if (!confirm(`Delete user ${email}?\n\nThis will permanently remove the user and all their data. Are you sure?`)) return;

    try {
      const response = await fetch('https://swing-platform.brianduryea.workers.dev/api/admin/user/delete', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId })
      });
      
      if (response.ok) {
        alert('User deleted successfully');
        loadUsers();
      } else {
        alert('Failed to delete user');
      }
    } catch (error) {
      alert('Failed to delete user');
    }
  };

  const sendPasswordReset = async (userId: number, email: string) => {
    if (!confirm(`Send password reset email to ${email}?`)) return;

    try {
      const response = await fetch('https://swing-platform.brianduryea.workers.dev/api/admin/password-reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, email })
      });
      
      if (response.ok) {
        alert('Password reset email sent!');
      } else {
        alert('Failed to send reset email');
      }
    } catch (error) {
      alert('Failed to send reset email');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600">Loading admin dashboard...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <SwingShopHeader />
      
      {/* Admin Navigation Bar */}
      <nav className="bg-teal-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-6">
              <button
                onClick={() => navigate('/admin')}
                className="text-cyan-300 font-semibold"
              >
                Admin Dashboard
              </button>
              <button
                onClick={() => navigate('/admin/queue')}
                className="hover:text-cyan-300"
              >
                Video Queue
              </button>
            </div>
          </div>
        </div>
      </nav>
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">

          {/* Stats */}
          <div className="p-6 bg-gray-50 border-b">
            <div className="grid grid-cols-4 gap-4 mb-4">
              <div className="bg-white p-4 rounded-lg shadow">
                <div className="text-3xl font-bold text-gray-700">{stats.totalUsers}</div>
                <div className="text-sm text-gray-500">Total Users</div>
              </div>
              <div className="bg-white p-4 rounded-lg shadow">
                <div className="text-3xl font-bold text-gray-700">{stats.activeUsers}</div>
                <div className="text-sm text-gray-500">Active Subscriptions</div>
              </div>
              <div className="bg-white p-4 rounded-lg shadow">
                <div className="text-3xl font-bold text-gray-700">{stats.totalVideos}</div>
                <div className="text-sm text-gray-500">Videos Submitted</div>
              </div>
              <div className="bg-white p-4 rounded-lg shadow">
                <div className="text-3xl font-bold text-gray-700">{stats.analyzedVideos}</div>
                <div className="text-sm text-gray-500">Videos Analyzed</div>
              </div>
            </div>
            
            {/* Single Queue Button */}
            <div className="flex justify-center">
              <button
                onClick={() => navigate('/admin/queue')}
                className="px-6 py-3 bg-cyan-600 text-white font-semibold rounded-lg hover:bg-cyan-700 transition-colors flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                </svg>
                View Submission Queue
              </button>
            </div>
          </div>

          {/* Users Table */}
          <div className="p-6">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-gray-200">
                  <th className="text-left p-3 text-sm font-semibold text-gray-600">ID</th>
                  <th className="text-left p-3 text-sm font-semibold text-gray-600">Email</th>
                  <th className="text-left p-3 text-sm font-semibold text-gray-600">Name</th>
                  <th className="text-left p-3 text-sm font-semibold text-gray-600">Plan</th>
                  <th className="text-left p-3 text-sm font-semibold text-gray-600">Status</th>
                  <th className="text-left p-3 text-sm font-semibold text-gray-600">Joined</th>
                  <th className="text-left p-3 text-sm font-semibold text-gray-600">Next Billing</th>
                  <th className="text-left p-3 text-sm font-semibold text-gray-600">Videos</th>
                  <th className="text-left p-3 text-sm font-semibold text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map(user => (
                  <tr key={user.id} className="border-b hover:bg-gray-50">
                    <td className="p-3 text-sm">{user.id}</td>
                    <td className="p-3 text-sm">{user.email}</td>
                    <td className="p-3 text-sm">{user.first_name} {user.last_name}</td>
                    <td className="p-3">
                      <span className={`px-2 py-1 text-xs rounded font-semibold ${
                        user.plan_type === 'sixmonth' ? 'bg-orange-100 text-orange-800' :
                        user.plan_type === 'performance' ? 'bg-blue-100 text-blue-800' :
                        'bg-purple-100 text-purple-800'
                      }`}>
                        {user.plan_type}
                      </span>
                    </td>
                    <td className="p-3">
                      <span className={`px-2 py-1 text-xs rounded font-semibold ${
                        user.subscription_status === 'active' ? 'bg-green-100 text-green-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {user.subscription_status}
                      </span>
                    </td>
                    <td className="p-3 text-sm">{formatDate(user.created_at)}</td>
                    <td className="p-3 text-sm">{formatDate(user.next_billing_date)}</td>
                    <td className="p-3 text-sm">{user.video_count || 0} / {user.analyzed_count || 0}</td>
                    <td className="p-3">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(user)}
                          className="px-3 py-1 bg-indigo-600 text-white text-xs rounded hover:bg-indigo-700"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => resendWelcomeEmail(user.id)}
                          className="px-3 py-1 bg-gray-600 text-white text-xs rounded hover:bg-gray-700"
                        >
                          Email
                        </button>
                        <button
                          onClick={() => sendPasswordReset(user.id, user.email)}
                          className="px-3 py-1 bg-yellow-600 text-white text-xs rounded hover:bg-yellow-700"
                        >
                          Reset
                        </button>
                        <button
                          onClick={() => deleteUser(user.id, user.email)}
                          className="px-3 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      {showEditModal && editingUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Edit User</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Email</label>
                <input
                  type="email"
                  value={editingUser.email}
                  disabled
                  className="w-full px-3 py-2 border rounded bg-gray-100"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">First Name</label>
                <input
                  type="text"
                  value={editingUser.first_name}
                  onChange={(e) => setEditingUser({...editingUser, first_name: e.target.value})}
                  className="w-full px-3 py-2 border rounded"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Last Name</label>
                <input
                  type="text"
                  value={editingUser.last_name}
                  onChange={(e) => setEditingUser({...editingUser, last_name: e.target.value})}
                  className="w-full px-3 py-2 border rounded"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Plan Type</label>
                <select
                  value={editingUser.plan_type}
                  onChange={(e) => setEditingUser({...editingUser, plan_type: e.target.value})}
                  className="w-full px-3 py-2 border rounded"
                >
                  <option value="starter">Starter</option>
                  <option value="performance">Performance</option>
                  <option value="sixmonth">Six Month</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Status</label>
                <select
                  value={editingUser.subscription_status}
                  onChange={(e) => setEditingUser({...editingUser, subscription_status: e.target.value})}
                  className="w-full px-3 py-2 border rounded"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
            </div>
            
            <div className="flex gap-2 mt-6">
              <button
                onClick={handleSave}
                className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
              >
                Save Changes
              </button>
              <button
                onClick={() => setShowEditModal(false)}
                className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}