# Setup Guide — FCI Governance Scanner

**Time to set up:** ~3–4 hours  
**Prerequisites:** Zoho Creator Admin access · Zoho CRM/People/Analytics Admin access · Gemini API key

---

## Phase 1 — Create the Creator Application

### Step 1.1 — Create app
1. Log in to **Zoho Creator** → click **Create Application**
2. Select **Blank Application**
3. **Application Name:** `FCI_GovernanceScanner`
4. **Description:** `FCI India governance compliance scanner`
5. Click **Create**

### Step 1.2 — Set Org Variables
Go to **Settings → Org Variables → Add Variable** for each:

| Variable Name | Value | Notes |
|---|---|---|
| `GEMINI_API_KEY_ENC` | Your Gemini API key (encrypted) | Get from Google AI Studio |
| `ZOHO_ORG_ID` | Your Zoho Org ID | Found in Zoho Accounts → Profile |
| `SCAN_ADMIN_EMAIL` | Admin email for alerts | e.g., `techleader@fci.in` |
| `ZOHO_CREATOR_APP_NAME` | `fci_governance_scanner` | Exact app name |
| `ZOHO_CREATOR_OWNER` | Your Creator username | Shown in Creator URL |

> **Encrypt your Gemini key:** In Creator → Functions, call `zoho.encryption.encrypt("YOUR_KEY")` once and store the result in `GEMINI_API_KEY_ENC`.

---

## Phase 2 — Create All Forms

Create each form in **Creator → Forms → New Form**.  
Use the JSON schemas in `../forms/` as the field reference for each form.

### Form Creation Order (respect lookup dependencies)

```
1. Rule_Repository       ← No lookups; create first
2. Module_Connection     ← No lookups
3. Scan_Session          ← No lookups
4. Reference_Data        ← Looks up Rule_Repository
5. Scan_Finding          ← Looks up Scan_Session + Rule_Repository
6. Remediation_Log       ← Looks up Scan_Finding; create last
```

### For each form:
1. Open the corresponding `.json` file from `../forms/`
2. In Creator → **New Form**, add each field listed in the `fields[]` array
3. Match: **display name**, **API name**, **field type**, and **dropdown options** exactly
4. Set required, unique, and default values as specified
5. **Save** the form

### Key field type mappings

| JSON type | Creator field type |
|---|---|
| `Auto Number` | Auto Number |
| `Single Line` | Single Line |
| `Multi Line` | Multi Line |
| `Dropdown` | Dropdown |
| `Multi-Select` | Multi Select |
| `Checkbox` | Check Box |
| `Date` | Date |
| `Date-Time` | Date-Time |
| `Number` | Number |
| `Decimal` | Decimal |
| `URL` | URL |
| `Lookup` | Lookup (select lookup form + display field) |

---

## Phase 3 — Set Up Zoho Connections

Follow the full guide in [`connections-setup.md`](connections-setup.md).

**Summary — connections to create:**

| Connection Name | Service | Type |
|---|---|---|
| `conn_zoho_crm` | Zoho CRM | Zoho OAuth |
| `conn_zoho_people` | Zoho People | Zoho OAuth |
| `conn_zoho_creator` | Zoho Creator | Zoho OAuth |
| `conn_zoho_analytics` | Zoho Analytics | Zoho OAuth |
| `conn_zoho_sigma` | Zoho Sigma | Zoho OAuth |
| `conn_zoho_recruit` | Zoho Recruit | Zoho OAuth |
| `conn_zoho_forms` | Zoho Forms | Zoho OAuth |
| `conn_gemini_ai` | Google Gemini | REST API (API Key) |

---

## Phase 4 — Deploy Deluge Functions

For each `.dg` file in `../functions/`:

1. Go to **Creator → Functions → New Function**
2. Set **Function Name** = filename without `.dg` (e.g., `CRT_InitiateFullScan_fn`)
3. Copy the file contents into the Deluge editor
4. Click **Save**
5. Verify: click **Test** on simple functions to confirm syntax

### Function deployment order

```
1. CRT_SendCriticalAlert_fn     ← No dependencies
2. CRT_FetchCRMData_fn          ← Needs conn_zoho_crm
3. CRT_FetchPeopleData_fn       ← Needs conn_zoho_people
4. CRT_FetchCreatorData_fn      ← Needs conn_zoho_creator
5. CRT_FetchAnalyticsData_fn    ← Needs conn_zoho_analytics
6. CRT_FetchSigmaData_fn        ← Needs conn_zoho_sigma
7. CRT_FetchRecruitData_fn      ← Needs conn_zoho_recruit
8. CRT_FetchFormsData_fn        ← Needs conn_zoho_forms
9. CRT_EvaluateRule_fn          ← Needs all fetch functions
10. CRT_GenerateScanReport_fn   ← Needs Scan_Session form
11. CRT_GeminiScrapeZoho_fn     ← Needs conn_gemini_ai
12. CRT_InitiateFullScan_fn     ← Needs ALL functions above
13. CRT_SeedRules_fn            ← Needs Rule_Repository form
```

