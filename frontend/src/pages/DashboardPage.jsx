// SafeFlow Global — Dashboard Page

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users, ClipboardCheck, AlertTriangle,
  Activity, TrendingUp, Map, Zap, Award,
  Clock, CheckCircle, BarChart3, AlertOctagon, User, Brain, Sparkles, ShieldCheck
} from 'lucide-react';
import { dashboardAPI, checkinsAPI } from '../api/client';
import useAuthStore from '../store/authStore';
import SafetyMap from '../components/SafetyMap';

export default function DashboardPage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [stats, setStats] = useState(null);
  const [activeCheckins, setActiveCheckins] = useState([]);
  const [heatmap, setHeatmap] = useState([]);
  const [loading, setLoading] = useState(true);
  const [myActiveCheckin, setMyActiveCheckin] = useState(null);
  const [myHistory, setMyHistory] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [isCheckingIn, setIsCheckingIn] = useState(false);
  const [checkinForm, setCheckinForm] = useState({
    sewer_depth: 3,
    sewer_type: 'combined',
    estimated_duration: 60,
    smell_reported: false,
    equipment_available: ['harness', 'torch', 'rope']
  });

  const role = user?.role?.toLowerCase() || 'worker';

  useEffect(() => {
    loadDashboard();
    const interval = setInterval(loadDashboard, 15000); // Refresh every 15s

    // Handle deep-links
    const params = new URLSearchParams(window.location.search);
    if (params.get('isCheckingIn') === 'true') {
      setIsCheckingIn(true);
      window.history.replaceState({}, '', window.location.pathname);
    }

    return () => clearInterval(interval);
  }, [user]);

  const loadDashboard = async () => {
    try {
      const [statsRes, activeRes, heatmapRes] = await Promise.all([
        dashboardAPI.stats(),
        checkinsAPI.active(),
        dashboardAPI.heatmap(),
      ]);
      setStats(statsRes.data);
      setActiveCheckins(activeRes.data);
      setHeatmap(heatmapRes.data);

      if (role === 'worker' && user?.worker_id) {
        const myCheckin = activeRes.data.find(c => c.worker_id === user.worker_id);
        if (myCheckin) {
          setMyActiveCheckin(myCheckin);
        }
        // Fetch worker history
        const historyRes = await checkinsAPI.list({ worker_id: user.worker_id, limit: 10 });
        setMyHistory(historyRes.data);
      }
    } catch (err) {
      console.error('Dashboard load failed:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadActiveCheckins = async () => {
    try {
      const { data } = await checkinsAPI.active();
      setActiveCheckins(data);
      if (role === 'worker' && user?.worker_id) {
        const myCheckin = data.find(c => c.worker_id === user.worker_id);
        setMyActiveCheckin(myCheckin || null);
      }

      // Load notifications for authorities
      if (role !== 'worker') {
        const incidentsRes = await incidentsAPI.list({ severity: 'critical', limit: 5 });
        setNotifications(incidentsRes.data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleStartCheckin = async (e) => {
    e.preventDefault();
    if (!user?.worker_id) return alert("Worker ID missing. Please update profile.");

    setSubmitting(true);
    try {
      const payload = {
        ...checkinForm,
        worker_id: user.worker_id,
        latitude: 19.0390 + (Math.random() * 0.01),
        longitude: 72.8516 + (Math.random() * 0.01),
        location_description: "Current User Site"
      };

      const { data } = await checkinsAPI.start(payload);
      setIsCheckingIn(false);
      loadDashboard();
    } catch (err) {
      alert(err.response?.data?.detail || "Check-in failed");
    } finally {
      setSubmitting(false);
    }
  };

  const handleCheckout = async () => {
    if (!myActiveCheckin) return;
    try {
      await checkinsAPI.checkout(myActiveCheckin.id);
      setMyActiveCheckin(null);
      loadDashboard();
    } catch (err) {
      alert("Check-out failed");
    }
  };

  const toggleEquipment = (item) => {
    setCheckinForm(prev => ({
      ...prev,
      equipment_available: prev.equipment_available.includes(item)
        ? prev.equipment_available.filter(i => i !== item)
        : [...prev.equipment_available, item]
    }));
  };

  if (loading) {
    return <div className="loading-spinner"><div className="spinner" /></div>;
  }

  const s = stats || {
    total_workers: 0, active_checkins: 0, total_incidents: 0,
    incidents_this_month: 0, alerts_fired_today: 0,
    risk_distribution: { GREEN: 0, YELLOW: 0, RED: 0 },
    top_risk_regions: [],
  };

  const getHeader = () => {
    switch (role) {
      case 'worker': return { title: 'Worker Safety Portal', sub: 'Your personal protection status and history' };
      case 'ngo': return { title: 'Safety Watch Dashboard', sub: 'Monitoring contractor accountability and worker rights' };
      case 'municipality': return { title: 'Municipal Control Center', sub: 'City-wide infrastructure safety & compliance oversight' };
      case 'contractor': return { title: 'Operational Safety Center', sub: 'Managing workforce deployments and safety standards' };
      default: return { title: 'SafeFlow Command Center', sub: 'Real-time worker safety monitoring' };
    }
  };

  const header = getHeader();

  return (
    <>
      <div className="top-bar">
        <div className="page-title">
          <h2>{header.title}</h2>
          <p>{header.sub}</p>
        </div>
        <div className="top-actions">
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div className={`pulse-dot ${activeCheckins.length > 0 ? 'green' : 'gray'}`} />
              <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                {activeCheckins.length} Active Sessions
              </span>
            </div>
            <button
              className="btn btn-outline btn-sm"
              onClick={() => navigate('/profile')}
              style={{ display: 'flex', alignItems: 'center', gap: 8 }}
            >
              <User size={16} /> Profile
            </button>
          </div>
        </div>
      </div>

      <div className="dashboard-layout">
        <div className="stats-grid" style={{ marginBottom: 24, gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))' }}>
          {role === 'worker' && (
            <>
              <div className="stat-card beige">
                <div className="stat-header"><span className="stat-label">My Safety Score</span> <div className="stat-icon"><Award size={20} /></div></div>
                <div className="stat-value">9.8</div>
                <div className="stat-change">Top 5% of safest workers</div>
              </div>
              <div className="stat-card light">
                <div className="stat-header"><span className="stat-label">Jobs Completed</span> <div className="stat-icon"><CheckCircle size={20} /></div></div>
                <div className="stat-value">124</div>
                <div className="stat-change">12 jobs this month</div>
              </div>
              <div className="stat-card dark">
                <div className="stat-header"><span className="stat-label">Risk Alert</span> <div className="stat-icon"><Zap size={20} /></div></div>
                <div className="stat-value">0</div>
                <div className="stat-change">No active alerts for your ID</div>
              </div>
            </>
          )}

          {(role === 'municipality' || role === 'contractor') && (
            <>
              <div className="stat-card beige" style={{ cursor: 'pointer' }} onClick={() => navigate('/workers')}>
                <div className="stat-header"><span className="stat-label">Total Workers</span> <div className="stat-icon"><Users size={20} /></div></div>
                <div className="stat-value">{s.total_workers}</div>
                <div className="stat-change">Active in your region</div>
              </div>
              <div className="stat-card light" style={{ cursor: 'pointer' }} onClick={() => navigate('/checkins')}>
                <div className="stat-header"><span className="stat-label">Live Check-ins</span> <div className="stat-icon" style={{ color: 'var(--green)' }}><ClipboardCheck size={20} /></div></div>
                <div className="stat-value" style={{ color: 'var(--text-primary)' }}>{s.active_checkins}</div>
                <div className="stat-change">Currently underground</div>
              </div>
              <div className="stat-card dark" style={{ cursor: 'pointer' }} onClick={() => navigate('/checkins')}>
                <div className="stat-header"><span className="stat-label">Alerts Today</span> <div className="stat-icon" style={{ color: 'var(--red)' }}><AlertTriangle size={20} /></div></div>
                <div className="stat-value">{s.alerts_fired_today}</div>
                <div className="stat-change">Emergency actions triggered</div>
              </div>
            </>
          )}

          {role === 'ngo' && (
            <>
              <div className="stat-card beige" style={{ cursor: 'pointer' }} onClick={() => navigate('/incidents')}>
                <div className="stat-header"><span className="stat-label">Incidents Tracked</span> <div className="stat-icon"><AlertOctagon size={20} /></div></div>
                <div className="stat-value">{s.total_incidents}</div>
                <div className="stat-change">Total safety breaches recorded</div>
              </div>
              <div className="stat-card light" style={{ cursor: 'pointer' }} onClick={() => navigate('/contractors')}>
                <div className="stat-header"><span className="stat-label">High Risk Units</span> <div className="stat-icon"><TrendingUp size={20} /></div></div>
                <div className="stat-value">14</div>
                <div className="stat-change">Contractors under review</div>
              </div>
              <div className="stat-card dark">
                <div className="stat-header"><span className="stat-label">Safety Trends</span> <div className="stat-icon"><BarChart3 size={20} /></div></div>
                <div className="stat-value">+12%</div>
                <div className="stat-change">Improvement in PPE compliance</div>
              </div>
            </>
          )}
        </div>

        {role === 'worker' && !myActiveCheckin && (
          <div style={{ marginBottom: 32 }}>
            {!isCheckingIn ? (
              <div className="data-card" style={{ padding: '32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'white', borderRadius: 'var(--radius-xl)', boxShadow: 'var(--shadow-sm)' }}>
                <div>
                  <h3 style={{ fontSize: 24, fontWeight: 800, marginBottom: 8 }}>Ready for a New Assignment?</h3>
                  <p style={{ color: 'var(--text-secondary)', fontSize: 16 }}>Initialize a job session to get real-time AI safety monitoring and hazard detection.</p>
                </div>
                <button
                  className="btn btn-primary"
                  onClick={() => setIsCheckingIn(true)}
                  style={{ padding: '16px 32px', borderRadius: '12px', fontSize: 16, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 10 }}
                >
                  <Sparkles size={20} style={{ color: 'var(--yellow)' }} />
                  Begin Job Analysis
                </button>
              </div>
            ) : (
              <div className="data-card" style={{ padding: 0, overflow: 'hidden', background: 'white', borderRadius: 'var(--radius-xl)', boxShadow: 'var(--shadow-sm)' }}>
                <div className="data-card-header" style={{ padding: '24px 32px', marginBottom: 0, borderBottom: '1px solid var(--border)', background: 'var(--bg-secondary)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--text-primary)', color: 'var(--yellow)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Brain size={18} />
                    </div>
                    <h3 style={{ fontSize: 18, fontWeight: 700, margin: 0 }}>Initialize Job Session</h3>
                  </div>
                  <button
                    onClick={() => setIsCheckingIn(false)}
                    style={{ background: 'white', border: '1px solid var(--border)', borderRadius: '8px', padding: '6px 12px', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}
                  >
                    Cancel
                  </button>
                </div>
                <form onSubmit={handleStartCheckin} style={{ padding: '32px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 24 }}>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 8 }}>Sewer Depth (Meters)</label>
                      <div style={{ position: 'relative' }}>
                        <input
                          type="number" step="0.1" value={checkinForm.sewer_depth}
                          onChange={e => setCheckinForm({ ...checkinForm, sewer_depth: parseFloat(e.target.value) })}
                          className="form-input" style={{ paddingRight: 40, background: 'var(--bg-secondary)', border: '1px solid var(--border)' }} required
                        />
                        <div style={{ position: 'absolute', right: 16, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', fontSize: 11 }}>m</div>
                      </div>
                    </div>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 8 }}>Estimated Duration</label>
                      <div style={{ position: 'relative' }}>
                        <input
                          type="number" value={checkinForm.estimated_duration}
                          onChange={e => setCheckinForm({ ...checkinForm, estimated_duration: parseInt(e.target.value) })}
                          className="form-input" style={{ paddingRight: 40, background: 'var(--bg-secondary)', border: '1px solid var(--border)' }} required
                        />
                        <div style={{ position: 'absolute', right: 16, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', fontSize: 11 }}>min</div>
                      </div>
                    </div>
                  </div>

                  <div className="form-group" style={{ marginBottom: 24 }}>
                    <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 8 }}>Sewer Infrastructure Type</label>
                    <select
                      className="form-input" value={checkinForm.sewer_type}
                      onChange={e => setCheckinForm({ ...checkinForm, sewer_type: e.target.value })}
                      style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)' }}
                    >
                      <option value="combined">Combined Sewer (Standard)</option>
                      <option value="storm">Storm Drain (Flood Risk)</option>
                      <option value="industrial">Industrial Sewer (Chemical Risk)</option>
                      <option value="sanitary">Sanitary Sewer (Gas Risk)</option>
                    </select>
                  </div>

                  <div className="form-group" style={{ marginBottom: 24 }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer', background: 'var(--bg-secondary)', padding: '12px 16px', borderRadius: '12px', border: '1px solid var(--border)' }}>
                      <input
                        type="checkbox" checked={checkinForm.smell_reported}
                        onChange={e => setCheckinForm({ ...checkinForm, smell_reported: e.target.checked })}
                        style={{ width: 18, height: 18, cursor: 'pointer', accentColor: 'var(--text-primary)' }}
                      />
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 700 }}>Smell Reported</div>
                        <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>Are there any unusual or toxic odors?</div>
                      </div>
                    </label>
                  </div>

                  <div className="form-group" style={{ marginBottom: 32 }}>
                    <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 12, display: 'block' }}>Available Safety Equipment</label>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                      {['harness', 'torch', 'rope', 'gas_detector', 'oxygen_mask', 'gloves'].map(item => (
                        <button
                          key={item} type="button"
                          className={`badge-item ${checkinForm.equipment_available.includes(item) ? 'active' : ''}`}
                          onClick={() => toggleEquipment(item)}
                          style={{
                            padding: '8px 16px', borderRadius: '10px', fontSize: 11, fontWeight: 700, border: '1px solid var(--border)',
                            background: checkinForm.equipment_available.includes(item) ? 'var(--text-primary)' : 'white',
                            color: checkinForm.equipment_available.includes(item) ? 'white' : 'var(--text-primary)',
                            cursor: 'pointer', transition: 'all 0.2s'
                          }}
                        >
                          {item.replace('_', ' ').toUpperCase()}
                        </button>
                      ))}
                    </div>
                  </div>

                  <button
                    type="submit" className="btn btn-primary" disabled={submitting}
                    style={{ width: '100%', padding: '16px', borderRadius: '12px', fontSize: 14, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, background: 'var(--text-primary)', color: 'white', border: 'none' }}
                  >
                    {submitting ? (
                      <><div className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} />Assessment in Progress...</>
                    ) : (
                      <><Sparkles size={16} style={{ color: 'var(--yellow)' }} /> Initialize Job & Run AI Assessment</>
                    )}
                  </button>
                </form>
              </div>
            )}
          </div>
        )}

        {role === 'worker' && myActiveCheckin && (
          <div className="data-card" style={{ padding: 0, overflow: 'hidden', marginBottom: 32, background: 'white', borderRadius: 'var(--radius-xl)', boxShadow: 'var(--shadow-sm)' }}>
            <div className="data-card-header" style={{ padding: '24px 32px', marginBottom: 0, borderBottom: '1px solid var(--border)', background: 'var(--bg-secondary)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--text-primary)', color: 'var(--yellow)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Brain size={22} />
                </div>
                <h3 style={{ fontSize: 22, fontWeight: 700, margin: 0 }}>Gemini AI Safety Briefing</h3>
              </div>
              <div style={{ background: 'rgba(239, 68, 68, 0.1)', color: 'rgba(239, 68, 68, 0.8)', fontSize: 10, fontWeight: 800, padding: '6px 12px', borderRadius: 20, letterSpacing: '1px' }}>LIVE AI ANALYSIS</div>
            </div>

            <div style={{ padding: 32 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 40 }}>
                <div style={{ background: 'white', padding: '32px', borderRadius: '32px', border: '1px solid var(--border)', position: 'relative' }}>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 700, marginBottom: 16, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Current Risk Level</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
                    <span className={`badge-risk ${myActiveCheckin.risk_level?.toLowerCase()}`} style={{ fontSize: 14, padding: '10px 20px', borderRadius: '12px' }}>
                      {myActiveCheckin.risk_level}
                    </span>
                    <span style={{ fontSize: 40, fontWeight: 800, color: 'var(--text-primary)' }}>{myActiveCheckin.risk_score}</span>
                  </div>
                </div>
                <div style={{ background: 'white', padding: '32px', borderRadius: '32px', border: '1px solid var(--border)' }}>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 700, marginBottom: 16, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Site Location</div>
                  <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 8 }}>{myActiveCheckin.location_description || 'Current User Site'}</div>
                  <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>ID: {String(myActiveCheckin.id).slice(0, 8)}</div>
                </div>
              </div>

              <div style={{ marginBottom: 40 }}>
                <div style={{ fontSize: 13, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8, textTransform: 'uppercase' }}>
                  <Sparkles size={18} style={{ color: 'var(--yellow)' }} /> Detected Hazards
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
                  {myActiveCheckin.risk_factors?.map((f, i) => (
                    <div key={i} style={{
                      background: 'var(--bg-secondary)',
                      color: 'var(--text-primary)',
                      fontSize: 14,
                      fontWeight: 700,
                      padding: '12px 24px',
                      borderRadius: '14px',
                      border: '1px solid var(--border)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10
                    }}>
                      <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#EF4444' }} />
                      {f}
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ background: '#2D2D2D', color: 'white', borderRadius: '24px', padding: '32px 40px', position: 'relative', overflow: 'hidden', marginBottom: 40 }}>
                <div style={{ position: 'absolute', top: '10%', right: '-5%', opacity: 0.1 }}>
                  <Brain size={180} />
                </div>
                <div style={{ position: 'relative', zIndex: 1 }}>
                  <div style={{ fontSize: 11, fontWeight: 800, color: 'var(--yellow)', marginBottom: 16, textTransform: 'uppercase', letterSpacing: '1px' }}>AI Safety Recommendation</div>
                  <p style={{ fontSize: 17, lineHeight: 1.6, fontWeight: 600, margin: 0, letterSpacing: '-0.2px' }}>{myActiveCheckin.ai_recommendation}</p>
                </div>
              </div>

              <div style={{ display: 'flex', gap: 16 }}>
                <button
                  className="btn"
                  onClick={handleCheckout}
                  style={{ flex: 1, padding: '24px', borderRadius: '16px', fontSize: 16, fontWeight: 700, background: 'var(--text-primary)', color: 'white', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, cursor: 'pointer' }}
                >
                  <ShieldCheck size={22} /> Confirm Safety & Check-out
                </button>
                <button
                  className="btn"
                  style={{ padding: '24px 48px', borderRadius: '16px', fontSize: 16, fontWeight: 700, background: 'white', color: 'var(--text-primary)', border: '1px solid var(--border)', cursor: 'pointer' }}
                  onClick={() => navigate('/checkins')}
                >
                  History
                </button>
              </div>
            </div>
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 24 }}>
          <div className="data-card">
            <div className="data-card-header">
              <h3>{role === 'worker' ? 'Safety Environment' : 'Risk Distribution'}</h3>
              <Activity size={18} style={{ color: 'var(--text-muted)' }} />
            </div>
            <div style={{ padding: 24 }}>
              {['GREEN', 'YELLOW', 'RED'].map((level) => {
                const count = s.risk_distribution[level] || 0;
                const total = (s.risk_distribution.GREEN + s.risk_distribution.YELLOW + s.risk_distribution.RED) || 1;
                const pct = Math.round((count / total) * 100);
                const config = {
                  GREEN: { color: 'var(--green)', label: 'Safe & Verified', desc: 'Compliant with all protocols' },
                  YELLOW: { color: 'var(--yellow)', label: 'Precautionary', desc: 'Minor safety gaps detected' },
                  RED: { color: 'var(--red)', label: 'High Risk/Emergency', desc: 'Critical violations or dangers' }
                }[level];

                return (
                  <div key={level} style={{ marginBottom: 20 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 8 }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <div style={{ width: 8, height: 8, borderRadius: '50%', background: config.color }} />
                          <span style={{ fontWeight: 600, fontSize: 13, color: config.color }}>{config.label}</span>
                        </div>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{config.desc}</div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <span style={{ fontWeight: 700, fontSize: 15 }}>{count}</span>
                        <span style={{ fontSize: 12, color: 'var(--text-muted)', marginLeft: 4 }}>({pct}%)</span>
                      </div>
                    </div>
                    <div style={{ height: 8, background: 'var(--bg-secondary)', borderRadius: 4, overflow: 'hidden' }}>
                      <div style={{ width: `${pct}%`, height: '100%', background: config.color, borderRadius: 4, transition: 'width 1s ease-out' }} />
                    </div>
                  </div>
                );
              })}
              <div style={{ marginTop: 24, paddingTop: 16, borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between' }}>
                <div style={{ fontSize: 12 }}>
                  <div style={{ color: 'var(--text-muted)' }}>Avg. Safety Compliance</div>
                  <div style={{ fontWeight: 700, fontSize: 18, color: 'var(--green)' }}>
                    {Math.round(((s.risk_distribution.GREEN * 100) + (s.risk_distribution.YELLOW * 50)) / ((s.risk_distribution.GREEN + s.risk_distribution.YELLOW + s.risk_distribution.RED) || 1))}%
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Status</div>
                  <div style={{ fontWeight: 600, fontSize: 12, color: 'var(--green)', background: 'rgba(34, 197, 94, 0.1)', padding: '2px 8px', borderRadius: 4 }}>Operational</div>
                </div>
              </div>
            </div>
          </div>

          <div className="data-card">
            {role === 'worker' ? (
              <>
                <div className="data-card-header">
                  <h3>Safety History</h3>
                  <Clock size={18} style={{ color: 'var(--text-muted)' }} />
                </div>
                {myHistory.length > 0 ? (
                  <div style={{ padding: '0 24px 24px' }}>
                    <table className="data-table">
                      <thead>
                        <tr>
                          <th>ID</th>
                          <th>Date</th>
                          <th>AI Risk</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {myHistory.map((h) => (
                          <tr key={h.id}>
                            <td style={{ fontSize: 11, color: 'var(--text-secondary)' }}>{h.id.slice(0, 8)}</td>
                            <td style={{ fontSize: 12 }}>{new Date(h.created_at).toLocaleDateString()}</td>
                            <td>
                              <span className={`badge-risk ${h.risk_level?.toLowerCase()}`} style={{ fontSize: 10, padding: '4px 10px' }}>
                                {h.risk_level}
                              </span>
                            </td>
                            <td>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11 }}>
                                <div style={{ width: 6, height: 6, borderRadius: '50%', background: h.status === 'active' ? 'var(--green)' : 'var(--text-muted)' }} />
                                {h.status.charAt(0).toUpperCase() + h.status.slice(1)}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="empty-state" style={{ padding: '40px 20px' }}>
                    <div className="icon" style={{ marginBottom: 16 }}>
                      <Activity size={32} style={{ color: 'var(--orange)' }} />
                    </div>
                    <h3 style={{ fontSize: 18, marginBottom: 8 }}>Your Safety Log</h3>
                    <p style={{ fontSize: 14 }}>All your underground sessions are logged here for verification.</p>
                  </div>
                )}
              </>
            ) : (
              <>
                <div className="data-card-header">
                  <h3>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      Live Operations
                      {activeCheckins.length > 0 && <div className="pulse-dot green" />}
                    </span>
                  </h3>
                  <Map size={18} style={{ color: 'var(--text-muted)' }} />
                </div>
                <div style={{ height: 400, width: '100%', borderRadius: '12px', overflow: 'hidden' }}>
                  <SafetyMap
                    incidents={heatmap}
                    activeCheckins={activeCheckins}
                    center={activeCheckins.length > 0 ? [activeCheckins[0].latitude, activeCheckins[0].longitude] : [20.5937, 78.9629]}
                    zoom={activeCheckins.length > 0 ? 12 : 5}
                  />
                </div>
                {activeCheckins.length > 0 && (
                  <div style={{ marginTop: 24 }}>
                    <table className="data-table">
                      <thead><tr><th>ID</th><th>Level</th><th>Timer</th></tr></thead>
                      <tbody>
                        {activeCheckins.slice(0, 3).map((c) => (
                          <tr key={c.id}>
                            <td style={{ fontSize: 12 }}>{String(c.id).slice(0, 8)}</td>
                            <td><span className={`badge-risk ${c.risk_level?.toLowerCase()}`}>{c.risk_level}</span></td>
                            <td style={{ fontSize: 12 }}>{new Date(c.deadline).toLocaleTimeString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

    </>
  );
}
