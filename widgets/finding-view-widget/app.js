/**
 * Widget:    finding-view-widget
 * Module:    Creator - FCI_GovernanceScanner
 * Purpose:   Display full detail of a single Scan_Finding record and allow
 *            an operator to mark it as remediated (or skip it) by calling
 *            CRT_LogRemediation_fn.
 * URL params:
 *   finding_id — the Scan_Finding record ID (required)
 *   scan_id    — the parent Scan_Session record ID (used for back navigation)
 * Author:    India Tech Lead
 * Modified:  2026-05-27 — initial version
 */

'use strict';

// ── Constants ────────────────────────────────────────────────────────
const APP_NAME = 'fci_governance_scanner';

// ── State ────────────────────────────────────────────────────────────
/** @type {Object|null} The loaded finding record */
let currentFinding = null;

/** @type {string|null} */
let currentFindingId = null;

/** @type {string|null} */
let currentScanId = null;

/** @type {boolean} Whether an action (resolve / skip) is in-flight */
let actionInFlight = false;

// ── Init ─────────────────────────────────────────────────────────────
window.ZOHO?.CREATOR?.init()
    .then(() => onReady())
    .catch(() => showState('error'));

function onReady() {
    currentFindingId = getUrlParam('finding_id');
    currentScanId    = getUrlParam('scan_id');

    if (!currentFindingId) {
        showState('error');
        return;
    }
    loadFinding(currentFindingId);
}

// ── Load finding record ───────────────────────────────────────────────
function loadFinding(findingId) {
    showState('loading');

    ZOHO.CREATOR.API.getRecordById({
        appName:    APP_NAME,
        reportName: 'All_Scan_Findings',
        id:         findingId
    }).then((resp) => {
        const rec = resp?.data;
        if (!rec) {
            showState('error');
            return;
        }
        currentFinding = rec;
        renderFinding(rec);
        showState('main');
    }).catch(() => showState('error'));
}

// ── Render all finding data into the DOM ──────────────────────────────
function renderFinding(rec) {
    const status   = (rec.Finding_Status || '').toUpperCase();
    const severity = (rec.Severity       || '').toUpperCase();

    // ── Hero card ────────────────────────────────────────────────────
    const heroCard = document.getElementById('hero-card');
    if (heroCard) {
        // Left-border class based on status
        heroCard.classList.remove('hero-card--critical', 'hero-card--fail', 'hero-card--warn', 'hero-card--pass');
        if      (status === 'CRITICAL') { heroCard.classList.add('hero-card--critical'); }
        else if (status === 'FAIL')     { heroCard.classList.add('hero-card--fail'); }
        else if (status === 'WARN')     { heroCard.classList.add('hero-card--warn'); }
        else if (status === 'PASS')     { heroCard.classList.add('hero-card--pass'); }
    }

    // Severity badge
    const sevBadge = document.getElementById('hero-severity-badge');
    if (sevBadge) {
        sevBadge.textContent  = severity || '—';
        sevBadge.className    = 'badge ' + severityBadgeClass(severity);
    }

    // Module chip
    const modChip = document.getElementById('hero-module-chip');
    if (modChip) { modChip.textContent = rec.Module_Name || '—'; }

    // Rule ID
    setText('hero-rule-id', rec.Rule_ID || '—');

    // Rule name (the "headline" of the finding)
    setText('hero-rule-name', rec.Rule_Name || '—');

    // Finding detail text
    setText('hero-finding-detail', rec.Finding_Detail || '—');

    // ── Meta strip ───────────────────────────────────────────────────
    setText('meta-source', rec.Source_Record_Name || '—');
    renderStandardReference(rec.Standard_Reference || '');
    setText('meta-detected', formatDateTime(rec.Added_Time));

    // Status meta cell — show badge
    const metaStatus = document.getElementById('meta-status');
    if (metaStatus) {
        const sc = statusBadgeClass(status);
        metaStatus.innerHTML = `<span class="badge ${sc}">${esc(status || '—')}</span>`;
    }

    // ── Remediation steps ────────────────────────────────────────────
    renderRemediationSteps(rec.Remediation_Steps || '');

    // ── Remediation status panel ─────────────────────────────────────
    const isRemediated = rec.Is_Remediated === true || rec.Is_Remediated === 'true';
    if (isRemediated) {
        renderResolvedPanel(rec);
    } else {
        showPanel('open');
    }
}

