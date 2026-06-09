import React, { useState } from 'react';

const SCANS = [
  { id: 'SCN-000042', type: 'Full Scan',    apps: 'All 7', rules: 72, passed: 61, failed: 8,  warned: 3, critical: 2, passRate: 84, status: 'COMPLETED', date: '08 Jun 2026', time: '09:14', duration: '47s', by: 'Mutturaj' },
  { id: 'SCN-000041', type: 'Full Scan',    apps: 'All 7', rules: 72, passed: 58, failed: 10, warned: 4, critical: 3, passRate: 81, status: 'COMPLETED', date: '06 Jun 2026', time: '23:00', duration: '51s', by: 'Automated' },
  { id: 'SCN-000040', type: 'CRM Only',     apps: 'CRM',   rules: 16, passed: 13, failed: 2,  warned: 1, critical: 1, passRate: 81, status: 'COMPLETED', date: '05 Jun 2026', time: '14:22', duration: '12s', by: 'Mutturaj' },
  { id: 'SCN-000039', type: 'Full Scan',    apps: 'All 7', rules: 72, passed: 55, failed: 12, warned: 5, critical: 4, passRate: 76, status: 'COMPLETED', date: '03 Jun 2026', time: '23:00', duration: '49s', by: 'Automated' },
  { id: 'SCN-000038', type: 'Creator Only', apps: 'Creator',rules: 21,passed: 19, failed: 2,  warned: 0, critical: 0, passRate: 90, status: 'COMPLETED', date: '02 Jun 2026', time: '11:05', duration: '18s', by: 'Vivek J.' },
  { id: 'SCN-000037', type: 'Full Scan',    apps: 'All 7', rules: 72, passed: 52, failed: 14, warned: 6, critical: 3, passRate: 72, status: 'COMPLETED', date: '01 Jun 2026', time: '23:00', duration: '53s', by: 'Automated' },
  { id: 'SCN-000036', type: 'Full Scan',    apps: 'All 7', rules: 72, passed: 50, failed: 15, warned: 7, critical: 5, passRate: 69, status: 'COMPLETED', date: '30 May 2026', time: '23:00', duration: '58s', by: 'Automated' },
  { id: 'SCN-000035', type: 'Analytics',    apps: 'Analytics',rules:10,passed: 7, failed: 2,  warned: 1, critical: 1, passRate: 70, status: 'COMPLETED', date: '29 May 2026', time: '10:15', duration: '9s',  by: 'Mutturaj' },
  { id: 'SCN-000034', type: 'Full Scan',    apps: 'All 7', rules: 72, passed: 47, failed: 18, warned: 7, critical: 5, passRate: 65, status: 'COMPLETED', date: '27 May 2026', time: '23:00', duration: '61s', by: 'Automated' },
  { id: 'SCN-000033', type: 'Full Scan',    apps: 'All 7', rules: 72, passed: 44, failed: 20, warned: 8, critical: 6, passRate: 61, status: 'FAILED',    date: '25 May 2026', time: '23:00', duration: '—',   by: 'Automated' },
];

const FINDINGS_DEMO = {
  'SCN-000042': [
    { rule: 'CRM-SEC-001', name: 'API key in plain text',         sev: 'CRITICAL', status: 'FAIL', app: 'CRM'       },
    { rule: 'ANL-SQL-003', name: 'SELECT * in production report', sev: 'CRITICAL', status: 'FAIL', app: 'Analytics' },
    { rule: 'CRM-NAM-002', name: 'Module not PascalCase',         sev: 'HIGH',     status: 'FAIL', app: 'CRM'       },
    { rule: 'CRT-NAM-005', name: 'Field API name has spaces',     sev: 'HIGH',     status: 'FAIL', app: 'Creator'   },
    { rule: 'PEO-NAM-001', name: 'Dept name >30 chars',          sev: 'MEDIUM',   status: 'WARN', app: 'People'    },
  ],
};

const SEV_COLOR = { CRITICAL:'#dc2626', HIGH:'#f59e0b', MEDIUM:'#3b82f6', LOW:'#10b981' };
const SEV_BG    = { CRITICAL:'#fef2f2', HIGH:'#fffbeb', MEDIUM:'#eff6ff', LOW:'#f0fdf4' };

function ScoreBar({ pct }) {
  const color = pct >= 85 ? '#10b981' : pct >= 70 ? '#f59e0b' : '#ef4444';
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <div style={{ flex: 1, height: 6, background: '#e5e7eb', borderRadius: 99, overflow: 'hidden' }}>
        <div style={{ width: `${pct}%`, height: '100%', background: color, borderRadius: 99 }} />
      </div>
      <span style={{ fontSize: 11, fontWeight: 800, color, minWidth: 32 }}>{pct}%</span>
    </div>
  );
}

