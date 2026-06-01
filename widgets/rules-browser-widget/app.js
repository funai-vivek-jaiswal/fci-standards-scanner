/**
 * Widget:    rules-browser-widget
 * Module:    Creator — FCI_GovernanceScanner
 * Purpose:   Browse, search, filter, and enable/disable scan rules
 *            stored in the Rule_Repository form. Allows seeding
 *            default rules via CRT_SeedRules_fn.
 * Author:    India Tech Lead
 * Modified:  2026-05-27 — initial version
 */

'use strict';

const APP_NAME = 'fci_governance_scanner';

// All loaded rules (full list)
let allRules = [];
// Pending toggle changes (rule ID → enabled bool) not yet saved
let pendingToggles = {};

// ── Init ──────────────────────────────────────────────────────────────
window.ZOHO?.CREATOR?.init()
    .then(() => loadRules())
    .catch(() => showState('error'));

// ── Load rules ────────────────────────────────────────────────────────
function loadRules() {
    showState('loading');
    pendingToggles = {};

    ZOHO.CREATOR.API.getRecords({
        appName:    APP_NAME,
        reportName: 'All_Rules',
        page:       1,
        pageSize:   200,
        orderBy:    { field: 'Module_Name', type: 'asc' }
    }).then((resp) => {
        allRules = resp?.data || [];
        if (allRules.length === 0) {
            showState('empty');
        } else {
            renderStats(allRules);
            applyFilters();
            showState('main');
            document.getElementById('stats-bar').hidden = false;
        }
    }).catch(() => showState('error'));
}

// ── Render stats chips ────────────────────────────────────────────────
function renderStats(rules) {
    const enabled  = rules.filter((r) => r.Is_Enabled === true || r.Is_Enabled === 'true').length;
    const critical = rules.filter((r) => r.Severity === 'CRITICAL').length;
    const high     = rules.filter((r) => r.Severity === 'HIGH').length;
    const medium   = rules.filter((r) => r.Severity === 'MEDIUM').length;
    const low      = rules.filter((r) => r.Severity === 'LOW').length;

    setText('stat-total',    rules.length);
    setText('stat-enabled',  enabled);
    setText('stat-critical', critical);
    setText('stat-high',     high);
    setText('stat-medium',   medium);
    setText('stat-low',      low);
}

// ── Apply filters (client-side) ───────────────────────────────────────
function applyFilters() {
    const mod      = document.getElementById('filter-module')?.value  || '';
    const sev      = document.getElementById('filter-severity')?.value || '';
    const enabled  = document.getElementById('filter-enabled')?.value  || '';
    const search   = (document.getElementById('filter-search')?.value  || '').toLowerCase().trim();

    const filtered = allRules.filter((r) => {
        if (mod     && r.Module_Name !== mod)  { return false; }
        if (sev     && r.Severity    !== sev)  { return false; }
        if (enabled !== '') {
            const isEnabled = r.Is_Enabled === true || r.Is_Enabled === 'true';
            if (enabled === 'true'  && !isEnabled) { return false; }
            if (enabled === 'false' && isEnabled)  { return false; }
        }
        if (search) {
            const haystack = [r.Rule_ID, r.Rule_Name, r.Check_Type, r.Standard_Reference]
                .join(' ').toLowerCase();
            if (!haystack.includes(search)) { return false; }
        }
        return true;
    });

    renderTable(filtered);
    setText('results-count', `${filtered.length} of ${allRules.length} rules`);
}