// ── Render Standard_Reference field ──────────────────────────────────
function renderStandardReference(stdRef) {
    const dd = document.getElementById('meta-standard');
    if (!dd) { return; }

    if (!stdRef) {
        dd.textContent = '—';
        return;
    }

    // If it contains a .md filename, display as a code badge (not a link)
    if (/\.md/i.test(stdRef)) {
        dd.innerHTML = `<span class="std-ref-badge">${esc(stdRef)}</span>`;
    } else {
        dd.textContent = stdRef;
    }
}

// ── Render remediation steps as an ordered list ───────────────────────
function renderRemediationSteps(stepsText) {
    const ol = document.getElementById('remediation-steps-list');
    if (!ol) { return; }
    ol.innerHTML = '';

    if (!stepsText || !stepsText.trim()) {
        const empty = document.createElement('p');
        empty.className   = 'steps-empty';
        empty.textContent = 'No remediation steps have been documented for this rule.';
        ol.parentNode.insertBefore(empty, ol);
        ol.hidden = true;
        return;
    }

    // Split by newline; skip blank lines
    const lines = stepsText
        .split(/\r?\n/)
        .map((l) => l.trim())
        .filter(Boolean)
        // Strip leading "1." / "2." etc. if the author pre-numbered them
        .map((l) => l.replace(/^\d+\.\s*/, ''));

    lines.forEach((line) => {
        const li = document.createElement('li');
        li.textContent = line;
        ol.appendChild(li);
    });
}

// ── Show the resolved panel with remediation data ─────────────────────
function renderResolvedPanel(rec) {
    setText('res-by',   rec.Remediated_By   || 'unknown');
    setText('res-date', rec.Remediation_Date || '—');

    const notesEl = document.getElementById('res-notes');
    if (notesEl) {
        if (rec.Remediation_Notes) {
            notesEl.textContent = `"${rec.Remediation_Notes}"`;
        } else {
            notesEl.textContent = '';
        }
    }

    showPanel('resolved');
}

// ── "Mark as Resolved" button handler ────────────────────────────────
function markResolved() {
    if (actionInFlight) { return; }
    const notes = getNotesValue();
    if (!validateNotes(notes)) { return; }

    submitRemediation(notes, false);
}

// ── "Skip / Won't Fix" button handler ────────────────────────────────
function markSkipped() {
    if (actionInFlight) { return; }
    const rawNotes = getNotesValue();
    if (!validateNotes(rawNotes)) { return; }

    const notes = "Won't fix: " + rawNotes;
    submitRemediation(notes, true);
}

// ── Core remediation API call ─────────────────────────────────────────
function submitRemediation(notes, isSkip) {
    actionInFlight = true;
    setButtonsLoading(true);
    clearNotesError();

    const userEmail = getCurrentUser();

    ZOHO.CREATOR.API.executeFunction({
        appName:      APP_NAME,
        functionName: 'CRT_LogRemediation_fn',
        arguments:    JSON.stringify({
            finding_id:     currentFindingId,
            notes:          notes,
            remediated_by:  userEmail
        })
    }).then((resp) => {
        const result = resp?.response?.result;

        if (result && result.success === false) {
            // Function returned a business-logic error
            showActionError(result.message || 'Remediation function reported an error.');
            setButtonsLoading(false);
            actionInFlight = false;
            return;
        }

        // Success — update the local finding record and re-render the status panel
        if (currentFinding) {
            currentFinding.Is_Remediated    = true;
            currentFinding.Remediated_By    = userEmail;
            currentFinding.Remediation_Date = new Date().toISOString().slice(0, 10);
            currentFinding.Remediation_Notes = notes;
        }

        renderResolvedPanel(currentFinding || {
            Remediated_By:    userEmail,
            Remediation_Date: new Date().toISOString().slice(0, 10),
            Remediation_Notes: notes
        });

        actionInFlight = false;
    }).catch((err) => {
        console.error('[finding-view-widget] CRT_LogRemediation_fn error:', err);
        showActionError('An error occurred while logging the remediation. Please try again.');
        setButtonsLoading(false);
        actionInFlight = false;
    });
}

