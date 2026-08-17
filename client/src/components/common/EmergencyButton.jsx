import { useState } from 'react';
import { Siren, X, Zap, Flame, Droplet, Key, AlertTriangle, PhoneCall, ShieldAlert, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';

const EMERGENCY_SERVICES = [
  {
    id: 'electrician',
    title: 'Emergency Electrician',
    icon: '⚡',
    lucideIcon: <Zap size={24} color="#FFB703" />,
    desc: 'Power outage, main MCB trip, sparking switches, or short circuit.',
    eta: '10-15 mins',
    color: '#FFF8E5',
    borderColor: '#FFE5A3',
  },
  {
    id: 'gas_leak',
    title: 'Gas Leak Emergency',
    icon: '⛽',
    lucideIcon: <AlertTriangle size={24} color="#E63946" />,
    desc: 'Piped gas leak smell, regulator fault, or LPG valve issue.',
    eta: '8-12 mins',
    color: '#FFEAEB',
    borderColor: '#FFC4C7',
  },
  {
    id: 'burst_pipe',
    title: 'Burst Pipe',
    icon: '🌊',
    lucideIcon: <Droplet size={24} color="#2EC4B6" />,
    desc: 'Uncontrolled water flooding, pipe line break, or main valve failure.',
    eta: '10-15 mins',
    color: '#E6F8F6',
    borderColor: '#A8EADB',
  },
  {
    id: 'door_lock',
    title: 'Door Lockout',
    icon: '🔑',
    lucideIcon: <Key size={24} color="#FF6B4A" />,
    desc: 'Locked outside, key snapped in cylinder, or electronic lock failure.',
    eta: '12-18 mins',
    color: '#FFEFEA',
    borderColor: '#FFC4B6',
  },
  {
    id: 'water_leakage',
    title: 'Water Leakage & Overflow',
    icon: '💧',
    lucideIcon: <Droplet size={24} color="#0066FF" />,
    desc: 'Overhead tank overflow, major ceiling seepage, or drain blockage.',
    eta: '15-20 mins',
    color: '#EBF5FF',
    borderColor: '#B8DCFF',
  },
  {
    id: 'fire_safety',
    title: 'Fire Safety & Electrical Smoke',
    icon: '🔥',
    lucideIcon: <Flame size={24} color="#E63946" />,
    desc: 'Wiring burning smell, appliance overheating, or smoke isolation.',
    eta: '5-10 mins',
    color: '#FFEAEB',
    borderColor: '#FFC4C7',
  },
];

export default function EmergencyButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedService, setSelectedService] = useState(null);
  const [isDispatching, setIsDispatching] = useState(false);

  const handleDispatch = (service) => {
    setSelectedService(service);
    setIsDispatching(true);
    setTimeout(() => {
      setIsDispatching(false);
      toast.success(`🚨 Priority SOS Dispatched for ${service.title}! A verified hero is arriving in ${service.eta}.`, {
        duration: 6000,
        style: { borderRadius: '16px', background: '#2B2B2B', color: '#fff', fontWeight: 'bold' },
      });
      setSelectedService(null);
      setIsOpen(false);
    }, 1200);
  };

  return (
    <>
      {/* Floating Trigger Button */}
      <button
        className="floating-emergency-btn animate-fadeIn"
        onClick={() => setIsOpen(true)}
        title="Emergency SOS Assistance"
      >
        <span className="emergency-siren-wrapper">
          <Siren size={22} className="emergency-siren-icon" />
        </span>
        <span className="emergency-btn-text">SOS Emergency</span>
      </button>

      {/* Emergency Modal */}
      {isOpen && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setIsOpen(false)}>
          <div className="modal emergency-modal animate-slideUp">
            {/* Modal Header */}
            <div className="modal-header emergency-modal-header">
              <div className="flex items-center gap-3">
                <div className="emergency-icon-pill">
                  <ShieldAlert size={24} />
                </div>
                <div>
                  <h2 style={{ fontSize: '20px', fontWeight: 900, color: '#E63946' }}>
                    🚨 Emergency SOS Assistance
                  </h2>
                  <p className="text-xs text-secondary" style={{ marginTop: 2 }}>
                    Priority 15-minute dispatch for urgent household hazards
                  </p>
                </div>
              </div>
              <button className="btn btn-ghost btn-icon" onClick={() => setIsOpen(false)}>
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="modal-body emergency-modal-body">
              <div className="emergency-alert-banner">
                <AlertTriangle size={18} />
                <span>Need immediate help? Pick your emergency below for 1-click priority dispatch.</span>
              </div>

              <div className="emergency-grid">
                {EMERGENCY_SERVICES.map((service) => (
                  <div
                    key={service.id}
                    className="emergency-card"
                    style={{ background: service.color, borderColor: service.borderColor }}
                    onClick={() => handleDispatch(service)}
                  >
                    <div className="emergency-card-top">
                      <span className="emergency-card-emoji">{service.icon}</span>
                      <span className="emergency-eta-pill">⚡ ETA: {service.eta}</span>
                    </div>

                    <h3 className="emergency-card-title">{service.title}</h3>
                    <p className="emergency-card-desc">{service.desc}</p>

                    <button
                      className="btn btn-primary btn-sm emergency-card-btn"
                      disabled={isDispatching && selectedService?.id === service.id}
                    >
                      {isDispatching && selectedService?.id === service.id ? (
                        'Dispatching Hero...'
                      ) : (
                        <>
                          <PhoneCall size={14} /> Dispatch Priority Hero
                        </>
                      )}
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="modal-footer emergency-modal-footer">
              <span className="text-xs text-muted font-bold flex items-center gap-1">
                <CheckCircle2 size={14} color="var(--color-secondary)" /> 24/7 Rapid Response Unit active
              </span>
              <button className="btn btn-ghost btn-sm" onClick={() => setIsOpen(false)}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        /* Floating Button Fixed Bottom-Right */
        .floating-emergency-btn {
          position: fixed;
          bottom: 28px;
          right: 28px;
          z-index: 999;
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 12px 22px;
          border-radius: var(--radius-full);
          background: linear-gradient(135deg, #E63946 0%, #FF6B4A 100%);
          color: white;
          box-shadow: 0 10px 28px rgba(230, 57, 70, 0.45);
          border: 2px solid #FFC4C7;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
        }

        .floating-emergency-btn:hover {
          transform: translateY(-4px) scale(1.05);
          box-shadow: 0 16px 36px rgba(230, 57, 70, 0.6);
        }

        .floating-emergency-btn:active {
          transform: translateY(0) scale(0.98);
        }

        .emergency-siren-wrapper {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 32px;
          height: 32px;
          background: rgba(255, 255, 255, 0.22);
          border-radius: 50%;
          animation: pulseSiren 2s infinite;
        }

        .emergency-siren-icon {
          animation: rotateSiren 3s linear infinite;
        }

        .emergency-btn-text {
          font-family: 'Poppins', sans-serif;
          font-weight: 900;
          font-size: 15px;
          letter-spacing: 0.02em;
        }

        @keyframes pulseSiren {
          0% { box-shadow: 0 0 0 0 rgba(255, 255, 255, 0.6); }
          70% { box-shadow: 0 0 0 10px rgba(255, 255, 255, 0); }
          100% { box-shadow: 0 0 0 0 rgba(255, 255, 255, 0); }
        }

        @keyframes rotateSiren {
          0% { transform: rotate(0deg); }
          20% { transform: rotate(15deg); }
          40% { transform: rotate(-15deg); }
          60% { transform: rotate(10deg); }
          80% { transform: rotate(-10deg); }
          100% { transform: rotate(0deg); }
        }

        /* Modal Custom Styling */
        .emergency-modal {
          max-width: 680px;
          border: 2.5px solid #FFC4C7;
          border-radius: var(--radius-xl);
          background: #FFFDFC;
        }

        .emergency-modal-header {
          background: #FFEAEB;
          border-bottom: 1.5px solid #FFC4C7;
        }

        .emergency-icon-pill {
          width: 44px;
          height: 44px;
          background: #E63946;
          color: white;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 12px rgba(230, 57, 70, 0.3);
        }

        .emergency-alert-banner {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 10px 16px;
          background: #FFEFEA;
          border: 1.5px solid #FFDCD4;
          border-radius: var(--radius-md);
          color: var(--color-primary);
          font-size: 13.5px;
          font-weight: 700;
          margin-bottom: 16px;
        }

        .emergency-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 14px;
        }

        .emergency-card {
          border: 2px solid;
          border-radius: var(--radius-md);
          padding: 16px;
          cursor: pointer;
          transition: all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .emergency-card:hover {
          transform: translateY(-3px) scale(1.02);
          box-shadow: var(--shadow-md);
        }

        .emergency-card-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .emergency-card-emoji {
          font-size: 30px;
        }

        .emergency-eta-pill {
          font-size: 11.5px;
          font-weight: 800;
          background: white;
          padding: 3px 10px;
          border-radius: var(--radius-full);
          color: #2B2B2B;
          box-shadow: var(--shadow-xs);
        }

        .emergency-card-title {
          font-size: 16px;
          font-weight: 800;
          color: #2B2B2B;
        }

        .emergency-card-desc {
          font-size: 13px;
          color: #5A5A5A;
          line-height: 1.4;
          flex: 1;
        }

        .emergency-card-btn {
          margin-top: 6px;
          width: 100%;
          border-radius: var(--radius-full);
          font-weight: 800;
          font-size: 13px;
        }

        .emergency-modal-footer {
          background: #FFF9F5;
        }

        @media (max-width: 640px) {
          .emergency-grid {
            grid-template-columns: 1fr;
          }
          .floating-emergency-btn {
            bottom: 20px;
            right: 16px;
            padding: 10px 18px;
          }
          .emergency-btn-text {
            font-size: 13.5px;
          }
        }
      `}</style>
    </>
  );
}
