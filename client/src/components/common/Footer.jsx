import { Link } from 'react-router-dom';
import { Wrench, MapPin, Phone, Mail, Globe, Share2, MessageSquare, Send } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

export default function Footer() {
  const { t } = useLanguage();
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          {/* Brand */}
          <div className="footer-brand">
            <div className="footer-logo">
              <div style={{ width: 32, height: 32, background: 'white', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-primary)' }}>
                <Wrench size={16} />
              </div>
              <span>HelperHub</span>
            </div>
            <p className="footer-tagline">{t('footer_tagline')}</p>
            <div className="footer-socials">
              <a href="#" className="footer-social" title="Global Network"><Globe size={16} /></a>
              <a href="#" className="footer-social" title="Share"><Share2 size={16} /></a>
              <a href="#" className="footer-social" title="Community"><MessageSquare size={16} /></a>
              <a href="#" className="footer-social" title="Contact Us"><Send size={16} /></a>
            </div>
          </div>

          {/* Services */}
          <div className="footer-section">
            <h4>{t('footer_services')}</h4>
            <Link to="/helpers?category=Plumber">{t('cat_plumber')}</Link>
            <Link to="/helpers?category=Electrician">{t('cat_electrician')}</Link>
            <Link to="/helpers?category=Carpenter">{t('cat_carpenter')}</Link>
            <Link to="/helpers?category=AC+Technician">{t('cat_ac')}</Link>
            <Link to="/helpers?category=Painter">{t('cat_painter')}</Link>
            <Link to="/helpers?category=Cleaner">{t('cat_cleaner')}</Link>
          </div>

          {/* Company */}
          <div className="footer-section">
            <h4>{t('footer_company')}</h4>
            <Link to="/about">{t('footer_about')}</Link>
            <Link to="/helpers">{t('nav_find')}</Link>
            <Link to="/auth?mode=signup&role=jobseeker">{t('cta_work_btn')}</Link>
            <a href="#">{t('footer_blog')}</a>
            <a href="#">{t('footer_careers')}</a>
          </div>

          {/* Contact */}
          <div className="footer-section">
            <h4>{t('footer_contact')}</h4>
            <div className="footer-contact-item"><MapPin size={14} /><span>Mumbai, Maharashtra</span></div>
            <div className="footer-contact-item"><Phone size={14} /><span>+91 98765 43210</span></div>
            <div className="footer-contact-item"><Mail size={14} /><span>hello@helperhub.in</span></div>
          </div>
        </div>

        <div className="footer-bottom">
          <p>© 2024 HelperHub. {t('footer_rights')}</p>
          <div className="footer-bottom-links">
            <a href="#">{t('footer_privacy')}</a>
            <a href="#">{t('footer_terms')}</a>
            <a href="#">{t('footer_refund')}</a>
          </div>
        </div>
      </div>

      <style>{`
        .footer {
          background: var(--color-surface-container-low, #f3f4f6);
          color: var(--color-on-surface, #191c1e);
          padding: var(--space-16) 0 var(--space-8);
          margin-top: auto;
          border-top: 1px solid var(--color-outline-variant);
          transition: background-color 0.2s ease, color 0.2s ease, border-color 0.2s ease;
        }
        .footer-grid {
          display: grid;
          grid-template-columns: 2fr 1fr 1fr 1fr;
          gap: var(--space-12);
          margin-bottom: var(--space-12);
        }
        .footer-brand { display: flex; flex-direction: column; gap: var(--space-4); }
        .footer-logo {
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 20px;
          font-weight: 700;
          color: var(--color-primary);
          letter-spacing: -0.02em;
        }
        .footer-tagline { font-size: 14px; color: var(--color-on-surface-variant); line-height: 1.6; max-width: 280px; }
        .footer-socials { display: flex; gap: var(--space-2); }
        .footer-social {
          width: 36px;
          height: 36px;
          background: var(--color-surface-container);
          border: 1px solid var(--color-outline-variant);
          border-radius: var(--radius-sm);
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--color-on-surface-variant);
          transition: all var(--transition-fast);
        }
        .footer-social:hover { background: var(--color-primary); color: var(--color-on-primary); border-color: var(--color-primary); }
        .footer-section { display: flex; flex-direction: column; gap: 10px; }
        .footer-section h4 { font-size: 13px; font-weight: 700; letter-spacing: 0.06em; text-transform: uppercase; color: var(--color-outline); margin-bottom: 4px; }
        .footer-section a { font-size: 14px; color: var(--color-on-surface-variant); transition: color var(--transition-fast); }
        .footer-section a:hover { color: var(--color-primary); }
        .footer-contact-item { display: flex; align-items: center; gap: var(--space-2); font-size: 14px; color: var(--color-on-surface-variant); }
        .footer-bottom {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding-top: var(--space-6);
          border-top: 1px solid var(--color-outline-variant);
          font-size: 13px;
          color: var(--color-outline);
        }
        .footer-bottom-links { display: flex; gap: var(--space-6); }
        .footer-bottom-links a { color: var(--color-outline); transition: color var(--transition-fast); }
        .footer-bottom-links a:hover { color: var(--color-primary); }
        @media (max-width: 1024px) { .footer-grid { grid-template-columns: 1fr 1fr; gap: var(--space-8); } }
        @media (max-width: 640px) {
          .footer-grid { grid-template-columns: 1fr; gap: var(--space-8); }
          .footer-bottom { flex-direction: column; gap: var(--space-3); text-align: center; }
        }
      `}</style>
    </footer>
  );
}
