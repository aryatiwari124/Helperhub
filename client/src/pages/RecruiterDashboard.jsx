import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, Plus, MapPin, Calendar, Clock, DollarSign, Filter, CheckCircle, AlertCircle } from 'lucide-react';
import api from '../services/api';
import HelperCard from '../components/helper/HelperCard';
import HireModal from '../components/helper/HireModal';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function RecruiterDashboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('browse'); // 'browse' | 'my-jobs' | 'bookings'
  const [helpers, setHelpers] = useState([]);
  const [myJobs, setMyJobs] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchCategory, setSearchCategory] = useState('');
  const [searchCity, setSearchCity] = useState('');

  // Modals
  const [selectedHelper, setSelectedHelper] = useState(null);
  const [showPostJob, setShowPostJob] = useState(false);

  // Post job form
  const [jobForm, setJobForm] = useState({ title: '', category: 'Plumber', description: '', location: '', budget: '', preferredDate: '' });
  const [posting, setPosting] = useState(false);

  const categories = ['Plumber', 'Electrician', 'Carpenter', 'AC Technician', 'Painter', 'Cleaner', 'Mechanic', 'Gardener'];

  const loadData = async () => {
    setLoading(true);
    try {
      const [hRes, jRes, bRes] = await Promise.all([
        api.get(`/jobseeker/search?category=${encodeURIComponent(searchCategory)}&city=${encodeURIComponent(searchCity)}`),
        api.get('/jobpost/my'),
        api.get('/hire/recruiter'),
      ]);
      setHelpers(hRes.data.profiles || []);
      setMyJobs(jRes.data.jobs || []);
      setBookings(bRes.data.requests || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [searchCategory, searchCity]);

  const handlePostJob = async (e) => {
    e.preventDefault();
    if (!jobForm.title || !jobForm.description || !jobForm.location) {
      toast.error('Please fill required fields');
      return;
    }
    setPosting(true);
    try {
      await api.post('/jobpost', {
        ...jobForm,
        budget: Number(jobForm.budget) || undefined,
      });
      toast.success('Job requirement posted!');
      setShowPostJob(false);
      setJobForm({ title: '', category: 'Plumber', description: '', location: '', budget: '', preferredDate: '' });
      loadData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to post job');
    } finally {
      setPosting(false);
    }
  };

  return (
    <div className="container" style={{ paddingTop: 'var(--space-8)', paddingBottom: 'var(--space-16)' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-8)', flexWrap: 'wrap', gap: 'var(--space-4)' }}>
        <div>
          <h1 className="headline-lg">Recruiter Dashboard</h1>
          <p className="text-secondary" style={{ marginTop: 4 }}>Welcome back, {user?.name}! Manage your hires and job posts.</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowPostJob(true)}>
          <Plus size={18} /> Post a Requirement
        </button>
      </div>

      {/* Navigation Tabs */}
      <div className="tabs" style={{ marginBottom: 'var(--space-8)' }}>
        <button className={`tab ${activeTab === 'browse' ? 'active' : ''}`} onClick={() => setActiveTab('browse')}>
          Browse Helpers ({helpers.length})
        </button>
        <button className={`tab ${activeTab === 'my-jobs' ? 'active' : ''}`} onClick={() => setActiveTab('my-jobs')}>
          My Job Posts ({myJobs.length})
        </button>
        <button className={`tab ${activeTab === 'bookings' ? 'active' : ''}`} onClick={() => setActiveTab('bookings')}>
          My Bookings ({bookings.length})
        </button>
      </div>

      {/* TAB 1: BROWSE HELPERS */}
      {activeTab === 'browse' && (
        <div>
          {/* Filters Bar */}
          <div className="card" style={{ padding: 'var(--space-4)', marginBottom: 'var(--space-6)', display: 'flex', gap: 'var(--space-4)', flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: 200 }}>
              <select className="form-select" value={searchCategory} onChange={e => setSearchCategory(e.target.value)}>
                <option value="">All Categories</option>
                {categories.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div style={{ flex: 1, minWidth: 200 }}>
              <input
                className="form-input"
                placeholder="Search by city (e.g. Mumbai)"
                value={searchCity}
                onChange={e => setSearchCity(e.target.value)}
              />
            </div>
            {(searchCategory || searchCity) && (
              <button className="btn btn-ghost" onClick={() => { setSearchCategory(''); setSearchCity(''); }}>
                Clear Filters
              </button>
            )}
          </div>

          {loading ? (
            <div className="helpers-grid">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="card skeleton" style={{ height: 280 }} />
              ))}
            </div>
          ) : helpers.length > 0 ? (
            <div className="helpers-grid">
              {helpers.map(p => (
                <HelperCard key={p._id} profile={p} onHire={hp => setSelectedHelper(hp)} />
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <div className="empty-state-icon">🔍</div>
              <p className="empty-state-title">No helpers found</p>
              <p className="empty-state-text">Try adjusting your category or city filters.</p>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: MY JOB POSTS */}
      {activeTab === 'my-jobs' && (
        <div>
          {myJobs.length > 0 ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 'var(--space-6)' }}>
              {myJobs.map(job => (
                <div key={job._id} className="card card-body" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <span className="badge badge-primary">{job.category}</span>
                    <span className={`badge status-${job.status}`}>{job.status}</span>
                  </div>
                  <h3 style={{ fontSize: '18px', fontWeight: 700 }}>{job.title}</h3>
                  <p className="body-sm text-secondary" style={{ display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {job.description}
                  </p>
                  <div style={{ display: 'flex', gap: 'var(--space-4)', fontSize: '13px', color: 'var(--color-outline)' }}>
                    <span>📍 {job.location}</span>
                    {job.budget && <span>₹{job.budget}</span>}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <div className="empty-state-icon">📋</div>
              <p className="empty-state-title">No job posts created yet</p>
              <button className="btn btn-primary mt-4" onClick={() => setShowPostJob(true)}>Post a Requirement</button>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: MY BOOKINGS */}
      {activeTab === 'bookings' && (
        <div>
          {bookings.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
              {bookings.map(req => (
                <div key={req._id} className="card card-body" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 'var(--space-4)' }}>
                  <div style={{ display: 'flex', gap: 'var(--space-4)', alignItems: 'center' }}>
                    <div className="avatar-placeholder avatar-lg">{req.helperId?.name?.[0]}</div>
                    <div>
                      <h3 style={{ fontSize: '17px', fontWeight: 700 }}>{req.jobTitle || 'Direct Booking'}</h3>
                      <p className="text-sm text-secondary">Helper: <strong>{req.helperId?.name}</strong> ({req.helperId?.email})</p>
                      <p className="text-xs text-muted" style={{ marginTop: 4 }}>📍 {req.jobLocation} · ₹{req.agreedAmount}</p>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
                    <span className={`badge status-${req.status}`} style={{ fontSize: '13px', padding: '6px 14px' }}>
                      {req.status}
                    </span>
                    <Link to={`/job/${req._id}`} className="btn btn-outline btn-sm">View Details & Status</Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <div className="empty-state-icon">🤝</div>
              <p className="empty-state-title">No active or past bookings</p>
              <p className="empty-state-text">Browse helpers to initiate a hire request!</p>
            </div>
          )}
        </div>
      )}

      {/* HIRE MODAL */}
      {selectedHelper && (
        <HireModal
          helper={selectedHelper.userId}
          profile={selectedHelper}
          onClose={() => setSelectedHelper(null)}
          onSuccess={loadData}
        />
      )}

      {/* POST A JOB MODAL */}
      {showPostJob && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowPostJob(false)}>
          <div className="modal">
            <div className="modal-header">
              <h2 style={{ fontSize: '18px', fontWeight: 700 }}>Post a Job Requirement</h2>
              <button className="btn btn-ghost btn-icon" onClick={() => setShowPostJob(false)}>✕</button>
            </div>
            <form onSubmit={handlePostJob}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                <div className="form-group">
                  <label className="form-label">Title *</label>
                  <input
                    className="form-input"
                    placeholder="e.g. Require Electrician for MCB Tripping Issue"
                    value={jobForm.title}
                    onChange={e => setJobForm({ ...jobForm, title: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Category *</label>
                  <select className="form-select" value={jobForm.category} onChange={e => setJobForm({ ...jobForm, category: e.target.value })}>
                    {categories.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Description *</label>
                  <textarea
                    className="form-textarea"
                    rows={3}
                    placeholder="Explain the work required..."
                    value={jobForm.description}
                    onChange={e => setJobForm({ ...jobForm, description: e.target.value })}
                  />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
                  <div className="form-group">
                    <label className="form-label">Location *</label>
                    <input className="form-input" placeholder="City / Area" value={jobForm.location} onChange={e => setJobForm({ ...jobForm, location: e.target.value })} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Budget (₹)</label>
                    <input className="form-input" type="number" placeholder="Estimated budget" value={jobForm.budget} onChange={e => setJobForm({ ...jobForm, budget: e.target.value })} />
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-ghost" onClick={() => setShowPostJob(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={posting}>
                  {posting ? 'Posting...' : 'Publish Job Post'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
