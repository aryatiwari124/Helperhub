import { useState } from 'react';
import { Star, X } from 'lucide-react';
import api from '../../services/api';
import { useLanguage } from '../../context/LanguageContext';
import toast from 'react-hot-toast';

export default function RatingModal({ hireRequest, revieweeId, revieweeName, onClose, onSuccess }) {
  const { t } = useLanguage();
  const [rating, setRating] = useState(0);
  const [hovered, setHovered] = useState(0);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    if (!rating) { toast.error(t('rating_select_err', 'Please select a rating')); return; }
    setLoading(true);
    try {
      await api.post('/review', {
        hireRequestId: hireRequest?._id,
        revieweeId,
        rating,
        comment,
      });
      toast.success(t('rating_submitted', 'Review submitted! Thank you.'));
      onSuccess?.();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || t('rating_failed', 'Failed to submit review'));
    } finally {
      setLoading(false);
    }
  };

  const labels = [
    '',
    t('rating_1', 'Poor'),
    t('rating_2', 'Fair'),
    t('rating_3', 'Good'),
    t('rating_4', 'Very Good'),
    t('rating_5', 'Excellent')
  ];

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ maxWidth: 420 }}>
        <div className="modal-header">
          <h2 style={{ fontSize: '18px', fontWeight: 700 }}>
            {t('rating_title', { name: revieweeName || '' })}
          </h2>
          <button className="btn btn-ghost btn-icon" onClick={onClose}><X size={18} /></button>
        </div>
        <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)', alignItems: 'center' }}>
          <p className="text-secondary text-sm">
            {t('rating_subtitle', { name: revieweeName || '' })}
          </p>

          {/* Star selector */}
          <div style={{ display: 'flex', gap: 8 }}>
            {[1, 2, 3, 4, 5].map(s => (
              <button
                key={s}
                onMouseEnter={() => setHovered(s)}
                onMouseLeave={() => setHovered(0)}
                onClick={() => setRating(s)}
                style={{
                  transform: (hovered || rating) >= s ? 'scale(1.2)' : 'scale(1)',
                  transition: 'transform 0.15s',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: 4
                }}
              >
                <Star
                  size={36}
                  fill={(hovered || rating) >= s ? '#f59e0b' : 'none'}
                  stroke={(hovered || rating) >= s ? '#f59e0b' : '#d1d5db'}
                  strokeWidth={1.5}
                />
              </button>
            ))}
          </div>
          {(hovered || rating) > 0 && (
            <p style={{ fontWeight: 600, color: 'var(--color-primary)', fontSize: '16px' }}>
              {labels[hovered || rating]}
            </p>
          )}

          <div className="form-group w-full">
            <label className="form-label" htmlFor="review-comment">{t('rating_comment_label', 'Leave a comment (optional)')}</label>
            <textarea
              id="review-comment"
              className="form-textarea"
              value={comment}
              onChange={e => setComment(e.target.value)}
              placeholder={t('rating_comment_placeholder', 'Share your experience to help others...')}
              rows={3}
            />
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn btn-ghost" onClick={onClose}>{t('general_cancel', 'Skip')}</button>
          <button className="btn btn-primary" onClick={submit} disabled={loading || !rating}>
            {loading ? <><div className="spinner spinner-sm" />{t('rating_submitting', 'Submitting...')}</> : t('rating_submit', 'Submit Review')}
          </button>
        </div>
      </div>
    </div>
  );
}
