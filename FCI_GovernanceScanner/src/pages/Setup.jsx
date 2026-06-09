import React from 'react';

const FUNCTIONS = [
  { name:'fci-governance-scanner-function', purpose:'Main API router',              status:'healthy', calls:'1,240', lastCall:'08 Jun 09:14' },
  { name:'run-scan',                         purpose:'File upload + Gemini AI scan', status:'healthy', calls:'42',    lastCall:'08 Jun 09:14' },
  { name:'get-scan-results',                 purpose:'Fetch findings for a session', status:'healthy', calls:'187',   lastCall:'08 Jun 09:15' },
  { name:'get-rules',                        purpose:'Fetch rules from DataStore',   status:'healthy', calls:'310',   lastCall:'08 Jun 09:14' },
];

const TABLES = [
  { name:'RuleRepository', rows:72,  purpose:'All governance rules',           lastWrite:'06 Jun 2026' },
  { name:'ScanSession',    rows:42,  purpose:'One record per scan run',         lastWrite:'08 Jun 2026' },
  { name:'ScanFinding',    rows:318, purpose:'Individual rule findings',        lastWrite:'08 Jun 2026' },
  { name:'ClientConfig',   rows:1,   purpose:'FCI Internal client record',     lastWrite:'05 Jun 2026' },
];

const MODULES_COVERAGE = [
  { app:'Creator',   rules:21, seeded:true  },
  { app:'CRM',       rules:16, seeded:true  },
  { app:'People',    rules:12, seeded:true  },
  { app:'Analytics', rules:10, seeded:true  },
  { app:'Sigma',     rules:5,  seeded:true  },
  { app:'Recruit',   rules:5,  seeded:true  },
  { app:'Forms',     rules:4,  seeded:true  },
  { app:'Catalyst',  rules:8,  seeded:false },
];

const APP_COLORS = {
  CRM:'#e8271e', Creator:'#ff6b2b', People:'#0077b6',
  Analytics:'#00a86b', Sigma:'#7b2ff7', Recruit:'#f4720b',
  Forms:'#28a745', Catalyst:'#1a73e8',
};

