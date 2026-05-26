# 08 — Zoho Analytics Standards & Best Practices

> **Scope:** This document covers standards for Zoho Analytics — the BI and reporting platform used for dashboards, SQL-based reports, and data visualization across all business domains. It applies to all report builders, dashboard designers, and anyone writing custom SQL queries in Analytics.
>
> **Cross-reference:** Read [00_Cross_Module_Standards.md] first — this document extends those rules with Analytics-specific additions.
>
> **Critical system constraint:** Zoho Analytics enforces a hard limit of **5 sub-queries per SQL query**. This affects all custom query design. See [Section 5](#5-sql-query-standards) for full details.

---

## Table of Contents

1. [Workspace Naming](#1-workspace-naming)
2. [Table / Data Source Naming](#2-table--data-source-naming)
3. [Report Naming](#3-report-naming)
4. [Dashboard Naming](#4-dashboard-naming)
5. [SQL Query Standards](#5-sql-query-standards)
6. [Formula Column Standards](#6-formula-column-standards)
7. [Data Sync Standards](#7-data-sync-standards)
8. [Access & Sharing Standards](#8-access--sharing-standards)
9. [Analytics Security](#9-analytics-security)

---

## 1. Workspace Naming

### 1.1 Naming Format

Format: `[Domain]_[Team]_Workspace`

| Workspace Name | Purpose |
|---|---|
| `Sales_FCI_Workspace` | CRM leads, pipeline, conversion metrics |
| `HR_Analytics_Workspace` | Headcount, attendance, appraisal trends |
| `Projects_Revenue_Workspace` | Project delivery, billing, revenue tracking |
| `Recruit_Pipeline_Workspace` | Hiring pipeline and candidate metrics |
| `Finance_Overview_Workspace` | Financial summaries (restricted access) |

### 1.2 One Domain Per Workspace Rule

- Each workspace must cover **one business domain only**
- Do not mix HR data and Sales data in one workspace — cross-domain analysis is done via shared tables, not merged workspaces
- If a report genuinely needs data from two domains: document the business justification and get India Manager approval before creating a cross-domain workspace

### 1.3 Workspace Description — Mandatory

Every workspace must have a description configured in its settings:

```
Purpose       : [What business questions this workspace answers]
Data Sources  : [List of Zoho modules/apps that feed this workspace]
Owner         : [Name, role]
Refresh Freq  : [Hourly / Every 3 hours / Daily / Manual]
Created       : [YYYY-MM-DD]
Last reviewed : [YYYY-MM-DD] by [Name]
```

---

## 2. Table / Data Source Naming

### 2.1 Naming Format

Format: **PascalCase** with a source prefix

| Table Name | Source | Description |
|---|---|---|
| `CRM_Leads` | Zoho CRM | CRM Leads module sync |
| `CRM_Deals` | Zoho CRM | CRM Deals/Opportunities sync |
| `CREATOR_Projects` | Zoho Creator | Projects app data |
| `CREATOR_Invoices` | Zoho Creator | Invoice records |
| `CREATOR_Tasks` | Zoho Creator | Task records |
| `PEOPLE_Attendance` | Zoho People | Attendance module sync |
| `PEOPLE_Employees` | Zoho People | Employee records |
| `RECRUIT_Candidates` | Zoho Recruit | Candidate pipeline |
| `CATALYST_Events` | Zoho Catalyst | Event log data |

### 2.2 Source Prefix Reference

| Prefix | Origin System |
|---|---|
| `CRM_` | Zoho CRM |
| `CREATOR_` | Zoho Creator |
| `PEOPLE_` | Zoho People |
| `RECRUIT_` | Zoho Recruit |
| `CATALYST_` | Zoho Catalyst |
| `FORMS_` | Zoho Forms (imported submissions) |
| `MANUAL_` | Manually uploaded CSV/Excel data |
| `EXT_` | External third-party data source |

### 2.3 Table Description — Mandatory

Every table must have a description in Analytics:

```
Source        : [Zoho module and app name]
Sync Type     : [Auto-sync / Manual import / API push]
Sync Frequency: [e.g., Every 3 hours]
Last synced   : [Shown in Analytics UI — verify after setup]
Row count est.: [Approximate — to flag if table grows unexpectedly]
Notes         : [Any known data quality issues or exclusions]
```

### 2.4 Table Rename Prohibition

> **Never rename a table that already has reports or formula columns built on it.**

Renaming a table after reports are built on it creates **silent broken dependencies** — reports appear to load but show no data or errors. If a rename is unavoidable:

1. Create the new table with the correct name
2. Rebuild all dependent reports on the new table
3. Validate all reports produce correct output
4. Delete the old table (after validating nothing references it)
5. Document the rename in WorkDrive: reason, date, affected reports

---

## 3. Report Naming

### 3.1 Naming Format

Format: `[Module]_[Metric]_[TimeRange]`

| Report Name | Description |
|---|---|
| `CRM_LeadConversion_Monthly` | Monthly lead-to-deal conversion rate |
| `Projects_Revenue_Quarterly` | Quarterly revenue per project |
| `HR_Headcount_YTD` | Year-to-date headcount trend |
| `Recruit_HireRate_Monthly` | Monthly hiring rate by department |
| `Projects_Delivery_Weekly` | Weekly project delivery status |

### 3.2 Report Type Suffixes

Append a suffix to indicate the visualization type when it aids clarity:

| Suffix | Use Case |
|---|---|
| `_BarChart` | Bar or column chart |
| `_LineChart` | Trend line chart |
| `_PieChart` | Pie or donut chart |
| `_Pivot` | Pivot table |
| `_Summary` | Summary/aggregate table |
| `_Detail` | Row-level detail table |
| `_Funnel` | Funnel chart (e.g., sales pipeline) |

**Examples with suffixes:**

| Report Name | Type |
|---|---|
| `CRM_LeadSource_BarChart` | Bar chart of lead sources |
| `Revenue_Trend_LineChart` | Revenue over time |
| `Projects_Status_Pivot` | Project status by team pivot table |
| `HR_Department_PieChart` | Headcount by department |

### 3.3 Prohibited Report Names

| Prohibited | Use Instead |
|---|---|
| `Chart 1` | `CRM_LeadSource_BarChart` |
| `New Report` | Name it at creation time |
| `Table 1` | `Projects_Revenue_Summary` |
| `Copy of Report` | Rename immediately after duplication |
| `Test` | Use `_TEST` suffix and delete before production |

---

## 4. Dashboard Naming

### 4.1 Naming Format

Format: `[Audience]_[Domain]_Dashboard`

| Dashboard Name | Audience | Domain |
|---|---|---|
| `Director_Revenue_Dashboard` | India Director | Financial overview |
| `Manager_Projects_Dashboard` | Project Managers | Delivery and tasks |
| `Japan_Delivery_Dashboard` | Japan stakeholders | Project delivery status |
| `HR_Headcount_Dashboard` | HR Team | Employee metrics |
| `Sales_Pipeline_Dashboard` | Sales Team | CRM leads and deals |

### 4.2 Mandatory Dashboard Elements

Every dashboard must include before going live:

| Element | Requirement |
|---|---|
| Title widget | At the top of the dashboard — matches the dashboard name in human-readable form |
| Last-updated timestamp | Shows data freshness — either via a formula widget or a note widget |
| Owner field | Set in the dashboard description (not visible to viewers, but present for maintenance) |
| Purpose note | Dashboard description explains what decisions this dashboard supports |

### 4.3 Widget Count Limit

- Maximum **12 widgets per dashboard**
- Beyond 12: split into sub-dashboards by topic
  - Example: `Director_Revenue_Dashboard` splits into `Director_Revenue_Billings_Dashboard` and `Director_Revenue_Pipeline_Dashboard`
- Rationale: dashboards with too many widgets load slowly and are cognitively overwhelming

### 4.4 Japan-Facing Dashboard Requirements

- All labels, axis titles, and widget titles: in **English** (or bilingual English/Japanese)
- Do not use abbreviations that Japan stakeholders may not recognize (e.g., `YTD`, `MoM` — spell them out or add a legend)
- Date format: use `YYYY-MM-DD` or `DD MMM YYYY` — avoid `MM/DD/YYYY` (US format causes confusion)
- Currency: label all amounts with currency code (`JPY`, `INR`) — never assume context

---

## 5. SQL Query Standards

### 5.1 Sub-Query Limit — CRITICAL SYSTEM CONSTRAINT

> **Zoho Analytics enforces a hard limit of 5 sub-queries per SQL query.**
> A query that exceeds this limit will **fail at runtime** with no partial result.
> Plan every query's architecture with this budget in mind before writing a single line.

This is not a best practice — it is a **system-enforced hard limit** that cannot be bypassed.

### 5.2 Standard SQL Formatting

```sql
-- Report   : Projects_Revenue_TaskCount_Summary
-- Purpose  : Active project revenue and task count for Q1 2026
-- Author   : [Name] | Created: 2026-05-25
-- Sub-query budget: 0/5 (no sub-queries — direct join)

SELECT
    t1.Project_Code,
    t1.Project_Name,
    SUM(t2.Billed_Amount) AS Total_Billed,
    COUNT(t3.Task_ID)     AS Task_Count
FROM
    CREATOR_Projects AS t1
    LEFT JOIN CREATOR_Invoices AS t2 ON t1.Project_ID = t2.Project_ID
    LEFT JOIN CREATOR_Tasks    AS t3 ON t1.Project_ID = t3.Project_ID
WHERE
    t1.Status       = 'Active'
    AND t1.Created_Date >= '2026-01-01'
GROUP BY
    t1.Project_Code,
    t1.Project_Name
ORDER BY
    Total_Billed DESC
```

**Formatting rules:**

| Rule | Requirement |
|---|---|
| Keywords | UPPERCASE: `SELECT`, `FROM`, `WHERE`, `GROUP BY`, `ORDER BY`, `JOIN`, `LEFT JOIN`, `WITH`, `AS` |
| Table aliases | Simple queries: `t1`, `t2`, `t3` (sequential); Complex queries: descriptive — `proj`, `inv`, `emp`, `task` |
| Aggregated column aliases | Always alias: `SUM(Billed_Amount) AS Total_Billed`, `COUNT(Task_ID) AS Task_Count` |
| Indentation | 4 spaces for each clause continuation |
| Column list | One column per line in `SELECT` for readability |
| Header comment | Every custom SQL query must start with a comment block (see example above) |

### 5.3 Sub-Query Budget Management

**Before writing a query, count your sub-queries. Add the count to the header comment.**

#### What counts as one sub-query:

| SQL Construct | Sub-query count |
|---|---|
| `WITH cte_name AS (SELECT ...)` | 1 per CTE clause |
| `FROM (SELECT ...)` — inline sub-query | 1 |
| `WHERE col IN (SELECT ...)` — correlated sub-query | 1 |
| Direct `JOIN tablename` | 0 (not a sub-query) |
| Aggregate function: `SUM(...)` | 0 (not a sub-query) |

#### CTE Pattern — Preferred Approach

CTEs (`WITH` clause) are preferred over nested inline sub-queries because:
- Each CTE is clearly countable (one CTE = one sub-query)
- CTEs are readable and maintainable
- They avoid the ambiguity of nested parentheses

```sql
-- Report   : Projects_Revenue_TeamSize_Summary
-- Purpose  : Project revenue and team size for active projects
-- Author   : [Name] | Created: 2026-05-25
-- Sub-query budget: 2/5 used — 3 remaining

WITH revenue_summary AS (                       -- Sub-query 1
    SELECT
        Project_ID,
        SUM(Amount) AS Revenue
    FROM CREATOR_Invoices
    GROUP BY Project_ID
),
team_size AS (                                  -- Sub-query 2
    SELECT
        Project_ID,
        COUNT(DISTINCT Employee_ID) AS Team_Members
    FROM CREATOR_ProjectAssignments
    GROUP BY Project_ID
)
SELECT
    p.Project_Name,
    p.Project_Code,
    COALESCE(r.Revenue, 0)      AS Total_Revenue,
    COALESCE(t.Team_Members, 0) AS Team_Size
FROM CREATOR_Projects AS p
LEFT JOIN revenue_summary AS r ON p.Project_ID = r.Project_ID
LEFT JOIN team_size       AS t ON p.Project_ID = t.Project_ID
WHERE
    p.Status = 'Active'
ORDER BY
    Total_Revenue DESC
```

#### What To Do When You Hit the 5-Query Limit

If your query design requires more than 5 sub-queries:

**Option A — Split the query into two:**
1. Write Query A covering the first logical group of aggregations → save as an intermediate **view** or **query table** in Analytics
2. Write Query B that JOINs the view from Query A with remaining data
3. Each query stays within the 5-sub-query budget

**Option B — Pre-aggregate in the source:**
1. Create a summary formula column or aggregate table in Creator/CRM
2. Sync that pre-aggregated data to Analytics
3. Query the pre-aggregated table (no sub-queries needed)

**Option C — Redesign the report:**
1. Ask: does this report actually need all this data in one view?
2. Split into multiple focused reports on the same dashboard

> **Never exceed 5 sub-queries in a single query.** If a query was written by someone else and exceeds this limit, it will fail when Analytics enforces the limit. Refactor immediately.

### 5.4 Query Optimization Rules

| Rule | Rationale |
|---|---|
| Always apply `WHERE` filters before aggregating | Reduces rows processed in aggregation |
| Use `LIMIT` during development and testing | Prevents accidental full-table scans during development |
| Remove `LIMIT` in production reports when full data is needed | Truncated results mislead stakeholders |
| Never use `SELECT *` | Wastes memory, breaks when source columns change |
| Use indexed date columns for date filters | `Created_Date`, `Modified_Date` — not computed date expressions |
| For tables >100K rows | Consult India Manager before building complex multi-join aggregations |

### 5.5 Anti-Patterns — What NOT to Do

The following patterns are **prohibited** in Analytics SQL queries:

```sql
-- BAD: SELECT * wastes memory and breaks silently when source columns change
SELECT * FROM CRM_Leads;

-- GOOD: List only what is needed
SELECT Lead_ID, Lead_Name, Status, Created_Date FROM CRM_Leads;


-- BAD: Implicit (comma) join — ambiguous, outdated, easy to make Cartesian products
SELECT a.Project_Name, b.Amount
FROM CREATOR_Projects a, CREATOR_Invoices b
WHERE a.Project_ID = b.Project_ID;

-- GOOD: Explicit JOIN
SELECT a.Project_Name, b.Amount
FROM CREATOR_Projects AS a
LEFT JOIN CREATOR_Invoices AS b ON a.Project_ID = b.Project_ID;


-- BAD: Using HAVING to filter what WHERE could handle — processes more rows
SELECT Project_ID, SUM(Amount) FROM CREATOR_Invoices
HAVING SUM(Amount) > 0;

-- GOOD: Filter rows first with WHERE, then aggregate
SELECT Project_ID, SUM(Amount) AS Total
FROM CREATOR_Invoices
WHERE Amount > 0
GROUP BY Project_ID;


-- BAD: 6 sub-queries — will fail at runtime in Zoho Analytics
SELECT *
FROM (SELECT * FROM
    (SELECT * FROM
        (SELECT * FROM
            (SELECT * FROM
                (SELECT * FROM CREATOR_Projects)  -- 5
            )                                      -- 4
        )                                          -- 3
    )                                              -- 2
)                                                  -- 1
-- This fails. Zoho Analytics rejects it.


-- BAD: Nested sub-queries instead of CTEs — hard to count, hard to read
SELECT *
FROM (
    SELECT Project_ID, SUM(Amount) AS Revenue
    FROM (
        SELECT * FROM CREATOR_Invoices WHERE Status = 'Paid'  -- 2 sub-queries used
    ) AS paid_invoices
    GROUP BY Project_ID
) AS revenue;

-- GOOD: CTE equivalent — same 2 sub-queries but clearly counted and readable
WITH paid_invoices AS (                    -- Sub-query 1
    SELECT * FROM CREATOR_Invoices WHERE Status = 'Paid'
),
revenue AS (                               -- Sub-query 2
    SELECT Project_ID, SUM(Amount) AS Revenue
    FROM paid_invoices
    GROUP BY Project_ID
)
SELECT * FROM revenue;
```

---

## 6. Formula Column Standards

### 6.1 Naming Format

Format: **PascalCase**, descriptive of the business concept

| Formula Column Name | Purpose |
|---|---|
| `RevenueVariancePct` | Percentage variance from target revenue |
| `DaysSinceLastUpdate` | Days elapsed since record was last modified |
| `IsOverdue` | Boolean — is the project past its due date |
| `NetMarginPct` | Net margin as a percentage |
| `DaysToDeadline` | Days remaining until project deadline |
| `IsJapanProject` | Boolean — project assigned to Japan client |
| `MonthlyRunRate` | Annualized monthly revenue estimate |

### 6.2 Mandatory Formula Description

Every formula column must have a description configured in Analytics that includes:

```
Business meaning : [What this formula represents in business terms]
Formula logic    : [Plain English explanation of how it's calculated]
Input columns    : [Which columns feed into this formula]
Output           : [Data type and expected value range or set]
Edge cases       : [What happens with nulls, zeros, or negative values]
Created          : [YYYY-MM-DD] by [Name]
```

**Example:**

```
Business meaning : Percentage variance between actual and target revenue for the period
Formula logic    : ((Actual_Revenue - Target_Revenue) / Target_Revenue) * 100
Input columns    : Actual_Revenue (number), Target_Revenue (number)
Output           : Decimal percentage; positive = above target, negative = below
Edge cases       : Returns NULL when Target_Revenue is 0 (division guard applied)
Created          : 2026-05-25 by [Name]
```

### 6.3 Boolean Formula Convention

Boolean formula columns must return consistent values — choose one convention per workspace and document it:

| Convention | When to Use |
|---|---|
| `"Yes"` / `"No"` | User-facing columns shown in reports or dashboards |
| `1` / `0` | Columns used in further numeric calculations |

Document the convention in the formula column description: `Returns: "Yes"/"No" string — use for display only, not numeric aggregation.`

### 6.4 Date Formula Standards

- Use `DATEDIFF` for day/month/year differences — always specify the unit in the description
- Use `DATEADD` for adding/subtracting periods
- Document timezone assumption: are dates stored as IST? UTC? Clarify in the formula description
- Avoid computing dates inside `WHERE` clauses of SQL queries (use the indexed raw column instead)

**Example formula documentation:**

```
Formula     : DATEDIFF('day', Modified_Date, NOW())
Business    : Number of calendar days since the record was last updated
Unit        : Days (integer)
Timezone    : Dates in source are IST (UTC+5:30) — no conversion applied
Edge cases  : Returns 0 on the day of last update
```

---

## 7. Data Sync Standards

### 7.1 Sync Frequency Guidelines

Set sync frequency based on how fresh the data needs to be for the reports it feeds:

| Use Case | Recommended Frequency |
|---|---|
| Live operational dashboards (sales, delivery) | Hourly |
| Management dashboards (projects, headcount) | Every 3 hours |
| Strategic/historical reports | Daily (overnight) |
| Manually imported data (CSV, Excel) | Manual — document when updates are expected |

Document the sync frequency in both the table description and the workspace description.

### 7.2 Manual Sync Requirement

A **manual sync** is required after any of the following events in the source system:

- Bulk import or bulk update of records
- Major configuration change (new fields, module restructure)
- Data migration or cleanup operation
- End-of-period data finalization (month-end, quarter-end)

After triggering a manual sync: verify row counts in Analytics against the source system before sharing any report that uses the affected table.

### 7.3 Sync Failure Handling

- Zoho Analytics sends an email notification when auto-sync fails
- Route sync failure notifications to the **India Manager** email (configure in workspace settings)
- On sync failure: investigate within 4 business hours during project-active periods
- If a failure causes a dashboard to show stale data: add a note to the dashboard title widget — `⚠ Data as of [last successful sync date] — sync issue under investigation`

### 7.4 Table Deletion Protocol

> **Never delete a synced table without following this protocol.**

Deleting a synced table while reports are built on it silently breaks those reports.

1. **Disable auto-sync** on the table first
2. Audit all reports and dashboards that reference this table (Analytics shows dependencies)
3. Get **India Manager approval** to proceed
4. Rebuild or redirect dependent reports to replacement tables (if applicable)
5. Delete the table only after all dependencies are resolved
6. Document the deletion: table name, date, reason, dependent reports affected, in WorkDrive

---

## 8. Access & Sharing Standards

### 8.1 Workspace Access Levels

Apply the **minimum necessary access** principle:

| Role | Access Level |
|---|---|
| General viewer (employee) | Read-only, specific shared views only — not full workspace |
| Report builder (developer) | Edit access to their assigned workspace |
| Dashboard builder | Edit access to dashboards, read-only on tables |
| India Manager | Full access to relevant workspaces |
| India Director | Full access to all workspaces |
| HR roles | HR workspace only — no access to Sales/Finance workspaces |

### 8.2 External Sharing — Shared Views

When sharing a dashboard or report link with external parties (clients, Japan stakeholders):

- Enable **password protection** on the shared link — always
- Set link **expiry** if the share is time-limited (e.g., a quarterly review)
- Include only the specific dashboard/report in the share — do not share the full workspace
- Document the share: who has the link, purpose, expiry date, in WorkDrive under `ProjectCode/Analytics/SharedLinks/`

### 8.3 Japan-Facing Report Sharing

- Share via password-protected link only
- **Never attach raw data files** (CSV exports) in email to Japan stakeholders
- Report should show aggregated data only — no row-level employee or financial detail in shared views
- Coordinate with India Manager before sharing any Japan-facing Analytics report for the first time

### 8.4 Public Embed Policy

Embedding an Analytics report or dashboard on a public website is permitted **only** for:

- Non-sensitive aggregated data (e.g., total project count, headcount by department)
- Data that does not identify individuals
- Data approved by India Director for public disclosure

**Never publicly embed:**
- Financial data (revenue, billing, costs)
- Employee data (names, salaries, performance)
- Client-specific project data
- Any data with personally identifiable information

### 8.5 Export Restriction

- Raw data export (CSV/Excel download) from Analytics: disable for non-manager roles in workspace sharing settings
- Permitted exporters: India Manager, India Director, designated report owners
- Every export: the exporter must log it in WorkDrive — `ProjectCode/Analytics/ExportLog/`

---

## 9. Analytics Security

### 9.1 PII in Reports

| Rule | Detail |
|---|---|
| No PII in externally shared reports | Aggregate only — no names, emails, ID numbers |
| Employee name in reports | Internal access only — manager/HR role required |
| Client contact data in reports | Internal only — never in shared views or embeds |

### 9.2 Financial Report Access

| Data Type | Authorized Roles |
|---|---|
| Project revenue and billing | India Manager, India Director |
| Invoices and payment status | India Manager, India Director, Finance |
| Cost and expense data | India Director, Finance |
| Client budget data | India Manager, India Director |

### 9.3 Compensation Data in Analytics

- Salary or compensation data must only exist in the `HR_Analytics_Workspace`
- Access: **HR Director only** — no other role has access to this workspace
- This data must never appear in a cross-domain workspace or a shared view

### 9.4 New SQL Query Validation Protocol

Before running a new custom SQL query on a **production workspace**:

1. Write and test the query on a **sample/test table** first (a small subset of rows)
2. Verify the query does not perform a full-table scan unnecessarily
3. Verify sub-query count is within the 5-query budget
4. Check that the query does not expose PII columns outside their authorized workspace
5. Have the query reviewed by India Manager if it touches financial or compensation data
6. Only after validation: save the query as a report in the production workspace

### 9.5 Cross-Reference

For the organization-wide security checklist applicable to all Zoho tools (field access, audit logging, export controls), see [00_Cross_Module_Standards.md#security-checklist].

---

## Appendix A — Sub-Query Quick Reference Card

> Keep this reference visible when designing any SQL query in Zoho Analytics.

| Scenario | Sub-query count | Notes |
|---|---|---|
| Direct `JOIN` on a table | 0 | Not a sub-query |
| `WITH cte AS (SELECT ...)` | 1 per CTE | Use CTEs — they are easy to count |
| `FROM (SELECT ...)` inline | 1 | Prefer CTE form instead |
| `WHERE x IN (SELECT ...)` | 1 | Correlated sub-query |
| Two CTEs + one inline sub-query | 3 | 2 remaining in budget |
| Five CTEs | 5 | Budget exhausted — cannot add more |
| Six CTEs or more | **FAILS** | Split query or pre-aggregate |

**Decision flow for complex queries:**

```
Count sub-queries needed
         │
    5 or fewer?
    ┌──────┴──────┐
   YES            NO
    │              │
Proceed     ┌─────┴──────────────┐
            │                    │
      Can pre-aggregate?    Split into 2 queries?
          │                        │
         YES                      YES
          │                        │
  Aggregate in Creator     Query A → view/table
  Sync to Analytics        Query B → JOINs Query A's result
  Query flat table          Each stays within 5-query budget
```

---

## Appendix B — Standard Query Header Template

Copy this header and fill it in at the top of every custom SQL query in Zoho Analytics:

```sql
-- Report    : [Module]_[Metric]_[TimeRange]
-- Purpose   : [One sentence — what business question this answers]
-- Author    : [Name] | Created: [YYYY-MM-DD]
-- Modified  : [YYYY-MM-DD] by [Name] — [what changed]
-- Sub-query budget: [X]/5
-- Tables    : [List source tables used]
-- Notes     : [Any known limitations, edge cases, or data quality considerations]
```

---

*Document owner: India Manager — Analytics & Reporting*
*Last reviewed: 2026-05-25*
*Next review due: 2027-01-01*
