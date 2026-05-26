# 04 — Zoho CRM Standards & Best Practices

## 1. Module & Layout Naming

- Standard modules: use Zoho defaults (Leads, Contacts, Accounts, Deals)
- Custom modules: PascalCase — `ProjectDelivery`, `ClientFeedback`, `MaintenanceTicket`
- Layout naming: Purpose-based — `Enterprise_Client_Layout`, `SMB_Lead_Layout`, `Japan_Project_Layout`
- Never clone a layout without naming it distinctly — no "Copy of Standard Layout"

---

## 2. Field Naming Conventions (API Names Matter)

- API field names are permanent once created — choose carefully
- Convention: UPPER_SNAKE_CASE for API names — `Customer_Priority`, `Project_Code`, `Japan_Account_Flag`
- Display label: Title Case — `Customer Priority`, `Project Code`, `Japan Account Flag`
- Boolean fields: prefix `Is_` or `Has_` — `Is_VIP_Client`, `Has_Signed_NDA`
- Date fields: suffix `_Date` — `Contract_Start_Date`, `Expected_Close_Date`
- Lookup fields: `[TargetModule]_Name` or `[TargetModule]_ID` — `Account_Name`, `Owner_ID`
- Prefix field with module abbreviation for cross-module clarity: `CRM_Lead_Score`, `CRM_Onboard_Status`

### CRM Field Naming Reference

| Field Type | API Name Convention | Example             | Bad Example       |
|------------|---------------------|---------------------|-------------------|
| Text       | Module_Descriptor   | Lead_Source_Detail  | src_dtl, leadsrc  |
| Boolean    | Is_/Has_ prefix     | Is_Active_Client    | Active, flag1     |
| Date       | _Date suffix        | Contract_Start_Date | start, dt_start   |
| Number     | Descriptive         | Annual_Revenue_INR  | rev, amt          |
| Picklist   | Module_Field        | Deal_Stage_Reason   | reason, stage2    |
| Lookup     | Target_Field        | Account_Name        | acct, ref         |

---

## 3. Pipeline Standards

- Pipeline naming: `[Market]_[ProductLine]_Pipeline` — `Japan_SaaS_Pipeline`, `India_Services_Pipeline`
- Stage naming: clear action verbs or status nouns — `Requirement_Received`, `SOW_Sent`, `Under_Review`, `Won`, `Lost`
- Every pipeline must have: Probability % set per stage, Expected Revenue configured
- Win/Loss stages are mandatory in every pipeline
- Document pipeline stages in a comment on the pipeline — include stage criteria

---

## 4. Blueprint Standards

- Blueprint naming: `[Module]_[Process]_BP` — `Deal_Approval_BP`, `Lead_Qualification_BP`
- Every transition must have: transition name (clear action verb), owner (role, not individual), and at least one required field
- Transition naming: `[Action]_To_[NextState]` — `Submit_To_Review`, `Approve_To_Won`
- Before state and After state must be explicitly set
- Use "During transition" actions for notifications — not separate workflows (reduces conflict)
- Max blueprint states: 15 (above this, split the process into two blueprints)
- Always test blueprint with a test record before activating on production module

---

## 5. Cadence Standards

- Cadence naming: `[Audience]_[Goal]_[Channel]_Cadence` — `NewLead_WarmUp_Email_Cadence`, `Prospect_FollowUp_Mixed_Cadence`
- Every cadence must have: defined end condition (not open-ended loops), unsubscribe handled
- Email templates in cadences: follow email template naming — `[Cadence]_Step[N]_[Action]` — `NewLead_Step1_Introduction`
- Test cadences with internal test contact before activating on live data
- Maximum cadence steps: 10 per cadence — split to multiple if more needed
- Cadence owner: always a role, never a specific user (handles person leaving)

---

## 6. Workflow Automation Standards

- Workflow naming: `[Module]_[Trigger]_[Action]` — `Lead_OnCreate_AssignOwner`, `Deal_StageChange_NotifyManager`
- Triggers: must be documented in workflow description field
- Conditions: keep condition logic simple — max 5 AND/OR conditions per rule
- Actions: max 3 actions per workflow — split complex logic into Custom Function
- Avoid workflows triggering other workflows (cascades are hard to debug)
- Always test workflow with test record in sandbox before production

---

## 7. Layout Rules Standards

- Layout rule naming: `[Layout]_[Condition]_[Effect]` — `EnterpriseLayout_VIP_ShowPricing`, `LeadLayout_Japan_MandateProjectCode`
- Document the business reason in rule description — "Required by Japan team for all project-type leads"
- Avoid conflicting layout rules on same field — review before adding new rule
- Test rule with both true and false conditions before publishing

