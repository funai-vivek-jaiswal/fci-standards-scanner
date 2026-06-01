/**
 * Widget:    findings-detail-widget
 * Module:    Creator - FCI_GovernanceScanner
 * Purpose:   Display all findings for a specific scan session.
 *            Supports client-side filtering by module, severity, status,
 *            and free-text search. Clicking a row navigates to the
 *            finding-view-widget. Provides CSV export of visible rows.
 * URL param: scan_id — the Scan_Session record ID
 * Author:    India Tech Lead
 * Modified:  2026-05-27 — initial version
 */

'use strict';

// ── Constants ────────────────────────────────────────────────────────
const APP_NAME = 'fci_governance_scanner';

// ── State ────────────────────────────────────────────────────────────
/** @type {Array<Object>} All findings loaded from the API */
let allFindings = [];

/** @type {Array<Object>} Currently visible (filtered) findings */
let visibleFindings = [];

/** @type {string|null} The scan session ID from the URL */
let currentScanId = null;

// ── Init ─────────────────────────────────────────────────────────────
window.ZOHO?.CREATOR?.init()
    .then(() => onReady())
    .catch(() => showState('error'));

function onReady() {
    currentScanId = getUrlParam('scan_id');
    if (!currentScanId) {
        showState('error');
        return;
    }
    loadData(currentScanId);
}

// ── Load scan session metadata + findings ─────────────────────────────
function loadData(scanId) {
    showState('loading');

    const sessionPromise = ZOHO.CREATOR.API.getRecordById({
        appName:    APP_NAME,
        reportName: 'All_Scan_Sessions',
        id:         scanId
    }).then((resp) => resp?.data).catch(() => null);

    const findingsPromise = ZOHO.CREATOR.API.getRecords({
        appName:    APP_NAME,
        reportName: 'All_Scan_Findings',
        criteria:   `(Scan_Session == "${scanId}")`,
        page:       1,
        pageSize:   200,
        orderBy:    { field: 'Added_Time', type: 'desc' }
    }).then((resp) => resp?.data || []).catch(() => []);

    Promise.all([sessionPromise, findingsPromise]).then(([session, findings]) => {
        if (!session && findings.length === 0) {
            showState('error');
            return;
        }
        renderSubheader(session);
        allFindings = findings;
        applyFilters();
        showState('main');
    }).catch(() => showState('error'));
}

// ── Render session subheader ──────────────────────────────────────────
function renderSubheader(session) {
    if (!session) { return; }

    const scanType = session.Scan_Type || 'Full Scan';
    const startTime = formatDateTime(session.Start_Time);
    const totalRules = session.Total_Rules_Checked || '—';
    const passRate = session.Pass_Rate_Pct != null
        ? parseFloat(session.Pass_Rate_Pct).toFixed(1) + '%'
        : '—';

    setText('sub-scan-type', scanType);
    setText('sub-start-time', startTime);
    setText('sub-rules-checked', `${totalRules} rules checked`);
    setText('sub-pass-rate', passRate);
}

// ── Apply all active filters and re-render the table ──────────────────
function applyFilters() {
    const moduleVal   = document.getElementById('filter-module')?.value   || '';
    const severityVal = document.getElementById('filter-severity')?.value || '';
    const statusVal   = document.getElementById('filter-status')?.value   || '';
    const searchVal   = (document.getElementById('filter-search')?.value || '').toLowerCase().trim();

    visibleFindings = allFindings.filter((rec) => {
        // Module filter
        if (moduleVal && rec.Module_Name !== moduleVal) { return false; }

        // Severity filter
        if (severityVal) {
            if (severityVal === 'CRITICAL') {
                // CRITICAL maps to Finding_Status == CRITICAL or Severity == CRITICAL
                if (rec.Finding_Status !== 'CRITICAL' && rec.Severity !== 'CRITICAL') { return false; }
            } else {
                if (rec.Severity !== severityVal) { return false; }
            }
        }

        // Status filter (Finding_Status)
        if (statusVal && rec.Finding_Status !== statusVal) { return false; }

        // Text search across Rule_Name, Finding_Detail, Source_Record_Name
        if (searchVal) {
            const haystack = [
                rec.Rule_Name         || '',
                rec.Finding_Detail    || '',
                rec.Source_Record_Name || '',
                rec.Rule_ID           || ''
            ].join(' ').toLowerCase();
            if (!haystack.includes(searchVal)) { return false; }
        }

        return true;
    });

    renderTable(visibleFindings);
    updateCountLabel(visibleFindings.length, allFindings.length);
}

