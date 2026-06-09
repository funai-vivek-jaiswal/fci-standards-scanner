import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SeverityBadge from '../components/SeverityBadge';

const DEMO_FINDINGS = [
  { id:'F-001', rule:'CRM-SEC-001', name:'API key stored in plain text in CRM workflow',   app:'CRM',      severity:'CRITICAL', status:'FAIL', category:'Security',    source:'CRM Workflow: Lead_Auto_Assign',      date:'08 Jun 2026' },
  { id:'F-002', rule:'ANL-SQL-003', name:'SELECT * used in Analytics production report',   app:'Analytics', severity:'CRITICAL', status:'FAIL', category:'SQL',         source:'Report: Monthly_Revenue',            date:'08 Jun 2026' },
  { id:'F-003', rule:'CRM-NAM-002', name:'Custom module name does not follow PascalCase',  app:'CRM',      severity:'HIGH',     status:'FAIL', category:'Naming',       source:'Module: client_feedback',            date:'08 Jun 2026' },
  { id:'F-004', rule:'CRT-NAM-005', name:'Creator form field uses spaces in API name',     app:'Creator',  severity:'HIGH',     status:'FAIL', category:'Naming',       source:'Form: Employee_Onboarding',          date:'08 Jun 2026' },
  { id:'F-005', rule:'CRM-API-003', name:'Workflow makes >50 API calls per execution',    app:'CRM',      severity:'HIGH',     status:'FAIL', category:'API Limits',   source:'Workflow: Bulk_Lead_Import',         date:'08 Jun 2026' },
  { id:'F-006', rule:'ANL-SQL-001', name:'Sub-query nesting depth exceeds 2 levels',      app:'Analytics', severity:'HIGH',     status:'FAIL', category:'SQL',         source:'Report: Pipeline_Analysis',          date:'08 Jun 2026' },
  { id:'F-007', rule:'PEO-NAM-001', name:'Department name exceeds 30 character limit',    app:'People',   severity:'MEDIUM',   status:'WARN', category:'Naming',       source:'Dept: Software_Engineering_India',   date:'08 Jun 2026' },
  { id:'F-008', rule:'CRT-SEC-002', name:'Creator function has no error handling block',  app:'Creator',  severity:'MEDIUM',   status:'WARN', category:'Security',     source:'Function: CRT_FetchData_fn',         date:'08 Jun 2026' },
  { id:'F-009', rule:'RCT-NAM-003', name:'Recruit pipeline stage name not in Title Case', app:'Recruit',  severity:'LOW',      status:'FAIL', category:'Naming',       source:'Stage: technical screening',         date:'08 Jun 2026' },
  { id:'F-010', rule:'CRT-NAM-001', name:'Deluge function name not following convention', app:'Creator',  severity:'MEDIUM',   status:'PASS', category:'Naming',       source:'Function: getData',                  date:'08 Jun 2026' },
  { id:'F-011', rule:'CRM-NAM-005', name:'CRM field label missing application prefix',    app:'CRM',      severity:'LOW',      status:'PASS', category:'Naming',       source:'Field: Contact: phone_alt',          date:'08 Jun 2026' },
  { id:'F-012', rule:'SGM-PERF-001',name:'Sigma widget JS bundle under 500KB limit',     app:'Sigma',    severity:'LOW',      status:'PASS', category:'Performance',  source:'Widget: DashboardWidget.zip',        date:'08 Jun 2026' },
];

const SEV_ORDER   = { CRITICAL:0, HIGH:1, MEDIUM:2, LOW:3 };
const LEFT_COLOR  = { CRITICAL:'#dc2626', HIGH:'#ef4444', MEDIUM:'#f59e0b', LOW:'#10b981', PASS:'#10b981', WARN:'#f59e0b', FAIL:'#ef4444' };

