# 05 — Zoho People Standards & Best Practices

> **Scope:** This document covers standards for Zoho People — the HR management system used for employee records, leave, attendance, performance appraisals, and HR workflows. It applies to all developers, HR admins, and system configurators working within the People module.
>
> **Cross-reference:** Read [00_Cross_Module_Standards.md] first — this document extends those rules with People-specific additions.

---

## Table of Contents

1. [Module & Form Naming](#1-module--form-naming)
2. [Field Naming Conventions](#2-field-naming-conventions)
3. [Custom Function Standards](#3-custom-function-standards)
4. [Alert & Notification Standards](#4-alert--notification-standards)
5. [Widget Standards in People](#5-widget-standards-in-people)
6. [Leave & Attendance Workflow Standards](#6-leave--attendance-workflow-standards)
7. [Performance Appraisal Standards](#7-performance-appraisal-standards)
8. [Data Privacy (Critical)](#8-data-privacy-critical)
9. [Integration with Recruit](#9-integration-with-recruit)

---

## 1. Module & Form Naming

### 1.1 Standard Modules

Use Zoho People's default module names wherever they exist — do not rename system modules:

| Default Module | Purpose |
|---|---|
| `Employee` | Core employee records |
| `Leave` | Leave requests and balances |
| `Attendance` | Clock-in/out, regularization |
| `Performance` | Appraisal cycles and ratings |
| `Asset` | Company asset assignments |
| `Training` | Training records and registrations |

### 1.2 Custom Form Naming

- Format: **PascalCase**, noun phrases describing the form's purpose
- Examples: `AssetRequest`, `TrainingRegistration`, `WarningLetter`, `RelocationRequest`, `ExitInterview`
- Do not use generic names: `Form1`, `HRForm`, `CustomForm`

### 1.3 Form API Names

- Format: **snake_case**, matching the PascalCase form name
- Examples: `asset_request`, `training_registration`, `warning_letter`
- API names are immutable once in use — set them correctly at creation time

### 1.4 Tab Naming

- Custom tabs: Title Case — `My Assets`, `Japan Rotation`, `Billing Codes`
- Tab API names: snake_case — `my_assets`, `japan_rotation`
- Tab order in navigation: group by function (Employee Info → Leave → Attendance → Performance)

---

## 2. Field Naming Conventions

### 2.1 Cross-Module Baseline

Follow the master naming table in [00_Cross_Module_Standards.md#naming-convention-master-table] for all common field types (text, date, lookup, boolean, number).

### 2.2 People-Specific Prefix

All custom fields added to Zoho People modules must use the `PEO_` prefix:

| Field | API Name | Type |
|---|---|---|
| Japan Rotation Flag | `PEO_Japan_Rotation_Flag` | Boolean |
| Billability Code | `PEO_BillabilityCode` | Single-line text |
| Visa Expiry Date | `PEO_Visa_Expiry_Date` | Date |
| Emergency Contact | `PEO_Emergency_Contact` | Single-line text |
| Internal Grade | `PEO_Internal_Grade` | Picklist |

> **Rule:** The `PEO_` prefix distinguishes custom fields from Zoho's default fields, preventing naming collisions during system upgrades.

### 2.3 Sensitive Field Rules

Fields containing salary, personal identification, or medical data must:

1. Have **role-based visibility** configured at the time of field creation — not retroactively
2. Be marked as **restricted** in the field properties
3. Be listed in the project's [Data Dictionary] in WorkDrive with their access roles documented
4. Never appear in default list views — only in detail views for authorized roles

**Restricted field categories:**

| Category | Examples | Authorized Roles |
|---|---|---|
| Compensation | `Salary`, `Bonus`, `CTC` | HR, Director |
| Personal ID | `Aadhaar`, `Passport_Number` | HR only |
| Medical | `Medical_History`, `Leave_Reason` | HR only |
| Banking | `Bank_Account`, `IFSC` | HR, Finance |

---

## 3. Custom Function Standards

### 3.1 Naming Convention

Format: `PEO_[Action]_fn`

| Function Name | Purpose |
|---|---|
| `PEO_OnboardEmployee_fn` | Create employee profile on hire trigger |
| `PEO_CalculateLeaveBalance_fn` | Recalculate leave balance on policy change |
| `PEO_UpdateJapanFlag_fn` | Set Japan rotation flag on project assignment |
| `PEO_SendProbationAlert_fn` | Notify manager when probation period nears end |
| `PEO_ArchiveExitRecord_fn` | Archive employee data on offboarding completion |

### 3.2 Function Header Comment

Every custom function must begin with the standard header from [00_Cross_Module_Standards.md#function-header-comment-template]. People-specific additions to the header:

```deluge
/*
 * Function  : PEO_[FunctionName]_fn
 * Module    : People → [SubModule]
 * Purpose   : [One-line description]
 * Params    : [param1 (Type) - description], [param2 (Type) - description]
 * Returns   : [return type and description]
 * Author    : [Name] | Created: [YYYY-MM-DD]
 * Modified  : [YYYY-MM-DD] by [Name] — [what changed]
 * HR Note   : [Document any compliance or data privacy considerations]
 */
```

### 3.3 Employee Record Audit Logging — Mandatory

Any function that **creates, modifies, or deletes** an employee record field must log the following before returning:

| Log Field | Description |
|---|---|
| `employee_id` | Zoho People employee ID |
| `field_changed` | API name of the modified field |
| `old_value` | Value before change |
| `new_value` | Value after change |
| `timestamp` | `zoho.currenttime` at point of change |
| `triggered_by` | User ID who invoked the function |

Log destination: a dedicated `PEO_AuditLog` Creator app form (or Zoho Creator data store configured by the India Manager).

### 3.4 Deluge Code Example — Standard Pattern

```deluge
/*
 * Function  : PEO_UpdateJapanFlag_fn
 * Module    : People → Employee
 * Purpose   : Sets Japan rotation flag when employee is assigned to Japan project
 * Params    : employeeId (String) - Zoho People employee record ID
 *             flagValue (Boolean) - true to set flag, false to clear
 * Returns   : void
 * Author    : [Name] | Created: 2026-05-25
 * HR Note   : Modifies PEO_Japan_Rotation_Flag — triggers Japan payroll supplement check
 */
void PEO_UpdateJapanFlag_fn(String employeeId, Boolean flagValue)
{
  try
  {
    // --- Fetch current value for audit log ---
    currentRecord = zoho.people.getRecordById("Employee", employeeId);
    oldValue      = currentRecord.get("PEO_Japan_Rotation_Flag");

    // --- Prepare update ---
    updateMap = map();
    updateMap.put("PEO_Japan_Rotation_Flag", flagValue);
    response = zoho.people.updateRecord("Employee", employeeId, updateMap);

    if(response.get("response").get("result") != "Updated Successfully")
    {
      info "[PEO_UpdateJapanFlag_fn] Update failed for employeeId: " + employeeId;
      return;
    }

    // --- Audit log: mandatory for any field change on Employee record ---
    auditEntry = map();
    auditEntry.put("employee_id",   employeeId);
    auditEntry.put("field_changed", "PEO_Japan_Rotation_Flag");
    auditEntry.put("old_value",     oldValue.toString());
    auditEntry.put("new_value",     flagValue.toString());
    auditEntry.put("timestamp",     zoho.currenttime.toString());
    auditEntry.put("triggered_by",  zoho.loginuser);
    zoho.creator.addRow("fci-india", "PEO_AuditLog", "Audit_Entry", auditEntry);
  }
  catch(e)
  {
    info "[PEO_UpdateJapanFlag_fn] EXCEPTION for employeeId: " + employeeId
         + " | Error: " + e.toString();
  }
}
```

### 3.5 Error Handling Rules

- All functions must use `try/catch`
- Catch block must log the function name, the input parameters, and the exception message via `info`
- Never silently swallow exceptions — if a function fails silently, HR data integrity is at risk
- For critical operations (onboarding, offboarding): send a failure notification to the India Manager email

---

## 4. Alert & Notification Standards

### 4.1 Alert Naming

Format: `[Event]_[Audience]_Alert`

| Alert Name | Trigger |
|---|---|
| `LeaveApproved_Employee_Alert` | Leave request approved by manager |
| `LeaveRejected_Employee_Alert` | Leave request rejected |
| `Probation_Expiry_Manager_Alert` | Employee's probation period within 30 days of end |
| `ContractRenewal_HR_Alert` | Contract end date within 60 days |
| `AttendanceMissed_Employee_Alert` | No attendance record for a working day |
| `ExitInitiated_HR_Alert` | Employee resignation submitted |

### 4.2 Notification Naming

Format: `[Trigger]_[Recipient]_Notification`

| Notification Name | Recipient |
|---|---|
| `BirthdayReminder_Team_Notification` | Team members of the employee |
| `AttendanceMissed_Employee_Notification` | The employee with missed attendance |
| `AppraisalOpen_Employee_Notification` | All employees in appraisal cycle |
| `PolicyUpdate_AllStaff_Notification` | All active employees |
| `JapanVisaExpiry_HR_Notification` | HR team (for Japan-based employees) |

### 4.3 Mandatory Configuration for Every Alert/Notification

Before activating any alert or notification, the following must be set and documented:

| Configuration | Requirement |
|---|---|
| Trigger condition | Explicitly defined rule, not "any change" |
| Recipient | Role-based (e.g., Reporting Manager, HR Team) — **never** an individual user by name |
| Message template | Reviewed and approved — see template review rule below |
| Test status | Verified with a test employee profile |

### 4.4 Template Review Rule

- All new or modified notification templates must be reviewed by the **India Manager** before activation
- Review sign-off: add a comment in the alert description: `Reviewed by [Name] on [YYYY-MM-DD]`
- Message templates must not contain raw field values that expose other employees' data

### 4.5 Japan Employee Notifications — Bilingual Mandatory

Any notification that may be received by Japan-based employees must be bilingual:

```
Subject: Leave Approved / 休暇承認

Dear [Employee Name] / [社員名] 様,

Your leave request from [Start Date] to [End Date] has been approved.
[開始日] から [終了日] までの休暇申請が承認されました。

Please review your updated leave balance in Zoho People.
更新された休暇残高をZoho Peopleでご確認ください。
```

- Japanese translations must be verified by a native speaker or approved translation tool — do not use raw machine translation
- Bilingual requirement applies to: leave, attendance, appraisal, and policy notifications

---

## 5. Widget Standards in People

### 5.1 Widget Naming

Format: **kebab-case**, descriptive of function

| Widget Name | Purpose |
|---|---|
| `leave-balance-widget` | Shows employee's leave balance summary |
| `team-attendance-chart` | Manager view of team attendance |
| `japan-rotation-status` | Japan project rotation indicator |
| `appraisal-progress-tracker` | Current appraisal cycle status |
| `asset-list-widget` | Employee's assigned assets |

### 5.2 People SDK Initialization — Standard Pattern

Every widget in Zoho People must initialize using the People embedded app SDK:

```javascript
ZOHO.embeddedApp.on("PageLoad", function(data) {
  ZOHO.People.getCurrentUser().then(function(user) {
    const employeeId = user.data.employeeId;
    const role       = user.data.role;

    // Validate role before loading sensitive data
    if (!employeeId) {
      showError("Employee ID not found. Please contact HR.");
      return;
    }

    loadEmployeeData(employeeId, role);

  }).catch(function(error) {
    console.error("[Widget] getCurrentUser failed:", error);
    showError("Unable to load user data. Please refresh.");
  });
});

ZOHO.embeddedApp.init();
```

> **Rule:** Always call `ZOHO.embeddedApp.init()` as the last line of the initialization block.

### 5.3 Data Masking for Attendance/Leave Widgets

Widgets that display attendance or leave data for multiple employees must enforce role-based masking:

```javascript
function loadTeamData(employeeId, role) {
  const isPrivileged = (role === "HR" || role === "Manager" || role === "Director");

  if (!isPrivileged) {
    // Non-privileged users: load only their own data
    loadSingleEmployeeData(employeeId);
  } else {
    // Privileged users: load team data
    loadFullTeamData(employeeId, role);
  }
}
```

- Never expose another employee's leave reasons, salary, or personal data in a widget
- HR-only fields: check role server-side via People API, not just client-side

### 5.4 Cross-Reference

For HTML structure, CSS conventions, and general widget security rules, see [00_Cross_Module_Standards.md#widget-html--css--js-standards].

---

## 6. Leave & Attendance Workflow Standards

### 6.1 Leave Workflow Rules

| Rule | Requirement |
|---|---|
| Manager approval step | Mandatory in every leave workflow — never remove |
| Auto-approve | Permitted only if an explicit documented business rule exists (e.g., "Sick leave ≤ 1 day auto-approved") — document in workflow description |
| Multi-level approval | Document the full chain in the workflow description field |
| Rejection reason | Mandatory field when a manager rejects leave |
| Cancellation | Employee-initiated cancellation must notify the approving manager |

**Multi-level approval documentation template** (add to workflow description field):

```
Approval Chain:
  Level 1 — Reporting Manager: approves/rejects initial request
  Level 2 — HR Team: reviews for policy compliance
  Level 3 — Director: required for leave > 10 consecutive days
Last reviewed: [YYYY-MM-DD] by [Name]
```

### 6.2 Attendance Workflow Rules

- Attendance regularization (correcting missed punches): **manager sign-off mandatory**
- Regularization requests must include: date, original record, corrected time, reason
- Bulk regularization (e.g., system downtime): India Manager approval required; document in WorkDrive
- Log every regularization with the employee ID, timestamp, and approver

### 6.3 Japan Holiday Calendar

- Japan public holiday calendar: maintained as a separate shift/holiday schedule in People
- Update deadline: **first two weeks of January** each year
- Responsibility: India Manager assigns update task to an HR team member
- After update: verify that Japan employees' leave calculations reflect the new calendar
- Cross-check source: [Japan Ministry of Health, Labour and Welfare official calendar]

---

## 7. Performance Appraisal Standards

### 7.1 Appraisal Cycle Naming

Format: `[Year]_[Period]_Appraisal`

| Cycle Name | Description |
|---|---|
| `2026_H1_Appraisal` | January–June 2026 review |
| `2026_Annual_Appraisal` | Full-year 2026 review |
| `2026_Probation_Review` | Probation completion review |

### 7.2 Ratings Scale — Mandatory Definition

The ratings scale must be defined in the appraisal form's description field. Standard scale:

| Rating | Label | Description |
|---|---|---|
| 1 | Below Expectations | Does not meet role requirements |
| 2 | Needs Improvement | Partially meets requirements |
| 3 | Meets Expectations | Consistently meets role requirements |
| 4 | Exceeds Expectations | Regularly exceeds requirements |
| 5 | Exceptional | Significantly exceeds, role model |

> **Rule:** This scale must remain consistent across all appraisal cycles. Any change to the scale requires India Director approval and must be documented in WorkDrive with the rationale and the effective cycle.

### 7.3 Appraisal Data Access

| Data | Access |
|---|---|
| Employee's own ratings | Employee can view their final ratings after cycle closes |
| Manager's draft ratings | HR only — employees cannot see drafts |
| Calibration data | HR and Director only |
| Historical appraisal data | HR and the individual employee (their own records only) |
| Aggregate appraisal data | Manager (their team only), Director (all) |

- Draft appraisals: field visibility must be configured to HR-only during the rating period
- After cycle closes and ratings are published: configure visibility for the employee's own record

---

## 8. Data Privacy (Critical)

> **This section is non-negotiable. All rules here are mandatory, not advisory.**

### 8.1 Salary & Compensation Data

- Access: **HR and Director only** — enforced via field-level security at field creation
- Never included in: list views, widgets accessible to employees, notifications, or reports shared outside HR
- Exports containing salary data: require **India Director written approval** (email or Zoho Cliq message logged in WorkDrive)

### 8.2 Personal Documents

- Passport, Aadhaar, visa documents, PAN cards: stored in **Zoho People's document vault only**
- Never emailed, never exported to WorkDrive folders with broad access
- Document access log: review quarterly for unauthorized access

### 8.3 Medical & Leave Reasons

- Leave reasons marked confidential: visible to **HR only** — not to the reporting manager unless the employee explicitly consents
- Medical certificates: stored in People's document vault, same rules as personal documents
- System configuration: ensure leave reason field is set to HR-only visibility in all leave modules

### 8.4 Data Export Rules

| Action | Requirement |
|---|---|
| Any data export from People | India Director approval required |
| Export log | Record who exported, date/time, format, purpose |
| Log location | WorkDrive under `ProjectCode/HR/DataExportLog/` |
| Bulk export | Must be encrypted before transfer; delete from local machine after use |

### 8.5 Cross-Reference

Security checklist for field creation, access review, and audit logging: [00_Cross_Module_Standards.md#security-checklist]

---

## 9. Integration with Recruit

### 9.1 Onboarding Trigger

When Zoho Recruit marks a candidate's status as **Hired**, the following must be automatically triggered:

1. Create an Employee profile in Zoho People
2. Pre-fill fields from Recruit candidate record (per the field mapping document)
3. Assign onboarding checklist/workflow to the new employee
4. Notify HR team via People alert

### 9.2 Integration Method

- **Preferred:** Zoho Flow (visual, documented, auditable)
- **Alternative:** Zoho Catalyst function if complex logic is required
- **Not permitted:** Direct Deluge scripts without Flow documentation — integration must be traceable

### 9.3 Field Mapping Documentation

The field mapping between Recruit and People must be documented and stored in:

```
WorkDrive → ProjectCode → HR → Integrations → Recruit_To_People_FieldMapping_vX.xlsx
```

Minimum fields to map:

| Recruit Field | People Field | Notes |
|---|---|---|
| Candidate Name | Employee Name | Split into first/last if needed |
| Email Address | Work Email | Trigger IT provisioning |
| Department | Department | Must match People picklist values |
| Designation | Job Title | |
| Offer Date | Date of Joining | |
| Reporting Manager | Reporting To | Must be an existing People employee |
| Employment Type | Employment Type | |

### 9.4 Testing Requirements

Before activating the Recruit-to-People integration in production:

1. Create a **test candidate record** in Recruit (named clearly as a test)
2. Move test candidate to "Hired" status
3. Verify the People employee profile is created with correct field values
4. Verify the onboarding workflow is triggered
5. Delete the test employee record from People after verification
6. Document test results in WorkDrive under `HR/Integrations/TestLog/`

### 9.5 Integration Ownership

- Integration owner: India Manager (approves changes)
- Developer who builds the integration: documents all steps in the integration's Flow/Catalyst description
- Review: re-test integration after any Zoho Recruit or People module update that affects mapped fields

---

*Document owner: India Manager — HR Systems*
*Last reviewed: 2026-05-25*
*Next review due: 2027-01-01*
