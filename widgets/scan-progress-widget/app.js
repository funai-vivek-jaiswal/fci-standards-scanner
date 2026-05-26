/**
 * Widget:    scan-progress-widget
 * Module:    Creator - FCI_GovernanceScanner
 * Purpose:   Provides the "Run Full Scan" button and live progress display.
 *            Calls CRT_InitiateFullScan_fn, then polls Scan_Session every
 *            3 seconds to update the progress bar and live counts.
 * Author:    India Tech Lead
 * Modified:  2026-05-26 — initial version
 */

'use strict';

// ── Constants ────────────────────────────────────────────────────────
const POLL_INTERVAL_MS = 3000;
const APP_NAME         = 'fci_governance_scanner';
const FINDINGS_PAGE    = 'Findings_Detail';

// ── State ────────────────────────────────────────────────────────────
let pollTimer   = null;
let activeScanId = null;
let startTime   = null;

// ── Init ─────────────────────────────────────────────────────────────
window.ZOHO?.CREATOR?.init()
    .then(() => loadLastScanInfo())
    .catch((err) => console.warn('[scan-progress-widget] ZOHO init error:', err));

// ── Load last scan info ───────────────────────────────────────────────
function loadLastScanInfo() {
    ZOHO.CREATOR.API.getRecords({
        appName:    APP_NAME,
        reportName: 'All_Scan_Sessions',
        criteria:   '(Scan_Status == "COMPLETED")',
        page:       1,
        pageSize:   1,
        orderBy:    { field: 'Start_Time', type: 'desc' }
    }).then((resp) => {
        const records = resp?.data;
        if (!records || records.length === 0) { return; }
        const last = records[0];
        const el   = document.getElementById('last-scan-info');
        const date = last.Start_Time || '';
        const rate = last.Pass_Rate_Pct || '—';
        el.textContent = `Last scan: ${date} · Pass rate: ${rate}%`;
    }).catch(() => {});
}

// ── Start a full scan ─────────────────────────────────────────────────
function startScan(scanType) {
    showState('running');
    startTime = Date.now();
    resetLiveCounts();
    setProgressLabel('Starting scan…');

    ZOHO.CREATOR.API.executeFunction({
        appName:      APP_NAME,
        functionName: 'CRT_InitiateFullScan_fn',
        arguments:    JSON.stringify({ scan_type: scanType, triggered_by: getCurrentUser() })
    }).then((resp) => {
        const data = resp?.response?.result;
        if (data?.scan_id) {
            activeScanId = data.scan_id;
            pollScanStatus();
        } else {
            showError('Scan failed to start. Check function logs.');
        }
    }).catch((err) => {
        showError('Error calling scan function: ' + err);
    });
}

// ── Start a module-specific scan ──────────────────────────────────────
function startModuleScan() {
    const select = document.getElementById('module-select');
    const module = select?.value;
    if (!module) {
        alert('Please select a module to scan.');
        return;
    }
    startScan(module);
}

// ── Poll scan session for live updates ───────────────────────────────
function pollScanStatus() {
    if (!activeScanId) { return; }

    ZOHO.CREATOR.API.getRecordById({
        appName:    APP_NAME,
        reportName: 'All_Scan_Sessions',
        id:         activeScanId
    }).then((resp) => {
        const rec = resp?.data;
        if (!rec) { return; }

        const status = rec.Scan_Status;
        const total  = parseInt(rec.Total_Rules_Checked) || 0;
        const passed = parseInt(rec.Rules_Passed)        || 0;
        const failed = parseInt(rec.Rules_Failed)        || 0;
        const warned = parseInt(rec.Rules_Warned)        || 0;
        const crit   = parseInt(rec.Critical_Failures)   || 0;

        // Update live counters
        setText('live-pass', passed);
        setText('live-fail', failed);
        setText('live-warn', warned);
        setText('live-crit', crit);

        // Update progress bar
        const pct = total > 0 ? Math.round(((passed + failed + warned) / total) * 100) : 0;
        setProgress(pct, `Checking rules… (${passed + failed + warned} of ${total})`);

        // Update ETA
        if (startTime && total > 0) {
            const elapsed = (Date.now() - startTime) / 1000;
            const done    = passed + failed + warned;
            if (done > 0) {
                const remaining = Math.round((elapsed / done) * (total - done));
                document.getElementById('scan-eta').textContent =
                    `Est. ${remaining}s remaining`;
            }
        }

        if (status === 'COMPLETED' || status === 'FAILED' || status === 'PARTIAL') {
            clearInterval(pollTimer);
            showDoneState(rec);
        } else {
            scheduleNextPoll();
        }
    }).catch(() => {
        scheduleNextPoll();
    });
}