export default function Setup() {
  return (
    <div style={{ width: '100%' }}>
      <div style={{ marginBottom: 24 }}>
        <h1 className="page-title">System Health</h1>
        <p className="page-sub">Catalyst backend status · DataStore tables · Rule coverage · Project configuration</p>
      </div>

      {/* Project info */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4, 1fr)', gap:14, marginBottom:20 }}>
        {[
          { label:'Project',      value:'FCI-GovernanceScanner', color:'#4f46e5' },
          { label:'Environment',  value:'Development',            color:'#f59e0b' },
          { label:'Total Rules',  value:'72 seeded',              color:'#10b981' },
          { label:'AI Engine',    value:'Gemini 1.5 Flash',       color:'#e8271e' },
        ].map(k => (
          <div key={k.label} className="card" style={{ padding:'16px 18px' }}>
            <div style={{ fontSize:13, fontWeight:800, color:k.color }}>{k.value}</div>
            <div style={{ fontSize:10, color:'var(--muted)', marginTop:5, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.5px' }}>{k.label}</div>
          </div>
        ))}
      </div>

      {/* Catalyst Functions */}
      <div className="card" style={{ padding:0, overflow:'hidden', marginBottom:20 }}>
        <div style={{ padding:'14px 18px', borderBottom:'1px solid var(--border)', fontWeight:700, fontSize:13 }}>
          ⚗️ Catalyst Functions
          <span style={{ marginLeft:10, fontSize:10, background:'#d1fae5', color:'#065f46', padding:'2px 8px', borderRadius:20, fontWeight:700 }}>All Deployed ✓</span>
        </div>
        <table style={{ width:'100%' }}>
          <thead>
            <tr>
              <th>Function Name</th>
              <th>Purpose</th>
              <th>Status</th>
              <th style={{ textAlign:'right' }}>Total Calls</th>
              <th style={{ textAlign:'right' }}>Last Called</th>
            </tr>
          </thead>
          <tbody>
            {FUNCTIONS.map(f => (
              <tr key={f.name}>
                <td><code style={{ fontSize:11, background:'#f3f4f6', padding:'2px 7px', borderRadius:4 }}>{f.name}</code></td>
                <td style={{ fontSize:11, color:'var(--muted)' }}>{f.purpose}</td>
                <td><span style={{ fontSize:10, background:'#d1fae5', color:'#065f46', padding:'2px 8px', borderRadius:20, fontWeight:700 }}>● {f.status}</span></td>
                <td style={{ textAlign:'right', fontWeight:700, color:'var(--text-1)' }}>{f.calls}</td>
                <td style={{ textAlign:'right', fontSize:11, color:'var(--muted)' }}>{f.lastCall}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* DataStore Tables */}
      <div className="card" style={{ padding:0, overflow:'hidden', marginBottom:20 }}>
        <div style={{ padding:'14px 18px', borderBottom:'1px solid var(--border)', fontWeight:700, fontSize:13 }}>
          🗄️ DataStore Tables
        </div>
        <table style={{ width:'100%' }}>
          <thead>
            <tr>
              <th>Table</th>
              <th>Purpose</th>
              <th style={{ textAlign:'center' }}>Records</th>
              <th style={{ textAlign:'right' }}>Last Write</th>
            </tr>
          </thead>
          <tbody>
            {TABLES.map(t => (
              <tr key={t.name}>
                <td><code style={{ fontSize:11, background:'#f3f4f6', padding:'2px 7px', borderRadius:4 }}>{t.name}</code></td>
                <td style={{ fontSize:11, color:'var(--muted)' }}>{t.purpose}</td>
                <td style={{ textAlign:'center', fontWeight:800, color:'#4f46e5' }}>{t.rows}</td>
                <td style={{ textAlign:'right', fontSize:11, color:'var(--muted)' }}>{t.lastWrite}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Rule Coverage by Application */}
      <div className="card" style={{ padding:'20px' }}>
        <div style={{ fontWeight:700, fontSize:13, marginBottom:16 }}>📋 Rule Coverage by Application</div>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(4, 1fr)', gap:12 }}>
          {MODULES_COVERAGE.map(m => {
            const ac = APP_COLORS[m.app] || '#6b7280';
            return (
              <div key={m.app} style={{ padding:'14px 16px', borderRadius:10, border:`1px solid ${ac}33`, background:`${ac}08` }}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:8 }}>
                  <div style={{ width:10, height:10, borderRadius:'50%', background:ac }} />
                  <span style={{ fontSize:10, background: m.seeded ? '#d1fae5':'#fef9c3', color: m.seeded ? '#065f46':'#92400e', padding:'2px 7px', borderRadius:20, fontWeight:700 }}>
                    {m.seeded ? 'Seeded ✓' : 'Pending'}
                  </span>
                </div>
                <div style={{ fontSize:13, fontWeight:800, color:'var(--text-1)' }}>{m.app}</div>
                <div style={{ fontSize:22, fontWeight:900, color:ac, marginTop:4 }}>{m.rules}</div>
                <div style={{ fontSize:10, color:'var(--muted)', marginTop:2 }}>rules</div>
              </div>
            );
          })}
        </div>

        <div style={{ marginTop:18, padding:'14px 16px', background:'#f0f9ff', borderRadius:8, border:'1px solid #bae6fd' }}>
          <div style={{ fontSize:12, fontWeight:700, color:'#0369a1', marginBottom:4 }}>🌐 Catalyst Web App</div>
          <code style={{ fontSize:11, color:'#0c4a6e', wordBreak:'break-all' }}>
            https://fci-governancescanner-899069121.development.catalystserverless.com/app/index.html
          </code>
        </div>
      </div>

    </div>
  );
}
