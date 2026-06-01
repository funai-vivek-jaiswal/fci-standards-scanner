# FCI Governance Scanner — Screen Map & End-to-End User Guide

> This document describes every screen in the Standards Scanner application, how to navigate between them, and how each screen connects to the underlying Zoho Creator forms, functions, and widgets.

---

## 🗺️ Navigation Flow

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                     FCI GOVERNANCE SCANNER — SCREEN FLOW                        │
└─────────────────────────────────────────────────────────────────────────────────┘

First-time setup:
  [Setup Wizard] ──→ Configure connections ──→ Verify ──→ Seed Rules ──→ [Dashboard]

Daily/weekly workflow:
  [Dashboard] ──→ [Run Scan] ──(scan starts)──→ scan in progress ──→ scan done
                                                                         │
                                               ┌─────────────────────────┘
                                               ▼
                                        [Findings List]
                                               │
                              click a finding  │
                                               ▼
                                       [Finding Detail]
                                         - Review fix
                                         - Add notes
                                         - Mark resolved
                                               │
                                    back       │
                                               ▼
                                        [Findings List]

History & trend monitoring:
  [Scan History] ──→ click any past scan ──→ [Findings List] (for that scan)

Rules management:
  [Rules Browser] ──→ toggle rules on/off, seed defaults
