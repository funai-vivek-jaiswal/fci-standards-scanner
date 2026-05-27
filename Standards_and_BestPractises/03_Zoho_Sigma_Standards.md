# 03 — Zoho Sigma Standards & Best Practices

> **Scope:** All Zoho extensions built or maintained by FCI India using the Zoho Sigma platform.
> **Related:** [00_Cross_Module_Standards.md](./00_Cross_Module_Standards.md) | [01_Deluge_Standards.md](./01_Deluge_Standards.md)
> **Owner:** FCI India Development Team
> **Last Updated:** 2026-05-25

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

1. [Extension Naming](#1-extension-naming)
2. [Manifest File Standards](#2-manifest-file-standards-pluginjson--extensionjson)
3. [Component Naming & Structure](#3-component-naming--structure)
4. [Deluge in Sigma](#4-deluge-in-sigma)
5. [Widget Standards in Sigma](#5-widget-standards-in-sigma)
6. [Connection Standards](#6-connection-standards)
7. [Settings Page Standards](#7-settings-page-standards)
8. [Extension Security](#8-extension-security)
9. [Error Handling in Extensions](#9-error-handling-in-extensions)
10. [Testing Before Publication](#10-testing-before-publication)
11. [Versioning & Changelog](#11-versioning--changelog)

---

## 1. Extension Naming

### 1.1 Unique Name (Technical Identifier)
- Use **lowercase with underscores** for the extension's unique/technical name.
- Must start with `fci_` prefix to namespace all FCI-built extensions.
- No spaces, no hyphens, no uppercase letters.
- Must be unique across all extensions the organisation publishes.

| Good | Bad |
|---|---|
| `fci_lead_scorer` | `FCI_LeadScorer` |
| `fci_hr_sync` | `fci-hr-sync` |
| `fci_invoice_automation` | `invoice_automation` |
| `fci_project_tracker_crm` | `fci_ext1` |

### 1.2 Display Name (User-Facing)
- Use **Title Case** for the display name — this is what users see in the Zoho Marketplace.
- Must clearly communicate the extension's purpose to a non-technical audience.
- Keep it concise — under 50 characters.

| Unique Name | Display Name |
|---|---|
| `fci_lead_scorer` | `FCI Lead Scorer` |
| `fci_hr_sync` | `FCI HR Sync` |
| `fci_invoice_automation` | `FCI Invoice Automation` |
| `fci_project_tracker_crm` | `FCI Project Tracker for CRM` |

### 1.3 Version Numbering
- All extensions follow **semantic versioning**: `MAJOR.MINOR.PATCH`

| Version Segment | When to Increment |
|---|---|
| **MAJOR** | Breaking change — existing configurations or data structures change incompatibly |
| **MINOR** | New backward-compatible feature added |
| **PATCH** | Backward-compatible bug fix or minor improvement |

**Rules:**
- Never publish a breaking change without incrementing the **major** version and documenting the migration steps in CHANGELOG.md.
- Start all new extensions at `1.0.0`.
- Do not use `0.x.x` in production — reach `1.0.0` before any production deployment.

---

## 2. Manifest File Standards (plugin.json / extension.json)

### 2.1 Required Fields
All of the following fields **must** be present and populated in the manifest file. No field may be left blank or set to a placeholder value before publication.

| Field | Requirement |
|---|---|
| `name` | Unique name (lowercase underscore, `fci_` prefixed) |
| `display_name` | Title Case display name |
| `version` | Semantic version string (e.g., `"1.0.0"`) |
| `description` | One clear sentence describing the extension's purpose |
| `author` | `"FCI India"` |
| `supported_editions` | Explicit list of Zoho editions supported |
| `components` | List of all widget/function components |
| `connections` | List of all connection names used by the extension |

### 2.2 Description Standard
- The description must be **one clear, self-contained sentence** that explains what the extension does and for whom.
- Avoid vague descriptions like "Enhances Zoho CRM" — be specific.

| Good | Bad |
|---|---|
| "Automatically scores CRM leads based on activity and profile data." | "Useful extension for CRM." |
| "Syncs employee records from Zoho People to the FCI HR Creator app daily." | "Syncs data." |
| "Displays a real-time project budget panel inside each CRM Deal record." | "Shows project info." |

### 2.3 Permission Minimisation
- Declare **only** the permissions the extension genuinely requires to function.
- Do not request broad/admin-level permissions to make development easier — request the minimum required scope.
- Each permission declared must be justifiable in the extension's documentation.

### 2.4 Icon Requirement
- All published extensions must include an icon:
  - Format: **PNG**
  - Size: **256 × 256 pixels**
  - Design: Clean, recognisable at small sizes, consistent with FCI branding.

### 2.5 Example manifest (plugin.json)
```json
{
  "name": "fci_lead_scorer",
  "display_name": "FCI Lead Scorer",
  "version": "1.0.0",
  "description": "Automatically scores CRM leads based on activity and profile data.",
  "author": "FCI India",
  "supported_editions": ["Enterprise", "Ultimate"],
  "components": [
    {
      "name": "lead-score-panel",
      "type": "widget",
      "location": "crm.leads.detail"
    }
  ],
  "connections": [
    "crm_connection"
  ],
  "permissions": [
    "ZohoCRM.leads.read",
    "ZohoCRM.activities.read"
  ]
}
```

---

## 3. Component Naming & Structure

### 3.1 Widget Component Naming
- Use **kebab-case** for all widget component names.
- Names must describe the component's function.
- Each widget component lives in its own dedicated subfolder.

| Good | Bad |
|---|---|
| `lead-score-panel` | `widget1` |
| `hr-sync-settings` | `HRSyncSettings` |
| `project-budget-display` | `budget` |
| `invoice-status-badge` | `myPanel` |

### 3.2 Function Naming
- Use **kebab-case** for function folder/component names.
- Function names must follow the verb-noun pattern.

| Good | Bad |
|---|---|
| `calculate-lead-score` | `func1` |
| `sync-employee-records` | `doSync` |
| `send-approval-notification` | `notification` |

### 3.3 Required Folder Structure
Every extension must conform to this directory structure:

```
extension-root/
  plugin.json               ← Manifest file
  CHANGELOG.md              ← Version history (required)
  README.md                 ← Extension documentation
  widgets/
    [widget-name]/
      index.html            ← Widget markup
      app.js                ← Widget JavaScript
      style.css             ← Widget styles
    [another-widget]/
      index.html
      app.js
      style.css
  functions/
    [function-name]/
      handler.js            ← Function entry point (or handler.dg for Deluge)
  settings/
    index.html              ← Settings page markup
    settings.js             ← Settings page logic
    settings.css            ← Settings page styles
  assets/
    icon.png                ← Extension icon (256×256)
    screenshots/            ← Marketplace screenshots (if applicable)
```

### 3.4 File Naming Within Components
- HTML files: `index.html` (entry point) — use descriptive names for additional pages.
- JavaScript files: `app.js` (main), additional files in camelCase: `dataService.js`, `uiHelpers.js`.
- CSS files: `style.css` (main), additional files in kebab-case: `responsive.css`, `theme-overrides.css`.

---

## 4. Deluge in Sigma

> For all foundational Deluge standards (variable naming, error handling, commenting, loops, etc.) refer to:
> **[00_Cross_Module_Standards.md — Deluge Scripting Standards](./00_Cross_Module_Standards.md#deluge-scripting-standards)**

### 4.1 Sigma-Specific: Connections for All API Calls
- **All external API calls from Deluge in Sigma must use the `connections` mechanism.**
- Never hardcode API keys, tokens, usernames, or passwords in Deluge functions.
- Never store credentials in extension settings that are accessible from front-end JS.

```deluge
// Correct: Using a named connection
response = invokeurl
[
  url : "https://api.example.com/v1/endpoint"
  type : GET
  connection: "my_connection_name"
];

// Also correct: POST with body
postBody = map();
postBody.put("event", "lead_scored");
postBody.put("lead_id", leadID);
postBody.put("score", calculatedScore);

response = invokeurl
[
  url : "https://api.example.com/v1/events"
  type : POST
  parameters : postBody.toString()
  connection: "my_connection_name"
];
```

**Never do this:**
```deluge
// WRONG — hardcoded credentials — never commit this
response = invokeurl
[
  url : "https://api.example.com/v1/endpoint"
  type : GET
  headers: {"Authorization": "Bearer sk_live_abc123xyz"}  // FORBIDDEN
];
```

### 4.2 Function Naming in Sigma
- Follow the same verb-noun pattern as the base Deluge standards.
- Within a Sigma extension, prefix function names with the extension's short identifier to avoid namespace collision.

| Pattern | Example |
|---|---|
| `[ExtShortCode]_[VerbNoun]` | `LeadScorer_CalculateScore` |
| `[ExtShortCode]_[VerbNoun]` | `HRSync_FetchEmployeeData` |
| `[ExtShortCode]_[VerbNoun]` | `InvoiceBot_SendReminder` |

### 4.3 Deluge Error Logging in Sigma
```deluge
// Standard error logging format for Sigma extensions
// Always include: extension name, function name, and the error detail
try
{
  response = invokeurl
  [
    url : apiEndpoint
    type : GET
    connection: "crm_connection"
  ];
  
  if(response.get("status") != "success")
  {
    info "ERROR in [fci_lead_scorer][LeadScorer_CalculateScore]: API returned non-success status — " + response.toString();
  }
}
catch (e)
{
  info "ERROR in [fci_lead_scorer][LeadScorer_CalculateScore]: Unhandled exception — " + e.toString();
}
```

### 4.4 Deluge Response Handling
- Always check the response code/status before using the response data.
- Define explicit handling for both success and failure paths.
- Return a structured response map from Deluge functions so the calling widget can handle outcomes consistently.

```deluge
// Standard pattern: return a result map from a Deluge function
resultMap = map();
resultMap.put("success", false);
resultMap.put("data", null);
resultMap.put("error", "");

response = invokeurl
[
  url : "https://api.example.com/leads/" + leadID
  type : GET
  connection: "crm_connection"
];

if(response != null && response.get("status") == "success")
{
  resultMap.put("success", true);
  resultMap.put("data", response.get("data"));
}
else
{
  errorMsg = "API call failed for lead " + leadID;
  resultMap.put("error", errorMsg);
  info "ERROR in [fci_lead_scorer][LeadScorer_FetchLeadData]: " + errorMsg + " — Response: " + response.toString();
}

return resultMap;
```

---

## 5. Widget Standards in Sigma

> For full JS/HTML/CSS rules, see: **[00_Cross_Module_Standards.md — Widget HTML/CSS/JS Standards](./00_Cross_Module_Standards.md#widget-htmlcssjs-standards)**

### 5.1 Sigma SDK Initialization
All Sigma widgets must initialize using the `ZOHO.embeddedApp` SDK before making any API calls or rendering entity-specific data.

```javascript
// Standard boilerplate for all Sigma extension widgets
ZOHO.embeddedApp.on("PageLoad", function(data) {
  // data contains context from the host Zoho app
  // e.g. data.EntityId — the ID of the CRM record the widget is loaded for
  const entityId = data.EntityId;
  const entityType = data.Entity;  // e.g. "Leads", "Contacts", "Deals"

  if (!entityId) {
    showEmptyState("No record context found.");
    return;
  }

  initializeWidget(entityId, entityType);
});

function initializeWidget(entityId, entityType) {
  showLoadingState();

  ZOHO.CRM.API.getRecord({
    Entity: entityType,
    RecordID: entityId
  }).then(function(response) {
    if (response.data && response.data.length > 0) {
      renderWidgetContent(response.data[0]);
    } else {
      showEmptyState("No data found for this record.");
    }
  }).catch(function(err) {
    handleError("Failed to load record data.", err);
  });
}
```

### 5.2 Required UI States
Every Sigma widget **must** implement and display all four of the following states:

| State | Trigger | UI Requirement |
|---|---|---|
| **Loading** | While awaiting API response | Spinner or skeleton placeholder — never show a blank screen |
| **Loaded / Success** | Data received successfully | Render the main widget content |
| **Empty** | API returned no data | User-friendly message explaining no data is available |
| **Error** | API call failed or threw an exception | User-friendly message; never show a raw stack trace or console error |

```javascript
function showLoadingState() {
  document.getElementById("widget-container").innerHTML =
    "<div class='loading-spinner'><p>Loading...</p></div>";
}

function showEmptyState(message) {
  document.getElementById("widget-container").innerHTML =
    "<div class='empty-state'><p>" + escapeHtml(message) + "</p></div>";
}

function handleError(userMessage, technicalError) {
  // Show user-friendly message in the UI
  document.getElementById("widget-container").innerHTML =
    "<div class='error-state'><p>" + escapeHtml(userMessage) + "</p>"
    + "<p>If this persists, please contact support.</p></div>";
  // Log technical detail to console only — not to the UI
  console.error("[fci_lead_scorer][lead-score-panel] Error:", technicalError);
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
```

### 5.3 Widget CSS Rules
- Use a **CSS class prefix** matching the widget name to avoid style bleed into the host Zoho app.
- Example prefix for `lead-score-panel`: `.lsp-` (e.g., `.lsp-container`, `.lsp-score-badge`).
- Never use `!important` unless overriding a confirmed Zoho host-app style conflict.
- Do not use inline styles for anything other than dynamically computed values (e.g., a width calculated in JS).

### 5.4 No Hardcoded API Tokens in Widget JS
- Widget JavaScript runs in the browser — it is inspectable by end users.
- **Never place API tokens, secrets, or credentials in widget JS files.**
- If the widget needs to call an external API directly, route the call through a Sigma Deluge function using a Connection, then call that function from the widget.

---

## 6. Connection Standards

### 6.1 One Connection Per External Service
- Create exactly one Connection per external service or API.
- Do not create multiple connections to the same service with different credentials — use a single connection and manage credential scope through that service's API.

### 6.2 Connection Naming
- Use **lowercase with underscores** for connection names.
- Names must clearly identify the target service and its purpose.

| Good | Bad |
|---|---|
| `sendgrid_email` | `conn1` |
| `slack_notifications` | `slackConn` |
| `aws_s3_documents` | `awsConnection` |
| `zoho_books_finance` | `books` |

### 6.3 Connection Documentation
Each connection must be documented in the extension's README.md with:

| Documentation Field | Example |
|---|---|
| **Service Name** | SendGrid |
| **Purpose** | Sends transactional emails for lead scoring notifications |
| **Auth Type** | API Key |
| **Rate Limit** | 100 requests/second (SendGrid free tier: 100/day) |
| **Failure Behavior** | Extension logs error and skips notification — does not fail the CRM save |
| **Connection Name in Sigma** | `sendgrid_email` |

### 6.4 Connection Testing Protocol
Before deploying a new connection to production:
1. Authenticate and test the connection in the **dev version** of the extension.
2. Verify the connection can successfully call the service's API.
3. Verify the connection handles auth expiry and token refresh correctly.
4. Test the **failure path** — confirm the extension behaves gracefully when the connection fails (network error, invalid token, rate limit exceeded).

---

## 7. Settings Page Standards

### 7.1 When a Settings Page Is Required
- Every extension that has **configurable behaviour** must have a settings page.
- Examples of configurable behaviour requiring a settings page:
  - Score thresholds or weights
  - Target email addresses for notifications
  - Toggle features on/off
  - API endpoint URLs (environment-specific)
  - Field mapping configurations

### 7.2 Design System Compliance
- Settings UI must use **Zoho Design System (ZDS)** components wherever available.
- Do not build custom inputs for standard patterns (text fields, dropdowns, checkboxes, toggles) — use ZDS equivalents.
- This ensures the settings page looks and behaves consistently with the Zoho app it is embedded in.

### 7.3 Settings Page Validation
- Validate all settings **before saving** — do not save invalid configurations silently.
- Each validation error must be displayed as a **clear, actionable message** adjacent to the field that caused the error.
- Example error messages:

| Bad Error Message | Good Error Message |
|---|---|
| "Invalid input" | "Score threshold must be a number between 0 and 100." |
| "Error" | "Notification email address is not in a valid format." |
| "Required" | "API Endpoint URL is required before saving." |

### 7.4 Settings Field Naming
- Follow the same field naming conventions as defined in [00_Cross_Module_Standards.md](./00_Cross_Module_Standards.md).
- API names for settings fields: `snake_case` (e.g., `score_threshold`, `notification_email`).

### 7.5 Default Values
- All settings fields must have sensible default values pre-populated on first install.
- The extension must function with default settings — a fresh install without any settings configuration should not throw errors.

### 7.6 Settings Security
- **Never** use the settings page to store API tokens or passwords — these belong in Connections.
- Settings data is readable by the installing admin — do not treat it as a secure secret store.

---

## 8. Extension Security

### 8.1 Minimum Permission Principle
- Request only the **permissions actually required** by the extension.
- During development, it is tempting to request broad permissions for convenience — this is not acceptable in a published extension.
- Each permission in the manifest must be traceable to a specific feature of the extension.

### 8.2 Admin Permission Restrictions
- Never request Admin-level permissions unless there is a documented, unavoidable requirement.
- If Admin permission is genuinely needed, document the justification in:
  - The extension's README.md
  - The marketplace listing description
  - The security review sign-off (see [Section 10](#10-testing-before-publication))

### 8.3 API Token Security
- All API tokens and service credentials must be managed through **Sigma Connections**.
- Tokens must never appear in:
  - Widget HTML or JS files
  - Deluge function code (hardcoded)
  - Extension settings page fields
  - CHANGELOG.md or README.md
  - Git commit history (run a secret scan before committing)

> See: **[00_Cross_Module_Standards.md — Security Checklist](./00_Cross_Module_Standards.md#security-checklist)**

### 8.4 Input Sanitisation in Widgets
- All user inputs captured in widget JS must be sanitised before use.
- All data rendered into the DOM from external sources must be HTML-escaped to prevent XSS.
- Never use `innerHTML` with unsanitised external data — use `textContent` for plain text, or sanitise with a trusted library for HTML rendering.

### 8.5 Sensitive Data in Logs
- Do not log PII (names, emails, phone numbers), financial amounts, or authentication data in `info` statements.
- Log only record IDs, entity types, and non-sensitive status codes.

---

## 9. Error Handling in Extensions

### 9.1 User-Facing Error Messages
- Widget UI must **always** show a user-friendly error message when something goes wrong.
- Error messages must:
  - Explain what happened in plain language.
  - Tell the user what they can do next (retry, contact support, etc.).
  - Never expose technical details, stack traces, or internal API responses to end users.

| Situation | User-Facing Message |
|---|---|
| Zoho CRM API unavailable | "Unable to load lead data. Please refresh or try again in a few minutes." |
| External API rate limit hit | "Data refresh is temporarily unavailable. Please try again shortly." |
| Settings not configured | "This extension requires configuration. Please visit Settings to set it up." |
| Record has no relevant data | "No score data available for this lead yet." |

### 9.2 Deluge Error Logging Format
```deluge
// Standard format for all error logs in Sigma extensions
info "ERROR in [extension_name][FunctionName]: " + errorDescription + " — Detail: " + e.toString();

// Examples:
info "ERROR in [fci_lead_scorer][LeadScorer_CalculateScore]: Score calculation failed for lead " + leadID + " — Detail: " + e.toString();
info "ERROR in [fci_hr_sync][HRSync_FetchEmployeeData]: API returned empty response for employee " + employeeID;
```

### 9.3 Graceful Degradation
- If the Zoho API or an external API is unavailable, the extension must:
  - Show an empty or error state in the widget (not a crash or blank screen).
  - Not block or interfere with the host Zoho app's native functionality.
  - Log the failure for diagnostics.
- The extension **must not** cause the host Zoho app (CRM, People, etc.) to malfunction if the extension itself encounters an error.

### 9.4 Retry Logic
- For transient errors (network timeout, temporary 5xx from external API), implement a simple retry with exponential backoff in Deluge before returning a failure.
- Limit retries to a maximum of **3 attempts** to avoid infinite loops or excessive API usage.

```deluge
maxRetries = 3;
attempt = 0;
success = false;

while(attempt < maxRetries && !success)
{
  attempt = attempt + 1;
  try
  {
    response = invokeurl
    [
      url : apiEndpoint
      type : GET
      connection: "external_api_connection"
    ];
    
    if(response != null && response.get("status") == "success")
    {
      success = true;
    }
    else
    {
      info "WARN in [fci_lead_scorer][LeadScorer_CalculateScore]: Attempt " + attempt + " failed — " + response.toString();
    }
  }
  catch (e)
  {
    info "ERROR in [fci_lead_scorer][LeadScorer_CalculateScore]: Exception on attempt " + attempt + " — " + e.toString();
  }
}

if(!success)
{
  info "ERROR in [fci_lead_scorer][LeadScorer_CalculateScore]: All " + maxRetries + " attempts failed for lead " + leadID;
}
```

---

## 10. Testing Before Publication

### 10.1 Edition Testing
- Test the extension on **all supported editions** declared in `supported_editions` within the manifest.
- Do not declare support for an edition that has not been tested.
- If testing access to an edition is not available, remove that edition from the manifest until it can be tested.

### 10.2 Permission Testing
- Install and test the extension with a **minimum-permission user account** — not an admin account.
- This catches permission errors that admins would silently bypass.
- All features must work correctly under the minimum permission level the extension requires.

### 10.3 State Testing Checklist
Before publication, the following scenarios must be tested and confirmed passing:

| Test Scenario | Pass Criteria |
|---|---|
| **Empty state** | No records exist for the entity — widget shows empty state message, not a crash |
| **No configuration** | Settings not yet configured — widget shows configuration prompt, not an error |
| **API unavailable** | External API or Zoho API returns error — widget shows error state, host app unaffected |
| **Normal operation** | Records exist, API available, settings configured — widget renders correctly |
| **Large data set** | Entity has many related records — widget loads without timeout, pagination works |
| **Minimum permissions** | Tested with non-admin user — all required features work, no unauthorised access |
| **Admin-only features** | If any features are admin-only, confirm non-admins see appropriate access restrictions |

### 10.4 Sign-Off Requirement
- All extensions must receive **India Manager sign-off** before being submitted to the Zoho Marketplace (public or private).
- The sign-off review must cover:
  - Feature completeness against the original requirement.
  - All test scenarios in Section 10.3 passing.
  - Security review (see [Section 8](#8-extension-security)).
  - CHANGELOG.md updated with the new version's changes.

### 10.5 Dev vs Production Extension
- Maintain separate **dev** and **production** versions of extensions during active development.
- Never test breaking changes on the production version.
- The dev version uses dev/sandbox Zoho credentials and connections.

---

## 11. Versioning & Changelog

### 11.1 Version Update Requirement
- **Every release** must update the version in `plugin.json` before publication.
- Never republish the same version with changed content — always increment the version.

### 11.2 Semantic Versioning Decision Guide

| Change Type | Version Bump | Example |
|---|---|---|
| New feature, backward-compatible | MINOR (`1.0.0` → `1.1.0`) | Added lead score threshold setting |
| Bug fix, backward-compatible | PATCH (`1.1.0` → `1.1.1`) | Fixed null error when account has no contacts |
| Breaking change (config format changed, data model changed) | MAJOR (`1.1.1` → `2.0.0`) | Redesigned settings schema — existing settings require re-entry |
| Multiple changes in one release | Highest applicable bump | If one change is MINOR and one is a PATCH, bump MINOR only |

### 11.3 CHANGELOG.md Format
Every extension repository must maintain a `CHANGELOG.md` file in the extension root. All releases must be logged before publication.

```markdown
# Changelog

All notable changes to this project will be documented in this file.
Format follows [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

## [Unreleased]
- Describe in-progress changes here

## [1.1.0] - 2026-05-01
### Added
- Lead score threshold setting on the settings page
- Support for scoring based on deal amount field

### Changed
- Score display now shows colour-coded badges (green/amber/red)

### Fixed
- Null pointer exception when account has no associated contacts

## [1.0.1] - 2026-03-15
### Fixed
- Widget failed to render on CRM Enterprise edition due to missing SDK initialisation

## [1.0.0] - 2026-02-01
### Added
- Initial release of FCI Lead Scorer extension
- Automatic lead scoring based on activity history
- Score panel widget for CRM Lead detail view
- Settings page for configuring scoring weights
```

### 11.4 Migration Notes for Breaking Changes
When a MAJOR version is released:
- Add a **`### Migration`** section to the CHANGELOG.md entry describing exactly what the installer must do to upgrade from the previous version.
- Notify existing users of the extension **before** publishing the breaking version.

```markdown
## [2.0.0] - 2026-06-01
### Changed
- Redesigned settings schema — all settings now use a nested JSON format

### Migration
- Existing installations must reconfigure all settings after upgrading.
- Old settings will not be automatically migrated.
- Refer to README.md Section 3 for the new settings structure.
```

### 11.5 Git Tagging
- Each published version must be tagged in the Git repository matching the version number.
- Tag format: `v[MAJOR].[MINOR].[PATCH]` — e.g., `v1.1.0`
- Tag message must match the CHANGELOG.md entry for that version.

---

*End of 03 — Zoho Sigma Standards & Best Practices*

---

## 📚 Source Classification

| Standard / Section | Source | Notes |
|---|---|---|
| Extension unique name format: `fci_[name]` lowercase underscore | 🟢 FCI Internal | FCI naming policy; Sigma requires unique names but no specific format mandated |
| plugin.json (manifest) structure | 🔵 Zoho Official | plugin.json is the official Sigma manifest format — help.zoho.com/portal/en/kb/sigma/ |
| Deluge in Sigma uses invokeurl with connection: parameter | 🔵 Zoho Official | Zoho Connections official mechanism for OAuth in extensions |
| Sigma Extension Gallery submission requirements | 🔵 Zoho Official | Zoho Marketplace / Sigma review process — marketplace.zoho.com |
| Semantic versioning (1.0.0) | 🟡 Community | Industry standard (semver.org); adopted by Zoho but not Sigma-specific |
| CHANGELOG.md format | 🟢 FCI Internal | FCI documentation standard |
| SGM_ function prefix | 🟢 FCI Internal | Part of FCI module prefix system — see 00_Cross_Module_Standards.md |
| Extension must not store credentials in widget code | 🔵 Zoho Official | Violates Zoho Marketplace security requirements |
| Correct Sigma documentation URL | 🔵 Zoho Official | **Verified URL:** https://help.zoho.com/portal/en/kb/sigma/ (previous URL zoho.com/sigma/help/ returns 404) |
