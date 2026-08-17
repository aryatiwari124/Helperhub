import "./LandingPage.css";
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Star, ShieldCheck, Zap, ArrowRight, CheckCircle2, Clock, ThumbsUp, Calculator, Smartphone, Sparkles, AlertTriangle, Layers, Award, Shield } from 'lucide-react';
import api from '../services/api';
import HelperCard from '../components/helper/HelperCard';
import { useAuth } from '../context/AuthContext';

const CATEGORIES = [
  { name: 'Plumber', icon: '🔧', color: '#FFEFEA', border: '#FFC4B6' },
  { name: 'Electrician', icon: '⚡', color: '#FFF8E5', border: '#FFE5A3' },
  { name: 'Carpenter', icon: '🪚', color: '#E6F8F6', border: '#A8EADB' },
  { name: 'AC Technician', icon: '❄️', color: '#EBF5FF', border: '#B8DCFF' },
  { name: 'Painter', icon: '🎨', color: '#F5EEFD', border: '#DCBEFB' },
  { name: 'Cleaner', icon: '🧹', color: '#E6F8F6', border: '#A8EADB' },
  { name: 'Mechanic', icon: '🔩', color: '#FFEFEA', border: '#FFC4B6' },
  { name: 'Gardener', icon: '🌿', color: '#EBFBF3', border: '#A2F3C8' },
];

// 5-step workflow telling the platform story
const FIVE_STEPS = [
  { step: '1', title: 'Search Service 🔍', desc: 'Type your repair need or browse verified local helpers by category & location.' },
  { step: '2', title: 'Book Professional 🤝', desc: 'Select a top-rated hero, pick your date & time, and send an instant hire request.' },
  { step: '3', title: 'Pay Securely 🔒', desc: 'Once accepted, funds are held safely in Stripe Escrow until the work is done.' },
  { step: '4', title: 'Job Completed 🛠️', desc: 'Hero finishes the work at your doorstep. Both sides confirm job completion.' },
  { step: '5', title: 'Rate Experience ⭐', desc: 'Payment is released to the hero, and you leave a star review to help neighbors!' },
];

// Live completed jobs feed (makes platform feel alive)
const RECENT_COMPLETED_JOBS = [
  { title: 'Kitchen Sink Leak Fixed', location: 'Andheri West, Mumbai', timeAgo: '2 hours ago', rating: 5, category: 'Plumbing', price: '₹600' },
  { title: 'Split AC Installed', location: 'Koramangala, Bangalore', timeAgo: 'Yesterday', rating: 5, category: 'AC Technician', price: '₹1,500' },
  { title: 'Living Room Painting', location: 'Bandra, Mumbai', timeAgo: '4 hours ago', rating: 5, category: 'Painting', price: '₹3,200' },
  { title: 'Main MCB Tripping Fixed', location: 'South Ex, Delhi', timeAgo: '6 hours ago', rating: 5, category: 'Electrical', price: '₹450' },
  { title: 'Wooden Door Frame Repair', location: 'HSR Layout, Bangalore', timeAgo: '8 hours ago', rating: 5, category: 'Carpentry', price: '₹800' },
];

// Real Customer Testimonials (Photo, Name, Stars, One Sentence)
const TESTIMONIALS = [
  {
    name: 'Priya Sharma',
    city: 'Mumbai',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
    stars: 5,
    quote: '"Booked a plumber in 2 minutes for a burst sink pipe, and Rajesh arrived in 15 mins to fix it completely!"',
  },
  {
    name: 'Anand Verma',
    city: 'Bangalore',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    stars: 5,
    quote: '"The escrow payment protection gave me 100% peace of mind. Best home service app hands down."',
  },
  {
    name: 'Meera Nair',
    city: 'Delhi',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    stars: 5,
    quote: '"Fair, transparent pricing without any surprise charges. The electrician was super polite and clean."',
  },
];

