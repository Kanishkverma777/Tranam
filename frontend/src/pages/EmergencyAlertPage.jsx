// SafeFlow Global — Emergency SOS Page

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, ShieldCheck, Siren, ArrowLeft, Radio, Zap } from 'lucide-react';
import { incidentsAPI, checkinsAPI } from '../api/client';
import useAuthStore from '../store/authStore';

export default function EmergencyAlertPage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [alertType, setAlertType] = useState('injury');
  const [isSent, setIsSent] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [myActiveCheckin, setMyActiveCheckin] = useState(null);

  useEffect(() => {
    const loadCheckin = async () => {
      try {
        const { data } = await checkinsAPI.active();
        if (user?.worker_id) {
          const mine = data.find(c => c.worker_id === user.worker_id);
          setMyActiveCheckin(mine || null);
        }
      } catch (e) {}
    };
    loadCheckin();
  }, [user]);

  const handleSendAlert = async () => {
    if (!user?.worker_id) return;
    setSubmitting(true);
    
    try {
      const payload = {
        worker_id: user.worker_id,
        checkin_id: myActiveCheckin?.id || null,
        contractor_id: myActiveCheckin?.contractor_id || null,
        incident_type: alertType,
        severity: 'critical',
        description: `CRITICAL SOS: ${alertType.toUpperCase()} reported.`,
        latitude: myActiveCheckin?.latitude || 19.0760,
        longitude: myActiveCheckin?.longitude || 72.8777,
        country: "India",
        region: user.region || "Mumbai"
      };

      await incidentsAPI.report(payload);
      setIsSent(true);
      setTimeout(() => navigate('/dashboard'), 4000);
    } catch (err) {
      const msg = err.response?.data?.detail || "Failed to transmit SOS signal. Please check your connection.";
      alert(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const alertOptions = [
    { id: 'injury', label: 'Life-Threatening Danger', desc: 'Gas leak, collapse, or severe injury', icon: Siren },
    { id: 'near_miss', label: 'Safety Violation', desc: 'Contractor forcing entry without PPE', icon: AlertTriangle },
    { id: 'equipment', label: 'Equipment Failure', desc: 'Mask, harness, or rope compromised', icon: Zap },
    { id: 'other', label: 'Other Critical Problem', desc: 'Any other emergency situation', icon: Radio }
  ];

  return (
    <div className="emergency-page" style={{ padding: '40px', maxWidth: '800px', margin: '0 auto' }}>
      <button 
        onClick={() => navigate(-1)} 
        style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', marginBottom: 32, fontWeight: 700 }}
      >
        <ArrowLeft size={18} /> Back to Dashboard
      </button>

      <div className="data-card" style={{ padding: 0, overflow: 'hidden', borderRadius: '32px', border: '2px solid #EF4444', boxShadow: '0 20px 40px rgba(239, 68, 68, 0.15)' }}>
        <div className="modal-header" style={{ background: '#FEF2F2', padding: '40px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
            <div style={{ width: 64, height: 64, borderRadius: '20px', background: '#EF4444', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 16px rgba(239, 68, 68, 0.3)' }}>
              <Siren size={32} />
            </div>
            <div>
              <h1 style={{ color: '#991B1B', fontWeight: 900, margin: 0, fontSize: 32, letterSpacing: '-1px' }}>EMERGENCY BROADCAST</h1>
              <p style={{ color: '#B91C1C', fontWeight: 700, margin: '4px 0 0', opacity: 0.8 }}>DIRECT CHANNEL TO MUNICIPALITY & NGO</p>
            </div>
          </div>
        </div>

        <div style={{ padding: '48px' }}>
          {isSent ? (
            <div style={{ textAlign: 'center', padding: '60px 0' }}>
              <div style={{ 
                width: 120, height: 120, borderRadius: '50%', background: '#EF4444', color: 'white', 
                margin: '0 auto 32px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                animation: 'pulse 2s infinite'
              }}>
                <ShieldCheck size={64} />
              </div>
              <h2 style={{ color: '#991B1B', fontWeight: 900, fontSize: 36, marginBottom: 16 }}>SOS SIGNAL SENT</h2>
              <p style={{ fontSize: 20, color: '#B91C1C', fontWeight: 700, maxWidth: '500px', margin: '0 auto' }}>
                Your location and status have been transmitted. Help is being dispatched immediately.
              </p>
              <div style={{ marginTop: 40, fontSize: 14, color: 'var(--text-muted)' }}>Redirecting to dashboard...</div>
            </div>
          ) : (
            <>
              <h3 style={{ fontSize: 20, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 24 }}>What is the nature of the emergency?</h3>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 40 }}>
                {alertOptions.map(opt => (
                  <button
                    key={opt.id}
                    onClick={() => setAlertType(opt.id)}
                    style={{
                      textAlign: 'left', padding: '24px', borderRadius: '24px',
                      border: alertType === opt.id ? '3px solid #EF4444' : '1px solid var(--border)',
                      background: alertType === opt.id ? '#FEF2F2' : 'white',
                      cursor: 'pointer', transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                      display: 'flex', flexDirection: 'column', gap: 12
                    }}
                  >
                    <div style={{ 
                      width: 44, height: 44, borderRadius: '12px', 
                      background: alertType === opt.id ? '#EF4444' : 'var(--bg-secondary)',
                      color: alertType === opt.id ? 'white' : 'var(--text-primary)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}>
                      <opt.icon size={24} />
                    </div>
                    <div>
                      <div style={{ fontWeight: 800, fontSize: 16, color: alertType === opt.id ? '#991B1B' : 'var(--text-primary)' }}>{opt.label}</div>
                      <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 4, lineHeight: 1.4 }}>{opt.desc}</div>
                    </div>
                  </button>
                ))}
              </div>

              <div style={{ background: '#FFF7ED', border: '1px solid #FFEDD5', borderRadius: '20px', padding: '24px', marginBottom: 40, display: 'flex', gap: 16, alignItems: 'flex-start' }}>
                <AlertTriangle size={24} color="#D97706" style={{ marginTop: 2 }} />
                <div>
                  <div style={{ fontWeight: 800, color: '#92400E', fontSize: 15 }}>Authority Protocol Active</div>
                  <p style={{ fontSize: 13, color: '#B45309', margin: '4px 0 0', lineHeight: 1.5 }}>
                    Sending this alert will trigger an immediate investigation. Use only for critical safety situations where intervention is required.
                  </p>
                </div>
              </div>

              <button
                onClick={handleSendAlert}
                disabled={submitting}
                style={{
                  width: '100%', padding: '24px', borderRadius: '20px', background: '#EF4444', color: 'white',
                  border: 'none', fontSize: 20, fontWeight: 900, cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12,
                  boxShadow: '0 12px 24px rgba(239, 68, 68, 0.3)',
                  opacity: submitting ? 0.7 : 1
                }}
              >
                {submitting ? (
                  <div className="spinner" style={{ borderColor: 'white', borderTopColor: 'transparent' }} />
                ) : (
                  <>
                    <Radio size={24} className="pulse-icon" /> BROADCAST SOS NOW
                  </>
                )}
              </button>
            </>
          )}
        </div>
      </div>

      <style>{`
        @keyframes pulse {
          0% { transform: scale(1); box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.7); }
          70% { transform: scale(1.05); box-shadow: 0 0 0 20px rgba(239, 68, 68, 0); }
          100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(239, 68, 68, 0); }
        }
        .pulse-icon { animation: pulse-icon 1.5s infinite; }
        @keyframes pulse-icon {
          0% { opacity: 1; }
          50% { opacity: 0.5; }
          100% { opacity: 1; }
        }
      `}</style>
    </div>
  );
}
