import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Star } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import RatingModal from '../components/review/RatingModal';
import toast from 'react-hot-toast';

const STAGES = [
  { id: 'pending', label: '1. Requested 📩' },
  { id: 'accepted', label: '2. Accepted 🤝' },
  { id: 'paid', label: '3. Paid & Held 🔒' },
  { id: 'completed', label: '4. Work Done 🎉' },
];

export default function JobDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [req, setReq] = useState(null);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const [completing, setCompleting] = useState(false);
  const [showRatingModal, setShowRatingModal] = useState(false);

  const loadJob = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/hire/${id}`);
      setReq(res.data.request);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadJob(); }, [id]);

  const isRecruiter = user?.id === req?.recruiterId?._id || user?.id === req?.recruiterId;
  const isHelper = user?.id === req?.helperId?._id || user?.id === req?.helperId;

  const handlePay = async () => {
    setPaying(true);
    try {
      const res = await api.post('/payment/checkout', { hireRequestId: req._id });
      if (res.data.demo) {
        toast.success("Payment completed! Funds are held safely in escrow. 🎉");
        loadJob();
      } else if (res.data.checkoutUrl) {
        window.location.href = res.data.checkoutUrl;
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Payment failed');
    } finally {
      setPaying(false);
    }
  };

  const handleMarkComplete = async () => {
    setCompleting(true);
    try {
      const res = await api.patch(`/hire/${req._id}/complete`);
      toast.success('Marked done from your side! 🎉');
      if (res.data.request.status === 'completed') {
        toast.success("You're all set! 🎉 Job completed and payment released!");
      }
      loadJob();
    } catch (err) {
      toast.error('Failed to update status');
    } finally {
      setCompleting(false);
    }
  };

  if (loading) {
    return (
      <div className="container" style={{ paddingTop: 'var(--space-12)', textAlign: 'center' }}>
        <div className="spinner spinner-lg" style={{ margin: '0 auto' }} />
      </div>
    );
  }

  if (!req) {
    return (
      <div className="container" style={{ paddingTop: 'var(--space-12)' }}>
        <div className="empty-state">
          <p className="empty-state-title">Job request not found</p>
          <button className="btn btn-outline mt-4" onClick={() => navigate(-1)}>Go Back</button>
        </div>
      </div>
    );
  }

  const stageIds = STAGES.map(s => s.id);
  const currentStageIndex = stageIds.indexOf(req.status === 'rated' ? 'completed' : req.status);

  return (
    <div className="container" style={{ paddingTop: 'var(--space-8)', paddingBottom: 'var(--space-16)' }}>
      <button className="btn btn-ghost btn-sm" onClick={() => navigate(-1)} style={{ marginBottom: 'var(--space-6)', paddingLeft: 0 }}>
        <ArrowLeft size={16} /> Back to Dashboard
      </button>

      {/* Header */}
      <div className="card card-body" style={{ marginBottom: 'var(--space-8)', border: '2px solid #FFDCD4' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 'var(--space-4)' }}>
          <div>
            <span className={`badge status-${req.status}`} style={{ fontSize: '13px', padding: '6px 14px', marginBottom: 8 }}>
              {req.status === 'completed' || req.status === 'rated' ? "You're all set! 🎉 Completed" : req.status.toUpperCase()}
            </span>
            <h1 className="headline-md" style={{ marginTop: 6 }}>{req.jobTitle || 'Fix-It Request'}</h1>
            <p className="text-secondary" style={{ marginTop: 4 }}>📍 {req.jobLocation} · ₹{req.agreedAmount}</p>
          </div>

          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '28px', fontWeight: 900, color: 'var(--color-primary)', fontFamily: 'Poppins, sans-serif' }}>₹{req.agreedAmount}</div>
            <p className="text-xs text-muted font-bold">AGREED FEE</p>
          </div>
        </div>
      </div>

      {/* Friendly Job Timeline */}
      <div className="card card-body" style={{ marginBottom: 'var(--space-8)' }}>
        <h2 style={{ fontSize: '20px', fontWeight: 800, marginBottom: 'var(--space-6)' }}>Job Progress Timeline</h2>
        <div style={{ display: 'flex', justifyContent: 'space-between', position: 'relative', padding: '0 var(--space-4)' }}>
          <div style={{ position: 'absolute', top: 18, left: 40, right: 40, height: 5, background: '#F6ECE5', zIndex: 0 }}>
            <div style={{ width: `${(Math.max(0, currentStageIndex) / (STAGES.length - 1)) * 100}%`, height: '100%', background: 'var(--color-primary)', transition: 'width 0.4s ease' }} />
          </div>

          {STAGES.map((stage, idx) => {
            const isPassed = idx <= currentStageIndex;
            return (
              <div key={stage.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 1, gap: 8 }}>
                <div style={{
                  width: 40, height: 40, borderRadius: '50%',
                  background: isPassed ? 'var(--color-primary)' : 'white',
                  color: isPassed ? 'white' : 'var(--color-outline)',
                  border: `3px solid ${isPassed ? 'var(--color-primary)' : 'var(--color-outline-variant)'}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: 15,
                  boxShadow: isPassed ? 'var(--shadow-sm)' : 'none',
                }}>
                  {isPassed ? '✓' : idx + 1}
                </div>
                <span style={{ fontSize: '13.5px', fontWeight: isPassed ? 800 : 600, color: isPassed ? 'var(--color-on-surface)' : 'var(--color-outline)' }}>
                  {stage.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Actions */}
      <div className="card card-body" style={{ marginBottom: 'var(--space-8)' }}>
        <h2 style={{ fontSize: '20px', fontWeight: 800, marginBottom: 'var(--space-4)' }}>Next Action</h2>

        {req.status === 'pending' && (
          <p className="body-lg text-secondary">
            {isHelper ? '🎉 Recruiter requested your help! Accept or decline below.' : 'Waiting for helper to confirm your request...'}
          </p>
        )}

        {req.status === 'accepted' && (
          <div>
            <p className="body-lg text-secondary" style={{ marginBottom: 'var(--space-4)' }}>
              {isRecruiter
                ? 'Helper accepted! Pay now to lock in your booking. Funds are held safely in escrow.'
                : 'You accepted the job! Waiting for recruiter to confirm payment.'}
            </p>
            {isRecruiter && (
              <button className="btn btn-primary btn-lg" onClick={handlePay} disabled={paying}>
                {paying ? 'Processing...' : `Pay ₹${req.agreedAmount} & Lock Booking 🔒`}
              </button>
            )}
          </div>
        )}

        {req.status === 'paid' && (
          <div>
            <p className="body-lg text-secondary" style={{ marginBottom: 'var(--space-4)' }}>
              🔒 Payment held in escrow. Once work is completed offline, click below!
            </p>
            <div className="flex gap-4 flex-wrap">
              {isRecruiter && (
                <button className="btn btn-success btn-lg" onClick={handleMarkComplete} disabled={completing || req.recruiterMarkedDone}>
                  {req.recruiterMarkedDone ? '✓ You Marked Done' : 'Confirm Work Finished 🎉'}
                </button>
              )}
              {isHelper && (
                <button className="btn btn-success btn-lg" onClick={handleMarkComplete} disabled={completing || req.helperMarkedDone}>
                  {req.helperMarkedDone ? '✓ You Marked Done' : 'Mark Work Finished 🛠️'}
                </button>
              )}
            </div>
          </div>
        )}

        {(req.status === 'completed' || req.status === 'rated') && (
          <div>
            <p className="body-lg text-secondary" style={{ marginBottom: 'var(--space-4)' }}>
              🎉 You're all set! Job is completed and funds released to helper.
            </p>
            {isRecruiter && req.status === 'completed' && (
              <button className="btn btn-primary" onClick={() => setShowRatingModal(true)}>
                <Star size={16} /> Leave Star Rating &amp; Review
              </button>
            )}
            {req.status === 'rated' && (
              <span className="badge badge-success" style={{ fontSize: '15px', padding: '8px 18px' }}>
                🎉 You're all set! Review Submitted
              </span>
            )}
          </div>
        )}
      </div>

      {showRatingModal && (
        <RatingModal
          hireRequest={req}
          revieweeId={req.helperId?._id || req.helperId}
          revieweeName={req.helperId?.name || 'Helper'}
          onClose={() => setShowRatingModal(false)}
          onSuccess={loadJob}
        />
      )}
    </div>
  );
}