function scheduleNextPoll() {
    clearTimeout(pollTimer);
    pollTimer = setTimeout(pollScanStatus, POLL_INTERVAL_MS);
}

// ── Show done state ───────────────────────────────────────────────────
function showDoneState(rec) {
    const failed = parseInt(rec.Rules_Failed) || 0;
    const crit   = parseInt(rec.Critical_Failures) || 0;

    setText('res-pass', rec.Rules_Passed  || 0);
    setText('res-fail', failed);
    setText('res-warn', rec.Rules_Warned  || 0);
    setText('res-rate', (rec.Pass_Rate_Pct || 0) + '%');

    const doneIcon  = document.getElementById('done-icon');
    const doneTitle = document.getElementById('done-title');

    if (crit > 0) {
        doneIcon.textContent  = '🔴';
        doneTitle.textContent = `${crit} Critical Failure${crit > 1 ? 's' : ''} Found`;
        doneTitle.style.color = '#dc2626';
    } else if (failed > 0) {
        doneIcon.textContent  = '⚠️';
        doneTitle.textContent = 'Scan Complete — Issues Found';
        doneTitle.style.color = '#d97706';
    } else {
        doneIcon.textContent  = '✅';
        doneTitle.textContent = 'All Clear!';
        doneTitle.style.color = '#059669';
    }

    showState('done');
}

// ── Navigate to findings ──────────────────────────────────────────────
function viewFindings() {
    if (activeScanId) {
        ZOHO.CREATOR.UI.openUrl({
            url: `https://creatorapp.zoho.in/${APP_NAME}/#Page:${FINDINGS_PAGE}?scan_id=${activeScanId}`,
            target: '_self'
        });
    }
}

// ── Reset to idle ────────────────────────────────────────────────────
function resetToIdle() {
    clearTimeout(pollTimer);
    activeScanId = null;
    startTime    = null;
    showState('idle');
    loadLastScanInfo();
}

// ── Helpers ───────────────────────────────────────────────────────────
function showState(name) {
    ['idle', 'running', 'done'].forEach((s) => {
        const el = document.getElementById(`state-${s}`);
        if (el) { el.hidden = (s !== name); }
    });
}

function setProgress(pct, label) {
    const bar = document.getElementById('progress-bar');
    const wrap = document.getElementById('progress-bar-wrap');
    if (bar)  { bar.style.width = `${pct}%`; }
    if (wrap) { wrap.setAttribute('aria-valuenow', pct); }
    setProgressLabel(label);
}

function setProgressLabel(text) {
    const el = document.getElementById('progress-label');
    if (el) { el.textContent = text; }
}

function resetLiveCounts() {
    ['live-pass', 'live-fail', 'live-warn', 'live-crit'].forEach((id) => setText(id, 0));
    setProgress(0, 'Initialising…');
    document.getElementById('scan-eta').textContent = '';
}

function setText(id, val) {
    const el = document.getElementById(id);
    if (el) { el.textContent = val; }
}

function showError(msg) {
    showState('idle');
    alert('Scan Error: ' + msg);
}

function getCurrentUser() {
    return ZOHO?.CREATOR?.USER?.email || 'unknown@funaiconsulting.in';
}
