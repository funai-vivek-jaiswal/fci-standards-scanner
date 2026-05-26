/**
 * Widget:    dashboard-summary-widget
 * Module:    Creator - FCI_GovernanceScanner
 * Purpose:   Display pass/fail summary from the latest scan session.
 *            Shows overall pass rate, per-module breakdown, and
 *            critical open findings. Auto-refreshes every 60 seconds.
 * Author:    India Tech Lead
 * Modified:  2026-05-26 — initial version
 */

'use strict';

const APP_NAME      = 'fci_governance_scanner';
const REFRESH_MS    = 60_000;

// ── Init ──────────────────────────────────────────────────────────────
window.ZOHO?.CREATOR?.init()
    .then(() => loadDashboardData())
    .catch(() => showState('error'));

setInterval(loadDashboardData, REFRESH_MS);

// ── Load dashboard data ───────────────────────────────────────────────
function loadDashboardData() {
    showState('loading');

    // Fetch latest completed scan session
    ZOHO.CREATOR.API.getRecords({
        appName:    APP_NAME,
        reportName: 'All_Scan_Sessions',
        criteria:   '(Scan_Status == "COMPLETED")',
        page:       1,
        pageSize:   1,
        orderBy:    { field: 'Start_Time', type: 'desc' }
    }).then((resp) => {
        const records = resp?.data;
        if (!records || records.length === 0) {
            showState('error');
            return;
        }
        const session = records[0];
        renderSummary(session);
        loadModuleBreakdown(session.ID);
        loadCriticalFindings(session.ID);
    }).catch(() => showState('error'));
}

// ── Render overall summary ────────────────────────────────────────────
function renderSummary(session) {
    const passRate = parseFloat(session.Pass_Rate_Pct) || 0;
    const passed   = parseInt(session.Rules_Passed)   || 0;
    const failed   = parseInt(session.Rules_Failed)   || 0;
    const warned   = parseInt(session.Rules_Warned)   || 0;
    const crit     = parseInt(session.Critical_Failures) || 0;
    const date     = session.Start_Time || '—';

    setText('last-scan-date', `Last scan: ${date}`);
    setText('pass-rate-value', `${passRate.toFixed(0)}%`);

    // Colour the badge based on pass rate
    const badge = document.getElementById('pass-rate-badge');
    if (badge) {
        badge.style.borderColor = passRate >= 90 ? '#10b981' : passRate >= 70 ? '#f59e0b' : '#ef4444';
        badge.querySelector('span').style.color = passRate >= 90 ? '#059669' : passRate >= 70 ? '#d97706' : '#dc2626';
    }

    // Progress bar
    const bar = document.getElementById('overall-bar');
    if (bar) { bar.style.width = `${passRate}%`; }

    setText('stat-pass', passed);
    setText('stat-fail', failed);
    setText('stat-warn', warned);
    setText('stat-crit', crit);

    showState('main');
}

// ── Load per-module breakdown from findings ───────────────────────────
function loadModuleBreakdown(scanId) {
    const modules = ['CRM', 'Creator', 'People', 'Analytics', 'Sigma', 'Recruit', 'Forms'];
    const tbody   = document.getElementById('module-table-body');
    if (!tbody) { return; }
    tbody.innerHTML = '';

    const promises = modules.map((mod) =>
        ZOHO.CREATOR.API.getRecords({
            appName:    APP_NAME,
            reportName: 'All_Scan_Findings',
            criteria:   `(Scan_Session == "${scanId}" && Module_Name == "${mod}")`,
            page:       1,
            pageSize:   200
        }).then((resp) => ({ module: mod, records: resp?.data || [] }))
          .catch(() => ({ module: mod, records: [] }))
    );

    Promise.all(promises).then((results) => {
        results.forEach(({ module, records }) => {
            if (records.length === 0) { return; }
            const pass = records.filter((r) => r.Finding_Status === 'PASS').length;
            const fail = records.filter((r) => r.Finding_Status === 'FAIL').length;
            const crit = records.filter((r) => r.Finding_Status === 'FAIL' && r.Severity === 'CRITICAL').length;
            const total = pass + fail;
            const rate  = total > 0 ? Math.round((pass / total) * 100) : 0;
            const pill  = rate >= 90 ? 'green' : rate >= 70 ? 'yellow' : 'red';

            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td><strong>${module}</strong></td>
                <td style="color:#059669">${pass}</td>
                <td style="color:#dc2626">${fail}</td>
                <td style="color:#b91c1c;font-weight:700">${crit || '—'}</td>
                <td><span class="rate-pill rate-pill--${pill}">${rate}%</span></td>
            `;
            tbody.appendChild(tr);
        });
    });
}

// ── Load critical open findings ───────────────────────────────────────
function loadCriticalFindings(scanId) {
    ZOHO.CREATOR.API.getRecords({
        appName:    APP_NAME,
        reportName: 'All_Scan_Findings',
        criteria:   `(Scan_Session == "${scanId}" && Finding_Status == "FAIL" && Severity == "CRITICAL" && Is_Remediated == false)`,
        page:       1,
        pageSize:   5,
        orderBy:    { field: 'Added_Time', type: 'desc' }
    }).then((resp) => {
        const records = resp?.data || [];
        const section = document.getElementById('findings-section');
        const list    = document.getElementById('findings-list');
        if (!section || !list) { return; }

        if (records.length === 0) {
            section.hidden = true;
            return;
        }

        list.innerHTML = '';
        records.forEach((rec) => {
            const li = document.createElement('li');
            li.className = 'finding-item';
            li.innerHTML = `<strong>${rec.Module_Name}</strong>: ${rec.Source_Record_Name} — ${rec.Finding_Detail}`;
            list.appendChild(li);
        });

        section.hidden = false;
    }).catch(() => {});
}

// ── Navigate to findings page ────────────────────────────────────────
function openFindingsPage() {
    ZOHO.CREATOR.UI.openUrl({
        url: `https://creatorapp.zoho.in/${APP_NAME}/#Page:Findings_Detail`,
        target: '_self'
    });
    return false;
}

// ── Helpers ───────────────────────────────────────────────────────────
function showState(name) {
    const stateMap = { loading: 'state-loading', main: 'state-main', error: 'state-error' };
    Object.entries(stateMap).forEach(([key, id]) => {
        const el = document.getElementById(id);
        if (el) { el.hidden = (key !== name); }
    });
}

function setText(id, val) {
    const el = document.getElementById(id);
    if (el) { el.textContent = val ?? '—'; }
}
