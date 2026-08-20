import { useState, useEffect } from 'react';
import { Users, Briefcase, Tag, ShieldCheck, Plus, Trash2, CheckCircle2 } from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [categories, setCategories] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);

  // New category form
  const [newCat, setNewCat] = useState({ name: '', icon: '🔧', description: '' });

  const loadAdminData = async () => {
    setLoading(true);
    try {
      const [sRes, uRes, cRes, jRes] = await Promise.allSettled([
        api.get('/admin/stats'),
        api.get('/admin/users'),
        api.get('/admin/categories'),
        api.get('/admin/jobs'),
      ]);
      if (sRes.status === 'fulfilled') setStats(sRes.value.data.stats);
      if (uRes.status === 'fulfilled') setUsers(uRes.value.data.users || []);
      if (cRes.status === 'fulfilled') setCategories(cRes.value.data.categories || []);
      if (jRes.status === 'fulfilled') setJobs(jRes.value.data.jobs || []);
    } catch (err) {
      console.error('Failed to load admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadAdminData(); }, []);

  const handleAddCategory = async (e) => {
    e.preventDefault();
    if (!newCat.name) return;
    try {
      await api.post('/admin/categories', newCat);
      toast.success('Category added!');
      setNewCat({ name: '', icon: '🔧', description: '' });
      loadAdminData();
    } catch (err) {
      toast.error('Failed to add category');
    }
  };

  const handleToggleCategory = async (id) => {
    try {
      await api.patch(`/admin/categories/${id}/toggle`);
      toast.success('Category updated');
      loadAdminData();
    } catch (err) {
      toast.error('Action failed');
    }
  };

  const handleDeleteCategory = async (id) => {
    try {
      await api.delete(`/admin/categories/${id}`);
      toast.success('Category deleted');
      loadAdminData();
    } catch (err) {
      toast.error('Action failed');
    }
  };

  const handleVerifyHelper = async (userId) => {
    try {
      await api.patch(`/admin/helpers/${userId}/verify`);
      toast.success('Helper marked as verified!');
      loadAdminData();
    } catch (err) {
      toast.error('Failed to verify helper');
    }
  };

  return (
    <div className="container" style={{ paddingTop: 'var(--space-8)', paddingBottom: 'var(--space-16)' }}>
      <h1 className="headline-lg" style={{ marginBottom: 'var(--space-2)' }}>Admin Control Panel</h1>
      <p className="text-secondary" style={{ marginBottom: 'var(--space-8)' }}>Manage platform users, categories, and view global statistics.</p>

      {/* Stats Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--space-4)', marginBottom: 'var(--space-8)' }}>
        <div className="card card-body">
          <div className="text-xs text-muted">TOTAL USERS</div>
          <div style={{ fontSize: '28px', fontWeight: 800, margin: '6px 0' }}>{stats?.totalUsers || 0}</div>
        </div>
        <div className="card card-body">
          <div className="text-xs text-muted">JOB POSTS</div>
          <div style={{ fontSize: '28px', fontWeight: 800, margin: '6px 0', color: 'var(--color-primary)' }}>{stats?.totalJobs || 0}</div>
        </div>
        <div className="card card-body">
          <div className="text-xs text-muted">HIRE REQUESTS</div>
          <div style={{ fontSize: '28px', fontWeight: 800, margin: '6px 0', color: 'var(--color-success)' }}>{stats?.totalHires || 0}</div>
        </div>
        <div className="card card-body">
          <div className="text-xs text-muted">SERVICE CATEGORIES</div>
          <div style={{ fontSize: '28px', fontWeight: 800, margin: '6px 0' }}>{stats?.totalCategories || 0}</div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="tabs" style={{ marginBottom: 'var(--space-8)' }}>
        <button className={`tab ${activeTab === 'overview' ? 'active' : ''}`} onClick={() => setActiveTab('overview')}>
          Users Directory ({users.length})
        </button>
        <button className={`tab ${activeTab === 'categories' ? 'active' : ''}`} onClick={() => setActiveTab('categories')}>
          Category Management ({categories.length})
        </button>
        <button className={`tab ${activeTab === 'jobs' ? 'active' : ''}`} onClick={() => setActiveTab('jobs')}>
          Platform Job Posts ({jobs.length})
        </button>
      </div>

      {/* TAB 1: USERS */}
      {activeTab === 'overview' && (
        <div className="card card-body">
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid var(--color-surface-container-high)', color: 'var(--color-outline)' }}>
                <th style={{ padding: '12px' }}>User</th>
                <th style={{ padding: '12px' }}>Role</th>
                <th style={{ padding: '12px' }}>Verified</th>
                <th style={{ padding: '12px' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u._id} style={{ borderBottom: '1px solid var(--color-surface-container-high)' }}>
                  <td style={{ padding: '12px' }}>
                    <div style={{ fontWeight: 600 }}>{u.name}</div>
                    <div className="text-xs text-muted">{u.email}</div>
                  </td>
                  <td style={{ padding: '12px' }}>
                    <span className={`badge ${u.role === 'admin' ? 'badge-warning' : u.role === 'recruiter' ? 'badge-primary' : 'badge-neutral'}`}>
                      {u.role}
                    </span>
                  </td>
                  <td style={{ padding: '12px' }}>{u.isVerified ? '✅ Yes' : '❌ No'}</td>
                  <td style={{ padding: '12px' }}>
                    {u.role === 'jobseeker' && (
                      <button className="btn btn-outline btn-sm" onClick={() => handleVerifyHelper(u._id)}>
                        Verify Helper
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* TAB 2: CATEGORIES */}
      {activeTab === 'categories' && (
        <div>
          <div className="card card-body" style={{ marginBottom: 'var(--space-6)', maxWidth: 500 }}>
            <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: 'var(--space-4)' }}>Add New Category</h3>
            <form onSubmit={handleAddCategory} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
              <input className="form-input" placeholder="Category Name (e.g. Electrician)" value={newCat.name} onChange={e => setNewCat({ ...newCat, name: e.target.value })} />
              <input className="form-input" placeholder="Emoji Icon (e.g. ⚡)" value={newCat.icon} onChange={e => setNewCat({ ...newCat, icon: e.target.value })} />
              <button type="submit" className="btn btn-primary btn-sm"><Plus size={16} /> Add Category</button>
            </form>
          </div>

          <div className="card card-body">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 'var(--space-4)' }}>
              {categories.map(cat => (
                <div key={cat._id} style={{ border: '1px solid var(--color-outline-variant)', borderRadius: 'var(--radius-sm)', padding: 'var(--space-4)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ fontSize: 24 }}>{cat.icon}</span>
                    <span style={{ fontWeight: 600 }}>{cat.name}</span>
                  </div>
                  <button className="btn btn-ghost btn-icon text-error" onClick={() => handleDeleteCategory(cat._id)}>
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: JOBS */}
      {activeTab === 'jobs' && (
        <div className="card card-body">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
            {jobs.map(j => (
              <div key={j._id} style={{ borderBottom: '1px solid var(--color-surface-container-high)', paddingBottom: 'var(--space-3)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h4 style={{ fontWeight: 700 }}>{j.title}</h4>
                  <p className="text-xs text-muted">{j.category} · Recruiter: {j.recruiterId?.name} ({j.recruiterId?.email})</p>
                </div>
                <span className={`badge status-${j.status}`}>{j.status}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
