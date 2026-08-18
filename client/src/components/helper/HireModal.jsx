import { useState } from 'react';
import { X, Calendar, MapPin, DollarSign, FileText, AlertCircle } from 'lucide-react';
import api from '../../services/api';
import { useLanguage } from '../../context/LanguageContext';
import toast from 'react-hot-toast';

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

export default function HireModal({ helper, profile, onClose, onSuccess }) {
  const { t } = useLanguage();
  const [form, setForm] = useState({
    jobTitle: '',
    jobDescription: '',
    jobLocation: '',
    scheduledDate: '',
    agreedAmount: profile?.rate || '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handle = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    if (!form.jobTitle || !form.jobDescription || !form.jobLocation) {
      setError(t('hire_err_required'));
      return;
    }
    setLoading(true);
    setError('');
    try {
      await api.post('/hire', {
        helperId: helper._id,
        ...form,
        agreedAmount: Number(form.agreedAmount),
      });
      toast.success(t('hire_success', { name: helper.name }));
      onSuccess?.();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || t('hire_failed'));
    } finally {
      setLoading(false);
    }
  };

  const initials = helper?.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

  const categoriesText = profile?.category?.map(c => t(CATEGORY_KEYS[c] || '', c)).join(', ');

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <div className="flex items-center gap-3">
            {helper?.profilePic ? (
              <img src={helper.profilePic} alt={helper.name} className="avatar avatar-md" />
            ) : (
              <div className="avatar-placeholder avatar-md" style={{ fontSize: '16px' }}>{initials}</div>
            )}
            <div>
              <h2 style={{ fontSize: '18px', fontWeight: 700 }}>
                {t('hire_modal_title', { name: helper?.name || '' })}
              </h2>
              <p className="text-sm text-secondary">{categoriesText}</p>
            </div>
          </div>
          <button className="btn btn-ghost btn-icon" onClick={onClose}><X size={18} /></button>
        </div>

        <form onSubmit={submit}>
          <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
            {error && (
              <div className="flex items-center gap-2" style={{ padding: '10px 14px', background: 'var(--color-error-container)', borderRadius: 'var(--radius-sm)', color: 'var(--color-on-error-container)', fontSize: '14px' }}>
                <AlertCircle size={15} /> {error}
              </div>
            )}

            <div className="form-group">
              <label className="form-label">{t('hire_job_title')}</label>
              <input
                className="form-input"
                name="jobTitle"
                value={form.jobTitle}
                onChange={handle}
                placeholder={t('hire_job_title_placeholder')}
              />
            </div>

            <div className="form-group">
              <label className="form-label">{t('hire_job_desc')}</label>
              <textarea
                className="form-textarea"
                name="jobDescription"
                value={form.jobDescription}
                onChange={handle}
                placeholder={t('hire_job_desc_placeholder')}
                rows={3}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
              <div className="form-group">
                <label className="form-label">{t('hire_location')}</label>
                <div style={{ position: 'relative' }}>
                  <MapPin size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-outline)' }} />
                  <input
                    className="form-input"
                    name="jobLocation"
                    value={form.jobLocation}
                    onChange={handle}
                    placeholder={t('hire_location_placeholder')}
                    style={{ paddingLeft: 36 }}
                  />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">{t('hire_date')}</label>
                <div style={{ position: 'relative' }}>
                  <Calendar size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-outline)' }} />
                  <input
                    className="form-input"
                    type="date"
                    name="scheduledDate"
                    value={form.scheduledDate}
                    onChange={handle}
                    min={new Date().toISOString().split('T')[0]}
                    style={{ paddingLeft: 36 }}
                  />
                </div>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">{t('hire_amount')}</label>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', fontWeight: 600, color: 'var(--color-on-surface-variant)' }}>₹</span>
                <input
                  className="form-input"
                  type="number"
                  name="agreedAmount"
                  value={form.agreedAmount}
                  onChange={handle}
                  placeholder={t('hire_amount_placeholder', { rate: profile?.rate || 450, rateType: t('general_hrs', 'hr') })}
                  style={{ paddingLeft: 28 }}
                />
              </div>
              <span className="form-hint">{t('hire_standard_rate', { rate: profile?.rate || 450, rateType: t('general_hrs', 'hr') })}</span>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-ghost" onClick={onClose}>{t('general_cancel')}</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? <><div className="spinner spinner-sm" />{t('hire_sending')}</> : t('hire_submit')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
