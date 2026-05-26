# Connections Setup Guide

**All Zoho Connections are created in Zoho Creator → Settings → Connections.**

---

## Overview

The scanner uses **8 connections** — 7 Zoho OAuth connections (one per module) and 1 Gemini API connection.

```
conn_zoho_crm         → Zoho CRM API v7
conn_zoho_people      → Zoho People API v2
conn_zoho_creator     → Zoho Creator API v2
conn_zoho_analytics   → Zoho Analytics API v2
conn_zoho_sigma       → Zoho Sigma API v1
conn_zoho_recruit     → Zoho Recruit API v2
conn_zoho_forms       → Zoho Forms API v1
conn_gemini_ai        → Google Gemini API (API Key)
```

---

## Step-by-Step: Creating a Zoho OAuth Connection

> Repeat this process for each of the 7 Zoho connections below.

1. In Zoho Creator, go to **Settings → Connections**
2. Click **Add Connection**
3. Select **Zoho OAuth** from the service list
4. Fill in:
   - **Connection Name:** exactly as shown below (case-sensitive)
   - **Scopes:** copy from the scopes column below
5. Click **Create and Connect**
6. Authorise with your Zoho Admin account in the popup
7. Verify: connection shows **Connected** status

---

## Connection 1 — Zoho CRM

```
Connection Name:  conn_zoho_crm
Service:          Zoho CRM
Auth Type:        Zoho OAuth
Scopes:
  ZohoCRM.settings.functions.READ
  ZohoCRM.settings.modules.READ
  ZohoCRM.settings.fields.READ
  ZohoCRM.settings.workflows.READ
  ZohoCRM.settings.blueprints.READ
  ZohoCRM.settings.pipeline.READ
```

**Tests after creation:**
```deluge
resp = invokeurl [url: "https://www.zohoapis.in/crm/v7/settings/functions" type: GET connection: "conn_zoho_crm"];
info resp.get("functions").size();
// Should print a number > 0 if CRM has custom functions
```

---

## Connection 2 — Zoho People

```
Connection Name:  conn_zoho_people
Service:          Zoho People
Auth Type:        Zoho OAuth
Scopes:
  ZOHOPEOPLE.custom.READ
  ZOHOPEOPLE.appraisal.READ
  ZOHOPEOPLE.leave.READ
```

**Test:**
```deluge
resp = invokeurl [url: "https://people.zoho.in/api/v2/customforms" type: GET connection: "conn_zoho_people"];
info resp;
```

---

## Connection 3 — Zoho Creator

```
Connection Name:  conn_zoho_creator
Service:          Zoho Creator
Auth Type:        Zoho OAuth
Scopes:
  ZohoCreator.meta.READ
  ZohoCreator.data.READ
```

**Test:**
```deluge
ownerName = zoho.orgs.getOrgVariable("ZOHO_CREATOR_OWNER");
appName   = zoho.orgs.getOrgVariable("ZOHO_CREATOR_APP_NAME");
resp = invokeurl [url: "https://creator.zoho.in/api/v2/" + ownerName + "/" + appName + "/form" type: GET connection: "conn_zoho_creator"];
info resp;
```

---

## Connection 4 — Zoho Analytics

```
Connection Name:  conn_zoho_analytics
Service:          Zoho Analytics
Auth Type:        Zoho OAuth
Scopes:
  ZohoAnalytics.metadata.READ
  ZohoAnalytics.data.READ
  ZohoAnalytics.modeling.READ
```

**Test:**
```deluge
orgId = zoho.orgs.getOrgVariable("ZOHO_ORG_ID");
resp  = invokeurl [url: "https://analyticsapi.zoho.in/restapi/v2/workspaces?orgId=" + orgId type: GET connection: "conn_zoho_analytics"];
info resp;
```

---

## Connection 5 — Zoho Sigma

