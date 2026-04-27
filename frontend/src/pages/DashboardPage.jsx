// SafeFlow Global — Dashboard Page

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users, ClipboardCheck, AlertTriangle,
  Activity, TrendingUp, Map, Zap, Award,
  Clock, CheckCircle, BarChart3, AlertOctagon
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

  const role = user?.role?.toLowerCase() || 'worker';

  useEffect(() => {
    loadDashboard();
    const interval = setInterval(loadActiveCheckins, 30000);
    return () => clearInterval(interval);
  }, []);

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
    } catch (err) {
      console.error(err);
    }
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

  // ── Role-Specific Title ──
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
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div className={`pulse-dot ${activeCheckins.length > 0 ? 'green' : 'gray'}`} />
            <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
              {activeCheckins.length} Active Sessions
            </span>
          </div>
        </div>
      </div>

      {/* ── Main Dashboard Content ── */}
      <div className="dashboard-layout">
        
        {/* Render different stat grids based on role */}
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
              <div className="stat-card dark" style={{ cursor: 'pointer' }} onClick={() => navigate('/incidents')}>
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

        {/* ── Secondary Content ── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 16 }}>
          
          {/* Risk Card */}
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
                      <div 
                        style={{ 
                          width: `${pct}%`, 
                          height: '100%', 
                          background: config.color, 
                          borderRadius: 4,
                          transition: 'width 1s ease-out'
                        }} 
                      />
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
                  <div style={{ fontWeight: 600, fontSize: 12, color: 'var(--green)', background: 'rgba(34, 197, 94, 0.1)', padding: '2px 8px', borderRadius: 4 }}>
                    Operational
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Activity / Live Ops Card */}
          <div className="data-card">
            {role === 'worker' ? (
              <>
                <div className="data-card-header"><h3>Recent Activity</h3><Clock size={18} /></div>
                <div className="empty-state">
                  <div className="icon"><Activity size={32} style={{ color: 'var(--orange)' }} /></div>
                  <h3>Your safety log</h3>
                  <p>All your underground sessions are logged here for verification.</p>
                </div>
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
                  <Map size={18} />
                </div>
                <div style={{ height: 400, width: '100%' }}>
                  <SafetyMap 
                    incidents={heatmap} 
                    activeCheckins={activeCheckins} 
                    center={activeCheckins.length > 0 ? [activeCheckins[0].latitude, activeCheckins[0].longitude] : [20.5937, 78.9629]}
                    zoom={activeCheckins.length > 0 ? 12 : 5}
                  />
                </div>
                {activeCheckins.length > 0 && (
                  <div style={{ marginTop: 16 }}>
                    <table className="data-table">
                      <thead><tr><th>ID</th><th>Level</th><th>Timer</th></tr></thead>
                      <tbody>
                        {activeCheckins.slice(0, 3).map((c) => (
                          <tr key={c.id}>
                            <td>{c.id.slice(0, 8)}</td>
                            <td><span className={`badge-risk ${c.risk_level?.toLowerCase()}`}>{c.risk_level}</span></td>
                            <td>{new Date(c.deadline).toLocaleTimeString()}</td>
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
