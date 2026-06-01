/**
 * Widget:   setup-wizard-widget
 * Module:   Creator - fci_governance_scanner
 * Purpose:  4-step wizard: Welcome → Configure Connections → Verify → Complete.
 *           Loads Module_Connection records, runs live connection tests, seeds
 *           rules, then navigates to the main app.
 * Author:   India Tech Lead
 * Modified: 2026-05-27 — initial version
 */

'use strict';

const APP_NAME = 'fci_governance_scanner';

// All 8 modules in canonical order
const ALL_MODULES = ['CRM', 'People', 'Creator', 'Analytics', 'Sigma', 'Recruit', 'Forms', 'Catalyst'];

// State shared between steps
const state = {
    currentStep:    1,
    connections:    {},   // module → { status, connectionName, errorMessage, id }
    verifyResults:  {},   // module → 'ok' | 'fail' | 'testing'
    verifyDone:     false,
    seedDone:       false,
};

// ── Bootstrap ─────────────────────────────────────────────────────────────
window.ZOHO?.CREATOR?.init()
    .then(() => {
        goToStep(1);
        preloadConnections();
    })
    .catch(() => {
        // Even without ZOHO init we render the wizard in dev/preview mode
        goToStep(1);
        preloadConnections();
    });

// ── Preload connection records so Step 2 renders fast ─────────────────────
function preloadConnections() {
    ZOHO.CREATOR.API.getRecords({
        appName:    APP_NAME,
        reportName: 'All_Module_Connections',
        page:       1,
        pageSize:   50
    })
    .then((resp) => {
        const records = resp?.data || [];
        records.forEach((rec) => {
            const mod = (rec.Module_Name || '').trim();
            if (mod) {
                state.connections[mod] = {
                    id:             rec.ID,
                    status:         rec.Connection_Status || 'DISCONNECTED',
                    connectionName: rec.Connection_Name || '',
                    errorMessage:   rec.Error_Message   || '',
                };
            }
        });
        // If we are already on step 2, re-render the table
        if (state.currentStep === 2) { renderConnectionTable(); }
    })
    .catch(() => {
        // Connections table will show "Not configured" for all modules — acceptable
    });
}

// ── Step navigation ────────────────────────────────────────────────────────
function goToStep(step) {
    state.currentStep = step;

    // Show / hide panes
    for (let i = 1; i <= 4; i++) {
        const pane = document.getElementById(`step-${i}`);
        if (pane) { pane.hidden = (i !== step); }
    }

    // Update stepper indicators
    for (let i = 1; i <= 4; i++) {
        const el = document.getElementById(`step-indicator-${i}`);
        if (!el) { continue; }
        el.className = 'stepper-step ' + (
            i < step  ? 'done'   :
            i === step ? 'active' :
                        'future'
        );
        // Replace done step circles with a checkmark
        const circle = el.querySelector('.stepper-circle');
        if (circle) {
            circle.textContent = i < step ? '✓' : String(i);
        }
    }

    // Step-specific init
    if (step === 2) { renderConnectionTable(); }
    if (step === 3) { startVerification(); }
    if (step === 4) { renderCompletePage(); }
}

// ════════════════════════════════════════════════════════════════════════════
// STEP 2 — Connections table
// ════════════════════════════════════════════════════════════════════════════
function renderConnectionTable() {
    const tbody = document.getElementById('conn-table-body');
    if (!tbody) { return; }
    tbody.innerHTML = '';

    ALL_MODULES.forEach((mod) => {
        const conn   = state.connections[mod];
        const status = conn?.status || 'DISCONNECTED';

        const statusHtml = buildConnectionStatusHtml(mod, status, conn);

        const tr = document.createElement('tr');
        tr.id = `conn-row-${mod}`;
        tr.innerHTML = `
            <td><strong>${mod}</strong></td>
            <td id="conn-status-${mod}">${statusHtml}</td>
            <td>${buildConnectionActionHtml(mod, status)}</td>
        `;
        tbody.appendChild(tr);
    });
}

