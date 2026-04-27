// SafeFlow Global — Contractors Page

import { useState, useEffect } from 'react';
import { Building2, Star } from 'lucide-react';
import { contractorsAPI } from '../api/client';

export default function ContractorsPage() {
  const [contractors, setContractors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadContractors(); }, []);

  const loadContractors = async () => {
    try {
      const { data } = await contractorsAPI.list();
      setContractors(data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const riskColor = (score) => {
    if (score >= 7) return 'green';
    if (score >= 4) return 'yellow';
    return 'red';
  };

  if (loading) return <div className="loading-spinner"><div className="spinner" /></div>;

  return (
    <>
      <div className="top-bar">
        <div className="page-title">
          <h2>Contractor Registry</h2>
          <p>Public accountability database</p>
        </div>
      </div>

      <div className="data-card">
        <table className="data-table">
          <thead>
            <tr>
              <th>Company</th>
              <th>Registration #</th>
              <th>Region</th>
              <th>Safety Score</th>
              <th>Jobs</th>
              <th>Incidents</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {contractors.length === 0 ? (
              <tr><td colSpan="7"><div className="empty-state"><h3>No contractors registered</h3></div></td></tr>
            ) : contractors.map((c) => (
              <tr key={c.id}>
                <td style={{ color: 'var(--text-primary)', fontWeight: 500 }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Building2 size={14} /> {c.name}
                  </span>
                </td>
                <td style={{ fontFamily: 'monospace', fontSize: 12 }}>{c.registration_number || '—'}</td>
                <td>{c.region}</td>
                <td>
                  <span className={`badge-risk ${riskColor(c.risk_score)}`}>
                    <Star size={12} /> {Number(c.risk_score).toFixed(1)}
                  </span>
                </td>
                <td>{c.total_jobs}</td>
                <td style={{ color: c.total_incidents > 0 ? 'var(--red)' : 'inherit' }}>
                  {c.total_incidents}
                </td>
                <td>
                  {c.is_blacklisted
                    ? <span className="badge-risk red">⛔ Blacklisted</span>
                    : <span className="badge-status active">Active</span>
                  }
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
