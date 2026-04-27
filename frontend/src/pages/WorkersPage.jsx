// SafeFlow Global — Workers Page

import { useState, useEffect } from 'react';
import { UserPlus, Search } from 'lucide-react';
import { workersAPI } from '../api/client';

export default function WorkersPage() {
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', phone_number: '', region: '', district: '', emergency_contact: '', emergency_contact_name: '' });

  useEffect(() => { loadWorkers(); }, []);

  const loadWorkers = async () => {
    try {
      const { data } = await workersAPI.list();
      setWorkers(data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await workersAPI.create(form);
      setShowForm(false);
      setForm({ name: '', phone_number: '', region: '', district: '', emergency_contact: '', emergency_contact_name: '' });
      loadWorkers();
    } catch (err) { alert(err.response?.data?.detail || 'Failed'); }
  };

  if (loading) return <div className="loading-spinner"><div className="spinner" /></div>;

  return (
    <>
      <div className="top-bar">
        <div className="page-title">
          <h2>Workers</h2>
          <p>{workers.length} registered workers</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
          <UserPlus size={18} /> Add Worker
        </button>
      </div>

      {showForm && (
        <div className="data-card" style={{ marginBottom: 20, padding: 24 }}>
          <h3 style={{ marginBottom: 16 }}>Register New Worker</h3>
          <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div className="form-group" style={{ margin: 0 }}>
              <label>Full Name</label>
              <input className="form-input" placeholder="Worker name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            </div>
            <div className="form-group" style={{ margin: 0 }}>
              <label>Phone Number</label>
              <input className="form-input" placeholder="+919000000000" value={form.phone_number} onChange={(e) => setForm({ ...form, phone_number: e.target.value })} required />
            </div>
            <div className="form-group" style={{ margin: 0 }}>
              <label>Region</label>
              <input className="form-input" placeholder="IN-MH" value={form.region} onChange={(e) => setForm({ ...form, region: e.target.value })} required />
            </div>
            <div className="form-group" style={{ margin: 0 }}>
              <label>District</label>
              <input className="form-input" placeholder="Mumbai" value={form.district} onChange={(e) => setForm({ ...form, district: e.target.value })} />
            </div>
            <div className="form-group" style={{ margin: 0 }}>
              <label>Emergency Contact</label>
              <input className="form-input" placeholder="+919000000000" value={form.emergency_contact} onChange={(e) => setForm({ ...form, emergency_contact: e.target.value })} />
            </div>
            <div className="form-group" style={{ margin: 0 }}>
              <label>Emergency Contact Name</label>
              <input className="form-input" placeholder="Contact name" value={form.emergency_contact_name} onChange={(e) => setForm({ ...form, emergency_contact_name: e.target.value })} />
            </div>
            <div style={{ gridColumn: '1 / -1', display: 'flex', gap: 12 }}>
              <button type="submit" className="btn btn-primary">Register Worker</button>
              <button type="button" className="btn btn-outline" onClick={() => setShowForm(false)}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      <div className="data-card">
        <table className="data-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Phone</th>
              <th>Region</th>
              <th>District</th>
              <th>Emergency Contact</th>
              <th>Verified</th>
            </tr>
          </thead>
          <tbody>
            {workers.length === 0 ? (
              <tr><td colSpan="6"><div className="empty-state"><h3>No workers registered yet</h3></div></td></tr>
            ) : workers.map((w) => (
              <tr key={w.id}>
                <td style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{w.name}</td>
                <td>{w.phone_number}</td>
                <td>{w.region}</td>
                <td>{w.district || '—'}</td>
                <td>{w.emergency_contact || '—'}</td>
                <td><span className={`badge-status ${w.profile_verified ? 'active' : 'missed'}`}>{w.profile_verified ? 'Verified' : 'Pending'}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