// ── Set loading state on action buttons ──────────────────────────────
function setButtonsLoading(isLoading) {
    const btnResolve = document.getElementById('btn-resolve');
    const btnSkip    = document.getElementById('btn-skip');
    const spResolve  = document.getElementById('btn-resolve-spinner');
    const spSkip     = document.getElementById('btn-skip-spinner');

    if (btnResolve) { btnResolve.disabled = isLoading; }
    if (btnSkip)    { btnSkip.disabled    = isLoading; }
    if (spResolve)  { spResolve.hidden    = !isLoading; }
    if (spSkip)     { spSkip.hidden       = !isLoading; }
}

// ── Navigation ────────────────────────────────────────────────────────
function navigateBack() {
    if (currentScanId) {
        ZOHO.CREATOR.UI.openUrl({
            url: `https://creatorapp.zoho.in/${APP_NAME}/#Page:Findings_Detail?scan_id=${currentScanId}`,
            target: '_self'
        });
    } else {
        history.back();
    }
}

// ── Panel visibility ──────────────────────────────────────────────────
function showPanel(name) {
    const panelOpen     = document.getElementById('panel-open');
    const panelResolved = document.getElementById('panel-resolved');
    if (panelOpen)     { panelOpen.hidden     = (name !== 'open'); }
    if (panelResolved) { panelResolved.hidden = (name !== 'resolved'); }
}

// ── Form helpers ──────────────────────────────────────────────────────
function getNotesValue() {
    const el = document.getElementById('notes-input');
    return (el?.value || '').trim();
}

function validateNotes(notes) {
    const textarea = document.getElementById('notes-input');
    const errEl    = document.getElementById('notes-error');

    if (!notes) {
        if (textarea) { textarea.classList.add('is-error'); }
        if (errEl)    { errEl.hidden = false; }
        return false;
    }
    clearNotesError();
    return true;
}

function clearNotesError() {
    const textarea = document.getElementById('notes-input');
    const errEl    = document.getElementById('notes-error');
    if (textarea) { textarea.classList.remove('is-error'); }
    if (errEl)    { errEl.hidden = true; }
}

function showActionError(msg) {
    const errEl = document.getElementById('notes-error');
    if (errEl) {
        errEl.textContent = msg;
        errEl.hidden      = false;
    }
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

/**
 * Returns the CSS class suffix for a severity value.
 * @param {string} severity
 * @returns {string}
 */
function severityBadgeClass(severity) {
    switch ((severity || '').toUpperCase()) {
        case 'CRITICAL': return 'badge--critical';
        case 'HIGH':     return 'badge--high';
        case 'MEDIUM':   return 'badge--medium';
        case 'LOW':      return 'badge--low';
        default:         return '';
    }
}

/**
 * Returns the CSS class for a Finding_Status value.
 * @param {string} status
 * @returns {string}
 */
function statusBadgeClass(status) {
    switch ((status || '').toUpperCase()) {
        case 'CRITICAL': return 'badge--crit-status';
        case 'FAIL':     return 'badge--fail';
        case 'WARN':     return 'badge--warn';
        case 'PASS':     return 'badge--pass';
        default:         return '';
    }
}

/**
 * HTML-escape a string for safe insertion into innerHTML.
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
 * Format an ISO/Zoho datetime string to a human-readable local string.
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
 * Get the current Zoho Creator user's email address.
 * @returns {string}
 */
function getCurrentUser() {
    return ZOHO?.CREATOR?.USER?.email || 'unknown@funaiconsulting.in';
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