function buildConnectionStatusHtml(mod, status, conn) {
    if (status === 'CONNECTED') {
        const name = conn?.connectionName ? ` (${conn.connectionName})` : '';
        return `<span class="conn-status--connected">● Connected${name}</span>`;
    }
    if (status === 'ERROR') {
        const msg = conn?.errorMessage ? ` — ${conn.errorMessage}` : '';
        return `<span class="conn-status--error">⚠ Error${msg}</span>`;
    }
    // DISCONNECTED or no record
    return `<span class="conn-status--disconnected"
        data-tooltip="Add the connection in Creator Settings → Connections, then return here"
    >○ Not configured</span>`;
}

function buildConnectionActionHtml(mod, status) {
    if (status === 'CONNECTED') {
        return `<button class="btn btn--ghost btn--sm" onclick="testConnection('${mod}')">Test</button>`;
    }
    return `<span style="color:#d1d5db;font-size:12px">—</span>`;
}

// Live connection test from Step 2
function testConnection(moduleName) {
    const statusCell = document.getElementById(`conn-status-${moduleName}`);
    if (statusCell) {
        statusCell.innerHTML = `<span style="color:#6b7280;font-size:12px"><span class="spinner spinner--sm" style="vertical-align:middle;margin-right:4px"></span> Testing…</span>`;
    }

    ZOHO.CREATOR.API.executeFunction({
        appName:      APP_NAME,
        functionName: 'CRT_TestModuleConnection_fn',
        arguments:    JSON.stringify({ module: moduleName })
    })
    .then((resp) => {
        const result = resp?.response?.result;
        const ok = result?.success === true || result?.status === 'ok' || result === 'ok';
        if (ok) {
            state.connections[moduleName] = Object.assign(
                state.connections[moduleName] || {},
                { status: 'CONNECTED' }
            );
        } else {
            state.connections[moduleName] = Object.assign(
                state.connections[moduleName] || {},
                { status: 'ERROR', errorMessage: result?.message || 'Test failed' }
            );
        }
        if (statusCell) {
            const conn = state.connections[moduleName];
            statusCell.innerHTML = buildConnectionStatusHtml(moduleName, conn.status, conn);
        }
    })
    .catch(() => {
        if (statusCell) {
            statusCell.innerHTML = `<span class="conn-status--error">⚠ Test failed</span>`;
        }
        state.connections[moduleName] = Object.assign(
            state.connections[moduleName] || {},
            { status: 'ERROR', errorMessage: 'Test failed' }
        );
    });
}

// ════════════════════════════════════════════════════════════════════════════
// STEP 3 — Verify (sequential test with animated progress bars)
// ════════════════════════════════════════════════════════════════════════════
function startVerification() {
    // Reset results
    state.verifyResults = {};
    state.verifyDone    = false;

    const list = document.getElementById('verify-list');
    if (!list) { return; }
    list.innerHTML = '';

    // Build rows
    ALL_MODULES.forEach((mod) => {
        const li = document.createElement('li');
        li.className = 'verify-item';
        li.id = `verify-item-${mod}`;
        li.innerHTML = `
            <span class="verify-module-name">${mod}</span>
            <div class="verify-bar-wrap">
                <div class="verify-bar-fill" id="verify-bar-${mod}"></div>
            </div>
            <span class="verify-status" id="verify-status-${mod}">⏳ Waiting…</span>
        `;
        list.appendChild(li);
    });

    // Hide summary and disable next button
    const summary = document.getElementById('verify-summary');
    if (summary) { summary.hidden = true; }
    const nextBtn = document.getElementById('btn-next-scan');
    if (nextBtn) { nextBtn.disabled = true; }

    // Run tests sequentially with 400ms gap
    runVerifySequence(0);
}

