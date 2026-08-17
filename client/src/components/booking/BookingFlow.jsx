import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Calendar, Clock, Camera, CreditCard, CheckCircle2, Lock, ArrowLeft, ArrowRight } from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { useLanguage } from '../../context/LanguageContext';

const TIME_SLOTS = [
  '8:00 AM', '9:00 AM', '10:00 AM', '11:00 AM', '12:00 PM',
  '2:00 PM', '3:00 PM', '4:00 PM', '5:00 PM', '6:00 PM',
];
const BOOKED_SLOTS = [2, 6]; // indices that are unavailable

// Generate next 14 days
function getNext14Days() {
  const days = [];
  const dayNames = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
  const monthNames = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  for (let i = 0; i < 14; i++) {
    const d = new Date();
    d.setDate(d.getDate() + i);
    days.push({
      label: i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : dayNames[d.getDay()],
      date: d.getDate(),
      month: monthNames[d.getMonth()],
      full: d.toISOString().split('T')[0],
      display: `${dayNames[d.getDay()]}, ${d.getDate()} ${monthNames[d.getMonth()]}`,
    });
  }
  return days;
}

export default function BookingFlow({ helper, profile, onClose, onSuccess }) {
  const { t } = useLanguage();
  const STEPS = [t('book_step_date'), t('book_step_time'), t('book_step_details'), t('book_step_review'), t('book_step_payment')];
  
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [confirmed, setConfirmed] = useState(false);
  const [confirmedJobId, setConfirmedJobId] = useState(null);
  const [paying, setPaying] = useState(false);

  // Form state
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [jobTitle, setJobTitle] = useState('');
  const [jobDesc, setJobDesc] = useState('');
  const [address, setAddress] = useState('');
  const [images, setImages] = useState([]);
  const [card, setCard] = useState({ number: '', expiry: '', cvv: '', name: '' });

  const fileRef = useRef();
  const days = getNext14Days();
  const rate = profile?.rate || 450;
  const platformFee = 50;
  const total = rate + platformFee;

  const canProceed = () => {
    if (step === 0) return !!selectedDate;
    if (step === 1) return !!selectedTime;
    if (step === 2) return jobTitle.trim() && address.trim();
    if (step === 3) return true;
    if (step === 4) return card.number.length >= 16 && card.expiry && card.cvv.length >= 3 && card.name;
    return false;
  };

  const handlePay = async () => {
    setPaying(true);
    try {
      const hireRes = await api.post('/hire', {
        helperId: helper?._id,
        jobTitle,
        jobDescription: jobDesc,
        jobLocation: address,
        scheduledDate: selectedDate?.full,
        agreedAmount: rate,
      });
      const hireId = hireRes.data.request?._id;
      if (hireId) {
        const payRes = await api.post('/payment/checkout', { hireRequestId: hireId });
        if (payRes.data.demo || payRes.data.checkoutUrl) {
          setConfirmedJobId(hireId);
          setConfirmed(true);
          toast.success(t('book_confirmed_title'));
          onSuccess?.();
        }
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Payment failed. Try again.');
    } finally {
      setPaying(false);
    }
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files || []);
    files.forEach(f => {
      const reader = new FileReader();
      reader.onload = (ev) => setImages(prev => [...prev, { name: f.name, src: ev.target.result }]);
      reader.readAsDataURL(f);
    });
  };

  const formatCard = (val) => val.replace(/\D/g,'').slice(0,16).replace(/(.{4})/g,'$1 ').trim();
  const formatExpiry = (val) => {
    const v = val.replace(/\D/g,'').slice(0,4);
    return v.length > 2 ? v.slice(0,2) + '/' + v.slice(2) : v;
  };

  // ── CONFIRMED SCREEN ──────────────────────────────────────
  if (confirmed) {
    return (
      <div className="bf-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
        <div className="bf-modal animate-slideUp">
          <div className="bf-confirmed">
            <div style={{ fontSize: 64 }}>✅</div>
            <h2 className="bf-confirmed-title">{t('book_confirmed_title')}</h2>
            <p className="bf-confirmed-sub">{t('book_confirmed_sub')}</p>
            <div className="bf-summary-card">
              <div className="bf-summary-row"><span>{t('book_hero')}</span><strong>{helper?.name}</strong></div>
              <div className="bf-summary-row"><span>{t('book_service')}</span><strong>{profile?.category?.[0]}</strong></div>
              <div className="bf-summary-row"><span>{t('book_date')}</span><strong>{selectedDate?.display}</strong></div>
              <div className="bf-summary-row"><span>{t('book_time')}</span><strong>{selectedTime}</strong></div>
              <div className="bf-summary-row"><span>{t('book_address_label')}</span><strong>{address}</strong></div>
              <div className="bf-summary-row" style={{ borderTop:'1.5px solid #F6ECE5',paddingTop:10,marginTop:4 }}>
                <span style={{ fontWeight:800 }}>Total Paid</span>
                <strong style={{ color:'#FF6B4A',fontSize:18 }}>₹{total}</strong>
              </div>
            </div>
            <div style={{ display:'flex', gap:12, justifyContent:'center', flexWrap:'wrap' }}>
              {confirmedJobId && (
                <button className="btn btn-primary btn-lg" onClick={() => { onClose(); navigate(`/job/${confirmedJobId}`); }}>
                  {t('book_view_status')}
                </button>
              )}
              <button className="btn btn-ghost" onClick={onClose}>{t('book_close')}</button>
            </div>
          </div>
        </div>
        <style>{BF_STYLES}</style>
      </div>
    );
  }

  return (
    <div className="bf-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="bf-modal animate-slideUp">

        {/* Header */}
        <div className="bf-header">
          <div>
            <h2 className="bf-title">Book {helper?.name?.split(' ')[0]}</h2>
            <p className="bf-subtitle">{profile?.category?.[0]} · ₹{rate}/hr</p>
          </div>
          <button className="btn btn-ghost btn-icon" onClick={onClose}><X size={20} /></button>
        </div>

        {/* Stepper */}
        <div className="bf-stepper">
          {STEPS.map((s, i) => {
            const done = i < step;
            const active = i === step;
            return (
              <div key={s} className="bf-step-item">
                <div className={`bf-step-circle ${active ? 'bf-step-active' : done ? 'bf-step-done' : 'bf-step-todo'}`}>
                  {done ? <CheckCircle2 size={14} /> : i + 1}
                </div>
                <span className={`bf-step-label ${active ? 'bf-step-label-active' : ''}`}>{s}</span>
                {i < STEPS.length - 1 && <div className={`bf-step-line ${done ? 'bf-step-line-done' : ''}`} />}
              </div>
            );
          })}
        </div>

        {/* Step Content */}
        <div className="bf-body">

          {/* STEP 0: DATE */}
          {step === 0 && (
            <div className="animate-fadeIn">
              <h3 className="bf-step-heading"><Calendar size={20} /> {t('book_choose_date')}</h3>
              <div className="bf-date-grid">
                {days.map((d) => (
                  <button
                    key={d.full}
                    className={`bf-date-btn ${selectedDate?.full === d.full ? 'bf-date-selected' : ''}`}
                    onClick={() => setSelectedDate(d)}
                  >
                    <span className="bf-date-dayname">{d.label}</span>
                    <span className="bf-date-num">{d.date}</span>
                    <span className="bf-date-month">{d.month}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* STEP 1: TIME SLOT */}
          {step === 1 && (
            <div className="animate-fadeIn">
              <h3 className="bf-step-heading"><Clock size={20} /> {t('book_choose_time')}</h3>
              <p className="bf-step-sub">{t('book_slots_for')} <strong>{selectedDate?.display}</strong></p>
              <div className="bf-time-grid">
                {TIME_SLOTS.map((t, i) => {
                  const booked = BOOKED_SLOTS.includes(i);
                  return (
                    <button
                      key={t}
                      disabled={booked}
                      className={`bf-time-btn ${selectedTime === t ? 'bf-time-selected' : ''} ${booked ? 'bf-time-booked' : ''}`}
                      onClick={() => !booked && setSelectedTime(t)}
                    >
                      {t}
                      {booked && <span className="bf-booked-tag">Booked</span>}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 2: JOB DETAILS */}
          {step === 2 && (
            <div className="animate-fadeIn" style={{ display:'flex', flexDirection:'column', gap:16 }}>
              <h3 className="bf-step-heading">📋 {t('book_step_details')}</h3>
              <div className="form-group">
                <label className="form-label">{t('book_job_title')} *</label>
                <input className="form-input" placeholder="e.g. Fix Kitchen Sink Leak" value={jobTitle} onChange={e => setJobTitle(e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">{t('book_job_desc')}</label>
                <textarea className="form-textarea" rows={3} placeholder="Describe the issue in detail..." value={jobDesc} onChange={e => setJobDesc(e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">{t('book_address')} *</label>
                <input className="form-input" placeholder="e.g. 12, Marine Lines, Mumbai 400001" value={address} onChange={e => setAddress(e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">{t('book_upload')}</label>
                <div
                  className="bf-upload-box"
                  onClick={() => fileRef.current?.click()}
                  onDragOver={e => e.preventDefault()}
                  onDrop={e => { e.preventDefault(); handleImageUpload({ files: e.dataTransfer.files }); }}
                >
                  <Camera size={28} style={{ color:'#FF6B4A' }} />
                  <p style={{ fontWeight:700, marginTop:8 }}>📷 {t('book_upload_hint')}</p>
                  <p style={{ fontSize:12, color:'#8E8E8E' }}>JPG, PNG up to 5MB each</p>
                </div>
                <input ref={fileRef} type="file" accept="image/*" multiple style={{ display:'none' }} onChange={handleImageUpload} />
                {images.length > 0 && (
                  <div className="bf-image-previews">
                    {images.map((img, i) => (
                      <div key={i} className="bf-image-thumb">
                        <img src={img.src} alt={img.name} />
                        <button onClick={() => setImages(p => p.filter((_,idx) => idx !== i))}>✕</button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* STEP 3: REVIEW */}
          {step === 3 && (
            <div className="animate-fadeIn">
              <h3 className="bf-step-heading">📋 {t('book_review_heading')}</h3>
              <div className="bf-summary-card" style={{ margin:'16px 0' }}>
                <div className="bf-summary-row"><span>{t('book_hero')}</span><strong>{helper?.name}</strong></div>
                <div className="bf-summary-row"><span>{t('book_service')}</span><strong>{profile?.category?.[0]}</strong></div>
                <div className="bf-summary-row"><span>{t('book_date')}</span><strong>{selectedDate?.display}</strong></div>
                <div className="bf-summary-row"><span>{t('book_time')}</span><strong>{selectedTime}</strong></div>
                <div className="bf-summary-row"><span>{t('book_job')}</span><strong>{jobTitle}</strong></div>
                <div className="bf-summary-row"><span>{t('book_address_label')}</span><strong>{address}</strong></div>
                <div style={{ borderTop:'1.5px solid #F6ECE5', marginTop:8, paddingTop:10, display:'flex', flexDirection:'column', gap:8 }}>
                  <div className="bf-summary-row"><span>{t('book_service_fee')}</span><span>₹{rate}</span></div>
                  <div className="bf-summary-row"><span>{t('book_platform_fee')}</span><span>₹{platformFee}</span></div>
                  <div className="bf-summary-row" style={{ fontWeight:800, fontSize:17 }}>
                    <span>{t('book_total')}</span><span style={{ color:'#FF6B4A' }}>₹{total}</span>
                  </div>
                </div>
              </div>
              <div className="bf-escrow-notice">
                <Lock size={16} />
                <span>{t('book_escrow')}</span>
              </div>
            </div>
          )}

          {/* STEP 4: PAYMENT */}
          {step === 4 && (
            <div className="animate-fadeIn" style={{ display:'flex', flexDirection:'column', gap:16 }}>
              <h3 className="bf-step-heading"><CreditCard size={20} /> {t('book_pay_secure')}</h3>
              <div className="bf-card-visual">
                <div style={{ fontSize:11, opacity:0.7, letterSpacing:2 }}>DEBIT / CREDIT CARD</div>
                <div style={{ fontSize:18, fontWeight:700, letterSpacing:4, marginTop:8 }}>
                  {card.number || '•••• •••• •••• ••••'}
                </div>
                <div style={{ display:'flex', justifyContent:'space-between', marginTop:12, fontSize:12 }}>
                  <span>{card.name || 'CARD HOLDER'}</span>
                  <span>{card.expiry || 'MM/YY'}</span>
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">{t('book_card_number')}</label>
                <input className="form-input" placeholder="1234 5678 9012 3456" value={card.number} maxLength={19}
                  onChange={e => setCard(p => ({ ...p, number: formatCard(e.target.value) }))} />
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }}>
                <div className="form-group">
                  <label className="form-label">{t('book_expiry')}</label>
                  <input className="form-input" placeholder="MM/YY" value={card.expiry} maxLength={5}
                    onChange={e => setCard(p => ({ ...p, expiry: formatExpiry(e.target.value) }))} />
                </div>
                <div className="form-group">
                  <label className="form-label">{t('book_cvv')}</label>
                  <input className="form-input" placeholder="•••" type="password" maxLength={4} value={card.cvv}
                    onChange={e => setCard(p => ({ ...p, cvv: e.target.value.replace(/\D/g,'').slice(0,4) }))} />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">{t('book_name_card')}</label>
                <input className="form-input" placeholder="As printed on your card" value={card.name}
                  onChange={e => setCard(p => ({ ...p, name: e.target.value }))} />
              </div>
              <div style={{ display:'flex', alignItems:'center', gap:6, fontSize:12, color:'#8E8E8E', fontWeight:700 }}>
                <Lock size={13} /> {t('book_ssl')}
              </div>
            </div>
          )}
        </div>

        <div className="bf-footer">
          <button className="btn btn-ghost" onClick={() => step === 0 ? onClose() : setStep(s => s - 1)}>
            <ArrowLeft size={16} /> {step === 0 ? t('general_cancel') : t('book_back')}
          </button>

          {step < 4 ? (
            <button className="btn btn-primary btn-lg" disabled={!canProceed()} onClick={() => setStep(s => s + 1)}>
              {t('book_continue')} <ArrowRight size={16} />
            </button>
          ) : (
            <button className="btn btn-primary btn-lg" disabled={paying || !canProceed()} onClick={handlePay}>
              {paying ? t('book_processing') : `${t('book_pay_btn')} ₹${total} 🔒`}
            </button>
          )}
        </div>
      </div>
      <style>{BF_STYLES}</style>
    </div>
  );
}

const BF_STYLES = `
  .bf-overlay {
    position: fixed; inset: 0; z-index: 1100;
    background: rgba(43,43,43,0.6);
    backdrop-filter: blur(6px);
    display: flex; align-items: center; justify-content: center;
    padding: 16px;
  }
  .bf-modal {
    background: white; border-radius: 24px;
    box-shadow: 0 24px 56px rgba(0,0,0,0.18);
    width: 100%; max-width: 560px;
    max-height: 90vh; overflow: hidden;
    display: flex; flex-direction: column;
    border: 2px solid #F6ECE5;
  }
  .bf-header {
    display: flex; justify-content: space-between; align-items: center;
    padding: 20px 24px; border-bottom: 1.5px solid #F6ECE5;
    background: #FFF9F5;
  }
  .bf-title { font-size: 20px; font-weight: 900; font-family:'Poppins',sans-serif; }
  .bf-subtitle { font-size: 13px; color: #8E8E8E; font-weight: 700; }

  .bf-stepper {
    display: flex; align-items: center;
    padding: 16px 24px; border-bottom: 1.5px solid #F6ECE5;
    gap: 0; overflow-x: auto;
  }
  .bf-step-item { display: flex; align-items: center; flex-shrink: 0; }
  .bf-step-circle {
    width: 30px; height: 30px; border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    font-size: 13px; font-weight: 900; font-family:'Poppins',sans-serif;
    flex-shrink: 0;
  }
  .bf-step-active { background: #FF6B4A; color: white; }
  .bf-step-done { background: #2EC4B6; color: white; }
  .bf-step-todo { background: #F0E6DF; color: #8E8E8E; }
  .bf-step-label { font-size: 11px; font-weight: 800; color: #8E8E8E; margin: 0 6px; white-space: nowrap; }
  .bf-step-label-active { color: #FF6B4A; }
  .bf-step-line { width: 24px; height: 2px; background: #F0E6DF; flex-shrink: 0; }
  .bf-step-line-done { background: #2EC4B6; }

  .bf-body { flex: 1; overflow-y: auto; padding: 24px; }

  .bf-step-heading {
    display: flex; align-items: center; gap: 8px;
    font-size: 19px; font-weight: 900; font-family:'Poppins',sans-serif;
    margin-bottom: 16px; color: #2B2B2B;
  }
  .bf-step-sub { font-size: 13.5px; color: #5A5A5A; font-weight: 600; margin-bottom: 14px; margin-top: -8px; }

  .bf-date-grid {
    display: grid; grid-template-columns: repeat(7, 1fr); gap: 8px;
  }
  .bf-date-btn {
    display: flex; flex-direction: column; align-items: center;
    gap: 2px; padding: 10px 4px; border-radius: 12px;
    border: 1.5px solid #F0E6DF; background: white; cursor: pointer;
    transition: all 0.2s cubic-bezier(0.34,1.56,0.64,1);
  }
  .bf-date-btn:hover { border-color: #FF6B4A; transform: translateY(-2px); }
  .bf-date-selected { background: #FF6B4A !important; border-color: #FF6B4A !important; color: white !important; }
  .bf-date-dayname { font-size: 10px; font-weight: 700; opacity: 0.7; }
  .bf-date-num { font-size: 18px; font-weight: 900; font-family:'Poppins',sans-serif; }
  .bf-date-month { font-size: 10px; font-weight: 700; opacity: 0.7; }

  .bf-time-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; }
  .bf-time-btn {
    position: relative; padding: 13px 8px; border-radius: 12px;
    border: 1.5px solid #F0E6DF; background: white; cursor: pointer;
    font-size: 14px; font-weight: 700; transition: all 0.2s;
  }
  .bf-time-btn:hover:not(:disabled) { border-color: #FF6B4A; transform: translateY(-2px); }
  .bf-time-selected { background: #FF6B4A !important; color: white !important; border-color: #FF6B4A !important; }
  .bf-time-booked { background: #F8F8F8 !important; color: #BDBDBD !important; cursor: not-allowed; }
  .bf-booked-tag { display: block; font-size: 9px; font-weight: 800; color: #BDBDBD; margin-top: 2px; }

  .bf-upload-box {
    border: 2px dashed #FFC4B6; border-radius: 16px;
    padding: 32px; text-align: center; cursor: pointer;
    background: #FFF9F5; transition: all 0.2s;
  }
  .bf-upload-box:hover { border-color: #FF6B4A; background: #FFEFEA; }
  .bf-image-previews { display: flex; gap: 8px; flex-wrap: wrap; margin-top: 12px; }
  .bf-image-thumb {
    position: relative; width: 70px; height: 70px;
    border-radius: 10px; overflow: hidden; border: 2px solid #FFDCD4;
  }
  .bf-image-thumb img { width: 100%; height: 100%; object-fit: cover; }
  .bf-image-thumb button {
    position: absolute; top: 2px; right: 2px;
    background: rgba(0,0,0,0.5); color: white; border: none;
    border-radius: 50%; width: 18px; height: 18px; font-size: 9px; cursor: pointer;
  }

  .bf-summary-card {
    background: #FFF9F5; border: 1.5px solid #F6ECE5;
    border-radius: 16px; padding: 18px;
    display: flex; flex-direction: column; gap: 10px;
  }
  .bf-summary-row {
    display: flex; justify-content: space-between; align-items: center;
    font-size: 14.5px;
  }
  .bf-summary-row span:first-child { color: #8E8E8E; font-weight: 600; }

  .bf-escrow-notice {
    display: flex; align-items: center; gap: 8px;
    background: #E6F8F6; border: 1.5px solid #A8EADB;
    border-radius: 12px; padding: 12px 16px;
    font-size: 13px; font-weight: 700; color: #1B857A;
  }

  .bf-card-visual {
    background: linear-gradient(135deg, #2B2B2B 0%, #444 100%);
    border-radius: 16px; padding: 24px;
    color: white; font-family:'Poppins',sans-serif;
  }

  .bf-footer {
    display: flex; justify-content: space-between; align-items: center;
    padding: 16px 24px; border-top: 1.5px solid #F6ECE5;
    background: #FFF9F5;
  }

  .bf-confirmed {
    padding: 40px 32px;
    display: flex; flex-direction: column; align-items: center;
    gap: 16px; text-align: center;
  }
  .bf-confirmed-title { font-size: 26px; font-weight: 900; font-family:'Poppins',sans-serif; }
  .bf-confirmed-sub { font-size: 16px; color: #5A5A5A; font-weight: 600; }
`;
