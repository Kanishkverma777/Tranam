// SafeFlow Global — Login Page

import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { LogIn, ArrowLeft } from 'lucide-react';
import useAuthStore from '../store/authStore';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, loading, error } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const success = await login(email, password);
    if (success) navigate('/dashboard');
  };

  return (
    <div className="login-page">
      <div className="login-card">
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
            <h2>Welcome Back</h2>
          </div>
        </div>
        <p className="subtitle">Sign in to the monitoring dashboard</p>

        {error && <div className="login-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email Address</label>
            <input
              type="email" className="form-input" placeholder="admin@safeflow.global"
              value={email} onChange={(e) => setEmail(e.target.value)} required
            />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input
              type="password" className="form-input" placeholder="••••••••"
              value={password} onChange={(e) => setPassword(e.target.value)} required
            />
          </div>
          <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: '100%', justifyContent: 'center', padding: '16px', fontSize: '16px' }}>
            <LogIn size={18} />
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: 24, fontSize: 14, color: 'var(--text-secondary)' }}>
          Don't have an account?{' '}
          <Link to="/register" style={{ color: 'var(--text-primary)', fontWeight: 600, textDecoration: 'none' }}>
            Create Account
          </Link>
        </p>

        <p style={{ textAlign: 'center', marginTop: 12, fontSize: 13, color: 'var(--text-muted)' }}>
          Default: admin@safeflow.global / admin123
        </p>
      </div>
    </div>
  );
}