function runVerifySequence(index) {
    if (index >= ALL_MODULES.length) {
        onAllVerifyDone();
        return;
    }

    const mod       = ALL_MODULES[index];
    const barEl     = document.getElementById(`verify-bar-${mod}`);
    const statusEl  = document.getElementById(`verify-status-${mod}`);

    if (statusEl) { statusEl.innerHTML = `<span class="spinner spinner--sm"></span> Testing…`; }

    // Animate progress bar to 100% over ~1.5 s (staggered by index*40ms via CSS delay)
    if (barEl) {
        // Small delay so the browser paints the row first
        setTimeout(() => { barEl.style.width = '100%'; }, 30);
    }

    ZOHO.CREATOR.API.executeFunction({
        appName:      APP_NAME,
        functionName: 'CRT_TestModuleConnection_fn',
        arguments:    JSON.stringify({ module: mod })
    })
    .then((resp) => {
        const result = resp?.response?.result;
        const ok = result?.success === true || result?.status === 'ok' || result === 'ok';
        state.verifyResults[mod] = ok ? 'ok' : 'fail';

        if (statusEl) {
            statusEl.textContent = ok ? '✅ OK' : '❌ Failed';
            statusEl.style.color = ok ? '#059669' : '#dc2626';
        }
        if (barEl) {
            barEl.style.background = ok ? '#10b981' : '#ef4444';
        }
    })
    .catch(() => {
        state.verifyResults[mod] = 'fail';
        if (statusEl) { statusEl.textContent = '❌ Failed'; statusEl.style.color = '#dc2626'; }
        if (barEl)    { barEl.style.background = '#ef4444'; }
    })
    .finally(() => {
        // 400ms gap between module tests
        setTimeout(() => runVerifySequence(index + 1), 400);
    });
}

function onAllVerifyDone() {
    state.verifyDone = true;

    const okCount   = Object.values(state.verifyResults).filter((v) => v === 'ok').length;
    const total     = ALL_MODULES.length;

    const summary = document.getElementById('verify-summary');
    if (summary) {
        summary.textContent = `${okCount} of ${total} connections successful`;
        summary.style.color = okCount === total ? '#059669' : okCount >= 4 ? '#d97706' : '#dc2626';
        summary.hidden = false;
    }

    const nextBtn = document.getElementById('btn-next-scan');
    if (nextBtn) { nextBtn.disabled = false; }
}

// ════════════════════════════════════════════════════════════════════════════
// STEP 4 — Complete
// ════════════════════════════════════════════════════════════════════════════
function renderCompletePage() {
    const okCount = Object.values(state.verifyResults).filter((v) => v === 'ok').length;
    const subtitle = document.getElementById('complete-subtitle');
    if (subtitle) {
        subtitle.textContent = `${okCount} of ${ALL_MODULES.length} modules connected and ready.`;
    }
}

// ── Seed rules ─────────────────────────────────────────────────────────────
function seedRules() {
    if (state.seedDone) { return; }

    const btn        = document.getElementById('btn-seed');
    const resultEl   = document.getElementById('seed-result');

    if (btn) {
        btn.disabled = true;
        btn.innerHTML = `<span class="spinner spinner--sm"></span> Seeding…`;
    }

    ZOHO.CREATOR.API.executeFunction({
        appName:      APP_NAME,
        functionName: 'CRT_SeedRules_fn',
        arguments:    JSON.stringify({})
    })
    .then((resp) => {
        state.seedDone = true;
        const count = resp?.response?.result?.count || 50;
        if (btn) { btn.hidden = true; }
        if (resultEl) {
            resultEl.textContent = `✅ ${count} rules seeded successfully`;
            resultEl.hidden = false;
        }
    })
    .catch(() => {
        if (btn) {
            btn.disabled = false;
            btn.innerHTML = '✓ Seed Rules Now';
        }
        if (resultEl) {
            resultEl.textContent = '⚠ Seeding failed — please try again';
            resultEl.style.color = '#dc2626';
            resultEl.hidden = false;
        }
    });
}

// ── Navigation ─────────────────────────────────────────────────────────────
function navTo(page) {
    ZOHO.CREATOR.UI.openUrl({
        url:    `https://creatorapp.zoho.in/${APP_NAME}/#Page:${page}`,
        target: '_self'
    });
}

// ── URL param helper (not used in this wizard but included per spec) ────────
function getUrlParam(name) {
    const hash = window.location.hash || window.parent?.location?.hash || '';
    const idx  = hash.indexOf('?');
    if (idx < 0) { return null; }
    return new URLSearchParams(hash.slice(idx + 1)).get(name);
}

function getCurrentUser() {
    return ZOHO?.CREATOR?.USER?.email || 'unknown@funaiconsulting.in';
}