```

---

## 📱 Screens Reference

### Screen 1 — Dashboard  
**Creator Page:** `Home`  
**Widget:** `dashboard-summary-widget`

**What it shows:**
- Overall pass rate badge (large %)
- Progress bar (green gradient)
- 4 stat cards: Passed / Failed / Warnings / Critical
- Per-module breakdown table (CRM, People, Creator, Analytics, Sigma, Recruit, Forms)
- Open critical findings list (top 5) with direct links

**Data sources:**
- `All_Scan_Sessions` report — latest COMPLETED session
- `All_Scan_Findings` report — 7 parallel queries, one per module
- Auto-refreshes every 60 seconds

**User actions:**
| Action | Result |
|---|---|
| "View all findings →" link | Navigate to Findings_Detail page |
| Auto-refresh (every 60s) | Reload latest scan data |

---

### Screen 2 — Run Scan  
**Creator Page:** `Home` (second widget on the page, or standalone page)  
**Widget:** `scan-progress-widget`

**States:**
1. **Idle** — Shows "Run Full Scan" button + module-specific scan dropdown + last scan info
2. **Running** — Spinner + animated progress bar + live counters (updated every 3s polling)
3. **Done** — Result summary (pass/fail/warn/rate) + action buttons

**Data sources:**
- Calls `CRT_InitiateFullScan_fn` to start — returns `{ scan_id }`
- Polls `All_Scan_Sessions` record by ID every 3 seconds for status updates

**User actions:**
| Action | Result |
|---|---|
| "Run Full Scan" | Triggers scan across all 8 connected modules |
| Module select + "Scan →" | Triggers single-module scan |
| "View Findings →" (done state) | Navigate to `Findings_Detail?scan_id=xxx` |
| "Run Another Scan" | Resets to idle state |

---

### Screen 3 — Findings List  
**Creator Page:** `Findings_Detail`  
**Widget:** `findings-detail-widget`  
**URL param:** `?scan_id=<session_id>`

**What it shows:**
- Scan session subheader (type, date, rules count, pass rate)
- Filter toolbar: Module / Severity / Status / Search
- Results count (e.g. "Showing 8 of 48")
- Findings table with left-border colour coding:
  - 🔴 Dark red border = CRITICAL
  - 🔴 Red border = FAIL
  - 🟡 Amber border = WARN
  - 🟢 Green border = PASS
- Export CSV button (downloads visible rows)

**Severity filter logic:**
- "Critical" filter = `Finding_Status == "CRITICAL" OR Severity == "CRITICAL"`
- High/Medium/Low filter = `Severity` field
- Status filter (FAIL/WARN/PASS) = `Finding_Status` field

**User actions:**
| Action | Result |
|---|---|
| Click any row | Navigate to `Finding_View?finding_id=ID&scan_id=SCAN_ID` |
| "View →" button | Same as clicking the row |
| "← Back" | Navigate to Dashboard (Home) |
| Module/Severity/Status dropdowns | Client-side filter applied instantly |
| Search box | Client-side text search on Rule_Name + Finding_Detail + Source_Record_Name |
| "⬇ Export CSV" | Generate and download CSV of visible findings |

---

### Screen 4 — Finding Detail  
**Creator Page:** `Finding_View`  
**Widget:** `finding-view-widget`  
**URL params:** `?finding_id=<id>&scan_id=<scan_id>`

**What it shows:**
- Severity badge + Module chip + Rule ID
- Rule name (headline)
- Finding Detail text box (explanation of the violation)
- Meta strip: Source Record, Standard Reference, Detection date/time
- Remediation Steps (numbered list from rule's `Remediation_Steps` field)
- Status section:
  - If **Open**: notes textarea + "Mark as Resolved" + "Skip / Won't Fix" buttons
  - If **Resolved**: green banner with who resolved, when, and their notes

**Remediation step rendering:**
- `Remediation_Steps` field is multi-line text
- Each line becomes one numbered step
- Lines already starting with "1." are renumbered cleanly

**User actions:**
| Action | Result |
|---|---|
| "← Back to Findings" | Navigate to `Findings_Detail?scan_id=SCAN_ID` |
| "✓ Mark as Resolved" | Calls `CRT_LogRemediation_fn` → shows resolved banner |
| "⏭ Skip / Won't Fix" | Same function call, notes prefixed "Won't fix:" |

**Function called on resolve:**
```js
ZOHO.CREATOR.API.executeFunction({
    appName:      'fci_governance_scanner',
    functionName: 'CRT_LogRemediation_fn',
    arguments:    JSON.stringify({
        finding_id:      '<id>',
        notes:           '<user notes>',
        remediated_by:   '<user email>'
    })
});
```

---

### Screen 5 — Scan History  
**Creator Page:** `Scan_History`  
**Widget:** `scan-history-widget`

**What it shows:**
- Pass rate trend chart — inline SVG, last 10 scans, line + dots + y-axis grid
- History table: Date, Type badge (FULL/Module), Rules checked, Pass, Fail, Rate pill, [View] button

**Rate pill colours:**
- ≥ 90% → green
- ≥ 70% → yellow
- < 70% → red

**User actions:**
| Action | Result |
|---|---|
| "[View]" button on any row | Navigate to `Findings_Detail?scan_id=ID` |
| "[+ Run New Scan]" | Navigate to Home |

---

### Screen 6 — Setup Wizard  
**Creator Page:** `Setup_Wizard`  
**Widget:** `setup-wizard-widget`

**4-step wizard flow:**

| Step | Title | What happens |
|---|---|---|
| 1 | Welcome | App overview + feature list |
| 2 | Connect | Load Module_Connection records, show status, allow per-module testing |
| 3 | Verify | Auto-run `CRT_TestModuleConnection_fn` for all 8 modules in sequence (400ms gap), show animated progress bars |
| 4 | Done | Summary, seed rules, CTA to run first scan |

**Key interactions:**
- Step 2 [Test] button: calls `CRT_TestModuleConnection_fn({module:'CRM'})` per module
- Step 3: runs sequentially, enables "Next" only after all tests complete
- Step 4 "Seed Rules": calls `CRT_SeedRules_fn({})` — loads 50+ rules into `Rule_Repository`
- Step indicator shows: Future (grey outline) → Active (indigo filled) → Done (green ✓)

---

### Screen 7 — Rules Browser  
**Creator Page:** `Rules_Browser`  
**Widget:** `rules-browser-widget`

**What it shows:**
- Stats bar: Total / Enabled / Critical / High / Medium / Low counts
- Filter toolbar: Module / Severity / Enabled status / Search
- Rules table: Rule ID | Module | Rule Name + Description | Check Type | Severity | Standard Ref. | Toggle
- Seed modal: confirmation before calling `CRT_SeedRules_fn`

**Toggle behaviour:**
- Immediate optimistic UI update (toggle switches visually)
- Calls `ZOHO.CREATOR.API.updateRecord` to persist `Is_Enabled` on the rule record
- Reverts and shows toast if the API call fails

**Module colour coding:**
| Module | Tag Colour |
|---|---|
| CRM | Purple |
| Creator | Blue |
| People | Pink |
| Analytics | Green |
| Sigma | Orange |
| Recruit | Indigo |
| Forms | Amber |
| Catalyst | Light green |

---

## 🗂️ Page → Widget → Form Mapping

| Creator Page | Widget | Primary Form/Report |
|---|---|---|
| `Home` | `dashboard-summary-widget` | `All_Scan_Sessions`, `All_Scan_Findings` |
| `Home` | `scan-progress-widget` | `All_Scan_Sessions`, `CRT_InitiateFullScan_fn` |
| `Findings_Detail` | `findings-detail-widget` | `All_Scan_Sessions`, `All_Scan_Findings` |
| `Finding_View` | `finding-view-widget` | `All_Scan_Findings`, `CRT_LogRemediation_fn` |
| `Scan_History` | `scan-history-widget` | `All_Scan_Sessions` |
| `Setup_Wizard` | `setup-wizard-widget` | `All_Module_Connections`, `CRT_SeedRules_fn`, `CRT_TestModuleConnection_fn` |
| `Rules_Browser` | `rules-browser-widget` | `All_Rules`, `CRT_SeedRules_fn` |

---

## 🔗 URL Parameter Convention

Zoho Creator widget URL params are passed via the hash fragment:

```
https://creatorapp.zoho.in/fci_governance_scanner/#Page:PageName?param1=val1&param2=val2
```

Widgets read them with:
```js
function getUrlParam(name) {
    const hash = window.location.hash || window.parent?.location?.hash || '';
    const idx  = hash.indexOf('?');
    if (idx < 0) return null;
    return new URLSearchParams(hash.slice(idx + 1)).get(name);
}
```

| Page | Parameters |
|---|---|
| `Findings_Detail` | `scan_id` — the Scan_Session record ID |
| `Finding_View` | `finding_id` — the Scan_Finding record ID; `scan_id` — for back navigation |

---

## 🖥️ Prototype

An interactive HTML prototype is available at:

```
fci-standards-scanner/app-prototype.html
```

Open this file in a browser to explore all 7 screens with simulated data. No Zoho login or Creator app required. The prototype demonstrates:
- Live navigation between all screens
- Animated scan progress simulation (click "Run Full Scan")
- Working finding detail with mark-as-resolved flow
- Pass rate trend SVG chart
- 4-step setup wizard with animated connection verification
- Rules table with toggle switches

> ⚠️ The prototype uses simulated data only. Deploy the actual widgets to Zoho Creator for live Zoho data.

---

## 📁 Widget File Structure

```
fci-standards-scanner/
├── app-prototype.html              ← Standalone interactive demo (open in browser)
├── SCREENS.md                      ← This file
└── widgets/
    ├── dashboard-summary-widget/   ← Screen 1: Dashboard overview
    │   ├── index.html
    │   ├── app.js
    │   └── style.css
    ├── scan-progress-widget/       ← Screen 2: Run/monitor a scan
    │   ├── index.html
    │   ├── app.js
    │   └── style.css
    ├── findings-detail-widget/     ← Screen 3: All findings for a scan
    │   ├── index.html
    │   ├── app.js
    │   └── style.css
    ├── finding-view-widget/        ← Screen 4: Single finding + remediation
    │   ├── index.html
    │   ├── app.js
    │   └── style.css
    ├── scan-history-widget/        ← Screen 5: History + trend chart
    │   ├── index.html
    │   ├── app.js
    │   └── style.css
    ├── setup-wizard-widget/        ← Screen 6: First-time setup
    │   ├── index.html
    │   ├── app.js
    │   └── style.css
    └── rules-browser-widget/       ← Screen 7: Browse/manage scan rules
        ├── index.html
        ├── app.js
        └── style.css
```

---

## 🚀 Deployment Checklist

When deploying each widget to Zoho Creator:

1. **Upload widget files** — Creator → Settings → Widgets → Add Widget → upload the 3 files (index.html, app.js, style.css) as a ZIP
2. **Create the Creator pages** — one page per screen (see Page → Widget mapping above)
3. **Embed the widget** — drag the widget component onto each page, set the widget name
4. **Set widget dimensions** — each widget is designed for at least 600px wide; the dashboard widget needs at least 400px tall
5. **Configure connections** — run Setup Wizard (Page: `Setup_Wizard`) to connect all Zoho modules
6. **Seed rules** — from Setup Wizard Step 4 or Rules Browser, click "Seed Default Rules"
7. **Run first scan** — from the Home page, click "Run Full Scan"
8. **Set up auto-alerts** — configure `CRT_SendCriticalAlert_fn` in Creator scheduled functions

---

*Last updated: 2026-05-27 — Initial E2E frontend implementation*
