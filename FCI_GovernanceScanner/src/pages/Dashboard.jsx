import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const STATS = {
  passRate: 84, totalRules: 72, passed: 61, failed: 8, warned: 3, critical: 2,
  lastScan: '08 Jun 2026, 09:14 IST', scanType: 'Full Scan', trend: '+3%',
};

const MODULES = [
  { name: 'Creator',   rules: 21, passed: 18, failed: 2, warned: 1, critical: 0, pct: 86, color: '#ff6b2b' },
  { name: 'CRM',       rules: 16, passed: 12, failed: 3, warned: 1, critical: 1, pct: 75, color: '#e8271e' },
  { name: 'People',    rules: 12, passed: 10, failed: 1, warned: 1, critical: 0, pct: 83, color: '#0077b6' },
  { name: 'Analytics', rules: 10, passed: 8,  failed: 1, warned: 0, critical: 1, pct: 80, color: '#00a86b' },
  { name: 'Sigma',     rules: 5,  passed: 5,  failed: 0, warned: 0, critical: 0, pct: 100,color: '#7b2ff7' },
  { name: 'Recruit',   rules: 5,  passed: 4,  failed: 1, warned: 0, critical: 0, pct: 80, color: '#f4720b' },
  { name: 'Forms',     rules: 4,  passed: 4,  failed: 0, warned: 0, critical: 0, pct: 100,color: '#28a745' },
];

const TOP_VIOLATIONS = [
  { rule: 'CRM-SEC-001', name: 'API key in plain text',          app: 'CRM',      sev: 'CRITICAL', count: 3 },
  { rule: 'ANL-SQL-003', name: 'SELECT * in production report',  app: 'Analytics',sev: 'CRITICAL', count: 2 },
  { rule: 'CRM-NAM-002', name: 'Module not PascalCase',          app: 'CRM',      sev: 'HIGH',     count: 5 },
  { rule: 'CRT-NAM-005', name: 'Field API name has spaces',      app: 'Creator',  sev: 'HIGH',     count: 4 },
  { rule: 'CRM-API-003', name: '>50 API calls per workflow',     app: 'CRM',      sev: 'HIGH',     count: 2 },
];

const CATEGORY_BREAKDOWN = [
  { name: 'Naming',       total: 28, failed: 6, color: '#4f46e5' },
  { name: 'Security',     total: 18, failed: 2, color: '#ef4444' },
  { name: 'API Limits',   total: 12, failed: 1, color: '#f59e0b' },
  { name: 'SQL',          total: 8,  failed: 2, color: '#10b981' },
  { name: 'Performance',  total: 4,  failed: 0, color: '#3b82f6' },
  { name: 'Structure',    total: 2,  failed: 0, color: '#8b5cf6' },
];

const ACTIVITY = [
  { time: '09:14', msg: 'Full scan completed — 84% pass rate',        type: 'success' },
  { time: '09:11', msg: 'Scan initiated by Mutturaj',                  type: 'info'    },
  { time: 'Yesterday', msg: 'CRT-NAM-004 resolved by Vivek J.',        type: 'resolve' },
  { time: 'Yesterday', msg: 'CRM-SEC-002 severity updated to HIGH',    type: 'info'    },
  { time: '06 Jun',    msg: 'Full scan completed — 81% pass rate',     type: 'success' },
  { time: '05 Jun',    msg: 'New rule added: CRM-API-004',             type: 'info'    },
];

const CRITICALS = [
  { id: 'F-001', rule: 'CRM-SEC-001', name: 'API key stored in plain text in CRM workflow',  app: 'CRM' },
  { id: 'F-002', rule: 'ANL-SQL-003', name: 'SELECT * used in Analytics production report',  app: 'Analytics' },
];

