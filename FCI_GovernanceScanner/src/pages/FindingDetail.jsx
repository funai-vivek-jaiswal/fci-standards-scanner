import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import SeverityBadge from '../components/SeverityBadge';

const DEMO = {
  'F-001': {
    id: 'F-001', rule: 'CRM-SEC-001', name: 'API key stored in plain text in CRM workflow',
    module: 'CRM', severity: 'CRITICAL', status: 'FAIL', category: 'Security',
    source: 'CRM Workflow: Lead_Auto_Assign', date: '08 Jun 2026 09:14',
    sourceDoc: '04_Zoho_CRM_Standards §5.2',
    detail: 'The workflow "Lead_Auto_Assign" contains a hardcoded API key in plain text inside a Deluge script block. This is a critical security violation — API keys must never be stored in code. If this workflow is visible to other developers or exported, the key will be compromised. Use Zoho CRM\'s Connection Manager or encrypted Org Variables instead.',
    remediation: [
      'Open Zoho CRM → Settings → Workflows → Lead_Auto_Assign',
      'Locate the Deluge script block containing the hardcoded API key',
      'Remove the hardcoded key from the script',
      'Go to CRM → Settings → Connections and create a new Connection for the target API',
      'Update the workflow to use zoho.invoke with the named connection instead',
      'If an Org Variable is more appropriate, encrypt the key first using zoho.encryption.encrypt()',
      'Save and test the workflow end-to-end',
      'Rotate the compromised API key at the source service immediately',
    ],
  },
  'F-002': {
    id: 'F-002', rule: 'ANL-SQL-003', name: 'SELECT * used in Analytics production report',
    module: 'Analytics', severity: 'CRITICAL', status: 'FAIL', category: 'SQL',
    source: 'Report: Monthly_Revenue', date: '08 Jun 2026 09:14',
    sourceDoc: '08_Zoho_Analytics_Standards §3.1',
    detail: 'The "Monthly_Revenue" report uses SELECT * in its underlying query. This fetches all columns from the source table, including sensitive fields that should not be exposed. It also causes performance issues as datasets grow and makes the report brittle — any schema change will silently change report output.',
    remediation: [
      'Open Zoho Analytics → Monthly_Revenue report → Edit Query',
      'Replace SELECT * with explicit column names: SELECT revenue, month, region, product_line',
      'Remove any sensitive columns (employee IDs, personal data) from the SELECT list',
      'Add appropriate WHERE clause to filter only necessary rows',
      'Test the report output matches expected results',
      'Save and republish the report',
    ],
  },
};

const FALLBACK = {
  id: 'F-???', rule: 'UNKNOWN', name: 'Finding not found in demo data',
  module: '—', severity: 'LOW', status: 'PASS', category: '—',
  source: '—', date: '—', sourceDoc: '—', detail: 'This finding ID is not in the demo dataset. In production, it would be fetched from the Catalyst DataStore.', remediation: [],
};

export default function FindingDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const f = DEMO[id] || FALLBACK;
  const [status, setStatus] = useState(f.status);
  const [notes, setNotes] = useState('');
  const [saved, setSaved] = useState(false);

  function markResolved() { setStatus('RESOLVED'); setSaved(true); }
  function markSkip() { setStatus('SKIPPED'); setSaved(true); }

  const borderColor = { CRITICAL: '#dc2626', HIGH: '#f59e0b', MEDIUM: '#3b82f6', LOW: '#6b7280' }[f.severity] || '#6b7280';

  return (
    <div style={{ width: '100%' }}>
      {/* Back */}
      <button className="btn btn--secondary btn--sm" style={{ marginBottom: 16 }} onClick={() => navigate('/findings')}>
        ← Back to Findings
      </button>

      {/* Header card */}
      <div className="card" style={{ marginBottom: 16, borderLeft: `4px solid ${borderColor}` }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', gap: 8, marginBottom: 10, flexWrap: 'wrap', alignItems: 'center' }}>
              <SeverityBadge value={f.severity} />
              <SeverityBadge value={status} />
              <span style={{ fontSize: 11, background: '#eef2ff', color: '#4338ca', padding: '2px 8px', borderRadius: 20, fontWeight: 600 }}>{f.module}</span>
              <code style={{ fontSize: 11, background: '#f3f4f6', padding: '2px 8px', borderRadius: 4 }}>{f.rule}</code>
            </div>
            <h1 style={{ fontSize: 18, fontWeight: 800, color: 'var(--text-1)', lineHeight: 1.3 }}>{f.name}</h1>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 24, marginTop: 14, paddingTop: 14, borderTop: '1px solid var(--border)', fontSize: 11, color: 'var(--muted)' }}>
          <span>📁 <strong>Source:</strong> {f.source}</span>
          <span>📚 <strong>Standard:</strong> {f.sourceDoc}</span>
          <span>📅 <strong>Detected:</strong> {f.date}</span>
          <span>🗂 <strong>Category:</strong> {f.category}</span>
        </div>
      </div>

      {/* Finding detail */}
      <div className="card" style={{ marginBottom: 16 }}>
        <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 12 }}>🔎 Finding Detail</div>
        <p style={{ fontSize: 13, color: 'var(--text-2)', lineHeight: 1.7 }}>{f.detail}</p>
      </div>

      {/* Remediation steps */}
      {f.remediation.length > 0 && (
        <div className="card" style={{ marginBottom: 16 }}>
          <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 14 }}>🛠 Remediation Steps</div>
          {f.remediation.map((step, i) => (
            <div key={i} style={{ display: 'flex', gap: 14, marginBottom: 12, alignItems: 'flex-start' }}>
              <div style={{ width: 24, height: 24, borderRadius: '50%', background: 'var(--primary)', color: '#fff',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: 11, fontWeight: 700, flexShrink: 0 }}>
                {i + 1}
              </div>
              <p style={{ fontSize: 13, color: 'var(--text-2)', lineHeight: 1.6, margin: 0, paddingTop: 3 }}>{step}</p>
            </div>
          ))}
        </div>
      )}

      {/* Status actions */}
      {!saved ? (
        <div className="card" style={{ marginBottom: 16 }}>
          <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 14 }}>📝 Update Status</div>
          <div className="form-group">
            <label className="form-label">Resolution Notes (optional)</label>
            <textarea className="form-control" rows={3} placeholder="Describe what you fixed or why you're skipping…"
              value={notes} onChange={e => setNotes(e.target.value)}
              style={{ resize: 'vertical', fontFamily: 'inherit' }} />
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button className="btn btn--primary" onClick={markResolved}>✅ Mark as Resolved</button>
            <button className="btn btn--secondary" onClick={markSkip}>⏭ Skip / Won't Fix</button>
          </div>
        </div>
      ) : (
        <div className="card" style={{ background: status === 'RESOLVED' ? '#f0fdf4' : '#f9fafb',
                                        border: `1px solid ${status === 'RESOLVED' ? '#bbf7d0' : '#e5e7eb'}` }}>
          <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
            <span style={{ fontSize: 32 }}>{status === 'RESOLVED' ? '✅' : '⏭'}</span>
            <div>
              <div style={{ fontWeight: 700, color: status === 'RESOLVED' ? '#065f46' : 'var(--text-1)' }}>
                {status === 'RESOLVED' ? 'Marked as Resolved' : 'Marked as Skipped'}
              </div>
              <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 4 }}>
                By m-mutturaj@funaiconsulting.in · Just now
              </div>
              {notes && <div style={{ fontSize: 12, color: 'var(--text-2)', marginTop: 6 }}>"{notes}"</div>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
