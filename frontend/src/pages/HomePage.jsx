// SafeFlow Global — Landing Page

import { useNavigate } from 'react-router-dom';
import {
  ArrowRight, Activity, Users, AlertTriangle,
  MapPin, Clock, Bell, CheckCircle, Zap, Wifi, Eye, Lock
} from 'lucide-react';
import workerBg from '../assets/worker-bg.jpg';

const features = [
  {
    icon: Activity,
    title: 'Real-Time Monitoring',
    desc: 'Track every worker underground with live status updates, dead man\'s switch, and automatic escalation protocols.',
    color: 'var(--green)',
    bg: 'rgba(34, 197, 94, 0.1)',
  },
  {
    icon: AlertTriangle,
    title: 'Risk Assessment AI',
    desc: 'AI-driven risk scoring evaluates depth, duration, gas levels, and contractor history before each job starts.',
    color: 'var(--red)',
    bg: 'rgba(255, 126, 121, 0.1)',
  },
  {
    icon: Bell,
    title: 'Emergency Alerts',
    desc: 'Instant SMS notifications to emergency contacts and authorities when a worker misses their check-out deadline.',
    color: 'var(--yellow)',
    bg: 'rgba(255, 214, 70, 0.15)',
  },
  {
    icon: MapPin,
    title: 'Contractor Registry',
    desc: 'Public accountability database with safety scores, blacklisting, and worker-submitted anonymous ratings.',
    color: 'var(--text-primary)',
    bg: 'rgba(0, 0, 0, 0.05)',
  },
];

const steps = [
  { num: '01', icon: Wifi, title: 'Deploy Sensors', desc: 'Install IoT devices at manhole entry points to track worker presence and environmental conditions.' },
  { num: '02', icon: Eye, title: 'Monitor in Real-Time', desc: 'Dashboard tracks every active session with live gas readings, depth, and duration data.' },
  { num: '03', icon: Bell, title: 'Automated Alerts', desc: 'If a worker exceeds time limits or sensors detect danger, alerts fire instantly to all stakeholders.' },
  { num: '04', icon: Lock, title: 'Ensure Compliance', desc: 'Automatic report generation for regulatory bodies with full audit trails and safety scores.' },
];

