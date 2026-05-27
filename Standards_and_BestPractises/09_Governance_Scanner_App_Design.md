# 09 — FCI Governance Scanner — Zoho Creator Application Design

**Application Name:** `FCI_GovernanceScanner`  
**Platform:** Zoho Creator (Web Application)  
**Version:** 1.0.0  
**Owner:** India Tech Lead  
**Created:** 2026-05-26  
**Status:** Design / Pre-Build

---

> **📚 Source Classification Key** — Standards in this document are labelled:  
> 🔵 **Zoho Official** — Directly verified from Zoho's official documentation or API specs  
> 🟢 **FCI Internal** — FCI's own policy/convention (not mandated by Zoho; documented in `10_Sources_and_Validation.md`)  
> 🟡 **Community** — Observed pattern from Zoho Community forums, partner blogs, or marketplace examples  
> 🔴 **Unverified** — Stated in good faith; official source not yet confirmed — validate before enforcing  
> ⚠️ **Correction** — Found to differ from official docs; see `10_Sources_and_Validation.md §3`
>
> _Full source citation table: [10_Sources_and_Validation.md](./10_Sources_and_Validation.md)_

---

## Table of Contents

1. [What This App Does](#1-what-this-app-does)
2. [System Architecture](#2-system-architecture)
3. [Data Model — Creator Forms](#3-data-model--creator-forms)
4. [Zoho Module Integrations](#4-zoho-module-integrations)
5. [Rule Engine Design](#5-rule-engine-design)
6. [Gemini AI Scraper Module](#6-gemini-ai-scraper-module)
7. [The Scan Button — End-to-End Flow](#7-the-scan-button--end-to-end-flow)
8. [UI / Page Layout](#8-ui--page-layout)
9. [Deluge Functions — Full Code](#9-deluge-functions--full-code)
10. [Connections Setup](#10-connections-setup)
11. [Scheduled Automations](#11-scheduled-automations)
12. [Build Phases & Roadmap](#12-build-phases--roadmap)
13. [Rule Seed Data — All Standards Mapped](#13-rule-seed-data--all-standards-mapped)

---

## 1. What This App Does

```
┌─────────────────────────────────────────────────────────────────┐
│               FCI GOVERNANCE SCANNER                            │
│                                                                 │
│  ┌──────────────┐    ┌──────────────┐    ┌───────────────────┐  │
│  │  RULES STORE │    │  LIVE DATA   │    │  GEMINI SCRAPER   │  │
│  │              │    │  (Zoho APIs) │    │  (Zoho Docs)      │  │
│  │  ~200 rules  │    │  CRM/People/ │    │  Latest limits,   │  │
│  │  from all    │    │  Creator/    │    │  features,        │  │
│  │  standards   │    │  Analytics/  │    │  best practices   │  │
│  │  docs        │    │  Sigma/etc   │    │  scraped weekly   │  │
│  └──────┬───────┘    └──────┬───────┘    └────────┬──────────┘  │
│         │                  │                      │             │
│         └──────────────────┴──────────────────────┘             │
│                            │                                    │
│                    ┌───────▼────────┐                           │
│                    │  RULE ENGINE   │                           │
│                    │  (Evaluator)   │                           │
│                    └───────┬────────┘                           │
│                            │                                    │
│              ┌─────────────┼─────────────┐                      │
│              │             │             │                      │
│         ┌────▼───┐   ┌─────▼──┐   ┌─────▼──┐                   │
│         │  PASS  │   │  FAIL  │   │  WARN  │                   │
│         └────────┘   └────────┘   └────────┘                   │
│                            │                                    │
│                    ┌───────▼────────┐                           │
│                    │   DASHBOARD    │  ← "RUN FULL SCAN" button │
│                    │   + REPORTS    │                           │
│                    └────────────────┘                           │
└─────────────────────────────────────────────────────────────────┘
```

**One-click compliance scanning** across the entire FCI Zoho platform:
- Checks live configuration of CRM, People, Creator, Analytics, Sigma, Recruit, Forms
- Validates against the ~200 rules defined in standards documents 00–08
- Uses Gemini AI to scrape Zoho's official docs weekly for limit/feature updates
- Stores every finding with severity, module, record, and remediation guidance
- Tracks trends over time (did we get better or worse since last scan?)

---

## 2. System Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                    ZOHO CREATOR APPLICATION                         │
│                    FCI_GovernanceScanner                            │
│                                                                     │
│  ┌─────────────────────────────────────────────────────────────┐    │
│  │  FORMS (Data Storage)                                        │    │
│  │  Rule_Repository | Scan_Session | Scan_Finding |            │    │
│  │  Module_Connection | Reference_Data | Remediation_Log       │    │
│  └─────────────────────────────────────────────────────────────┘    │
│                                                                     │
│  ┌─────────────────────────────────────────────────────────────┐    │
│  │  DELUGE FUNCTIONS                                            │    │
│  │  CRT_InitiateFullScan_fn    CRT_EvaluateRule_fn             │    │
│  │  CRT_FetchCRMData_fn        CRT_FetchPeopleData_fn          │    │
│  │  CRT_FetchCreatorData_fn    CRT_FetchAnalyticsData_fn       │    │
│  │  CRT_FetchSigmaData_fn      CRT_CheckNamingRule_fn          │    │
│  │  CRT_GeminiScrapeZoho_fn    CRT_GenerateScanReport_fn       │    │
│  └─────────────────────────────────────────────────────────────┘    │
│                                                                     │
│  ┌─────────────────────────────────────────────────────────────┐    │
│  │  ZOHO CONNECTIONS (OAuth 2.0)                                │    │
│  │  conn_zoho_crm    conn_zoho_people    conn_zoho_creator     │    │
│  │  conn_zoho_analytics    conn_zoho_sigma    conn_gemini_ai   │    │
│  └─────────────────────────────────────────────────────────────┘    │
│                                                                     │
│  ┌─────────────────────────────────────────────────────────────┐    │
│  │  PAGES (UI)                                                  │    │
│  │  Dashboard | Rules_Manager | Scan_History |                 │    │
│  │  Findings_Detail | Reference_Data | Settings                │    │
│  └─────────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────────┘
           │                    │                    │
           ▼                    ▼                    ▼
   ┌──────────────┐    ┌───────────────┐    ┌──────────────────┐
   │  ZOHO APIs   │    │  GEMINI API   │    │  ZOHO DOCS       │
   │  CRM v7      │    │  gemini-pro   │    │  help.zoho.com   │
   │  People v2   │    │  (grounding)  │    │  (scraped)       │
   │  Creator API │    └───────────────┘    └──────────────────┘
   │  Analytics   │
   │  Sigma       │
   └──────────────┘
```

### Technology Decisions

| Component | Choice | Reason |
|-----------|--------|--------|
| App Platform | Zoho Creator | Already in Zoho ecosystem; no infra to manage |
| Scripting | Deluge (server) + JS (widgets) | Creator native; full Zoho API access |
| AI Integration | Google Gemini API (gemini-2.0-flash) | Best web grounding; fast for structured extraction |
| Auth | Zoho Connections (OAuth 2.0) | Secure; no tokens in code |
| Scheduling | Creator Scheduled Functions | Built-in; no external cron needed |
| Reporting | Creator Reports + Analytics embed | Native; no extra cost |

---

## 3. Data Model — Creator Forms

### 3.1 Form: `Rule_Repository`

The master table of all governance rules. Pre-seeded from standards documents 00–08.

| Field Display Name | API Name | Type | Options / Constraints |
|---|---|---|---|
| Rule ID | rule_id | Auto Number | RUL-000001 |
| Rule Name | rule_name | Single Line | Required; max 150 chars |
| Short Code | rule_short_code | Single Line | e.g., `NMC-001`; unique |
| Category | rule_category | Dropdown | Naming / Deluge / Widget / Security / API_Limits / Git / SQL / Structure |
| Source Document | source_document | Dropdown | 00_Cross_Module / 01_Catalyst / 02_Creator / 03_Sigma / 04_CRM / 05_People / 06_Recruit / 07_Forms / 08_Analytics |
| Applicable Modules | applicable_modules | Multi-Select | ALL / Creator / CRM / People / Recruit / Forms / Analytics / Sigma / Catalyst |
| Rule Description | rule_description | Multi Line | Full description of the rule |
| Check Type | check_type | Dropdown | REGEX / API_QUERY / VALUE_COMPARE / EXISTENCE / SQL_PARSE / MANUAL |
| Check Pattern | check_pattern | Multi Line | Regex, API endpoint, or check logic in JSON |
| Expected Value | expected_value | Single Line | Expected result when rule passes |
| Severity | severity | Dropdown | CRITICAL / HIGH / MEDIUM / LOW |
| Auto Checkable | is_auto_checkable | Checkbox | Whether the rule can be checked programmatically |
| Remediation Guide | remediation_guide | Multi Line | How to fix when rule fails |
| Status | rule_status | Dropdown | Active / Inactive / Draft |
| Last Updated | last_updated | Date | |
| Created By | created_by | Single Line | |

**Indexes:** `rule_status`, `applicable_modules`, `severity`, `is_auto_checkable`

---

### 3.2 Form: `Scan_Session`

One record per scan run.

| Field Display Name | API Name | Type | Notes |
|---|---|---|---|
| Scan ID | scan_id | Auto Number | SCN-000001 |
| Scan Name | scan_name | Single Line | Auto: "Full Scan 2026-05-26 14:30" |
| Scan Type | scan_type | Dropdown | FULL / MODULE_SPECIFIC / RULE_CATEGORY |
| Modules Scanned | modules_scanned | Multi-Select | Which modules were included |
| Triggered By | triggered_by | Single Line | User email |
| Status | scan_status | Dropdown | QUEUED / RUNNING / COMPLETED / FAILED / PARTIAL |
| Start Time | start_time | Date-Time | |
| End Time | end_time | Date-Time | |
| Duration Seconds | duration_seconds | Number | |
| Total Rules | total_rules_checked | Number | |
| Passed | rules_passed | Number | |
| Failed | rules_failed | Number | |
| Warnings | rules_warned | Number | |
| Skipped | rules_skipped | Number | |
| Pass Rate % | pass_rate_pct | Decimal | Calculated |
| Critical Failures | critical_failures | Number | |
| Error Log | error_log | Multi Line | Any errors during scan |
| Summary Notes | summary_notes | Multi Line | AI-generated summary |

---

### 3.3 Form: `Scan_Finding`

One record per rule-check result within a scan.

| Field Display Name | API Name | Type | Notes |
|---|---|---|---|
| Finding ID | finding_id | Auto Number | FND-000001 |
| Scan Session | scan_session | Lookup (Scan_Session) | |
| Rule | rule_ref | Lookup (Rule_Repository) | |
| Module | module_name | Single Line | e.g., CRM |
| Record ID | source_record_id | Single Line | ID in the source Zoho module |
| Record Name | source_record_name | Single Line | Human-readable name of offending record |
| Finding Status | finding_status | Dropdown | PASS / FAIL / WARNING / SKIPPED / ERROR |
| Finding Detail | finding_detail | Multi Line | Specific detail (e.g., "Function 'getLeads' missing CRM_ prefix") |
| Actual Value | actual_value | Single Line | What was found |
| Expected Value | expected_value | Single Line | What it should be |
| Severity | severity | Dropdown | Inherited from rule; CRITICAL/HIGH/MEDIUM/LOW |
| Acknowledged | is_acknowledged | Checkbox | |
| Acknowledged By | acknowledged_by | Single Line | |
| Acknowledged At | acknowledged_at | Date-Time | |
| Remediated | is_remediated | Checkbox | |
| Remediated By | remediated_by | Single Line | |
| Remediated At | remediated_at | Date-Time | |
| Remediation Notes | remediation_notes | Multi Line | |

**Indexes:** `scan_session`, `finding_status`, `severity`, `module_name`, `is_remediated`

---

### 3.4 Form: `Reference_Data`

Scraped from Zoho's official documentation by Gemini.

| Field Display Name | API Name | Type | Notes |
|---|---|---|---|
| Ref ID | ref_id | Auto Number | REF-000001 |
| Platform | platform | Dropdown | Zoho_CRM / Zoho_Creator / Zoho_People / Zoho_Analytics / Zoho_Catalyst / Zoho_Sigma |
| Feature Name | feature_name | Single Line | e.g., "CRM Daily API Limit" |
| Category | ref_category | Dropdown | API_Limit / Feature / Best_Practice / Deprecation / New_Feature |
| Current Value | current_value | Single Line | e.g., "250 × active users" |
| Previous Value | previous_value | Single Line | Value before last update |
| Changed | has_changed | Checkbox | Set when current ≠ previous |
| Source URL | source_url | URL | Zoho docs page scraped |
| Gemini Summary | gemini_summary | Multi Line | AI-extracted structured summary |
| Raw Content | raw_content | Multi Line | Raw scraped text |
| Last Scraped | last_scraped | Date-Time | |
| Scrape Status | scrape_status | Dropdown | SUCCESS / FAILED / PENDING |
| Related Rule | related_rule | Lookup (Rule_Repository) | Which rule this validates |

---

### 3.5 Form: `Module_Connection`

Configuration for each Zoho module integration.

| Field Display Name | API Name | Type | Notes |
|---|---|---|---|
| Module | module_name | Dropdown | CRM / People / Creator / Analytics / Sigma / Recruit / Forms / Catalyst |
| Connection Name | connection_name | Single Line | Zoho Connection API name; e.g., `conn_zoho_crm` |
| Base URL | base_url | Single Line | e.g., `https://www.zohoapis.in/crm/v7` |
| Status | connection_status | Dropdown | ACTIVE / INACTIVE / ERROR |
| Last Test | last_tested | Date-Time | |
| Test Result | test_result | Single Line | |
| Scopes Required | scopes_required | Multi Line | OAuth scopes needed |
| Notes | notes | Multi Line | |

---

## 4. Zoho Module Integrations

### 4.1 What We Check Per Module

#### **Zoho CRM**
Fetch via: `https://www.zohoapis.in/crm/v7`

| What We Fetch | API Endpoint | Rules Checked |
|---|---|---|
| Custom Modules | `GET /settings/modules` | Module names in PascalCase |
| Custom Fields | `GET /settings/fields?module=X` | Field API names UPPER_SNAKE_CASE; Boolean Is_*/Has_*; Date *_Date |
| Workflows | `GET /settings/automation/workflow_rules` | Naming: [Module]_[Trigger]_[Action] |
| Blueprints | `GET /settings/blueprints` | Naming: [Module]_[Process]_BP |
| Pipelines | `GET /settings/pipeline` | Naming: [Market]_[ProductLine]_Pipeline |
| Custom Functions | `GET /settings/functions` | Naming: CRM_ prefix; _fn suffix |
| Layouts | `GET /settings/layouts?module=X` | Layout naming convention |

#### **Zoho People**
Fetch via: `https://people.zoho.in/api/v2`

| What We Fetch | API Endpoint | Rules Checked |
|---|---|---|
| Custom Forms | `GET /customforms` | Form names PascalCase |
| Custom Fields | `GET /customfields?module=X` | PEO_ prefix; snake_case API names |
| Functions | `GET /functions` | PEO_ prefix; _fn suffix |
| Alerts | `GET /alerts` | [Event]_[Audience]_Alert format |

#### **Zoho Creator**
Fetch via: `https://creator.zoho.in/api/v2/{owner}/{app}`

| What We Fetch | API Endpoint | Rules Checked |
|---|---|---|
| Forms | `GET /form` | PascalCase; singular names |
| Reports | `GET /report` | Entity_ViewType_Filter format |
| Workflows/Functions | `GET /function` | CRT_ prefix; _fn suffix |
| Fields per Form | `GET /form/{form_name}/field` | snake_case API names |

#### **Zoho Analytics**
Fetch via: `https://analyticsapi.zoho.in/restapi/v2`

| What We Fetch | API Endpoint | Rules Checked |
|---|---|---|
| Workspaces | `GET /workspaces` | [Domain]_[Team]_Workspace |
| Tables | `GET /{workspace}/tables` | [Prefix]_[Name] format |
| Reports | `GET /{workspace}/reports` | Naming + suffix convention |
| Dashboards | `GET /{workspace}/dashboards` | [Audience]_[Domain]_Dashboard |
| SQL Queries | `GET /report/{id}/sql` | Sub-query count ≤ 5; no SELECT * |

#### **Zoho Sigma**
Fetch via: `https://sigma.zoho.in/api/v1`

| What We Fetch | API Endpoint | Rules Checked |
|---|---|---|
| Extensions | `GET /extensions` | fci_ prefix; kebab-case |
| Components | `GET /extension/{id}/components` | kebab-case naming |
| Functions | `GET /extension/{id}/functions` | verb-noun kebab-case |
| Connections | `GET /extension/{id}/connections` | lowercase_underscore |

#### **Zoho Recruit**
Fetch via: `https://recruit.zoho.in/recruit/v2`

| What We Fetch | API Endpoint | Rules Checked |
|---|---|---|
| Custom Modules | `GET /settings/modules` | PascalCase names |
| Custom Fields | `GET /settings/fields?module=X` | RCT_ prefix; snake_case |
| Workflows | `GET /settings/automation` | Naming conventions |
| Custom Functions | `GET /settings/functions` | RCT_ prefix; _fn suffix |

#### **Zoho Forms**
Fetch via: `https://forms.zoho.in/api/v1`

| What We Fetch | API Endpoint | Rules Checked |
|---|---|---|
| Forms | `GET /form` | [Purpose]_[Audience]_[Version] format |
| Fields | `GET /form/{id}/fields` | snake_case reference names |
| Integrations | `GET /form/{id}/integrations` | FRM_ prefix naming |
| Notifications | `GET /form/{id}/notifications` | [Form]_[Event]_[Recipient] |

---

## 5. Rule Engine Design

### 5.1 Rule Check Types

```
┌─────────────────────────────────────────────────────────┐
│                  RULE CHECK TYPES                        │
├──────────────────┬──────────────────────────────────────┤
│ REGEX            │ Apply regex pattern to record name    │
│                  │ or field value                        │
├──────────────────┼──────────────────────────────────────┤
│ API_QUERY        │ Fetch data from Zoho API; check       │
│                  │ response matches expected structure    │
├──────────────────┼──────────────────────────────────────┤
│ VALUE_COMPARE    │ Compare actual value to expected      │
│                  │ (e.g., API limit config)              │
├──────────────────┼──────────────────────────────────────┤
│ EXISTENCE        │ Check whether a required thing        │
│                  │ exists (e.g., audit trail enabled)    │
├──────────────────┼──────────────────────────────────────┤
│ SQL_PARSE        │ Count sub-queries in Analytics SQL;   │
│                  │ check for SELECT *                    │
├──────────────────┼──────────────────────────────────────┤
│ MANUAL           │ Cannot be automated; checklist item   │
│                  │ for human reviewer                    │
└──────────────────┴──────────────────────────────────────┘
```

### 5.2 Rule Evaluation Logic (JSON Schema)

Each rule in `Rule_Repository` stores a `check_pattern` JSON:

```json
// REGEX type example — CRM function naming
{
  "type": "REGEX",
  "target": "name",
  "pattern": "^CRM_[a-z][a-zA-Z]+_(fn|wf|bp|rpt|dsh|tpl|con|wgt|var)$",
  "fetch": {
    "module": "CRM",
    "endpoint": "/settings/functions",
    "response_path": "functions[*]"
  }
}

// VALUE_COMPARE type example — Analytics sub-query limit
{
  "type": "SQL_PARSE",
  "target": "sql_query",
  "max_subqueries": 5,
  "check_select_star": true,
  "fetch": {
    "module": "ANALYTICS",
    "endpoint": "/workspaces/{workspace_id}/reports",
    "response_path": "reports[*]",
    "follow_up": "/reports/{id}/sql"
  }
}

// EXISTENCE type example — Creator audit trail
{
  "type": "EXISTENCE",
  "target": "audit_trail",
  "expected": true,
  "fetch": {
    "module": "CREATOR",
    "endpoint": "/form/{form_name}/settings",
    "check_field": "enable_audit_trail"
  }
}
```

---

## 6. Gemini AI Scraper Module

### 6.1 Purpose

Zoho regularly updates API limits, deprecates features, and adds new capabilities. The scraper:
1. Runs **weekly** (every Sunday 02:00 IST)
2. Fetches key Zoho documentation pages using Gemini with web grounding
3. Extracts structured data (limits, features, deprecations)
4. Stores in `Reference_Data` form
5. **Flags changes** — if a limit changed (e.g., CRM API calls increased), alerts admin
6. Updates any rules that reference scraped limits

### 6.2 Pages Scraped

| Zoho Module | Documentation URL | What Extracted |
|---|---|---|
| CRM | `help.zoho.com/portal/en/kb/crm/developer-guide/apis` | API rate limits, batch sizes |
| Creator | `help.zoho.com/portal/en/kb/creator/developer-guide` | API limits, function timeouts |
| Analytics | `help.zoho.com/portal/en/kb/analytics/using-analytics` | SQL sub-query limits |
| Catalyst | `help.zoho.com/portal/en/kb/catalyst` | Function timeouts, DataStore limits |
| People | `help.zoho.com/portal/en/kb/people/developer-guide` | API limits |
| Sigma | `help.zoho.com/portal/en/kb/sigma` | Extension limits, manifest schema |

### 6.3 Gemini Prompt Template

```
You are a technical documentation extractor for Zoho platform governance.

Fetch and analyze this Zoho documentation page: {url}

Extract ALL of the following in a structured JSON format:
{
  "api_limits": [
    { "name": "...", "value": "...", "unit": "..." }
  ],
  "timeouts": [
    { "context": "...", "seconds": 0 }
  ],
  "hard_limits": [
    { "feature": "...", "limit": "...", "consequence": "..." }
  ],
  "deprecations": [
    { "feature": "...", "deprecated_date": "...", "replacement": "..." }
  ],
  "new_features": [
    { "feature": "...", "available_from": "..." }
  ],
  "best_practices": [
    { "practice": "..." }
  ]
}

Be precise. If a number is stated, include the exact number.
If a limit has changed recently, note it.
Today's date: {today}
```

---

## 7. The Scan Button — End-to-End Flow

### 7.1 User Clicks "Run Full Scan"

```
User clicks button
       │
       ▼
CRT_InitiateFullScan_fn
       │
       ├─ Create Scan_Session record (status = RUNNING)
       ├─ Load all Active rules from Rule_Repository
       ├─ Load all Active module connections
       │
       ├─ For each module with active rules:
       │   ├─ Call fetch function (e.g., CRT_FetchCRMData_fn)
       │   ├─ Receive structured data map
       │   └─ Pass to CRT_EvaluateRule_fn for each rule
       │
       ├─ CRT_EvaluateRule_fn:
       │   ├─ Determine check type (REGEX / SQL_PARSE / etc.)
       │   ├─ Run check against data
       │   ├─ Create Scan_Finding record (PASS/FAIL/WARN/SKIP)
       │   └─ Return result
       │
       ├─ Update Scan_Session:
       │   ├─ Status = COMPLETED
       │   ├─ Total, Passed, Failed, Warned counts
       │   └─ End time
       │
       ├─ CRT_GenerateScanReport_fn:
       │   ├─ Build summary
       │   └─ Send email to admin if Critical failures found
       │
       └─ Redirect user to Scan Results page
```

### 7.2 Progress Tracking (Widget)

A JavaScript widget on the Dashboard page:
- Polls Scan_Session record every 3 seconds
- Shows live progress bar (rules checked / total rules)
- Displays live count of PASS / FAIL / WARN as they come in
- Turns green ✅ on completion or red ❌ on critical failures

### 7.3 Scan Duration Estimate

| Scope | Rules | API Calls | Est. Duration |
|---|---|---|---|
| Full scan (all modules) | ~180 auto-checkable | ~40-60 API calls | 45-90 seconds |
| Single module (CRM only) | ~30 rules | ~8 calls | 10-15 seconds |
| Category (Naming only) | ~60 rules | ~20 calls | 20-30 seconds |

> **Note:** Zoho Creator function timeout is 60 seconds. The full scan uses **chunked execution** — scan is split into per-module batches, each triggered sequentially via workflow, to stay within limits.

---

## 8. UI / Page Layout

### 8.1 Dashboard Page

```
╔══════════════════════════════════════════════════════════════════╗
║  FCI GOVERNANCE SCANNER                          [?] Help  [⚙]  ║
╠══════════════════════════════════════════════════════════════════╣
║                                                                  ║
║  LAST SCAN: 2026-05-25 09:14 IST    Pass Rate: 87%  [↑ +3%]    ║
║                                                                  ║
║  ┌─────────────────────────────────────────────────────────┐    ║
║  │         ████████████████████████████████░░░░░░░░ 87%   │    ║
║  └─────────────────────────────────────────────────────────┘    ║
║                                                                  ║
║  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────────┐   ║
║  │ ✅ PASS  │  │ ❌ FAIL  │  │ ⚠️ WARN  │  │ ⏭ SKIPPED   │   ║
║  │   156    │  │    18    │  │     6    │  │      12      │   ║
║  └──────────┘  └──────────┘  └──────────┘  └──────────────┘   ║
║                                                                  ║
║  ┌──────────────────────────────────────────────────────────┐   ║
║  │ BY MODULE           PASS   FAIL   CRIT   LAST SCAN       │   ║
║  │ CRM                  45     3      1     2026-05-25      │   ║
║  │ Creator              38     2      0     2026-05-25      │   ║
║  │ People               28     5      2     2026-05-25      │   ║
║  │ Analytics            22     4      1     2026-05-25      │   ║
║  │ Sigma                15     2      0     2026-05-25      │   ║
║  │ Recruit              8      2      1     2026-05-25      │   ║
║  └──────────────────────────────────────────────────────────┘   ║
║                                                                  ║
║  CRITICAL & HIGH OPEN FINDINGS:                                 ║
║  ❌ [CRITICAL] CRM: Function 'getLeads' missing CRM_ prefix     ║
║  ❌ [CRITICAL] People: Salary field has no role restriction      ║
║  ❌ [HIGH] Analytics: Report 'Monthly Revenue' uses SELECT *     ║
║  ❌ [HIGH] Recruit: 3 functions missing RCT_ prefix              ║
║                                          [View All Findings →]  ║
║                                                                  ║
║  ┌──────────────────┐   ┌──────────────────┐                   ║
║  │ 🔍 RUN FULL SCAN │   │ 📦 Scan Module ▼ │                   ║
║  │   (all modules)  │   │  CRM / People... │                   ║
║  └──────────────────┘   └──────────────────┘                   ║
╚══════════════════════════════════════════════════════════════════╝
```

### 8.2 Rules Manager Page

```
╔══════════════════════════════════════════════════════════════════╗
║  RULES MANAGER                           [+ Add Rule] [Import]  ║
╠══════════════════════════════════════════════════════════════════╣
║  Filter: [All Modules ▼] [All Categories ▼] [Active ▼] [🔍]   ║
║                                                                  ║
║  ID      │ Rule                     │ Module │ Sev  │ Status    ║
║  ────────┼──────────────────────────┼────────┼──────┼─────────  ║
║  NMC-001 │ CRM Function prefix      │ CRM    │ HIGH │ ✅Active  ║
║  NMC-002 │ CRM Field UPPER_SNAKE    │ CRM    │ MED  │ ✅Active  ║
║  SEC-001 │ No hardcoded credentials │ ALL    │ CRIT │ ✅Active  ║
║  SQL-001 │ Analytics sub-query ≤5   │ ANL    │ CRIT │ ✅Active  ║
║  ...     │ ...                      │ ...    │ ...  │ ...       ║
║                                                                  ║
║  Showing 1–20 of 192 rules                     [< 1 2 3 4 5 >] ║
╚══════════════════════════════════════════════════════════════════╝
```

### 8.3 Findings Detail Page

```
╔══════════════════════════════════════════════════════════════════╗
║  FINDINGS — Scan: SCN-000012 (2026-05-25)     [Export PDF/XLS]  ║
╠══════════════════════════════════════════════════════════════════╣
║  Filter: [All Modules ▼] [FAIL ▼] [CRITICAL ▼] [Unresolved ▼] ║
║                                                                  ║
║  Finding  │ Rule           │ Module │ Record       │ Sev  │ Fix  ║
║  ─────────┼────────────────┼────────┼──────────────┼──────┼──── ║
║  FND-0091 │ NMC-001        │ CRM    │ getLeads     │ HIGH │ [✓] ║
║           │ CRM_prefix_fn  │        │ (function)   │      │     ║
║           │ Missing CRM_ prefix. Actual: 'getLeads'           ║
║           │ Expected: 'CRM_getLeads_fn'                        ║
║           │ Fix: Rename function in CRM Settings → Functions  ║
║  ─────────┼────────────────┼────────┼──────────────┼──────┼──── ║
║  FND-0092 │ SEC-003        │ People │ Salary field │ CRIT │ [✓] ║
║           │ Field_Role_... │        │ (field accs) │      │     ║
║  ...                                                            ║
╚══════════════════════════════════════════════════════════════════╝
```

### 8.4 Reference Data Page

```
╔══════════════════════════════════════════════════════════════════╗
║  REFERENCE DATA (Zoho Docs — AI Scraped)   [🔄 Scrape Now]     ║
╠══════════════════════════════════════════════════════════════════╣
║  Last scraped: 2026-05-25 02:00 IST    Changes detected: 2      ║
║                                                                  ║
║  ⚠️  CHANGED:  CRM API Daily Limit: was 500×users, now 600×users║
║  ⚠️  CHANGED:  Catalyst HTTP timeout: was 30s, now 60s          ║
║                                                                  ║
║  Platform  │ Feature              │ Value          │ Updated    ║
║  ──────────┼──────────────────────┼────────────────┼──────────  ║
║  CRM       │ Daily API Calls      │ 600 × licenses │ 2026-05-25 ║
║  CRM       │ Batch Size           │ 100 records    │ 2026-04-12 ║
║  Analytics │ SQL Sub-query max    │ 5              │ 2026-01-01 ║
║  Catalyst  │ HTTP Timeout         │ 60 seconds     │ 2026-05-25 ║
║  Creator   │ Function Timeout     │ 60 seconds     │ 2026-03-14 ║
╚══════════════════════════════════════════════════════════════════╝
```

---

## 9. Deluge Functions — Full Code

### 9.1 `CRT_InitiateFullScan_fn`

```deluge
/**
 * Function:  CRT_InitiateFullScan_fn
 * Module:    Creator - FCI_GovernanceScanner
 * Purpose:   Orchestrate a full compliance scan across all Zoho modules.
 *            Creates a Scan_Session, triggers per-module checks,
 *            aggregates results, and notifies admin of critical failures.
 * Params:    scan_type (string) - "FULL" or module name e.g. "CRM"
 *            triggered_by (string) - user email
 * Returns:   map { scan_id, status, summary }
 * Author:    India Tech Lead
 * Modified:  2026-05-26 — initial version
 */
string function CRT_InitiateFullScan_fn(string scan_type, string triggered_by)
{
    // ── 1. Create the Scan_Session record ───────────────────────────
    scanName = "Scan_" + scan_type + "_" + zoho.currenttime.toString("yyyy-MM-dd_HH-mm");
    sessionData = {
        "Scan_Name": scanName,
        "Scan_Type": scan_type,
        "Triggered_By": triggered_by,
        "Scan_Status": "RUNNING",
        "Start_Time": zoho.currenttime,
        "Total_Rules_Checked": 0,
        "Rules_Passed": 0,
        "Rules_Failed": 0,
        "Rules_Warned": 0,
        "Rules_Skipped": 0,
        "Critical_Failures": 0
    };
    sessionRecord = zoho.creator.createRecord("fci_governance_scanner", "Scan_Session", sessionData, "j-vivek@funaiconsulting.in");
    scanId = sessionRecord.get("ID");

    // ── 2. Load active rules ─────────────────────────────────────────
    rulesQuery = "Rule_Status = 'Active' && Is_Auto_Checkable = true";
    if (scan_type != "FULL")
    {
        rulesQuery = rulesQuery + " && Applicable_Modules contains '" + scan_type + "'";
    }
    activeRules = zoho.creator.getRecords("fci_governance_scanner", "Rule_Repository", rulesQuery, 1, 200, "j-vivek@funaiconsulting.in");

    totalRules = 0;
    passed = 0;
    failed = 0;
    warned = 0;
    skipped = 0;
    criticalFails = 0;
    errorLog = "";

    // ── 3. Fetch module data ─────────────────────────────────────────
    moduleDataMap = map();

    modulesToFetch = {"CRM", "People", "Creator", "Analytics", "Sigma", "Recruit", "Forms"};
    if (scan_type != "FULL")
    {
        modulesToFetch = {scan_type};
    }

    for each mod in modulesToFetch
    {
        try
        {
            fetchResult = map();
            if (mod == "CRM")       { fetchResult = CRT_FetchCRMData_fn(); }
            if (mod == "People")    { fetchResult = CRT_FetchPeopleData_fn(); }
            if (mod == "Creator")   { fetchResult = CRT_FetchCreatorData_fn(); }
            if (mod == "Analytics") { fetchResult = CRT_FetchAnalyticsData_fn(); }
            if (mod == "Sigma")     { fetchResult = CRT_FetchSigmaData_fn(); }
            if (mod == "Recruit")   { fetchResult = CRT_FetchRecruitData_fn(); }
            if (mod == "Forms")     { fetchResult = CRT_FetchFormsData_fn(); }
            moduleDataMap.put(mod, fetchResult);
        }
        catch (e)
        {
            errorLog = errorLog + "[ERROR] Fetch failed for " + mod + ": " + e.getMessage() + "\n";
            moduleDataMap.put(mod, map());
        }
    }

    // ── 4. Evaluate each rule ────────────────────────────────────────
    for each rule in activeRules
    {
        totalRules = totalRules + 1;
        ruleId = rule.get("ID");
        ruleModules = rule.get("Applicable_Modules");
        checkPattern = rule.get("Check_Pattern");

        // Parse applicable modules (multi-select)
        modList = ruleModules.toList(",");

        findingsForRule = list();

        for each ruleModule in modList
        {
            ruleModuleTrimmed = ruleModule.trim();
            if (ruleModuleTrimmed == "ALL")
            {
                // Apply to all fetched modules
                for each fetchedMod in moduleDataMap.keys()
                {
                    findings = CRT_EvaluateRule_fn(ruleId, rule, fetchedMod, moduleDataMap.get(fetchedMod), scanId);
                    findingsForRule.addAll(findings);
                }
            }
            else if (moduleDataMap.containsKey(ruleModuleTrimmed))
            {
                findings = CRT_EvaluateRule_fn(ruleId, rule, ruleModuleTrimmed, moduleDataMap.get(ruleModuleTrimmed), scanId);
                findingsForRule.addAll(findings);
            }
        }

        // Count results for this rule
        ruleHasFail = false;
        ruleHasWarn = false;
        for each finding in findingsForRule
        {
            if (finding.get("finding_status") == "FAIL")
            {
                ruleHasFail = true;
                if (rule.get("Severity") == "CRITICAL")
                {
                    criticalFails = criticalFails + 1;
                }
            }
            if (finding.get("finding_status") == "WARNING") { ruleHasWarn = true; }
        }

        if (findingsForRule.isEmpty())
        {
            skipped = skipped + 1;
        }
        else if (ruleHasFail)
        {
            failed = failed + 1;
        }
        else if (ruleHasWarn)
        {
            warned = warned + 1;
        }
        else
        {
            passed = passed + 1;
        }
    }

    // ── 5. Update Scan_Session with results ──────────────────────────
    endTime = zoho.currenttime;
    durationSec = (endTime - sessionRecord.get("Start_Time")) / 1000;
    passRate = 0;
    if (totalRules > 0)
    {
        passRate = (passed * 100) / totalRules;
    }

    updateData = {
        "Scan_Status": "COMPLETED",
        "End_Time": endTime,
        "Duration_Seconds": durationSec,
        "Total_Rules_Checked": totalRules,
        "Rules_Passed": passed,
        "Rules_Failed": failed,
        "Rules_Warned": warned,
        "Rules_Skipped": skipped,
        "Critical_Failures": criticalFails,
        "Pass_Rate_Pct": passRate,
        "Error_Log": errorLog
    };
    zoho.creator.updateRecord("fci_governance_scanner", "Scan_Session", scanId, updateData, "j-vivek@funaiconsulting.in");

    // ── 6. Send alert if critical failures found ─────────────────────
    if (criticalFails > 0)
    {
        CRT_SendCriticalAlert_fn(scanId, criticalFails, triggered_by);
    }

    return {"scan_id": scanId, "status": "COMPLETED", "passed": passed, "failed": failed, "critical": criticalFails};
}
```

---

### 9.2 `CRT_EvaluateRule_fn`

```deluge
/**
 * Function:  CRT_EvaluateRule_fn
 * Module:    Creator - FCI_GovernanceScanner
 * Purpose:   Evaluate a single rule against fetched module data.
 *            Supports REGEX, SQL_PARSE, VALUE_COMPARE, EXISTENCE check types.
 *            Creates Scan_Finding records for each item checked.
 * Params:    ruleId (string)      - Rule_Repository record ID
 *            rule (map)           - Full rule record
 *            moduleName (string)  - e.g., "CRM", "Analytics"
 *            moduleData (map)     - Data fetched from module API
 *            scanId (string)      - Scan_Session record ID
 * Returns:   list of finding result maps
 * Author:    India Tech Lead
 * Modified:  2026-05-26 — initial version
 */
list function CRT_EvaluateRule_fn(string ruleId, map rule, string moduleName, map moduleData, string scanId)
{
    findings = list();
    checkType = rule.get("Check_Type");
    checkPatternStr = rule.get("Check_Pattern");
    severity = rule.get("Severity");
    expectedVal = rule.get("Expected_Value");

    // Parse check pattern JSON
    checkPattern = checkPatternStr.toJSONMap();
    if (checkPattern == null || checkPattern.isEmpty())
    {
        return findings;  // No pattern = skip
    }

    // ── REGEX checks ─────────────────────────────────────────────────
    if (checkType == "REGEX")
    {
        patternStr = checkPattern.get("pattern");
        targetField = checkPattern.get("target");  // e.g., "name"
        dataKey = checkPattern.get("data_key");    // Key in moduleData to check

        if (moduleData.containsKey(dataKey))
        {
            itemList = moduleData.get(dataKey);
            for each item in itemList
            {
                itemName = item.get(targetField);
                itemId = item.get("id");
                if (itemName == null) { continue; }

                matchResult = itemName.matches(patternStr);
                findingStatus = matchResult ? "PASS" : "FAIL";
                findingDetail = matchResult ? "Name '" + itemName + "' matches pattern." : "Name '" + itemName + "' does NOT match required pattern: " + patternStr;

                finding = {
                    "Scan_Session": scanId,
                    "Rule_Ref": ruleId,
                    "Module_Name": moduleName,
                    "Source_Record_ID": ifnull(itemId.toString(), ""),
                    "Source_Record_Name": itemName,
                    "Finding_Status": findingStatus,
                    "Finding_Detail": findingDetail,
                    "Actual_Value": itemName,
                    "Expected_Value": expectedVal,
                    "Severity": severity
                };
                zoho.creator.createRecord("fci_governance_scanner", "Scan_Finding", finding, "j-vivek@funaiconsulting.in");
                findings.add({"finding_status": findingStatus, "name": itemName});
            }
        }
    }

    // ── SQL_PARSE checks ─────────────────────────────────────────────
    else if (checkType == "SQL_PARSE")
    {
        maxSubqueries = checkPattern.get("max_subqueries").toInt();
        checkSelectStar = checkPattern.get("check_select_star");
        dataKey = checkPattern.get("data_key");

        if (moduleData.containsKey(dataKey))
        {
            sqlItems = moduleData.get(dataKey);
            for each sqlItem in sqlItems
            {
                reportName = sqlItem.get("name");
                reportId = sqlItem.get("id");
                sqlQuery = sqlItem.get("sql_query");
                if (sqlQuery == null || sqlQuery.isEmpty()) { continue; }

                sqlUpper = sqlQuery.toUpperCase();

                // Count sub-queries (FROM ( SELECT patterns + WITH clauses)
                subQueryCount = 0;
                // Count WITH ... AS (
                withCount = sqlUpper.occurrenceCount("WITH ");
                subQueryCount = subQueryCount + withCount;
                // Count nested FROM (SELECT
                nestedCount = sqlUpper.occurrenceCount("FROM (SELECT");
                subQueryCount = subQueryCount + nestedCount;
                // Count WHERE ... IN (SELECT
                whereInCount = sqlUpper.occurrenceCount("IN (SELECT");
                subQueryCount = subQueryCount + whereInCount;

                subFail = (subQueryCount > maxSubqueries);
                starFail = (checkSelectStar == true && sqlUpper.contains("SELECT *"));

                findingStatus = (subFail || starFail) ? "FAIL" : "PASS";
                detail = "";
                if (subFail)
                {
                    detail = "Sub-query count " + subQueryCount + " exceeds limit of " + maxSubqueries + ". ";
                }
                if (starFail)
                {
                    detail = detail + "Contains 'SELECT *' — must explicitly list columns.";
                }
                if (!subFail && !starFail)
                {
                    detail = "SQL structure is compliant. Sub-queries: " + subQueryCount;
                }

                finding = {
                    "Scan_Session": scanId,
                    "Rule_Ref": ruleId,
                    "Module_Name": moduleName,
                    "Source_Record_ID": reportId.toString(),
                    "Source_Record_Name": reportName,
                    "Finding_Status": findingStatus,
                    "Finding_Detail": detail,
                    "Actual_Value": "sub_queries=" + subQueryCount,
                    "Expected_Value": "sub_queries<=" + maxSubqueries,
                    "Severity": severity
                };
                zoho.creator.createRecord("fci_governance_scanner", "Scan_Finding", finding, "j-vivek@funaiconsulting.in");
                findings.add({"finding_status": findingStatus, "name": reportName});
            }
        }
    }

    // ── VALUE_COMPARE checks ─────────────────────────────────────────
    else if (checkType == "VALUE_COMPARE")
    {
        dataKey = checkPattern.get("data_key");
        valueField = checkPattern.get("value_field");
        expectedValue = checkPattern.get("expected_value");
        operator = ifnull(checkPattern.get("operator"), "equals");

        if (moduleData.containsKey(dataKey))
        {
            items = moduleData.get(dataKey);
            for each item in items
            {
                actualValue = item.get(valueField);
                itemName = ifnull(item.get("name"), dataKey);
                itemId = ifnull(item.get("id"), "");

                passed = false;
                if (operator == "equals")       { passed = (actualValue.toString() == expectedValue.toString()); }
                if (operator == "not_equals")   { passed = (actualValue.toString() != expectedValue.toString()); }
                if (operator == "contains")     { passed = actualValue.toString().contains(expectedValue.toString()); }
                if (operator == "equals_bool")  { passed = (actualValue == expectedValue); }

                findingStatus = passed ? "PASS" : "FAIL";
                detail = "Field '" + valueField + "': actual='" + actualValue + "', expected='" + expectedValue + "'";

                finding = {
                    "Scan_Session": scanId,
                    "Rule_Ref": ruleId,
                    "Module_Name": moduleName,
                    "Source_Record_ID": itemId.toString(),
                    "Source_Record_Name": itemName,
                    "Finding_Status": findingStatus,
                    "Finding_Detail": detail,
                    "Actual_Value": actualValue.toString(),
                    "Expected_Value": expectedValue.toString(),
                    "Severity": severity
                };
                zoho.creator.createRecord("fci_governance_scanner", "Scan_Finding", finding, "j-vivek@funaiconsulting.in");
                findings.add({"finding_status": findingStatus, "name": itemName});
            }
        }
    }

    return findings;
}
```

---

### 9.3 `CRT_FetchCRMData_fn`

```deluge
/**
 * Function:  CRT_FetchCRMData_fn
 * Module:    Creator - FCI_GovernanceScanner
 * Purpose:   Fetch metadata from Zoho CRM for compliance checking.
 *            Retrieves custom functions, workflows, fields, modules, blueprints.
 * Params:    none
 * Returns:   map containing structured CRM metadata lists
 * Author:    India Tech Lead
 * Modified:  2026-05-26 — initial version
 */
map function CRT_FetchCRMData_fn()
{
    result = map();
    baseUrl = "https://www.zohoapis.in/crm/v7";
    connName = "conn_zoho_crm";

    // ── Custom Functions ─────────────────────────────────────────────
    try
    {
        resp = invokeurl
        [
            url: baseUrl + "/settings/functions"
            type: GET
            connection: connName
        ];
        functions = resp.get("functions");
        if (functions != null)
        {
            funcList = list();
            for each fn in functions
            {
                funcList.add({
                    "id": fn.get("id"),
                    "name": fn.get("name"),
                    "display_name": fn.get("display_label")
                });
            }
            result.put("crm_functions", funcList);
        }
    }
    catch (e)
    {
        result.put("crm_functions", list());
        info "[CRT_FetchCRMData_fn] Failed to fetch functions: " + e.getMessage();
    }

    // ── Workflow Rules ───────────────────────────────────────────────
    try
    {
        resp = invokeurl
        [
            url: baseUrl + "/settings/automation/workflow_rules"
            type: GET
            connection: connName
        ];
        workflows = resp.get("workflow_rules");
        if (workflows != null)
        {
            wfList = list();
            for each wf in workflows
            {
                wfList.add({
                    "id": wf.get("id"),
                    "name": wf.get("name"),
                    "module": wf.get("module").get("api_name")
                });
            }
            result.put("crm_workflows", wfList);
        }
    }
    catch (e)
    {
        result.put("crm_workflows", list());
    }

    // ── Custom Modules ───────────────────────────────────────────────
    try
    {
        resp = invokeurl
        [
            url: baseUrl + "/settings/modules"
            type: GET
            connection: connName
        ];
        modules = resp.get("modules");
        if (modules != null)
        {
            modList = list();
            for each mod in modules
            {
                if (mod.get("generated_type") == "custom")
                {
                    modList.add({
                        "id": mod.get("id"),
                        "name": mod.get("api_name"),
                        "display_name": mod.get("module_name")
                    });
                }
            }
            result.put("crm_modules", modList);
        }
    }
    catch (e)
    {
        result.put("crm_modules", list());
    }

    // ── Blueprints (from Deals module as example) ────────────────────
    try
    {
        resp = invokeurl
        [
            url: baseUrl + "/settings/blueprints"
            type: GET
            connection: connName
        ];
        blueprints = resp.get("blueprints");
        if (blueprints != null)
        {
            bpList = list();
            for each bp in blueprints
            {
                bpList.add({
                    "id": bp.get("id"),
                    "name": bp.get("name")
                });
            }
            result.put("crm_blueprints", bpList);
        }
    }
    catch (e)
    {
        result.put("crm_blueprints", list());
    }

    // ── Fields for key modules (check naming conventions) ────────────
    keyModules = {"Leads", "Deals", "Contacts", "Accounts"};
    allFields = list();
    for each modName in keyModules
    {
        try
        {
            resp = invokeurl
            [
                url: baseUrl + "/settings/fields?module=" + modName
                type: GET
                connection: connName
            ];
            fields = resp.get("fields");
            if (fields != null)
            {
                for each field in fields
                {
                    if (field.get("custom_field") == true)
                    {
                        allFields.add({
                            "id": field.get("id"),
                            "name": field.get("api_name"),
                            "display_name": field.get("display_label"),
                            "data_type": field.get("data_type"),
                            "module": modName
                        });
                    }
                }
            }
        }
        catch (e)
        {
            info "[CRT_FetchCRMData_fn] Failed fields for " + modName + ": " + e.getMessage();
        }
    }
    result.put("crm_fields", allFields);

    return result;
}
```

---

### 9.4 `CRT_GeminiScrapeZoho_fn`

```deluge
/**
 * Function:  CRT_GeminiScrapeZoho_fn
 * Module:    Creator - FCI_GovernanceScanner
 * Purpose:   Use Gemini AI (with web grounding) to scrape Zoho documentation
 *            pages and extract structured limit/feature data.
 *            Stores results in Reference_Data form.
 *            Flags any changes from previous values.
 * Params:    platform (string) - e.g., "CRM", "Analytics", "ALL"
 * Returns:   map { scraped_count, changed_count, error_count }
 * Author:    India Tech Lead
 * Modified:  2026-05-26 — initial version
 */
map function CRT_GeminiScrapeZoho_fn(string platform)
{
    geminiApiKey = zoho.encryption.decrypt(zoho.orgs.getOrgVariable("GEMINI_API_KEY_ENC"));
    geminiUrl = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=" + geminiApiKey;

    // Documentation targets to scrape
    scrapeTargets = list();
    scrapeTargets.add({
        "platform": "CRM",
        "url": "https://help.zoho.com/portal/en/kb/crm/developer-guide/apis/articles/api-limits",
        "category": "API_Limit"
    });
    scrapeTargets.add({
        "platform": "Analytics",
        "url": "https://help.zoho.com/portal/en/kb/analytics/using-zoho-analytics/sql-queries",
        "category": "Hard_Limit"
    });
    scrapeTargets.add({
        "platform": "Catalyst",
        "url": "https://help.zoho.com/portal/en/kb/catalyst/getting-started/articles/catalyst-limits",
        "category": "API_Limit"
    });
    scrapeTargets.add({
        "platform": "Creator",
        "url": "https://help.zoho.com/portal/en/kb/creator/developer-guide/deluge/articles/limitations",
        "category": "API_Limit"
    });
    scrapeTargets.add({
        "platform": "Sigma",
        "url": "https://help.zoho.com/portal/en/kb/sigma/getting-started",
        "category": "Feature"
    });

    scrapedCount = 0;
    changedCount = 0;
    errorCount = 0;

    todayStr = zoho.currentdate.toString("yyyy-MM-dd");

    for each target in scrapeTargets
    {
        if (platform != "ALL" && target.get("platform") != platform)
        {
            continue;
        }

        targetUrl = target.get("url");
        targetPlatform = target.get("platform");
        targetCategory = target.get("category");

        // Build Gemini prompt
        prompt = "You are a technical documentation extractor for Zoho platform governance.\n\n";
        prompt = prompt + "Fetch and analyze this Zoho documentation page: " + targetUrl + "\n\n";
        prompt = prompt + "Extract ALL limits, timeouts, hard constraints, and best practices.\n";
        prompt = prompt + "Return ONLY valid JSON in this exact structure (no markdown, no explanations):\n";
        prompt = prompt + "{\n";
        prompt = prompt + "  \"platform\": \"" + targetPlatform + "\",\n";
        prompt = prompt + "  \"items\": [\n";
        prompt = prompt + "    {\n";
        prompt = prompt + "      \"feature_name\": \"(string - descriptive name)\",\n";
        prompt = prompt + "      \"current_value\": \"(string - the exact limit/value)\",\n";
        prompt = prompt + "      \"category\": \"API_Limit|Hard_Limit|Timeout|Best_Practice|Feature\",\n";
        prompt = prompt + "      \"notes\": \"(string - any important context)\"\n";
        prompt = prompt + "    }\n";
        prompt = prompt + "  ]\n";
        prompt = prompt + "}\n\n";
        prompt = prompt + "Today: " + todayStr;

        // Call Gemini API with Google Search grounding
        requestBody = {
            "contents": [
                {
                    "parts": [{"text": prompt}]
                }
            ],
            "tools": [{"google_search": {}}],
            "generationConfig": {
                "temperature": 0.1,
                "maxOutputTokens": 2048,
                "responseMimeType": "application/json"
            }
        };

        try
        {
            geminiResp = invokeurl
            [
                url: geminiUrl
                type: POST
                parameters: requestBody.toString()
                headers: {"Content-Type": "application/json"}
            ];

            candidates = geminiResp.get("candidates");
            if (candidates != null && candidates.size() > 0)
            {
                content = candidates.get(0).get("content");
                parts = content.get("parts");
                if (parts != null && parts.size() > 0)
                {
                    jsonText = parts.get(0).get("text");
                    parsedData = jsonText.toJSONMap();
                    items = parsedData.get("items");

                    if (items != null)
                    {
                        for each item in items
                        {
                            featureName = item.get("feature_name");
                            currentValue = item.get("current_value");
                            itemCategory = item.get("category");
                            notes = ifnull(item.get("notes"), "");

                            // Check if record already exists for this feature
                            existingQuery = "Platform = '" + targetPlatform + "' && Feature_Name = '" + featureName + "'";
                            existingRecords = zoho.creator.getRecords("fci_governance_scanner", "Reference_Data", existingQuery, 1, 1, "j-vivek@funaiconsulting.in");

                            hasChanged = false;
                            previousValue = "";

                            if (existingRecords.size() > 0)
                            {
                                existingRecord = existingRecords.get(0);
                                existingId = existingRecord.get("ID");
                                previousValue = existingRecord.get("Current_Value");
                                hasChanged = (previousValue != currentValue);

                                updateData = {
                                    "Current_Value": currentValue,
                                    "Previous_Value": previousValue,
                                    "Has_Changed": hasChanged,
                                    "Last_Scraped": zoho.currenttime,
                                    "Scrape_Status": "SUCCESS",
                                    "Source_URL": targetUrl,
                                    "Gemini_Summary": notes
                                };
                                zoho.creator.updateRecord("fci_governance_scanner", "Reference_Data", existingId, updateData, "j-vivek@funaiconsulting.in");
                            }
                            else
                            {
                                newRecord = {
                                    "Platform": targetPlatform,
                                    "Feature_Name": featureName,
                                    "Ref_Category": itemCategory,
                                    "Current_Value": currentValue,
                                    "Previous_Value": "",
                                    "Has_Changed": false,
                                    "Source_URL": targetUrl,
                                    "Gemini_Summary": notes,
                                    "Last_Scraped": zoho.currenttime,
                                    "Scrape_Status": "SUCCESS"
                                };
                                zoho.creator.createRecord("fci_governance_scanner", "Reference_Data", newRecord, "j-vivek@funaiconsulting.in");
                            }

                            scrapedCount = scrapedCount + 1;
                            if (hasChanged) { changedCount = changedCount + 1; }
                        }
                    }
                }
            }
        }
        catch (e)
        {
            errorCount = errorCount + 1;
            info "[CRT_GeminiScrapeZoho_fn] Error scraping " + targetPlatform + ": " + e.getMessage();
        }
    }

    // Send alert if limits have changed
    if (changedCount > 0)
    {
        CRT_SendLimitChangeAlert_fn(changedCount);
    }

    return {"scraped_count": scrapedCount, "changed_count": changedCount, "error_count": errorCount};
}
```

---

### 9.5 `CRT_FetchAnalyticsData_fn`

```deluge
/**
 * Function:  CRT_FetchAnalyticsData_fn
 * Module:    Creator - FCI_GovernanceScanner
 * Purpose:   Fetch Analytics workspaces, reports, dashboards, and SQL
 *            queries for compliance checking (naming + SQL sub-query limit).
 * Params:    none
 * Returns:   map with analytics metadata
 * Author:    India Tech Lead
 * Modified:  2026-05-26 — initial version
 */
map function CRT_FetchAnalyticsData_fn()
{
    result = map();
    baseUrl = "https://analyticsapi.zoho.in/restapi/v2";
    connName = "conn_zoho_analytics";
    orgId = zoho.orgs.getOrgVariable("ZOHO_ORG_ID");

    // ── Workspaces ───────────────────────────────────────────────────
    workspaceList = list();
    try
    {
        resp = invokeurl
        [
            url: baseUrl + "/workspaces?orgId=" + orgId
            type: GET
            connection: connName
        ];
        workspaces = resp.get("workspaces");
        if (workspaces != null)
        {
            for each ws in workspaces
            {
                workspaceList.add({
                    "id": ws.get("workspaceId"),
                    "name": ws.get("workspaceName")
                });
            }
        }
    }
    catch (e)
    {
        info "[CRT_FetchAnalyticsData_fn] Workspaces error: " + e.getMessage();
    }
    result.put("analytics_workspaces", workspaceList);

    // ── Reports (with SQL) from each workspace ───────────────────────
    allReports = list();
    allDashboards = list();
    allTables = list();

    for each ws in workspaceList
    {
        wsId = ws.get("id");
        wsName = ws.get("name");

        // Get views (reports) in workspace
        try
        {
            resp = invokeurl
            [
                url: baseUrl + "/workspaces/" + wsId + "/views"
                type: GET
                connection: connName
            ];
            views = resp.get("views");
            if (views != null)
            {
                for each view in views
                {
                    viewType = view.get("viewType");
                    viewName = view.get("viewName");
                    viewId = view.get("viewId");

                    if (viewType == "report")
                    {
                        // Try to get SQL for this report
                        sqlQuery = "";
                        try
                        {
                            sqlResp = invokeurl
                            [
                                url: baseUrl + "/workspaces/" + wsId + "/views/" + viewId + "/sql"
                                type: GET
                                connection: connName
                            ];
                            sqlQuery = ifnull(sqlResp.get("sql"), "");
                        }
                        catch (sqlE)
                        {
                            sqlQuery = "";
                        }

                        allReports.add({
                            "id": viewId,
                            "name": viewName,
                            "workspace": wsName,
                            "sql_query": sqlQuery
                        });
                    }
                    else if (viewType == "dashboard")
                    {
                        allDashboards.add({
                            "id": viewId,
                            "name": viewName,
                            "workspace": wsName
                        });
                    }
                    else if (viewType == "table")
                    {
                        allTables.add({
                            "id": viewId,
                            "name": viewName,
                            "workspace": wsName
                        });
                    }
                }
            }
        }
        catch (e)
        {
            info "[CRT_FetchAnalyticsData_fn] Views error for workspace " + wsName + ": " + e.getMessage();
        }
    }

    result.put("analytics_reports", allReports);
    result.put("analytics_dashboards", allDashboards);
    result.put("analytics_tables", allTables);

    return result;
}
```

---

## 10. Connections Setup

### 10.1 Required Zoho Connections

Go to **Creator → Connections → Add Connection → Zoho OAuth**

| Connection Name | Service | Scopes Required |
|---|---|---|
| `conn_zoho_crm` | Zoho CRM | `ZohoCRM.settings.functions.READ`, `ZohoCRM.settings.modules.READ`, `ZohoCRM.settings.fields.READ`, `ZohoCRM.settings.workflows.READ`, `ZohoCRM.settings.blueprints.READ` |
| `conn_zoho_people` | Zoho People | `ZOHOPEOPLE.custom.READ`, `ZOHOPEOPLE.appraisal.READ` |
| `conn_zoho_creator` | Zoho Creator | `ZohoCreator.meta.READ`, `ZohoCreator.data.READ` |
| `conn_zoho_analytics` | Zoho Analytics | `ZohoAnalytics.metadata.READ`, `ZohoAnalytics.data.READ` |
| `conn_zoho_sigma` | Zoho Sigma | `ZohoSigma.extensions.READ` |
| `conn_zoho_recruit` | Zoho Recruit | `ZohoRecruit.settings.READ` |
| `conn_zoho_forms` | Zoho Forms | `ZohoForms.integration.READ` |

### 10.2 Gemini API Connection

Go to **Creator → Connections → Add Connection → Custom → REST API**

```
Connection Name: conn_gemini_ai
Auth Type:       API Key (in query parameter)
Param Name:      key
Param Value:     [Store in Org Variable GEMINI_API_KEY_ENC — encrypted]
Base URL:        https://generativelanguage.googleapis.com
```

### 10.3 Org Variables to Set

```
GEMINI_API_KEY_ENC    → Encrypted Gemini API key
ZOHO_ORG_ID           → Your Zoho Org ID (from Accounts settings)
SCAN_ADMIN_EMAIL      → Admin email for critical failure alerts
ZOHO_CREATOR_APP_NAME → "fci_governance_scanner"
ZOHO_CREATOR_OWNER    → Creator app owner username
```

---

## 11. Scheduled Automations

### 11.1 Weekly Gemini Scrape

**Creator → Scheduled Functions**

```
Name:     CRT_WeeklyDocScrape_sch
Schedule: Every Sunday at 02:00 IST
Function: CRT_GeminiScrapeZoho_fn("ALL")
```

### 11.2 Nightly Auto-Scan (Optional)

```
Name:     CRT_NightlyAutoScan_sch
Schedule: Every weekday at 23:00 IST
Function: CRT_InitiateFullScan_fn("FULL", "automated@funaiconsulting.in")
```

### 11.3 Monthly Rules Review Reminder

```
Name:     CRT_MonthlyRulesReview_sch
Schedule: 1st of each month at 09:00 IST
Action:   Send email to India Tech Lead to review/update rule set
```

---

## 12. Build Phases & Roadmap

### Phase 1 — Foundation (Week 1–2)
**Goal:** App structure + rules database working

- [ ] Create `FCI_GovernanceScanner` application in Zoho Creator
- [ ] Build all 6 forms (Rule_Repository, Scan_Session, Scan_Finding, Reference_Data, Module_Connection, Remediation_Log)
- [ ] Import all ~190 rules from standards docs 00–08 (use the seed data in Section 13)
- [ ] Build basic CRUD pages for rules management
- [ ] Set up all Zoho Connections (CRM, People, Creator, Analytics, etc.)
- [ ] Test each connection with a simple GET call

### Phase 2 — CRM + Creator Scanner (Week 3)
**Goal:** First two modules checking live data

- [ ] Build `CRT_FetchCRMData_fn` and test against live CRM
- [ ] Build `CRT_FetchCreatorData_fn`
- [ ] Build `CRT_EvaluateRule_fn` (REGEX + VALUE_COMPARE)
- [ ] Build `CRT_InitiateFullScan_fn` (skeleton)
- [ ] Build Dashboard page with manual "Scan CRM" button
- [ ] Validate first set of findings against known CRM state

### Phase 3 — All Modules (Week 4–5)
**Goal:** Full coverage across all 7 modules

- [ ] `CRT_FetchPeopleData_fn`
- [ ] `CRT_FetchAnalyticsData_fn` + SQL_PARSE check type
- [ ] `CRT_FetchSigmaData_fn`
- [ ] `CRT_FetchRecruitData_fn`
- [ ] `CRT_FetchFormsData_fn`
- [ ] Full scan orchestration with progress tracking widget
- [ ] Email alerts for critical failures

### Phase 4 — Gemini Scraper (Week 6)
**Goal:** AI-powered doc scraping live

- [ ] Set up Gemini API connection
- [ ] Build `CRT_GeminiScrapeZoho_fn`
- [ ] Reference Data page with change detection
- [ ] Weekly scheduled function
- [ ] Link scraped data to rules (auto-update limits in rules from scraped data)

### Phase 5 — Polish & Reporting (Week 7–8)
**Goal:** Production-ready with reports and tracking

- [ ] Full Dashboard with trend charts (Analytics embed)
- [ ] Export findings to PDF/Excel
- [ ] Remediation tracking workflow
- [ ] Scan history with pass-rate trend chart
- [ ] Role-based access (Admin / Developer / Viewer)
- [ ] User onboarding guide within the app
- [ ] Performance optimisation (chunked scanning for large orgs)

---

## 13. Rule Seed Data — All Standards Mapped

### 13.1 Rules Import Table

This is the complete rule set to seed into `Rule_Repository`. Import via Creator CSV upload or use the bulk-create Deluge function `CRT_SeedRules_fn`.

#### Category: NAMING — CRM

| Short Code | Rule Name | Check Type | Pattern | Severity |
|---|---|---|---|---|
| NMC-CRM-001 | CRM function must have CRM_ prefix | REGEX | `^CRM_[a-zA-Z][a-zA-Z0-9]+_(fn\|wf\|bp\|rpt\|dsh\|con\|var)$` | HIGH |
| NMC-CRM-002 | CRM custom field API name UPPER_SNAKE_CASE | REGEX | `^[A-Z][A-Z0-9_]+[A-Z0-9]$` | MEDIUM |
| NMC-CRM-003 | CRM Boolean field must start with Is_ or Has_ | REGEX | `^(Is_\|Has_\|Can_)[A-Z]` | MEDIUM |
| NMC-CRM-004 | CRM Date field must end with _Date | REGEX | `.*_Date$` | LOW |
| NMC-CRM-005 | CRM Pipeline must follow naming: Market_Product_Pipeline | REGEX | `^[A-Z][a-zA-Z]+_[A-Z][a-zA-Z]+_Pipeline$` | MEDIUM |
| NMC-CRM-006 | CRM Blueprint name must end with _BP | REGEX | `.*_BP$` | MEDIUM |
| NMC-CRM-007 | CRM Workflow: [Module]_[Trigger]_[Action] | REGEX | `^[A-Z][a-zA-Z]+_[A-Z][a-zA-Z]+_[A-Z][a-zA-Z]+$` | LOW |

#### Category: NAMING — Creator

| Short Code | Rule Name | Check Type | Pattern | Severity |
|---|---|---|---|---|
| NMC-CRT-001 | Creator function must have CRT_ prefix | REGEX | `^CRT_[a-zA-Z][a-zA-Z0-9]+_(fn\|wf\|sch)$` | HIGH |
| NMC-CRT-002 | Creator form names must be PascalCase | REGEX | `^[A-Z][a-zA-Z0-9]*$` | MEDIUM |
| NMC-CRT-003 | Creator field API names must be snake_case | REGEX | `^[a-z][a-z0-9_]*[a-z0-9]$` | MEDIUM |
| NMC-CRT-004 | Creator report: Entity_ViewType_Filter | REGEX | `^[A-Z][a-zA-Z]+_[A-Z][a-zA-Z]+(_[A-Z][a-zA-Z]+)?$` | LOW |

#### Category: NAMING — People

| Short Code | Rule Name | Check Type | Pattern | Severity |
|---|---|---|---|---|
| NMC-PEO-001 | People custom function must have PEO_ prefix | REGEX | `^PEO_[a-zA-Z][a-zA-Z0-9]+_fn$` | HIGH |
| NMC-PEO-002 | People custom fields must have PEO_ prefix | REGEX | `^PEO_[A-Z][A-Z0-9_]+$` | MEDIUM |

#### Category: NAMING — Analytics

| Short Code | Rule Name | Check Type | Pattern | Severity |
|---|---|---|---|---|
| NMC-ANL-001 | Analytics workspace: Domain_Team_Workspace | REGEX | `^[A-Z][a-zA-Z]+_[A-Z][a-zA-Z]+_Workspace$` | MEDIUM |
| NMC-ANL-002 | Analytics table must have module prefix | REGEX | `^(CRM\|CREATOR\|PEOPLE\|RECRUIT\|CATALYST\|FORMS\|MANUAL\|EXT)_[A-Z][a-zA-Z0-9]+$` | MEDIUM |
| NMC-ANL-003 | Analytics report: Module_Metric_TimeRange | REGEX | `^[A-Z][a-zA-Z]+_[A-Z][a-zA-Z]+(_[A-Z][a-zA-Z]+)?$` | LOW |
| NMC-ANL-004 | Analytics dashboard: Audience_Domain_Dashboard | REGEX | `^[A-Z][a-zA-Z]+_[A-Z][a-zA-Z]+_Dashboard$` | MEDIUM |

#### Category: SQL — Analytics

| Short Code | Rule Name | Check Type | Expected | Severity |
|---|---|---|---|---|
| SQL-ANL-001 | Analytics SQL sub-query count must be ≤ 5 | SQL_PARSE | max_subqueries=5 | CRITICAL |
| SQL-ANL-002 | Analytics SQL must not use SELECT * | SQL_PARSE | check_select_star=true | HIGH |
| SQL-ANL-003 | Analytics SQL keywords must be uppercase | REGEX | `\b(select\|from\|where\|group\|order\|having)\b` (fail if match) | MEDIUM |

#### Category: SECURITY — All Modules

| Short Code | Rule Name | Check Type | Severity |
|---|---|---|---|
| SEC-ALL-001 | No hardcoded credentials in functions | REGEX (code scan) | CRITICAL |
| SEC-ALL-002 | All external API calls use Zoho Connections | EXISTENCE | CRITICAL |
| SEC-ALL-003 | No OAuth tokens in widget JS code | REGEX (code scan) | CRITICAL |
| SEC-ALL-004 | No console.log in production widgets | REGEX (code scan) | HIGH |
| SEC-ALL-005 | No var keyword in widget JS | REGEX (code scan) | MEDIUM |
| SEC-ALL-006 | No innerHTML with external data | REGEX (code scan) | HIGH |

#### Category: NAMING — Sigma

| Short Code | Rule Name | Check Type | Pattern | Severity |
|---|---|---|---|---|
| NMC-SGM-001 | Sigma extension must have fci_ prefix | REGEX | `^fci_[a-z][a-z0-9_]+$` | HIGH |
| NMC-SGM-002 | Sigma widget component names kebab-case | REGEX | `^[a-z][a-z0-9-]+[a-z0-9]$` | MEDIUM |
| NMC-SGM-003 | Sigma connection names lowercase_underscore | REGEX | `^[a-z][a-z0-9_]+[a-z0-9]$` | MEDIUM |

#### Category: NAMING — Recruit

| Short Code | Rule Name | Check Type | Pattern | Severity |
|---|---|---|---|---|
| NMC-RCT-001 | Recruit function must have RCT_ prefix | REGEX | `^RCT_[a-zA-Z][a-zA-Z0-9]+_fn$` | HIGH |
| NMC-RCT-002 | Recruit custom fields snake_case | REGEX | `^[a-z][a-z0-9_]*[a-z0-9]$` | MEDIUM |

#### Category: NAMING — Forms

| Short Code | Rule Name | Check Type | Pattern | Severity |
|---|---|---|---|---|
| NMC-FRM-001 | Form name: Purpose_Audience_Version | REGEX | `^[A-Z][a-zA-Z]+_[A-Z][a-zA-Z]+_v[0-9]+$` | MEDIUM |
| NMC-FRM-002 | Form integration name: FRM_ prefix | REGEX | `^FRM_[A-Z][a-zA-Z]+_To_[A-Z][a-zA-Z]+$` | MEDIUM |

---

## Appendix A: Quick Reference — Rule Short Codes

| Range | Category |
|---|---|
| NMC-CRM-001 to 010 | CRM Naming |
| NMC-CRT-001 to 010 | Creator Naming |
| NMC-PEO-001 to 010 | People Naming |
| NMC-RCT-001 to 010 | Recruit Naming |
| NMC-FRM-001 to 010 | Forms Naming |
| NMC-ANL-001 to 010 | Analytics Naming |
| NMC-SGM-001 to 010 | Sigma Naming |
| NMC-CAT-001 to 010 | Catalyst Naming |
| SQL-ANL-001 to 010 | Analytics SQL |
| SEC-ALL-001 to 020 | Security (All Modules) |
| SEC-CRM-001 to 010 | CRM-Specific Security |
| API-CRM-001 to 010 | CRM API Limits |
| API-CAT-001 to 010 | Catalyst Limits |
| GIT-ALL-001 to 010 | Git Standards |
| STR-CAT-001 to 010 | Catalyst Structure |
| STR-WGT-001 to 010 | Widget Structure |

---

## Appendix B: Environment Architecture

```
PRODUCTION
├── Zoho Creator App: FCI_GovernanceScanner
├── Connections: conn_zoho_crm, conn_zoho_people, ...
├── Org Variables: GEMINI_API_KEY_ENC, ZOHO_ORG_ID, ...
└── Scheduled: Weekly scrape, Nightly scan

DEVELOPMENT (test org or sandbox)
├── All same structure
├── Test connections pointing to sandbox Zoho apps
└── Mock data in Reference_Data for offline testing
```

---

*End of Document — FCI_GovernanceScanner Design v1.0.0*

---

## 📚 Source Classification

| Standard / Section | Source | Notes |
|---|---|---|
| Scanner app built in Zoho Creator | 🟢 FCI Internal | Design choice; Creator chosen for low-code flexibility and Deluge integration |
| ~50 scan rules with regex patterns | 🟢 FCI Internal | Rules derived from FCI's own naming/coding standards |
| Rule_Repository, Scan_Session, Scan_Finding forms | 🟢 FCI Internal | FCI data model design |
| Zoho Creator API calls for scanning | 🔵 Zoho Official | Uses official Creator REST API — zoho.com/creator/help/ |
| Dashboard widget SDK pattern | 🔵 Zoho Official | Official Zoho Creator widget SDK |
| Deluge scanning functions | 🟢 FCI Internal | FCI-authored functions |
| Module connection form for API credentials | 🟢 FCI Internal | FCI architecture pattern for multi-module scanning |
| Seed data in CSV format | 🟢 FCI Internal | FCI deployment approach |
