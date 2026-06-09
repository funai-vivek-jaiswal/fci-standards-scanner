import React, { useState } from 'react';
import SeverityBadge from '../components/SeverityBadge';

const APPS = ['CRM','Creator','People','Analytics','Sigma','Recruit','Forms','Catalyst'];
const APP_COLORS = {
  CRM:'#e8271e', Creator:'#ff6b2b', People:'#0077b6',
  Analytics:'#00a86b', Sigma:'#7b2ff7', Recruit:'#f4720b',
  Forms:'#28a745', Catalyst:'#1a73e8',
};
const CATEGORIES = ['Naming','Security','API Limits','SQL','Performance','Structure','Access Control','Other'];
const SEVERITIES  = ['CRITICAL','HIGH','MEDIUM','LOW'];

let NEXT_ID = 16;
function genId(app) {
  const prefix = { CRM:'CRM', Creator:'CRT', People:'PEO', Analytics:'ANL', Sigma:'SGM', Recruit:'RCT', Forms:'FRM', Catalyst:'CAT' }[app] || 'GEN';
  NEXT_ID++;
  return `${prefix}-${String(NEXT_ID).padStart(3,'0')}`;
}

const INIT_RULES = [
  { id:'CRM-SEC-001', name:'No plain-text API keys in workflows',    app:'CRM',      category:'Security',     severity:'CRITICAL', source:'04_Zoho_CRM_Standards §5.2',       enabled:true  },
  { id:'CRM-NAM-001', name:'Module names must be PascalCase',        app:'CRM',      category:'Naming',       severity:'HIGH',     source:'04_Zoho_CRM_Standards §2.1',       enabled:true  },
  { id:'CRM-NAM-002', name:'Field API names use snake_case only',    app:'CRM',      category:'Naming',       severity:'HIGH',     source:'04_Zoho_CRM_Standards §2.3',       enabled:true  },
  { id:'CRM-API-001', name:'Max 50 API calls per workflow',          app:'CRM',      category:'API Limits',   severity:'HIGH',     source:'04_Zoho_CRM_Standards §6.1',       enabled:true  },
  { id:'CRT-NAM-001', name:'Deluge functions follow Module_Name_fn', app:'Creator',  category:'Naming',       severity:'HIGH',     source:'02_Zoho_Creator_Standards §3.1',   enabled:true  },
  { id:'CRT-NAM-005', name:'Form field API names have no spaces',    app:'Creator',  category:'Naming',       severity:'HIGH',     source:'02_Zoho_Creator_Standards §3.4',   enabled:true  },
  { id:'CRT-SEC-001', name:'All functions have try-catch blocks',    app:'Creator',  category:'Security',     severity:'MEDIUM',   source:'02_Zoho_Creator_Standards §5.1',   enabled:true  },
  { id:'CRT-PERF-001',name:'Widgets use lazy loading for data',      app:'Creator',  category:'Performance',  severity:'MEDIUM',   source:'02_Zoho_Creator_Standards §7.2',   enabled:true  },
  { id:'ANL-SQL-001', name:'No SELECT * in production reports',      app:'Analytics',category:'SQL',          severity:'CRITICAL', source:'08_Zoho_Analytics_Standards §3.1', enabled:true  },
  { id:'ANL-SQL-003', name:'Sub-query depth ≤ 2 levels',            app:'Analytics',category:'SQL',          severity:'HIGH',     source:'08_Zoho_Analytics_Standards §3.3', enabled:true  },
  { id:'PEO-NAM-001', name:'Department names ≤ 30 characters',      app:'People',   category:'Naming',       severity:'MEDIUM',   source:'05_Zoho_People_Standards §2.1',    enabled:true  },
  { id:'SGM-PERF-001',name:'Widget JS bundle under 500KB',           app:'Sigma',    category:'Performance',  severity:'HIGH',     source:'03_Zoho_Sigma_Standards §4.1',     enabled:true  },
  { id:'RCT-NAM-001', name:'Pipeline stage names use Title Case',   app:'Recruit',  category:'Naming',       severity:'LOW',      source:'06_Zoho_Recruit_Standards §2.1',   enabled:true  },
  { id:'FRM-SEC-001', name:'Public forms must have CAPTCHA enabled', app:'Forms',    category:'Security',     severity:'HIGH',     source:'07_Zoho_Forms_Standards §4.2',     enabled:false },
  { id:'CAT-STR-001', name:'Functions under 500 lines of code',      app:'Catalyst', category:'Structure',    severity:'MEDIUM',   source:'01_Zoho_Catalyst_Standards §3.1',  enabled:true  },
];

