import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';

const NAV = [
  {
    section: 'Main',
    items: [
      { to: '/dashboard', icon: '📊', label: 'Dashboard'       },
      { to: '/scan',      icon: '🔍', label: 'Run Scan'        },
    ],
  },
  {
    section: 'Results',
    items: [
      { to: '/findings', icon: '📋', label: 'Findings'         },
      { to: '/history',  icon: '🕐', label: 'Scan History'     },
    ],
  },
  {
    section: 'Governance',
    items: [
      { to: '/rules',    icon: '📝', label: 'Rules Repository' },
    ],
  },
  {
    section: 'System',
    items: [
      { to: '/setup',    icon: '🖥️',  label: 'System Health'   },
    ],
  },
];

export default function Sidebar() {
  const navigate = useNavigate();

  return (
    <nav className="sidebar">

      {/* Logo */}
      <div style={{ padding: '20px 16px 16px', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 38, height: 38, borderRadius: 10, flexShrink: 0,
            background: '#4f46e5',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20,
          }}>🛡️</div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 800, color: '#fff', lineHeight: 1.2, letterSpacing: '-0.3px' }}>FCI Scanner</div>
            <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', marginTop: 2 }}>Governance · Standards</div>
          </div>
          <span style={{
            marginLeft: 'auto', fontSize: 9, background: '#10b981',
            color: '#fff', padding: '2px 7px', borderRadius: 20, fontWeight: 800, letterSpacing: '0.5px',
          }}>v1.0</span>
        </div>
      </div>

      {/* Run Scan CTA */}
      <div style={{ padding: '14px 12px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <button onClick={() => navigate('/scan')} style={{
          width: '100%', padding: '10px', borderRadius: 8, border: 'none',
          background: 'linear-gradient(135deg, #4f46e5 0%, #6366f1 100%)',
          color: '#fff', fontSize: 12, fontWeight: 700, cursor: 'pointer',
          letterSpacing: '0.3px', display: 'flex', alignItems: 'center',
          justifyContent: 'center', gap: 8,
        }}>
          <span style={{ fontSize: 14 }}>🔍</span> Run New Scan
        </button>
      </div>

      {/* Nav */}
      {NAV.map(({ section, items }) => (
        <React.Fragment key={section}>
          <span className="sidebar-section-label">{section}</span>
          <ul className="sidebar-nav">
            {items.map(({ to, icon, label }) => (
              <li key={to}>
                <NavLink to={to} className={({ isActive }) => isActive ? 'active' : ''}>
                  <span className="nav-icon">{icon}</span>
                  {label}
                </NavLink>
              </li>
            ))}
          </ul>
        </React.Fragment>
      ))}

      {/* Footer */}
      <div style={{ marginTop: 'auto', padding: '16px', borderTop: '1px solid rgba(255,255,255,0.07)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 32, height: 32, borderRadius: '50%',
            background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 11, fontWeight: 800, color: '#fff', flexShrink: 0,
          }}>MM</div>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.8)', fontWeight: 700 }}>Mutturaj</div>
            <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>India Tech Lead</div>
          </div>
        </div>
      </div>

    </nav>
  );
}
