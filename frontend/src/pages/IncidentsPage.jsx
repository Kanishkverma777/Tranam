// SafeFlow Global — Incidents Page

import { useState, useEffect } from 'react';
import { AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import { incidentsAPI } from '../api/client';

export default function IncidentsPage() {
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadIncidents(); }, []);

  const loadIncidents = async () => {
    try {
      const { data } = await incidentsAPI.list();
      setIncidents(data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const severityColor = (s) => {
    if (s === 'critical') return 'red';
    if (s === 'high') return 'yellow';
    return 'green';
  };

  if (loading) return <div className="loading-spinner"><div className="spinner" /></div>;

  return (
    <>
      <div className="top-bar">
        <div className="page-title">
          <h2>Incidents</h2>
          <p>{incidents.length} total reported incidents</p>
        </div>
      </div>

      <div className="data-card">
        <table className="data-table">
          <thead>
            <tr>
              <th>Type</th>
              <th>Severity</th>
              <th>Region</th>
              <th>Status</th>
              <th>Authority Notified</th>
              <th>Reported</th>
            </tr>
          </thead>
          <tbody>
            {incidents.length === 0 ? (
              <tr><td colSpan="6">
                <div className="empty-state">
                   <div className="icon"><CheckCircle size={32} style={{ color: 'var(--green)' }} /></div>
                  <h3>No incidents reported</h3>
                  <p>This is good news</p>
                </div>
              </td></tr>
            ) : incidents.map((inc) => (
              <tr key={inc.id}>
                <td style={{ color: 'var(--text-primary)', fontWeight: 500, textTransform: 'capitalize' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <AlertTriangle size={14} style={{ color: 'var(--red)' }} />
                    {inc.incident_type?.replace('_', ' ')}
                  </span>
                </td>
                <td><span className={`badge-risk ${severityColor(inc.severity)}`}>{inc.severity}</span></td>
                <td>{inc.region || inc.country || '—'}</td>
                <td><span className="badge-status active" style={{ textTransform: 'capitalize' }}>{inc.status}</span></td>
                <td>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    {inc.authority_notified 
                      ? <><CheckCircle size={14} style={{ color: 'var(--green)' }} /> Yes</> 
                      : <><XCircle size={14} style={{ color: 'var(--red)' }} /> No</>
                    }
                  </span>
                </td>
                <td style={{ fontSize: 13 }}>{new Date(inc.reported_at).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
