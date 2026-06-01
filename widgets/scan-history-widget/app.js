/**
 * Widget:   scan-history-widget
 * Module:   Creator - fci_governance_scanner
 * Purpose:  Display a scrollable table of completed scan sessions with a
 *           pass-rate trend SVG chart for the 10 most recent scans.
 * Author:   India Tech Lead
 * Modified: 2026-05-27 — initial version
 */

'use strict';

const APP_NAME = 'fci_governance_scanner';

// ── Bootstrap ─────────────────────────────────────────────────────────────
window.ZOHO?.CREATOR?.init()
    .then(() => loadHistory())
    .catch(() => showState('error'));

// ── Load scan sessions ─────────────────────────────────────────────────────
function loadHistory() {
    showState('loading');

    ZOHO.CREATOR.API.getRecords({
        appName:    APP_NAME,
        reportName: 'All_Scan_Sessions',
        criteria:   '(Scan_Status == "COMPLETED")',
        page:       1,
        pageSize:   50,
        orderBy:    { field: 'Start_Time', type: 'desc' }
    })
    .then((resp) => {
        const sessions = resp?.data || [];
        if (sessions.length === 0) {
            renderEmptyState();
            showState('main');
            return;
        }
        renderTrendChart(sessions);
        renderTable(sessions);
        showState('main');
    })
    .catch(() => showState('error'));
}

// ── Render trend SVG ───────────────────────────────────────────────────────
function renderTrendChart(sessions) {
    // Take up to the 10 most recent completed sessions, then reverse for
    // chronological (left = oldest, right = most recent) chart order.
    const chartSessions = sessions.slice(0, 10).reverse();
    const n = chartSessions.length;

    const W = 400;
    const H = 120;
    const PAD_LEFT  = 36; // room for y-axis labels
    const PAD_RIGHT = 12;
    const PAD_TOP   = 10;
    const PAD_BOT   = 10;

    const plotW = W - PAD_LEFT - PAD_RIGHT;
    const plotH = H - PAD_TOP  - PAD_BOT;

    // Map a pass rate (0-100) to SVG y coordinate
    function yCoord(rate) {
        return PAD_TOP + plotH - (rate / 100) * plotH;
    }

    // Map index to SVG x coordinate
    function xCoord(i) {
        if (n === 1) return PAD_LEFT + plotW / 2;
        return PAD_LEFT + (i / (n - 1)) * plotW;
    }

    // ── Grid lines & y-axis labels ──
    const gridLines = [0, 25, 50, 75, 100].map((pct) => {
        const y = yCoord(pct);
        return `
        <line x1="${PAD_LEFT}" y1="${y}" x2="${W - PAD_RIGHT}" y2="${y}"
              stroke="#e5e7eb" stroke-width="1" stroke-dasharray="${pct === 0 || pct === 100 ? 'none' : '4 3'}" />
        <text x="${PAD_LEFT - 4}" y="${y + 4}" text-anchor="end"
              font-family="-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif"
              font-size="9" fill="#9ca3af">${pct}%</text>
        `;
    }).join('');

    // ── Polyline ──
    const points = chartSessions.map((s, i) => {
        const rate = parseFloat(s.Pass_Rate_Pct) || 0;
        return `${xCoord(i)},${yCoord(rate)}`;
    }).join(' ');

    // Filled area under the line
    const firstX = xCoord(0);
    const lastX  = xCoord(n - 1);
    const baseY  = yCoord(0);
    const areaPoints = `${firstX},${baseY} ${points} ${lastX},${baseY}`;

    // ── Dots with tooltips ──
    const dots = chartSessions.map((s, i) => {
        const rate = parseFloat(s.Pass_Rate_Pct) || 0;
        const cx   = xCoord(i);
        const cy   = yCoord(rate);
        const label = `${formatDateShort(s.Start_Time)} · ${rate.toFixed(0)}%`;
        return `
        <circle cx="${cx}" cy="${cy}" r="4"
                fill="#fff" stroke="#4f46e5" stroke-width="2">
            <title>${label}</title>
        </circle>`;
    }).join('');

    const svg = `
    <svg viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg" aria-label="Pass rate trend chart">
        <!-- Grid -->
        ${gridLines}
        <!-- Area fill -->
        <polygon points="${areaPoints}" fill="#4f46e5" fill-opacity="0.07" />
        <!-- Line -->
        <polyline points="${points}"
                  fill="none" stroke="#4f46e5" stroke-width="2"
                  stroke-linejoin="round" stroke-linecap="round" />
        <!-- Dots -->
        ${dots}
    </svg>`;

    const wrap = document.getElementById('trend-chart-wrap');
    if (wrap) { wrap.innerHTML = svg; }
}

