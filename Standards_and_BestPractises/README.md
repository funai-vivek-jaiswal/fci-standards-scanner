# FCI India — Zoho Platform Coding Standards & Best Practices
**Version:** 1.0 | **Owner:** India Tech Lead | **Created:** 2026-05-25  
**Status:** Active | **Review Cadence:** Annually (or when a new Zoho module is adopted)

---

## Purpose

This documentation set defines the **coding standards, naming conventions, security rules, and best practices** for all Zoho platform modules used by FCI India. It directly addresses Gap G5 from the FCI Governance Framework:

> *"No Coding & Security Standards — No coding standards, naming conventions, or development guidelines are documented. Each developer works from individual habits, making code review, onboarding, and maintenance inconsistent."*

These standards apply to **every developer on every project**. Code review must verify compliance before any merge to production.

> **📚 Source Transparency Notice**  
> Each standards document now includes a **Source Classification** section at the end.  
> Standards are labelled: 🔵 Zoho Official · 🟢 FCI Internal · 🟡 Community · 🔴 Unverified  
> For complete source citations, corrections, and the 3-layer validation framework, see [10_Sources_and_Validation.md](./10_Sources_and_Validation.md).

---

## Document Index

| File | Module | Key Topics | Lines |
|---|---|---|---|
| [00_Cross_Module_Standards.md](00_Cross_Module_Standards.md) | **All Modules** | Naming conventions, Deluge standards, Widget (JS/HTML/CSS), Security checklist, Git | ~1,460 |
| [01_Zoho_Catalyst_Standards.md](01_Zoho_Catalyst_Standards.md) | **Catalyst** | Node.js functions, DataStore, Cron, Connectors, Deployment | ~1,125 |
| [02_Zoho_Creator_Standards.md](02_Zoho_Creator_Standards.md) | **Creator** | Forms, Lookups, Deluge workflows, Widgets, Reports | ~716 |
| [03_Zoho_Sigma_Standards.md](03_Zoho_Sigma_Standards.md) | **Sigma** | Extensions, Manifest, Widgets, Connections, Versioning | ~707 |
| [04_Zoho_CRM_Standards.md](04_Zoho_CRM_Standards.md) | **CRM** | Blueprints, Pipelines, Cadences, Custom Functions, API Limits | ~212 |
| [05_Zoho_People_Standards.md](05_Zoho_People_Standards.md) | **People** | Custom Functions, Alerts, Notifications, Widgets, Privacy | ~513 |
| [06_Zoho_Recruit_Standards.md](06_Zoho_Recruit_Standards.md) | **Recruit** | Hiring Pipeline, Stages, Custom Functions, Data Privacy | ~98 |
| [07_Zoho_Forms_Standards.md](07_Zoho_Forms_Standards.md) | **Forms** | Naming, Conditional Logic, Integrations, Security | ~453 |
| [08_Zoho_Analytics_Standards.md](08_Zoho_Analytics_Standards.md) | **Analytics** | SQL Standards, 5 Sub-query Limit, Dashboards, Access | ~681 |
| [10_Sources_and_Validation.md](./10_Sources_and_Validation.md) | Sources & Validation Appendix | All | Source labels, verified URLs, corrections, 3-layer validation framework |

---

## Quick Reference — Where to Look for What

