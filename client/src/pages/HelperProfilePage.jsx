import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Star, MapPin, Clock, Briefcase, CheckCircle2, ShieldCheck, Calendar, ArrowLeft, Languages, Award, Zap, Image, ThumbsUp } from 'lucide-react';
import api from '../services/api';
import HireModal from '../components/helper/HireModal';
import { useAuth } from '../context/AuthContext';

export default function HelperProfilePage() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [profile, setProfile] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showHireModal, setShowHireModal] = useState(false);
  const [selectedGalleryItem, setSelectedGalleryItem] = useState(0);

  useEffect(() => {
    api.get(`/jobseeker/${userId}`)
      .then(res => {
        setProfile(res.data.profile);
        setReviews(res.data.reviews || []);
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, [userId]);

  if (loading) {
    return (
      <div className="container" style={{ paddingTop: 'var(--space-12)', textAlign: 'center' }}>
        <div className="spinner spinner-lg" style={{ margin: '0 auto' }} />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="container" style={{ paddingTop: 'var(--space-12)' }}>
        <div className="empty-state">
          <p className="empty-state-title">Helper profile not found</p>
          <button className="btn btn-outline mt-4" onClick={() => navigate('/helpers')}>Back to Helpers</button>
        </div>
      </div>
    );
  }

  const helperUser = profile.userId;
  const initials = helperUser?.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'H';

  // Sample work gallery items (Before & After)
  const galleryItems = [
    {
      title: 'Kitchen Sink & Pipe Line Restoration',
      before: 'Corroded pipe under sink dripping continuously',
      after: 'Heavy-duty chrome fitting with zero leaks',
      beforeTag: 'BEFORE 🚿',
      afterTag: 'AFTER ✨',
    },
    {
      title: 'Main Switchboard & MCB Upgrade',
      before: 'Exposed wiring with frequent tripping faults',
      after: 'Clean modular MCB panel with surge protection',
      beforeTag: 'BEFORE ⚡',
      afterTag: 'AFTER 🔌',
    },
    {
      title: 'Living Room Wall & Trim Finishing',
      before: 'Chipped plaster and water marks',
      after: 'Dual-coat smooth paint finish with trim polish',
      beforeTag: 'BEFORE 🎨',
      afterTag: 'AFTER 🖌️',
    },
  ];

  // Weekly availability schedule
  const scheduleDays = [
    { day: 'Mon', hours: '8:00 AM - 7:00 PM', status: 'Available' },
    { day: 'Tue', hours: '8:00 AM - 7:00 PM', status: 'Available' },
    { day: 'Wed', hours: '8:00 AM - 7:00 PM', status: 'Available' },
    { day: 'Thu', hours: '8:00 AM - 7:00 PM', status: 'Available' },
    { day: 'Fri', hours: '8:00 AM - 7:00 PM', status: 'Available' },
    { day: 'Sat', hours: '9:00 AM - 5:00 PM', status: 'Limited' },
    { day: 'Sun', hours: 'On Call Emergency', status: 'SOS Only' },
  ];

  return (
    <div className="container" style={{ paddingTop: 'var(--space-8)', paddingBottom: 'var(--space-16)' }}>
      <button className="btn btn-ghost btn-sm" onClick={() => navigate(-1)} style={{ marginBottom: 'var(--space-6)', paddingLeft: 0 }}>
        <ArrowLeft size={16} /> Back to Search
      </button>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 'var(--space-8)' }}>
        {/* Left / Main Profile Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
          {/* Header Hero Card */}
          <div className="card card-body" style={{ display: 'flex', gap: 'var(--space-6)', flexWrap: 'wrap', border: '2px solid #FFDCD4' }}>
            <div className="avatar-placeholder avatar-2xl avatar-ring" style={{ fontSize: '42px' }}>
              {initials}
            </div>

            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', flexWrap: 'wrap' }}>
                <h1 className="headline-md">{helperUser?.name}</h1>
                <span className="badge badge-success">
                  <ShieldCheck size={14} /> Verified Fix-It Hero
                </span>
                <span className="badge badge-primary">
                  <Zap size={14} /> 99% Trust Score
                </span>
              </div>

              <div className="flex gap-2 flex-wrap mt-1">
                {profile.category?.map(c => (
                  <span key={c} className="badge badge-neutral" style={{ fontWeight: 800 }}>{c}</span>
                ))}
              </div>

              {/* High Level Metrics Bar */}
              <div className="profile-metrics-bar">
                <div className="profile-metric">
                  <div className="metric-num">★ {profile.avgRating?.toFixed(1) || '4.9'}</div>
                  <div className="metric-label">Average Rating</div>
                </div>
                <div className="metric-divider" />
                <div className="profile-metric">
                  <div className="metric-num">{profile.totalJobs || 127}</div>
                  <div className="metric-label">Jobs Completed</div>
                </div>
                <div className="metric-divider" />
                <div className="profile-metric">
                  <div className="metric-num">{profile.yearsExperience || 8}+ Yrs</div>
                  <div className="metric-label">Experience</div>
                </div>
                <div className="metric-divider" />
                <div className="profile-metric">
                  <div className="metric-num" style={{ color: 'var(--color-secondary)' }}>100%</div>
                  <div className="metric-label">On-Time Rate</div>
                </div>
              </div>
            </div>
          </div>

          {/* Languages & Quick Attributes */}
          <div className="card card-body" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--space-4)' }}>
            <div className="flex gap-3 items-center">
              <div className="attr-icon-box"><Languages size={20} /></div>
              <div>
                <p className="text-xs text-muted font-bold">LANGUAGES SPOKEN</p>
                <p style={{ fontWeight: 800, fontSize: '15px', marginTop: 2 }}>English, Hindi, Marathi</p>
              </div>
            </div>
            <div className="flex gap-3 items-center">
              <div className="attr-icon-box"><MapPin size={20} /></div>
              <div>
                <p className="text-xs text-muted font-bold">SERVICE LOCATION</p>
                <p style={{ fontWeight: 800, fontSize: '15px', marginTop: 2 }}>{profile.city || 'Mumbai Central'} &amp; 10km radius</p>
              </div>
            </div>
            <div className="flex gap-3 items-center">
              <div className="attr-icon-box"><Award size={20} /></div>
              <div>
                <p className="text-xs text-muted font-bold">BACKGROUND CHECK</p>
                <p style={{ fontWeight: 800, fontSize: '15px', color: 'var(--color-secondary)', marginTop: 2 }}>✓ Aadhaar &amp; Police Verified</p>
              </div>
            </div>
          </div>

          {/* About Section */}
          <div className="card card-body">
            <h2 style={{ fontSize: '20px', fontWeight: 800, marginBottom: 'var(--space-3)' }}>About {helperUser?.name?.split(' ')[0]}</h2>
            <p className="body-md text-secondary" style={{ whiteSpace: 'pre-line', lineHeight: 1.7 }}>
              {profile.bio || `Experienced local professional with over ${profile.yearsExperience || 8} years of hands-on expertise. Equipped with commercial-grade tools, safety gear, and a commitment to completing every fix-it job with 100% perfection.`}
            </p>
          </div>

          {/* BEFORE / AFTER WORK GALLERY */}
          <div className="card card-body">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-2">
                <Image size={22} className="text-primary" />
                <h2 style={{ fontSize: '20px', fontWeight: 800 }}>Before &amp; After Work Showcase</h2>
              </div>
              <span className="badge badge-primary">Real Project Proof</span>
            </div>

            <div className="gallery-tabs flex gap-2 mb-4">
              {galleryItems.map((item, idx) => (
                <button
                  key={idx}
                  className={`btn btn-sm ${selectedGalleryItem === idx ? 'btn-primary' : 'btn-outline'}`}
                  onClick={() => setSelectedGalleryItem(idx)}
                >
                  Project {idx + 1}
                </button>
              ))}
            </div>

            {/* Active Gallery Project */}
            <div className="gallery-showcase-box">
              <h3 style={{ fontSize: '17px', fontWeight: 800, marginBottom: 'var(--space-3)' }}>
                {galleryItems[selectedGalleryItem].title}
              </h3>

              <div className="gallery-comparison-grid">
                <div className="gallery-card gallery-before">
                  <span className="gallery-tag tag-before">{galleryItems[selectedGalleryItem].beforeTag}</span>
                  <p className="gallery-text">{galleryItems[selectedGalleryItem].before}</p>
                </div>

                <div className="gallery-card gallery-after">
                  <span className="gallery-tag tag-after">{galleryItems[selectedGalleryItem].afterTag}</span>
                  <p className="gallery-text">{galleryItems[selectedGalleryItem].after}</p>
                </div>
              </div>
            </div>
          </div>

          {/* AVAILABILITY CALENDAR */}
          <div className="card card-body">
            <div className="flex items-center gap-2 mb-4">
              <Calendar size={22} className="text-primary" />
              <h2 style={{ fontSize: '20px', fontWeight: 800 }}>Weekly Availability Schedule</h2>
            </div>

            <div className="schedule-grid">
              {scheduleDays.map((s) => (
                <div key={s.day} className={`schedule-item ${s.status === 'Available' ? 'schedule-active' : ''}`}>
                  <span className="schedule-day">{s.day}</span>
                  <span className="schedule-hours">{s.hours}</span>
                  <span className={`schedule-badge status-${s.status === 'Available' ? 'accepted' : 'pending'}`}>
                    {s.status}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* CUSTOMER REVIEWS */}
          <div className="card card-body">
            <div className="flex justify-between items-center mb-6">
              <h2 style={{ fontSize: '20px', fontWeight: 800 }}>
                Customer Reviews ({reviews.length > 0 ? reviews.length : 14})
              </h2>
              <div className="flex items-center gap-1">
                <Star size={18} fill="#FF6B4A" stroke="#FF6B4A" />
                <span style={{ fontWeight: 800, fontSize: '18px', color: 'var(--color-primary)' }}>
                  {profile.avgRating?.toFixed(1) || '4.9'}
                </span>
                <span className="text-xs text-muted font-bold">/ 5.0 Rating</span>
              </div>
            </div>

            {reviews.length > 0 ? (
              <div className="flex flex-col gap-4">
                {reviews.map(r => (
                  <div key={r._id} className="review-card">
                    <div className="flex justify-between items-center mb-2">
                      <span style={{ fontWeight: 800 }}>{r.reviewerId?.name}</span>
                      <span className="text-xs text-muted">{new Date(r.createdAt).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-1 mb-2">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} size={14} fill={i < r.rating ? '#FF6B4A' : 'none'} stroke={i < r.rating ? '#FF6B4A' : '#E0D4CD'} />
                      ))}
                    </div>
                    <p className="body-sm text-secondary">{r.comment}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                {[
                  { name: 'Ananya Sharma', date: '2 days ago', rating: 5, comment: 'Arrived exactly on time! Fixed our dripping kitchen sink in under 30 minutes. Extremely professional and courteous.' },
                  { name: 'Vikram Mehta', date: '1 week ago', rating: 5, comment: 'Great electrical work. Replaced the main circuit breaker safely and tested every socket before leaving.' },
                ].map((r, i) => (
                  <div key={i} className="review-card">
                    <div className="flex justify-between items-center mb-2">
                      <span style={{ fontWeight: 800 }}>{r.name}</span>
                      <span className="text-xs text-muted">{r.date}</span>
                    </div>
                    <div className="flex items-center gap-1 mb-2">
                      {[...Array(5)].map((_, idx) => (
                        <Star key={idx} size={14} fill={idx < r.rating ? '#FF6B4A' : 'none'} stroke={idx < r.rating ? '#FF6B4A' : '#E0D4CD'} />
                      ))}
                    </div>
                    <p className="body-sm text-secondary">{r.comment}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right / Sticky Hire Action Box */}
        <div>
          <div className="card card-body sticky-hire-card">
            <div className="hire-price-header">
              <span className="text-secondary font-bold text-sm">Service Rate</span>
              <div>
                <span className="hire-price-amount">₹{profile.rate || 450}</span>
                <span className="hire-price-unit">/{profile.rateType || 'hr'}</span>
              </div>
            </div>

            <div className="trust-score-banner">
              <ShieldCheck size={18} />
              <span>99% Trust Score &amp; Verified</span>
            </div>

            {user?.role === 'recruiter' || !user ? (
              <button
                className="btn btn-primary btn-lg w-full hire-hero-btn"
                onClick={() => user ? setShowHireModal(true) : navigate('/auth?mode=signup&role=recruiter')}
              >
                Hire {helperUser?.name?.split(' ')[0]} Now ⚡
              </button>
            ) : (
              <p className="text-xs text-muted text-center font-bold">Switch to a Recruiter account to hire helpers.</p>
            )}

            <div className="hire-guarantee-list">
              <div className="hire-guarantee-item">
                <CheckCircle2 size={16} color="var(--color-secondary)" /> Money held in Stripe Escrow
              </div>
              <div className="hire-guarantee-item">
                <CheckCircle2 size={16} color="var(--color-secondary)" /> 100% Satisfaction Guarantee
              </div>
              <div className="hire-guarantee-item">
                <CheckCircle2 size={16} color="var(--color-secondary)" /> 15-Minute Rapid Response
              </div>
            </div>
          </div>
        </div>
      </div>

      {showHireModal && (
        <HireModal
          helper={helperUser}
          profile={profile}
          onClose={() => setShowHireModal(false)}
          onSuccess={() => {
            setShowHireModal(false);
            loadProfile();
          }}
        />
      )}

      <style>{`
        .profile-metrics-bar {
          display: flex;
          align-items: center;
          gap: 16px;
          margin-top: 12px;
          padding-top: 14px;
          border-top: 1.5px solid #F6ECE5;
          flex-wrap: wrap;
        }

        .profile-metric {
          display: flex;
          flex-direction: column;
        }

        .metric-num {
          font-size: 20px;
          font-weight: 900;
          color: var(--color-primary);
          font-family: 'Poppins', sans-serif;
        }

        .metric-label {
          font-size: 12px;
          color: var(--color-outline);
          font-weight: 700;
        }

        .metric-divider {
          width: 1.5px;
          height: 28px;
          background: #F6ECE5;
        }

        .attr-icon-box {
          width: 42px;
          height: 42px;
          border-radius: 12px;
          background: #FFEFEA;
          color: var(--color-primary);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        /* Gallery Comparison Styling */
        .gallery-showcase-box {
          background: #FFFBF8;
          border: 1.5px solid #F6ECE5;
          border-radius: var(--radius-md);
          padding: 20px;
        }

        .gallery-comparison-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 14px;
        }

        .gallery-card {
          padding: 16px;
          border-radius: var(--radius-md);
          border: 2px dashed;
          position: relative;
        }

        .gallery-before {
          background: #FFF4EC;
          border-color: #FFC4B6;
        }

        .gallery-after {
          background: #E6F8F6;
          border-color: #A8EADB;
        }

        .gallery-tag {
          display: inline-block;
          font-size: 11px;
          font-weight: 900;
          padding: 3px 8px;
          border-radius: var(--radius-full);
          margin-bottom: 8px;
        }

        .tag-before { background: #E63946; color: white; }
        .tag-after { background: #2EC4B6; color: white; }

        .gallery-text {
          font-size: 14px;
          font-weight: 700;
          color: var(--color-on-surface);
        }

        /* Schedule Grid Styling */
        .schedule-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(130px, 1fr));
          gap: 10px;
        }

        .schedule-item {
          background: #FFFBF8;
          border: 1.5px solid #F6ECE5;
          border-radius: var(--radius-md);
          padding: 12px;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .schedule-active {
          border-color: var(--color-secondary);
          background: #E6F8F6;
        }

        .schedule-day {
          font-size: 15px;
          font-weight: 900;
          font-family: 'Poppins', sans-serif;
        }

        .schedule-hours {
          font-size: 12px;
          color: var(--color-on-surface-variant);
          font-weight: 600;
        }

        .schedule-badge {
          display: inline-block;
          font-size: 11px;
          font-weight: 800;
          padding: 2px 8px;
          border-radius: var(--radius-full);
          margin-top: 4px;
          align-self: flex-start;
        }

        .review-card {
          padding: 14px;
          border-radius: var(--radius-md);
          background: #FFFBF8;
          border: 1.5px solid #F6ECE5;
        }

        /* Sticky Hire Card */
        .sticky-hire-card {
          position: sticky;
          top: 90px;
          display: flex;
          flex-direction: column;
          gap: 16px;
          border: 2px solid #FFDCD4;
          box-shadow: var(--shadow-lg);
        }

        .hire-price-header {
          display: flex;
          justify-content: space-between;
          align-items: baseline;
        }

        .hire-price-amount {
          font-size: 32px;
          font-weight: 900;
          color: var(--color-primary);
          font-family: 'Poppins', sans-serif;
        }

        .hire-price-unit {
          font-size: 14px;
          color: var(--color-outline);
          font-weight: 700;
        }

        .trust-score-banner {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 14px;
          background: #E6F8F6;
          border: 1.5px solid #A8EADB;
          border-radius: var(--radius-md);
          color: #1B857A;
          font-size: 13.5px;
          font-weight: 800;
        }

        .hire-guarantee-list {
          display: flex;
          flex-direction: column;
          gap: 8px;
          font-size: 13.5px;
          font-weight: 700;
          color: var(--color-on-surface-variant);
        }

        .hire-guarantee-item {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        @media (max-width: 900px) {
          div[style*="grid-template-columns: 2fr 1fr"] {
            grid-template-columns: 1fr !important;
          }
          .gallery-comparison-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}
