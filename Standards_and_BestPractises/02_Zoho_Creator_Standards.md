# 02 — Zoho Creator Standards & Best Practices

> **Scope:** All Zoho Creator applications built or maintained by FCI India.
> **Related:** [00_Cross_Module_Standards.md](./00_Cross_Module_Standards.md) | [01_Deluge_Standards.md](./01_Deluge_Standards.md)
> **Owner:** FCI India Development Team
> **Last Updated:** 2026-05-25

---

## Table of Contents

1. [Application Naming](#1-application-naming)
2. [Form Naming Conventions](#2-form-naming-conventions)
3. [Field Naming Conventions](#3-field-naming-conventions)
4. [Lookup Between Forms Standards](#4-lookup-between-forms-standards)
5. [Deluge Standards in Creator](#5-deluge-standards-in-creator)
6. [Report Naming](#6-report-naming)
7. [Dashboard Naming](#7-dashboard-naming)
8. [Widget Standards in Creator](#8-widget-standards-in-creator)
9. [Form Validation Rules](#9-form-validation-rules)
10. [Access Control](#10-access-control)
11. [Creator Security](#11-creator-security)
12. [Performance Best Practices](#12-performance-best-practices)

---

## 1. Application Naming

### 1.1 App Name Format
- Use **PascalCase** for all application names.
- Prefix with `FCI_` to namespace all internal applications.
- Name must reflect the **business domain**, not a person or team.

| Good | Bad |
|---|---|
| `FCI_ProjectTracker` | `projecttracker` |
| `FCI_HRPortal` | `HRApp_Vivek` |
| `FCI_FinanceOps` | `FCI_App1` |
| `FCI_ClientOnboarding` | `fci-client-onboarding` |

### 1.2 Description Requirement
Every application **must** include a description containing:
- **Purpose:** One sentence explaining what the app does.
- **Owner:** Team or individual responsible for the app.
- **Created Date:** Date the app was first published.
- **Last Reviewed:** Date the app was last reviewed for relevance/accuracy.

**Example description:**
```
Purpose: Tracks project lifecycle from initiation to closure for all active FCI engagements.
Owner: PMO Team
Created: 2025-10-01
Last Reviewed: 2026-05-25
```

### 1.3 One App Per Business Domain
- Each Zoho Creator application must represent a **single business domain**.
- Do not mix unrelated data models within one app (e.g., HR data and CRM data must not coexist in the same app).
- If two domains share data, establish a **lookup or API integration** between separate apps rather than merging them.

---

## 2. Form Naming Conventions

### 2.1 Core Rules
- Use **PascalCase** for all form names.
- Form names must reflect the **entity** being captured, not the action or process.
- Names must be singular (the entity, not a collection).

| Good | Bad |
|---|---|
| `CustomerProfile` | `CustomerAddForm` |
| `ProjectRequest` | `AddNewProject` |
| `LeaveApplication` | `LeaveForm` |
| `Employee` | `EmployeeData` |
| `Invoice` | `InvoiceCreation` |

### 2.2 Child / Linked Forms
- Subforms or child forms that belong to a parent form use a `_Detail` suffix.
- The prefix must match the parent form name.

| Parent Form | Child Form |
|---|---|
| `Project` | `ProjectTask_Detail` |
| `Invoice` | `Invoice_LineItem` |
| `PurchaseOrder` | `PurchaseOrder_Item` |
| `EmployeeProfile` | `EmployeeDocument_Detail` |

### 2.3 Supporting / Reference Forms
- Lookup / reference forms (used as data sources for dropdowns and lookups) use a `_Ref` suffix.

| Example |
|---|
| `Department_Ref` |
| `CostCenter_Ref` |
| `StatusCode_Ref` |

---

## 3. Field Naming Conventions

### 3.1 General Rules
- **Display name:** PascalCase with spaces allowed (user-facing label).
- **API name (link name):** snake_case, auto-derived or manually set to be consistent.
- API names must be human-readable — avoid abbreviations unless the abbreviation is universally understood (e.g., `id`, `url`).

### 3.2 Field Type Conventions

| Field Type | Display Name Convention | API Name Convention | Good Example | Bad Example |
|---|---|---|---|---|
| Text field | Title Case with spaces | `snake_case` | `Customer Name` → `customer_name` | `custNm`, `cust name` |
| Lookup field | `TargetForm Name` | `targetform_name` | `Project ID`, `Employee Name` | `proj`, `emp` |
| Boolean / Checkbox | Sentence with `Is` or `Has` | `is_` or `has_` prefix | `Is Active` → `is_active` | `active`, `approved` |
| Date field | Noun with Date/At suffix | `_date` or `_at` | `Created Date` → `created_date` | `dt`, `date1` |
| DateTime field | Noun with Timestamp suffix | `_at` | `Submitted At` → `submitted_at` | `ts`, `datetime` |
| Number / Currency | Descriptive noun | lowercase noun phrase | `Total Amount` → `total_amount` | `amt`, `hrs` |
| Percentage | Descriptive noun + Pct | `_pct` | `Completion Pct` → `completion_pct` | `pct`, `perc` |
| Auto-generated ID | Prefix + ID | `prefix_ID` | `FCI_PROJECT_ID` | `id`, `ID1` |
| Multi-line text | Title Case with spaces | `snake_case` | `Notes` → `notes` | `txt`, `desc1` |
| File / Attachment | Noun + Document/File | `_document` or `_file` | `Contract Document` → `contract_document` | `file`, `attach` |
| Formula field | Noun describing output | `snake_case` | `Days Remaining` → `days_remaining` | `calc`, `formula1` |

### 3.3 System Fields
These reserved names must not be used as custom field names:

- `ID`, `Added_User`, `Added_Time`, `Modified_User`, `Modified_Time`
- `Owner`, `Form_Name`

### 3.4 Required vs Optional Fields
- All fields that are business-critical must be marked **Required** at the field level.
- Optional fields must still have a clear label so users understand their purpose.
- Do not leave empty/unlabelled fields in any form.

---

## 4. Lookup Between Forms Standards

### 4.1 Lookup Field Naming
- The lookup field name must clearly indicate its **target form and the key being referenced**.
- Pattern: `[TargetForm]_[DisplayField]`

| Scenario | Lookup Field Name |
|---|---|
| Looking up `Projects` form | `Project_ID` or `Project_Name` |
| Looking up `Employee` form | `Employee_Name` |
| Looking up `Department_Ref` form | `Department_Name` |

### 4.2 Display Field Configuration
- Always configure the **display field** on every lookup — users must see meaningful text, not internal numeric IDs.
- If the natural display field is an ID (e.g., invoice number), that is acceptable; the key is that it must be **human-readable in context**.

### 4.3 Two-Way Relationship Documentation
- When two forms have a bidirectional relationship, document it in **both form descriptions**.
- Example: `Invoice` form description should note "References `Customer` via `Customer_Name` lookup." The `Customer` form description should note "Used as lookup source in `Invoice.Customer_Name`."

### 4.4 Cascading Lookup Depth Limit
- Cascading lookups (lookups that filter based on another lookup's value) must be limited to a **maximum depth of 3 levels**.
- Deeper cascades indicate a data model problem — refactor the data structure rather than adding more cascades.

**Allowed:**
```
Country → State → City  (3 levels — acceptable)
```

**Not allowed:**
```
Country → State → City → District → Suburb  (5 levels — refactor required)
```

### 4.5 Data Integrity Enforcement
- Never use a free-text field where a lookup to a reference form exists.
- If users need to enter a value that isn't in the lookup list, implement a **request-to-add workflow** rather than bypassing the lookup.
- This enforces referential integrity across the application.

---

## 5. Deluge Standards in Creator

> For all foundational Deluge standards (variable naming, error handling, commenting, etc.) refer to:
> **[00_Cross_Module_Standards.md — Deluge Scripting Standards](./00_Cross_Module_Standards.md#deluge-scripting-standards)**

### 5.1 Workflow Naming

All Creator workflows must follow this naming pattern:

```
[FormName]_[Trigger]_[Action]
```

| Trigger Type | Keyword |
|---|---|
| On form submit (new record) | `OnAdd` |
| On record edit | `OnEdit` |
| On record delete | `OnDelete` |
| On form load | `OnLoad` |
| On field change | `OnChange` |
| Before save validation | `OnValidate` |
| Scheduled trigger | `Scheduled` |

**Examples:**

| Workflow Name | Meaning |
|---|---|
| `CustomerProfile_OnAdd_SendWelcomeEmail` | Runs when a new CustomerProfile is added; sends welcome email |
| `Project_OnEdit_NotifyManager` | Runs when a Project record is edited; notifies manager |
| `LeaveApplication_OnValidate_CheckBalance` | Validates leave balance before saving a new leave record |
| `Invoice_Scheduled_SendReminders` | Scheduled workflow that sends overdue invoice reminders |
| `Employee_OnDelete_ArchiveRecords` | Runs when an Employee record is deleted; archives associated records |

### 5.2 Creator-Specific Deluge Patterns

#### 5.2.1 Accessing Submitted Form Data
```deluge
// Accessing fields from the submitted form within OnAdd / OnEdit workflows
submittedName = input.Customer_Name;
submittedProject = input.Project_ID;
submittedDate = input.Start_Date;
submittedStatus = input.Status;
```

#### 5.2.2 Fetching Related Records via Lookup
```deluge
// Always null-check and size-check before accessing lookup result fields
projectDetails = Projects[ID == submittedProject];
if(projectDetails != null && projectDetails.size() > 0)
{
  projectName = projectDetails.Project_Name;
  projectManager = projectDetails.Manager_Email;
}
else
{
  // Handle missing lookup — log or return early
  info "WARNING: No matching project found for ID: " + submittedProject;
}
```

#### 5.2.3 Updating a Record
```deluge
// Build update map with only the fields being changed
updateData = map();
updateData.put("Status", "Approved");
updateData.put("Approved_Date", today());
updateData.put("Approved_By", zoho.loginuserid);

updateResponse = zoho.creator.updateRecord(
  "FCI_ProjectTracker",   // App link name
  "Projects",             // Form link name
  projectID,              // Record ID to update
  updateData
);

if(updateResponse.get("code") != 3000)
{
  info "ERROR in Project_OnEdit_NotifyManager: Update failed for record " + projectID + " — " + updateResponse.toString();
}
```

#### 5.2.4 Sending Email from Creator
```deluge
// Standard email sending block in Deluge
sendmail
[
  from : zoho.adminuserid
  to : emailRecipient
  subject : "Project Update: " + projectName
  message : "<p>Dear " + recipientName + ",</p>"
            + "<p>Your project <b>" + projectName + "</b> has been updated.</p>"
            + "<p>Status: " + newStatus + "</p>"
            + "<p>Regards,<br>FCI System</p>"
]
```

#### 5.2.5 Fetching Records with Criteria
```deluge
// Prefer criteria-filtered fetch over full table scan
activeProjects = zoho.creator.getRecords(
  "FCI_ProjectTracker",
  "Projects",
  "(Status == \"Active\")",
  1,
  50,
  {"Authorization": "Zoho-oauthtoken " + zoho.oauthtoken}
);

if(activeProjects.get("code") == 3000)
{
  projectList = activeProjects.get("data");
  for each project in projectList
  {
    // Process each project
  }
}
```

#### 5.2.6 Creating a New Record
```deluge
// Create a new record via Deluge
newRecord = map();
newRecord.put("Customer_Name", customerName);
newRecord.put("Project_ID", projectID);
newRecord.put("Created_Date", today());
newRecord.put("Status", "Pending");

createResponse = zoho.creator.createRecord(
  "FCI_ProjectTracker",
  "Tasks",
  newRecord
);

if(createResponse.get("code") != 3000)
{
  info "ERROR: Failed to create task record — " + createResponse.toString();
}
```

### 5.3 Report-Based Deluge — Decision Box / Custom Action

#### 5.3.1 Decision Box Rules
- Always validate that the user has made a selection before processing.
- Show a confirmation dialog for any **destructive or irreversible action** (e.g., deletion, status close).
- Decision box names must follow the same `[FormName]_[Trigger]_[Action]` pattern as workflows.

#### 5.3.2 Custom Action Rules
- Custom Action naming pattern: `[Verb][Entity]`
- The verb must be a clear, imperative action word.

| Good | Bad |
|---|---|
| `ApproveLeave` | `LeaveApproval` |
| `CloseProject` | `ProjectClose` |
| `SendInvoice` | `InvoiceSend` |
| `ArchiveEmployee` | `EmployeeArchive` |

#### 5.3.3 Custom Action Deluge Pattern
```deluge
// Standard pattern for a Custom Action on a report
// 1. Validate selection
if(input.ID == null || input.ID == "")
{
  alert "Please select a record before performing this action.";
  return;
}

// 2. Confirm destructive actions
confirmAction = confirm("Are you sure you want to close this project? This cannot be undone.");
if(!confirmAction)
{
  return;
}

// 3. Perform the action
updateData = map();
updateData.put("Status", "Closed");
updateData.put("Closed_Date", today());
updateData.put("Closed_By", zoho.loginuserid);

updateResponse = zoho.creator.updateRecord("FCI_ProjectTracker", "Projects", input.ID, updateData);

if(updateResponse.get("code") == 3000)
{
  alert "Project has been successfully closed.";
}
else
{
  alert "Error: Could not close the project. Please contact support.";
  info "ERROR in CloseProject custom action: " + updateResponse.toString();
}
```

---

## 6. Report Naming

### 6.1 Naming Pattern
```
[Entity]_[ViewType]_[Filter]
```

| Part | Options / Notes |
|---|---|
| `Entity` | PascalCase name of the primary form being displayed |
| `ViewType` | `List`, `Summary`, `Calendar`, `Pivot` |
| `Filter` | Describes the filter or scope applied; omit if showing all records |

### 6.2 Examples

| Report Name | Meaning |
|---|---|
| `Projects_List_Active` | List view of Projects filtered to Active status |
| `Employees_Summary_ByDept` | Summary view of Employees grouped by Department |
| `Invoices_Calendar_Monthly` | Calendar view of Invoices scoped to current month |
| `LeaveApplications_List_Pending` | List of Leave Applications with Pending status |
| `Projects_List_All` | Full list view of all Projects (no filter) |
| `Revenue_Pivot_ByQuarter` | Pivot view of Revenue data grouped by quarter |

### 6.3 Additional Rules
- Report names must be unique within an application.
- If the view type is obvious from context (e.g., the only report for that entity), the `ViewType` segment may be omitted — but add it when multiple reports for the same entity exist.
- All public-facing reports must have a description explaining who the intended audience is.

---

## 7. Dashboard Naming

### 7.1 Naming Pattern
```
[Audience]_[Domain]_Dashboard
```

| Part | Notes |
|---|---|
| `Audience` | Role or user group the dashboard is designed for: `Manager`, `Director`, `HR`, `Finance`, `Team` |
| `Domain` | Business domain or subject area: `Projects`, `Revenue`, `HR`, `Operations` |
| `Dashboard` | Literal suffix — always included |

### 7.2 Examples

| Dashboard Name | Audience |
|---|---|
| `Manager_Projects_Dashboard` | Project managers — shows project status, open tasks |
| `Director_Revenue_Dashboard` | Directors — shows revenue KPIs and forecasts |
| `HR_Headcount_Dashboard` | HR team — shows headcount, attrition, leave balances |
| `Finance_Invoices_Dashboard` | Finance team — shows overdue invoices, collection status |
| `Team_MyTasks_Dashboard` | All team members — shows personal task list and deadlines |

### 7.3 Dashboard Description Requirement
Every dashboard **must** include a description containing:
- **Owner:** Name or role of the person responsible for the dashboard's accuracy.
- **Audience:** Who this dashboard is intended for.
- **Data Refresh:** How often the underlying data updates.
- **Last Reviewed:** Date of last accuracy review.

---

## 8. Widget Standards in Creator

### 8.1 Widget Naming
- Use **kebab-case** for all widget names.
- Names must describe the widget's function, not its appearance.

| Good | Bad |
|---|---|
| `employee-search-widget` | `widget1` |
| `project-status-chart` | `BlueChart` |
| `invoice-approval-panel` | `myWidget` |

### 8.2 Widget File Storage
- All widget source files must be stored in WorkDrive under the project folder:
```
/[ProjectCode]/Creator/Widgets/[widget-name]/
  index.html
  app.js
  style.css
```
- Never store widget files only inside Zoho Creator without a WorkDrive backup copy.
- Widgets must be version-controlled (see [00_Cross_Module_Standards.md — Version Control](./00_Cross_Module_Standards.md)).

### 8.3 Creator JS SDK Usage

> For full JS/HTML/CSS rules, see: **[00_Cross_Module_Standards.md — Widget HTML/CSS/JS Standards](./00_Cross_Module_Standards.md#widget-htmlcssjs-standards)**

**Key Creator-specific rules:**
- Always use `ZOHO.Creator.API` for data access from widget JavaScript.
- **Never** make raw REST API calls with hardcoded tokens inside widget JS.
- All API calls must go through the SDK to leverage the session token automatically.

#### 8.3.1 Standard Creator Widget Initialization
```javascript
// Standard boilerplate for all Creator-embedded widgets
ZOHO.embeddedApp.on("PageLoad", function(data) {
  // data contains context from the Creator page
  initializeWidget(data);
});

function initializeWidget(pageData) {
  ZOHO.Creator.API.getRecords({
    appName: "fci-project-tracker",   // App link name (lowercase-hyphen)
    reportName: "All_Projects",       // Report link name
    criteria: "(Status == \"Active\")"
  }).then(function(response) {
    if (response.code === 3000) {
      renderProjects(response.data);
    } else {
      handleError(response.message);
    }
  }).catch(function(err) {
    handleError("Unexpected error: " + err.message);
  });
}

function renderProjects(projects) {
  if (!projects || projects.length === 0) {
    showEmptyState("No active projects found.");
    return;
  }
  // Render logic here
}

function handleError(message) {
  // Show user-friendly error — never show raw stack traces to users
  document.getElementById("error-container").innerHTML =
    "<p class='error-message'>Unable to load data. Please try again or contact support.</p>";
  console.error("[employee-search-widget] Error:", message);
}

function showEmptyState(message) {
  document.getElementById("content-container").innerHTML =
    "<p class='empty-state'>" + message + "</p>";
}
```

#### 8.3.2 Updating a Record from a Widget
```javascript
ZOHO.Creator.API.updateRecord({
  appName: "fci-project-tracker",
  reportName: "All_Projects",
  id: recordId,
  data: {
    data: {
      Status: "Approved",
      Approved_Date: new Date().toISOString().split("T")[0]
    }
  }
}).then(function(response) {
  if (response.code === 3000) {
    showSuccess("Record updated successfully.");
  } else {
    handleError("Update failed: " + response.message);
  }
});
```

### 8.4 Widget Error and Empty State Handling
Every widget **must** handle and display:
- **Loading state:** A spinner or placeholder while data is being fetched.
- **Empty state:** A clear message when no records are returned (not a blank screen).
- **Error state:** A user-friendly message (not a raw error or blank screen) when the API call fails.

---

## 9. Form Validation Rules

### 9.1 Mandatory Field Validation
- All mandatory fields must be enforced at **two levels**:
  1. **Field level:** Mark as "Required" in field configuration (prevents blank submission via UI).
  2. **Deluge OnValidate:** Programmatically re-validate before save, especially for fields whose requirement is conditional.

### 9.2 Email Field Validation
```deluge
// In OnValidate workflow
if(input.Email != null && input.Email != "")
{
  emailPattern = "^[a-zA-Z0-9._%+\\-]+@[a-zA-Z0-9.\\-]+\\.[a-zA-Z]{2,}$";
  if(!input.Email.matches(emailPattern))
  {
    alert "Please enter a valid email address.";
    cancel;
  }
}
```

### 9.3 Phone Field Validation
```deluge
// Validate Indian phone number format (10 digits, optionally with +91)
if(input.Phone_Number != null && input.Phone_Number != "")
{
  phonePattern = "^(\\+91)?[6-9][0-9]{9}$";
  cleanedPhone = input.Phone_Number.replaceAll(" ", "").replaceAll("-", "");
  if(!cleanedPhone.matches(phonePattern))
  {
    alert "Please enter a valid 10-digit Indian mobile number.";
    cancel;
  }
}
```

### 9.4 Date Range Validation
```deluge
// Validate that end date is not before start date
if(input.End_Date != null && input.Start_Date != null)
{
  if(input.End_Date < input.Start_Date)
  {
    alert "End Date cannot be before Start Date.";
    cancel;
  }
}

// Validate that a date is not in the past (for future-only fields)
if(input.Effective_Date != null)
{
  if(input.Effective_Date < today())
  {
    alert "Effective Date must be today or a future date.";
    cancel;
  }
}
```

### 9.5 Cross-Field Validation
- Cross-field validation (validation that depends on the value of more than one field) **must** go in the `OnValidate` workflow.
- Do **not** put cross-field validation in `OnAdd` — `OnAdd` runs after the record is already saved; `OnValidate` runs before.
- Use `cancel;` in OnValidate to halt the save operation and display the alert to the user.

---

## 10. Access Control

### 10.1 Field-Level Visibility
- Configure field-level permissions per role to control who sees sensitive data.
- Salary, compensation, and personal data fields must be **hidden** from all roles except HR Admin.
- Approval status and decision fields must be **read-only** for requestors — only approvers may edit.

### 10.2 Report-Level Access
- Hide the **Delete** button for all non-admin roles at the report level.
- Limit the **Edit** action to roles that should have write access.
- Configure the **Add Record** button visibility per role.

### 10.3 Shared Pages Access Testing
- Before publishing any shared page (publicly accessible or cross-role), **test with the lowest-privilege user account** that would realistically access it.
- Verify that no sensitive data is visible, no destructive actions are available, and the page loads without errors under restricted permissions.

### 10.4 Role Naming Convention
- Roles in Creator must use PascalCase: `AppAdmin`, `ProjectManager`, `Viewer`, `HRAdmin`.
- Every role must have a description explaining its intended user group and permission level.

---

## 11. Creator Security

> For the full security checklist, see: **[00_Cross_Module_Standards.md — Security Checklist](./00_Cross_Module_Standards.md#security-checklist)**

### 11.1 Password and Credential Storage
- **Never** store passwords, API keys, or credentials in Creator form fields or record data.
- Use **Zoho Vault** for shared team credentials.
- Use **Zoho Catalyst Secrets** for credentials accessed programmatically from Creator workflows.

### 11.2 Audit Trail
- Enable the audit trail for **all forms that handle**:
  - Financial data (invoices, payments, budgets)
  - Personal data (employee records, leave data, salary)
  - Approval workflows (any form with an approval status)
  - Contracts or legal documents
- Audit trail settings are in: Form Settings → Permissions → Enable Audit Trail.

### 11.3 Data Exposure in Workflows
- Do not log sensitive field values (passwords, PII, financial amounts) in `info` statements — these appear in workflow logs visible to app admins.
- Acceptable: `info "Processing record ID: " + recordID;`
- Not acceptable: `info "Employee salary: " + input.Salary;`

### 11.4 Shared Link Security
- Any form shared via a public link must be reviewed for data it exposes.
- Public forms must not pre-fill sensitive data via URL parameters.

---

## 12. Performance Best Practices

### 12.1 OnLoad Workflow Optimization
- **Never** load all records from a large form in an `OnLoad` workflow without pagination.
- Always use `limit` and `page` parameters when fetching records in OnLoad.
- If an OnLoad workflow is taking more than 2 seconds, it must be profiled and optimized.

```deluge
// Correct: Paginated fetch with criteria
recentTasks = zoho.creator.getRecords(
  "FCI_ProjectTracker",
  "Tasks",
  "(Status == \"Open\" && Assigned_To == zoho.loginuserid)",
  1,    // page number
  20,   // limit — fetch only 20 records
  {"Authorization": "Zoho-oauthtoken " + zoho.oauthtoken}
);
```

### 12.2 Report-Level Fetch vs Full Table Scan
- Use **criteria-filtered `getRecords`** calls rather than fetching all records and filtering in Deluge.
- Push filtering logic to the database query, not to Deluge loops.

```deluge
// Correct: Filter at query level
filteredProjects = zoho.creator.getRecords("FCI_ProjectTracker", "Projects", "(Status == \"Active\" && Region == \"India\")");

// Wrong: Fetch all and filter in code — avoid this pattern for large datasets
allProjects = zoho.creator.getRecords("FCI_ProjectTracker", "Projects", "");
for each project in allProjects
{
  if(project.get("Status") == "Active" && project.get("Region") == "India")
  {
    // Process — but this is slow for large tables
  }
}
```

### 12.3 Moving Complex Computations to Catalyst
- If a Creator workflow performs computationally expensive logic (large data aggregation, ML scoring, complex report generation), move that logic to a **Zoho Catalyst serverless function**.
- Call the Catalyst function via an API call from the Creator workflow, and store or display the result.
- This keeps Creator workflows fast and delegates heavy processing to Catalyst's isolated compute.

### 12.4 Lookup Field Performance
- In lookup field configuration, limit the **search fields** displayed to the minimum necessary.
- Do not configure a lookup to load all fields of the target record — select only the fields the user needs to identify the correct record.
- Use **criteria in lookups** to pre-filter valid options where applicable (e.g., only show active employees in the "Assigned To" lookup).

### 12.5 Subform Performance
- Limit subform columns to only what is needed for the use case.
- Avoid displaying formula fields in subform columns that recalculate on every row — compute once on save instead.

### 12.6 Widget Performance
- Widgets must not make more than **3 API calls on initial load**.
- Use batching or a single aggregated Deluge function call where multiple data points are needed.
- Implement client-side caching for reference data that does not change frequently (e.g., department list, status codes).

---

*End of 02 — Zoho Creator Standards & Best Practices*
