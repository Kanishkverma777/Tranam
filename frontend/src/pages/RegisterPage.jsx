// TRANAM — Register Page

import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { UserPlus, ArrowLeft } from 'lucide-react';
import useAuthStore from '../store/authStore';
import { authAPI } from '../api/client';

export default function RegisterPage() {
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'worker', region: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const { data } = await authAPI.register(form);
      localStorage.setItem('safeflow_token', data.access_token);
      localStorage.setItem('safeflow_user', JSON.stringify(data.user));
      // Manually update zustand store
      useAuthStore.setState({
        user: data.user,
        token: data.access_token,
        isAuthenticated: true,
      });
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.detail || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const update = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  return (
    <div className="login-page">
      <div className="login-card" style={{ maxWidth: 480 }}>
        <button
          onClick={() => navigate('/')}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            background: 'none', border: 'none', color: 'var(--text-secondary)',
            fontSize: 14, fontWeight: 500, cursor: 'pointer', marginBottom: 24,
            fontFamily: 'inherit',
          }}
        >
          <ArrowLeft size={16} /> Back to home
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '8px' }}>
          <div>
            <h2>Create Account</h2>
          </div>
        </div>
        <p className="subtitle">Join TRANAM and start protecting workers today</p>

        {error && <div className="login-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Full Name</label>
            <input
              type="text" className="form-input" placeholder="John Doe"
              value={form.name} onChange={update('name')} required
            />
          </div>
          <div className="form-group">
            <label>Email Address</label>
            <input
              type="email" className="form-input" placeholder="you@organization.com"
              value={form.email} onChange={update('email')} required
            />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input
              type="password" className="form-input" placeholder="Minimum 8 characters"
              value={form.password} onChange={update('password')} required minLength={6}
            />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div className="form-group">
              <label>Role</label>
              <select
                className="form-input"
                value={form.role} onChange={update('role')}
              >
                <option value="worker">Worker</option>
                <option value="contractor">Contractor</option>
                <option value="ngo">NGO</option>
                <option value="municipality">Municipality</option>
              </select>
            </div>
            <div className="form-group">
              <label>Region</label>
              <input
                type="text" className="form-input" placeholder="e.g. IN-MH"
                value={form.region} onChange={update('region')}
              />
            </div>
          </div>
          <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: '100%', justifyContent: 'center', padding: '16px', fontSize: '16px' }}>
            <UserPlus size={18} />
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: 24, fontSize: 14, color: 'var(--text-secondary)' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: 'var(--text-primary)', fontWeight: 600, textDecoration: 'none' }}>
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}
