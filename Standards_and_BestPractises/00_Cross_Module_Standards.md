# 00 — Cross-Module Standards

**Shared standards for Deluge, Widget, Security & Naming — applicable across Zoho Creator, CRM, Sigma, People, Recruit**

---

> **Document Status:** Active  
> **Version:** 1.0.0  
> **Last Updated:** 2026-05-25  
> **Owner:** India Lead + Japan Counterpart (mini-CAB)  
> **Applies To:** All Zoho modules — Creator, CRM, Catalyst, Sigma, People, Recruit, Forms, Analytics

---

## Table of Contents

1. [Naming Convention Master Table](#1-naming-convention-master-table)
2. [Deluge Scripting Standards](#2-deluge-scripting-standards)
3. [Widget (HTML / CSS / JS) Standards](#3-widget-html--css--js-standards)
4. [Security Checklist](#4-security-checklist)
5. [Git / Version Control Standards for Zoho Code](#5-git--version-control-standards-for-zoho-code)
6. [Change Management](#6-change-management)
7. [Cross-References](#cross-references)

---

## 1. Naming Convention Master Table

Consistent naming is the single highest-leverage practice for maintainability across a multi-module Zoho environment. Names must be readable by a new developer without access to the original author. When in doubt, be explicit rather than brief.

### 1.1 Module Abbreviation Prefixes

Every artifact (function, workflow, report, dashboard, custom field, connection, widget) must be prefixed with the module abbreviation to make the source immediately identifiable in audit logs, error traces, and shared connection libraries.

| Abbreviation | Module | Example Usage |
|---|---|---|
| `CRT_` | Zoho Creator | `CRT_getEmployeeRecord_fn` |
| `CRM_` | Zoho CRM | `CRM_updateLeadStatus_fn` |
| `CAT_` | Zoho Catalyst | `CAT_processWebhookPayload_fn` |
| `SGM_` | Zoho Sigma | `SGM_renderCustomWidget_fn` |
| `PEO_` | Zoho People | `PEO_syncAttendanceData_fn` |
| `RCT_` | Zoho Recruit | `RCT_scoreApplicationProfile_fn` |
| `FRM_` | Zoho Forms | `FRM_validateFormSubmission_fn` |
| `ANL_` | Zoho Analytics | `ANL_buildRevenueReport_rpt` |

### 1.2 Case Conventions

| Element Type | Convention | Rationale |
|---|---|---|
| Form names, module names, report names | `PascalCase` | Matches Zoho's own naming for built-in modules |
| Deluge variables, function parameters | `camelCase` | Standard scripting convention; distinguishes variables from constants at a glance |
| API field names, JSON keys, database-like fields | `snake_case` | Matches Zoho API response structure; prevents mismatch bugs |
| Constants, org variables, config keys | `UPPER_SNAKE_CASE` | Instantly recognisable as values that should never change at runtime |
| HTML element IDs | `kebab-case` | Standard DOM/CSS convention |
| CSS class names | `BEM (block__element--modifier)` | Prevents style bleed across widgets |

### 1.3 Verb-Noun Pattern for Functions

All custom functions must follow a **verb-noun** pattern. The verb describes the action; the noun describes the subject. This makes function inventories self-documenting.

**Approved verb list (keep consistent — do not invent synonyms):**

| Verb | Use For |
|---|---|
| `get` | Read/fetch data from Zoho or external source |
| `set` | Write or overwrite a single value |
| `update` | Modify an existing record's fields |
| `create` | Insert a new record |
| `delete` | Remove a record (use sparingly; prefer deactivate) |
| `send` | Dispatch notifications, emails, webhooks |
| `sync` | Bidirectional or scheduled data synchronisation |
| `validate` | Check input or data integrity |
| `process` | Transform or handle a payload |
| `build` | Construct a complex object or string |
| `calculate` | Perform arithmetic or derived logic |
| `format` | Transform data representation without changing value |

**Examples:**

```
getCustomerDetails()       — fetch a customer record
updateOrderStatus()        — change status on existing order
sendNotificationEmail()    — dispatch an email notification
calculateLeadScore()       — derive score from field values
validatePhoneNumber()      — check format of a phone string
syncAttendanceFromBiometric()  — pull biometric data into People
```

### 1.4 Suffix Conventions

Suffixes identify the *type* of artifact. Apply after the verb-noun body and before any module prefix.

| Suffix | Artifact Type | Example |
|---|---|---|
| `_fn` | Custom function (Deluge) | `CRM_calculateLeadScore_fn` |
| `_wf` | Workflow rule | `PEO_onLeaveApproval_wf` |
| `_bp` | Blueprint | `CRM_dealClosurePipeline_bp` |
| `_rpt` | Report | `ANL_monthlyRevenueByRegion_rpt` |
| `_dsh` | Dashboard | `CRM_salesPerformance_dsh` |
| `_tpl` | Template (email, document, message) | `RCT_offerLetterStandard_tpl` |
| `_con` | Zoho Connection | `CRT_googleSheets_con` |
| `_wgt` | Widget | `SGM_employeeDirectory_wgt` |
| `_var` | Org variable / custom config variable | `CRT_MAX_RETRY_COUNT_var` |

### 1.5 Master Naming Convention Table

| Element | Convention | Good Example | Bad Example |
|---|---|---|---|
| Custom function | `MODULE_verbNoun_fn` | `CRM_getAccountContacts_fn` | `getContacts`, `fn_contacts`, `CRM_Contacts` |
| Workflow rule | `MODULE_onEventDescription_wf` | `PEO_onLeaveRequestSubmit_wf` | `LeaveWorkflow`, `wf1`, `PEO_Leave` |
| Blueprint | `MODULE_processName_bp` | `CRM_dealApproval_bp` | `Blueprint1`, `DealBP` |
| Report | `MODULE_descriptionScope_rpt` | `ANL_openLeadsByTerritory_rpt` | `Report2`, `Leads_Report` |
| Dashboard | `MODULE_descriptionAudience_dsh` | `CRM_salesManagerOverview_dsh` | `Dashboard`, `mgr_dash` |
| Template | `MODULE_purposeVariant_tpl` | `RCT_rejectionLetterStandard_tpl` | `Template1`, `reject_mail` |
| Deluge variable | `camelCase`, descriptive | `accountRecordList`, `isEmailSent` | `x`, `data`, `list1`, `temp` |
| Deluge constant | `UPPER_SNAKE_CASE` | `MAX_RETRY_ATTEMPTS`, `DEFAULT_TIMEOUT_MS` | `maxRetry`, `timeout`, `3` (magic number) |
| Deluge function param | `camelCase`, descriptive | `accountId`, `contactEmailList` | `id`, `emails`, `param1` |
| Boolean variable | `is_`, `has_`, `can_` prefix | `isRecordValid`, `hasAttachment`, `canSendEmail` | `valid`, `attached`, `flag` |
| Form/Module name | `PascalCase` | `LeaveRequest`, `CustomerOnboarding` | `leave_request`, `customer onboarding`, `LEAVEREQ` |
| API field (snake_case) | `snake_case` | `account_name`, `lead_source` | `AccountName`, `LeadSource`, `accountname` |
| HTML element ID | `kebab-case` | `customer-name-input`, `submit-btn` | `customerNameInput`, `submit_btn`, `CustomerNameInput` |
| CSS class | BEM `block__element--modifier` | `form-card__input--error` | `formInput_err`, `errInput`, `.red` |
| Git branch | `type/module-short-description` | `feature/crm-lead-scoring-fn` | `newbranch`, `vivek-fix`, `fix123` |
| Git tag | `vMAJOR.MINOR.PATCH` | `v1.2.0` | `release1`, `Jan2026`, `latest` |
| Zoho Connection name | `MODULE_serviceName_con` | `CRM_twilioSms_con`, `CRT_googleSheets_con` | `twilio`, `connection1`, `myAPI` |
| Widget folder/name | `MODULE_widgetPurpose_wgt` | `SGM_leaveCalendar_wgt` | `widget1`, `LeaveCalendar`, `leavewgt` |

---

## 2. Deluge Scripting Standards

> **Applies to:** Zoho Creator, Zoho Sigma, Zoho CRM (custom functions & workflow functions), Zoho People (custom scripts), Zoho Recruit (custom functions)

Deluge is Zoho's proprietary scripting language. Unlike general-purpose languages, it has specific constraints: no native exception objects with stack traces, limited library support, and platform-managed execution context. These standards compensate for those constraints and ensure code is debuggable, reviewable, and safe.

---

### 2.1 Variable Naming

Follow the case conventions in Section 1.2. Specific rules for Deluge:

**camelCase for all variables:**

```deluge
// GOOD
contactRecordList = zoho.crm.getRecords("Contacts", 1, 200, null);
accountName = inputRecord.get("Account_Name");
isEmailValid = CRM_validateEmail_fn(emailAddress);

// BAD
ContactRecordList = zoho.crm.getRecords("Contacts", 1, 200, null);  // PascalCase — looks like a module name
x = inputRecord.get("Account_Name");                                 // single-letter variable
data = zoho.crm.getRecords("Contacts", 1, 200, null);               // vague name
list1 = zoho.crm.getRecords("Contacts", 1, 200, null);              // numbered suffix
```

**UPPER_SNAKE_CASE for constants:**

```deluge
// GOOD
MAX_RETRY_ATTEMPTS = 3;
DEFAULT_PAGE_SIZE = 200;
SUPPORT_EMAIL_ADDRESS = "support@example.com";
API_TIMEOUT_SECONDS = 30;

// BAD
maxRetry = 3;     // looks like a variable — could be modified accidentally
timeout = 30;     // ambiguous name and wrong casing for a constant
```

**Boolean prefix conventions:**

```deluge
// GOOD — intent is obvious without reading the assignment
isRecordFound = (contactList.size() > 0);
hasMultipleContacts = (contactList.size() > 1);
canSendNotification = isRecordFound && isEmailValid;

// BAD
found = (contactList.size() > 0);        // is this a boolean or an index?
multiple = (contactList.size() > 1);     // unclear type
ok = isRecordFound && isEmailValid;      // meaningless name
```

**Loop counter exception — the only acceptable single-letter variables:**

```deluge
// Acceptable: i, j, k as loop counters only — and only when the loop body is short
for each contactRecord in contactRecordList
{
    // contactRecord is still descriptive — not i
}

// If using index-based iteration:
for i = 0 to contactRecordList.size() - 1
{
    currentContact = contactRecordList.get(i);
    // i is acceptable here
}
```

---

### 2.2 Function Header Comment Template

Every custom function must begin with this comment block. No exceptions. This block is the function's "passport" — it must be kept current when the function is modified.

```deluge
/*
 * Function  : CRM_getAccountContacts_fn
 * Module    : Zoho CRM
 * Purpose   : Fetches all active contacts for a given account ID and returns
 *             a formatted list of maps with name, email, and phone fields.
 * Params    : accountId (String) - The Zoho CRM Account record ID
 *           : includeInactive (Boolean) - If true, includes inactive contacts
 * Returns   : List of Maps - Each map contains keys: contact_id, full_name,
 *             email, phone, is_active
 *             Returns empty list on error or no records found.
 * Author    : Vivek J | Created: 2026-01-10
 * Modified  : 2026-03-15 | Vivek J | Added includeInactive parameter
 *           : 2026-05-20 | Priya K | Added null-check on API response
 */
```

**Rules for the header block:**
- `Function` must match the exact Zoho function name as it appears in the module
- `Module` must be one of: Zoho Creator, Zoho CRM, Zoho People, Zoho Recruit, Zoho Sigma, Zoho Catalyst
- `Purpose` must be a plain-English statement — no jargon, no abbreviations
- `Params` — list every parameter, one per line with type and description
- `Returns` — describe what the caller should expect, including the empty/error case
- `Modified` — append a new line for each significant change; do not overwrite old entries

---

### 2.3 Error Handling

Deluge does not have a first-class exception model with typed exceptions and stack traces. This makes disciplined error handling even more important — a silently failing function in a production workflow can corrupt data without any visible indication.

**Core rules:**
- Every function that makes an external call (API, file, database) must use a `try-catch` block
- Catch blocks must log the error with enough context to reproduce the issue
- Never swallow errors silently — always log, and where appropriate, return a failure indicator to the caller
- Validate API responses before accessing nested keys — an unchecked null dereference is a runtime error with no helpful message

**API response validation pattern:**

```deluge
// Step 1: Check the response itself is not null
if (apiResponse == null)
{
    info "[CRM_getAccountContacts_fn] ERROR: API response was null for accountId=" + accountId;
    return emptyContactList;
}

// Step 2: For list responses, check size before iterating
if (apiResponse.size() == 0)
{
    info "[CRM_getAccountContacts_fn] INFO: No records returned for accountId=" + accountId;
    return emptyContactList;
}

// Step 3: When accessing a specific key, check it exists in the map
if (apiResponse.containsKey("data"))
{
    recordData = apiResponse.get("data");
}
else
{
    info "[CRM_getAccountContacts_fn] ERROR: Response map missing 'data' key. Response=" + apiResponse.toString();
    return emptyContactList;
}
```

**Complete try-catch example in Deluge syntax:**

```deluge
/*
 * Function  : CRM_updateContactStatus_fn
 * Module    : Zoho CRM
 * Purpose   : Updates the Status field of a CRM Contact record.
 * Params    : contactId (String) - CRM Contact record ID
 *           : newStatus (String) - New status value (must be a valid picklist value)
 * Returns   : Map - Keys: success (Boolean), message (String), updated_record_id (String)
 * Author    : Vivek J | Created: 2026-02-01
 */

updateContactStatus = function(contactId, newStatus)
{
    resultMap = map();
    resultMap.put("success", false);
    resultMap.put("message", "");
    resultMap.put("updated_record_id", "");

    try
    {
        // Validate inputs before making the API call
        if (contactId == null || contactId == "")
        {
            resultMap.put("message", "contactId cannot be null or empty");
            info "[CRM_updateContactStatus_fn] ERROR: contactId is null or empty";
            return resultMap;
        }

        if (newStatus == null || newStatus == "")
        {
            resultMap.put("message", "newStatus cannot be null or empty");
            info "[CRM_updateContactStatus_fn] ERROR: newStatus is null or empty for contactId=" + contactId;
            return resultMap;
        }

        updatePayload = map();
        updatePayload.put("id", contactId);
        updatePayload.put("Status", newStatus);

        updateResponse = zoho.crm.updateRecord("Contacts", contactId, updatePayload);

        // Validate response structure before reading keys
        if (updateResponse == null)
        {
            resultMap.put("message", "API returned null response");
            info "[CRM_updateContactStatus_fn] ERROR: Null response for contactId=" + contactId;
            return resultMap;
        }

        if (updateResponse.containsKey("code") && updateResponse.get("code") == "SUCCESS")
        {
            resultMap.put("success", true);
            resultMap.put("message", "Contact status updated successfully");
            resultMap.put("updated_record_id", contactId);
            // info "[CRM_updateContactStatus_fn] SUCCESS: contactId=" + contactId + " status=" + newStatus;
            // ^ Commented out for production — uncomment during debugging only
        }
        else
        {
            errorMessage = updateResponse.containsKey("message") ? updateResponse.get("message") : "Unknown API error";
            resultMap.put("message", "API error: " + errorMessage);
            info "[CRM_updateContactStatus_fn] ERROR: API call failed for contactId=" + contactId + " | Response=" + updateResponse.toString();
        }
    }
    catch (e)
    {
        resultMap.put("message", "Exception: " + e.toString());
        info "[CRM_updateContactStatus_fn] EXCEPTION: contactId=" + contactId + " | Error=" + e.toString();
    }

    return resultMap;
};
```

---

### 2.4 API Call Patterns

**Rule: Never make API calls inside loops unless absolutely unavoidable.**

Loops that call APIs on each iteration will hit Zoho's rate limits (especially in bulk workflows), produce unpredictable performance, and generate quota exhaustion errors in production.

**Anti-pattern (do not do this):**

```deluge
// BAD — API call inside a loop
for each leadId in leadIdList
{
    leadRecord = zoho.crm.getRecordById("Leads", leadId);  // API call per iteration — catastrophic at scale
    // ... process leadRecord
}
```

**Correct pattern — batch fetch then iterate:**

```deluge
// GOOD — single API call, then iterate over local data
SEARCH_CRITERIA = "id:in:" + leadIdList.toString(",");
leadRecordList = zoho.crm.searchRecords("Leads", SEARCH_CRITERIA, 1, 200, null);

if (leadRecordList != null && leadRecordList.size() > 0)
{
    for each leadRecord in leadRecordList
    {
        // Process from in-memory list — zero additional API calls
        leadName = leadRecord.get("Last_Name");
        // ...
    }
}
```

**When a loop API call is unavoidable — use sleep() for rate limiting:**

```deluge
RATE_LIMIT_SLEEP_MS = 500;   // 500ms between calls — adjust based on Zoho plan limits

processedCount = 0;
for each contactId in contactIdBatch
{
    updateResult = zoho.crm.updateRecord("Contacts", contactId, updatePayload);

    processedCount = processedCount + 1;

    // Sleep every 10 records to avoid hitting rate limits
    if (processedCount % 10 == 0)
    {
        zoho.deluge.sleep(RATE_LIMIT_SLEEP_MS);
    }
}
```

**Check response map structure before accessing keys:**

```deluge
// When an API returns a complex response map, always verify structure
apiResponse = invokeurl
[
    url: "https://api.external-service.com/v2/customers"
    type: GET
    connection: "CRT_externalService_con"
];

// Never do: customerList = apiResponse.get("customers").get("data")
// If "customers" key is missing, the first .get() returns null and the second crashes

// Do this instead:
if (apiResponse != null && apiResponse.containsKey("customers"))
{
    customerData = apiResponse.get("customers");

    if (customerData != null && customerData.containsKey("data"))
    {
        customerList = customerData.get("data");
        // Safe to use customerList now
    }
    else
    {
        info "[CRT_syncCustomers_fn] WARNING: 'customers.data' key missing in response";
    }
}
else
{
    info "[CRT_syncCustomers_fn] ERROR: API response null or missing 'customers' key | Response=" + apiResponse.toString();
}
```

**Meaningful log messages — the info() statement format:**

```deluge
// Format: [FUNCTION_NAME] LEVEL: Context key=value pairs
info "[CRM_calculateLeadScore_fn] INFO: Starting calculation for leadId=" + leadId;
info "[CRM_calculateLeadScore_fn] DEBUG: Raw score before normalization=" + rawScore + " | leadId=" + leadId;
info "[CRM_calculateLeadScore_fn] WARNING: No company data found, using default industry weight | leadId=" + leadId;
info "[CRM_calculateLeadScore_fn] ERROR: Score calculation failed for leadId=" + leadId + " | Exception=" + e.toString();
```

---

### 2.5 Code Formatting

Consistent formatting makes code reviews faster and diffs cleaner. These rules are mandatory.

**Indentation: 4 spaces (no tabs)**

```deluge
// GOOD — 4 spaces per level
if (isRecordValid)
{
    contactName = contactRecord.get("Full_Name");

    if (contactName != null)
    {
        formattedName = contactName.trim().toUpperCase();
    }
}

// BAD — 2 spaces
if (isRecordValid)
{
  contactName = contactRecord.get("Full_Name");   // 2-space indent — inconsistent
}

// BAD — tabs
if (isRecordValid)
{
	contactName = contactRecord.get("Full_Name");   // tab indent — displays differently per editor
}
```

**Max line length: 100 characters.** Break long lines with a continuation pattern:

```deluge
// GOOD — line broken at logical boundary
searchCriteria = "(Account_Name:equals:" + accountName + ")"
                 + " AND (Status:equals:Active)"
                 + " AND (Email:is_not_empty:true)";

// BAD — single line over 100 characters
searchCriteria = "(Account_Name:equals:" + accountName + ") AND (Status:equals:Active) AND (Email:is_not_empty:true)";
```

**Blank lines between logical blocks:**

```deluge
// GOOD — blank lines separate logical sections
contactList = CRM_getAccountContacts_fn(accountId, false);

if (contactList == null || contactList.size() == 0)
{
    info "[CRM_sendFollowUpEmail_fn] INFO: No contacts found for accountId=" + accountId;
    return false;
}

emailSubject = "Follow-up from " + companyName;
emailBody = CRM_buildFollowUpEmailBody_fn(accountRecord, contactList);

sendResult = zoho.mail.sendMail(
    fromAddress,
    contactList.get(0).get("email"),
    emailSubject,
    emailBody
);
```

**One action per line — never chain assignments or compress logic:**

```deluge
// GOOD — one action per line
rawName = contactRecord.get("Full_Name");
trimmedName = rawName.trim();
formattedName = trimmedName.toUpperCase();

// BAD — chained in one line, impossible to debug step-by-step
formattedName = contactRecord.get("Full_Name").trim().toUpperCase();
// If get("Full_Name") returns null, the entire chain fails with no indication of where
```

---

### 2.6 Deluge Anti-Patterns (What NOT to Do)

These patterns have caused production incidents. They are explicitly banned.

| Anti-Pattern | Why It Is Banned | Correct Alternative |
|---|---|---|
| Hardcoded credentials, API keys, passwords, or tokens in Deluge code | Credentials appear in version control, logs, and Zoho's function history. A leaked key cannot be selectively revoked from code. | Use Zoho Connections (`connection` parameter in `invokeurl`) or Zoho Org Variables |
| Raw `invokeurl` with `Authorization: Bearer <token>` hardcoded | Same as above — token is visible in the function body to all CRM/Creator admins | Zoho Connections encrypt and manage tokens; use the `connection` parameter |
| Nested loops beyond 2 levels | O(n³) complexity becomes unmanageable; deeply nested code is unreadable and untestable | Extract the inner loop to a named helper function |
| Magic numbers (`if (score > 75)`, `sleep(500)`) | Numbers have no discoverable meaning; changing them requires reading all code that uses them | Define as constants: `QUALIFIED_LEAD_THRESHOLD = 75`, `RATE_LIMIT_SLEEP_MS = 500` |
| `info` statements in production functions | Fills Zoho's audit/log storage; can inadvertently log PII (names, emails, IDs) in plain text; impacts function performance | Comment out or remove info statements before deploying to production. Use a `DEBUG_MODE` constant to gate them |
| `getRecordsByID` with unchecked null response | If the record does not exist or the API fails, the result is null; accessing `.get()` on null is a runtime error | Always check `if (response != null)` before accessing keys |
| Concatenating user input directly into API criteria or queries | Risk of criteria injection — a crafted input can alter the query logic | Validate and sanitise inputs before use; never build search strings from raw user input |
| Using `for each` on a potentially null list | If the list is null, the loop throws a runtime error | Always check `if (list != null && list.size() > 0)` before iterating |
| Duplicate logic copy-pasted across functions | Changes must be made in multiple places; inconsistency causes subtle bugs | Extract to a shared helper function with a `_fn` suffix |
| `try-catch` with an empty catch block | Errors are silently swallowed; the function appears to succeed when it has failed | Always log in the catch block, at minimum: `info "... EXCEPTION: " + e.toString()` |

---

### 2.7 Complete Deluge Example

The following function demonstrates all good practices in a single realistic scenario. It fetches CRM contacts for a given account, validates every step, logs errors with context, and returns a formatted list to the caller.

```deluge
/*
 * Function  : CRM_getAccountContacts_fn
 * Module    : Zoho CRM
 * Purpose   : Fetches all active contacts associated with a given CRM Account ID.
 *             Validates the API response, handles errors gracefully, and returns
 *             a clean formatted list for use by caller functions or workflows.
 * Params    : accountId (String)       - The Zoho CRM Account record ID (required)
 *           : includeInactive (Boolean) - If true, returns inactive contacts too (optional, default false)
 * Returns   : List of Maps - Each map contains:
 *               contact_id   (String)  - CRM Contact record ID
 *               full_name    (String)  - Contact's display name
 *               email        (String)  - Primary email address (empty string if not set)
 *               phone        (String)  - Primary phone number (empty string if not set)
 *               is_active    (Boolean) - Whether contact is active
 *             Returns empty list on error or no records found. Never returns null.
 * Author    : Vivek J | Created: 2026-01-15
 * Modified  : 2026-03-20 | Priya K  | Added includeInactive parameter
 *           : 2026-05-10 | Vivek J  | Added phone field to output map
 */

CRM_getAccountContacts_fn = function(accountId, includeInactive)
{
    // -------------------------------------------------------------------------
    // Constants
    // -------------------------------------------------------------------------
    FUNCTION_NAME = "CRM_getAccountContacts_fn";
    MAX_RECORDS_PER_PAGE = 200;

    // -------------------------------------------------------------------------
    // Initialise return value — always return a list, never null
    // -------------------------------------------------------------------------
    formattedContactList = list();

    // -------------------------------------------------------------------------
    // Input validation
    // -------------------------------------------------------------------------
    if (accountId == null || accountId == "")
    {
        info "[" + FUNCTION_NAME + "] ERROR: accountId is null or empty — cannot proceed";
        return formattedContactList;
    }

    // Default includeInactive to false if not provided or null
    if (includeInactive == null)
    {
        includeInactive = false;
    }

    try
    {
        // ---------------------------------------------------------------------
        // Build search criteria
        // ---------------------------------------------------------------------
        searchCriteria = "(Account_Name.id:equals:" + accountId + ")";

        if (!includeInactive)
        {
            searchCriteria = searchCriteria + " AND (Contact_Status:equals:Active)";
        }

        // info "[" + FUNCTION_NAME + "] DEBUG: searchCriteria=" + searchCriteria;
        // ^ Uncomment during debugging only — remove before production

        // ---------------------------------------------------------------------
        // Make the API call
        // ---------------------------------------------------------------------
        apiResponse = zoho.crm.searchRecords(
            "Contacts",
            searchCriteria,
            1,
            MAX_RECORDS_PER_PAGE,
            null
        );

        // ---------------------------------------------------------------------
        // Validate API response before any access
        // ---------------------------------------------------------------------
        if (apiResponse == null)
        {
            info "[" + FUNCTION_NAME + "] ERROR: API returned null for accountId=" + accountId;
            return formattedContactList;
        }

        if (apiResponse.size() == 0)
        {
            info "[" + FUNCTION_NAME + "] INFO: No contacts found for accountId=" + accountId + " | includeInactive=" + includeInactive.toString();
            return formattedContactList;
        }

        // ---------------------------------------------------------------------
        // Process each contact record into a clean output map
        // ---------------------------------------------------------------------
        for each rawContact in apiResponse
        {
            contactOutputMap = map();

            // Safely extract each field with a fallback default
            contactId = rawContact.containsKey("id") ? rawContact.get("id") : "";
            fullName   = rawContact.containsKey("Full_Name") ? rawContact.get("Full_Name") : "";
            email      = rawContact.containsKey("Email") ? rawContact.get("Email") : "";
            phone      = rawContact.containsKey("Phone") ? rawContact.get("Phone") : "";
            statusVal  = rawContact.containsKey("Contact_Status") ? rawContact.get("Contact_Status") : "";

            isActive = (statusVal == "Active");

            contactOutputMap.put("contact_id", contactId);
            contactOutputMap.put("full_name",  fullName);
            contactOutputMap.put("email",      email);
            contactOutputMap.put("phone",      phone);
            contactOutputMap.put("is_active",  isActive);

            formattedContactList.add(contactOutputMap);
        }

        info "[" + FUNCTION_NAME + "] INFO: Returned " + formattedContactList.size().toString() + " contacts for accountId=" + accountId;
    }
    catch (e)
    {
        info "[" + FUNCTION_NAME + "] EXCEPTION: accountId=" + accountId + " | Error=" + e.toString();
        // Return the (possibly partially populated) list — caller must check size()
        // Do not re-throw — let caller handle gracefully
    }

    return formattedContactList;
};
```

---

## 3. Widget (HTML / CSS / JS) Standards

> **Applies to:** Zoho Creator (embedded widgets), Zoho Sigma (CRM extension widgets), Zoho People (custom widgets)

Widgets are the primary mechanism for embedding custom UI into Zoho. Poor widget code introduces XSS vulnerabilities, token leakage, broken mobile layouts, and unmaintainable CSS. These standards prevent the most common widget failures.

---

### 3.1 Widget File Structure

Every widget must follow this directory structure. Files outside this structure will not be accepted in code review.

```
widget-name/                     ← Folder name matches widget name: MODULE_widgetPurpose_wgt
  index.html                     ← Entry point — markup only, no inline scripts or styles
  app.js                         ← All JavaScript logic
  style.css                      ← All styles
  config.json                    ← Widget manifest (Sigma/Creator required)
  assets/                        ← Images, icons, fonts (if any)
    logo.svg
  lib/                           ← Third-party libraries (vendored, not CDN in production)
    zoho-embed-sdk.js
```

**config.json minimum structure (Sigma):**

```json
{
    "widgetName": "SGM_employeeDirectory_wgt",
    "widgetVersion": "1.2.0",
    "zohoModule": "Contacts",
    "targetView": "DetailView",
    "description": "Displays employee directory card with team hierarchy",
    "permissions": [
        "CRM.modules.contacts.READ",
        "CRM.modules.accounts.READ"
    ]
}
```

---

### 3.2 HTML Standards

**Use semantic HTML5 elements — not `<div>` for everything:**

```html
<!-- GOOD — semantic structure -->
<article class="contact-card">
    <header class="contact-card__header">
        <h2 class="contact-card__name" id="contact-display-name">Loading...</h2>
    </header>
    <section class="contact-card__details">
        <dl class="contact-card__fields">
            <dt class="contact-card__label">Email</dt>
            <dd class="contact-card__value" id="contact-email">—</dd>
            <dt class="contact-card__label">Phone</dt>
            <dd class="contact-card__value" id="contact-phone">—</dd>
        </dl>
    </section>
    <footer class="contact-card__actions">
        <button class="btn btn--primary" id="edit-contact-btn" type="button">Edit Contact</button>
    </footer>
</article>

<!-- BAD — div soup with no semantic meaning -->
<div class="card">
    <div class="header">
        <div id="name">Loading...</div>
    </div>
    <div class="body">
        <div>Email</div><div id="email">—</div>
    </div>
</div>
```

**Naming rules for HTML:**
- `id` attributes: `kebab-case` — e.g., `customer-name-input`, `submit-order-btn`
- `class` attributes: BEM convention — `block__element--modifier`
- No inline styles on any element — all visual styling belongs in `style.css`
- Every `<input>`, `<select>`, and `<textarea>` must have an associated `<label>` (accessibility)

```html
<!-- GOOD — label associated via for/id -->
<div class="form-field">
    <label class="form-field__label" for="lead-source-select">Lead Source</label>
    <select class="form-field__input" id="lead-source-select" name="leadSource">
        <option value="">Select a source</option>
        <option value="web">Web</option>
        <option value="referral">Referral</option>
    </select>
</div>

<!-- BAD — no label, accessibility failure -->
<select id="leadsource">
    <option>Web</option>
</select>
```

---

### 3.3 CSS Standards

**No inline CSS.** All styles live in `style.css`.

**No `!important` except for documented override cases** — if you need `!important` to override Zoho's host styles, add a comment explaining exactly which Zoho component is being overridden and why.

**Use Zoho CSS variables to match the host application theme:**

```css
/* GOOD — uses Zoho theme variables where available */
.contact-card {
    background-color: var(--zoho-bg-primary, #ffffff);
    border: 1px solid var(--zoho-border-color, #e0e0e0);
    border-radius: 4px;
    padding: 16px;
    font-family: var(--zoho-font-family, 'Lato', sans-serif);
    color: var(--zoho-text-primary, #333333);
}

.btn--primary {
    background-color: var(--zoho-accent-color, #0074d9);
    color: var(--zoho-btn-text-color, #ffffff);
    border: none;
    padding: 8px 16px;
    border-radius: 4px;
    cursor: pointer;
}

/* BAD — hardcoded colours that will not match host theme changes */
.contact-card {
    background-color: #ffffff;
    border: 1px solid #e0e0e0;
}
```

**Mobile-responsive using flexbox/grid — no fixed pixel widths on containers:**

```css
/* GOOD — responsive layout */
.contact-card__fields {
    display: grid;
    grid-template-columns: auto 1fr;
    gap: 8px 16px;
    align-items: baseline;
}

.contact-card__actions {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    justify-content: flex-end;
}

/* BAD — fixed width breaks on small screens */
.contact-card {
    width: 600px;   /* Will overflow or break on mobile/tablet panels */
}
```

**BEM class naming convention:**

```css
/* Block */
.form-card { }

/* Element — double underscore */
.form-card__title { }
.form-card__input { }
.form-card__submit-btn { }

/* Modifier — double hyphen */
.form-card__input--error { }
.form-card__input--disabled { }
.form-card__submit-btn--loading { }

/* NEVER name classes by appearance — name by purpose */
.red-text { }       /* BAD — what is it used for? */
.error-text { }     /* GOOD — describes semantic purpose */
.bold { }           /* BAD */
.field-label { }    /* GOOD */
```

---

### 3.4 JavaScript Standards

**Use `const` and `let` — never `var`:**

```javascript
// GOOD
const SDK_VERSION = '2.0';
let currentContactId = null;

// BAD
var sdkVersion = '2.0';   // var has function scope, not block scope — causes subtle bugs
```

**Async/await for all asynchronous operations:**

```javascript
// GOOD — async/await is readable and debuggable
async function fetchContactDetails(contactId) {
    try {
        const response = await ZOHO.CRM.API.getRecord({
            Entity: 'Contacts',
            RecordID: contactId
        });
        return response;
    } catch (error) {
        logger.error('fetchContactDetails', `Failed for contactId=${contactId}`, error);
        return null;
    }
}

// BAD — callback hell
ZOHO.CRM.API.getRecord({ Entity: 'Contacts', RecordID: contactId },
    function(response) {
        processContact(response, function(result) {
            updateUI(result, function() {
                // Three levels deep — impossible to follow error flow
            });
        });
    }
);
```

**No `console.log` in production — use a logger wrapper:**

```javascript
// Define once in app.js — wrap console to enable/disable globally
const logger = (() => {
    const DEBUG_MODE = false;   // Set to true only during development

    return {
        info:  (fn, msg, data) => { if (DEBUG_MODE) console.info(`[${fn}] INFO: ${msg}`, data ?? ''); },
        warn:  (fn, msg, data) => { if (DEBUG_MODE) console.warn(`[${fn}] WARN: ${msg}`, data ?? ''); },
        error: (fn, msg, err)  => { console.error(`[${fn}] ERROR: ${msg}`, err ?? ''); }
        // Errors always log — info and warn are gated behind DEBUG_MODE
    };
})();

// Usage
logger.info('fetchContactDetails', `Fetching contactId=${contactId}`);
logger.error('fetchContactDetails', 'API returned null', apiError);
```

**Module pattern to avoid global scope pollution:**

```javascript
// GOOD — wrap entire app in an IIFE module
const ContactCardWidget = (() => {
    // Private state — not accessible from outside
    let _currentRecord = null;
    let _isInitialised = false;

    // Private functions
    function _renderContact(contactData) {
        document.getElementById('contact-display-name').textContent =
            contactData.Full_Name || '—';
        document.getElementById('contact-email').textContent =
            contactData.Email || '—';
        document.getElementById('contact-phone').textContent =
            contactData.Phone || '—';
    }

    function _handleError(context, error) {
        logger.error(context, 'Render failed', error);
        document.getElementById('contact-display-name').textContent = 'Error loading contact';
    }

    // Public API
    return {
        init: async function(recordId) {
            if (_isInitialised) return;
            _isInitialised = true;

            try {
                _currentRecord = await fetchContactDetails(recordId);
                if (_currentRecord) {
                    _renderContact(_currentRecord);
                }
            } catch (error) {
                _handleError('ContactCardWidget.init', error);
            }
        }
    };
})();
```

**Complete JS example — ZOHO SDK initialisation + API call + error handling:**

```javascript
/**
 * app.js — SGM_contactCard_wgt
 * Widget: Contact Card for CRM Detail View
 * Module: Zoho Sigma (CRM Extension)
 * Author: Vivek J | Created: 2026-02-10
 * Modified: 2026-04-15 | Priya K | Added account name display
 */

// ============================================================================
// Logger — controlled output (no console.log in production)
// ============================================================================
const logger = (() => {
    const DEBUG_MODE = false;
    return {
        info:  (fn, msg) => { if (DEBUG_MODE) console.info(`[${fn}] INFO: ${msg}`); },
        warn:  (fn, msg) => { if (DEBUG_MODE) console.warn(`[${fn}] WARN: ${msg}`); },
        error: (fn, msg, err) => { console.error(`[${fn}] ERROR: ${msg}`, err || ''); }
    };
})();

// ============================================================================
// API Layer — all Zoho API calls live here, never inline in UI logic
// ============================================================================
const ZohoAPI = (() => {
    async function getContactById(contactId) {
        if (!contactId) {
            logger.warn('ZohoAPI.getContactById', 'contactId is null or empty');
            return null;
        }

        try {
            const response = await ZOHO.CRM.API.getRecord({
                Entity: 'Contacts',
                RecordID: contactId
            });

            // Validate response structure
            if (!response || !response.data || response.data.length === 0) {
                logger.warn('ZohoAPI.getContactById', `No data in response for contactId=${contactId}`);
                return null;
            }

            return response.data[0];
        } catch (error) {
            logger.error('ZohoAPI.getContactById', `Failed for contactId=${contactId}`, error);
            return null;
        }
    }

    return { getContactById };
})();

// ============================================================================
// UI Layer — DOM manipulation only; no business logic
// ============================================================================
const ContactCardUI = (() => {
    function setFieldText(elementId, value, fallback = '—') {
        const el = document.getElementById(elementId);
        if (el) {
            // Sanitise before DOM insertion — prevent XSS
            el.textContent = value ? String(value).trim() : fallback;
        }
    }

    function showLoadingState() {
        setFieldText('contact-display-name', 'Loading...');
        setFieldText('contact-email', '');
        setFieldText('contact-phone', '');
    }

    function showErrorState(message) {
        setFieldText('contact-display-name', message || 'Error loading contact');
        setFieldText('contact-email', '—');
        setFieldText('contact-phone', '—');
    }

    function renderContact(contactData) {
        setFieldText('contact-display-name', contactData.Full_Name);
        setFieldText('contact-email', contactData.Email);
        setFieldText('contact-phone', contactData.Phone);
        setFieldText('contact-account', contactData.Account_Name?.name);
    }

    return { showLoadingState, showErrorState, renderContact };
})();

// ============================================================================
// Widget Entry Point — ZOHO SDK initialisation
// ============================================================================
ZOHO.embeddedApp.on('PageLoad', async function(pageLoadData) {
    logger.info('Widget.PageLoad', `Received pageLoadData for entity=${pageLoadData.Entity}`);

    // Show loading state immediately
    ContactCardUI.showLoadingState();

    try {
        // Validate we received a record ID from the host page
        const recordId = pageLoadData?.EntityId;
        if (!recordId) {
            logger.error('Widget.PageLoad', 'No EntityId in pageLoadData', pageLoadData);
            ContactCardUI.showErrorState('No record ID received');
            return;
        }

        // Fetch contact data
        const contactRecord = await ZohoAPI.getContactById(recordId);
        if (!contactRecord) {
            ContactCardUI.showErrorState('Contact not found');
            return;
        }

        // Render to UI
        ContactCardUI.renderContact(contactRecord);
        logger.info('Widget.PageLoad', `Rendered contact: recordId=${recordId}`);

    } catch (error) {
        logger.error('Widget.PageLoad', 'Unhandled error during page load', error);
        ContactCardUI.showErrorState('An unexpected error occurred');
    }
});

// Initialise the embedded app SDK — must be called last
ZOHO.embeddedApp.init();
```

---

### 3.5 Widget Security

These rules are **mandatory**, not advisory. Each of these has been the root cause of real security incidents in Zoho deployments.

**Never store sensitive data in `localStorage` or `sessionStorage`:**

```javascript
// NEVER DO THIS
localStorage.setItem('authToken', userToken);           // Persists after browser close; accessible to any JS on the page
sessionStorage.setItem('userEmail', currentUser.email); // XSS attack can read this directly

// Correct approach: request fresh data from ZOHO SDK on each page load
// The SDK manages auth — the widget should never handle tokens directly
const currentUser = await ZOHO.CRM.CONFIG.getCurrentUser();
```

**Validate all inputs before sending to Zoho API:**

```javascript
// GOOD — validate format before using in an API search
function validateEmailInput(email) {
    if (!email || typeof email !== 'string') return false;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email.trim());
}

async function searchByEmail(rawEmailInput) {
    if (!validateEmailInput(rawEmailInput)) {
        ContactCardUI.showErrorState('Please enter a valid email address');
        return;
    }

    const sanitisedEmail = rawEmailInput.trim().toLowerCase();
    // Safe to use in API call now
    const results = await ZOHO.CRM.API.searchRecord({ ... criteria: sanitisedEmail });
}
```

**Sanitise HTML before DOM insertion — XSS prevention:**

```javascript
// NEVER set innerHTML with unsanitised content
element.innerHTML = rawUserInput;            // XSS vulnerability
element.innerHTML = apiResponse.description; // API data can contain injected scripts

// CORRECT — use textContent for plain text (auto-escapes HTML)
element.textContent = rawUserInput;          // Safe — renders as plain text

// When you genuinely need to set HTML (e.g., rich text field from Zoho):
function sanitiseHTML(rawHTML) {
    const div = document.createElement('div');
    div.textContent = rawHTML;   // Escapes all HTML tags
    return div.innerHTML;        // Returns escaped string safe for innerHTML
}
element.innerHTML = sanitiseHTML(richTextField);
```

**Use ZOHO SDK APIs — never direct REST calls from widget JS:**

```javascript
// NEVER DO THIS in a widget — exposes the OAuth token to the browser
const response = await fetch('https://www.zohoapis.com/crm/v3/Contacts', {
    headers: {
        'Authorization': 'Zoho-oauthtoken ' + accessToken  // Token is now visible in browser DevTools
    }
});

// CORRECT — let the Zoho SDK handle auth internally
const response = await ZOHO.CRM.API.getAllRecords({
    Entity: 'Contacts',
    sort_order: 'asc',
    per_page: 50,
    page: 1
});
// SDK injects the token server-side — it never appears in widget code or browser requests
```

---

## 4. Security Checklist

> **This checklist is mandatory for all modules before any production release.**  
> Each item must be signed off by the developer and verified by the India Lead before deployment.  
> Record the sign-off date and reviewer name in the module changelog.

| # | Security Check | How to Verify | Applies To |
|---|---|---|---|
| S-01 | No hardcoded credentials, passwords, API keys, or access tokens in any Deluge function, widget JS, or configuration file | Code review: search all functions for string literals resembling tokens (e.g., `1000.`, `Bearer `, `password =`). Run `git grep -i "password\|token\|secret\|api_key"` on widget repo. | All modules |
| S-02 | All external API connections use Zoho Connections — not raw `Authorization` headers | In Deluge `invokeurl` blocks, confirm `connection` parameter is set to a named connection. No `headers` map should contain `Authorization`. | Creator, CRM, People, Recruit, Catalyst |
| S-03 | Token-based authentication used for all external API integrations | Verify the Zoho Connection for each external service uses OAuth 2.0 or API key stored in Zoho Secrets — never hardcoded. | All modules with external integrations |
| S-04 | No PII (full name, email, phone, national ID, passport number, salary) written to `info` log statements in plain text | Review all `info` statements in Deluge functions that handle Contact, Lead, Employee, or Candidate records. PII fields must be masked or omitted from logs. | CRM, People, Recruit, Creator |
| S-05 | No sensitive data stored in custom fields accessible to all user roles | In CRM/People field settings, verify that fields containing salary, health data, or disciplinary records have role-based field permissions configured. | CRM, People, Recruit |
| S-06 | Input validation on all user-facing form fields (data type, length, format, required) | Test each form field with: empty input, max-length overflow, special characters (`<script>`, `'; DROP`), and invalid format. All must reject gracefully with a user message. | Creator, Forms, Widget forms |
| S-07 | VAPT (Vulnerability and Penetration Testing) completed before production launch for all customer-facing applications | VAPT report from approved vendor on file. Findings rated High or Critical must be remediated before go-live. | Creator (customer-facing), Sigma widgets (external), any public webhook endpoint |
| S-08 | Role-based field visibility configured for all sensitive data fields | Open the field permission matrix in CRM/People. Confirm that salary, performance ratings, disciplinary notes, and health fields are restricted to HR Admin / Manager roles only. | CRM, People, Recruit |
| S-09 | Audit trail enabled for all critical transaction modules | In CRM Settings → Audit Log, confirm Contacts, Deals, Accounts are tracked. In People, confirm Leave Approval, Payroll, and Exit workflows have audit enabled. | CRM, People, Recruit |
| S-10 | All webhook endpoints validate the request source using shared secret or IP allowlist | Review webhook handler functions for HMAC signature validation or IP check. A webhook without source validation accepts data from any caller. | Creator (webhook forms), Catalyst (webhook functions), CRM (incoming webhooks) |
| S-11 | No SQL injection risk in Analytics custom queries — all dynamic values parameterised | Review all custom SQL queries in Analytics. Dynamic values (e.g., user-supplied date ranges, filters) must use parameterised placeholders — not string concatenation. Search for `+` operators adjacent to variable names in SQL strings. | Analytics |
| S-12 | Widget JS does not store tokens, session cookies, or auth credentials in `localStorage` or `sessionStorage` | Review widget `app.js` for any `localStorage.setItem` or `sessionStorage.setItem` calls. None should store auth-related data. | Creator widgets, Sigma widgets |
| S-13 | All DOM insertions in widgets use `textContent` or an approved sanitiser — no raw `innerHTML` with API data | Review widget JS for `element.innerHTML = ` assignments. Any that use API-sourced or user-sourced data without sanitisation are a blocker. | All widgets |
| S-14 | Connections have minimum required scopes — no over-permissioned connections | Review each Zoho Connection's OAuth scope list. No connection should have `ZohoCRM.modules.ALL` if only `READ` on Contacts is needed. Principle of least privilege. | All modules using Connections |
| S-15 | Sandbox/staging testing completed with production-equivalent data volume before go-live | Test results documented. Performance under load (batch functions, bulk imports) verified to not exceed Zoho API rate limits or timeout thresholds. | All modules |

---

## 5. Git / Version Control Standards for Zoho Code

Zoho does not provide native Git integration for Deluge functions or widget code. This section defines the external version control strategy that compensates for that gap. Without this, there is no audit trail, no rollback capability, and no code review process for production changes.

### 5.1 Repository Structure

Each Zoho module team maintains a Git repository with this structure:

```
zoho-code/
  crm/
    functions/
      CRM_calculateLeadScore_fn.dg
      CRM_getAccountContacts_fn.dg
      CRM_updateContactStatus_fn.dg
    workflows/
      CRM_onLeadCreate_wf.md     ← Workflow config documented in markdown (Zoho UI, not code)
  creator/
    functions/
      CRT_syncEmployeeData_fn.dg
      CRT_validateLeaveRequest_fn.dg
    widgets/
      CRT_leaveCalendar_wgt/
        index.html
        app.js
        style.css
        config.json
  people/
    functions/
      PEO_calculateLeaveBalance_fn.dg
  sigma/
    widgets/
      SGM_contactCard_wgt/
        index.html
        app.js
        style.css
        config.json
  shared/
    constants.md    ← Master list of all org variables and constants across modules
    connections.md  ← Master list of all Zoho Connections and their scopes
  .gitignore
  CHANGELOG.md
```

### 5.2 File Naming for Deluge Code

Deluge functions are saved as `.dg` files. The filename must exactly match the Zoho function name:

```
CRM_getAccountContacts_fn.dg
PEO_calculateLeaveBalance_fn.dg
RCT_scoreApplicationProfile_fn.dg
```

### 5.3 Branch Naming Convention

| Type | Pattern | Example |
|---|---|---|
| New feature / new function | `feature/MODULE-short-description` | `feature/crm-lead-scoring-fn` |
| Bug fix | `fix/MODULE-short-description` | `fix/creator-leave-form-validation` |
| Improvement / refactor | `improve/MODULE-short-description` | `improve/people-attendance-sync-perf` |
| Security fix | `security/MODULE-short-description` | `security/sigma-widget-xss-fix` |
| Release preparation | `release/vMAJOR.MINOR.PATCH` | `release/v1.3.0` |
| Hotfix for production | `hotfix/MODULE-short-description` | `hotfix/crm-contact-null-error` |

### 5.4 Commit Message Format

```
[MODULE] type: short imperative description (max 72 chars)

Optional body: explain WHY the change was needed, not WHAT it does.
The diff shows what changed; the message explains the reasoning.

Relates to: TASK-1234 (Zoho Projects task ID if applicable)
```

| Type | Use For |
|---|---|
| `feat` | New function, new widget, new field, new workflow |
| `fix` | Bug fix in existing code |
| `refactor` | Code restructure with no behaviour change |
| `docs` | Comment updates, header block updates, README changes |
| `security` | Security fix — input validation, credential removal, scope reduction |
| `test` | Test scripts or test data (not production code) |
| `config` | Connection config, org variable, manifest change |

**Examples:**

```
[CRM] feat: add lead scoring custom function with weighted field algorithm

Implements CRM_calculateLeadScore_fn which calculates a 0-100 score
based on company size, industry, and engagement fields.
Replaces the manual scoring spreadsheet process.

Relates to: TASK-4521

[PEOPLE] fix: null check on attendance sync when biometric returns empty list

CRM_syncAttendanceFromBiometric_fn was crashing when the biometric API
returned an empty list during weekends. Added size() check before iteration.

Relates to: TASK-4789

[SIGMA] security: sanitise contact name before DOM insertion in contact card widget

innerHTML was being set directly from CRM API response — replaced with
textContent to prevent XSS if contact name contains script tags.

Relates to: TASK-4901
```

### 5.5 Credential Management

**Never commit credentials.** This is a zero-tolerance rule.

`.gitignore` must include:

```gitignore
# Environment and secrets
.env
.env.local
.env.*.local
*.secret
secrets.json
credentials.json

# Editor artefacts
.vscode/settings.json
*.DS_Store

# Build output
dist/
node_modules/
```

For local development of widget code that needs API credentials:

```bash
# .env (local only, never committed)
ZOHO_CLIENT_ID=1000.xxxxxxxxxxxxxxxxxxxxxxxxxxxx
ZOHO_CLIENT_SECRET=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
ZOHO_REDIRECT_URI=http://localhost:3000/callback
```

For Deluge functions, credentials are never in code — they live in Zoho Org Variables (accessible via `zoho.orgs.getOrgVariable("VARIABLE_NAME")`) or in Zoho Connections.

### 5.6 Tagging and Releases

Use semantic versioning for all releases. Tags are applied to the `main` branch after a release is merged.

```
v1.0.0   — Initial production release
v1.0.1   — Patch: bug fix
v1.1.0   — Minor: new function added, backward compatible
v2.0.0   — Major: breaking change to function signature or data structure
```

Tag creation:

```bash
git tag -a v1.2.0 -m "[CRM] Release v1.2.0: Lead scoring, account sync improvements"
git push origin v1.2.0
```

### 5.7 Pull Request Requirements

**All changes to production CRM, Creator, People, and Recruit functions require a pull request.**

Minimum PR requirements:

| Requirement | Detail |
|---|---|
| PR title | Must follow commit message format: `[MODULE] type: description` |
| Description | What changed, why it changed, link to Zoho Projects task |
| Test evidence | Screenshot or log showing the function was tested in sandbox/dev with expected output |
| Security check | Confirm S-01 through S-03 from Section 4 were manually verified |
| Reviewer | Minimum 1 approver — India Lead or Japan counterpart (per change management policy) |
| Branch | Must not be committing directly to `main` — PR from feature/fix branch only |

---

## 6. Change Management

### 6.1 Mini-CAB (Change Advisory Board)

All production changes to any Zoho module must be reviewed by the mini-CAB before deployment. The mini-CAB consists of:

- **India Lead** (primary approver for India-region Zoho configuration)
- **Japan Counterpart** (co-approver — required for changes affecting CRM, People, or any shared module)

**Exceptions** (mini-CAB not required, but must still be logged):
- Cosmetic-only changes (label text, field display order) with no logic or data impact
- Sandbox-only changes

### 6.2 Change Process

```
1. Developer completes the change in sandbox/dev environment
2. Developer self-tests against acceptance criteria and captures evidence
3. Developer completes Security Checklist (Section 4) and confirms all applicable items
4. Developer raises a PR in Git with test evidence attached
5. India Lead reviews the PR — approves or requests changes
6. For changes affecting Japan region: Japan counterpart co-reviews and approves
7. India Lead deploys to production and confirms success in the PR comments
8. Developer logs the change in the module changelog comment in Zoho (see 6.3)
9. PR is merged to main and tagged if it constitutes a release
```

### 6.3 Module Changelog Comment in Zoho

Every production Deluge function must have its changelog maintained in the function header (the `Modified` lines in the header template). When a new version is deployed:

1. Add a `Modified` line to the function header comment with date, author, and reason
2. Update the Git repository with the new version of the `.dg` file
3. Commit with an appropriate message following Section 5.4 format

### 6.4 New Pattern Establishment

When a developer solves a problem in a novel way that should become the standard approach:

1. Document the pattern in the relevant standards document (this file or a module-specific doc)
2. Raise a PR for the standards document update — mini-CAB approval required
3. Notify all module owners that the standard has changed via the team channel
4. The new pattern applies to all new code from the merge date; existing code is migrated opportunistically during future changes

---

## Cross-References

This document establishes the foundation. Module-specific standards extend these rules — they never contradict them. Where a conflict appears, this document takes precedence.

- See [01_Zoho_Catalyst_Standards.md] for Catalyst-specific serverless function rules, Catalyst CLI usage, and data store patterns
- See [02_Zoho_Creator_Standards.md] for Creator form design, Deluge rules specific to Creator, and report configuration standards
- See [03_Zoho_Sigma_Standards.md] for Sigma extension manifest, CRM widget deployment, and extension review process
- See [04_Zoho_CRM_Standards.md] for CRM module configuration, custom field naming, blueprint design, and workflow trigger rules
- See [05_Zoho_People_Standards.md] for People HRMS configuration, leave policy scripting, attendance sync, and payroll integration rules
- See [06_Zoho_Recruit_Standards.md] for Recruit pipeline configuration, candidate scoring functions, and offer letter template standards
- See [07_Zoho_Forms_Standards.md] for Forms field validation, submission handling, webhook configuration, and spam prevention
- See [08_Zoho_Analytics_Standards.md] for Analytics SQL query standards, report design conventions, dashboard naming, and data model documentation

---

*End of 00 — Cross-Module Standards*

---

> **Document Control**  
> To propose a change to this document, raise a PR against the `Standards_and_BestPractises/` directory with your proposed edits and the label `standards-update`. Mini-CAB approval required before merge.
