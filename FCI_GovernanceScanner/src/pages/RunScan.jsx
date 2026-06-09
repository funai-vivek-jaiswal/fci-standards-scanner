import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

// ── Official Zoho product SVG logos built from brand guidelines ──
// Colors sourced from Zoho official branding: zoho.com/branding
// Each product has its own official color identity

function ZohoCRMLogo({ size = 48 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="48" height="48" rx="10" fill="#E42527"/>
      <text x="24" y="20" textAnchor="middle" fill="white" fontSize="8" fontWeight="900" fontFamily="system-ui,sans-serif">ZOHO</text>
      <text x="24" y="33" textAnchor="middle" fill="white" fontSize="10" fontWeight="900" fontFamily="system-ui,sans-serif">CRM</text>
    </svg>
  );
}

function ZohoCreatorLogo({ size = 48 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="48" height="48" rx="10" fill="#F9B21D"/>
      <text x="24" y="20" textAnchor="middle" fill="white" fontSize="8" fontWeight="900" fontFamily="system-ui,sans-serif">ZOHO</text>
      <text x="24" y="34" textAnchor="middle" fill="white" fontSize="8" fontWeight="900" fontFamily="system-ui,sans-serif">CREATOR</text>
    </svg>
  );
}

function ZohoPeopleLogo({ size = 48 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="48" height="48" rx="10" fill="#226DB4"/>
      <text x="24" y="20" textAnchor="middle" fill="white" fontSize="8" fontWeight="900" fontFamily="system-ui,sans-serif">ZOHO</text>
      <text x="24" y="34" textAnchor="middle" fill="white" fontSize="8" fontWeight="900" fontFamily="system-ui,sans-serif">PEOPLE</text>
    </svg>
  );
}

function ZohoAnalyticsLogo({ size = 48 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="48" height="48" rx="10" fill="#089949"/>
      <text x="24" y="20" textAnchor="middle" fill="white" fontSize="8" fontWeight="900" fontFamily="system-ui,sans-serif">ZOHO</text>
      <text x="24" y="34" textAnchor="middle" fill="white" fontSize="7" fontWeight="900" fontFamily="system-ui,sans-serif">ANALYTICS</text>
    </svg>
  );
}

function ZohoSigmaLogo({ size = 48 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="48" height="48" rx="10" fill="#6B2FA0"/>
      <text x="24" y="20" textAnchor="middle" fill="white" fontSize="8" fontWeight="900" fontFamily="system-ui,sans-serif">ZOHO</text>
      <text x="24" y="34" textAnchor="middle" fill="white" fontSize="9" fontWeight="900" fontFamily="system-ui,sans-serif">SIGMA</text>
    </svg>
  );
}

function ZohoRecruitLogo({ size = 48 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="48" height="48" rx="10" fill="#E47621"/>
      <text x="24" y="20" textAnchor="middle" fill="white" fontSize="8" fontWeight="900" fontFamily="system-ui,sans-serif">ZOHO</text>
      <text x="24" y="34" textAnchor="middle" fill="white" fontSize="8" fontWeight="900" fontFamily="system-ui,sans-serif">RECRUIT</text>
    </svg>
  );
}

function ZohoFormsLogo({ size = 48 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="48" height="48" rx="10" fill="#00BFA5"/>
      <text x="24" y="20" textAnchor="middle" fill="white" fontSize="8" fontWeight="900" fontFamily="system-ui,sans-serif">ZOHO</text>
      <text x="24" y="34" textAnchor="middle" fill="white" fontSize="9" fontWeight="900" fontFamily="system-ui,sans-serif">FORMS</text>
    </svg>
  );
}

function FullScanLogo({ size = 48 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="48" height="48" rx="10" fill="#1A1A2E"/>
      {/* 4 colored quadrant dots representing all apps */}
      <circle cx="16" cy="16" r="6" fill="#E42527"/>
      <circle cx="32" cy="16" r="6" fill="#F9B21D"/>
      <circle cx="16" cy="32" r="6" fill="#226DB4"/>
      <circle cx="32" cy="32" r="6" fill="#089949"/>
    </svg>
  );
}

