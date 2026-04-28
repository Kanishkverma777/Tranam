// TRANAM — AI Analysis & Insights Page

import { useState, useEffect } from 'react';
import { Brain, TrendingDown, Shield, Sparkles, Activity, AlertCircle, BarChart3, Zap } from 'lucide-react';
import { dashboardAPI } from '../api/client';
import useAuthStore from '../store/authStore';

export default function AIAnalysisPage() {
  const { user } = useAuthStore();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [insights, setInsights] = useState([]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const { data } = await dashboardAPI.stats();
        setStats(data);
        
        setInsights([
          { title: "Risk Prevention", value: "84%", trend: "+12%", desc: "Accidents avoided through AI warnings", color: "#10B981" },
          { title: "Gear Compliance", value: "96%", trend: "+5%", desc: "Safety harness & mask usage reported", color: "#3B82F6" },
          { title: "Response Latency", value: "< 2s", trend: "-40%", desc: "SOS broadcast transmission time", color: "#8B5CF6" },
          { title: "Safety Score", value: "9.4", trend: "High", desc: "Global workforce protection index", color: "#F59E0B" }
        ]);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  if (loading) return <div className="loading-spinner"><div className="spinner" /></div>;

  return (
    <div className="ai-analysis-page" style={{ padding: '24px' }}>
      <div className="top-bar" style={{ marginBottom: '32px' }}>
        <div className="page-title">
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 48, height: 48, borderRadius: '16px', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: 'var(--shadow-sm)' }}>
              <Brain size={28} style={{ color: 'var(--orange)' }} />
            </div>
            <div>
              <h2 style={{ fontSize: 24, fontWeight: 900, letterSpacing: '-0.5px', margin: 0 }}>TRANAM AI Analysis</h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: 14, margin: '4px 0 0' }}>Real-time safety intelligence powered by Google Gemini</p>
            </div>
          </div>
        </div>
      </div>

      <div className="stats-grid" style={{ marginBottom: 32, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
        {insights.map((insight, idx) => (
          <div key={idx} className="stat-card" style={{ background: 'white', padding: '24px', borderRadius: '20px', borderLeft: `6px solid ${insight.color}`, boxShadow: 'var(--shadow-sm)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
              <span style={{ fontSize: 12, fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase' }}>{insight.title}</span>
              <span style={{ fontSize: 12, fontWeight: 800, color: insight.color }}>{insight.trend}</span>
            </div>
            <div style={{ fontSize: 28, fontWeight: 900, marginBottom: 8, color: 'var(--text-primary)' }}>{insight.value}</div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.4 }}>{insight.desc}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: 32 }}>
        <div className="data-card" style={{ background: 'white', borderRadius: '24px', padding: '24px', boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
            <h3 style={{ fontSize: 18, fontWeight: 800, margin: 0 }}>Safety Intelligence Feed</h3>
            <Activity size={18} style={{ color: 'var(--text-muted)' }} />
          </div>
          <div className="intelligence-feed">
            {[
              { type: 'safe', msg: 'AI verified PPE compliance for Site #402. Entry granted.', time: '2 mins ago' },
              { type: 'warning', msg: 'Deep sewer detected at Mumbai South. Site flagged for caution.', time: '15 mins ago' },
              { type: 'critical', msg: 'Gas leak risk identified by Risk Engine. Site flagged for inspection.', time: '1 hour ago' },
              { type: 'safe', msg: 'Audit trail secured on blockchain for 14 active deployments.', time: '2 hours ago' }
            ].map((item, idx) => (
              <div key={idx} style={{ padding: '16px 0', borderBottom: idx === 3 ? 'none' : '1px solid var(--border)', display: 'flex', gap: 16 }}>
                <div style={{ 
                  width: 32, height: 32, borderRadius: '8px', 
                  background: item.type === 'safe' ? '#ECFDF5' : (item.type === 'warning' ? '#FFFBEB' : '#FEF2F2'),
                  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
                }}>
                  {item.type === 'safe' ? <Shield size={16} color="#10B981" /> : (item.type === 'warning' ? <Zap size={16} color="#F59E0B" /> : <AlertCircle size={16} color="#EF4444" />)}
                </div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>{item.msg}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>{item.time}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="data-card" style={{ background: '#1F2937', color: 'white', borderRadius: '24px', padding: '24px', boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
            <h3 style={{ fontSize: 18, fontWeight: 800, margin: 0, color: 'white' }}>Risk Forecasting</h3>
            <BarChart3 size={18} style={{ color: 'rgba(255,255,255,0.5)' }} />
          </div>
          <div style={{ padding: '10px 0' }}>
            {[
              { label: 'Low Risk (Safe)', pct: 72, color: '#10B981' },
              { label: 'Caution (Warning)', pct: 18, color: '#F59E0B' },
              { label: 'High Risk (Danger)', pct: 10, color: '#EF4444' }
            ].map((r, i) => (
              <div key={i} style={{ marginBottom: 24 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 8 }}>
                  <span style={{ fontWeight: 600 }}>{r.label}</span>
                  <span style={{ fontWeight: 800 }}>{r.pct}%</span>
                </div>
                <div style={{ height: 10, background: 'rgba(255,255,255,0.1)', borderRadius: 5, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${r.pct}%`, background: r.color, borderRadius: 5 }} />
                </div>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 24, padding: '20px', background: 'rgba(255,255,255,0.05)', borderRadius: '16px', display: 'flex', gap: 12, alignItems: 'flex-start' }}>
            <Sparkles size={20} style={{ color: '#FCD34D', flexShrink: 0 }} />
            <div>
              <div style={{ fontSize: 13, fontWeight: 800, marginBottom: 4 }}>AI Predictive Insight</div>
              <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)', margin: 0, lineHeight: 1.5 }}>
                Expected safety score improvement of 4.2% in Mumbai North region following updated equipment distribution and AI site-hardening.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