---

## 8. Custom Function Standards

- Custom Function naming: `[Module]_[Action]_fn` — `Lead_ScoreCalculation_fn`, `Deal_RevenueSync_fn`
- Every custom function must have the standard function header comment (see → [00_Cross_Module_Standards.md#function-header-comment-template])
- Functions invoked by workflow: must complete in under 15 seconds (Zoho timeout)
- Use `zoho.crm.searchRecords` instead of `getRecords` for filtered queries (performance)
- Batch record creation: use `zoho.crm.bulkCreateRecords` (up to 100 records per call)
- Never call custom function recursively
- Error handling: always use try-catch, log with context, notify if critical failure

```deluge
/*
 * Function  : Lead_ScoreCalculation_fn
 * Module    : CRM → Leads
 * Purpose   : Calculate and update lead score based on activity + profile completeness
 * Params    : leadId (String) - The CRM Lead record ID
 * Returns   : void (updates record directly)
 * Author    : [Name] | Created: 2026-05-25
 * Modified  : -
 */
void Lead_ScoreCalculation_fn(String leadId)
{
  try
  {
    leadRecord = zoho.crm.getRecordById("Leads", leadId);
    if(leadRecord == null)
    {
      info "[Lead_ScoreCalculation_fn] ERROR: Lead not found for ID: " + leadId;
      return;
    }

    score = 0;
    // Profile completeness scoring
    if(!leadRecord.get("Phone").isNull()) { score = score + 10; }
    if(!leadRecord.get("Company").isNull()) { score = score + 10; }

    // Update the lead
    updateMap = map();
    updateMap.put("Lead_Score", score);
    response = zoho.crm.updateRecord("Leads", leadId, updateMap);

    if(response.get("status") != "success")
    {
      info "[Lead_ScoreCalculation_fn] Update failed for leadId: " + leadId + " | Response: " + response.toString();
    }
  }
  catch(e)
  {
    info "[Lead_ScoreCalculation_fn] EXCEPTION for leadId: " + leadId + " | Error: " + e.toString();
  }
}
```

---

## 9. Standalone Function Standards

- Standalone Function naming: `[Domain]_[Action]_standalone` — `Revenue_MonthlySummary_standalone`, `Lead_BulkScore_standalone`
- Used for: scheduled tasks, external API triggers, bulk operations
- Must be idempotent — safe to run multiple times without side effects
- Input validation at start of every standalone function
- Must log start, progress, and completion with timestamps

---

## 10. CRM API Limits & Best Practices

### 10.1 Daily API Call Limits (approximate — verify current plan)

| Plan         | API Calls / Day       |
|--------------|-----------------------|
| Free         | 5,000                 |
| Standard     | Licenses × 250        |
| Professional | Licenses × 500        |
| Enterprise   | Licenses × 500        |
| Ultimate     | Licenses × 1,000      |

### 10.2 Per-Operation Limits

| Operation                              | Limit                              |
|----------------------------------------|------------------------------------|
| Records per Create/Update batch        | 100 records                        |
| Records per Search response            | 200 records                        |
| Records per getRecords call            | 200 records (use page parameter)   |
| Custom function execution timeout      | 15 seconds                         |
| Standalone function execution timeout  | 30 seconds                         |
| Blueprint transitions per record/day   | 50                                 |

### 10.3 API Field Name Rules

- Always use API field names (not display labels) in Deluge code
- Field API names are case-sensitive in REST API calls
- Get correct field API name from: CRM → Settings → Modules → [Module] → Fields
- Test fields with a single-record API call before bulk operations
- Keep a field name reference sheet per module (store in WorkDrive under project docs)

### 10.4 API Call Patterns

```deluge
// GOOD: Search with criteria instead of getRecords full fetch
searchResults = zoho.crm.searchRecords("Leads", "Status:equals:Open");

// GOOD: Batch create (up to 100 at once)
recordList = list();
recordList.add(record1);
recordList.add(record2);
zoho.crm.bulkCreateRecords("Contacts", recordList);

// BAD: Calling API inside a loop (burns API quota)
for each contact in contactsList
{
  zoho.crm.updateRecord("Contacts", contact.get("id"), updateMap);  // DO NOT DO THIS
}
```

---

## 11. CRM Security Standards

- Field-level security: configure visibility per role for all sensitive fields
- Audit log: enable for all critical fields (Revenue, Stage, Owner)
- API access: create a dedicated API user (not a real user's credentials)
- Restrict IP for API user where possible
- Profile permissions review quarterly — remove ex-employee access immediately
- See → [00_Cross_Module_Standards.md#security-checklist]