// ── Render findings table ─────────────────────────────────────────────
function renderTable(findings) {
    const tbody = document.getElementById('findings-tbody');
    const empty = document.getElementById('empty-state');
    if (!tbody) { return; }

    tbody.innerHTML = '';

    if (findings.length === 0) {
        if (empty) { empty.hidden = false; }
        return;
    }
    if (empty) { empty.hidden = true; }

    findings.forEach((rec) => {
        const tr = document.createElement('tr');

        // Row class for left-border colouring
        const status = (rec.Finding_Status || '').toUpperCase();
        if      (status === 'CRITICAL') { tr.className = 'row--critical'; }
        else if (status === 'FAIL')     { tr.className = 'row--fail'; }
        else if (status === 'WARN')     { tr.className = 'row--warn'; }
        else if (status === 'PASS')     { tr.className = 'row--pass'; }

        // Severity badge class
        const sev = (rec.Severity || '').toLowerCase();
        const sevBadgeClass = sev ? `badge badge--${sev}` : 'badge';

        // Status badge class
        const statusBadgeClass = statusBadge(status);

        // Remediated indicator
        const isRemediated = rec.Is_Remediated === true || rec.Is_Remediated === 'true';
        const remDot = isRemediated
            ? '<span class="remediated-dot" title="Remediated"></span>'
            : '';

        // Truncate finding detail at 80 chars for table
        const detail = truncate(rec.Finding_Detail || '—', 80);
        const source = truncate(rec.Source_Record_Name || '—', 24);

        tr.innerHTML = `
            <td title="${esc(rec.Module_Name || '')}">${esc(rec.Module_Name || '—')}</td>
            <td title="${esc(rec.Rule_ID || '')} — ${esc(rec.Rule_Name || '')}">
                <span style="font-weight:600;color:#4f46e5">${esc(rec.Rule_ID || '—')}</span>
            </td>
            <td title="${esc(rec.Source_Record_Name || '')}">${esc(source)}</td>
            <td class="col-detail" title="${esc(rec.Finding_Detail || '')}">${remDot}${esc(detail)}</td>
            <td><span class="${sevBadgeClass}">${esc(rec.Severity || '—')}</span></td>
            <td><span class="${statusBadgeClass}">${esc(status || '—')}</span></td>
            <td class="row-arrow">›</td>
        `;

        // Click → navigate to finding view
        tr.addEventListener('click', () => openFindingView(rec.ID));

        tbody.appendChild(tr);
    });
}

// ── Navigation ────────────────────────────────────────────────────────
function openFindingView(findingId) {
    ZOHO.CREATOR.UI.openUrl({
        url: `https://creatorapp.zoho.in/${APP_NAME}/#Page:Finding_View?finding_id=${findingId}&scan_id=${currentScanId}`,
        target: '_self'
    });
}

function navigateBack() {
    ZOHO.CREATOR.UI.openUrl({
        url: `https://creatorapp.zoho.in/${APP_NAME}/#Page:Home`,
        target: '_self'
    });
}

// ── Export CSV ────────────────────────────────────────────────────────
function exportCSV() {
    const headers = [
        'Module', 'Rule ID', 'Rule Name', 'Source Record',
        'Finding Detail', 'Severity', 'Status', 'Is Remediated',
        'Remediation Date', 'Remediated By', 'Standard Reference', 'Added Time'
    ];

    const rows = visibleFindings.map((rec) => [
        rec.Module_Name          || '',
        rec.Rule_ID              || '',
        rec.Rule_Name            || '',
        rec.Source_Record_Name   || '',
        rec.Finding_Detail       || '',
        rec.Severity             || '',
        rec.Finding_Status       || '',
        rec.Is_Remediated ? 'Yes' : 'No',
        rec.Remediation_Date     || '',
        rec.Remediated_By        || '',
        rec.Standard_Reference   || '',
        rec.Added_Time           || ''
    ]);

    const csvContent = [headers, ...rows]
        .map((row) => row.map(csvCell).join(','))
        .join('\r\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    const ts   = new Date().toISOString().slice(0, 10);
    a.href     = url;
    a.download = `fci-findings-${currentScanId}-${ts}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// ── Helpers ───────────────────────────────────────────────────────────
function showState(name) {
    const states = { loading: 'state-loading', main: 'state-main', error: 'state-error' };
    Object.entries(states).forEach(([key, id]) => {
        const el = document.getElementById(id);
        if (el) { el.hidden = (key !== name); }
    });
}

function setText(id, val) {
    const el = document.getElementById(id);
    if (el) { el.textContent = val ?? '—'; }
}

function updateCountLabel(visible, total) {
    setText('count-label', `Showing ${visible} of ${total}`);
}

/**
 * Returns the badge CSS class for a Finding_Status value.
 * @param {string} status
 * @returns {string}
 */
function statusBadge(status) {
    switch (status) {
        case 'CRITICAL': return 'badge badge--crit-status';
        case 'FAIL':     return 'badge badge--fail';
        case 'WARN':     return 'badge badge--warn';
        case 'PASS':     return 'badge badge--pass';
        default:         return 'badge';
    }
}

/**
 * HTML-escape a string to prevent XSS when injecting into innerHTML.
 * @param {string} str
 * @returns {string}
 */
function esc(str) {
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

/**
 * Wrap a CSV cell value in quotes and escape internal quotes.
 * @param {string} val
 * @returns {string}
 */
function csvCell(val) {
    const s = String(val).replace(/"/g, '""');
    return `"${s}"`;
}

/**
 * Truncate a string to maxLen characters, appending '…' if truncated.
 * @param {string} str
 * @param {number} maxLen
 * @returns {string}
 */
function truncate(str, maxLen) {
    if (!str || str.length <= maxLen) { return str; }
    return str.slice(0, maxLen) + '…';
}

/**
 * Format an ISO/Zoho datetime string to a human-friendly form.
 * @param {string} dt
 * @returns {string}
 */
function formatDateTime(dt) {
    if (!dt) { return '—'; }
    try {
        const d = new Date(dt);
        return d.toLocaleString('en-GB', {
            year: 'numeric', month: 'short', day: '2-digit',
            hour: '2-digit', minute: '2-digit'
        });
    } catch (_) {
        return dt;
    }
}

/**
 * Read a query parameter from the URL hash (Zoho Creator widget pattern).
 * @param {string} name
 * @returns {string|null}
 */
function getUrlParam(name) {
    const hash = window.location.hash || window.parent?.location?.hash || '';
    const idx  = hash.indexOf('?');
    if (idx < 0) { return null; }
    return new URLSearchParams(hash.slice(idx + 1)).get(name);
}
