// SafeFlow Global — Profile & Account Management
import { useState } from 'react';
import { User, Phone, MapPin, ShieldCheck, Save, Loader2 } from 'lucide-react';
import useAuthStore from '../store/authStore';
import { workersAPI } from '../api/client';

export default function ProfilePage() {
  const { user, setUser } = useAuthStore();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    region: user?.region || '',
    district: user?.district || '',
    emergency_contact: user?.emergency_contact || '',
    emergency_contact_name: user?.emergency_contact_name || '',
  });

  const handleSave = async () => {
    setLoading(true);
    try {
      const { data } = await workersAPI.update(user.id, formData);
      setUser(data); // Update global state
      setIsEditing(false);
      alert('Profile updated successfully!');
    } catch (err) {
      alert('Failed to update profile: ' + (err.response?.data?.detail || err.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="top-bar">
        <div className="page-title">
          <h2>Account Settings</h2>
          <p>Manage your professional profile and safety contacts</p>
        </div>
        <div className="top-actions">
          {!isEditing ? (
            <button className="btn btn-primary" onClick={() => setIsEditing(true)}>Edit Profile</button>
          ) : (
            <div style={{ display: 'flex', gap: 12 }}>
              <button className="btn btn-outline" onClick={() => setIsEditing(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleSave} disabled={loading}>
                {loading ? <Loader2 className="spinner" size={18} /> : <><Save size={18} style={{ marginRight: 8 }} /> Save Changes</>}
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="dashboard-layout" style={{ maxWidth: 800, margin: '0 auto' }}>
        <div className="data-card" style={{ padding: 32 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 24, marginBottom: 40, borderBottom: '1px solid var(--border)', paddingBottom: 24 }}>
            <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'var(--bg-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--orange)' }}>
              <User size={40} />
            </div>
            <div>
              <h3 style={{ fontSize: 24, margin: 0 }}>{user?.name}</h3>
              <p style={{ color: 'var(--text-muted)', margin: '4px 0' }}>{user?.role?.toUpperCase()} • {user?.phone_number}</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--green)', marginTop: 8 }}>
                <ShieldCheck size={14} /> Profile Verified
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32 }}>
            {/* Basic Info */}
            <div className="form-section">
              <h4 style={{ marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                <User size={16} /> Basic Information
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div className="input-group">
                  <label style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 6, display: 'block' }}>Full Name</label>
                  {isEditing ? (
                    <input className="form-input" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                  ) : (
                    <div style={{ fontWeight: 500 }}>{user?.name}</div>
                  )}
                </div>
                <div className="input-group">
                  <label style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 6, display: 'block' }}>Region / State</label>
                  {isEditing ? (
                    <input className="form-input" value={formData.region} onChange={e => setFormData({...formData, region: e.target.value})} />
                  ) : (
                    <div style={{ fontWeight: 500 }}>{user?.region || '—'}</div>
                  )}
                </div>
                <div className="input-group">
                  <label style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 6, display: 'block' }}>District</label>
                  {isEditing ? (
                    <input className="form-input" value={formData.district} onChange={e => setFormData({...formData, district: e.target.value})} />
                  ) : (
                    <div style={{ fontWeight: 500 }}>{user?.district || '—'}</div>
                  )}
                </div>
              </div>
            </div>

            {/* Emergency Contacts */}
            <div className="form-section">
              <h4 style={{ marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                <Phone size={16} style={{ color: 'var(--red)' }} /> Emergency Contact
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div className="input-group">
                  <label style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 6, display: 'block' }}>Contact Name</label>
                  {isEditing ? (
                    <input className="form-input" value={formData.emergency_contact_name} onChange={e => setFormData({...formData, emergency_contact_name: e.target.value})} />
                  ) : (
                    <div style={{ fontWeight: 500 }}>{user?.emergency_contact_name || '—'}</div>
                  )}
                </div>
                <div className="input-group">
                  <label style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 6, display: 'block' }}>Emergency Phone</label>
                  {isEditing ? (
                    <input className="form-input" value={formData.emergency_contact} onChange={e => setFormData({...formData, emergency_contact: e.target.value})} />
                  ) : (
                    <div style={{ fontWeight: 500 }}>{user?.emergency_contact || '—'}</div>
                  )}
                </div>
              </div>
            </div>
          </div>
          
          <div style={{ marginTop: 40, padding: 20, background: 'rgba(255, 140, 0, 0.05)', borderRadius: 12, border: '1px solid rgba(255, 140, 0, 0.2)' }}>
            <div style={{ display: 'flex', gap: 12 }}>
              <ShieldCheck size={20} style={{ color: 'var(--orange)' }} />
              <div>
                <strong style={{ display: 'block', fontSize: 13, marginBottom: 4 }}>Safety Verification</strong>
                <p style={{ margin: 0, fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.5 }}>
                  Your emergency contact is critical for the <strong>Dead Man's Switch</strong> alert system. 
                  In case of a missed check-out, this person will be notified immediately via SMS and Call.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