function Ring({ pct, size = 120 }) {
  const r = size * 0.42, stroke = size * 0.09;
  const circ = 2 * Math.PI * r;
  const offset = circ * (1 - pct / 100);
  const color = pct >= 85 ? '#10b981' : pct >= 70 ? '#f59e0b' : '#ef4444';
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#e5e7eb" strokeWidth={stroke} />
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={stroke}
        strokeDasharray={circ} strokeDashoffset={offset}
        strokeLinecap="round" transform={`rotate(-90 ${size/2} ${size/2})`}
        style={{ transition: 'stroke-dashoffset 1.2s ease' }} />
      <text x={size/2} y={size/2 - 6} textAnchor="middle" fontSize={size * 0.18} fontWeight="900" fill={color}>{pct}%</text>
      <text x={size/2} y={size/2 + 12} textAnchor="middle" fontSize={size * 0.09} fill="#9ca3af">Pass Rate</text>
    </svg>
  );
}

const SEV_COLOR = { CRITICAL: '#dc2626', HIGH: '#f59e0b', MEDIUM: '#3b82f6', LOW: '#10b981' };
const SEV_BG    = { CRITICAL: '#fef2f2', HIGH: '#fffbeb', MEDIUM: '#eff6ff', LOW: '#f0fdf4' };

