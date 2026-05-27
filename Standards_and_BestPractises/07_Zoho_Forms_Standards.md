# 07 — Zoho Forms Standards & Best Practices

> **Scope:** This document covers standards for Zoho Forms — the standalone form builder used for web forms, surveys, and external/internal data collection. It applies to anyone creating, publishing, or integrating Zoho Forms within the FCI project ecosystem.
>
> **Cross-reference:** Read [00_Cross_Module_Standards.md] first — this document extends those rules with Forms-specific additions.

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

1. [Form Naming Conventions](#1-form-naming-conventions)
2. [Field Naming Conventions](#2-field-naming-conventions)
3. [Form Design Standards](#3-form-design-standards)
4. [Conditional Logic Standards](#4-conditional-logic-standards)
5. [Integration Standards](#5-integration-standards)
6. [Email Notification Standards](#6-email-notification-standards)
7. [Embed Standards](#7-embed-standards)
8. [Security Standards](#8-security-standards)
9. [Data Retention](#9-data-retention)

---

## 1. Form Naming Conventions

### 1.1 Standard Format

Format: `[Purpose]_[Audience]_[Version]`

| Form Name | Description |
|---|---|
| `ProjectFeedback_Client_v1` | Client feedback form for project delivery |
| `LeadCapture_Website_v2` | Website lead capture form, second major version |
| `SatisfactionSurvey_Japan_v1` | Satisfaction survey for Japan clients |
| `OnboardingChecklist_Employee_v1` | New employee onboarding form |
| `VendorEvaluation_Internal_v1` | Internal vendor evaluation form |
| `TrainingFeedback_Employee_v2` | Employee training feedback, updated version |

### 1.2 Prohibited Names

Never use generic or placeholder names:

| Prohibited | Use Instead |
|---|---|
| `Form1` | `ContactRequest_Website_v1` |
| `Test Form` | `[PurposeName]_TEST_v1` (for testing only, delete before go-live) |
| `New Form` | Name it before saving |
| `Copy of Form1` | Rename immediately after duplicating |
| `Untitled Form` | Always set name before publishing |

### 1.3 Version Incrementing Rule

- Increment version (`v1` → `v2`) when:
  - Fields are added or removed
  - Field types change
  - Integration logic changes (new destination, new field mapping)
  - Major redesign of form structure
- Do **not** increment for: label text corrections, tooltip updates, cosmetic CSS changes
- When creating a new version: duplicate the old form, rename with new version, update integrations to point to the new form

### 1.4 Language Variants

For bilingual forms, append the language code as a suffix:

| Form Name | Language |
|---|---|
| `SatisfactionSurvey_Japan_v1_JA` | Japanese version |
| `SatisfactionSurvey_Japan_v1_EN` | English version |

- Both language variants must be kept in sync structurally — same fields, same logic, different language labels
- Link both variants from the same WorkDrive folder

---

## 2. Field Naming Conventions

### 2.1 Field Labels

- Format: **Title Case**, clear noun phrases
- Use natural language — the submitter reads these labels
- Examples:

| Label | Notes |
|---|---|
| `Customer Name` | Not "custName" or "Name Field" |
| `Project Code` | Not "projCode" or "Code" |
| `Expected Delivery Date` | Not "EDD" or "Date" |
| `Are you a returning client?` | Question format for Yes/No fields |
| `Additional Comments` | Not "Other" or "Comments Field" |

### 2.2 Field Reference Names (for Integrations)

- Format: **snake_case**, matching the label meaning
- Set this before building any integration — changing it breaks the integration mapping

| Label | Reference Name |
|---|---|
| `Customer Name` | `customer_name` |
| `Project Code` | `project_code` |
| `Expected Delivery Date` | `expected_delivery_date` |
| `Are you a returning client?` | `is_returning_client` |
| `Additional Comments` | `additional_comments` |

> **Rule:** Reference names are set once. If a form is integrated with CRM, Creator, or a webhook, changing the reference name breaks the integration silently. Treat reference names as immutable after integration is activated.

### 2.3 Required Field Standards

- Mark fields as required in Zoho Forms settings using the native "Required" toggle
- For **public-facing forms**: append `(Required)` to the field label so submitters see it clearly without relying on the asterisk alone
  - Example: `Customer Name (Required)`
- For **internal forms**: the asterisk indicator is sufficient

### 2.4 Tooltip / Helper Text

- Add helper text for any field that could be misinterpreted, especially:
  - Date format expectations (`DD/MM/YYYY`)
  - Code fields (`Enter your 6-character project code, e.g., FCI-001`)
  - File upload fields (`PDF only, max 5 MB`)
  - Fields specific to Japan users (provide both English and Japanese in helper text)

---

## 3. Form Design Standards

### 3.1 Mandatory Elements for Every Form

Every published form must have all of the following configured before going live:

| Element | Requirement |
|---|---|
| Form title | Clear, matches the form name (human-readable) |
| Purpose description | Shown to the submitter — explains what the form is for and how the data will be used |
| Thank-you message | Shown after submission — confirms receipt and sets expectation for next steps |
| Owner | Name of the person responsible for this form (in form notes/description) |

**Example purpose description:**
> This form collects your feedback on the project delivery. Your responses will be reviewed by the FCI project manager within 3 business days. For urgent concerns, contact [email].

**Example thank-you message:**
> Thank you for your feedback. We have received your submission and will follow up within 3 business days.

### 3.2 Page and Section Structure

- Use **page titles** and **section headers** to group related fields:
  - `Personal Information` — name, email, contact
  - `Project Details` — project code, dates, scope
  - `Feedback / Responses` — survey questions
  - `Agreement / Consent` — data consent, signature

- **Maximum 10 fields per page** — if more are needed, split into multiple pages
- **Progress bar**: enable for all multi-page forms — submitters must know how long the form is

### 3.3 Page Naming in Multi-Page Forms

Format: Descriptive, Title Case

| Page | Name |
|---|---|
| Page 1 | `Your Information` |
| Page 2 | `Project Details` |
| Page 3 | `Your Feedback` |
| Page 4 | `Review & Submit` |

### 3.4 Form Notes Field

Use the internal form Notes field (not visible to submitters) to record:

```
Purpose      : [What this form collects and why]
Audience     : [Who fills this form]
Owner        : [Name, role]
Created      : [YYYY-MM-DD]
Last modified: [YYYY-MM-DD] by [Name] — [What changed]
Integration  : [Where submissions go — CRM module, Creator app, etc.]
Conditional  : [Summary of conditional logic rules]
```

---

## 4. Conditional Logic Standards

### 4.1 Condition Naming in Notes

Document every conditional logic rule in the form's Notes field using this format:

```
IF [TriggerField] = [Value] THEN show [TargetField]
IF [TriggerField] = [Value] THEN hide [TargetField]
IF [TriggerField] = [Value] THEN require [TargetField]
```

**Examples:**

```
IF is_returning_client = Yes THEN show previous_project_code
IF project_type = Implementation THEN show go_live_date
IF preferred_language = Japanese THEN show japanese_comments_field
IF has_complaint = Yes THEN require complaint_details AND show escalation_consent
```

### 4.2 Testing Conditional Paths

Before publishing any form with conditional logic:

1. Map all conditions in the Notes field first
2. Test every branch:
   - Condition is TRUE: verify target field appears/is required
   - Condition is FALSE: verify target field is hidden
   - Edge case: empty/null trigger field value
3. Test on mobile (forms are often filled on phones, especially in Japan)

### 4.3 Complexity Limit

- Maximum conditional nesting depth: **3 levels**
  - Level 1: `IF field_A = X THEN show field_B`
  - Level 2: `IF field_B = Y THEN show field_C`
  - Level 3: `IF field_C = Z THEN require field_D`
  - Level 4+: **Not permitted** — redesign the form instead

- If logic exceeds 3 levels: split the form into two separate forms with a routing mechanism, or use Zoho Creator for the data collection instead

---

## 5. Integration Standards

### 5.1 Integration Naming

Format: `FRM_[FormName]_To_[Destination]`

| Integration Name | Description |
|---|---|
| `FRM_LeadCapture_To_CRM` | Sends lead data to Zoho CRM Leads module |
| `FRM_Feedback_To_Creator` | Sends feedback submissions to Creator data store |
| `FRM_VendorEval_To_Sheet` | Sends vendor evaluation to Zoho Sheet |
| `FRM_SatisfactionSurvey_To_Analytics` | Sends survey data to Analytics workspace |

### 5.2 Integration Documentation Requirement

Every active integration must have a documentation record stored in WorkDrive:

```
WorkDrive → ProjectCode → Forms → Integrations → [IntegrationName]_Mapping_v[X].md
```

**Integration documentation template:**

```
Integration Name : FRM_LeadCapture_To_CRM
Form Version     : v2
Destination      : Zoho CRM → Leads module
Trigger          : On every form submission
Field Mapping    :
  customer_name         → Last Name
  company_name          → Company
  email_address         → Email
  project_interest      → Description
  preferred_contact_date → Lead Source (mapped to "Web Form - [Date]")
Created          : [YYYY-MM-DD] by [Name]
Last tested      : [YYYY-MM-DD] — result: [Pass/Fail + notes]
```

### 5.3 Testing Before Go-Live

Before activating any integration:

1. Submit one **test entry** with clearly fake data (`Test_Customer_DoNotProcess`)
2. Verify the record appears in the destination system with correct field values
3. Delete the test record from the destination
4. Document the test date and result in the integration mapping file

### 5.4 Webhook Integrations

- Before activating a webhook integration: validate the payload structure against the receiving endpoint's expected schema
- Use Zoho Forms' built-in webhook test functionality to inspect the payload
- Document the webhook endpoint URL and expected payload structure in WorkDrive
- Webhook endpoint changes: notify India Manager before modifying

---

## 6. Email Notification Standards

### 6.1 Notification Naming

Format: `[Form]_[Event]_[Recipient]`

| Notification Name | Trigger | Recipient |
|---|---|---|
| `LeadCapture_OnSubmit_SalesTeam` | Form submitted | Sales team email |
| `Feedback_OnSubmit_ProjectManager` | Form submitted | Project manager |
| `SatisfactionSurvey_OnSubmit_Submitter` | Form submitted | Auto-responder to submitter |
| `VendorEval_Completed_Management` | All evaluators submitted | Management team |

### 6.2 Auto-Responder Rule

Any form that collects contact information (email address field) must have an **auto-responder enabled**:

- Confirms the submission was received
- States when the submitter will hear back (set realistic expectations)
- Provides a fallback contact for urgent matters
- Must not contain raw data the submitter entered (avoids data leakage in email)

### 6.3 Japan-Facing Forms — Japanese Notifications Mandatory

For any form with `_Japan_` in its name or targeted at Japan-based users/clients:

- All notification emails (both to the team and auto-responder to submitter) must be in **Japanese**
- Use pre-approved translations — do not use machine translation without review
- Subject line in Japanese: confirm with Japan-side stakeholder before activating

**Example bilingual auto-responder:**

```
Subject: フィードバックを受け取りました / Feedback Received

[社員名] / [Customer Name] 様,

フィードバックをいただきありがとうございます。3営業日以内にご連絡いたします。
Thank you for your feedback. We will respond within 3 business days.

緊急のご用件は [contact@fci-india.com] までご連絡ください。
For urgent matters, contact [contact@fci-india.com].
```

### 6.4 From Address

- All automated notification emails must use a **role-based address**, not a personal address:
  - Correct: `noreply@fci-india.com`, `forms@fci-india.com`
  - Incorrect: `vivek@fci-india.com` (personal — changes break when person leaves)
- Configure custom from address in Zoho Forms email settings

---

## 7. Embed Standards

### 7.1 Embed Code Rule

- Use **only** Zoho Forms' provided embed snippet — do not modify the snippet's JavaScript
- Customizations allowed: container `div` styling (width, borders) via CSS wrapper
- Not allowed: modifying the iframe `src` URL, adding `onload` hacks, injecting JavaScript into the Zoho snippet

### 7.2 Browser Testing Before Launch

Before any form is embedded on a website or portal, test on:

| Browser | Minimum Version |
|---|---|
| Chrome | Latest stable |
| Firefox | Latest stable |
| Safari | Latest stable (critical for Japan users on Mac/iPhone) |
| Edge | Latest stable |
| Mobile Safari (iOS) | Latest stable |

Test checklist: form loads, all fields visible, submission works, thank-you page shows, notifications trigger.

### 7.3 HTTPS Requirement for PII

- Forms that collect **any personally identifiable information** (name, email, phone, address, ID numbers) must only be embedded on pages served over **HTTPS**
- Embedding a PII form on an HTTP page: not permitted, raises a security issue in code review

### 7.4 Custom URL Paths

If Zoho Forms allows a custom share URL path, use a meaningful path:

| Use | Not |
|---|---|
| `/feedback/project-delivery` | `/form/8a3f29bc-4e1d...` |
| `/leads/contact-us` | `/form/xyz123` |
| `/survey/japan-satisfaction` | `/s/abc` |

---

## 8. Security Standards

### 8.1 CAPTCHA

- **Mandatory** for all public-facing forms (forms accessible without authentication)
- Use Zoho's built-in CAPTCHA or reCAPTCHA integration
- Internal forms (behind Zoho login): CAPTCHA optional but recommended for high-value data forms

### 8.2 File Upload Field Restrictions

Any form with a file upload field must:

1. Explicitly **whitelist** allowed file types — do not leave the field open to all types
2. Permitted types for most forms: `PDF`, `JPG`, `JPEG`, `PNG`
3. Never permit: `.exe`, `.js`, `.sh`, `.bat`, `.zip` (unless explicitly required and approved by India Manager)
4. Set a **maximum file size** — default: 5 MB; document if a different limit is used
5. Validate uploads server-side (Zoho Forms does this natively — do not disable)

### 8.3 Financial Data Forms

Forms that collect financial information (invoice amounts, payment terms, bank details):

- Enable SSL encryption indicator in form settings
- Route submissions to a restricted destination — not a shared Zoho Sheet
- Notify India Manager on every submission (in addition to normal team notification)

### 8.4 Response Access Restrictions

In Zoho Forms settings → Responses:

- Restrict response view access to **named roles** (not "anyone in organization")
- External form submissions: responses visible to named team members only
- Never set response access to "Public"

### 8.5 Spam Filter

- Enable Zoho's built-in spam filter for all public-facing forms
- Review spam folder weekly for the first month after form launch — legitimate submissions sometimes get filtered
- If a known submission type is being falsely flagged, adjust the spam filter rules (document the change)

### 8.6 Cross-Reference

For the full security checklist applicable to all Zoho tools, see [00_Cross_Module_Standards.md#security-checklist].

---

## 9. Data Retention

### 9.1 Retention Period Definition

Every form must have its retention period defined in the form's Notes field before going live:

```
Data Retention: [X] months from submission date
Basis         : [SOW clause / legal requirement / business need]
Delete by     : [Manual / Auto-delete if configured]
Approved by   : [Name, YYYY-MM-DD]
```

### 9.2 Client-Submitted Data

- Default retention period: **12 months** from submission date (unless the project SOW specifies otherwise)
- SOW-specified retention: document the SOW clause reference in the form Notes field
- After retention period: bulk delete with India Manager approval (document date and approver in WorkDrive)

### 9.3 Employee-Submitted Data

- HR-related form submissions (leave requests, appraisal inputs): follow the same retention rules as Zoho People records
- Training/feedback submissions: retain for the duration of the project + 6 months

### 9.4 Bulk Deletion Process

1. Identify forms with expired retention periods (review quarterly)
2. Export a summary count (not the data itself) as a deletion record
3. Obtain India Manager written approval (Zoho Cliq or email — save the message)
4. Delete submissions in Zoho Forms → Responses → Bulk Delete
5. Record the deletion in WorkDrive: `ProjectCode/Forms/DataDeletionLog/[YYYY-MM]_DeletionLog.md`

---

*Document owner: India Manager — Systems & Forms*
*Last reviewed: 2026-05-25*
*Next review due: 2027-01-01*

---

## 📚 Source Classification

| Standard / Section | Source | Notes |
|---|---|---|
| Form naming: [Purpose]_[Audience]_[Version] | 🟢 FCI Internal | FCI naming convention |
| Integration naming: FRM_[FormName]_To_[Destination] | 🟢 FCI Internal | Part of FCI module prefix system |
| CAPTCHA required on all public-facing forms | 🔵 Zoho Official | Zoho Forms provides CAPTCHA as a built-in security feature; FCI mandates its use |
| FRM_ prefix | 🟢 FCI Internal | Part of FCI module prefix system |
| Field validation rules | 🟢 FCI Internal | FCI quality policy; Forms supports validation natively |
| Notification email naming | 🟢 FCI Internal | FCI convention for traceability |
| No PII collection without privacy notice | 🟢 FCI Internal | FCI GDPR/APPI compliance policy |
| Form versioning (_v1, _v2) | 🟢 FCI Internal | FCI document control standard |
