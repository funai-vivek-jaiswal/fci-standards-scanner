# 10 — Sources & Validation Appendix

**FCI Zoho Standards & Best Practices — Source Transparency and Validation Record**

---

> **Document Status:** Active  
> **Version:** 1.0.0  
> **Last Updated:** 2026-05-27  
> **Owner:** India Lead  
> **Purpose:** Provide full source attribution, verified URLs, factual corrections, and a repeatable validation framework for all standards in this documentation set.

---

## Table of Contents

1. [How to Read Source Labels](#1-how-to-read-source-labels)
2. [Verified Official Zoho Documentation URLs](#2-verified-official-zoho-documentation-urls)
3. [Factual Corrections Found During Validation](#3-factual-corrections-found-during-validation)
4. [Standards Marked 🔴 Unverified — Action Required](#4-standards-marked--unverified--action-required)
5. [FCI Internal Standards Registry](#5-fci-internal-standards-registry)
6. [The 3-Layer Validation Framework](#6-the-3-layer-validation-framework)
7. [Source Classification Master Table](#7-source-classification-master-table)
8. [Recommended Validation Workflow](#8-recommended-validation-workflow)
9. [Validation Log](#9-validation-log)

---

## 1. How to Read Source Labels

Every standards document in this set ends with a **📚 Source Classification** table. Each row is labelled with one of the following:

| Label | Meaning | Trust Level | Action |
|---|---|---|---|
| 🔵 **Zoho Official** | Directly verified from Zoho's published documentation or API spec | High — enforce | Re-check when Zoho releases major version updates |
| 🟢 **FCI Internal** | FCI's own policy or convention — not mandated by Zoho, but deliberately chosen | High — enforce | Update via mini-CAB process only |
| 🟡 **Community** | Observed pattern from Zoho Community, partner blogs, or Marketplace examples | Medium — use with judgment | Verify before using in a production-critical context |
| 🔴 **Unverified** | Written in good faith based on general knowledge; official source not yet confirmed | Low — do not enforce until verified | Assign an owner to verify; see §4 |
| ⚠️ **Correction** | Found to differ from official docs; corrected version now in document | High (post-correction) | Old value noted in §3 of this document |

> **Rule:** A standard labelled 🔴 Unverified must NOT be cited as a hard platform constraint in a director-level review or client-facing document until it has been verified and relabelled.

---

## 2. Verified Official Zoho Documentation URLs

URLs verified on **2026-05-27** via live HTTP fetch. Status codes noted.

### 2.1 Core Developer Resources

| Resource | Verified URL | HTTP Status | Notes |
|---|---|---|---|
| Zoho Developer Portal | https://www.zoho.com/developer/ | ✅ 200 | Lists all developer products |
| Deluge Scripting Language | https://www.zoho.com/deluge/help/ | ✅ 200 | Full language reference |
| Zoho APIs Overview | https://www.zoho.com/developer/ | ✅ 200 | REST API documentation hub |
| Zoho Community | https://community.zoho.com | ✅ 200 | Forums, patterns, Q&A |
| Zoho Marketplace | https://marketplace.zoho.com | ✅ 200 | Published extension examples |

### 2.2 Module-Specific Official Documentation

| Module | Verified URL | HTTP Status | Previous (Broken) URL |
|---|---|---|---|
| **Catalyst** | https://docs.catalyst.zoho.com/en/ | ✅ 301→200 | `catalyst.zoho.com/help/` redirects here |
| **Creator** | https://www.zoho.com/creator/help/ | ✅ 200 | — |
| **Sigma** | https://help.zoho.com/portal/en/kb/sigma/ | ✅ 200 | ~~`zoho.com/sigma/help/`~~ → **404** |
| **CRM Developer** | https://www.zoho.com/crm/developer/docs/ | ✅ 200 | — |
| **CRM API Limits** | https://www.zoho.com/crm/developer/docs/api/v7/api-limits.html | ✅ 200 | — |
| **People API** | https://www.zoho.com/people/api/overview.html | ✅ 200 | ~~`zoho.com/people/api/overview/`~~ → **404** |
| **Recruit Developer Guide** | https://help.zoho.com/portal/kb/zoho-recruit/developer-guide | ✅ 200 | ~~`zoho.com/recruit/developer-guide/`~~ → **404** |
| **Forms** | https://www.zoho.com/forms/help/ | ✅ 200 | — |
| **Analytics API** | https://www.zoho.com/analytics/api/ | ✅ 200 | — |
| **Analytics Help** | https://www.zoho.com/analytics/help/ | ✅ 200 | — |

### 2.3 Broken URLs Found (Do Not Use)

The following URLs appeared in earlier versions of this documentation and return 4xx errors:

| Broken URL | Replacement |
|---|---|
| `https://www.zoho.com/sigma/help/` | `https://help.zoho.com/portal/en/kb/sigma/` |
| `https://www.zoho.com/people/api/overview/` | `https://www.zoho.com/people/api/overview.html` |
| `https://www.zoho.com/recruit/developer-guide/` | `https://help.zoho.com/portal/kb/zoho-recruit/developer-guide` |
| `https://www.zoho.com/creator/community/` | Use `https://community.zoho.com` (general Zoho community) |
| `developer.zoho.com` (direct) | Redirects to `https://www.zoho.com/developer/` |

---

## 3. Factual Corrections Found During Validation

These are standards that were **written incorrectly** in the original documents. All have been corrected in-place; the correction is noted in the respective document with a ⚠️ Correction label.

### 3.1 CRM API Daily Credit Limits — `04_Zoho_CRM_Standards.md §10.1`

**Verification date:** 2026-05-27  
**Source:** https://www.zoho.com/crm/developer/docs/api/v7/api-limits.html

| Plan | Old (Wrong) Value | Corrected Value |
|---|---|---|
| Free | 5,000 calls/day ✓ | 5,000 credits/day — correct |
| Standard | "Licenses × 250" | **50,000 base + 250/user, max 100,000** |
| Professional | "Licenses × 500" | **50,000 base + 500/user, max 3,000,000** |
| Enterprise | "Licenses × 500" ❌ | **50,000 base + 1,000/user, max 5,000,000** |
| Ultimate | "Licenses × 1,000" ❌ | **50,000 base + 2,000/user, Unlimited** |

**What changed:** The original table used a "licenses × N" formula which is a simplification. The actual structure is a **base 50,000 credits + per-user credit addition**, with a plan-level maximum. Enterprise and Ultimate per-user multipliers were also wrong.

**Additional verified data:**
- Concurrent request limits: Free 5 · Standard 10 · Professional 15 · Enterprise 20 · Ultimate 25
- Sub-concurrency limit: **10 for all editions** for specific operations
- Batch insert/update: **100 records per call** ✓
- Credit costs: Convert Lead = 5, Send Mail = 20, Merge = 50, Mass Convert = 200, Bulk Write = 500

---

## 4. Standards Marked 🔴 Unverified — Action Required

These standards are in the documentation but **have not been confirmed against official Zoho sources**. They are based on community knowledge or general platform patterns. They must be verified before being enforced as hard rules.

| Standard | In Document | Claimed Value | Who Should Verify | Priority |
|---|---|---|---|---|
| Custom function execution timeout | `04_Zoho_CRM_Standards.md §10.2` | 15 seconds | India Tech Lead | 🔴 High |
| Standalone function execution timeout | `04_Zoho_CRM_Standards.md §10.2` | 30 seconds | India Tech Lead | 🔴 High |
| Blueprint transitions per record per day | `04_Zoho_CRM_Standards.md §10.2` | 50 | India Tech Lead | 🟡 Medium |
| Zoho Analytics 5 sub-query hard limit | `08_Zoho_Analytics_Standards.md` | Max 5 sub-queries (silent failure if exceeded) | India Lead / Analytics owner | 🔴 High |
| Creator cascade lookup max 3 levels | `02_Zoho_Creator_Standards.md` | 3 levels recommended | India Lead / Creator owner | 🟡 Medium |
| Blueprint max 15 states | `04_Zoho_CRM_Standards.md §4` | 15 states max | India Tech Lead | 🟡 Medium |
| Catalyst max function execution time | `01_Zoho_Catalyst_Standards.md` | Varies by plan | India Tech Lead | 🔴 High |

### How to Verify

1. Log into the relevant Zoho module as an admin
2. Check the official documentation page (listed in §2 above)
3. For execution limits: write a test function that intentionally runs long and observe actual timeout
4. For sub-query limits: test in a non-production Analytics workspace
5. Record the verified value in the **Validation Log** (§9 below)
6. Update the document: change 🔴 to 🔵 and add the verified value

---

## 5. FCI Internal Standards Registry

These are **FCI's own design choices** — deliberately chosen conventions that go beyond or differ from what Zoho mandates. They are the backbone of FCI's standards framework and should only be changed through the mini-CAB process (see `00_Cross_Module_Standards.md §6`).

### 5.1 Naming Conventions (All FCI Internal 🟢)

| Convention | Rationale | Applies To |
|---|---|---|
| Module prefix system (CRT_, CRM_, CAT_, SGM_, PEO_, RCT_, FRM_, ANL_) | Makes artifact origin identifiable in logs, Deluge, and audit trails without opening each item | All modules |
| Suffix system (_fn, _wf, _bp, _rpt, _dsh, _tpl, _standalone) | Self-documenting function inventory; new developer understands type from name alone | All modules |
| Verb-Noun pattern for functions | Makes function lists self-documenting | All Deluge functions |
| Pipeline naming: [Market]_[ProductLine]_Pipeline | Supports multi-market, multi-product org structure (India + Japan) | CRM |
| Blueprint naming: [Module]_[Process]_BP | Namespaces blueprints to prevent collision in large orgs | CRM |
| Cadence naming: [Audience]_[Goal]_[Channel]_Cadence | Prevents open-ended cadence proliferation | CRM |
| WorkDrive folder structure (01_Requirements/, 02_Estimation/, etc.) | Standardises project document storage | All projects |

### 5.2 Security Policies (FCI Internal 🟢, inspired by OWASP + Zoho security guidelines)

| Policy | Source Inspiration | Document |
|---|---|---|
| No PII in info() logs | GDPR Article 5 (data minimisation) | `00_Cross_Module_Standards.md §4` |
| VAPT before customer-facing production | OWASP Testing Guide | `00_Cross_Module_Standards.md §4` |
| Salary data restricted to HR + Director roles | FCI data classification policy | `05_Zoho_People_Standards.md` |
| Dedicated API user (not a real user's credentials) | OWASP API Security Top 10 | `04_Zoho_CRM_Standards.md §11` |
| APPI/GDPR compliance for Japan candidate data | Japanese APPI (Act on Protection of Personal Information) | `06_Zoho_Recruit_Standards.md` |
| No auto-send of offer letters without human review | FCI HR policy | `06_Zoho_Recruit_Standards.md` |

### 5.3 Quality and Process Policies (FCI Internal 🟢)

| Policy | Rationale | Document |
|---|---|---|
| Function header comment template | Enables code review without running the code | `00_Cross_Module_Standards.md §2` |
| mini-CAB change management | ITIL v4-inspired; prevents uncoordinated production changes | `00_Cross_Module_Standards.md §6` |
| Sub-query budget comment in Analytics SQL | Prevents accidental breach of the 5-sub-query limit | `08_Zoho_Analytics_Standards.md` |
| HR audit log (employee ID, field, old/new, timestamp, triggered-by) | Goes beyond Zoho's built-in audit for GDPR/APPI compliance | `05_Zoho_People_Standards.md` |
| Git branching model for Zoho code | Gitflow adaptation; prevents direct production commits | `00_Cross_Module_Standards.md §5` |
| Blueprint test with test record before production activation | Prevents untested automations from affecting live data | `04_Zoho_CRM_Standards.md §4` |

---

## 6. The 3-Layer Validation Framework

Use this framework when deciding whether a standard should be added, changed, or removed.

```
┌─────────────────────────────────────────────────────────────────────┐
│  LAYER 1 — Zoho Official  (Non-Negotiable Platform Constraints)     │
│                                                                     │
│  Source: developer.zoho.com · module help pages · API limit pages   │
│                                                                     │
│  Examples: API rate limits · SDK method names · hard timeouts ·     │
│  field name immutability · authentication mechanisms                │
│                                                                     │
│  Action: Verify at source URL. If Zoho changes it, update docs.     │
│  Label: 🔵 Zoho Official                                             │
└─────────────────────────────────────────────────────────────────────┘
         ↓  Zoho allows it but doesn't prescribe HOW
┌─────────────────────────────────────────────────────────────────────┐
│  LAYER 2 — Community Patterns  (Observed Best Practices)            │
│                                                                     │
│  Source: community.zoho.com · Zoho partner blogs · Marketplace apps │
│                                                                     │
│  Examples: max lookup cascade depth · blueprint state count ·       │
│  workflow condition limits · SQL sub-query patterns                 │
│                                                                     │
│  Action: Test in your actual Zoho org. If it holds, promote to     │
│  FCI Internal or Zoho Official. If not, flag as Unverified.        │
│  Label: 🟡 Community → test → 🔵 or 🟢                              │
└─────────────────────────────────────────────────────────────────────┘
         ↓  We choose to go further than Zoho requires
┌─────────────────────────────────────────────────────────────────────┐
│  LAYER 3 — FCI Internal  (Our Deliberate Design Choices)            │
│                                                                     │
│  Source: FCI governance decisions, OWASP, ITIL, GDPR/APPI          │
│                                                                     │
│  Examples: naming prefixes · security policies · audit logging ·    │
│  change management process · HR data classification                 │
│                                                                     │
│  Action: Change only through mini-CAB. Document the WHY.           │
│  Label: 🟢 FCI Internal                                              │
└─────────────────────────────────────────────────────────────────────┘
```

### Promotion Path for Unverified Standards

```
🔴 Unverified
    │
    ├─ Checked against official Zoho docs?
    │       YES → 🔵 Zoho Official (update doc + log in §9)
    │       NO  ↓
    │
    ├─ Tested in Zoho org + consistent with community reports?
    │       YES → 🟡 Community (update doc + log in §9)
    │       NO  ↓
    │
    └─ Is this actually an FCI policy choice (not a platform fact)?
            YES → 🟢 FCI Internal (update doc + log in §9)
            NO  → Remove from standards document entirely
```

---

## 7. Source Classification Master Table

Summary of source distribution across all 9 documents:

| Document | 🔵 Zoho Official | 🟢 FCI Internal | 🟡 Community | 🔴 Unverified |
|---|---|---|---|---|
| 00_Cross_Module_Standards.md | 5 | 9 | 2 | 0 |
| 01_Zoho_Catalyst_Standards.md | 5 | 4 | 1 | 1 |
| 02_Zoho_Creator_Standards.md | 3 | 5 | 1 | 0 |
| 03_Zoho_Sigma_Standards.md | 4 | 4 | 1 | 0 |
| 04_Zoho_CRM_Standards.md | 7 | 6 | 0 | 3 |
| 05_Zoho_People_Standards.md | 3 | 5 | 0 | 0 |
| 06_Zoho_Recruit_Standards.md | 2 | 6 | 0 | 0 |
| 07_Zoho_Forms_Standards.md | 2 | 6 | 0 | 0 |
| 08_Zoho_Analytics_Standards.md | 3 | 3 | 4 | 1 |
| 09_Governance_Scanner_App_Design.md | 2 | 6 | 0 | 0 |
| **Total** | **36** | **54** | **9** | **5** |

> **Observation:** 54% of standards are FCI Internal (our own policy choices). This is expected and healthy — Zoho provides the platform, FCI provides the governance layer on top of it. The 5 Unverified items must be resolved before being cited in director-level or client-facing documents.

---

## 8. Recommended Validation Workflow

Use this process quarterly or after every major Zoho release:

### Step 1 — URL Health Check (30 minutes)
```
For each URL in §2 of this document:
  1. Open in browser
  2. If 404/redirect → find new URL → update §2 + the relevant standards doc
  3. If content changed significantly → re-read and check if limits/syntax changed
```

### Step 2 — Resolve Unverified Items (2–4 hours)
```
For each item in §4:
  1. Assign to the right person (Tech Lead for timeouts, Analytics owner for SQL limits)
  2. Test in a non-production Zoho org
  3. Record result in §9 (Validation Log)
  4. Update the document: change 🔴 to correct label
```

### Step 3 — Check Zoho Release Notes
```
Zoho publishes monthly release notes for each product. After each major release:
  1. CRM: zoho.com/crm/developer/docs/api/v7/whats-new.html
  2. Creator: zoho.com/creator/help/
  3. Catalyst: docs.catalyst.zoho.com/en/ (What's New section)
  4. Analytics: zoho.com/analytics/help/ (What's New)
Check if any API limits, method names, or authentication flows changed.
```

### Step 4 — FCI Internal Standards Review (via mini-CAB)
```
Once per quarter:
  1. India Lead + Tech Lead review all 🟢 FCI Internal standards
  2. Ask: Is this still the right convention for our team size / Japan relationship / platform usage?
  3. Propose changes → mini-CAB approval → update document + version number
```

---

## 9. Validation Log

Record all verifications here. This is the audit trail for standards accuracy.

| Date | Standard | Document | Old Label | New Label | Verified By | Notes |
|---|---|---|---|---|---|---|
| 2026-05-27 | CRM API daily credit limits — Enterprise plan | 04_Zoho_CRM_Standards.md §10.1 | 🔴 Wrong | ⚠️ Corrected → 🔵 | Claude Code (auto-validation) | Old value: "Licenses×500" · Correct: 50k base + 1,000/user, max 5M. Source: zoho.com/crm/developer/docs/api/v7/api-limits.html |
| 2026-05-27 | CRM API daily credit limits — Ultimate plan | 04_Zoho_CRM_Standards.md §10.1 | 🔴 Wrong | ⚠️ Corrected → 🔵 | Claude Code (auto-validation) | Old value: "Licenses×1,000" · Correct: 50k base + 2,000/user, Unlimited. Source: zoho.com/crm/developer/docs/api/v7/api-limits.html |
| 2026-05-27 | CRM per-operation credit costs | 04_Zoho_CRM_Standards.md §10.1a | ❌ Missing | 🔵 Added | Claude Code (auto-validation) | Added full credit cost table. Source: zoho.com/crm/developer/docs/api/v7/api-limits.html |
| 2026-05-27 | Sigma documentation URL | 03_Zoho_Sigma_Standards.md | 🔴 Wrong URL | 🔵 Corrected | Claude Code (auto-validation) | Old: zoho.com/sigma/help/ (404) · Correct: help.zoho.com/portal/en/kb/sigma/ |
| 2026-05-27 | People API URL | 05_Zoho_People_Standards.md | 🔴 Wrong URL | 🔵 Corrected | Claude Code (auto-validation) | Old: zoho.com/people/api/overview/ (404) · Correct: zoho.com/people/api/overview.html |
| 2026-05-27 | Recruit developer guide URL | 06_Zoho_Recruit_Standards.md | 🔴 Wrong URL | 🔵 Corrected | Claude Code (auto-validation) | Old: zoho.com/recruit/developer-guide/ (404) · Correct: help.zoho.com/portal/kb/zoho-recruit/developer-guide |
| _(next)_ | Custom function timeout — 15s | 04_Zoho_CRM_Standards.md §10.2 | 🔴 Unverified | _pending_ | Assign: India Tech Lead | Test: write a Deluge fn that sleeps 16s and observe timeout behaviour |
| _(next)_ | Analytics 5 sub-query limit | 08_Zoho_Analytics_Standards.md | 🔴 Unverified | _pending_ | Assign: Analytics owner | Test: write a query with 6 sub-queries in a test Analytics workspace |

---

## Appendix A — External Standards Referenced

FCI's Internal standards (🟢) draw inspiration from these external frameworks:

| Framework | What FCI Borrowed | Applied In |
|---|---|---|
| **ITIL v4 — Change Enablement** | mini-CAB process structure | `00_Cross_Module_Standards.md §6` |
| **OWASP API Security Top 10** | No hardcoded credentials, dedicated API user, rate limit awareness | `00_Cross_Module_Standards.md §4`, `04_Zoho_CRM_Standards.md §11` |
| **OWASP Web Security Testing Guide** | VAPT requirement, CAPTCHA on public forms | `00_Cross_Module_Standards.md §4`, `07_Zoho_Forms_Standards.md` |
| **GDPR (EU) Article 5** | No PII in logs, data minimisation, retention policy | Multiple documents |
| **APPI (Japan)** | Candidate data handling, consent for Japan-side users | `06_Zoho_Recruit_Standards.md` |
| **Gitflow Workflow** | Branch naming (main/develop/feature), PR process | `00_Cross_Module_Standards.md §5` |
| **Semantic Versioning (semver.org)** | Version numbers for Sigma extensions | `03_Zoho_Sigma_Standards.md` |
| **BEM (Block Element Modifier)** | CSS class naming convention for widgets | `00_Cross_Module_Standards.md §3` |
| **CMMI Level 3** | Coding standards depth (referenced in governance proposal) | Context: gap analysis |
| **Six Sigma DMAIC** | KPI measurement framework | Context: gap analysis |

---

*Document maintained by: India Lead*  
*Next scheduled review: 2026-08-27 (quarterly)*  
*Validation log entries require: Date · Standard · Old label · New label · Who verified · Source URL*