function Toggle({ on, onChange }) {
  return (
    <div onClick={onChange} style={{
      width: 40, height: 22, borderRadius: 99, cursor: 'pointer', flexShrink: 0,
      background: on ? '#4f46e5' : '#d1d5db', position: 'relative', transition: 'background .2s',
    }}>
      <div style={{
        position: 'absolute', top: 3, left: on ? 21 : 3,
        width: 16, height: 16, borderRadius: '50%', background: '#fff',
        transition: 'left .2s', boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
      }} />
    </div>
  );
}

function RuleCard({ rule, onToggle, onSave }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState({ ...rule });
  const ac = APP_COLORS[rule.app] || '#6b7280';
  const SEV_BG = { CRITICAL:'#fef2f2', HIGH:'#fffbeb', MEDIUM:'#eff6ff', LOW:'#f0fdf4' };
  const SEV_C  = { CRITICAL:'#dc2626', HIGH:'#92400e', MEDIUM:'#1e40af', LOW:'#065f46' };

  function save() { onSave(draft); setEditing(false); }
  function cancel() { setDraft({ ...rule }); setEditing(false); }

  return (
    <div className="card" style={{ padding: 0, overflow: 'hidden', opacity: rule.enabled ? 1 : 0.6, transition: 'opacity .2s' }}>
      {/* Card top bar */}
      <div style={{ height: 4, background: ac }} />

      <div style={{ padding: '14px 16px' }}>
        {/* Top row */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <code style={{ fontSize: 10, background: '#f3f4f6', padding: '2px 6px', borderRadius: 4, color: 'var(--text-2)', display: 'inline-block', marginBottom: 6 }}>{rule.id}</code>
            {editing ? (
              <input
                style={{ display: 'block', width: '100%', padding: '6px 8px', border: '1px solid #c7d2fe', borderRadius: 6, fontSize: 13, fontWeight: 700, marginBottom: 4 }}
                value={draft.name}
                onChange={e => setDraft(p => ({ ...p, name: e.target.value }))}
              />
            ) : (
              <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-1)', lineHeight: 1.3 }}>{rule.name}</div>
            )}
          </div>
          <Toggle on={rule.enabled} onChange={onToggle} />
        </div>

        {/* Tags */}
        {!editing ? (
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 12 }}>
            <span style={{ fontSize: 10, background: ac + '18', color: ac, padding: '2px 8px', borderRadius: 20, fontWeight: 700 }}>{rule.app}</span>
            <span style={{ fontSize: 10, background: '#f3f4f6', color: 'var(--text-2)', padding: '2px 8px', borderRadius: 20, fontWeight: 600 }}>{rule.category}</span>
            <span style={{ fontSize: 10, background: SEV_BG[rule.severity], color: SEV_C[rule.severity], padding: '2px 8px', borderRadius: 20, fontWeight: 700 }}>{rule.severity}</span>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginBottom: 12 }}>
            <div>
              <div style={{ fontSize: 10, fontWeight: 600, color: 'var(--muted)', marginBottom: 4 }}>Application</div>
              <select style={{ width:'100%', padding:'5px 8px', border:'1px solid var(--border)', borderRadius:6, fontSize:11 }}
                value={draft.app} onChange={e => setDraft(p => ({ ...p, app: e.target.value }))}>
                {APPS.map(a => <option key={a}>{a}</option>)}
              </select>
            </div>
            <div>
              <div style={{ fontSize: 10, fontWeight: 600, color: 'var(--muted)', marginBottom: 4 }}>Category</div>
              <select style={{ width:'100%', padding:'5px 8px', border:'1px solid var(--border)', borderRadius:6, fontSize:11 }}
                value={draft.category} onChange={e => setDraft(p => ({ ...p, category: e.target.value }))}>
                {CATEGORIES.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <div style={{ fontSize: 10, fontWeight: 600, color: 'var(--muted)', marginBottom: 4 }}>Severity</div>
              <select style={{ width:'100%', padding:'5px 8px', border:'1px solid var(--border)', borderRadius:6, fontSize:11 }}
                value={draft.severity} onChange={e => setDraft(p => ({ ...p, severity: e.target.value }))}>
                {SEVERITIES.map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
          </div>
        )}

        {/* Source */}
        <div style={{ fontSize: 10, color: 'var(--muted)', marginBottom: 12 }}>
          {editing ? (
            <input
              style={{ width:'100%', padding:'5px 8px', border:'1px solid var(--border)', borderRadius:6, fontSize:11 }}
              placeholder="e.g. 04_Zoho_CRM_Standards §2.1"
              value={draft.source}
              onChange={e => setDraft(p => ({ ...p, source: e.target.value }))}
            />
          ) : (
            <span>📚 <span style={{ color: 'var(--primary)' }}>{rule.source}</span></span>
          )}
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: 8, borderTop: '1px solid #f3f4f6', paddingTop: 10 }}>
          {editing ? (
            <>
              <button onClick={save}   style={{ flex:1, padding:'6px', background:'#4f46e5', color:'#fff', border:'none', borderRadius:6, fontSize:11, fontWeight:700, cursor:'pointer' }}>Save</button>
              <button onClick={cancel} style={{ flex:1, padding:'6px', background:'#f3f4f6', color:'var(--text-2)', border:'none', borderRadius:6, fontSize:11, cursor:'pointer' }}>Cancel</button>
            </>
          ) : (
            <button onClick={() => setEditing(true)} style={{ padding:'5px 14px', background:'#f3f4f6', color:'var(--text-2)', border:'none', borderRadius:6, fontSize:11, fontWeight:600, cursor:'pointer' }}>
              ✏️ Edit
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default function Rules() {
  const [rules, setRules] = useState(INIT_RULES);
  const [appFilter, setAppFilter]  = useState('ALL');
  const [sevFilter, setSevFilter]  = useState('ALL');
  const [catFilter, setCatFilter]  = useState('ALL');
  const [search, setSearch]        = useState('');
  const [showAdd, setShowAdd]      = useState(false);
  const [newRule, setNewRule]      = useState({ name:'', app:'CRM', category:'Naming', severity:'HIGH', source:'', catOther:'' });

  const cats = ['ALL', ...CATEGORIES];

  const filtered = rules
    .filter(r => appFilter === 'ALL' || r.app      === appFilter)
    .filter(r => sevFilter === 'ALL' || r.severity === sevFilter)
    .filter(r => catFilter === 'ALL' || r.category === catFilter)
    .filter(r => !search   || r.name.toLowerCase().includes(search.toLowerCase()) || r.id.toLowerCase().includes(search.toLowerCase()));

  function toggleRule(id) {
    setRules(prev => prev.map(r => r.id === id ? { ...r, enabled: !r.enabled } : r));
  }

  function saveRule(updated) {
    setRules(prev => prev.map(r => r.id === updated.id ? { ...r, ...updated } : r));
  }

  function addRule() {
    if (!newRule.name.trim()) return;
    const finalCat = newRule.category === 'Other' ? newRule.catOther || 'Other' : newRule.category;
    const id = genId(newRule.app);
    setRules(prev => [...prev, { id, name: newRule.name, app: newRule.app, category: finalCat, severity: newRule.severity, source: newRule.source, enabled: true }]);
    setShowAdd(false);
    setNewRule({ name:'', app:'CRM', category:'Naming', severity:'HIGH', source:'', catOther:'' });
  }

  const enabled  = rules.filter(r => r.enabled).length;

  return (
    <div style={{ width: '100%' }}>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 22 }}>
        <div>
          <h1 className="page-title">Rules Repository</h1>
          <p className="page-sub">{rules.length} rules shown · {enabled} enabled · {rules.length - enabled} disabled · <span style={{ color: 'var(--primary)', fontWeight: 600 }}>72 total seeded in Catalyst DataStore</span></p>
        </div>
        <button className="btn btn--primary" onClick={() => setShowAdd(true)}>+ Add Rule</button>
      </div>

      {/* Summary chips */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 18, flexWrap: 'wrap' }}>
        {[
          { label:'Total',    val: rules.length,                             color:'#4f46e5', bg:'#eef2ff' },
          { label:'Enabled',  val: enabled,                                  color:'#10b981', bg:'#f0fdf4' },
          { label:'Disabled', val: rules.length - enabled,                  color:'#6b7280', bg:'#f9fafb' },
          { label:'Critical', val: rules.filter(r=>r.severity==='CRITICAL').length, color:'#dc2626', bg:'#fef2f2' },
          { label:'High',     val: rules.filter(r=>r.severity==='HIGH').length,     color:'#f59e0b', bg:'#fffbeb' },
        ].map(c => (
          <div key={c.label} style={{ padding:'8px 16px', borderRadius:8, background:c.bg, border:`1px solid ${c.color}22` }}>
            <div style={{ fontSize:20, fontWeight:900, color:c.color }}>{c.val}</div>
            <div style={{ fontSize:10, fontWeight:700, color:c.color, textTransform:'uppercase', letterSpacing:'0.4px' }}>{c.label}</div>
          </div>
        ))}
      </div>

      {/* Add Rule panel */}
      {showAdd && (
        <div className="card" style={{ marginBottom: 20, border:'2px solid #4f46e5' }}>
          <div style={{ fontWeight:700, fontSize:14, marginBottom:16, color:'var(--primary)' }}>➕ Add New Rule</div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14, marginBottom:14 }}>
            <div>
              <label style={{ fontSize:11, fontWeight:700, color:'var(--text-2)', display:'block', marginBottom:6 }}>Rule Name *</label>
              <input className="form-control" placeholder="e.g. Module names must be PascalCase"
                value={newRule.name} onChange={e => setNewRule(p => ({ ...p, name:e.target.value }))} />
            </div>
            <div>
              <label style={{ fontSize:11, fontWeight:700, color:'var(--text-2)', display:'block', marginBottom:6 }}>Application *</label>
              <select className="form-control" value={newRule.app} onChange={e => setNewRule(p => ({ ...p, app:e.target.value }))}>
                {APPS.map(a => <option key={a}>{a}</option>)}
              </select>
            </div>
            <div>
              <label style={{ fontSize:11, fontWeight:700, color:'var(--text-2)', display:'block', marginBottom:6 }}>Category *</label>
              <select className="form-control" value={newRule.category} onChange={e => setNewRule(p => ({ ...p, category:e.target.value }))}>
                {CATEGORIES.map(c => <option key={c}>{c}</option>)}
              </select>
              {newRule.category === 'Other' && (
                <input className="form-control" style={{ marginTop:8 }} placeholder="Specify category name"
                  value={newRule.catOther} onChange={e => setNewRule(p => ({ ...p, catOther:e.target.value }))} />
              )}
            </div>
            <div>
              <label style={{ fontSize:11, fontWeight:700, color:'var(--text-2)', display:'block', marginBottom:6 }}>Severity *</label>
              <select className="form-control" value={newRule.severity} onChange={e => setNewRule(p => ({ ...p, severity:e.target.value }))}>
                {SEVERITIES.map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div style={{ gridColumn:'1 / -1' }}>
              <label style={{ fontSize:11, fontWeight:700, color:'var(--text-2)', display:'block', marginBottom:6 }}>
                Standard Source
                <span style={{ fontSize:10, color:'var(--muted)', fontWeight:400, marginLeft:8 }}>Reference the exact doc + section, e.g. <code>04_Zoho_CRM_Standards §2.1</code></span>
              </label>
              <input className="form-control" placeholder="04_Zoho_CRM_Standards §2.1"
                value={newRule.source} onChange={e => setNewRule(p => ({ ...p, source:e.target.value }))} />
            </div>
          </div>
          <div style={{ padding:'12px 16px', background:'#f0f9ff', borderRadius:8, marginBottom:14, fontSize:11, color:'#0369a1' }}>
            <strong>ℹ️ Rule ID will be auto-generated</strong> based on the selected Application in incremental order (e.g. CRM-017, CRT-008).
          </div>
          <div style={{ display:'flex', gap:10 }}>
            <button className="btn btn--primary" onClick={addRule}>Save Rule</button>
            <button className="btn btn--secondary" onClick={() => setShowAdd(false)}>Cancel</button>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="card" style={{ padding:'12px 16px', marginBottom:18, display:'flex', gap:10, flexWrap:'wrap', alignItems:'center' }}>
        <input className="form-control" style={{ width:220 }} placeholder="🔍  Search rules…"
          value={search} onChange={e => setSearch(e.target.value)} />
        <select className="form-control" style={{ width:140 }} value={appFilter} onChange={e => setAppFilter(e.target.value)}>
          <option value="ALL">All Applications</option>
          {APPS.map(a => <option key={a}>{a}</option>)}
        </select>
        <select className="form-control" style={{ width:140 }} value={catFilter} onChange={e => setCatFilter(e.target.value)}>
          {cats.map(c => <option key={c}>{c === 'ALL' ? 'All Categories' : c}</option>)}
        </select>
        <select className="form-control" style={{ width:130 }} value={sevFilter} onChange={e => setSevFilter(e.target.value)}>
          {['ALL','CRITICAL','HIGH','MEDIUM','LOW'].map(s => <option key={s}>{s === 'ALL' ? 'All Severities' : s}</option>)}
        </select>
        <span style={{ marginLeft:'auto', fontSize:11, color:'var(--muted)', fontWeight:600 }}>
          {filtered.length} of {rules.length} rules
        </span>
        {(appFilter !== 'ALL' || sevFilter !== 'ALL' || catFilter !== 'ALL' || search) && (
          <button className="btn btn--secondary btn--sm"
            onClick={() => { setAppFilter('ALL'); setSevFilter('ALL'); setCatFilter('ALL'); setSearch(''); }}>
            ✕ Clear
          </button>
        )}
      </div>

      {/* Card grid */}
      {filtered.length === 0 ? (
        <div className="empty"><div className="empty-icon">📋</div>No rules match your filters</div>
      ) : (
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(320px, 1fr))', gap:14 }}>
          {filtered.map(r => (
            <RuleCard key={r.id} rule={r} onToggle={() => toggleRule(r.id)} onSave={saveRule} />
          ))}
        </div>
      )}

    </div>
  );
}
