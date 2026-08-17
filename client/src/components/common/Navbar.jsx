import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  Menu, X, Search, ChevronDown, LogOut, LayoutDashboard,
  Bell, Sun, Moon, Globe, CheckCircle2, CreditCard,
  MapPin, Star, MessageSquare, Briefcase
} from 'lucide-react';

// DEMO_NOTIFICATIONS moved inside component for translation

import { useLanguage } from '../../context/LanguageContext';

const LANGUAGES = [
  { code: 'en', label: 'English', native: 'EN' },
  { code: 'hi', label: 'Hindi', native: 'हि' },
  { code: 'mr', label: 'Marathi', native: 'म' },
  { code: 'ml', label: 'Malayalam', native: 'മ' },
  { code: 'te', label: 'Telugu', native: 'తె' },
  { code: 'ta', label: 'Tamil', native: 'த' },
  { code: 'kn', label: 'Kannada', native: 'ಕ' },
];

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { t, changeLang, lang } = useLanguage();
  
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('hh-theme') === 'dark');

  const DEMO_NOTIFICATIONS = [
    { id: 1, read: false, time: '2 min ago', icon: <CheckCircle2 size={17} style={{ color: '#2EC4B6' }} />, title: t('notif_1_title'), body: t('notif_1_body') },
    { id: 2, read: false, time: '15 min ago', icon: <CreditCard size={17} style={{ color: '#FF6B4A' }} />, title: t('notif_2_title'), body: t('notif_2_body') },
    { id: 3, read: false, time: '32 min ago', icon: <MapPin size={17} style={{ color: '#9B5DE5' }} />, title: t('notif_3_title'), body: t('notif_3_body') },
    { id: 4, read: true, time: '2 hrs ago', icon: <Briefcase size={17} style={{ color: '#FFB703' }} />, title: t('notif_4_title'), body: t('notif_4_body') },
    { id: 5, read: true, time: '1 day ago', icon: <Star size={17} style={{ color: '#FFB703' }} />, title: t('notif_5_title'), body: t('notif_5_body') },
  ];

  const [notifications, setNotifications] = useState(DEMO_NOTIFICATIONS);
  const activeLang = LANGUAGES.find(l => l.code === lang) || LANGUAGES[0];

  const notifRef = useRef(null);
  const langRef = useRef(null);
  const profileRef = useRef(null);

  const unreadCount = notifications.filter(n => !n.read).length;

  // Apply dark mode to <html> element
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', darkMode ? 'dark' : 'light');
    localStorage.setItem('hh-theme', darkMode ? 'dark' : 'light');
  }, [darkMode]);

  // Close dropdowns on outside click
  useEffect(() => {
    const handler = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) setNotifOpen(false);
      if (langRef.current && !langRef.current.contains(e.target)) setLangOpen(false);
      if (profileRef.current && !profileRef.current.contains(e.target)) setProfileOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
    setProfileOpen(false);
  };

  const dashboardPath = user?.role === 'recruiter'
    ? '/recruiter'
    : user?.role === 'jobseeker'
    ? '/jobseeker'
    : '/admin';

  const initials = user?.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'U';

  const markAllRead = () => setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  const markRead = (id) => setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));

  const handleLangSelect = (langOption) => {
    changeLang(langOption.code);
    setLangOpen(false);
  };

  return (
    <nav className="navbar">
      <div className="container">
        <div className="navbar-inner">

          {/* ── LOGO ── */}
          <Link to="/" className="navbar-logo">
            <div className="navbar-logo-icon">🛠️</div>
            <span>HelperHub</span>
          </Link>

          {/* ── NAV LINKS ── */}
          <div className="navbar-links hide-mobile">
            <Link to="/helpers" className="navbar-link">
              <Search size={15} /> {t('nav_find')}
            </Link>
            <Link to="/about" className="navbar-link">{t('nav_how')}</Link>
          </div>

          {/* ── RIGHT ACTIONS ── */}
          <div className="navbar-actions">

            {/* ── LANGUAGE SELECTOR ── */}
            <div ref={langRef} style={{ position: 'relative' }}>
              <button
                className="nav-icon-btn"
                onClick={() => { setLangOpen(o => !o); setNotifOpen(false); setProfileOpen(false); }}
                title="Change Language"
              >
                <Globe size={18} />
                <span className="nav-lang-badge">{activeLang.native}</span>
              </button>

              {langOpen && (
                <div className="nav-dropdown lang-dropdown animate-dropDown">
                  <div className="nav-dropdown-header">
                    <Globe size={14} /> {t('nav_language')} / भाषा
                  </div>
                  {LANGUAGES.map(lang => (
                    <button
                      key={lang.code}
                      className={`lang-option ${activeLang.code === lang.code ? 'lang-option-active' : ''}`}
                      onClick={() => handleLangSelect(lang)}
                    >
                      <span className="lang-native">{lang.native}</span>
                      <span>{lang.label}</span>
                      {activeLang.code === lang.code && <span className="lang-check">✓</span>}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* ── DARK MODE TOGGLE ── */}
            <button
              className={`nav-theme-toggle ${darkMode ? 'nav-theme-dark' : ''}`}
              onClick={() => setDarkMode(d => !d)}
              title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              <div className="nav-theme-track">
                <div className="nav-theme-thumb">
                  {darkMode ? <Moon size={12} /> : <Sun size={12} />}
                </div>
              </div>
              <span className="nav-theme-label hide-mobile">
                {darkMode ? t('nav_dark') : t('nav_light')}
              </span>
            </button>

            {/* ── BELL / NOTIFICATIONS ── */}
            <div ref={notifRef} style={{ position: 'relative' }}>
              <button
                className="nav-icon-btn"
                onClick={() => { setNotifOpen(o => !o); setLangOpen(false); setProfileOpen(false); }}
                title="Notifications"
              >
                <Bell size={20} />
                {unreadCount > 0 && (
                  <span className="nav-notif-badge animate-pulse">{unreadCount}</span>
                )}
              </button>

              {notifOpen && (
                <div className="nav-dropdown notif-dropdown animate-dropDown">
                  <div className="notif-header">
                    <span className="notif-title">🔔 {t('nav_notifications')}</span>
                    {unreadCount > 0 && (
                      <button className="notif-mark-all" onClick={markAllRead}>{t('nav_mark_all_read')}</button>
                    )}
                  </div>
                  <div className="notif-list">
                    {notifications.map(n => (
                      <div
                        key={n.id}
                        className={`notif-item ${!n.read ? 'notif-unread' : ''}`}
                        onClick={() => markRead(n.id)}
                      >
                        <div className="notif-icon-wrap">{n.icon}</div>
                        <div className="notif-content">
                          <p className="notif-item-title">{n.title}</p>
                          <p className="notif-item-body">{n.body}</p>
                          <span className="notif-time">{n.time}</span>
                        </div>
                        {!n.read && <div className="notif-dot" />}
                      </div>
                    ))}
                  </div>
                  <div className="notif-footer">
                    <Link to="/notifications" onClick={() => setNotifOpen(false)}>
                      {t('nav_view_all')}
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* ── USER PROFILE ── */}
            {user ? (
              <div ref={profileRef} className="navbar-user" onClick={() => { setProfileOpen(!profileOpen); setNotifOpen(false); setLangOpen(false); }}>
                <div className="avatar-placeholder avatar-sm avatar-ring" style={{ fontSize: '13px' }}>{initials}</div>
                <span className="hide-mobile" style={{ fontSize: '15px', fontWeight: 700 }}>{user.name.split(' ')[0]}</span>
                <ChevronDown size={14} className="hide-mobile" />

                {profileOpen && (
                  <div className="navbar-dropdown animate-fadeIn">
                    <div className="navbar-dropdown-header">
                      <p style={{ fontWeight: 700 }}>{user.name}</p>
                      <span className="badge badge-primary" style={{ fontSize: '11px', marginTop: 4 }}>
                        {user.role === 'recruiter' ? 'Homeowner' : user.role === 'jobseeker' ? 'Fix-It Pro' : 'Admin'}
                      </span>
                    </div>
                    <div style={{ height: 1, background: 'var(--color-outline-variant)', margin: '4px 0' }} />
                    <Link to={dashboardPath} className="navbar-dropdown-item" onClick={() => setProfileOpen(false)}>
                      <LayoutDashboard size={16} /> {t('nav_dashboard')}
                    </Link>
                    <button className="navbar-dropdown-item text-error" onClick={handleLogout}>
                      <LogOut size={16} /> {t('nav_signout')}
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link to="/auth?mode=login" className="btn btn-primary btn-sm">{t('nav_signin')}</Link>
              </>
            )}

            {/* ── HAMBURGER ── */}
            <button className="btn btn-ghost btn-icon hide-desktop" onClick={() => setMenuOpen(!menuOpen)}>
              {menuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </div>

      {/* ── MOBILE MENU ── */}
      {menuOpen && (
        <div className="navbar-mobile-menu animate-fadeIn">
          <div className="container">
            <Link to="/helpers" className="navbar-mobile-link" onClick={() => setMenuOpen(false)}>🔍 {t('nav_find')}</Link>
            {user ? (
              <>
                <Link to={dashboardPath} className="navbar-mobile-link" onClick={() => setMenuOpen(false)}>⚡ {t('nav_dashboard')}</Link>
                <button className="navbar-mobile-link text-error" style={{ textAlign: 'left', width: '100%' }} onClick={handleLogout}>{t('nav_signout')}</button>
              </>
            ) : (
              <Link to="/auth?mode=login" className="btn btn-primary w-full" onClick={() => setMenuOpen(false)}>{t('nav_signin')}</Link>
            )}
          </div>
        </div>
      )}

      <style>{`
        /* ── BASE NAVBAR ───────────────────────────────── */
        .navbar {
          position: sticky; top: 0; z-index: 500;
          background: var(--nav-bg, rgba(255,249,245,0.94));
          backdrop-filter: blur(16px);
          border-bottom: 1.5px solid var(--nav-border, #F6ECE5);
          transition: background 0.3s, border-color 0.3s;
        }
        .navbar-inner {
          display: flex; align-items: center;
          justify-content: space-between;
          height: 68px; gap: 16px;
        }
        .navbar-logo {
          display: flex; align-items: center; gap: 10px;
          font-size: 22px; font-weight: 900;
          font-family: 'Poppins', sans-serif;
          color: var(--color-primary); letter-spacing: -0.02em;
        }
        .navbar-logo-icon {
          width: 40px; height: 40px;
          background: linear-gradient(135deg,#FFEFEA 0%,#FFDCD4 100%);
          border-radius: 12px;
          display: flex; align-items: center; justify-content: center;
          font-size: 20px; border: 2px solid #FFC4B6;
        }
        .navbar-links { display: flex; align-items: center; gap: 8px; flex: 1; justify-content: center; }
        .navbar-link {
          display: flex; align-items: center; gap: 6px;
          padding: 8px 16px; border-radius: 999px;
          font-size: 15px; font-weight: 700;
          color: var(--color-on-surface-variant);
          transition: all 0.2s;
        }
        .navbar-link:hover { background: var(--color-primary-light); color: var(--color-primary); }
        .navbar-actions { display: flex; align-items: center; gap: 6px; }

        /* ── ICON BUTTONS ──────────────────────────────── */
        .nav-icon-btn {
          position: relative;
          width: 40px; height: 40px; border-radius: 50%;
          border: 1.5px solid var(--nav-border, #F0E6DF);
          background: var(--nav-btn-bg, white);
          display: flex; align-items: center; justify-content: center;
          cursor: pointer; color: var(--color-on-surface-variant);
          transition: all 0.2s;
        }
        .nav-icon-btn:hover { border-color: var(--color-primary); color: var(--color-primary); background: var(--color-primary-light); }

        /* ── NOTIFICATION BADGE ────────────────────────── */
        .nav-notif-badge {
          position: absolute; top: -4px; right: -4px;
          background: #FF6B4A; color: white;
          font-size: 10px; font-weight: 900;
          width: 18px; height: 18px; border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          border: 2px solid var(--nav-bg, white);
          font-family: 'Poppins', sans-serif;
        }
        @keyframes pulse { 0%,100%{transform:scale(1)} 50%{transform:scale(1.18)} }
        .animate-pulse { animation: pulse 2s ease-in-out infinite; }

        /* ── LANGUAGE BADGE ────────────────────────────── */
        .nav-lang-badge {
          position: absolute; bottom: -4px; right: -4px;
          background: var(--color-secondary); color: white;
          font-size: 9px; font-weight: 900;
          padding: 1px 5px; border-radius: 999px;
          border: 2px solid var(--nav-bg, white);
          font-family: 'Poppins', sans-serif;
          white-space: nowrap;
        }

        /* ── DARK MODE TOGGLE ──────────────────────────── */
        .nav-theme-toggle {
          display: flex; align-items: center; gap: 7px;
          background: var(--nav-btn-bg, white);
          border: 1.5px solid var(--nav-border, #F0E6DF);
          border-radius: 999px; padding: 5px 12px 5px 5px;
          cursor: pointer; transition: all 0.3s;
          color: var(--color-on-surface-variant);
        }
        .nav-theme-toggle:hover { border-color: var(--color-primary); }
        .nav-theme-track {
          width: 28px; height: 16px;
          background: #F0E6DF;
          border-radius: 999px; position: relative;
          transition: background 0.3s;
        }
        .nav-theme-dark .nav-theme-track { background: linear-gradient(135deg,#9B5DE5,#6B3FA0); }
        .nav-theme-thumb {
          position: absolute;
          width: 20px; height: 20px; border-radius: 50%;
          background: var(--color-background);
          box-shadow: 0 2px 6px rgba(0,0,0,0.2);
          top: -2px; left: -2px;
          display: flex; align-items: center; justify-content: center;
          transition: transform 0.3s cubic-bezier(0.34,1.56,0.64,1);
          color: #FFB703;
        }
        .nav-theme-dark .nav-theme-thumb {
          transform: translateX(12px);
          color: #9B5DE5;
        }
        .nav-theme-label { font-size: 13px; font-weight: 800; }

        /* ── DROPDOWN BASE ─────────────────────────────── */
        .nav-dropdown {
          position: absolute; top: calc(100% + 12px); right: 0;
          background: var(--nav-dropdown-bg, white);
          border-radius: 20px;
          box-shadow: 0 20px 50px rgba(0,0,0,0.14), 0 4px 12px rgba(0,0,0,0.06);
          border: 1.5px solid var(--nav-border, #F6ECE5);
          z-index: 600; overflow: hidden;
        }
        @keyframes dropDown {
          from { opacity:0; transform:translateY(-10px) scale(0.97); }
          to   { opacity:1; transform:translateY(0) scale(1); }
        }
        .animate-dropDown { animation: dropDown 0.22s cubic-bezier(0.34,1.56,0.64,1) forwards; }
        .nav-dropdown-header {
          display: flex; align-items: center; gap: 7px;
          padding: 12px 16px 8px;
          font-size: 12px; font-weight: 900; letter-spacing: 0.06em; text-transform: uppercase;
          color: var(--color-outline);
          border-bottom: 1.5px solid var(--nav-border, #F6ECE5);
        }

        /* ── LANGUAGE DROPDOWN ─────────────────────────── */
        .lang-dropdown { min-width: 180px; }
        .lang-option {
          width: 100%; display: flex; align-items: center; gap: 12px;
          padding: 11px 16px;
          background: none; border: none; cursor: pointer;
          font-size: 14px; font-weight: 700;
          color: var(--color-on-surface);
          transition: background 0.15s;
          font-family: 'Nunito', sans-serif;
        }
        .lang-option:hover { background: var(--color-primary-light); color: var(--color-primary); }
        .lang-option-active { color: var(--color-primary) !important; background: var(--color-primary-light) !important; }
        .lang-native {
          width: 28px; height: 28px; border-radius: 50%;
          background: var(--color-surface-container, #FFEBE0);
          display: flex; align-items: center; justify-content: center;
          font-size: 13px; font-weight: 900; flex-shrink: 0;
          color: var(--color-primary);
        }
        .lang-check { margin-left: auto; color: var(--color-secondary); font-weight: 900; font-size: 16px; }

        /* ── NOTIFICATION DROPDOWN ─────────────────────── */
        .notif-dropdown { width: 360px; right: 0; }
        .notif-header {
          display: flex; align-items: center; justify-content: space-between;
          padding: 14px 18px 12px;
          border-bottom: 1.5px solid var(--nav-border, #F6ECE5);
        }
        .notif-title { font-size: 16px; font-weight: 900; font-family: 'Poppins', sans-serif; }
        .notif-mark-all {
          font-size: 12px; font-weight: 800; color: var(--color-primary);
          background: none; border: none; cursor: pointer;
        }
        .notif-mark-all:hover { text-decoration: underline; }
        .notif-list { max-height: 340px; overflow-y: auto; }
        .notif-list::-webkit-scrollbar { width: 3px; }
        .notif-list::-webkit-scrollbar-thumb { background: #F0E6DF; border-radius: 2px; }
        .notif-item {
          display: flex; align-items: flex-start; gap: 12px;
          padding: 13px 18px; cursor: pointer;
          transition: background 0.15s; position: relative;
          border-bottom: 1px solid var(--nav-border, #F6ECE5);
        }
        .notif-item:hover { background: var(--color-surface-container-low, #FFF4EC); }
        .notif-unread { background: var(--notif-unread-bg, #FFF9F5); }
        .notif-icon-wrap {
          width: 36px; height: 36px; border-radius: 10px;
          background: var(--color-surface-container, #FFEBE0);
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
        }
        .notif-content { flex: 1; }
        .notif-item-title { font-size: 13.5px; font-weight: 800; line-height: 1.3; }
        .notif-item-body { font-size: 12.5px; font-weight: 600; color: var(--color-outline); margin-top: 2px; line-height: 1.4; }
        .notif-time { font-size: 11px; font-weight: 800; color: var(--color-primary); margin-top: 4px; display: block; }
        .notif-dot {
          width: 8px; height: 8px; border-radius: 50%;
          background: #FF6B4A; flex-shrink: 0; margin-top: 6px;
        }
        .notif-footer {
          padding: 10px 18px; text-align: center;
          border-top: 1.5px solid var(--nav-border, #F6ECE5);
        }
        .notif-footer a { font-size: 13px; font-weight: 800; color: var(--color-primary); }
        .notif-footer a:hover { text-decoration: underline; }

        /* ── PROFILE DROPDOWN ──────────────────────────── */
        .navbar-user {
          position: relative;
          display: flex; align-items: center; gap: 8px;
          padding: 6px 14px; border-radius: 999px;
          background: var(--nav-btn-bg, white);
          border: 1.5px solid var(--nav-border, #F6ECE5);
          cursor: pointer;
          box-shadow: 0 2px 4px rgba(255,107,74,0.04);
          transition: all 0.2s;
        }
        .navbar-user:hover { border-color: var(--color-primary-container); }
        .navbar-dropdown {
          position: absolute; top: calc(100% + 10px); right: 0;
          min-width: 210px;
          background: var(--nav-dropdown-bg, white);
          border-radius: 16px;
          box-shadow: 0 20px 50px rgba(0,0,0,0.14);
          border: 1.5px solid var(--nav-border, #F6ECE5);
          padding: 8px; z-index: 600;
        }
        .navbar-dropdown-header { padding: 8px 12px; }
        .navbar-dropdown-item {
          display: flex; align-items: center; gap: 10px;
          width: 100%; padding: 10px 12px;
          font-size: 14.5px; font-weight: 700;
          color: var(--color-on-surface);
          border-radius: 10px;
          transition: background 0.15s;
          background: none; border: none; cursor: pointer;
          font-family: 'Nunito', sans-serif;
        }
        .navbar-dropdown-item:hover { background: var(--color-primary-light); color: var(--color-primary); }

        /* ── MOBILE ────────────────────────────────────── */
        .navbar-mobile-menu {
          border-top: 1.5px solid var(--nav-border, #F6ECE5);
          padding: 16px 0;
          background: var(--nav-bg, rgba(255,249,245,0.98));
        }
        .navbar-mobile-link { display: block; padding: 12px; font-size: 16px; font-weight: 700; border-radius: 12px; }
        @media (max-width: 768px) { .hide-mobile { display: none !important; } }
        @media (min-width: 769px) { .hide-desktop { display: none !important; } }

        /* Dark mode nav tweaks (via CSS vars set on html[data-theme=dark]) */
        [data-theme="dark"] .navbar {
          background: rgba(18,18,24,0.95) !important;
          border-bottom-color: rgba(255,255,255,0.08) !important;
        }
        [data-theme="dark"] .nav-dropdown,
        [data-theme="dark"] .navbar-dropdown {
          background: #1E1E2A !important;
          border-color: rgba(255,255,255,0.08) !important;
        }
        [data-theme="dark"] .notif-item { border-bottom-color: rgba(255,255,255,0.06) !important; }
        [data-theme="dark"] .notif-unread { background: rgba(255,107,74,0.06) !important; }
        [data-theme="dark"] .nav-icon-btn { background: #1E1E2A !important; border-color: rgba(255,255,255,0.1) !important; color: #E0D4CD !important; }
        [data-theme="dark"] .navbar-user { background: #1E1E2A !important; border-color: rgba(255,255,255,0.1) !important; }
        [data-theme="dark"] .nav-theme-toggle { background: #1E1E2A !important; border-color: rgba(255,255,255,0.1) !important; }
        [data-theme="dark"] .notif-icon-wrap { background: rgba(255,107,74,0.12) !important; }
        [data-theme="dark"] .nav-lang-badge { border-color: #121218 !important; }
      `}</style>
    </nav>
  );
}