### Naming Conventions
| What | Where |
|---|---|
| Master naming table (all modules) | [00 — Section 1](00_Cross_Module_Standards.md#1-naming-convention-master-table) |
| CRM field API names | [04 — Section 2](04_Zoho_CRM_Standards.md#2-field-naming-conventions-api-names-matter) |
| Creator form & field names | [02 — Section 2–3](02_Zoho_Creator_Standards.md#2-form-naming-conventions) |
| Analytics report/dashboard names | [08 — Section 3–4](08_Zoho_Analytics_Standards.md#3-report-naming) |

### Deluge Scripting (Shared Across Creator, CRM, Sigma, People, Recruit)
| What | Where |
|---|---|
| Variable naming rules | [00 — Section 2.1](00_Cross_Module_Standards.md#21-variable-naming) |
| Function header comment template | [00 — Section 2.2](00_Cross_Module_Standards.md#22-function-header-comment-template) |
| Error handling / try-catch pattern | [00 — Section 2.3](00_Cross_Module_Standards.md#23-error-handling) |
| API call best practices | [00 — Section 2.4](00_Cross_Module_Standards.md#24-api-call-patterns) |
| Anti-patterns (what NOT to do) | [00 — Section 2.6](00_Cross_Module_Standards.md#26-deluge-anti-patterns-what-not-to-do) |
| Complete Deluge example | [00 — Section 2.7](00_Cross_Module_Standards.md#27-complete-deluge-example) |

### Widget / JS / HTML / CSS (Shared Across Creator, Sigma, People)
| What | Where |
|---|---|
| Widget file structure | [00 — Section 3.1](00_Cross_Module_Standards.md#31-widget-file-structure) |
| HTML standards (BEM, semantic) | [00 — Section 3.2](00_Cross_Module_Standards.md#32-html-standards) |
| CSS standards | [00 — Section 3.3](00_Cross_Module_Standards.md#33-css-standards) |
| JS standards (async/await, SDK init) | [00 — Section 3.4](00_Cross_Module_Standards.md#34-javascript-standards) |
| Widget security rules | [00 — Section 3.5](00_Cross_Module_Standards.md#35-widget-security) |
| Creator widget SDK pattern | [02 — Section 8](02_Zoho_Creator_Standards.md#8-widget-standards-in-creator) |
| Sigma widget SDK pattern | [03 — Section 5](03_Zoho_Sigma_Standards.md#5-widget-standards-in-sigma) |
| People widget SDK pattern | [05 — Section 5](05_Zoho_People_Standards.md#5-widget-standards-in-people) |

### Security (All Modules)
| What | Where |
|---|---|
| **Master security checklist** | [00 — Section 4](00_Cross_Module_Standards.md#4-security-checklist) |
| No hardcoded credentials rule | [00 — Section 4](00_Cross_Module_Standards.md#4-security-checklist) |
| PII logging prohibition | [00 — Section 4](00_Cross_Module_Standards.md#4-security-checklist) |
| VAPT requirement | [00 — Section 4](00_Cross_Module_Standards.md#4-security-checklist) |
| Candidate data privacy (Recruit) | [06 — Section 8](06_Zoho_Recruit_Standards.md#8-candidate-data-privacy-critical) |
| Employee data privacy (People) | [05 — Section 8](05_Zoho_People_Standards.md#8-data-privacy-critical) |
| Analytics data access matrix | [08 — Section 8](08_Zoho_Analytics_Standards.md#8-access--sharing-standards) |

### CRM-Specific
| What | Where |
|---|---|
| API daily limits by plan | [04 — Section 10.1](04_Zoho_CRM_Standards.md#101-daily-api-call-limits-approximate--verify-current-plan) |
| Per-operation limits (batch size, timeout) | [04 — Section 10.2](04_Zoho_CRM_Standards.md#102-per-operation-limits) |
| Blueprint design rules | [04 — Section 4](04_Zoho_CRM_Standards.md#4-blueprint-standards) |
| Cadence structure | [04 — Section 5](04_Zoho_CRM_Standards.md#5-cadence-standards) |
| Workflow automation rules | [04 — Section 6](04_Zoho_CRM_Standards.md#6-workflow-automation-standards) |

### Analytics SQL
| What | Where |
|---|---|
| **5 sub-query limit rule** | [08 — Section 5.1](08_Zoho_Analytics_Standards.md#51-sub-query-limit--critical-rule) |
| Sub-query budget tracking | [08 — Section 5.3](08_Zoho_Analytics_Standards.md#53-sub-query-management-5-query-budget) |
| SQL formatting standards | [08 — Section 5.2](08_Zoho_Analytics_Standards.md#52-sql-formatting) |
| Anti-patterns in SQL | [08 — Section 5.5](08_Zoho_Analytics_Standards.md#55-anti-patterns-what-not-to-do) |

---

## Common Functionality Used Across Multiple Modules

These patterns appear in **more than one** Zoho module — always check the shared standard first:

| Functionality | Shared Standard | Modules Using It |
|---|---|---|
| Deluge scripting | [00 — Section 2](00_Cross_Module_Standards.md#2-deluge-scripting-standards) | Creator, CRM, Sigma, People, Recruit |
| Widget (HTML/CSS/JS) | [00 — Section 3](00_Cross_Module_Standards.md#3-widget-html--css--js-standards) | Creator, Sigma, People |
| Custom Functions | [00 — Section 2](00_Cross_Module_Standards.md#2-deluge-scripting-standards) + module doc | CRM, Creator, People, Recruit |
| Security checklist | [00 — Section 4](00_Cross_Module_Standards.md#4-security-checklist) | All modules |
| Naming conventions | [00 — Section 1](00_Cross_Module_Standards.md#1-naming-convention-master-table) | All modules |
| Git standards | [00 — Section 5](00_Cross_Module_Standards.md#5-git--version-control-standards-for-zoho-code) | All modules |
| Connections (external API) | [03 — Section 6](03_Zoho_Sigma_Standards.md#6-connection-standards) | Sigma, Catalyst, Creator |
| API limits | [04 — Section 10](04_Zoho_CRM_Standards.md#10-crm-api-limits--best-practices) | CRM, Recruit (same limits) |
| Bilingual JA/EN templates | [04 — Section 5](04_Zoho_CRM_Standards.md#5-cadence-standards) | CRM, Recruit, People, Forms |

---

## Code Review Checklist (Use Before Every Production Deployment)

For **Deluge functions** (Creator, CRM, People, Recruit):
- [ ] Function header comment present and complete
- [ ] All variables named in camelCase, constants in UPPER_SNAKE_CASE
- [ ] try-catch wraps all external calls
- [ ] No hardcoded credentials, tokens, or API keys
- [ ] No PII in `info` (log) statements
- [ ] No API calls inside loops — batched
- [ ] No `info` debug statements left in production code
- [ ] Tested in sandbox before production

For **Widgets** (Creator, Sigma, People):
- [ ] `const`/`let` only, no `var`
- [ ] ZOHO SDK used for all API calls (no direct REST with hardcoded token)
- [ ] Error state and empty state handled in UI
- [ ] `textContent` / `innerText` used (not `innerHTML`) for user data
- [ ] No `console.log` in production code

For **Analytics SQL**:
- [ ] Sub-query count noted in comment — must be ≤ 5
- [ ] `SELECT *` not used
- [ ] Keywords in UPPERCASE
- [ ] All aggregated columns aliased
- [ ] Tested on sample data before production dashboard

For **All changes going to production**:
- [ ] Tested in dev/sandbox environment
- [ ] Reviewed by Tech Lead
- [ ] India Manager notified
- [ ] Logged in Git with correct commit message format: `[MODULE] type: description`
- [ ] Mini-CAB approval for production changes

---

## Version History

| Version | Date | Author | Changes |
|---|---|---|---|
| 1.0 | 2026-05-25 | India Tech Lead | Initial version — all 8 modules |

---

*These standards are owned by the India Tech Lead. Any exceptions require written approval from the India Manager and must be documented in the relevant module's standards file.*