export default function HomePage() {
  const navigate = useNavigate();

  return (
    <div className="home-page">

      {/* ── Hero Section ── */}
      <section className="home-hero home-hero-full">

        {/* Scattered decorative shapes */}
        <div className="hero-shape shape-ring" style={{ top: '8%', left: '5%' }}></div>
        <div className="hero-shape shape-plus" style={{ top: '70%', left: '2%' }}></div>
        <div className="hero-shape shape-diamond" style={{ top: '85%', left: '48%' }}></div>
        <div className="hero-shape shape-ring-sm" style={{ bottom: '10%', right: '5%' }}></div>

        <div className="home-hero-content">

          <h1 style={{ fontSize: '5rem', marginBottom: '0.5rem' }}>
            TRANAM
          </h1>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#FF8C00', marginBottom: '2rem' }}>
            Protecting lives underground.
          </h2>
          <p className="home-hero-subtitle">
            TRANAM is the world's first AI-powered sewer worker protection system.
            Real-time monitoring, risk assessment, and emergency alerts — because
            no worker should go underground without a safety net.
          </p>
          <div className="home-hero-cta">
            <button className="btn btn-primary btn-lg" onClick={() => navigate('/register')}>
              Create Account <ArrowRight size={18} />
            </button>
            <button className="btn btn-outline btn-lg" onClick={() => navigate('/login')}>
              Sign In to Dashboard
            </button>
          </div>
          <div style={{ marginTop: '24px', fontStyle: 'italic', color: 'var(--text-secondary)' }}>
            <p style={{ margin: 0, fontSize: '16px' }}>"Paritranaya Sadhunam..." (परित्राणाय साधूनां...)</p>
            <p style={{ margin: 0, fontSize: '14px' }}>(To protect the righteous...)</p>
          </div>


        </div>

        <div className="home-hero-visual">
          {/* Background dots */}
          <div className="bg-dot dot-orange" style={{ top: '5%', left: '-8%' }}></div>
          <div className="bg-dot dot-green" style={{ top: '2%', right: '5%' }}></div>
          <div className="bg-dot dot-blue" style={{ bottom: '10%', left: '5%' }}></div>
          <div className="bg-dot dot-red" style={{ bottom: '35%', right: '-5%' }}></div>
          <div className="bg-dot dot-yellow" style={{ bottom: '5%', right: '-15%' }}></div>



          <div className="masked-image-container">
            <svg viewBox="0 0 500 500" width="100%" height="100%" className="svg-masked-hero">
              <defs>
                <mask id="capsule-mask">
                  <g transform="translate(250, 250) rotate(45) translate(-250, -250)">
                    <rect x="40" y="80" width="130" height="320" rx="65" fill="white" />
                    <rect x="185" y="-10" width="130" height="520" rx="65" fill="white" />
                    <rect x="330" y="100" width="130" height="320" rx="65" fill="white" />
                  </g>
                </mask>
              </defs>
              <image
                href={workerBg}
                width="100%"
                height="100%"
                preserveAspectRatio="xMidYMid slice"
                mask="url(#capsule-mask)"
              />
            </svg>
          </div>
        </div>
      </section>

      {/* ── Scrolling Trust Bar ── */}
      <section className="trust-marquee-section">
        <div className="trust-marquee-track">
          {[...Array(2)].map((_, setIdx) => (
            <div className="trust-marquee-set" key={setIdx}>
              {['SmartCity Corp', 'Metro Utilities', 'CivicSafe', 'AquaInfra', 'UrbanShield', 'PipeLine Pro', 'SafeWork Alliance'].map((name, i) => (
                <span className="trust-marquee-item" key={i}>{name}</span>
              ))}
            </div>
          ))}
        </div>
      </section>

      {/* ── Features Section ── */}
      <section className="home-features">
        <div className="home-section-header">
          <span className="home-section-tag">Features</span>
          <h2>Everything you need to<br />keep workers safe</h2>
          <p>A comprehensive safety ecosystem that monitors, alerts, and protects — from check-in to check-out.</p>
        </div>
        <div className="home-features-grid">
          {features.map((f, i) => (
            <div key={i} className="home-feature-card">
              <div className="feature-icon" style={{ background: f.bg, color: f.color }}>
                <f.icon size={24} />
              </div>
              <h3>{f.title}</h3>
              <p>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── How It Works Section ── */}
      <section className="home-how-it-works">
        <div className="home-section-header">
          <span className="home-section-tag">How It Works</span>
          <h2>From deployment to<br />full compliance</h2>
          <p>Set up SafeFlow in minutes and start protecting your underground workforce immediately.</p>
        </div>
        <div className="how-steps-row">
          {steps.map((s, i) => (
            <div key={i} className="how-step-card">
              <div className="how-step-num">{s.num}</div>
              <div className="how-step-icon-wrap">
                <s.icon size={22} />
              </div>
              <h4>{s.title}</h4>
              <p>{s.desc}</p>
              {i < steps.length - 1 && <div className="how-step-connector" />}
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA Section ── */}
      <section className="home-cta">
        <div className="home-cta-card">
          <h2>Ready to protect your workforce?</h2>
          <p>Join hundreds of organizations using SafeFlow to keep their sewer and underground workers safe.</p>
          <div className="home-cta-buttons">
            <button className="btn btn-primary btn-lg" onClick={() => navigate('/register')}>
              Start <ArrowRight size={18} />
            </button>
            <button className="btn btn-outline btn-lg" onClick={() => navigate('/login')}>
              Sign In
            </button>
          </div>
          <div style={{ marginTop: '24px', fontStyle: 'italic', color: 'rgba(255,255,255,0.8)' }}>
            <p style={{ margin: 0, fontSize: '16px' }}>"Paritranaya Sadhunam..." (परित्राणाय साधूनां...)</p>
            <p style={{ margin: 0, fontSize: '14px' }}>(To protect the righteous...)</p>
          </div>
        </div>
      </section>

    </div>
  );
}
