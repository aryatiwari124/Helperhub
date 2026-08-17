import { useState } from 'react';
import { Star, MapPin, Clock, ShieldCheck, Zap, Briefcase, Heart, Languages, CheckCircle2 } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

const CATEGORY_EMOJIS = {
  Plumber: '🔧', Electrician: '⚡', Carpenter: '🪚',
  'AC Technician': '❄️', Painter: '🎨', Cleaner: '🧹',
  Mechanic: '🔩', Gardener: '🌿',
};

const LANG_MAP = ['Hindi', 'English', 'Marathi', 'Tamil', 'Bengali', 'Telugu', 'Gujarati', 'Kannada'];

function StarRow({ rating }) {
  return (
    <div style={{ display: 'flex', gap: 2 }}>
      {[1, 2, 3, 4, 5].map(s => (
        <Star key={s} size={13}
          fill={s <= Math.round(rating) ? '#FF6B4A' : 'none'}
          stroke={s <= Math.round(rating) ? '#FF6B4A' : '#E0D4CD'}
          strokeWidth={2}
        />
      ))}
    </div>
  );
}

export default function WorkerCard({ profile, index = 0, selected, onSelect, onBook, onFavorite, isFavorited }) {
  const { t } = useLanguage();
  const user = profile.userId;
  const initials = user?.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'H';
  const mainCategory = profile.category?.[0] || 'Helper';
  const distance = ((index * 0.7 + 1.2) % 4.5 + 0.8).toFixed(1);
  const eta = 15 + ((index * 7) % 25);
  const trustScore = Math.min(99, 85 + (index * 3) % 15);
  const langs = [LANG_MAP[index % LANG_MAP.length], 'English'].filter((v, i, a) => a.indexOf(v) === i).slice(0, 2);

  return (
    <div
      className={`worker-card ${selected ? 'worker-card-selected' : ''}`}
      onClick={() => onSelect?.(profile)}
    >
      {/* Top row: avatar + name + badges */}
      <div className="wc-top">
        {/* Avatar */}
        <div className="wc-avatar-wrap">
          {user?.profilePic
            ? <img src={user.profilePic} alt={user.name} className="wc-avatar" />
            : <div className="wc-avatar-placeholder">{initials}</div>
          }
          <div className="wc-online-dot" />
        </div>

        {/* Name & Badges */}
        <div className="wc-info">
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
            <h3 className="wc-name">{user?.name}</h3>
            {profile.isVerifiedByAdmin && (
              <span className="wc-verified-badge"><ShieldCheck size={11} /> Verified</span>
            )}
          </div>
          <p className="wc-profession">{CATEGORY_EMOJIS[mainCategory]} {mainCategory}</p>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4, flexWrap: 'wrap' }}>
            <StarRow rating={profile.avgRating || 4.8} />
            <span className="wc-rating-num">{(profile.avgRating || 4.8).toFixed(1)}</span>
            <span className="wc-jobs-done">({profile.totalJobs || 24} {t('landing_card_jobs', 'jobs')})</span>
          </div>
        </div>

        {/* Favorite button */}
        <button
          className={`wc-fav-btn ${isFavorited ? 'wc-fav-active' : ''}`}
          onClick={e => { e.stopPropagation(); onFavorite?.(profile._id); }}
          title="Save to favorites"
        >
          <Heart size={16} fill={isFavorited ? '#FF6B4A' : 'none'} />
        </button>
      </div>

      {/* Stat chips */}
      <div className="wc-chips">
        <div className="wc-chip wc-chip-coral"><Zap size={12} /> ETA {eta} mins</div>
        <div className="wc-chip"><MapPin size={12} /> {distance} km</div>
        <div className="wc-chip wc-chip-mint"><ShieldCheck size={12} /> Trust {trustScore}%</div>
        <div className="wc-chip"><Briefcase size={12} /> {profile.yearsExperience || 3}+ yrs</div>
        <div className="wc-chip"><Languages size={12} /> {langs.join(', ')}</div>
      </div>

      {/* Footer: Price + Book */}
      <div className="wc-footer">
        <div>
          <span className="wc-price">₹{profile.rate || 450}</span>
          <span className="wc-price-unit">/{profile.rateType || 'hr'}</span>
        </div>
        <button
          className="btn btn-primary btn-sm wc-book-btn"
          onClick={e => { e.stopPropagation(); onBook?.(profile); }}
        >
          {t('browse_book')}
        </button>
      </div>

      <style>{`
        .worker-card {
          background: white;
          border: 1.5px solid #F0E6DF;
          border-radius: 16px;
          padding: 16px;
          display: flex;
          flex-direction: column;
          gap: 12px;
          cursor: pointer;
          transition: all 0.25s cubic-bezier(0.34,1.56,0.64,1);
          position: relative;
        }
        .worker-card:hover {
          box-shadow: 0 12px 30px rgba(255,107,74,0.14);
          border-color: #FFC4B6;
          transform: translateY(-3px);
        }
        .worker-card-selected {
          border-color: #FF6B4A !important;
          box-shadow: 0 0 0 3px rgba(255,107,74,0.18), 0 12px 30px rgba(255,107,74,0.14) !important;
        }
        .wc-top { display: flex; gap: 12px; align-items: flex-start; }
        .wc-avatar-wrap { position: relative; flex-shrink: 0; }
        .wc-avatar {
          width: 56px; height: 56px; border-radius: 50%;
          object-fit: cover;
          border: 3px solid #FF6B4A;
        }
        .wc-avatar-placeholder {
          width: 56px; height: 56px; border-radius: 50%;
          background: linear-gradient(135deg,#FFEFEA,#FFDCD4);
          display: flex; align-items: center; justify-content: center;
          font-weight: 900; font-size: 20px; color: #FF6B4A;
          border: 3px solid #FF6B4A;
          font-family: 'Poppins', sans-serif;
        }
        .wc-online-dot {
          position: absolute; bottom: 2px; right: 2px;
          width: 13px; height: 13px; border-radius: 50%;
          background: #2EC4B6; border: 2px solid white;
        }
        .wc-info { flex: 1; }
        .wc-name { font-size: 16px; font-weight: 800; color: #2B2B2B; font-family: 'Poppins',sans-serif; }
        .wc-profession { font-size: 13px; font-weight: 700; color: #FF6B4A; margin-top: 2px; }
        .wc-verified-badge {
          display: inline-flex; align-items: center; gap: 3px;
          background: #E6F8F6; color: #1B857A; font-size: 11px; font-weight: 800;
          padding: 2px 8px; border-radius: 999px;
        }
        .wc-rating-num { font-size: 14px; font-weight: 900; color: #FF6B4A; }
        .wc-jobs-done { font-size: 12px; color: #8E8E8E; font-weight: 600; }
        .wc-fav-btn {
          background: white; border: 1.5px solid #F0E6DF; border-radius: 50%;
          width: 34px; height: 34px; display: flex; align-items: center; justify-content: center;
          cursor: pointer; color: #8E8E8E; flex-shrink: 0;
          transition: all 0.2s;
        }
        .wc-fav-btn:hover { border-color: #FF6B4A; color: #FF6B4A; }
        .wc-fav-active { color: #FF6B4A !important; border-color: #FF6B4A !important; background: #FFEFEA !important; }
        .wc-chips { display: flex; gap: 6px; flex-wrap: wrap; }
        .wc-chip {
          display: inline-flex; align-items: center; gap: 4px;
          font-size: 12px; font-weight: 700; color: #5A5A5A;
          background: #FFF4EC; border: 1px solid #FFE8D9;
          padding: 4px 10px; border-radius: 999px;
        }
        .wc-chip-coral { background: #FFEFEA; color: #FF6B4A; border-color: #FFC4B6; }
        .wc-chip-mint { background: #E6F8F6; color: #1B857A; border-color: #A8EADB; }
        .wc-footer {
          display: flex; align-items: center; justify-content: space-between;
          padding-top: 10px; border-top: 1.5px solid #F6ECE5;
        }
        .wc-price { font-size: 22px; font-weight: 900; color: #FF6B4A; font-family: 'Poppins',sans-serif; }
        .wc-price-unit { font-size: 12px; color: #8E8E8E; font-weight: 700; }
        .wc-book-btn { border-radius: 999px !important; font-family: 'Poppins',sans-serif; }
      `}</style>
    </div>
  );
}