export default function Findings() {
  const navigate = useNavigate();
  const [appFilter,  setAppFilter]  = useState('ALL');
  const [sevFilter,  setSevFilter]  = useState('ALL');
  const [statFilter, setStatFilter] = useState('ALL');
  const [catFilter,  setCatFilter]  = useState('ALL');
  const [search,     setSearch]     = useState('');
  const [selected,   setSelected]   = useState([]);

  const apps    = ['ALL', ...new Set(DEMO_FINDINGS.map(f => f.app))];
  const cats    = ['ALL', ...new Set(DEMO_FINDINGS.map(f => f.category))];
  const sevs    = ['ALL','CRITICAL','HIGH','MEDIUM','LOW'];
  const statuses= ['ALL','FAIL','WARN','PASS'];

  const filtered = DEMO_FINDINGS
    .filter(f => appFilter  === 'ALL' || f.app      === appFilter)
    .filter(f => sevFilter  === 'ALL' || f.severity === sevFilter)
    .filter(f => statFilter === 'ALL' || f.status   === statFilter)
    .filter(f => catFilter  === 'ALL' || f.category === catFilter)
    .filter(f => !search    || f.name.toLowerCase().includes(search.toLowerCase())
                            || f.rule.toLowerCase().includes(search.toLowerCase())
                            || f.source.toLowerCase().includes(search.toLowerCase()))
    .sort((a,b) => SEV_ORDER[a.severity] - SEV_ORDER[b.severity]);

  const counts = { FAIL:0, WARN:0, PASS:0, CRITICAL:0 };
  DEMO_FINDINGS.forEach(f => {
    if (f.status in counts) counts[f.status]++;
    if (f.severity === 'CRITICAL') counts.CRITICAL++;
  });

  function toggleSelect(id) {
    setSelected(p => p.includes(id) ? p.filter(x => x !== id) : [...p, id]);
  }

  function selectAll() {
    setSelected(filtered.map(f => f.id));
  }

  function clearSelection() { setSelected([]); }

  function exportCSV() {
    const header = 'Rule ID,Finding,Application,Category,Severity,Status,Source,Date';
    const rows = filtered.map(f =>
      `${f.rule},"${f.name}",${f.app},${f.category},${f.severity},${f.status},"${f.source}",${f.date}`
    );
    const csv = [header, ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'fci_findings_export.csv'; a.click();
  }

  const clearFilters = () => { setAppFilter('ALL'); setSevFilter('ALL'); setStatFilter('ALL'); setCatFilter('ALL'); setSearch(''); };
  const hasFilters = appFilter !== 'ALL' || sevFilter !== 'ALL' || statFilter !== 'ALL' || catFilter !== 'ALL' || search;

  return (
    <div style={{ width: '100%' }}>

      {/* Header */}
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:20 }}>
        <div>
          <h1 className="page-title">Findings</h1>
          <p className="page-sub">Scan: SCN-000042 · Full Scan · 08 Jun 2026 · 72 rules checked</p>
        </div>
        <div style={{ display:'flex', gap:10 }}>
          <button className="btn btn--secondary btn--sm" onClick={exportCSV}>⬇ Export CSV</button>
          <button className="btn btn--primary btn--sm" onClick={() => navigate('/scan')}>🔍 New Scan</button>
        </div>
      </div>

      {/* Summary chips */}
      <div style={{ display:'flex', gap:10, marginBottom:18, flexWrap:'wrap' }}>
        {[
          { label:'Critical', val:counts.CRITICAL,           color:'#dc2626', bg:'#fef2f2', f:() => { setSevFilter('CRITICAL'); setStatFilter('ALL'); } },
          { label:'Failed',   val:counts.FAIL,               color:'#ef4444', bg:'#fff1f1', f:() => { setStatFilter('FAIL'); setSevFilter('ALL'); } },
          { label:'Warned',   val:counts.WARN,               color:'#f59e0b', bg:'#fffbeb', f:() => { setStatFilter('WARN'); setSevFilter('ALL'); } },
          { label:'Passed',   val:counts.PASS,               color:'#10b981', bg:'#f0fdf4', f:() => { setStatFilter('PASS'); setSevFilter('ALL'); } },
          { label:'Total',    val:DEMO_FINDINGS.length,      color:'#4f46e5', bg:'#eef2ff', f:clearFilters },
        ].map(c => (
          <div key={c.label} onClick={c.f}
            style={{ padding:'10px 18px', borderRadius:9, background:c.bg, cursor:'pointer', border:`1px solid ${c.color}22`, transition:'transform .1s' }}
            onMouseOver={e => e.currentTarget.style.transform='scale(1.04)'}
            onMouseOut={e => e.currentTarget.style.transform='scale(1)'}>
            <div style={{ fontSize:22, fontWeight:900, color:c.color, lineHeight:1 }}>{c.val}</div>
            <div style={{ fontSize:9, fontWeight:700, color:c.color, textTransform:'uppercase', letterSpacing:'0.5px', marginTop:4 }}>{c.label}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="card" style={{ padding:'12px 16px', marginBottom:16, display:'flex', gap:10, flexWrap:'wrap', alignItems:'center' }}>
        <input className="form-control" style={{ width:240 }} placeholder="🔍  Search rule, finding, source…"
          value={search} onChange={e => setSearch(e.target.value)} />
        <select className="form-control" style={{ width:160 }} value={appFilter} onChange={e => setAppFilter(e.target.value)}>
          <option value="ALL">All Applications</option>
          {apps.filter(a => a !== 'ALL').map(a => <option key={a}>{a}</option>)}
        </select>
        <select className="form-control" style={{ width:140 }} value={catFilter} onChange={e => setCatFilter(e.target.value)}>
          <option value="ALL">All Categories</option>
          {cats.filter(c => c !== 'ALL').map(c => <option key={c}>{c}</option>)}
        </select>
        <select className="form-control" style={{ width:140 }} value={sevFilter} onChange={e => setSevFilter(e.target.value)}>
          <option value="ALL">All Severities</option>
          {sevs.filter(s => s !== 'ALL').map(s => <option key={s}>{s}</option>)}
        </select>
        <select className="form-control" style={{ width:130 }} value={statFilter} onChange={e => setStatFilter(e.target.value)}>
          <option value="ALL">All Statuses</option>
          {statuses.filter(s => s !== 'ALL').map(s => <option key={s}>{s}</option>)}
        </select>
        <div style={{ marginLeft:'auto', display:'flex', alignItems:'center', gap:10 }}>
          <span style={{ fontSize:11, color:'var(--muted)', fontWeight:600 }}>
            {filtered.length} of {DEMO_FINDINGS.length}
          </span>
          {hasFilters && (
            <button className="btn btn--secondary btn--sm" onClick={clearFilters}>✕ Clear</button>
          )}
        </div>
      </div>

      {/* Bulk action bar */}
      {selected.length > 0 && (
        <div style={{ padding:'10px 16px', background:'#eef2ff', borderRadius:9, marginBottom:14, display:'flex', alignItems:'center', gap:14, border:'1px solid #c7d2fe' }}>
          <span style={{ fontSize:12, fontWeight:700, color:'var(--primary)' }}>{selected.length} finding(s) selected</span>
          <button className="btn btn--sm" style={{ background:'#10b981', color:'#fff', border:'none' }}>✅ Mark Resolved</button>
          <button className="btn btn--sm" style={{ background:'#6b7280', color:'#fff', border:'none' }}>⏭ Skip All</button>
          <button className="btn btn--secondary btn--sm" onClick={clearSelection}>✕ Clear Selection</button>
        </div>
      )}

      {/* Table */}
      <div className="card" style={{ padding:0, overflow:'hidden' }}>
        <table style={{ width:'100%' }}>
          <thead>
            <tr>
              <th style={{ width:36, padding:'9px 12px' }}>
                <input type="checkbox"
                  checked={selected.length === filtered.length && filtered.length > 0}
                  onChange={() => selected.length === filtered.length ? clearSelection() : selectAll()}
                  style={{ cursor:'pointer', accentColor:'var(--primary)' }} />
              </th>
              <th style={{ width:4, padding:0 }}></th>
              <th>Rule ID</th>
              <th>Finding</th>
              <th>Application</th>
              <th>Category</th>
              <th>Severity</th>
              <th>Status</th>
              <th>Source Record</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr><td colSpan={10}><div className="empty"><div className="empty-icon">🔍</div>No findings match your filters</div></td></tr>
            )}
            {filtered.map(f => {
              const lc = LEFT_COLOR[f.severity === 'CRITICAL' ? 'CRITICAL' : f.status] || '#e5e7eb';
              const isSel = selected.includes(f.id);
              return (
                <tr key={f.id} style={{ cursor:'pointer', background: isSel ? '#f5f3ff' : 'transparent' }}>
                  <td style={{ padding:'9px 12px' }} onClick={e => e.stopPropagation()}>
                    <input type="checkbox" checked={isSel} onChange={() => toggleSelect(f.id)}
                      style={{ cursor:'pointer', accentColor:'var(--primary)' }} />
                  </td>
                  <td style={{ width:4, padding:0, background:lc }} />
                  <td onClick={() => navigate(`/findings/${f.id}`)}>
                    <code style={{ fontSize:11, background:'#f3f4f6', padding:'2px 6px', borderRadius:4 }}>{f.rule}</code>
                  </td>
                  <td onClick={() => navigate(`/findings/${f.id}`)} style={{ maxWidth:280 }}>
                    <div style={{ fontWeight:600, fontSize:12 }}>{f.name}</div>
                  </td>
                  <td onClick={() => navigate(`/findings/${f.id}`)}>
                    <span style={{ fontSize:11, background:'#eef2ff', color:'#4338ca', padding:'2px 8px', borderRadius:20, fontWeight:600 }}>{f.app}</span>
                  </td>
                  <td style={{ fontSize:11, color:'var(--muted)' }} onClick={() => navigate(`/findings/${f.id}`)}>
                    {f.category}
                  </td>
                  <td onClick={() => navigate(`/findings/${f.id}`)}>
                    <SeverityBadge value={f.severity} />
                  </td>
                  <td onClick={() => navigate(`/findings/${f.id}`)}>
                    <SeverityBadge value={f.status} />
                  </td>
                  <td style={{ fontSize:11, color:'var(--muted)', maxWidth:180, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}
                    onClick={() => navigate(`/findings/${f.id}`)}>
                    {f.source}
                  </td>
                  <td>
                    <button className="btn btn--secondary btn--sm" onClick={() => navigate(`/findings/${f.id}`)}>
                      View →
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Footer summary */}
      <div style={{ marginTop:14, display:'flex', justifyContent:'space-between', fontSize:11, color:'var(--muted)' }}>
        <span>Showing {filtered.length} of {DEMO_FINDINGS.length} findings · Scan session SCN-000042</span>
        <span>
          {DEMO_FINDINGS.filter(f=>f.status==='FAIL').length} to fix · {DEMO_FINDINGS.filter(f=>f.status==='WARN').length} to review · {DEMO_FINDINGS.filter(f=>f.status==='PASS').length} passing
        </span>
      </div>
    </div>
  );
}
