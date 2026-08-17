import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { User, Briefcase, DollarSign, Star, CheckCircle, Clock, MapPin, Edit3, Save } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function JobSeekerDashboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('requests'); // 'requests' | 'nearby' | 'profile'
  const [profile, setProfile] = useState(null);
  const [requests, setRequests] = useState([]);
  const [openJobs, setOpenJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  // Edit profile state
  const [editMode, setEditMode] = useState(false);
  const [profileForm, setProfileForm] = useState({
    category: [],
    bio: '',
    city: '',
    rate: '',
    rateType: 'hourly',
    availability: '',
    yearsExperience: '',
  });

  const categories = ['Plumber', 'Electrician', 'Carpenter', 'AC Technician', 'Painter', 'Cleaner', 'Mechanic', 'Gardener'];

  const loadData = async () => {
    setLoading(true);
    try {
      const [pRes, rRes, jRes] = await Promise.all([
        api.get('/jobseeker/profile/me'),
        api.get('/hire/helper'),
        api.get('/jobpost'),
      ]);
      const p = pRes.data.profile;
      setProfile(p);
      if (p) {
        setProfileForm({
          category: p.category || [],
          bio: p.bio || '',
          city: p.city || '',
          rate: p.rate || '',
          rateType: p.rateType || 'hourly',
          availability: p.availability || '',
          yearsExperience: p.yearsExperience || '',
        });
      } else {
        setEditMode(true);
      }
      setRequests(rRes.data.requests || []);
      setOpenJobs(jRes.data.jobs || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    try {
      await api.put('/jobseeker/profile', {
        ...profileForm,
        rate: Number(profileForm.rate),
        yearsExperience: Number(profileForm.yearsExperience),
      });
      toast.success('Profile updated successfully!');
      setEditMode(false);
      loadData();
    } catch (err) {
      toast.error('Failed to update profile');
    }
  };

  const handleRespond = async (requestId, action) => {
    try {
      await api.patch(`/hire/${requestId}/respond`, { action });
      toast.success(`Request ${action}!`);
      loadData();
    } catch (err) {
      toast.error('Action failed');
    }
  };

  const toggleCategory = (cat) => {
    setProfileForm(prev => {
      const exists = prev.category.includes(cat);
      return {
        ...prev,
        category: exists ? prev.category.filter(c => c !== cat) : [...prev.category, cat],
      };
    });
  };

  return (
    <div className="container" style={{ paddingTop: 'var(--space-8)', paddingBottom: 'var(--space-16)' }}>
      {/* Overview Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 'var(--space-4)', marginBottom: 'var(--space-8)' }}>
        <div className="card card-body" style={{ background: 'linear-gradient(135deg, #003d9b 0%, #0052cc 100%)', color: 'white' }}>
          <div style={{ fontSize: '13px', opacity: 0.8 }}>Total Earnings</div>
          <div style={{ fontSize: '28px', fontWeight: 800, margin: '8px 0' }}>₹{profile?.totalEarnings?.toLocaleString() || 0}</div>
          <div style={{ fontSize: '12px', opacity: 0.8 }}>Held & Released payments</div>
        </div>
        <div className="card card-body">
          <div style={{ fontSize: '13px', color: 'var(--color-outline)' }}>Average Rating</div>
          <div style={{ fontSize: '28px', fontWeight: 800, margin: '8px 0', color: '#f59e0b' }}>★ {profile?.avgRating || '0.0'}</div>
          <div style={{ fontSize: '12px', color: 'var(--color-outline)' }}>From {profile?.totalJobs || 0} completed jobs</div>
        </div>
        <div className="card card-body">
          <div style={{ fontSize: '13px', color: 'var(--color-outline)' }}>Completed Jobs</div>
          <div style={{ fontSize: '28px', fontWeight: 800, margin: '8px 0', color: 'var(--color-success)' }}>{profile?.totalJobs || 0}</div>
          <div style={{ fontSize: '12px', color: 'var(--color-outline)' }}>Jobs confirmed by recruiters</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="tabs" style={{ marginBottom: 'var(--space-8)' }}>
        <button className={`tab ${activeTab === 'requests' ? 'active' : ''}`} onClick={() => setActiveTab('requests')}>
          Incoming Job Requests ({requests.length})
        </button>
        <button className={`tab ${activeTab === 'nearby' ? 'active' : ''}`} onClick={() => setActiveTab('nearby')}>
          Open Jobs Nearby ({openJobs.length})
        </button>
        <button className={`tab ${activeTab === 'profile' ? 'active' : ''}`} onClick={() => setActiveTab('profile')}>
          My Helper Profile
        </button>
      </div>

      {/* TAB 1: INCOMING REQUESTS */}
      {activeTab === 'requests' && (
        <div>
          {requests.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
              {requests.map(req => (
                <div key={req._id} className="card card-body" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 'var(--space-4)' }}>
                  <div style={{ display: 'flex', gap: 'var(--space-4)', alignItems: 'center' }}>
                    <div className="avatar-placeholder avatar-lg">{req.recruiterId?.name?.[0]}</div>
                    <div>
                      <h3 style={{ fontSize: '17px', fontWeight: 700 }}>{req.jobTitle || 'Direct Hire'}</h3>
                      <p className="text-sm text-secondary">Recruiter: <strong>{req.recruiterId?.name}</strong> ({req.recruiterId?.email})</p>
                      <p className="text-xs text-muted" style={{ marginTop: 4 }}>📍 {req.jobLocation} · ₹{req.agreedAmount}</p>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                    {req.status === 'pending' ? (
                      <>
                        <button className="btn btn-success btn-sm" onClick={() => handleRespond(req._id, 'accepted')}>Accept</button>
                        <button className="btn btn-danger btn-sm" onClick={() => handleRespond(req._id, 'declined')}>Decline</button>
                      </>
                    ) : (
                      <span className={`badge status-${req.status}`} style={{ fontSize: '13px', padding: '6px 14px' }}>
                        {req.status}
                      </span>
                    )}
                    <Link to={`/job/${req._id}`} className="btn btn-outline btn-sm">View Status</Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <div className="empty-state-icon">📥</div>
              <p className="empty-state-title">No incoming job requests yet</p>
              <p className="empty-state-text">Ensure your profile is complete so recruiters can discover and hire you!</p>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: OPEN JOBS NEARBY */}
      {activeTab === 'nearby' && (
        <div>
          {openJobs.length > 0 ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 'var(--space-6)' }}>
              {openJobs.map(job => (
                <div key={job._id} className="card card-body" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span className="badge badge-primary">{job.category}</span>
                    <span style={{ fontWeight: 700, color: 'var(--color-primary)' }}>₹{job.budget}</span>
                  </div>
                  <h3 style={{ fontSize: '18px', fontWeight: 700 }}>{job.title}</h3>
                  <p className="body-sm text-secondary">{job.description}</p>
                  <div className="text-xs text-muted">📍 {job.location} · Recruiter: {job.recruiterId?.name}</div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <div className="empty-state-icon">🔍</div>
              <p className="empty-state-title">No open jobs right now</p>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: MY HELPER PROFILE */}
      {activeTab === 'profile' && (
        <div className="card card-body" style={{ maxWidth: 700, margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-6)' }}>
            <h2 style={{ fontSize: '20px', fontWeight: 700 }}>Helper Profile Details</h2>
            {!editMode ? (
              <button className="btn btn-outline btn-sm" onClick={() => setEditMode(true)}>
                <Edit3 size={15} /> Edit Profile
              </button>
            ) : (
              <button className="btn btn-ghost btn-sm" onClick={() => setEditMode(false)}>Cancel</button>
            )}
          </div>

          <form onSubmit={handleSaveProfile} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
            <div className="form-group">
              <label className="form-label">Service Categories</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-2)' }}>
                {categories.map(cat => {
                  const selected = profileForm.category.includes(cat);
                  return (
                    <button
                      key={cat}
                      type="button"
                      disabled={!editMode}
                      className={`badge ${selected ? 'badge-primary' : 'badge-neutral'}`}
                      style={{ padding: '8px 16px', fontSize: '13px', cursor: editMode ? 'pointer' : 'default' }}
                      onClick={() => editMode && toggleCategory(cat)}
                    >
                      {cat} {selected && '✓'}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Bio / Overview</label>
              <textarea
                className="form-textarea"
                disabled={!editMode}
                rows={3}
                value={profileForm.bio}
                onChange={e => setProfileForm({ ...profileForm, bio: e.target.value })}
                placeholder="Describe your skills, tools, and experience..."
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
              <div className="form-group">
                <label className="form-label">City</label>
                <input className="form-input" disabled={!editMode} value={profileForm.city} onChange={e => setProfileForm({ ...profileForm, city: e.target.value })} placeholder="e.g. Mumbai" />
              </div>
              <div className="form-group">
                <label className="form-label">Years of Experience</label>
                <input className="form-input" type="number" disabled={!editMode} value={profileForm.yearsExperience} onChange={e => setProfileForm({ ...profileForm, yearsExperience: e.target.value })} placeholder="e.g. 5" />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
              <div className="form-group">
                <label className="form-label">Rate (₹)</label>
                <input className="form-input" type="number" disabled={!editMode} value={profileForm.rate} onChange={e => setProfileForm({ ...profileForm, rate: e.target.value })} placeholder="e.g. 500" />
              </div>
              <div className="form-group">
                <label className="form-label">Rate Type</label>
                <select className="form-select" disabled={!editMode} value={profileForm.rateType} onChange={e => setProfileForm({ ...profileForm, rateType: e.target.value })}>
                  <option value="hourly">Hourly</option>
                  <option value="fixed">Fixed</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Working Hours / Availability</label>
              <input className="form-input" disabled={!editMode} value={profileForm.availability} onChange={e => setProfileForm({ ...profileForm, availability: e.target.value })} placeholder="e.g. Mon-Sat, 9am-6pm" />
            </div>

            {editMode && (
              <button type="submit" className="btn btn-primary btn-lg mt-4">
                <Save size={16} /> Save Profile Changes
              </button>
            )}
          </form>
        </div>
      )}
    </div>
  );
}
