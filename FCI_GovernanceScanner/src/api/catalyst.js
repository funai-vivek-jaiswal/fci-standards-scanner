const BASE = 'https://fci-governancescanner-899069121.development.catalystserverless.com';

// ── helper ──────────────────────────────────────────────────────────────────
async function req(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`API ${res.status}: ${text}`);
  }
  return res.json();
}

// ── Rules ────────────────────────────────────────────────────────────────────
export async function getRules(filters = {}) {
  const params = new URLSearchParams(filters).toString();
  return req(`/server/get-rules/${params ? '?' + params : ''}`);
}

// ── Scan ─────────────────────────────────────────────────────────────────────
export async function runScan(file, module, clientId) {
  const form = new FormData();
  form.append('file', file);
  form.append('module', module);
  form.append('client_id', clientId || '1');
  const res = await fetch(`${BASE}/server/run-scan/`, {
    method: 'POST',
    body: form,           // no Content-Type header — browser sets multipart boundary
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`run-scan ${res.status}: ${text}`);
  }
  return res.json();
}

// ── Scan results ─────────────────────────────────────────────────────────────
export async function getScanResults(sessionId) {
  return req(`/server/get-scan-results/?session_id=${sessionId}`);
}

// ── Main router (dashboard stats, history) ────────────────────────────────────
export async function apiCall(action, params = {}) {
  const query = new URLSearchParams({ action, ...params }).toString();
  return req(`/server/fci_governance_scanner_function/?${query}`);
}

// ── Convenience wrappers ──────────────────────────────────────────────────────
export const getDashboardStats  = ()           => apiCall('dashboard_stats');
export const getScanHistory     = ()           => apiCall('scan_history');
export const getFindings        = (sessionId)  => getScanResults(sessionId);
export const getFindingDetail   = (findingId)  => apiCall('finding_detail',  { finding_id: findingId });
export const updateFinding      = (id, status, notes) =>
  apiCall('update_finding', { finding_id: id, status, notes });
export const createRule         = (rule)       => apiCall('create_rule',  { ...rule });
export const updateRule         = (id, rule)   => apiCall('update_rule',  { rule_id: id, ...rule });
export const deleteRule         = (id)         => apiCall('delete_rule',  { rule_id: id });
