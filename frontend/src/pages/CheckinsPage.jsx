// SafeFlow Global — Check-ins Page

import { useState, useEffect } from 'react';
import { RefreshCw, Clock, CheckCircle } from 'lucide-react';
import { checkinsAPI } from '../api/client';

export default function CheckinsPage() {
  const [checkins, setCheckins] = useState([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadCheckins(); }, [filter]);

  const loadCheckins = async () => {
    setLoading(true);
    try {
      const params = filter !== 'all' ? { status: filter } : {};
      const { data } = await checkinsAPI.list(params);
      setCheckins(data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const handleCheckout = async (id) => {
    try {
      await checkinsAPI.checkout(id);
      loadCheckins();
    } catch (err) { alert(err.response?.data?.detail || 'Failed'); }
  };

  const formatTime = (iso) => iso ? new Date(iso).toLocaleString() : '—';

  return (
    <>
      <div className="top-bar">
        <div className="page-title">
          <h2>Check-ins</h2>
          <p>Job check-in tracking and dead man's switch</p>
        </div>
        <div className="top-actions">
          {['all', 'active', 'safe', 'emergency', 'missed'].map((f) => (
            <button key={f} className={`btn btn-sm ${filter === f ? 'btn-primary' : 'btn-outline'}`}
              onClick={() => setFilter(f)} style={{ textTransform: 'capitalize' }}>
              {f}
            </button>
          ))}
          <button className="btn btn-outline btn-sm" onClick={loadCheckins}><RefreshCw size={14} /></button>
        </div>
      </div>

      {loading ? (
        <div className="loading-spinner"><div className="spinner" /></div>
      ) : (
        <div className="data-card">
          <table className="data-table">
            <thead>
              <tr>
                <th>Worker ID</th>
                <th>Risk</th>
                <th>Score</th>
                <th>Status</th>
                <th>Started</th>
                <th>Deadline</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {checkins.length === 0 ? (
                <tr><td colSpan="7"><div className="empty-state"><h3>No check-ins found</h3></div></td></tr>
              ) : checkins.map((c) => (
                <tr key={c.id}>
                  <td style={{ fontFamily: 'monospace', fontSize: 12 }}>{String(c.worker_id).slice(0, 8)}...</td>
                  <td><span className={`badge-risk ${c.risk_level?.toLowerCase()}`}>{c.risk_level || '—'}</span></td>
                  <td>{c.risk_score ?? '—'}</td>
                  <td>
                    <span className={`badge-status ${c.status}`}>
                      {c.status === 'active' && <Clock size={12} />}
                      {c.status === 'safe' && <CheckCircle size={12} />}
                      {c.status}
                    </span>
                  </td>
                  <td style={{ fontSize: 13 }}>{formatTime(c.started_at)}</td>
                  <td style={{ fontSize: 13 }}>{formatTime(c.deadline)}</td>
                  <td>
                    {c.status === 'active' && (
                      <button className="btn btn-sm btn-primary" onClick={() => handleCheckout(c.id)}>
                        Check Out
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