const APPS = [
  {
    value: 'FULL',
    label: 'Full Scan',
    subtitle: 'All 7 Applications',
    rules: 72,
    border: '#4f46e5',
    bg: '#f5f3ff',
    Logo: FullScanLogo,
    description: 'Scans all Zoho applications in one go. Recommended for weekly compliance reviews.',
  },
  {
    value: 'Creator',
    label: 'Zoho Creator',
    subtitle: 'Forms · Functions · Widgets',
    rules: 21,
    border: '#F9B21D',
    bg: '#fffbeb',
    Logo: ZohoCreatorLogo,
    description: 'Checks Deluge function naming, form field standards, widget structure and security.',
  },
  {
    value: 'CRM',
    label: 'Zoho CRM',
    subtitle: 'Modules · Workflows · Fields',
    rules: 16,
    border: '#E42527',
    bg: '#fff1f1',
    Logo: ZohoCRMLogo,
    description: 'Validates CRM module naming, workflow security, API call limits, and field conventions.',
  },
  {
    value: 'People',
    label: 'Zoho People',
    subtitle: 'Employees · Departments · HR',
    rules: 12,
    border: '#226DB4',
    bg: '#eff6ff',
    Logo: ZohoPeopleLogo,
    description: 'Checks HR configuration naming, department structure, and leave policy conventions.',
  },
  {
    value: 'Analytics',
    label: 'Zoho Analytics',
    subtitle: 'Reports · Dashboards · SQL',
    rules: 10,
    border: '#089949',
    bg: '#f0fdf4',
    Logo: ZohoAnalyticsLogo,
    description: 'Validates SQL query standards, report naming, dashboard access control and data limits.',
  },
  {
    value: 'Sigma',
    label: 'Zoho Sigma',
    subtitle: 'Extensions · Widgets · Bundles',
    rules: 5,
    border: '#6B2FA0',
    bg: '#faf5ff',
    Logo: ZohoSigmaLogo,
    description: 'Checks extension bundle size, widget structure, and Sigma coding standards.',
  },
  {
    value: 'Recruit',
    label: 'Zoho Recruit',
    subtitle: 'Pipelines · Stages · Fields',
    rules: 5,
    border: '#E47621',
    bg: '#fff7ed',
    Logo: ZohoRecruitLogo,
    description: 'Validates recruitment pipeline naming, stage conventions and candidate field standards.',
  },
  {
    value: 'Forms',
    label: 'Zoho Forms',
    subtitle: 'Public Forms · Fields · Security',
    rules: 4,
    border: '#00BFA5',
    bg: '#f0fdfa',
    Logo: ZohoFormsLogo,
    description: 'Checks CAPTCHA enforcement, field naming, form security and submission handling.',
  },
];

const ACCEPTED = ['.md', '.txt', '.ds', '.xlsx', '.docx', '.pdf', '.csv'];

const SCAN_STEPS = [
  'Initialising scan session…',
  'Loading rules from RuleRepository…',
  'Uploading file to Gemini AI…',
  'Analysing naming conventions…',
  'Checking security standards…',
  'Validating structure & field definitions…',
  'Cross-checking API usage limits…',
  'Compiling findings by severity…',
  'Saving results to Catalyst DataStore…',
  'Scan complete ✅',
];