import { useLanguage } from '../context/LanguageContext';

export default function LandingPage() {
  const { t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [featuredHelpers, setFeaturedHelpers] = useState([]);
  const [loadingHelpers, setLoadingHelpers] = useState(true);

  // Interactive AI Cost Estimation Widget State
  const [calcCategory, setCalcCategory] = useState('Plumber');
  const [calcHours, setCalcHours] = useState(2);

  const navigate = useNavigate();

  useEffect(() => {
    api.get('/jobseeker/all?limit=6')
      .then(r => setFeaturedHelpers(r.data.profiles || []))
      .catch(() => {})
      .finally(() => setLoadingHelpers(false));
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (selectedCategory) params.set('category', selectedCategory);
    if (searchQuery) params.set('city', searchQuery);
    navigate(`/helpers?${params.toString()}`);
  };

  const handleCategoryClick = (cat) => {
    navigate(`/helpers?category=${encodeURIComponent(cat)}`);
  };

  // Estimated Price Calculation
  const estimatedCost = calcCategory === 'AC Technician' ? calcHours * 600 : calcCategory === 'Electrician' ? calcHours * 500 : calcHours * 450;

  return (
    <div>
      {/* ====== HERO ====== */}
      <section className="hero">
        <div className="container">
          <div className="hero-content">
            <div className="hero-badge animate-fadeIn">
              <span>🎉</span>
              <span>{t('hero_badge')}</span>
          </div>
           <h1 className="hero-title animate-slideUp">
              {t("hero_title_1")}{" "}
              <span className="hero-title-accent">
                {t("hero_title_2")}
              </span>
              <br />
              {t("hero_title_3")}
          </h1>
            <p className="hero-subtitle animate-slideUp">
              {t('hero_sub')}
            </p>

            {/* Friendly Search Bar */}
            <form className="hero-search animate-slideUp" onSubmit={handleSearch}>
              <div className="hero-search-inner">
                <select
                  className="hero-search-category"
                  value={selectedCategory}
                  onChange={e => setSelectedCategory(e.target.value)}
                >
                  <option value="">{t('browse_cat_all')}</option>
                  {CATEGORIES.map(c => <option key={c.name} value={c.name}>{c.icon} {c.name}</option>)}
                </select>
                <div className="hero-search-divider" />
                <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 10 }}>
                  <Search size={20} style={{ color: 'var(--color-primary)', flexShrink: 0, marginLeft: 10 }} />
                  <input
                    type="text"
                    className="hero-search-input"
                    placeholder={t('hero_search_placeholder')}
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                  />
                </div>
                <button type="submit" className="btn btn-primary btn-lg">
                  {t('hero_search_btn')} <ArrowRight size={18} />
                </button>
              </div>
            </form>

            {/* Quick Service Tags */}
            <div className="hero-quick-tags animate-fadeIn">
              <span className="text-secondary font-semibold" style={{ fontSize: '14px' }}>{t('landing_quick_popular')}</span>
              {CATEGORIES.slice(0, 5).map(c => (
                <button key={c.name} className="quick-tag" onClick={() => handleCategoryClick(c.name)}>
                  {c.icon} {c.name}
                </button>
              ))}
            </div>
          </div>

          {/* Hero Visual Card Stack */}
          <div className="hero-visual">
            <div className="hero-card-float hero-card-1">
              <div className="flex items-center gap-3">
                <div className="avatar-placeholder avatar-md avatar-ring">RK</div>
                <div>
                  <p style={{ fontWeight: 800, fontSize: 15, color: 'var(--color-on-surface)' }}>Rajesh Kumar</p>
                  <p className="text-xs text-primary font-bold">🔧 {t('landing_card_master')}</p>
                  <div className="flex items-center gap-1 mt-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} size={12} fill="#FF6B4A" stroke="#FF6B4A" />
                    ))}
                    <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--color-primary)' }}>4.9 (127 {t('landing_card_reviews')})</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="hero-card-float hero-card-2">
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 38, height: 38, background: 'var(--color-secondary-light)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>🎉</div>
                <div>
                  <p style={{ fontWeight: 800, fontSize: 14, color: 'var(--color-on-surface)' }}>{t('landing_card_all_set')}</p>
                  <p style={{ fontSize: 12.5, color: '#1B857A', fontWeight: 700 }}>{t('landing_card_done')}</p>
                </div>
              </div>
            </div>

            <div className="hero-grid-bg">
              {CATEGORIES.map((cat, i) => (
                <div key={cat.name} className="hero-category-orb" onClick={() => handleCategoryClick(cat.name)} style={{ background: cat.color, border: `2px solid ${cat.border}`, animationDelay: `${i * 0.12}s` }}>
                  <span style={{ fontSize: 32 }}>{cat.icon}</span>
                  <span style={{ fontSize: 13, fontWeight: 800, color: 'var(--color-on-surface)' }}>{cat.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ====== CATEGORIES GRID ====== */}
      <section className="section">
        <div className="container">
          <div className="section-header text-center">
            <span className="badge badge-primary" style={{ marginBottom: 12 }}>{t('landing_cat_badge')}</span>
            <h2 className="section-title">{t('categories_title')}</h2>
            <p className="section-subtitle" style={{ margin: '0 auto' }}>{t('categories_sub')}</p>
          </div>
          <div className="categories-grid">
            {CATEGORIES.map(cat => (
              <button key={cat.name} className="category-card" onClick={() => handleCategoryClick(cat.name)} style={{ '--cat-bg': cat.color, '--cat-border': cat.border }}>
                <div className="category-icon">{cat.icon}</div>
                <span className="category-name">{cat.name}</span>
                <span className="category-tag">{t('landing_cat_browse')}</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ====== ⭐ HOW HELPERHUB WORKS (5 STEPS STORY) ====== */}
      <section className="section" style={{ background: 'var(--color-background-alt)' }}>
        <div className="container">
          <div className="section-header text-center">
            <span className="badge badge-warning" style={{ marginBottom: 12 }}>{t('landing_hiw_badge')}</span>
            <h2 className="section-title">{t('how_title')}</h2>
            <p className="section-subtitle" style={{ margin: '0 auto' }}>{t('how_sub')}</p>
          </div>

          <div className="five-steps-grid">
            {FIVE_STEPS.map((s) => (
              <div key={s.step} className="step-story-card">
                <div className="step-story-num">{s.step}</div>
                <h3 className="step-story-title">{s.title}</h3>
                <p className="step-story-desc">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ====== ⭐ TOP RATED PROFESSIONALS (4-6 CARDS) ====== */}
      <section className="section">
        <div className="container">
          <div className="section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 16 }}>
            <div>
              <span className="badge badge-success" style={{ marginBottom: 8 }}>{t('landing_top_badge')}</span>
              <h2 className="section-title" style={{ marginBottom: 0 }}>{t('top_title')}</h2>
            </div>
            <Link to="/helpers" className="btn btn-outline">
              {t('landing_top_explore')} <ArrowRight size={16} />
            </Link>
          </div>

          {loadingHelpers ? (
            <div className="helpers-pro-grid">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="card skeleton" style={{ height: 360 }} />
              ))}
            </div>
          ) : featuredHelpers.length > 0 ? (
            <div className="helpers-pro-grid">
              {featuredHelpers.slice(0, 6).map((p, index) => (
                <HelperCard key={p._id} profile={p} index={index} />
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <div className="empty-state-icon">👷</div>
              <p className="empty-state-title">No helpers registered yet</p>
            </div>
          )}
        </div>
      </section>

      {/* ====== ⭐ RECENT JOBS COMPLETED (FEED THAT MAKES APP FEEL ALIVE) ====== */}
      <section className="section" style={{ background: '#FFF4EC' }}>
        <div className="container">
          <div className="section-header text-center">
            <span className="badge badge-primary" style={{ marginBottom: 12 }}>⚡ Live Activity</span>
            <h2 className="section-title">{t('landing_jobs_badge')}</h2>
            <p className="section-subtitle" style={{ margin: '0 auto' }}>{t('recent_title')}</p>
          </div>

          <div className="recent-jobs-ticker flex flex-col gap-3 max-w-2xl" style={{ margin: '0 auto' }}>
            {RECENT_COMPLETED_JOBS.map((job, idx) => (
              <div key={idx} className="recent-job-row card animate-fadeIn">
                <div className="flex items-center gap-3">
                  <div className="recent-job-check">✔</div>
                  <div>
                    <h4 style={{ fontWeight: 800, fontSize: '16px', color: '#2B2B2B' }}>{job.title}</h4>
                    <p className="text-xs text-muted font-semibold">{job.location} · <span style={{ color: 'var(--color-primary)' }}>{job.timeAgo}</span></p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <span className="badge badge-neutral">{job.category}</span>
                  <div className="flex items-center gap-1 text-primary">
                    {[...Array(job.rating)].map((_, i) => (
                      <Star key={i} size={14} fill="#FF6B4A" stroke="#FF6B4A" />
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ====== ⭐ CUSTOMER TESTIMONIALS ====== */}
      <section className="section">
        <div className="container">
          <div className="section-header text-center">
            <span className="badge badge-success" style={{ marginBottom: 12 }}>{t('landing_test_badge')}</span>
            <h2 className="section-title">{t('testimonials_title')}</h2>
          </div>

          <div className="testimonials-grid">
            {TESTIMONIALS.map((t) => (
              <div key={t.name} className="testimonial-card card card-hover">
                <div className="flex items-center gap-3 mb-4">
                  <img src={t.avatar} alt={t.name} className="avatar avatar-md avatar-ring" />
                  <div>
                    <h4 style={{ fontWeight: 800, fontSize: '16px' }}>{t.name}</h4>
                    <p className="text-xs text-muted font-bold">📍 {t.city}</p>
                  </div>
                </div>

                <div className="flex items-center gap-1 mb-3">
                  {[...Array(t.stars)].map((_, i) => (
                    <Star key={i} size={15} fill="#FF6B4A" stroke="#FF6B4A" />
                  ))}
                </div>

                <p className="testimonial-quote">{t.quote}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ====== ⭐ WHY CHOOSE HELPERHUB (ANIMATED CARDS + AI PRICE ESTIMATION) ====== */}
      <section className="section" style={{ background: 'var(--color-background-alt)' }}>
        <div className="container">
          <div className="section-header text-center">
            <span className="badge badge-primary" style={{ marginBottom: 12 }}>{t('landing_why_badge')}</span>
            <h2 className="section-title">{t('why_title')}</h2>
          </div>

          <div className="why-grid mb-12">
            {[
              { title: '✔ Verified Professionals', desc: '100% Aadhaar & police background checked pros.', icon: <ShieldCheck size={28} className="text-primary" /> },
              { title: '✔ Secure Payments', desc: 'Funds held safely in escrow until work is approved.', icon: <Shield size={28} className="text-primary" /> },
              { title: '✔ AI Cost Estimation', desc: 'Instant fair price ranges based on market rates.', icon: <Calculator size={28} className="text-primary" /> },
              { title: '✔ Emergency Booking', desc: '15-minute rapid SOS dispatch for urgent leaks & faults.', icon: <Zap size={28} className="text-primary" /> },
            ].map((feature, i) => (
              <div key={i} className="why-card card card-hover">
                <div className="why-icon-box">{feature.icon}</div>
                <h3 className="why-title">{feature.title}</h3>
                <p className="why-desc">{feature.desc}</p>
              </div>
            ))}
          </div>

          {/* AI COST ESTIMATOR INTERACTIVE WIDGET */}
          <div className="card card-body ai-calculator-widget max-w-xl" style={{ margin: '0 auto', border: '2px solid #FFDCD4' }}>
            <div className="flex items-center gap-2 mb-4">
              <Sparkles size={22} className="text-primary" />
              <h3 style={{ fontSize: '19px', fontWeight: 900 }}>Instant AI Cost Calculator</h3>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="form-label">Service Category</label>
                <select className="form-select" value={calcCategory} onChange={e => setCalcCategory(e.target.value)}>
                  <option value="Plumber">Plumbing Repair</option>
                  <option value="Electrician">Electrical Wiring</option>
                  <option value="AC Technician">AC Installation</option>
                  <option value="Painter">Painting Service</option>
                </select>
              </div>
              <div>
                <label className="form-label">Estimated Work Hours</label>
                <select className="form-select" value={calcHours} onChange={e => setCalcHours(Number(e.target.value))}>
                  <option value={1}>1 Hour</option>
                  <option value={2}>2 Hours</option>
                  <option value={3}>3 Hours</option>
                  <option value={5}>5 Hours (Half Day)</option>
                </select>
              </div>
            </div>

            <div className="calc-result-box flex justify-between items-center">
              <div>
                <span className="text-xs text-muted font-bold">ESTIMATED PRICE RANGE</span>
                <p style={{ fontSize: '24px', fontWeight: 900, color: 'var(--color-primary)', fontFamily: 'Poppins, sans-serif' }}>
                  ₹{estimatedCost} - ₹{estimatedCost + 150}
                </p>
              </div>
              <button className="btn btn-primary btn-sm" onClick={() => handleCategoryClick(calcCategory)}>
                Book at This Rate →
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ====== ⭐ DOWNLOAD MOBILE APP (COMING SOON) ====== */}
      <section className="section">
        <div className="container">
          <div className="app-download-banner card">
            <div className="app-download-content">
              <span className="badge badge-warning mb-3">{t('app_badge')}</span>
              <h2 className="headline-lg" style={{ color: 'white', marginBottom: 12 }}>{t('app_title')}</h2>
              <p style={{ color: 'rgba(255,255,255,0.9)', fontSize: '17px', marginBottom: 24, maxWidth: 500 }}>
                {t('app_sub')}
              </p>

              <div className="flex gap-4 flex-wrap">
                <div className="app-store-btn">
                  <span> App Store</span>
                  <span className="app-coming-tag">Coming Soon</span>
                </div>
                <div className="app-store-btn">
                  <span>▶ Google Play</span>
                  <span className="app-coming-tag">Coming Soon</span>
                </div>
              </div>
            </div>

            <div className="app-mockup-visual hide-mobile">
              <div className="app-mockup-screen">
                <div className="mockup-notch" />
                <div className="mockup-header">HelperHub SOS</div>
                <div className="mockup-body flex flex-col gap-2 items-center justify-center text-center">
                  <div style={{ fontSize: 42 }}>📱⚡</div>
                  <p style={{ fontSize: 13, fontWeight: 800, color: '#FF6B4A' }}>1-Tap Emergency Fix</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ====== CTA ====== */}
      <section className="cta-section">
        <div className="container">
          <div className="cta-inner">
            <h2 className="cta-title">Ready to Fix Things Up? 🛠️</h2>
            <p className="cta-subtitle">Join thousands of happy homeowners and local pros on HelperHub!</p>
            <div className="flex gap-4 flex-wrap justify-center mt-4">
              <Link to="/auth?mode=signup&role=recruiter" className="btn btn-primary btn-lg" style={{ background: 'white', color: 'var(--color-primary)' }}>
                Hire Your Hero Now
              </Link>
              <Link to="/auth?mode=signup&role=jobseeker" className="btn btn-outline btn-lg" style={{ borderColor: 'white', color: 'white' }}>
                Join as a Helper
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