---

## Phase 5 — Seed the Data

### 5.1 Import Module Connections
1. Go to **Module_Connection** form → **Import**
2. Upload `../seed-data/module_connections_seed.csv`
3. Map: `module_name` → Module, `connection_name` → Connection Name, etc.
4. Import — creates 8 connection config records

### 5.2 Import Rules (option A — CSV)
1. Go to **Rule_Repository** form → **Import**
2. Upload `../seed-data/rules_seed.csv`
3. Map all columns to matching fields
4. Import — creates ~45 rules (add more per the full rule table in `09_Governance_Scanner_App_Design.md`)

### 5.3 Import Rules (option B — Deluge function)
Run `CRT_SeedRules_fn` from **Creator → Functions → Run**. It bulk-inserts all rules defined in the function and skips any already existing.

---

## Phase 6 — Build the Pages

### 6.1 Create Pages
Go to **Creator → Pages → New Page** and create:

| Page Name | Description |
|---|---|
| `Dashboard` | Main landing page — widgets + scan button |
| `Rules_Manager` | CRUD grid for Rule_Repository |
| `Scan_History` | List of all Scan_Session records |
| `Findings_Detail` | Filterable grid of Scan_Finding |
| `Reference_Data_Page` | Grid of Reference_Data with change highlights |
| `Settings_Page` | Module_Connection management |

### 6.2 Add Widgets to Dashboard
1. On the **Dashboard** page, add a **Widget** component
2. Upload the `scan-progress-widget` folder (zip `index.html`, `app.js`, `style.css`)
3. Add a second **Widget** component → upload `dashboard-summary-widget` folder
4. Position: scan-progress-widget on the right; dashboard-summary-widget on the left

### 6.3 Wire the Scan Button
The scan button is inside the widget (`btn-full-scan`). The widget calls `CRT_InitiateFullScan_fn` via `ZOHO.CREATOR.API.executeFunction`. No additional wiring in Creator pages is needed.

---

## Phase 7 — Set Up Scheduled Functions

Go to **Creator → Scheduled Functions → New**:

### 7.1 Weekly Gemini Scrape
```
Name:        CRT_WeeklyDocScrape_sch
Description: Weekly AI scrape of Zoho documentation for limit updates
Function:    CRT_GeminiScrapeZoho_fn
Arguments:   {"platform": "ALL"}
Schedule:    Every week | Sunday | 02:00 IST
```

### 7.2 Nightly Auto-Scan (optional — enable after initial testing)
```
Name:        CRT_NightlyAutoScan_sch
Description: Automated nightly compliance scan
Function:    CRT_InitiateFullScan_fn
Arguments:   {"scan_type": "FULL", "triggered_by": "automated@funaiconsulting.in"}
Schedule:    Every day | Mon–Fri | 23:00 IST
```

---

## Phase 8 — Verify Everything Works

### 8.1 Test a single connection
In Creator → Functions, create a temporary test function:
```deluge
resp = invokeurl [url: "https://www.zohoapis.in/crm/v7/settings/functions" type: GET connection: "conn_zoho_crm"];
info resp;
```
Run it — you should see a JSON response with CRM functions.

### 8.2 Run your first scan
1. Go to the **Dashboard** page
2. Click **🔍 Run Full Scan**
3. Watch the progress widget update
4. After completion, go to **Findings_Detail** to review results
5. Go to **Scan_History** — confirm the session record shows `COMPLETED`

### 8.3 Smoke-test the Gemini scraper
Run `CRT_GeminiScrapeZoho_fn("CRM")` manually from Functions → Run.  
Check **Reference_Data_Page** — should see new records for CRM limits.

---

## Troubleshooting

| Problem | Solution |
|---|---|
| `invokeurl` returns 401 | Connection not authenticated. Go to Connections → Re-authenticate. |
| Scan stuck on RUNNING | Function may have timed out. Check Error_Log in Scan_Session record. Split the scan by module. |
| No rules found | Check Rule_Repository → filter Status = Active. Run CRT_SeedRules_fn. |
| Gemini returns empty | Check GEMINI_API_KEY_ENC org variable. Ensure the key has web grounding permission. |
| Widget shows blank | Check browser console for JS errors. Ensure widget is uploaded as a zip with correct file names. |

---

## Role Setup (Recommended)

| Role | Pages | Permissions |
|---|---|---|
| `Scanner_Admin` | All pages | Full access |
| `Scanner_Developer` | Dashboard, Findings_Detail, Reference_Data_Page | Read + Acknowledge findings |
| `Scanner_Viewer` | Dashboard, Scan_History | Read-only |

Create roles in **Creator → Settings → Sharing & Permissions**.