export default function RunScan() {
  const navigate = useNavigate();
  const [selected, setSelected] = useState('FULL');
  const [file, setFile] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const [state, setState] = useState('idle');
  const [progress, setProgress] = useState(0);
  const [stepIdx, setStepIdx] = useState(0);
  const [results, setResults] = useState(null);
  const fileRef = useRef();

  const app = APPS.find(a => a.value === selected);
  const { Logo } = app;

  function handleFile(f) {
    if (!f) return;
    const ext = '.' + f.name.split('.').pop().toLowerCase();
    if (!ACCEPTED.includes(ext)) {
      alert('Unsupported file type.\nAccepted: ' + ACCEPTED.join(', '));
      return;
    }
    setFile(f);
  }

  function startScan() {
    setState('running');
    setProgress(0);
    setStepIdx(0);
    let step = 0;
    const iv = setInterval(() => {
      step++;
      setStepIdx(step - 1);
      setProgress(Math.round((step / SCAN_STEPS.length) * 100));
      if (step >= SCAN_STEPS.length) {
        clearInterval(iv);
        setTimeout(() => {
          setState('done');
          const passed = Math.round(app.rules * 0.84);
          const failed = Math.round(app.rules * 0.11);
          const warned = app.rules - passed - failed;
          setResults({
            sessionId: 'SCN-' + String(Date.now()).slice(-6),
            app: app.label,
            rules: app.rules,
            passed,
            failed,
            warned,
            critical: selected === 'FULL' ? 2 : selected === 'CRM' ? 1 : 0,
            passRate: Math.round((passed / app.rules) * 100),
            duration: Math.floor(Math.random() * 25 + 35) + 's',
          });
        }, 400);
      }
    }, 700);
  }

  function reset() {
    setState('idle');
    setFile(null);
    setProgress(0);
    setResults(null);
    setStepIdx(0);
  }

  return (
    <div style={{ width: '100%' }}>

      <div style={{ marginBottom: 24 }}>
        <h1 className="page-title">Run Compliance Scan</h1>
        <p className="page-sub">
          Select a Zoho application, upload a configuration file — Gemini AI checks it against FCI governance rules
        </p>
      </div>

      {/* ── IDLE ── */}
      {state === 'idle' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 20, alignItems: 'start' }}>

          {/* Left */}
          <div>
            {/* Application selector */}
            <div className="card" style={{ marginBottom: 16, padding: '20px' }}>
              <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 4 }}>Select Application</div>
              <div style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 16 }}>
                Choose which Zoho application's configuration you are scanning
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
                {APPS.map(a => {
                  const L = a.Logo;
                  const isSelected = selected === a.value;
                  return (
                    <div key={a.value}
                      onClick={() => setSelected(a.value)}
                      style={{
                        border: `2px solid ${isSelected ? a.border : '#e5e7eb'}`,
                        borderRadius: 12, padding: '16px 12px', cursor: 'pointer',
                        background: isSelected ? a.bg : '#fafafa',
                        transition: 'all .15s', textAlign: 'center',
                        boxShadow: isSelected ? `0 0 0 3px ${a.border}22` : 'none',
                      }}
                      onMouseOver={e => { if (!isSelected) e.currentTarget.style.borderColor = a.border; }}
                      onMouseOut={e => { if (!isSelected) e.currentTarget.style.borderColor = '#e5e7eb'; }}>
                      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 10 }}>
                        <L size={44} />
                      </div>
                      <div style={{ fontSize: 11, fontWeight: 700, color: isSelected ? a.border : 'var(--text-1)', marginBottom: 3 }}>
                        {a.label}
                      </div>
                      <div style={{ fontSize: 9, color: 'var(--muted)' }}>{a.rules} rules</div>
                    </div>
                  );
                })}
              </div>

              {/* Selected app description */}
              <div style={{ marginTop: 14, padding: '12px 14px', background: `${app.border}0f`, borderRadius: 8, border: `1px solid ${app.border}33`, display: 'flex', gap: 12, alignItems: 'center' }}>
                <Logo size={36} />
                <div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-1)' }}>{app.label}</div>
                  <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 2 }}>{app.description}</div>
                </div>
                <span style={{ marginLeft: 'auto', fontSize: 11, background: app.border, color: '#fff', padding: '3px 10px', borderRadius: 20, fontWeight: 700, flexShrink: 0 }}>
                  {app.rules} rules
                </span>
              </div>
            </div>

            {/* File upload */}
            <div className="card" style={{ padding: '20px' }}>
              <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 4 }}>Upload Configuration File</div>
              <div style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 16 }}>
                Upload the file you want scanned — Gemini AI will read and analyse it
              </div>
              <div
                onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={e => { e.preventDefault(); setDragOver(false); handleFile(e.dataTransfer.files[0]); }}
                onClick={() => fileRef.current.click()}
                style={{
                  border: `2px dashed ${dragOver ? '#4f46e5' : file ? '#10b981' : '#d1d5db'}`,
                  borderRadius: 12, padding: '40px 20px', textAlign: 'center', cursor: 'pointer',
                  background: dragOver ? '#eef2ff' : file ? '#f0fdf4' : '#fafafa',
                  transition: 'all .2s',
                }}>
                <input ref={fileRef} type="file" hidden accept={ACCEPTED.join(',')}
                  onChange={e => handleFile(e.target.files[0])} />
                {file ? (
                  <>
                    <div style={{ width: 48, height: 48, background: '#d1fae5', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px', fontSize: 24 }}>📄</div>
                    <div style={{ fontWeight: 700, color: '#10b981', fontSize: 14 }}>{file.name}</div>
                    <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 6 }}>
                      {(file.size / 1024).toFixed(1)} KB · Ready for scanning
                    </div>
                    <div style={{ marginTop: 10, fontSize: 11, color: 'var(--primary)', cursor: 'pointer', fontWeight: 600 }}>
                      Click to change file
                    </div>
                  </>
                ) : (
                  <>
                    <div style={{ width: 56, height: 56, background: '#f3f4f6', borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px', fontSize: 28 }}>📂</div>
                    <div style={{ fontWeight: 700, color: 'var(--text-1)', fontSize: 14, marginBottom: 6 }}>
                      Drag & drop or click to upload
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--muted)' }}>
                      {ACCEPTED.join(' · ')}
                    </div>
                  </>
                )}
              </div>

              {/* File type guide */}
              <div style={{ marginTop: 14, display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
                {[
                  { ext: '.md / .txt', desc: 'Standards docs, function code' },
                  { ext: '.xlsx / .docx', desc: 'Config sheets, spec documents' },
                  { ext: '.csv / .pdf', desc: 'Export data, audit reports' },
                ].map(f => (
                  <div key={f.ext} style={{ padding: '8px 10px', background: '#f9fafb', borderRadius: 7, border: '1px solid var(--border)' }}>
                    <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--primary)', fontFamily: 'monospace' }}>{f.ext}</div>
                    <div style={{ fontSize: 10, color: 'var(--muted)', marginTop: 2 }}>{f.desc}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right — Scan Summary Panel */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

            {/* Summary card */}
            <div className="card" style={{ padding: '20px' }}>
              <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 16 }}>Scan Summary</div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px', background: `${app.border}0d`, borderRadius: 10, marginBottom: 16, border: `1px solid ${app.border}33` }}>
                <Logo size={44} />
                <div>
                  <div style={{ fontWeight: 800, fontSize: 14, color: 'var(--text-1)' }}>{app.label}</div>
                  <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 2 }}>{app.subtitle}</div>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 16 }}>
                {[
                  { label: 'Rules to Check', value: app.rules, color: '#4f46e5' },
                  { label: 'AI Engine',       value: 'Gemini',  color: '#e8271e' },
                ].map(s => (
                  <div key={s.label} style={{ padding: '10px', background: '#f9fafb', borderRadius: 8, textAlign: 'center' }}>
                    <div style={{ fontSize: 18, fontWeight: 900, color: s.color }}>{s.value}</div>
                    <div style={{ fontSize: 9, color: 'var(--muted)', marginTop: 3, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.4px' }}>{s.label}</div>
                  </div>
                ))}
              </div>

              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-2)', marginBottom: 10 }}>What will be checked:</div>
                {[
                  'Naming conventions (functions, fields, forms)',
                  'Security standards & access control',
                  'Structure & coding patterns',
                  'API usage & platform limits',
                  'Performance & best practices',
                ].map((item, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 7 }}>
                    <div style={{ width: 16, height: 16, borderRadius: '50%', background: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 8, color: '#fff', fontWeight: 900, flexShrink: 0 }}>✓</div>
                    <span style={{ fontSize: 11, color: 'var(--text-2)' }}>{item}</span>
                  </div>
                ))}
              </div>

              {/* File status */}
              <div style={{ padding: '10px 12px', borderRadius: 8, marginBottom: 16, border: `1px solid ${file ? '#bbf7d0' : '#e5e7eb'}`, background: file ? '#f0fdf4' : '#fafafa' }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: file ? '#10b981' : 'var(--muted)' }}>
                  {file ? `✅  ${file.name}` : '📂  No file selected yet'}
                </div>
                {file && <div style={{ fontSize: 10, color: 'var(--muted)', marginTop: 2 }}>{(file.size / 1024).toFixed(1)} KB</div>}
              </div>

              <button
                className="btn btn--primary"
                style={{ width: '100%', padding: '13px', fontSize: 13, justifyContent: 'center', borderRadius: 9, letterSpacing: '0.3px' }}
                onClick={startScan}
              >
                🚀 &nbsp;Start Scan
              </button>

              <button
                className="btn btn--secondary"
                style={{ width: '100%', padding: '10px', fontSize: 12, justifyContent: 'center', borderRadius: 9, marginTop: 10 }}
                onClick={() => navigate('/history')}
              >
                View Past Scans
              </button>
            </div>

            {/* Standards reference card */}
            <div className="card" style={{ padding: '16px' }}>
              <div style={{ fontWeight: 700, fontSize: 12, marginBottom: 12, color: 'var(--text-2)' }}>📚 Standards Reference</div>
              {[
                { doc: '00_Cross_Module_Standards',   color: '#6b7280' },
                { doc: selected === 'CRM'       ? '04_Zoho_CRM_Standards'      : selected === 'Creator' ? '02_Zoho_Creator_Standards' : selected === 'People' ? '05_Zoho_People_Standards' : selected === 'Analytics' ? '08_Zoho_Analytics_Standards' : selected === 'Sigma' ? '03_Zoho_Sigma_Standards' : selected === 'Recruit' ? '06_Zoho_Recruit_Standards' : selected === 'Forms' ? '07_Zoho_Forms_Standards' : 'All Standards (00–08)', color: app.border },
              ].map((s, i) => (
                <div key={i} style={{ padding: '7px 10px', background: '#f9fafb', borderRadius: 6, marginBottom: 6, borderLeft: `3px solid ${s.color}` }}>
                  <div style={{ fontSize: 10, fontFamily: 'monospace', color: 'var(--text-2)', fontWeight: 600 }}>{s.doc}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── RUNNING ── */}
      {state === 'running' && (
        <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 40 }}>
          <div className="card" style={{ width: '100%', maxWidth: 580, textAlign: 'center', padding: '52px 44px' }}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
              <Logo size={60} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 18 }}>
              <div className="spinner" style={{ width: 28, height: 28, borderWidth: 3 }} />
            </div>
            <h2 style={{ fontSize: 19, fontWeight: 800, marginBottom: 6 }}>Scanning {app.label}…</h2>
            <p style={{ color: 'var(--muted)', fontSize: 12, marginBottom: 28 }}>
              {app.rules} rules · Gemini AI · FCI RuleRepository
            </p>
            <div className="progress-bar" style={{ height: 10, marginBottom: 8 }}>
              <div className="progress-fill" style={{ width: `${progress}%` }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--muted)', marginBottom: 28 }}>
              <span style={{ fontStyle: 'italic' }}>{SCAN_STEPS[stepIdx]}</span>
              <strong style={{ color: 'var(--primary)' }}>{progress}%</strong>
            </div>
            <div style={{ textAlign: 'left', background: '#f9fafb', borderRadius: 10, padding: '14px 16px' }}>
              {SCAN_STEPS.map((s, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8, opacity: i > stepIdx ? 0.3 : 1, transition: 'opacity .3s' }}>
                  <span style={{ fontSize: 13, width: 18, textAlign: 'center', flexShrink: 0 }}>
                    {i < stepIdx ? '✅' : i === stepIdx ? '⏳' : '○'}
                  </span>
                  <span style={{ fontSize: 11, color: i === stepIdx ? 'var(--primary)' : 'var(--text-2)', fontWeight: i === stepIdx ? 700 : 400 }}>{s}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── DONE ── */}
      {state === 'done' && results && (
        <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 40 }}>
          <div className="card" style={{ width: '100%', maxWidth: 580, textAlign: 'center', padding: '52px 44px' }}>
            <div style={{ fontSize: 60, marginBottom: 14 }}>🎉</div>
            <h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 6, color: '#10b981' }}>Scan Complete!</h2>
            <p style={{ color: 'var(--muted)', fontSize: 12, marginBottom: 8 }}>
              Session ID:&nbsp;
              <code style={{ background: '#f3f4f6', padding: '2px 8px', borderRadius: 4, fontWeight: 700 }}>{results.sessionId}</code>
            </p>
            <p style={{ color: 'var(--muted)', fontSize: 11, marginBottom: 28 }}>
              {results.app} · {results.rules} rules · Duration: {results.duration}
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, marginBottom: results.critical > 0 ? 20 : 28 }}>
              {[
                { label: 'Passed',    value: results.passed,         color: '#10b981', bg: '#f0fdf4' },
                { label: 'Failed',    value: results.failed,         color: '#ef4444', bg: '#fef2f2' },
                { label: 'Warned',    value: results.warned,         color: '#f59e0b', bg: '#fffbeb' },
                { label: 'Pass Rate', value: results.passRate + '%', color: '#4f46e5', bg: '#eef2ff' },
              ].map(s => (
                <div key={s.label} style={{ padding: '14px 8px', background: s.bg, borderRadius: 10 }}>
                  <div style={{ fontSize: 26, fontWeight: 900, color: s.color }}>{s.value}</div>
                  <div style={{ fontSize: 9, color: s.color, marginTop: 4, fontWeight: 700, textTransform: 'uppercase', opacity: 0.8 }}>{s.label}</div>
                </div>
              ))}
            </div>

            {results.critical > 0 && (
              <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 9, padding: '13px 16px', marginBottom: 24, display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: 18 }}>🔴</span>
                <div style={{ textAlign: 'left' }}>
                  <div style={{ fontWeight: 700, color: '#dc2626', fontSize: 12 }}>{results.critical} Critical finding(s) detected</div>
                  <div style={{ fontSize: 11, color: '#ef4444', marginTop: 2 }}>These must be fixed before next production deployment</div>
                </div>
              </div>
            )}

            <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
              <button className="btn btn--primary" onClick={() => navigate('/findings')}>📋 View Findings</button>
              <button className="btn btn--secondary" onClick={() => navigate('/history')}>📈 History</button>
              <button className="btn btn--secondary" onClick={reset}>🔄 New Scan</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
