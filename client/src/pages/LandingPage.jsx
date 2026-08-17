import "./LandingPage.css";
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Star, ShieldCheck, Zap, ArrowRight, CheckCircle2, Clock, ThumbsUp, Calculator, Smartphone, Sparkles, AlertTriangle, Layers, Award, Shield } from 'lucide-react';
import api from '../services/api';
import HelperCard from '../components/helper/HelperCard';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

const CATEGORIES = [
  { name: 'Plumber', key: 'cat_plumber', icon: '🔧', color: '#FFEFEA', border: '#FFC4B6' },
  { name: 'Electrician', key: 'cat_electrician', icon: '⚡', color: '#FFF8E5', border: '#FFE5A3' },
  { name: 'Carpenter', key: 'cat_carpenter', icon: '🪚', color: '#E6F8F6', border: '#A8EADB' },
  { name: 'AC Technician', key: 'cat_ac', icon: '❄️', color: '#EBF5FF', border: '#B8DCFF' },
  { name: 'Painter', key: 'cat_painter', icon: '🎨', color: '#F5EEFD', border: '#DCBEFB' },
  { name: 'Cleaner', key: 'cat_cleaner', icon: '🧹', color: '#E6F8F6', border: '#A8EADB' },
  { name: 'Mechanic', key: 'cat_mechanic', icon: '🔩', color: '#FFEFEA', border: '#FFC4B6' },
  { name: 'Gardener', key: 'cat_gardener', icon: '🌿', color: '#EBFBF3', border: '#A2F3C8' },
];

