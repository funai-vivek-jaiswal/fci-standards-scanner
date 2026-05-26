# 06 — Zoho Recruit Standards & Best Practices

## 1. Module Naming Conventions

- Standard modules: use Zoho defaults (Job Openings, Candidates, Interviews, Offers)
- Custom module naming: PascalCase — `BackgroundCheck`, `OnboardingChecklist`
- Layout naming: role/department based — `Technical_Role_Layout`, `Japan_Hire_Layout`, `Management_Layout`

---

## 2. Field Naming Conventions

- Same conventions as CRM — see → [04_Zoho_CRM_Standards.md#field-naming-conventions-api-names-matter]
- Recruit-specific prefix: `RCT_` — `RCT_Notice_Period`, `RCT_Japan_Approval_Required`
- Picklist fields for stage: use exact stage names that match pipeline stages (no aliases)

---

## 3. Hiring Pipeline Standards

- Pipeline naming: `[Department]_[Level]_Pipeline` — `Engineering_Junior_Pipeline`, `Management_Director_Pipeline`, `Japan_Technical_Pipeline`
- Stage naming: clear and sequential —
  - `Application_Received`
  - `Resume_Screened`
  - `Phone_Screen_Scheduled`
  - `Technical_Interview_1`
  - `Technical_Interview_2`
  - `Manager_Interview`
  - `Offer_Preparation`
  - `Offer_Sent`
  - `Hired` / `Rejected` / `Withdrawn`
- Every pipeline must have a Rejected and Withdrawn terminal stage
- Stage progression must be linear (no backward jumps without supervisor override)
- Attach required fields to each stage transition (like Blueprint)

---

## 4. Workflow Standards

- Same naming pattern as CRM → `[Module]_[Trigger]_[Action]`
- Examples:
  - `Candidate_OnApply_AcknowledgeEmail`
  - `Interview_Scheduled_NotifyPanel`
  - `Offer_Accepted_TriggerOnboarding`
- Time-based workflows: `Candidate_3DaysNoUpdate_AlertRecruiter`

---

## 5. Custom Function Standards

- Follow all CRM custom function standards → [04_Zoho_CRM_Standards.md#custom-function-standards]
- Recruit-specific: function names prefix `RCT_` — `RCT_UpdateCandidateStatus_fn`, `RCT_SendOfferLetter_fn`
- Offer letter generation: always log the candidate ID and offer ID before sending
- Never auto-send offer letters without human review step in blueprint/workflow

---

## 6. Email Template Standards

- Template naming: `[Stage]_[Action]_[Audience]` — `Application_Acknowledge_Candidate`, `Interview_Confirm_Recruiter`, `Offer_Letter_Candidate`
- All candidate-facing templates: reviewed by India Manager before activation
- Japan-hire templates: bilingual (JA/EN) mandatory
- Templates must not contain salary details unless specifically an offer letter template

---

## 7. Interview & Assessment Standards

- Interview link naming: `[JobCode]_[Round]_[Date]` — `FCI-ENG-001_Round1_20260601`
- Assessment naming: `[Role]_[Skill]_Assessment` — `Frontend_React_Assessment`, `PM_ProjectPlanning_Assessment`
- Results logged in candidate record same day as interview
- No verbal decisions — all feedback submitted in Recruit within 24 hours

---

## 8. Candidate Data Privacy (Critical)

- Candidate PII: name, email, phone, DOB, ID numbers — access restricted to HR role only
- Resume files: stored in Recruit's document store, not emailed internally
- Rejected candidates: data retained per legal requirement (typically 6 months), then deleted
- Japan candidates: GDPR/APPI compliance — data handling per Japan HR policy
- Never export bulk candidate data without India Director approval
- See → [00_Cross_Module_Standards.md#security-checklist]

---

## 9. Report & Dashboard Standards

- Report naming: `[Module]_[Metric]_[Period]` — `Candidates_Pipeline_Monthly`, `JobOpenings_TurnAround_Quarterly`
- Dashboard: `[Audience]_Recruiting_Dashboard` — `Manager_Recruiting_Dashboard`, `Director_Hiring_Dashboard`

---

## 10. API & Integration Standards

- Same API limits as CRM — see → [04_Zoho_CRM_Standards.md#crm-api-limits--best-practices]
- Recruit API field names: verify in Recruit → Settings → Modules → Fields (different from CRM field names)
- Integration with People (onboarding): use Zoho Flow or a Catalyst function — document the integration in WorkDrive