export default function Dashboard() {
  const navigate = useNavigate();
  const [animated, setAnimated] = useState(false);
  useEffect(() => { const t = setTimeout(() => setAnimated(true), 150); return () => clearTimeout(t); }, []);

  return (
    <div style={{ width: '100%' }}>

      {/* ── Header ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 22 }}>
        <div>
          <h1 className="page-title">Compliance Dashboard</h1>
          <p className="page-sub">Last scan: {STATS.lastScan} · {STATS.scanType} · {STATS.totalRules} rules · Trend: <span style={{ color: '#10b981', fontWeight: 700 }}>{STATS.trend} ↑</span></p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn btn--secondary" onClick={() => navigate('/history')}>📈 History</button>
          <button className="btn btn--secondary" onClick={() => navigate('/findings')}>📋 Findings</button>
          <button className="btn btn--primary"   onClick={() => navigate('/scan')}>🔍 Run Scan</button>
        </div>
      </div>

      {/* ── Row 1: KPI Cards ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 14, marginBottom: 20 }}>
        {[
          { label: 'Total Rules',  value: STATS.totalRules, color: '#4f46e5', bg: '#fff', border: '#4f46e5' },
          { label: 'Rules Passed', value: STATS.passed,     color: '#10b981', bg: '#fff', border: '#10b981' },
          { label: 'Rules Failed', value: STATS.failed,     color: '#ef4444', bg: '#fff', border: '#ef4444' },
          { label: 'Warnings',     value: STATS.warned,     color: '#f59e0b', bg: '#fff', border: '#f59e0b' },
          { label: 'Critical',     value: STATS.critical,   color: '#dc2626', bg: '#fef2f2', border: '#dc2626' },
        ].map(k => (
          <div key={k.label} className="card" style={{ padding: '20px 18px', borderTop: `4px solid ${k.border}`, background: k.bg, position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: 12, right: 14, width: 8, height: 8, borderRadius: '50%', background: k.color, opacity: 0.4 }} />
            <div style={{ fontSize: 38, fontWeight: 900, color: k.color, lineHeight: 1, letterSpacing: '-1px' }}>{k.value}</div>
            <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 8, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.6px' }}>{k.label}</div>
            <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 3, background: `${k.color}22` }} />
          </div>
        ))}
      </div>

      {/* ── Row 2: Ring + Progress + Module Heatmap ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '200px 1fr', gap: 16, marginBottom: 16 }}>

        {/* Pass rate ring */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px 16px' }}>
          <Ring pct={animated ? STATS.passRate : 0} size={130} />
          <div style={{ marginTop: 14, textAlign: 'center' }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-2)' }}>Overall Score</div>
            <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 4 }}>{STATS.passed} of {STATS.totalRules} rules passed</div>
            <div style={{ marginTop: 10, padding: '4px 12px', background: '#d1fae5', borderRadius: 20, display: 'inline-block' }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: '#065f46' }}>Good ↑ {STATS.trend}</span>
            </div>
          </div>
        </div>

        {/* Module heatmap */}
        <div className="card" style={{ padding: '20px' }}>
          <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 16, display: 'flex', justifyContent: 'space-between' }}>
            <span>Application Compliance</span>
            <button className="btn btn--secondary btn--sm" onClick={() => navigate('/findings')}>View All →</button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 10 }}>
            {MODULES.map(m => {
              const bg = m.pct === 100 ? '#f0fdf4' : m.pct >= 85 ? '#eff6ff' : m.pct >= 75 ? '#fffbeb' : '#fef2f2';
              const border = m.pct === 100 ? '#bbf7d0' : m.pct >= 85 ? '#bfdbfe' : m.pct >= 75 ? '#fde68a' : '#fecaca';
              const textC = m.pct === 100 ? '#065f46' : m.pct >= 85 ? '#1e40af' : m.pct >= 75 ? '#92400e' : '#dc2626';
              return (
                <div key={m.name}
                  onClick={() => navigate('/findings')}
                  style={{ background: bg, border: `1px solid ${border}`, borderRadius: 10, padding: '14px 10px', textAlign: 'center', cursor: 'pointer', transition: 'transform .15s' }}
                  onMouseOver={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                  onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: m.color, margin: '0 auto 8px' }} />
                  <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-1)', marginBottom: 6 }}>{m.name}</div>
                  <div style={{ fontSize: 20, fontWeight: 900, color: textC }}>{m.pct}%</div>
                  <div style={{ fontSize: 9, color: 'var(--muted)', marginTop: 4 }}>{m.passed}/{m.rules} rules</div>
                  {m.critical > 0 && (
                    <div style={{ marginTop: 6, fontSize: 9, background: '#fee2e2', color: '#dc2626', padding: '2px 6px', borderRadius: 20, fontWeight: 700 }}>
                      {m.critical} critical
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Overall bar */}
          <div style={{ marginTop: 18, paddingTop: 16, borderTop: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
              <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-2)' }}>Overall Compliance</span>
              <span style={{ fontSize: 11, fontWeight: 800, color: '#10b981' }}>{STATS.passRate}% — Target: 90%</span>
            </div>
            <div className="progress-bar" style={{ height: 8 }}>
              <div className="progress-fill" style={{ width: animated ? `${STATS.passRate}%` : '0%' }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: 'var(--muted)', marginTop: 4 }}>
              <span>0%</span><span style={{ color: '#4f46e5', fontWeight: 700 }}>⬆ Target: 90%</span><span>100%</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Row 3: Top Violations + Category Breakdown + Activity ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 260px 260px', gap: 16, marginBottom: 16 }}>

        {/* Top violations */}
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '14px 18px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontWeight: 700, fontSize: 13 }}>Top Violations</span>
            <button className="btn btn--secondary btn--sm" onClick={() => navigate('/findings')}>All Findings →</button>
          </div>
          {TOP_VIOLATIONS.map((v, i) => (
            <div key={v.rule}
              onClick={() => navigate('/findings')}
              style={{ padding: '12px 18px', borderBottom: i < TOP_VIOLATIONS.length - 1 ? '1px solid var(--border)' : 'none', display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }}
              onMouseOver={e => e.currentTarget.style.background = '#f9fafb'}
              onMouseOut={e => e.currentTarget.style.background = 'transparent'}>
              <div style={{ width: 4, height: 36, borderRadius: 99, background: SEV_COLOR[v.sev], flexShrink: 0 }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-1)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{v.name}</div>
                <div style={{ fontSize: 10, color: 'var(--muted)', marginTop: 2 }}>
                  <code style={{ background: '#f3f4f6', padding: '1px 4px', borderRadius: 3 }}>{v.rule}</code>
                  &nbsp;· {v.app}
                </div>
              </div>
              <div style={{ textAlign: 'right', flexShrink: 0 }}>
                <span style={{ fontSize: 10, background: SEV_BG[v.sev], color: SEV_COLOR[v.sev], padding: '2px 7px', borderRadius: 20, fontWeight: 700 }}>{v.sev}</span>
                <div style={{ fontSize: 10, color: 'var(--muted)', marginTop: 4 }}>{v.count} instances</div>
              </div>
            </div>
          ))}
        </div>

        {/* Category breakdown */}
        <div className="card" style={{ padding: '16px' }}>
          <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 14 }}>By Category</div>
          {CATEGORY_BREAKDOWN.map(c => {
            const failPct = Math.round((c.failed / c.total) * 100);
            return (
              <div key={c.name} style={{ marginBottom: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-2)' }}>{c.name}</span>
                  <span style={{ fontSize: 10, color: c.failed > 0 ? '#ef4444' : '#10b981', fontWeight: 700 }}>
                    {c.failed > 0 ? `${c.failed} failed` : '✓ Clean'}
                  </span>
                </div>
                <div style={{ height: 6, background: '#f3f4f6', borderRadius: 99, overflow: 'hidden' }}>
                  <div style={{ width: `${((c.total - c.failed) / c.total) * 100}%`, height: '100%', background: c.color, borderRadius: 99 }} />
                </div>
                <div style={{ fontSize: 9, color: 'var(--muted)', marginTop: 3 }}>{c.total - c.failed}/{c.total} passing</div>
              </div>
            );
          })}
        </div>

        {/* Activity feed */}
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--border)' }}>
            <span style={{ fontWeight: 700, fontSize: 13 }}>Recent Activity</span>
          </div>
          <div style={{ padding: '8px 0' }}>
            {ACTIVITY.map((a, i) => (
              <div key={i} style={{ padding: '9px 16px', borderBottom: i < ACTIVITY.length - 1 ? '1px solid #f3f4f6' : 'none', display: 'flex', gap: 10 }}>
                <div style={{
                  width: 7, height: 7, borderRadius: '50%', marginTop: 5, flexShrink: 0,
                  background: a.type === 'success' ? '#10b981' : a.type === 'resolve' ? '#3b82f6' : '#9ca3af',
                }} />
                <div>
                  <div style={{ fontSize: 11, color: 'var(--text-2)', lineHeight: 1.4 }}>{a.msg}</div>
                  <div style={{ fontSize: 10, color: 'var(--light)', marginTop: 2 }}>{a.time}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Row 4: Open Criticals ── */}
      {CRITICALS.length > 0 && (
        <div className="card" style={{ padding: 0, overflow: 'hidden', border: '1px solid #fecaca' }}>
          <div style={{ padding: '12px 18px', background: '#fef2f2', borderBottom: '1px solid #fecaca', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontWeight: 700, fontSize: 13, color: '#dc2626' }}>🔴 Open Critical Findings — Requires Immediate Action</span>
            <button className="btn btn--sm" style={{ background: '#dc2626', color: '#fff', border: 'none' }} onClick={() => navigate('/findings')}>View All</button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)' }}>
            {CRITICALS.map((c, i) => (
              <div key={c.id}
                onClick={() => navigate(`/findings/${c.id}`)}
                style={{ padding: '14px 18px', borderRight: i === 0 ? '1px solid #fecaca' : 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 12 }}
                onMouseOver={e => e.currentTarget.style.background = '#fff5f5'}
                onMouseOut={e => e.currentTarget.style.background = 'transparent'}>
                <span style={{ fontSize: 24 }}>🔴</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-1)' }}>{c.name}</div>
                  <div style={{ fontSize: 10, color: 'var(--muted)', marginTop: 3 }}>
                    <code style={{ background: '#fee2e2', padding: '1px 5px', borderRadius: 3, color: '#dc2626' }}>{c.rule}</code>
                    &nbsp;· {c.app}
                  </div>
                </div>
                <span style={{ fontSize: 11, color: '#dc2626', fontWeight: 700, flexShrink: 0 }}>Fix Now →</span>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
