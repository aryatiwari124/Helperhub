import { useState, useEffect, useRef, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import {
  Search, MapPin, SlidersHorizontal, X, Star, ChevronDown,
  ShieldCheck, Zap, RefreshCw, Filter, ToggleLeft, ToggleRight
} from 'lucide-react';
import api from '../services/api';
import WorkerCard from '../components/helper/WorkerCard';
import BookingFlow from '../components/booking/BookingFlow';
import { useLanguage } from '../context/LanguageContext';

// Fix Leaflet default marker icon in Vite
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

// Coral marker for selected worker
const selectedIcon = new L.DivIcon({
  className: '',
  html: `<div style="
    background:#FF6B4A; color:white; border:3px solid white;
    border-radius:50% 50% 50% 0; width:36px; height:36px;
    transform:rotate(-45deg); box-shadow:0 4px 12px rgba(255,107,74,0.4);
    display:flex; align-items:center; justify-content:center;
  "><div style="transform:rotate(45deg); font-size:16px">📍</div></div>`,
  iconSize: [36, 36],
  iconAnchor: [18, 36],
});

const defaultIcon = new L.DivIcon({
  className: '',
  html: `<div style="
    background:#2EC4B6; color:white; border:2px solid white;
    border-radius:50%; width:30px; height:30px;
    box-shadow:0 3px 8px rgba(46,196,182,0.4);
    display:flex; align-items:center; justify-content:center;
    font-size:14px;
  ">⚡</div>`,
  iconSize: [30, 30],
  iconAnchor: [15, 15],
});

// Delhi city center coordinates
const CITY_CENTER = [28.6139, 77.2090];

// Spread workers around Delhi
function getWorkerCoords(index) {
  const spread = 0.05;
  const offsets = [
    [0.02, 0.01], [-0.01, 0.03], [0.03, -0.02], [-0.02, -0.01],
    [0.04, 0.02], [-0.03, 0.04], [0.01, -0.04], [0.05, -0.01],
    [-0.04, -0.02], [0.02, 0.05],
  ];
  const off = offsets[index % offsets.length] || [0, 0];
  return [CITY_CENTER[0] + off[0] + (Math.random() * spread * 0.1), CITY_CENTER[1] + off[1] + (Math.random() * spread * 0.1)];
}

// Sub-component to fly map to worker
function MapController({ selected }) {
  const map = useMap();
  useEffect(() => {
    if (selected?.coords) {
      map.flyTo(selected.coords, 14, { duration: 1.2 });
    }
  }, [selected, map]);
  return null;
}

const LANGUAGES = ['Hindi', 'English', 'Marathi', 'Tamil', 'Bengali', 'Telugu', 'Gujarati', 'Kannada'];
const CATEGORIES = ['All', 'Plumber', 'Electrician', 'Carpenter', 'AC Technician', 'Painter', 'Cleaner', 'Mechanic'];

export default function BrowseHelpersPage() {
  const { t } = useLanguage();
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedWorker, setSelectedWorker] = useState(null);
  const [selectedWorkerCoords, setSelectedWorkerCoords] = useState(null);
  const [bookingTarget, setBookingTarget] = useState(null);
  const [favorites, setFavorites] = useState(new Set());
  const [showFilters, setShowFilters] = useState(false);
  const [category, setCategory] = useState('All');
  const [workerCoords, setWorkerCoords] = useState({});

  // Filters state
  const [filters, setFilters] = useState({
    minRating: 0,
    maxPrice: 1000,
    maxDistance: 10,
    availableToday: false,
    verifiedOnly: false,
    minExperience: 0,
    language: 'Any',
    emergencyOnly: false,
  });

  useEffect(() => {
    fetchProfiles();
  }, []);

  const fetchProfiles = async () => {
    setLoading(true);
    try {
      const res = await api.get('/helpers');
      const data = res.data.helpers || res.data || [];
      setProfiles(data);
      // Assign deterministic coords per worker
      const coords = {};
      data.forEach((p, i) => { coords[p._id] = getWorkerCoords(i); });
      setWorkerCoords(coords);
    } catch {
      // Demo fallback: 8 mock workers
      const mock = Array.from({ length: 8 }, (_, i) => ({
        _id: `mock-${i}`,
        userId: {
          _id: `u${i}`,
          name: ['Ravi Kumar', 'Sunita Sharma', 'Ajay Patel', 'Priya Singh',
            'Vikram Das', 'Anjali Mehta', 'Suresh Yadav', 'Kavya Nair'][i] || `Worker ${i}`,
          email: `worker${i}@demo.com`,
        },
        category: [['Plumber','Electrician','Painter','AC Technician','Carpenter','Cleaner','Mechanic','Plumber'][i]],
        rate: [350, 450, 300, 500, 400, 250, 380, 420][i],
        rateType: 'hr',
        yearsExperience: [5, 8, 3, 10, 6, 2, 7, 4][i],
        avgRating: [4.9, 4.8, 4.7, 5.0, 4.6, 4.8, 4.9, 4.7][i],
        totalJobs: [142, 98, 67, 203, 89, 54, 178, 112][i],
        isVerifiedByAdmin: [true, true, false, true, true, false, true, true][i],
        bio: 'Experienced professional providing quality services.',
      }));
      setProfiles(mock);
      const coords = {};
      mock.forEach((p, i) => { coords[p._id] = getWorkerCoords(i); });
      setWorkerCoords(coords);
    } finally {
      setLoading(false);
    }
  };

  const filteredProfiles = profiles.filter(p => {
    const name = p.userId?.name?.toLowerCase() || '';
    const cats = p.category || [];
    if (search && !name.includes(search.toLowerCase()) && !cats.some(c => c.toLowerCase().includes(search.toLowerCase()))) return false;
    if (category !== 'All' && !cats.includes(category)) return false;
    if ((p.avgRating || 0) < filters.minRating) return false;
    if ((p.rate || 0) > filters.maxPrice) return false;
    if (filters.verifiedOnly && !p.isVerifiedByAdmin) return false;
    if (filters.minExperience > 0 && (p.yearsExperience || 0) < filters.minExperience) return false;
    return true;
  });

  const handleSelectWorker = (profile) => {
    setSelectedWorker(profile);
    setSelectedWorkerCoords({ coords: workerCoords[profile._id] });
  };

  const toggleFav = (id) => {
    setFavorites(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const setFilter = (key, val) => setFilters(f => ({ ...f, [key]: val }));

  const mapCenter = selectedWorkerCoords?.coords || CITY_CENTER;

  return (
    <div className="browse-root">
      {/* ─── TOPBAR ──────────────────────────── */}
      <div className="browse-topbar">
        <div className="browse-location-pill">
          <MapPin size={16} style={{ color:'#FF6B4A' }} />
          <span className="browse-location-text">📍 Delhi</span>
          <ChevronDown size={14} style={{ color:'#8E8E8E' }} />
        </div>

        <div className="browse-search-wrap">
          <Search size={16} style={{ color:'#8E8E8E', flexShrink:0 }} />
          <input
            className="browse-search-input"
            placeholder={t('browse_search_placeholder')}
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          {search && (
            <button className="browse-clear-btn" onClick={() => setSearch('')}><X size={14} /></button>
          )}
        </div>

        <button className="browse-filter-btn" onClick={() => setShowFilters(f => !f)}>
          <SlidersHorizontal size={16} />
          <span>{t('browse_filter_btn')}</span>
          {Object.values(filters).some(v => v && v !== 0 && v !== 1000 && v !== 10 && v !== 'Any') && (
            <span className="browse-filter-dot" />
          )}
        </button>
      </div>

      {/* ─── CATEGORY PILLS ──────────────────── */}
      <div className="browse-cat-bar">
        {CATEGORIES.map(cat => (
          <button
            key={cat}
            className={`browse-cat-pill ${category === cat ? 'browse-cat-active' : ''}`}
            onClick={() => setCategory(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* ─── SPLIT LAYOUT ────────────────────── */}
      <div className="browse-split">

        {/* ── LEFT PANEL ── */}
        <div className="browse-left">

          {/* Filters Drawer */}
          {showFilters && (
            <div className="browse-filters-drawer animate-slideDown">
              <div className="browse-filters-header">
                <span style={{ fontWeight:800, fontSize:16 }}>🎯 {t('browse_filter_btn')}</span>
                <button className="btn btn-ghost btn-sm" onClick={() => {
                  setFilters({ minRating:0, maxPrice:1000, maxDistance:10, availableToday:false, verifiedOnly:false, minExperience:0, language:'Any', emergencyOnly:false });
                }}>{t('browse_filter_reset')}</button>
              </div>
              <div className="browse-filters-grid">
                {/* Price */}
                <div className="filter-group">
                  <label className="filter-label">Max Price: ₹{filters.maxPrice}/hr</label>
                  <input type="range" min={100} max={1000} step={50} value={filters.maxPrice}
                    onChange={e => setFilter('maxPrice', +e.target.value)} className="filter-range" />
                  <div className="filter-range-labels"><span>₹100</span><span>₹1000</span></div>
                </div>
                {/* Distance */}
                <div className="filter-group">
                  <label className="filter-label">Distance: {filters.maxDistance} km</label>
                  <input type="range" min={1} max={20} step={1} value={filters.maxDistance}
                    onChange={e => setFilter('maxDistance', +e.target.value)} className="filter-range" />
                  <div className="filter-range-labels"><span>1km</span><span>20km</span></div>
                </div>
                {/* Rating */}
                <div className="filter-group">
                  <label className="filter-label">{t('browse_filter_rating')}: ★ {filters.minRating || 'Any'}</label>
                  <div style={{ display:'flex', gap:6 }}>
                    {[0,3,4,4.5,5].map(r => (
                      <button key={r}
                        className={`browse-cat-pill ${filters.minRating === r ? 'browse-cat-active' : ''}`}
                        onClick={() => setFilter('minRating', r)} style={{ fontSize:12 }}>
                        {r === 0 ? 'Any' : `${r}★`}
                      </button>
                    ))}
                  </div>
                </div>
                {/* Experience */}
                <div className="filter-group">
                  <label className="filter-label">{t('browse_filter_experience')}: {filters.minExperience}+ yrs</label>
                  <div style={{ display:'flex', gap:6 }}>
                    {[0,1,3,5,10].map(y => (
                      <button key={y}
                        className={`browse-cat-pill ${filters.minExperience === y ? 'browse-cat-active' : ''}`}
                        onClick={() => setFilter('minExperience', y)} style={{ fontSize:12 }}>
                        {y === 0 ? 'Any' : `${y}+`}
                      </button>
                    ))}
                  </div>
                </div>
                {/* Language */}
                <div className="filter-group">
                  <label className="filter-label">{t('browse_filter_language')}</label>
                  <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
                    {['Any', ...LANGUAGES.slice(0,5)].map(l => (
                      <button key={l}
                        className={`browse-cat-pill ${filters.language === l ? 'browse-cat-active' : ''}`}
                        onClick={() => setFilter('language', l)} style={{ fontSize:12 }}>
                        {l}
                      </button>
                    ))}
                  </div>
                </div>
                {/* Toggles */}
                <div style={{ display:'flex', gap:12, flexWrap:'wrap' }}>
                  <button className={`browse-toggle-pill ${filters.verifiedOnly ? 'browse-toggle-on' : ''}`}
                    onClick={() => setFilter('verifiedOnly', !filters.verifiedOnly)}>
                    <ShieldCheck size={13} /> {t('browse_filter_verified')}
                  </button>
                  <button className={`browse-toggle-pill ${filters.availableToday ? 'browse-toggle-on' : ''}`}
                    onClick={() => setFilter('availableToday', !filters.availableToday)}>
                    ✅ {t('browse_filter_today')}
                  </button>
                  <button className={`browse-toggle-pill ${filters.emergencyOnly ? 'browse-toggle-emergency' : ''}`}
                    onClick={() => setFilter('emergencyOnly', !filters.emergencyOnly)}>
                    🚨 {t('browse_filter_emergency')}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Results count */}
          <div className="browse-results-bar">
            <span className="browse-results-count">
              {loading ? 'Finding helpers...' : `${filteredProfiles.length} helpers found nearby`}
            </span>
            <button className="browse-refresh-btn" onClick={fetchProfiles} title="Refresh">
              <RefreshCw size={14} style={{ animation: loading ? 'spin 1s linear infinite' : 'none' }} />
            </button>
          </div>

          {/* Worker list */}
          <div className="browse-cards-list">
            {loading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="browse-skeleton">
                  <div className="skeleton-circle" />
                  <div style={{ flex:1, display:'flex', flexDirection:'column', gap:8 }}>
                    <div className="skeleton-line" style={{ width:'60%' }} />
                    <div className="skeleton-line" style={{ width:'80%' }} />
                    <div className="skeleton-line" style={{ width:'45%' }} />
                  </div>
                </div>
              ))
            ) : filteredProfiles.length === 0 ? (
              <div className="browse-empty">
                <span style={{ fontSize:48 }}>🔍</span>
                <p>{t('browse_no_results')}</p>
              </div>
            ) : (
              filteredProfiles.map((profile, i) => (
                <WorkerCard
                  key={profile._id}
                  profile={profile}
                  index={i}
                  selected={selectedWorker?._id === profile._id}
                  onSelect={handleSelectWorker}
                  onBook={p => setBookingTarget(p)}
                  onFavorite={toggleFav}
                  isFavorited={favorites.has(profile._id)}
                />
              ))
            )}
          </div>
        </div>

        {/* ── RIGHT: MAP PANEL ── */}
        <div className="browse-map-panel">
          <MapContainer
            center={CITY_CENTER}
            zoom={12}
            style={{ width: '100%', height: '100%' }}
            zoomControl={false}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            />
            <MapController selected={selectedWorkerCoords} />

            {filteredProfiles.map((profile) => {
              const coords = workerCoords[profile._id];
              if (!coords) return null;
              const isSelected = selectedWorker?._id === profile._id;
              const user = profile.userId;
              const initials = user?.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0,2) || 'H';
              return (
                <Marker
                  key={profile._id}
                  position={coords}
                  icon={isSelected ? selectedIcon : defaultIcon}
                  eventHandlers={{ click: () => handleSelectWorker(profile) }}
                >
                  <Popup>
                    <div style={{ fontFamily:'Poppins,sans-serif', textAlign:'center', minWidth:140 }}>
                      <div style={{ width:44, height:44, borderRadius:'50%', background:'#FFEFEA', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 8px', fontSize:18, fontWeight:900, color:'#FF6B4A' }}>
                        {initials}
                      </div>
                      <strong style={{ fontSize:14 }}>{user?.name}</strong>
                      <p style={{ fontSize:12, color:'#FF6B4A', margin:'2px 0', fontWeight:700 }}>{profile.category?.[0]}</p>
                      <div style={{ fontSize:12 }}>★ {(profile.avgRating || 4.8).toFixed(1)} · ₹{profile.rate}/hr</div>
                      <button
                        onClick={() => setBookingTarget(profile)}
                        style={{ marginTop:8, background:'#FF6B4A', color:'white', border:'none', borderRadius:999, padding:'5px 14px', fontSize:12, fontWeight:800, cursor:'pointer' }}>
                        {t('browse_book')}
                      </button>
                    </div>
                  </Popup>
                </Marker>
              );
            })}
          </MapContainer>

          {/* Map overlay: selected worker mini-card */}
          {selectedWorker && (
            <div className="map-selected-card animate-slideUp">
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
                <div>
                  <p style={{ fontWeight:900, fontSize:15, fontFamily:'Poppins,sans-serif' }}>{selectedWorker.userId?.name}</p>
                  <p style={{ fontSize:12, color:'#FF6B4A', fontWeight:700, marginTop:2 }}>{selectedWorker.category?.[0]}</p>
                </div>
                <button className="btn btn-ghost btn-icon" style={{ width:28, height:28 }} onClick={() => setSelectedWorker(null)}><X size={14} /></button>
              </div>
              <div style={{ display:'flex', gap:8, marginTop:8, alignItems:'center', flexWrap:'wrap' }}>
                <span style={{ fontSize:13, fontWeight:800, color:'#FF6B4A' }}>₹{selectedWorker.rate}/hr</span>
                <span style={{ fontSize:12, color:'#8E8E8E' }}>★ {(selectedWorker.avgRating || 4.8).toFixed(1)}</span>
                <span style={{ fontSize:12, color:'#8E8E8E' }}>
                  ETA ~{15 + (profiles.indexOf(selectedWorker) * 7) % 25} mins
                </span>
              </div>
              <button className="btn btn-primary" style={{ width:'100%', marginTop:10, borderRadius:999 }}
                onClick={() => setBookingTarget(selectedWorker)}>
                {t('browse_book')}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ─── BOOKING MODAL ──────────────────── */}
      {bookingTarget && (
        <BookingFlow
          helper={bookingTarget.userId}
          profile={bookingTarget}
          onClose={() => setBookingTarget(null)}
          onSuccess={() => setBookingTarget(null)}
        />
      )}

      <style>{`
        .browse-root {
          display: flex; flex-direction: column;
          height: calc(100vh - 70px);
          background: #FFF9F5;
          font-family: 'Nunito', sans-serif;
          overflow: hidden;
        }

        /* Topbar */
        .browse-topbar {
          display: flex; align-items: center; gap: 10px;
          padding: 12px 20px; background: white;
          border-bottom: 1.5px solid #F6ECE5;
          box-shadow: 0 2px 12px rgba(0,0,0,0.05);
          flex-shrink: 0; flex-wrap: wrap;
        }
        .browse-location-pill {
          display: flex; align-items: center; gap: 6px;
          background: #FFEFEA; border: 1.5px solid #FFC4B6;
          padding: 8px 14px; border-radius: 999px; cursor: pointer;
          font-weight: 800; font-size: 14px; color: #2B2B2B;
          flex-shrink: 0; white-space: nowrap;
        }
        .browse-search-wrap {
          flex: 1; min-width: 200px;
          display: flex; align-items: center; gap: 10px;
          background: #F8F4F0; border: 1.5px solid #F0E6DF;
          border-radius: 999px; padding: 10px 16px;
          transition: all 0.2s;
        }
        .browse-search-wrap:focus-within { border-color: #FF6B4A; background: white; }
        .browse-search-input {
          flex: 1; border: none; background: none; outline: none;
          font-size: 14px; font-weight: 700; color: #2B2B2B;
          font-family: 'Nunito', sans-serif;
        }
        .browse-clear-btn {
          background: none; border: none; cursor: pointer; color: #8E8E8E;
          display: flex; align-items: center; padding: 2px;
        }
        .browse-filter-btn {
          display: flex; align-items: center; gap: 7px;
          background: white; border: 1.5px solid #F0E6DF;
          border-radius: 999px; padding: 9px 18px;
          font-weight: 800; font-size: 14px; cursor: pointer;
          position: relative; transition: all 0.2s;
          flex-shrink: 0;
        }
        .browse-filter-btn:hover { border-color: #FF6B4A; color: #FF6B4A; }
        .browse-filter-dot {
          width: 8px; height: 8px; border-radius: 50%; background: #FF6B4A;
          position: absolute; top: 6px; right: 6px;
        }

        /* Category pills */
        .browse-cat-bar {
          display: flex; gap: 8px; padding: 10px 20px;
          overflow-x: auto; flex-shrink: 0;
          background: white; border-bottom: 1.5px solid #F6ECE5;
        }
        .browse-cat-bar::-webkit-scrollbar { display: none; }
        .browse-cat-pill {
          flex-shrink: 0;
          background: #F8F4F0; border: 1.5px solid #F0E6DF;
          border-radius: 999px; padding: 6px 16px;
          font-size: 13px; font-weight: 800; cursor: pointer;
          color: #5A5A5A; white-space: nowrap;
          transition: all 0.2s; font-family: 'Nunito', sans-serif;
        }
        .browse-cat-pill:hover { border-color: #FF6B4A; color: #FF6B4A; }
        .browse-cat-active { background: #FF6B4A !important; color: white !important; border-color: #FF6B4A !important; }

        /* Split layout */
        .browse-split {
          flex: 1; display: flex; overflow: hidden;
        }

        /* Left Panel */
        .browse-left {
          width: 46%; min-width: 320px; max-width: 560px;
          display: flex; flex-direction: column;
          border-right: 1.5px solid #F0E6DF;
          overflow: hidden;
        }

        /* Filters drawer */
        .browse-filters-drawer {
          background: white; border-bottom: 1.5px solid #F0E6DF;
          padding: 18px 20px;
        }
        .browse-filters-header {
          display: flex; justify-content: space-between; align-items: center;
          margin-bottom: 14px;
        }
        .browse-filters-grid {
          display: flex; flex-direction: column; gap: 16px;
        }
        .filter-group { display: flex; flex-direction: column; gap: 6px; }
        .filter-label { font-size: 13px; font-weight: 800; color: #2B2B2B; }
        .filter-range {
          -webkit-appearance: none; appearance: none;
          height: 4px; border-radius: 2px; background: #F0E6DF; outline: none;
        }
        .filter-range::-webkit-slider-thumb {
          -webkit-appearance: none; width: 18px; height: 18px; border-radius: 50%;
          background: #FF6B4A; cursor: pointer; border: 2px solid white;
          box-shadow: 0 2px 6px rgba(255,107,74,0.3);
        }
        .filter-range-labels { display: flex; justify-content: space-between; font-size: 11px; color: #8E8E8E; font-weight: 700; }
        .browse-toggle-pill {
          display: inline-flex; align-items: center; gap: 5px;
          background: #F8F4F0; border: 1.5px solid #F0E6DF;
          border-radius: 999px; padding: 6px 14px;
          font-size: 13px; font-weight: 800; cursor: pointer;
          transition: all 0.2s;
        }
        .browse-toggle-on { background: #E6F8F6 !important; color: #1B857A !important; border-color: #2EC4B6 !important; }
        .browse-toggle-emergency { background: #FFEFEA !important; color: #FF6B4A !important; border-color: #FF6B4A !important; }

        /* Results bar */
        .browse-results-bar {
          display: flex; justify-content: space-between; align-items: center;
          padding: 10px 20px; background: #FFF9F5;
          border-bottom: 1px solid #F6ECE5; flex-shrink: 0;
        }
        .browse-results-count { font-size: 13px; font-weight: 800; color: #5A5A5A; }
        .browse-refresh-btn { background: none; border: none; cursor: pointer; color: #8E8E8E; padding: 4px; }
        .browse-refresh-btn:hover { color: #FF6B4A; }

        /* Cards list */
        .browse-cards-list {
          flex: 1; overflow-y: auto;
          padding: 14px 16px;
          display: flex; flex-direction: column; gap: 12px;
        }
        .browse-cards-list::-webkit-scrollbar { width: 4px; }
        .browse-cards-list::-webkit-scrollbar-thumb { background: #F0E6DF; border-radius: 2px; }

        /* Map */
        .browse-map-panel {
          flex: 1; position: relative; overflow: hidden;
        }
        .browse-map-panel .leaflet-container { background: #F8F4F0; }

        /* Map selected card */
        .map-selected-card {
          position: absolute; bottom: 20px; left: 50%; transform: translateX(-50%);
          background: white; border-radius: 20px;
          padding: 16px 20px; min-width: 260px; max-width: 340px;
          box-shadow: 0 8px 32px rgba(0,0,0,0.16);
          border: 1.5px solid #F6ECE5; z-index: 1000;
        }

        /* Skeleton */
        .browse-skeleton {
          background: white; border-radius: 16px; padding: 16px;
          display: flex; gap: 12px; align-items: center;
          border: 1.5px solid #F0E6DF;
        }
        .skeleton-circle {
          width: 56px; height: 56px; border-radius: 50%;
          background: linear-gradient(90deg, #F0E6DF 25%, #FFF4EC 50%, #F0E6DF 75%);
          background-size: 200% 100%; animation: shimmer 1.5s infinite; flex-shrink: 0;
        }
        .skeleton-line {
          height: 12px; border-radius: 6px;
          background: linear-gradient(90deg, #F0E6DF 25%, #FFF4EC 50%, #F0E6DF 75%);
          background-size: 200% 100%; animation: shimmer 1.5s infinite;
        }
        @keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }

        .browse-empty {
          display: flex; flex-direction: column; align-items: center;
          justify-content: center; gap: 12px; padding: 48px 0;
          color: #8E8E8E; font-weight: 700; font-size: 15px; text-align: center;
        }

        @keyframes spin { to { transform: rotate(360deg); } }
        .animate-slideDown { animation: slideDown 0.25s ease-out; }
        @keyframes slideDown { from{opacity:0;transform:translateY(-12px)} to{opacity:1;transform:translateY(0)} }
        .animate-slideUp { animation: slideUp 0.28s cubic-bezier(0.34,1.56,0.64,1); }
        @keyframes slideUp { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }

        /* Responsive: stack on mobile */
        @media (max-width: 768px) {
          .browse-split { flex-direction: column; }
          .browse-left { width: 100%; max-width: 100%; height: 55%; border-right: none; border-bottom: 1.5px solid #F0E6DF; }
          .browse-map-panel { height: 45%; }
        }

        /* Leaflet popup styling */
        .leaflet-popup-content-wrapper {
          border-radius: 16px !important;
          box-shadow: 0 8px 24px rgba(0,0,0,0.12) !important;
          border: 1.5px solid #F6ECE5 !important;
        }
        .leaflet-popup-tip { background: white !important; }
      `}</style>
    </div>
  );
}