```
Connection Name:  conn_zoho_sigma
Service:          Zoho Sigma
Auth Type:        Zoho OAuth
Scopes:
  ZohoSigma.extensions.READ
  ZohoSigma.marketplace.READ
```

**Test:**
```deluge
resp = invokeurl [url: "https://sigma.zoho.in/api/v1/extensions" type: GET connection: "conn_zoho_sigma"];
info resp;
```

---

## Connection 6 — Zoho Recruit

```
Connection Name:  conn_zoho_recruit
Service:          Zoho Recruit
Auth Type:        Zoho OAuth
Scopes:
  ZohoRecruit.settings.READ
  ZohoRecruit.modules.READ
```

**Test:**
```deluge
resp = invokeurl [url: "https://recruit.zoho.in/recruit/v2/settings/modules" type: GET connection: "conn_zoho_recruit"];
info resp;
```

---

## Connection 7 — Zoho Forms

```
Connection Name:  conn_zoho_forms
Service:          Zoho Forms
Auth Type:        Zoho OAuth
Scopes:
  ZohoForms.integration.READ
  ZohoForms.form.READ
```

**Test:**
```deluge
resp = invokeurl [url: "https://forms.zoho.in/api/v1/form" type: GET connection: "conn_zoho_forms"];
info resp;
```

---

## Connection 8 — Google Gemini AI (REST API Key)

> This connection uses **API Key auth** (not OAuth).

### Step 1 — Get a Gemini API Key
1. Go to [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Click **Create API Key**
3. Select a Google Cloud project (or create new)
4. Copy the key

### Step 2 — Enable web grounding
In Google Cloud Console:
- Enable **Generative Language API**
- Enable **Custom Search API** (for web grounding)

### Step 3 — Store the key in Creator
Run this once in a Creator function to encrypt and store:
```deluge
encryptedKey = zoho.encryption.encrypt("YOUR_GEMINI_API_KEY_HERE");
info encryptedKey;
// Copy the output and set it as GEMINI_API_KEY_ENC org variable
```

### Step 4 — Create the connection in Creator
```
Connection Name:  conn_gemini_ai
Service:          Custom REST API
Auth Type:        No Auth (key is appended as query param in the function)
Base URL:         https://generativelanguage.googleapis.com
```

> The Gemini API key is appended as `?key=...` in `CRT_GeminiScrapeZoho_fn` — decrypted at runtime from `GEMINI_API_KEY_ENC`.

### Step 5 — Test
```deluge
apiKey = zoho.encryption.decrypt(zoho.orgs.getOrgVariable("GEMINI_API_KEY_ENC"));
testUrl = "https://generativelanguage.googleapis.com/v1beta/models?key=" + apiKey;
resp = invokeurl [url: testUrl type: GET];
info resp.get("models").size();
// Should return a number > 0
```

---

## Troubleshooting Connections

| Issue | Cause | Fix |
|---|---|---|
| `INVALID_CODE` on OAuth | Auth popup was closed | Click Re-Authenticate on the connection |
| `INSUFFICIENT_SCOPE` | Missing OAuth scope | Delete connection; re-create with all required scopes |
| `401 Unauthorized` on invokeurl | Token expired | Re-authenticate the connection |
| `403 Forbidden` on CRM | API key doesn't have admin access | Use a CRM Admin user for authentication |
| `404 Not Found` on Analytics | Wrong org ID | Check `ZOHO_ORG_ID` org variable matches your org |
| Gemini returns `400 Bad Request` | Malformed prompt JSON | Check prompt escaping in `CRT_GeminiScrapeZoho_fn` |
| Gemini returns empty results | Web grounding not enabled | Enable in Google Cloud Console: Custom Search API |

---

## Connection Naming Convention

All connections follow the pattern: `conn_{service}_{module}` or `conn_{provider}_{purpose}`.

Never use generic names like `zoho_conn` or `api_connection` — this makes it impossible to identify which module is affected when a connection fails.

---

*See [setup-guide.md](setup-guide.md) for the full app build walkthrough.*