export default function LandingPage() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [featuredHelpers, setFeaturedHelpers] = useState([]);
  const [loadingHelpers, setLoadingHelpers] = useState(true);

  // AI Cost Estimation Widget State
  const [estForm, setEstForm] = useState({ serviceType: 'Plumber', jobDescription: '', city: 'Mumbai' });
  const [estResult, setEstResult] = useState(null);
  const [estLoading, setEstLoading] = useState(false);
  const [estError, setEstError] = useState('');

  const handleEstimate = async (e) => {
    e.preventDefault();
    if (!estForm.jobDescription.trim() || estForm.jobDescription.trim().length < 10) {
      setEstError(t('ai_est_error_min_len'));
      return;
    }
    setEstLoading(true);
    setEstError('');
    setEstResult(null);
    try {
      const res = await api.post('/estimate', estForm);
      setEstResult(res.data.estimate);
    } catch (err) {
      setEstError(err.response?.data?.message || 'AI estimate unavailable. Please try again.');
    } finally {
      setEstLoading(false);
    }
  };

  const navigate = useNavigate();

  useEffect(() => {
    const fetchHelpers = async () => {
      try {
        const res = await api.get('/helpers?limit=6');
        const profiles = res.data?.profiles || res.data || [];
        setFeaturedHelpers(Array.isArray(profiles) ? profiles : []);
      } catch (err) {
        console.error('Error loading featured helpers:', err);
      } finally {
        setLoadingHelpers(false);
      }
    };
    fetchHelpers();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchQuery.trim()) params.append('q', searchQuery.trim());
    if (selectedCategory) params.append('category', selectedCategory);
    navigate(`/helpers?${params.toString()}`);
  };

  const handleCategoryClick = (cat) => {
    navigate(`/helpers?category=${encodeURIComponent(cat)}`);
  };

  // 5-step workflow telling the platform story
  const FIVE_STEPS = [
    { step: '1', title: t('how_step1_title'), desc: t('how_step1_desc') },
    { step: '2', title: t('how_step2_title'), desc: t('how_step2_desc') },
    { step: '3', title: t('how_step3_title'), desc: t('how_step3_desc') },
    { step: '4', title: t('how_step4_title'), desc: t('how_step4_desc') },
    { step: '5', title: t('how_step5_title'), desc: t('how_step5_desc') },
  ];

  // Live completed jobs feed (makes platform feel alive)
  const RECENT_COMPLETED_JOBS = [
    { title: t('job_kitchen_sink'), location: 'Andheri West, Mumbai', timeAgo: '2 ' + t('general_hrs') + ' ago', rating: 5, category: t('cat_plumber'), price: '₹600' },
    { title: t('job_split_ac'), location: 'Koramangala, Bangalore', timeAgo: t('general_today'), rating: 5, category: t('cat_ac'), price: '₹1,500' },
    { title: t('job_living_room_paint'), location: 'Bandra, Mumbai', timeAgo: '4 ' + t('general_hrs') + ' ago', rating: 5, category: t('cat_painter'), price: '₹3,200' },
    { title: t('job_mcb_tripping'), location: 'South Ex, Delhi', timeAgo: '6 ' + t('general_hrs') + ' ago', rating: 5, category: t('cat_electrician'), price: '₹450' },
    { title: t('job_door_repair'), location: 'HSR Layout, Bangalore', timeAgo: '8 ' + t('general_hrs') + ' ago', rating: 5, category: t('cat_carpenter'), price: '₹800' },
  ];

  // Customer Testimonials
  const TESTIMONIALS = [
    {
      name: 'Priya Sharma',
      city: 'Mumbai',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
      stars: 5,
      quote: t('test_1_quote'),
    },
    {
      name: 'Anand Verma',
      city: 'Bangalore',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      stars: 5,
      quote: t('test_2_quote'),
    },
    {
      name: 'Meera Nair',
      city: 'Delhi',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
      stars: 5,
      quote: t('test_3_quote'),
    },
  ];

  const WHY_FEATURES = [
    { title: t('why_1_title'), desc: t('why_1_desc'), icon: <ShieldCheck size={28} className="text-primary" /> },
    { title: t('why_2_title'), desc: t('why_2_desc'), icon: <Shield size={28} className="text-primary" /> },
    { title: t('why_3_title'), desc: t('why_3_desc'), icon: <Calculator size={28} className="text-primary" /> },
    { title: t('why_4_title'), desc: t('why_4_desc'), icon: <Zap size={28} className="text-primary" /> },
  ];

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
                  {CATEGORIES.map(c => <option key={c.name} value={c.name}>{c.icon} {t(c.key, c.name)}</option>)}
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
                  {c.icon} {t(c.key, c.name)}
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
                  <span style={{ fontSize: 13, fontWeight: 800, color: 'var(--color-on-surface)' }}>{t(cat.key, cat.name)}</span>
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
                <span className="category-name">{t(cat.key, cat.name)}</span>
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

      {/* ====== TOP HELPERS ====== */}
      <section className="section">
        <div className="container">
          <div className="flex justify-between items-end mb-8 flex-wrap gap-4">
            <div>
              <span className="badge badge-primary mb-2">{t('landing_top_badge')}</span>
              <h2 className="headline-lg">{t('top_title')}</h2>
              <p className="text-secondary">{t('top_sub')}</p>
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
              <p className="empty-state-title">{t('landing_no_helpers')}</p>
            </div>
          )}
        </div>
      </section>

      {/* ====== ⭐ RECENT JOBS COMPLETED ====== */}
      <section className="section" style={{ background: '#FFF4EC' }}>
        <div className="container">
          <div className="section-header text-center">
            <span className="badge badge-primary" style={{ marginBottom: 12 }}>{t('landing_live_activity')}</span>
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
            {TESTIMONIALS.map((tItem) => (
              <div key={tItem.name} className="testimonial-card card card-hover">
                <div className="flex items-center gap-3 mb-4">
                  <img src={tItem.avatar} alt={tItem.name} className="avatar avatar-md avatar-ring" />
                  <div>
                    <h4 style={{ fontWeight: 800, fontSize: '16px' }}>{tItem.name}</h4>
                    <p className="text-xs text-muted font-bold">📍 {tItem.city}</p>
                  </div>
                </div>

                <div className="flex items-center gap-1 mb-3">
                  {[...Array(tItem.stars)].map((_, i) => (
                    <Star key={i} size={15} fill="#FF6B4A" stroke="#FF6B4A" />
                  ))}
                </div>

                <p className="testimonial-quote">{tItem.quote}</p>
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
            {WHY_FEATURES.map((feature, i) => (
              <div key={i} className="why-card card card-hover">
                <div className="why-icon-box">{feature.icon}</div>
                <h3 className="why-title">{feature.title}</h3>
                <p className="why-desc">{feature.desc}</p>
              </div>
            ))}
          </div>

          {/* ====== AI COST ESTIMATOR — Powered by Claude (Anthropic/OpenRouter) ====== */}
          <form onSubmit={handleEstimate} className="card card-body ai-calculator-widget" style={{ margin: '0 auto', maxWidth: 600, border: '2px solid #FFDCD4' }}>
            <div className="flex items-center gap-2 mb-2">
              <Sparkles size={22} className="text-primary" />
              <h3 style={{ fontSize: '19px', fontWeight: 900 }}>{t('ai_est_title')}</h3>
              <span className="badge badge-primary" style={{ marginLeft: 'auto', fontSize: 11 }}>{t('ai_est_badge')}</span>
            </div>
            <p className="text-secondary" style={{ fontSize: 13, marginBottom: 16 }}>{t('ai_est_subtitle')}</p>

            <div className="grid grid-cols-2 gap-3 mb-3">
              <div>
                <label className="form-label">{t('ai_est_service_type')}</label>
                <select
                  className="form-select"
                  value={estForm.serviceType}
                  onChange={e => setEstForm(f => ({ ...f, serviceType: e.target.value }))}
                >
                  {CATEGORIES.map(s => (
                    <option key={s.name} value={s.name}>{t(s.key, s.name)}</option>
                  ))}
                  <option value="General Repair">{t('cat_repair', 'General Repair')}</option>
                </select>
              </div>
              <div>
                <label className="form-label">{t('ai_est_city')}</label>
                <select
                  className="form-select"
                  value={estForm.city}
                  onChange={e => setEstForm(f => ({ ...f, city: e.target.value }))}
                >
                  {['Mumbai','Delhi','Bangalore','Chennai','Hyderabad','Pune','Kolkata','Ahmedabad','Jaipur'].map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="mb-3">
              <label className="form-label">{t('ai_est_job_desc')} <span style={{ color: 'var(--color-outline)', fontWeight: 400 }}>{t('ai_est_job_desc_hint')}</span></label>
              <textarea
                className="form-input"
                rows={3}
                placeholder={t('ai_est_placeholder')}
                value={estForm.jobDescription}
                onChange={e => setEstForm(f => ({ ...f, jobDescription: e.target.value }))}
                style={{ resize: 'vertical', fontFamily: 'inherit' }}
              />
            </div>

            {estError && (
              <div style={{ background: '#FFF0ED', border: '1px solid #FFC4B6', borderRadius: 8, padding: '10px 14px', color: '#C0392B', fontSize: 13, marginBottom: 12 }}>
                ⚠️ {estError}
              </div>
            )}

            {estResult && !estLoading && (
              <div className="calc-result-box" style={{ marginBottom: 12 }}>
                <div className="flex justify-between items-start" style={{ flexWrap: 'wrap', gap: 8 }}>
                  <div>
                    <span className="text-xs text-muted font-bold">{t('ai_est_price_range')}</span>
                    <p style={{ fontSize: '26px', fontWeight: 900, color: 'var(--color-primary)', fontFamily: 'Poppins, sans-serif', lineHeight: 1.2 }}>
                      ₹{estResult.min_cost.toLocaleString('en-IN')} – ₹{estResult.max_cost.toLocaleString('en-IN')}
                    </p>
                  </div>
                  <span className="badge" style={{
                    background: estResult.confidence === 'high' ? '#D1FAE5' : estResult.confidence === 'medium' ? '#FEF3C7' : '#FEE2E2',
                    color: estResult.confidence === 'high' ? '#065F46' : estResult.confidence === 'medium' ? '#92400E' : '#991B1B',
                    fontWeight: 700, fontSize: 12, padding: '4px 10px'
                  }}>
                    {estResult.confidence === 'high' ? t('ai_est_high_conf') : estResult.confidence === 'medium' ? t('ai_est_med_conf') : t('ai_est_low_conf')}
                  </span>
                </div>
                <p style={{ fontSize: 13, color: 'var(--color-on-surface-variant)', marginTop: 8, lineHeight: 1.5 }}>
                  💡 {estResult.reasoning}
                </p>
                <button type="button" className="btn btn-primary btn-sm" style={{ marginTop: 10 }} onClick={() => handleCategoryClick(estForm.serviceType)}>
                  {t('ai_est_book_prefix')} {t(CATEGORIES.find(c => c.name === estForm.serviceType)?.key || '', estForm.serviceType)} →
                </button>
              </div>
            )}

            <button type="submit" className="btn btn-primary w-full" disabled={estLoading}>
              {estLoading ? (
                <span style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center' }}>
                  <span style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,0.4)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin 0.8s linear infinite', display: 'inline-block' }} />
                  {t('ai_est_loading')}
                </span>
              ) : t('ai_est_get_btn')}
            </button>
          </form>
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
                  <span>{t('app_ios')}</span>
                  <span className="app-coming-tag">{t('app_badge')}</span>
                </div>
                <div className="app-store-btn">
                  <span>{t('app_android')}</span>
                  <span className="app-coming-tag">{t('app_badge')}</span>
                </div>
              </div>
            </div>

            <div className="app-mockup-visual hide-mobile">
              <div className="app-mockup-screen">
                <div className="mockup-notch" />
                <div className="mockup-header">{t('app_mockup_title')}</div>
                <div className="mockup-body flex flex-col gap-2 items-center justify-center text-center">
                  <div style={{ fontSize: 42 }}>📱⚡</div>
                  <p style={{ fontSize: 13, fontWeight: 800, color: '#FF6B4A' }}>{t('app_mockup_desc')}</p>
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
            <h2 className="cta-title">{t('cta_hire_title')}</h2>
            <p className="cta-subtitle">{t('cta_hire_sub')}</p>
            <div className="flex gap-4 flex-wrap justify-center mt-4">
              <Link to="/auth?mode=signup&role=recruiter" className="btn btn-primary btn-lg" style={{ background: 'white', color: 'var(--color-primary)' }}>
                {t('cta_hire_btn')}
              </Link>
              <Link to="/auth?mode=signup&role=jobseeker" className="btn btn-outline btn-lg" style={{ borderColor: 'white', color: 'white' }}>
                {t('cta_work_btn')}
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
