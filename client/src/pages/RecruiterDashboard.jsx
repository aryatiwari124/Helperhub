import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, Plus, MapPin, Calendar, Clock, DollarSign, Filter, CheckCircle, AlertCircle } from 'lucide-react';
import api from '../services/api';
import HelperCard from '../components/helper/HelperCard';
import HireModal from '../components/helper/HireModal';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import toast from 'react-hot-toast';

const CATEGORIES = [
  { name: 'Plumber', key: 'cat_plumber' },
  { name: 'Electrician', key: 'cat_electrician' },
  { name: 'Carpenter', key: 'cat_carpenter' },
  { name: 'AC Technician', key: 'cat_ac' },
  { name: 'Painter', key: 'cat_painter' },
  { name: 'Cleaner', key: 'cat_cleaner' },
  { name: 'Mechanic', key: 'cat_mechanic' },
  { name: 'Gardener', key: 'cat_gardener' },
];

export default function RecruiterDashboard() {
  const { user } = useAuth();
  const { t } = useLanguage();
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

  const getCategoryName = (catName) => {
    const match = CATEGORIES.find(c => c.name.toLowerCase() === catName?.toLowerCase());
    return match ? t(match.key, match.name) : catName;
  };

  const getStatusLabel = (status) => {
    if (!status) return '';
    const key = `status_${status.toLowerCase().replace(/\s+/g, '_')}`;
    return t(key, status);
  };

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
      toast.error(t('job_post_err_required'));
      return;
    }
    setPosting(true);
    try {
      await api.post('/jobpost', {
        ...jobForm,
        budget: Number(jobForm.budget) || undefined,
      });
      toast.success(t('job_post_success'));
      setShowPostJob(false);
      setJobForm({ title: '', category: 'Plumber', description: '', location: '', budget: '', preferredDate: '' });
      loadData();
    } catch (err) {
      toast.error(err.response?.data?.message || t('job_post_failed'));
    } finally {
      setPosting(false);
    }
  };

  return (
    <div className="container" style={{ paddingTop: 'var(--space-8)', paddingBottom: 'var(--space-16)' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-8)', flexWrap: 'wrap', gap: 'var(--space-4)' }}>
        <div>
          <h1 className="headline-lg">{t('recruiter_dashboard_title')}</h1>
          <p className="text-secondary" style={{ marginTop: 4 }}>
            {t('recruiter_welcome', { name: user?.name || '' })}
          </p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowPostJob(true)}>
          <Plus size={18} /> {t('recruiter_post_req_btn')}
        </button>
      </div>

      {/* Navigation Tabs */}
      <div className="tabs" style={{ marginBottom: 'var(--space-8)' }}>
        <button className={`tab ${activeTab === 'browse' ? 'active' : ''}`} onClick={() => setActiveTab('browse')}>
          {t('recruiter_tab_browse', { count: helpers.length })}
        </button>
        <button className={`tab ${activeTab === 'my-jobs' ? 'active' : ''}`} onClick={() => setActiveTab('my-jobs')}>
          {t('recruiter_tab_my_jobs', { count: myJobs.length })}
        </button>
        <button className={`tab ${activeTab === 'bookings' ? 'active' : ''}`} onClick={() => setActiveTab('bookings')}>
          {t('recruiter_tab_bookings', { count: bookings.length })}
        </button>
      </div>

      {/* TAB 1: BROWSE HELPERS */}
      {activeTab === 'browse' && (
        <div>
          {/* Filters Bar */}
          <div className="card" style={{ padding: 'var(--space-4)', marginBottom: 'var(--space-6)', display: 'flex', gap: 'var(--space-4)', flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: 200 }}>
              <select className="form-select" value={searchCategory} onChange={e => setSearchCategory(e.target.value)}>
                <option value="">{t('recruiter_all_categories')}</option>
                {CATEGORIES.map(c => <option key={c.name} value={c.name}>{t(c.key, c.name)}</option>)}
              </select>
            </div>
            <div style={{ flex: 1, minWidth: 200 }}>
              <input
                className="form-input"
                placeholder={t('recruiter_search_city_placeholder')}
                value={searchCity}
                onChange={e => setSearchCity(e.target.value)}
              />
            </div>
            {(searchCategory || searchCity) && (
              <button className="btn btn-ghost" onClick={() => { setSearchCategory(''); setSearchCity(''); }}>
                {t('recruiter_clear_filters')}
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
              {helpers.map((p, index) => (
                <HelperCard key={p._id} profile={p} index={index} onHire={hp => setSelectedHelper(hp)} />
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <div className="empty-state-icon">🔍</div>
              <p className="empty-state-title">{t('recruiter_no_helpers_title')}</p>
              <p className="empty-state-text">{t('recruiter_no_helpers_desc')}</p>
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
                    <span className="badge badge-primary">{getCategoryName(job.category)}</span>
                    <span className={`badge status-${job.status}`}>{getStatusLabel(job.status)}</span>
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
              <p className="empty-state-title">{t('recruiter_no_jobs_title')}</p>
              <button className="btn btn-primary mt-4" onClick={() => setShowPostJob(true)}>
                <Plus size={16} /> {t('recruiter_post_req_btn')}
              </button>
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
                      <h3 style={{ fontSize: '17px', fontWeight: 700 }}>{req.jobTitle || t('recruiter_direct_booking')}</h3>
                      <p className="text-sm text-secondary">{t('recruiter_helper_label')} <strong>{req.helperId?.name}</strong> ({req.helperId?.email})</p>
                      <p className="text-xs text-muted" style={{ marginTop: 4 }}>📍 {req.jobLocation} · ₹{req.agreedAmount}</p>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
                    <span className={`badge status-${req.status}`} style={{ fontSize: '13px', padding: '6px 14px' }}>
                      {getStatusLabel(req.status)}
                    </span>
                    <Link to={`/job/${req._id}`} className="btn btn-outline btn-sm">
                      {t('recruiter_view_details')}
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <div className="empty-state-icon">🤝</div>
              <p className="empty-state-title">{t('recruiter_no_bookings_title')}</p>
              <p className="empty-state-text">{t('recruiter_no_bookings_desc')}</p>
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
              <h2 style={{ fontSize: '18px', fontWeight: 700 }}>{t('job_post_modal_title')}</h2>
              <button className="btn btn-ghost btn-icon" onClick={() => setShowPostJob(false)}>✕</button>
            </div>
            <form onSubmit={handlePostJob}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                <div className="form-group">
                  <label className="form-label">{t('job_post_title_label')}</label>
                  <input
                    className="form-input"
                    placeholder={t('job_post_title_placeholder')}
                    value={jobForm.title}
                    onChange={e => setJobForm({ ...jobForm, title: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">{t('job_post_category_label')}</label>
                  <select className="form-select" value={jobForm.category} onChange={e => setJobForm({ ...jobForm, category: e.target.value })}>
                    {CATEGORIES.map(c => <option key={c.name} value={c.name}>{t(c.key, c.name)}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">{t('job_post_desc_label')}</label>
                  <textarea
                    className="form-textarea"
                    rows={3}
                    placeholder={t('job_post_desc_placeholder')}
                    value={jobForm.description}
                    onChange={e => setJobForm({ ...jobForm, description: e.target.value })}
                  />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
                  <div className="form-group">
                    <label className="form-label">{t('job_post_location_label')}</label>
                    <input className="form-input" placeholder={t('job_post_location_placeholder')} value={jobForm.location} onChange={e => setJobForm({ ...jobForm, location: e.target.value })} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">{t('job_post_budget_label')}</label>
                    <input className="form-input" type="number" placeholder={t('job_post_budget_placeholder')} value={jobForm.budget} onChange={e => setJobForm({ ...jobForm, budget: e.target.value })} />
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-ghost" onClick={() => setShowPostJob(false)}>
                  {t('general_cancel')}
                </button>
                <button type="submit" className="btn btn-primary" disabled={posting}>
                  {posting ? t('job_post_submitting') : t('job_post_submit')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