// ── Render rules table ────────────────────────────────────────────────
function renderTable(rules) {
    const tbody = document.getElementById('rules-tbody');
    if (!tbody) { return; }

    if (rules.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="7" style="text-align:center;padding:32px;color:#9ca3af;">
                    No rules match the current filters.
                </td>
            </tr>`;
        return;
    }

    tbody.innerHTML = '';

    rules.forEach((rule) => {
        // Use pending toggle state if there's one, otherwise use record value
        const isEnabled = pendingToggles.hasOwnProperty(rule.ID)
            ? pendingToggles[rule.ID]
            : (rule.Is_Enabled === true || rule.Is_Enabled === 'true');

        const tr = document.createElement('tr');
        tr.className = 'rule-row' + (isEnabled ? '' : ' rule-row--disabled');
        tr.innerHTML = `
            <td class="col-id">
                <code class="rule-id">${escHtml(rule.Rule_ID || '—')}</code>
            </td>
            <td class="col-module">
                <span class="module-tag module-tag--${(rule.Module_Name || '').toLowerCase().replace('-','')}">${escHtml(rule.Module_Name || '—')}</span>
            </td>
            <td class="col-name">
                <span class="rule-name">${escHtml(rule.Rule_Name || '—')}</span>
                ${rule.Rule_Description ? `<span class="rule-desc">${escHtml(truncate(rule.Rule_Description, 80))}</span>` : ''}
            </td>
            <td class="col-check">
                <span class="check-type">${escHtml(rule.Check_Type || '—')}</span>
            </td>
            <td class="col-sev">
                ${severityBadge(rule.Severity)}
            </td>
            <td class="col-ref">
                ${rule.Standard_Reference
                    ? `<span class="std-ref" title="${escHtml(rule.Standard_Reference)}">${escHtml(truncate(rule.Standard_Reference, 30))}</span>`
                    : '<span style="color:#9ca3af">—</span>'}
            </td>
            <td class="col-toggle">
                <label class="toggle" title="${isEnabled ? 'Click to disable' : 'Click to enable'}">
                    <input type="checkbox" class="toggle__input"
                           ${isEnabled ? 'checked' : ''}
                           onchange="toggleRule('${escHtml(rule.ID)}', this.checked)" />
                    <span class="toggle__track"></span>
                </label>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

// ── Toggle rule enabled/disabled ──────────────────────────────────────
function toggleRule(ruleId, enabled) {
    // Optimistically update pending state
    pendingToggles[ruleId] = enabled;

    // Update row style immediately
    const row = document.querySelector(`.rule-row [onchange*="${ruleId}"]`)?.closest('tr');
    if (row) {
        row.classList.toggle('rule-row--disabled', !enabled);
    }

    // Persist to Creator
    ZOHO.CREATOR.API.updateRecord({
        appName:    APP_NAME,
        reportName: 'All_Rules',
        id:         ruleId,
        data:       { data: { Is_Enabled: enabled } }
    }).then((resp) => {
        if (resp?.code !== 3000 && resp?.code !== 200) {
            // Revert on failure
            pendingToggles[ruleId] = !enabled;
            applyFilters();
            showToast('⚠️ Could not update rule. Please try again.', 'warn');
        } else {
            // Update allRules in memory
            const rec = allRules.find((r) => r.ID === ruleId);
            if (rec) { rec.Is_Enabled = enabled; }
            delete pendingToggles[ruleId];
            renderStats(allRules);
        }
    }).catch(() => {
        pendingToggles[ruleId] = !enabled;
        applyFilters();
        showToast('⚠️ Network error. Rule state not saved.', 'warn');
    });
}

// ── Seed rules ────────────────────────────────────────────────────────
function seedRules() {
    document.getElementById('seed-modal').hidden = false;
}

function closeSeedModal() {
    document.getElementById('seed-modal').hidden = true;
    const status = document.getElementById('seed-status');
    if (status) { status.hidden = true; status.className = ''; status.textContent = ''; }
    document.getElementById('btn-confirm-seed').disabled   = false;
    document.getElementById('btn-cancel-seed').disabled    = false;
    document.getElementById('btn-confirm-seed').textContent = '✓ Seed Rules';
}

function confirmSeedRules() {
    const btnConfirm = document.getElementById('btn-confirm-seed');
    const btnCancel  = document.getElementById('btn-cancel-seed');
    const status     = document.getElementById('seed-status');

    btnConfirm.disabled    = true;
    btnCancel.disabled     = true;
    btnConfirm.textContent = '⏳ Seeding…';
    status.hidden          = false;
    status.className       = 'seed-status seed-status--loading';
    status.innerHTML       = '<span class="spinner-sm"></span> Seeding rules, please wait…';

    ZOHO.CREATOR.API.executeFunction({
        appName:      APP_NAME,
        functionName: 'CRT_SeedRules_fn',
        arguments:    JSON.stringify({})
    }).then((resp) => {
        const result = resp?.response?.result;
        const count  = result?.rules_seeded || result?.count || '50+';

        status.className       = 'seed-status seed-status--success';
        status.textContent     = `✅ ${count} rules seeded successfully!`;
        btnConfirm.textContent = '✓ Done';

        // Reload rules after 1.5s
        setTimeout(() => {
            closeSeedModal();
            loadRules();
        }, 1500);
    }).catch((err) => {
        status.className    = 'seed-status seed-status--error';
        status.textContent  = '❌ Seeding failed. Check function logs.';
        btnConfirm.disabled = false;
        btnCancel.disabled  = false;
        btnConfirm.textContent = '↺ Retry';
        console.error('[rules-browser-widget] Seed error:', err);
    });
}

function refreshRules() {
    document.getElementById('stats-bar').hidden = true;
    loadRules();
}

// ── Toast notification (lightweight) ──────────────────────────────────
function showToast(msg, type) {
    let toast = document.getElementById('toast');
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'toast';
        document.body.appendChild(toast);
    }
    toast.textContent = msg;
    toast.className = `toast toast--${type} toast--visible`;
    clearTimeout(toast._timer);
    toast._timer = setTimeout(() => { toast.className = 'toast'; }, 3000);
}

// ── Helpers ───────────────────────────────────────────────────────────
function showState(name) {
    ['loading', 'main', 'empty', 'error'].forEach((s) => {
        const el = document.getElementById(`state-${s}`);
        if (el) { el.hidden = (s !== name); }
    });
}

function setText(id, val) {
    const el = document.getElementById(id);
    if (el) { el.textContent = val ?? '—'; }
}

function escHtml(str) {
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

function truncate(str, maxLen) {
    if (!str) { return ''; }
    return str.length > maxLen ? str.slice(0, maxLen) + '…' : str;
}

function severityBadge(severity) {
    const map = {
        CRITICAL: 'badge--critical',
        HIGH:     'badge--high',
        MEDIUM:   'badge--medium',
        LOW:      'badge--low'
    };
    const cls = map[severity] || 'badge--grey';
    return `<span class="badge ${cls}">${escHtml(severity || '—')}</span>`;
}
