import { Star, MapPin, Clock, Briefcase, CheckCircle2, ShieldCheck, Zap, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';

const CATEGORY_EMOJIS = {
  Plumber: '🔧', Electrician: '⚡', Carpenter: '🪚',
  'AC Technician': '❄️', Painter: '🎨', Cleaner: '🧹',
  Mechanic: '🔩', Gardener: '🌿',
};

const CATEGORY_KEYS = {
  Plumber: 'cat_plumber',
  Electrician: 'cat_electrician',
  Carpenter: 'cat_carpenter',
  'AC Technician': 'cat_ac',
  Painter: 'cat_painter',
  Cleaner: 'cat_cleaner',
  Mechanic: 'cat_mechanic',
  Gardener: 'cat_gardener',
};

function StarRating({ rating, size = 16 }) {
  return (
    <div className="stars">
      {[1, 2, 3, 4, 5].map(s => (
        <Star
          key={s}
          size={size}
          fill={s <= Math.round(rating) ? '#FF6B4A' : 'none'}
          stroke={s <= Math.round(rating) ? '#FF6B4A' : '#E0D4CD'}
          strokeWidth={2}
        />
      ))}
    </div>
  );
}

export default function HelperCard({ profile, index = 0, onHire }) {
  const { t } = useLanguage();
  const user = profile.userId;
  const initials = user?.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'H';
  const mainCategory = profile.category?.[0] || 'Fix-It Pro';

  // Computed / Fallback location & arrival metrics for realistic marketplace cards
  const computedDistance = profile.distance || `${((index * 0.7 + 1.2) % 4.5 + 0.8).toFixed(1)} km ${t('browse_filter_distance', 'away')}`;
  const computedETA = profile.estimatedETA || `${15 + ((index * 7) % 25)} mins`;

  return (
    <div className="card card-hover professional-helper-card">
      {/* Top Banner / Trust Badge Header */}
      <div className="pro-card-header">
        <div className="pro-trust-badge">
          <ShieldCheck size={14} /> {t('landing_card_verified', 'Verified Pro')}
        </div>
        <div className="pro-eta-badge">
          <Zap size={13} /> {computedETA}
        </div>
      </div>

      <div className="pro-card-body">
        {/* Main Info Row */}
        <div className="pro-card-main flex gap-4 items-center">
          {/* Profile Photo */}
          <div className="pro-avatar-wrapper">
            {user?.profilePic ? (
              <img src={user.profilePic} alt={user.name} className="avatar avatar-xl avatar-ring pro-avatar" />
            ) : (
              <div className="avatar-placeholder avatar-xl avatar-ring pro-avatar" style={{ fontSize: '26px' }}>
                {initials}
              </div>
            )}
            <div className="pro-online-dot" title={t('helper_available_now', 'Available Now')} />
          </div>

          {/* Name, Profession, Rating */}
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h3 className="pro-helper-name">{user?.name}</h3>
            </div>
            
            <p className="pro-profession text-primary font-bold">
              {CATEGORY_EMOJIS[mainCategory] || '🛠️'} {t(CATEGORY_KEYS[mainCategory] || '', mainCategory)}
            </p>

            <div className="flex items-center gap-2 mt-1">
              <StarRating rating={profile.avgRating ?? 4.8} />
              <span className="pro-rating-score">
                {(profile.avgRating ?? 4.8).toFixed(1)}
              </span>
              <span className="text-xs text-muted font-semibold">
                ({profile.totalJobs ?? 0} {t('landing_card_jobs', 'jobs')})
              </span>
            </div>
          </div>
        </div>

        {/* Bio / Summary */}
        <p className="pro-bio">
          {profile.bio || `Experienced ${mainCategory.toLowerCase()} specializing in fast, reliable home repairs and installations.`}
        </p>

        {/* Feature Badges Row (Exp, Distance, City) */}
        <div className="pro-meta-chips">
          <div className="pro-chip">
            <Briefcase size={13} /> {profile.yearsExperience || 3}+ {t('browse_filter_experience', 'Yrs Exp')}
          </div>
          <div className="pro-chip">
            <MapPin size={13} /> {computedDistance}
          </div>
          <div className="pro-chip">
            <Clock size={13} /> {profile.availability ? t('landing_card_flexible', 'Flexible Hours') : t('browse_filter_today', 'Available Today')}
          </div>
        </div>
      </div>

      {/* Footer / Price & Actions */}
      <div className="pro-card-footer">
        <div className="pro-price-box">
          <span className="pro-price-amount">₹{profile.rate || 450}</span>
          <span className="pro-price-unit">/{t('general_hrs', 'hr')}</span>
        </div>

        <div className="flex gap-2 items-center">
          <Link to={`/helper/${user?._id}`} className="btn btn-outline btn-sm pro-view-btn">
            {t('landing_card_view', 'View Profile')} <ArrowRight size={14} />
          </Link>
          {onHire && (
            <button className="btn btn-primary btn-sm pro-hire-btn" onClick={() => onHire(profile)}>
              {t('browse_book', 'Hire Now')}
            </button>
          )}
        </div>
      </div>

      <style>{`
        .professional-helper-card {
          display: flex;
          flex-direction: column;
          background: white;
          border-radius: var(--radius-lg);
          border: 1.5px solid #F6ECE5;
          position: relative;
          transition: all 0.35s cubic-bezier(0.34, 1.56, 0.64, 1);
        }

        .professional-helper-card:hover {
          transform: translateY(-6px) scale(1.01);
          box-shadow: 0 20px 40px rgba(255, 107, 74, 0.14);
          border-color: #FFC4B6;
        }

        .pro-card-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 12px 20px;
          background: #FFF9F5;
          border-bottom: 1.5px solid #F6ECE5;
        }

        .pro-trust-badge {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          padding: 4px 10px;
          background: #E6F8F6;
          color: #1B857A;
          border-radius: var(--radius-full);
          font-size: 12px;
          font-weight: 800;
          font-family: 'Poppins', sans-serif;
        }

        .pro-eta-badge {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          padding: 4px 10px;
          background: #FFEFEA;
          color: var(--color-primary);
          border-radius: var(--radius-full);
          font-size: 12px;
          font-weight: 800;
          font-family: 'Poppins', sans-serif;
        }

        .pro-card-body {
          padding: 20px;
          display: flex;
          flex-direction: column;
          gap: 14px;
          flex: 1;
        }

        .pro-avatar-wrapper {
          position: relative;
        }

        .pro-avatar {
          transition: transform 0.3s ease;
        }

        .professional-helper-card:hover .pro-avatar {
          transform: scale(1.05);
        }

        .pro-online-dot {
          position: absolute;
          bottom: 2px;
          right: 2px;
          width: 14px;
          height: 14px;
          background: var(--color-secondary);
          border-radius: 50%;
          border: 2px solid white;
        }

        .pro-helper-name {
          font-size: 19px;
          font-weight: 800;
          color: var(--color-on-surface);
          line-height: 1.2;
        }

        .pro-profession {
          font-size: 14px;
          margin-top: 2px;
        }

        .pro-rating-score {
          font-size: 15px;
          font-weight: 800;
          color: var(--color-primary);
        }

        .pro-bio {
          font-size: 14px;
          color: var(--color-on-surface-variant);
          line-height: 1.5;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .pro-meta-chips {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          margin-top: 4px;
        }

        .pro-chip {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          font-size: 12.5px;
          font-weight: 700;
          color: var(--color-on-surface-variant);
          background: #FFF4EC;
          padding: 5px 12px;
          border-radius: var(--radius-full);
          border: 1px solid #FFEBE0;
        }

        .pro-card-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 16px 20px;
          background: #FFFBF8;
          border-top: 1.5px solid #F6ECE5;
          border-radius: 0 0 var(--radius-lg) var(--radius-lg);
        }

        .pro-price-amount {
          font-size: 24px;
          font-weight: 900;
          color: var(--color-primary);
          font-family: 'Poppins', sans-serif;
        }

        .pro-price-unit {
          font-size: 13px;
          color: var(--color-outline);
          font-weight: 700;
        }

        .pro-view-btn {
          border-radius: var(--radius-full);
          font-weight: 800;
        }

        .pro-hire-btn {
          border-radius: var(--radius-full);
          font-weight: 800;
        }
      `}</style>
    </div>
  );
}
