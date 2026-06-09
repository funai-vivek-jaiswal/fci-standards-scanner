import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const PAGE_META = {
  '/dashboard':  { label: 'Dashboard',     emoji: '📊' },
  '/scan':       { label: 'Run Scan',      emoji: '🔍' },
  '/findings':   { label: 'Findings',      emoji: '📋' },
  '/history':    { label: 'Scan History',  emoji: '🕐' },
  '/rules':      { label: 'Rules',         emoji: '📝' },
  '/setup':      { label: 'System Health', emoji: '🖥️' },
};

export default function Topbar() {
  const { pathname } = useLocation();
  const navigate = useNavigate();

  const base = '/' + pathname.split('/')[1];
  const meta = PAGE_META[base] || { label: 'Page', emoji: '📄' };

  return (
    <div className="topbar">
      <div className="topbar-breadcrumb">
        FCI Governance Scanner ›{' '}
        <strong>{meta.emoji} {meta.label}</strong>
      </div>

      <div className="topbar-actions">
        <button
          className="btn btn--secondary btn--sm"
          onClick={() => navigate('/scan')}
          style={{ display: 'flex', alignItems: 'center', gap: 6 }}
        >
          <span style={{ fontSize: 13 }}>🔍</span>
          <span>New Scan</span>
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div className="user-avatar">MM</div>
          <span style={{ fontSize: 12, color: 'var(--text-2)' }}>Mutturaj</span>
        </div>
      </div>
    </div>
  );
}