# Governance Scanner — Zoho Creator App

**Application Name in Creator:** `FCI_GovernanceScanner`  
**Platform:** Zoho Creator  
**Language:** Deluge (server) + JavaScript (widgets)  
**Version:** 1.0.0

---

## Folder Structure

```
fci-standards-scanner/
│
├── README.md                        ← You are here
│
├── forms/                           ← Creator form field definitions
│   ├── Rule_Repository.json         ← Master rules store (~190 rules)
│   ├── Scan_Session.json            ← One record per scan run
│   ├── Scan_Finding.json            ← Individual pass/fail per rule
│   ├── Reference_Data.json          ← Gemini-scraped Zoho docs data
│   ├── Module_Connection.json       ← API connection config per module
│   └── Remediation_Log.json         ← Track fixing of findings
│
├── functions/                       ← Deluge scripts (.dg = Deluge)
│   ├── CRT_InitiateFullScan_fn.dg   ← MAIN: orchestrates full scan
│   ├── CRT_EvaluateRule_fn.dg       ← Evaluates one rule against data
│   ├── CRT_FetchCRMData_fn.dg       ← Fetch CRM metadata via API
│   ├── CRT_FetchPeopleData_fn.dg    ← Fetch People metadata
│   ├── CRT_FetchCreatorData_fn.dg   ← Fetch Creator forms/functions
│   ├── CRT_FetchAnalyticsData_fn.dg ← Fetch Analytics + SQL queries
│   ├── CRT_FetchSigmaData_fn.dg     ← Fetch Sigma extensions
│   ├── CRT_FetchRecruitData_fn.dg   ← Fetch Recruit config
│   ├── CRT_FetchFormsData_fn.dg     ← Fetch Zoho Forms config
│   ├── CRT_GeminiScrapeZoho_fn.dg   ← AI doc scraper (weekly)
│   ├── CRT_GenerateScanReport_fn.dg ← Build summary + send alerts
│   ├── CRT_SendCriticalAlert_fn.dg  ← Email on critical failures
│   └── CRT_SeedRules_fn.dg         ← Bulk-import rules from CSV
│
├── widgets/
│   ├── scan-progress-widget/        ← Live progress bar during scan
│   │   ├── index.html
│   │   ├── app.js
│   │   └── style.css
│   └── dashboard-summary-widget/   ← Pass/fail summary donut + stats
│       ├── index.html
│       ├── app.js
│       └── style.css
│
├── seed-data/
│   ├── rules_seed.csv              ← All ~190 rules; import to Rule_Repository
│   └── module_connections_seed.csv ← Connection config; import to Module_Connection
│
└── docs/
    ├── setup-guide.md              ← Full step-by-step build guide
    └── connections-setup.md        ← OAuth connection setup per module
```

---

## How to Build the App (Summary)

> Full details: [`docs/setup-guide.md`](docs/setup-guide.md)

### Step 1 — Create the Creator App
1. Log in to Zoho Creator → **Create Application**
2. Name: `FCI_GovernanceScanner`
3. Choose **Blank Application**

### Step 2 — Create All Forms
Create 6 forms using the JSON schemas in `forms/`. Each JSON file has:
- `form_name` — use as the Creator form name
- `fields[]` — each field's display name, API name, type, and options

### Step 3 — Deploy Deluge Functions
Copy each `.dg` file content into Creator → **Functions** → **New Function**.
The filename = the function name (e.g., `CRT_InitiateFullScan_fn`).

### Step 4 — Set Up Connections
Follow [`docs/connections-setup.md`](docs/connections-setup.md) to create OAuth connections for:
CRM · People · Creator · Analytics · Sigma · Recruit · Forms · Gemini API

### Step 5 — Set Org Variables
In Creator → **Settings → Org Variables**, create:
```
GEMINI_API_KEY_ENC     → Your Gemini API key (encrypted)
ZOHO_ORG_ID            → Your Zoho Org ID
SCAN_ADMIN_EMAIL       → Email for critical failure alerts
ZOHO_CREATOR_APP_NAME  → fci_governance_scanner
ZOHO_CREATOR_OWNER     → Your Creator username
```

### Step 6 — Seed the Rules
1. Go to `Rule_Repository` form → **Import**
2. Upload `seed-data/rules_seed.csv`
3. Map columns to fields
4. Import ~190 rules

### Step 7 — Run Your First Scan
1. Open the Dashboard page
2. Click **🔍 Run Full Scan**
3. Watch the live progress widget
4. Review findings on the Findings page

---

## Rule Check Types

| Type | How It Works |
|------|-------------|
| `REGEX` | Runs a regex pattern against record names (functions, fields, forms) |
| `SQL_PARSE` | Counts sub-queries in Analytics SQL; checks for `SELECT *` |
| `VALUE_COMPARE` | Compares a config value to expected (equality / contains) |
| `EXISTENCE` | Checks a feature/setting is enabled (boolean true/false) |
| `MANUAL` | Cannot be automated — flagged as a checklist item for human review |

---

## Scheduled Automations

| Job | Schedule | Function |
|-----|----------|----------|
| Gemini Doc Scraper | Every Sunday 02:00 IST | `CRT_GeminiScrapeZoho_fn` |
| Nightly Auto-Scan | Weekdays 23:00 IST | `CRT_InitiateFullScan_fn` |
| Monthly Rules Review | 1st of month 09:00 IST | Sends reminder email |

---

## Severity Levels

| Level | Meaning | Action |
|-------|---------|--------|
| `CRITICAL` | Hard platform limit or security rule broken | Fix before next deploy |
| `HIGH` | Major naming or structure violation | Fix within sprint |
| `MEDIUM` | Minor naming or style violation | Fix within quarter |
| `LOW` | Informational / best practice | Fix when convenient |

---

*See [`Standards_and_BestPractises/09_Governance_Scanner_App_Design.md`](Standards_and_BestPractises/09_Governance_Scanner_App_Design.md) for the full architecture, all Deluge code, and the complete rule seed table.*
