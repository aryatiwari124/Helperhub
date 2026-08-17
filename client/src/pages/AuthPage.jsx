import { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, User, AlertCircle, ArrowLeft, Sparkles } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

import { useLanguage } from '../context/LanguageContext';

export default function AuthPage() {
  const [searchParams] = useSearchParams();
  const initialMode = searchParams.get('mode') === 'signup' ? 'signup' : 'login';
  const initialRole = searchParams.get('role') || 'recruiter';

  const [mode, setMode] = useState(initialMode);
  const [role, setRole] = useState(initialRole);
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [pendingEmail, setPendingEmail] = useState('');

  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const otpRefs = useRef([]);
  const [resendTimer, setResendTimer] = useState(0);

  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const { login, user } = useAuth();
  const { t } = useLanguage();

  const ROLES = [
    { id: 'recruiter', label: t('auth_role_hire'), desc: t('auth_role_hire_desc') },
    { id: 'jobseeker', label: t('auth_role_work'), desc: t('auth_role_work_desc') },
  ];
  const navigate = useNavigate();

  useEffect(() => {
    if (user) navigate(user.role === 'recruiter' ? '/recruiter' : user.role === 'admin' ? '/admin' : '/jobseeker');
  }, [user]);

  useEffect(() => {
    if (resendTimer > 0) {
      const t = setTimeout(() => setResendTimer(r => r - 1), 1000);
      return () => clearTimeout(t);
    }
  }, [resendTimer]);

  const handle = e => {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
    setError('');
  };

  const handleOtpChange = (i, val) => {
    if (!/^\d*$/.test(val)) return;
    const next = [...otp];
    next[i] = val.slice(-1);
    setOtp(next);
    if (val && i < 5) otpRefs.current[i + 1]?.focus();
    if (!val && i > 0) otpRefs.current[i - 1]?.focus();
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    if (!role) { setError('Please pick a role to continue'); return; }
    if (!form.name || !form.email || !form.password) { setError('All fields are required'); return; }
    if (form.password.length < 6) { setError('Password must be at least 6 characters'); return; }
    setLoading(true); setError('');
    try {
      const res = await api.post('/auth/signup', { ...form, role });
      setPendingEmail(form.email);
      setMode('otp');
      setResendTimer(60);
      if (res.data.devOtp) {
        toast.success(`Demo Mode OTP: ${res.data.devOtp}`, { duration: 8000 });
        setOtp(res.data.devOtp.split(''));
      } else {
        toast.success('Awesome! Check your email for the 6-digit OTP code 📩');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Signup failed');
    } finally { setLoading(false); }
  };

  const handleVerifyOtp = async () => {
    const otpStr = otp.join('');
    if (otpStr.length < 6) { setError('Please enter all 6 digits'); return; }
    setLoading(true); setError('');
    try {
      const res = await api.post('/auth/verify-otp', { email: pendingEmail, otp: otpStr });
      login(res.data.token, res.data.user);
      toast.success("You're all set! 🎉 Welcome to HelperHub");
      navigate(res.data.user.role === 'recruiter' ? '/recruiter' : '/jobseeker');
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid OTP');
      setOtp(['', '', '', '', '', '']);
      otpRefs.current[0]?.focus();
    } finally { setLoading(false); }
  };

  const handleGoogleAuth = async (credential) => {
    setLoading(true);
    setError('');
    try {
      // Calls the real backend endpoint POST /api/v1/auth/google
      const res = await api.post('/auth/google', {
        token: credential,
        role: role || 'recruiter',
      });
      login(res.data.token, res.data.user);
      toast.success(`Welcome, ${res.data.user.name.split(' ')[0]}! 🎉`);
      navigate(res.data.user.role === 'recruiter' ? '/recruiter' : '/jobseeker');
    } catch (err) {
      console.error('Google OAuth error:', err);
      setError(err.response?.data?.message || 'Google authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleClick = () => {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

    // If real Google Identity Services SDK is loaded and configured
    if (window.google?.accounts?.id && clientId && clientId !== 'your_google_client_id') {
      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: (response) => {
          if (response.credential) {
            handleGoogleAuth(response.credential);
          }
        },
      });
      window.google.accounts.id.prompt();
    } else {
      // Demo / Dev Mode: Create a simulated valid JWT credential to send to /api/v1/auth/google
      const demoPayload = {
        sub: 'google_oauth_demo_user_123',
        email: form.email || (role === 'jobseeker' ? 'alex.pro@example.com' : 'priya.homeowner@example.com'),
        name: form.name || (role === 'jobseeker' ? 'Alex Johnson' : 'Priya Sharma'),
        picture: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      };
      // Base64 header.payload.signature
      const b64Header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
      const b64Payload = btoa(JSON.stringify(demoPayload));
      const simulatedGoogleCredential = `${b64Header}.${b64Payload}.simulated_signature`;

      handleGoogleAuth(simulatedGoogleCredential);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) { setError('Email and password are required'); return; }
    setLoading(true); setError('');
    try {
      const res = await api.post('/auth/login', { email: form.email, password: form.password });
      login(res.data.token, res.data.user);
      toast.success(`Welcome back, ${res.data.user.name.split(' ')[0]}! 🎉`);
      navigate(res.data.user.role === 'recruiter' ? '/recruiter' : res.data.user.role === 'admin' ? '/admin' : '/jobseeker');
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid credentials');
    } finally { setLoading(false); }
  };

  return (
    <div className="auth-page">
      <div className="auth-left">
        <Link to="/" className="auth-logo">
          🛠️ <span>HelperHub</span>
        </Link>
        <h2 className="auth-left-title">Welcome to your friendly local service community!</h2>
        <div className="auth-testimonials">
          <div className="auth-testimonial">
            <p className="auth-testimonial-text">"Booked a plumber in 2 minutes. Super friendly experience!"</p>
            <p className="auth-testimonial-name">— Priya S., <span>Homeowner</span></p>
          </div>
          <div className="auth-testimonial">
            <p className="auth-testimonial-text">"Got 5 fix-it jobs in my first week. Payments were instant!"</p>
            <p className="auth-testimonial-name">— Suresh P., <span>Electrician</span></p>
          </div>
        </div>
      </div>

      <div className="auth-right">
        <div className="auth-form-container">
          {mode === 'otp' ? (
            <div className="animate-fadeIn">
              <button className="btn btn-ghost btn-sm" style={{ marginBottom: 'var(--space-4)', paddingLeft: 0 }} onClick={() => setMode('signup')}>
                <ArrowLeft size={16} /> {t('otp_back')}
              </button>
              <div style={{ textAlign: 'center', marginBottom: 'var(--space-6)' }}>
                <div style={{ fontSize: 52, marginBottom: 'var(--space-2)' }}>🎉</div>
                <h1 className="headline-md">{t('otp_title')}</h1>
                <p className="text-secondary" style={{ marginTop: 6 }}>{t('otp_sent')} <strong>{pendingEmail}</strong></p>
              </div>

              {error && <div className="auth-error"><AlertCircle size={16} /> {error}</div>}

              <div className="otp-boxes">
                {otp.map((d, i) => (
                  <input
                    key={i}
                    ref={el => otpRefs.current[i] = el}
                    className={`otp-box ${d ? 'otp-box-filled' : ''}`}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={d}
                    onChange={e => handleOtpChange(i, e.target.value)}
                  />
                ))}
              </div>

              <div style={{
                marginTop: '16px',
                padding: '12px 16px',
                background: 'var(--color-primary-light, #dae2ff)',
                borderRadius: '12px',
                border: '1px solid var(--color-outline-variant, #c3c6d6)',
                textAlign: 'center',
                fontSize: '13px',
                color: 'var(--color-primary, #003d9b)',
                fontWeight: 600
              }}>
                <span>⚡ Development Mode Active — OTP is automatically pre-filled!</span>
              </div>

              <button className="btn btn-primary w-full btn-lg" style={{ marginTop: 'var(--space-5)' }} onClick={handleVerifyOtp} disabled={loading || otp.join('').length < 6}>
                {loading ? t('otp_verifying') : t('otp_verify_btn')}
              </button>
            </div>
          ) : (
            <div className="animate-fadeIn">
              <h1 className="headline-md" style={{ marginBottom: 4 }}>
                {mode === 'signup' ? t('auth_join') : t('auth_welcome')}
              </h1>
              <p className="text-secondary" style={{ marginBottom: 'var(--space-6)' }}>
                {mode === 'signup' ? t('auth_create_free') : t('auth_sign_in_to')}
              </p>

              <div className="tabs" style={{ marginBottom: 'var(--space-6)' }}>
                <button className={`tab ${mode === 'login' ? 'active' : ''}`} onClick={() => { setMode('login'); setError(''); }}>{t('auth_tab_signin')}</button>
                <button className={`tab ${mode === 'signup' ? 'active' : ''}`} onClick={() => { setMode('signup'); setError(''); }}>{t('auth_tab_create')}</button>
              </div>

              {mode === 'signup' && (
                <div style={{ marginBottom: 'var(--space-5)' }}>
                  <label className="form-label" style={{ marginBottom: 8, display: 'block' }}>{t('auth_joining_as')}</label>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-3)' }}>
                    {ROLES.map(r => (
                      <button
                        key={r.id}
                        type="button"
                        className={`role-card ${role === r.id ? 'role-card-active' : ''}`}
                        onClick={() => setRole(r.id)}
                      >
                        <div style={{ fontWeight: 800, fontSize: '15px' }}>{r.label}</div>
                        <div style={{ fontSize: '12px', color: 'var(--color-on-surface-variant)', marginTop: 4 }}>{r.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Google OAuth Button */}
              <button
                type="button"
                className="btn w-full google-signin-btn"
                onClick={handleGoogleClick}
                disabled={loading}
              >
                <svg width="18" height="18" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                </svg>
                <span>Continue with Google</span>
              </button>

              <div className="auth-divider">
                <span>or continue with email</span>
              </div>

              <form onSubmit={mode === 'signup' ? handleSignup : handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                {mode === 'signup' && (
                  <div className="form-group">
                    <label className="form-label">{t('auth_full_name')}</label>
                    <input className="form-input" name="name" placeholder="e.g. Alex Johnson" value={form.name} onChange={handle} />
                  </div>
                )}

                <div className="form-group">
                  <label className="form-label">{t('auth_email')}</label>
                  <input className="form-input" name="email" type="email" placeholder="you@email.com" value={form.email} onChange={handle} />
                </div>

                <div className="form-group">
                  <label className="form-label">{t('auth_password')}</label>
                  <div style={{ position: 'relative' }}>
                    <input className="form-input" name="password" type={showPass ? 'text' : 'password'} placeholder="Min 6 characters" value={form.password} onChange={handle} />
                    <button type="button" onClick={() => setShowPass(p => !p)} style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-outline)' }}>
                      {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <button type="submit" className="btn btn-primary btn-lg w-full" disabled={loading}>
                  {loading ? t('auth_loading') : mode === 'signup' ? t('auth_create_btn') : t('auth_signin_btn')}
                </button>
              </form>

              {mode === 'login' && (
                <p className="text-center text-sm" style={{ marginTop: 'var(--space-4)', color: 'var(--color-outline)' }}>
                  <strong>{t('auth_demo')}</strong> neha@demo.com / admin123 (Recruiter) · rajesh@demo.com / admin123 (Helper)
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      <style>{`
        .auth-page { display: grid; grid-template-columns: 1fr 1.2fr; min-height: 100vh; }
        .auth-left {
          background: linear-gradient(135deg, #FF6B4A 0%, #FF5430 50%, #2EC4B6 100%);
          color: white;
          padding: var(--space-12);
          display: flex;
          flex-direction: column;
          justify-content: center;
        }
        .auth-logo { font-size: 26px; font-weight: 900; color: white; display: flex; align-items: center; gap: 8px; margin-bottom: var(--space-8); }
        .auth-left-title { font-size: 38px; font-weight: 900; line-height: 1.2; margin-bottom: var(--space-8); color: white; }
        .auth-testimonials { display: flex; flex-direction: column; gap: var(--space-4); }
        .auth-testimonial { background: rgba(255,255,255,0.15); backdrop-filter: blur(8px); padding: var(--space-4); border-radius: var(--radius-md); border: 1.5px solid rgba(255,255,255,0.25); }
        .auth-testimonial-text { font-size: 15px; font-weight: 600; }
        .auth-testimonial-name { font-size: 13px; margin-top: 6px; opacity: 0.9; }
        .auth-right { display: flex; align-items: center; justify-content: center; padding: var(--space-8); background: #FFF9F5; }
        .auth-form-container { width: 100%; max-width: 440px; background: white; padding: var(--space-8); border-radius: var(--radius-xl); box-shadow: var(--shadow-xl); border: 2px solid #F6ECE5; }
        .auth-error { display: flex; align-items: center; gap: 8px; padding: 10px 14px; background: var(--color-error-container); border-radius: var(--radius-sm); color: var(--color-on-error-container); font-size: 14px; margin-bottom: var(--space-4); font-weight: 700; }
        .role-card {
          padding: var(--space-4);
          border: 2px solid var(--color-outline-variant);
          border-radius: var(--radius-md);
          background: white;
          cursor: pointer;
          transition: all var(--transition-fast);
          text-align: left;
        }
        .role-card:hover, .role-card-active { border-color: var(--color-primary); background: var(--color-primary-light); }
        .otp-boxes { display: flex; justify-content: center; gap: 10px; margin-top: var(--space-6); }
        .otp-box {
          width: 50px;
          height: 60px;
          border: 2px solid var(--color-outline-variant);
          border-radius: var(--radius-sm);
          font-size: 26px;
          font-weight: 900;
          text-align: center;
          color: var(--color-primary);
          outline: none;
        }
        .otp-box:focus, .otp-box-filled { border-color: var(--color-primary); background: var(--color-primary-light); }
        @media (max-width: 900px) { .auth-page { grid-template-columns: 1fr; } .auth-left { display: none; } }
      `}</style>
    </div>
  );
}