// ── Render scan history table ──────────────────────────────────────────────
function renderTable(sessions) {
    const tbody = document.getElementById('scan-table-body');
    if (!tbody) { return; }
    tbody.innerHTML = '';

    sessions.forEach((s) => {
        const rate    = parseFloat(s.Pass_Rate_Pct) || 0;
        const passed  = parseInt(s.Rules_Passed)    || 0;
        const failed  = parseInt(s.Rules_Failed)    || 0;
        const total   = parseInt(s.Total_Rules_Checked) || (passed + failed);
        const scanType = (s.Scan_Type || 'FULL').toUpperCase();

        const typeBadgeClass = scanType === 'FULL' ? 'badge--indigo' : 'badge--grey';
        const ratePillClass  = rate >= 90 ? 'rate-pill--green'
                             : rate >= 70 ? 'rate-pill--yellow'
                             :              'rate-pill--red';

        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${formatDateFull(s.Start_Time)}</td>
            <td><span class="badge ${typeBadgeClass}">${scanType}</span></td>
            <td>${total}</td>
            <td style="color:#059669;font-weight:600">${passed}</td>
            <td style="color:#dc2626;font-weight:600">${failed}</td>
            <td><span class="rate-pill ${ratePillClass}">${rate.toFixed(0)}%</span></td>
            <td>
                <button class="btn btn--ghost btn--sm" onclick="viewScan('${s.ID}')">View</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

// ── Empty state ────────────────────────────────────────────────────────────
function renderEmptyState() {
    const tbody = document.getElementById('scan-table-body');
    if (!tbody) { return; }
    tbody.innerHTML = `
        <tr>
            <td colspan="7">
                <div class="empty-state">
                    <span class="empty-icon">📋</span>
                    <p>No scan history yet. Run your first scan to see results here.</p>
                </div>
            </td>
        </tr>`;

    // Also hide the trend chart section since there's no data
    const trendCard = document.querySelector('.trend-card');
    if (trendCard) { trendCard.hidden = true; }
}

// ── Navigation ─────────────────────────────────────────────────────────────
function viewScan(scanId) {
    ZOHO.CREATOR.UI.openUrl({
        url: `https://creatorapp.zoho.in/${APP_NAME}/#Page:Findings_Detail?scan_id=${scanId}`,
        target: '_self'
    });
}

function runNewScan() {
    ZOHO.CREATOR.UI.openUrl({
        url: `https://creatorapp.zoho.in/${APP_NAME}/#Page:Home`,
        target: '_self'
    });
}

// ── Date helpers ───────────────────────────────────────────────────────────
/**
 * Format a Zoho datetime string into "27 May 2026 14:32"
 * Zoho Creator typically returns datetimes as "dd-MMM-yyyy HH:mm:ss" or ISO.
 */
function formatDateFull(raw) {
    if (!raw) { return '—'; }
    const d = parseZohoDate(raw);
    if (!d) { return raw; }
    const day   = d.getDate();
    const month = d.toLocaleString('en-GB', { month: 'short' });
    const year  = d.getFullYear();
    const hh    = String(d.getHours()).padStart(2, '0');
    const mm    = String(d.getMinutes()).padStart(2, '0');
    return `${day} ${month} ${year} ${hh}:${mm}`;
}

/** Short form for chart tooltip: "27 May" */
function formatDateShort(raw) {
    if (!raw) { return ''; }
    const d = parseZohoDate(raw);
    if (!d) { return raw; }
    return `${d.getDate()} ${d.toLocaleString('en-GB', { month: 'short' })}`;
}

/**
 * Parse Zoho Creator date strings.
 * Handles: "27-May-2026 14:32:00", "2026-05-27T14:32:00", "2026-05-27 14:32:00"
 */
function parseZohoDate(raw) {
    if (!raw) { return null; }
    // Try native first (works for ISO)
    let d = new Date(raw);
    if (!isNaN(d.getTime())) { return d; }
    // Zoho-style: "27-May-2026 14:32:00"
    const match = raw.match(/^(\d{1,2})-([A-Za-z]{3})-(\d{4})\s+(\d{2}):(\d{2})/);
    if (match) {
        d = new Date(`${match[2]} ${match[1]}, ${match[3]} ${match[4]}:${match[5]}:00`);
        if (!isNaN(d.getTime())) { return d; }
    }
    return null;
}

// ── State manager ──────────────────────────────────────────────────────────
function showState(name) {
    const map = { loading: 'state-loading', main: 'state-main', error: 'state-error' };
    Object.entries(map).forEach(([key, id]) => {
        const el = document.getElementById(id);
        if (el) { el.hidden = (key !== name); }
    });
}