export default function History() {
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [popup, setPopup] = useState(null); // scan object

  const types = ['ALL', ...new Set(SCANS.map(s => s.type))];
  const filtered = SCANS.filter(s => typeFilter === 'ALL' || s.type === typeFilter);
  const latest = SCANS[0];
  const improvement = SCANS[0].passRate - SCANS[SCANS.length - 1].passRate;

  const findings = popup ? (FINDINGS_DEMO[popup.id] || []) : [];

  return (
    <div style={{ width: '100%' }}>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 22 }}>
        <div>
          <h1 className="page-title">Scan History</h1>
          <p className="page-sub">{SCANS.length} scans recorded · Compliance {improvement > 0 ? '▲' : '▼'} {Math.abs(improvement)}% over last 10 scans</p>
        </div>
      </div>

      {/* KPI row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 20 }}>
        {[
          { label: 'Total Scans',      value: SCANS.length,           color: '#4f46e5' },
          { label: 'Latest Pass Rate', value: latest.passRate + '%',  color: '#10b981' },
          { label: 'Improvement',      value: '+' + improvement + '%',color: '#10b981' },
          { label: 'Avg Duration',     value: '38s',                  color: '#6b7280' },
        ].map(k => (
          <div key={k.label} className="card" style={{ padding: '16px 20px' }}>
            <div style={{ fontSize: 28, fontWeight: 900, color: k.color }}>{k.value}</div>
            <div style={{ fontSize: 10, color: 'var(--muted)', marginTop: 5, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{k.label}</div>
          </div>
        ))}
      </div>

      {/* Visual scan timeline — card grid */}
      <div className="card" style={{ padding: '20px', marginBottom: 20 }}>
        <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 16 }}>Compliance Timeline</div>
        <div style={{ display: 'flex', gap: 6, alignItems: 'flex-end', height: 120, padding: '8px 0 0' }}>
          {SCANS.slice().reverse().map((s, i) => {
            const h = Math.round((s.passRate / 100) * 80);
            const color = s.passRate >= 85 ? '#10b981' : s.passRate >= 70 ? '#f59e0b' : '#ef4444';
            return (
              <div key={s.id}
                onClick={() => setPopup(s)}
                title={`${s.id} · ${s.date} · ${s.passRate}%`}
                style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', cursor: 'pointer', gap: 4 }}>
                <span style={{ fontSize: 9, color, fontWeight: 700 }}>{s.passRate}%</span>
                <div style={{
                  width: '100%', height: h, background: color,
                  borderRadius: '4px 4px 0 0',
                  opacity: 0.85, transition: 'all .15s',
                  boxShadow: `0 -2px 8px ${color}44`,
                }}
                  onMouseOver={e => e.currentTarget.style.opacity = '1'}
                  onMouseOut={e => e.currentTarget.style.opacity = '0.85'} />
                <span style={{ fontSize: 8, color: 'var(--muted)', writingMode: 'vertical-rl', transform: 'rotate(180deg)', height: 36, textAlign: 'center' }}>
                  {s.date.split(' ').slice(0, 2).join(' ')}
                </span>
              </div>
            );
          })}
        </div>
        <div style={{ marginTop: 8, fontSize: 10, color: 'var(--muted)', textAlign: 'center' }}>
          Click any bar to view scan details
        </div>
      </div>

      {/* Filter + table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)', display: 'flex', gap: 12, alignItems: 'center' }}>
          <span style={{ fontWeight: 700, fontSize: 13 }}>All Scans</span>
          <select className="form-control" style={{ width: 160, marginLeft: 'auto' }}
            value={typeFilter} onChange={e => setTypeFilter(e.target.value)}>
            {types.map(t => <option key={t}>{t === 'ALL' ? 'All Types' : t}</option>)}
          </select>
        </div>
        <table style={{ width: '100%' }}>
          <thead>
            <tr>
              <th>Session ID</th>
              <th>Type</th>
              <th>Applications</th>
              <th style={{ textAlign:'center' }}>Rules</th>
              <th style={{ textAlign:'center' }}>Pass</th>
              <th style={{ textAlign:'center' }}>Fail</th>
              <th style={{ textAlign:'center' }}>Critical</th>
              <th style={{ minWidth: 140 }}>Pass Rate</th>
              <th>Status</th>
              <th>Date</th>
              <th>By</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(s => (
              <tr key={s.id}>
                <td><code style={{ fontSize:11, background:'#f3f4f6', padding:'2px 6px', borderRadius:4 }}>{s.id}</code></td>
                <td style={{ fontSize:12, fontWeight:600 }}>{s.type}</td>
                <td style={{ fontSize:11, color:'var(--muted)' }}>{s.apps}</td>
                <td style={{ textAlign:'center', fontWeight:600 }}>{s.rules}</td>
                <td style={{ textAlign:'center', color:'#10b981', fontWeight:700 }}>{s.passed}</td>
                <td style={{ textAlign:'center', color: s.failed > 0 ? '#ef4444':'var(--muted)', fontWeight:700 }}>{s.failed}</td>
                <td style={{ textAlign:'center' }}>
                  {s.critical > 0
                    ? <span className="badge badge--critical">{s.critical}</span>
                    : <span style={{ color:'var(--muted)' }}>—</span>}
                </td>
                <td style={{ minWidth:140 }}><ScoreBar pct={s.passRate} /></td>
                <td>
                  <span style={{ fontSize:11, padding:'2px 8px', borderRadius:20, fontWeight:600,
                    background: s.status === 'COMPLETED' ? '#d1fae5' : '#fee2e2',
                    color: s.status === 'COMPLETED' ? '#065f46' : '#dc2626' }}>
                    {s.status}
                  </span>
                </td>
                <td style={{ fontSize:11, color:'var(--muted)', whiteSpace:'nowrap' }}>{s.date} · {s.time}</td>
                <td style={{ fontSize:11, color:'var(--muted)' }}>{s.by}</td>
                <td>
                  <button className="btn btn--secondary btn--sm" onClick={() => setPopup(s)}>View →</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ── Popup Modal ── */}
      {popup && (
        <div
          onClick={e => { if (e.target === e.currentTarget) setPopup(null); }}
          style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 1000, padding: 24,
          }}>
          <div style={{
            background: '#fff', borderRadius: 14, width: '100%', maxWidth: 680,
            maxHeight: '85vh', overflow: 'hidden', display: 'flex', flexDirection: 'column',
            boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
          }}>
            {/* Modal header */}
            <div style={{ padding: '18px 24px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
              <div>
                <div style={{ fontWeight: 800, fontSize: 15 }}>{popup.id}</div>
                <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 3 }}>{popup.type} · {popup.date} · {popup.time} · by {popup.by}</div>
              </div>
              <button onClick={() => setPopup(null)} style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: 'var(--muted)', lineHeight: 1 }}>✕</button>
            </div>

            {/* Modal stats */}
            <div style={{ padding: '16px 24px', borderBottom: '1px solid var(--border)', display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 10, flexShrink: 0 }}>
              {[
                { label: 'Rules',    value: popup.rules,            color: '#4f46e5' },
                { label: 'Passed',   value: popup.passed,           color: '#10b981' },
                { label: 'Failed',   value: popup.failed,           color: '#ef4444' },
                { label: 'Critical', value: popup.critical,         color: '#dc2626' },
                { label: 'Pass Rate',value: popup.passRate + '%',   color: popup.passRate >= 80 ? '#10b981' : '#f59e0b' },
              ].map(k => (
                <div key={k.label} style={{ textAlign: 'center', padding: '10px', background: '#f9fafb', borderRadius: 8 }}>
                  <div style={{ fontSize: 22, fontWeight: 900, color: k.color }}>{k.value}</div>
                  <div style={{ fontSize: 10, color: 'var(--muted)', marginTop: 3, fontWeight: 700, textTransform: 'uppercase' }}>{k.label}</div>
                </div>
              ))}
            </div>

            {/* Modal findings */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '16px 24px' }}>
              <div style={{ fontWeight: 700, fontSize: 12, marginBottom: 12, color: 'var(--text-2)' }}>
                {findings.length > 0 ? 'Key Findings' : 'No detailed findings in demo for this scan'}
              </div>
              {findings.map((f, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', background: '#f9fafb', borderRadius: 8, marginBottom: 8, borderLeft: `3px solid ${SEV_COLOR[f.sev]}` }}>
                  <span style={{ fontSize: 10, background: SEV_BG[f.sev], color: SEV_COLOR[f.sev], padding: '2px 7px', borderRadius: 20, fontWeight: 700, flexShrink: 0 }}>{f.sev}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 12, fontWeight: 700 }}>{f.name}</div>
                    <div style={{ fontSize: 10, color: 'var(--muted)', marginTop: 2 }}>
                      <code style={{ background: '#e5e7eb', padding: '1px 4px', borderRadius: 3 }}>{f.rule}</code>
                      &nbsp;· {f.app}
                    </div>
                  </div>
                  <span style={{ fontSize: 10, background: f.status === 'FAIL' ? '#fee2e2' : '#fffbeb', color: f.status === 'FAIL' ? '#dc2626' : '#92400e', padding: '2px 7px', borderRadius: 20, fontWeight: 700, flexShrink: 0 }}>
                    {f.status}
                  </span>
                </div>
              ))}
            </div>

            {/* Modal footer */}
            <div style={{ padding: '14px 24px', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'flex-end', gap: 10, flexShrink: 0 }}>
              <button className="btn btn--secondary" onClick={() => setPopup(null)}>Close</button>
              <button className="btn btn--primary" onClick={() => setPopup(null)}>📋 Open Full Findings</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
