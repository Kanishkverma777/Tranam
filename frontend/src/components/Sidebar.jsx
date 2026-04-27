// SafeFlow Global — Sidebar Navigation

import { useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Users, ClipboardCheck, AlertTriangle,
  Building2, LogOut, User
} from 'lucide-react';
import useAuthStore from '../store/authStore';

const navItems = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['worker', 'ngo', 'municipality', 'contractor'] },
  { path: '/workers', label: 'Workers', icon: Users, roles: ['municipality', 'contractor'] },
  { path: '/checkins', label: 'Check-ins', icon: ClipboardCheck, roles: ['worker', 'municipality', 'contractor'] },
  { path: '/incidents', label: 'Incidents', icon: AlertTriangle, roles: ['worker', 'ngo', 'municipality', 'contractor'] },
  { path: '/contractors', label: 'Contractors', icon: Building2, roles: ['ngo', 'municipality'] },
];

export default function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout, user } = useAuthStore();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <h1>TRANAM</h1>
        <span>Worker Protection</span>
      </div>

      <nav className="sidebar-nav">
        {navItems
          .filter(item => item.roles.includes(user?.role?.toLowerCase() || 'worker'))
          .map((item) => (
            <button
              key={item.path}
              className={`nav-link ${location.pathname === item.path ? 'active' : ''}`}
              onClick={() => navigate(item.path)}
              title={item.label}
            >
              <item.icon size={22} />
              <span>{item.label}</span>
            </button>
          ))}

        <div style={{ flex: 1 }} />

        <div
          onClick={() => navigate('/profile')}
          style={{
            width: '44px', height: '44px', borderRadius: '50%',
            background: 'var(--bg-secondary)', display: 'flex',
            alignItems: 'center', justifyContent: 'center',
            marginBottom: '16px', color: 'var(--text-primary)',
            cursor: 'pointer', border: location.pathname === '/profile' ? '2px solid var(--orange)' : 'none'
          }}
          title={user?.name}
        >
          <User size={20} />
        </div>

        <button className="nav-link" onClick={handleLogout} title="Sign Out">
          <LogOut size={22} />
          <span>Sign Out</span>
        </button>
      </nav>
    </aside>
  );
}
