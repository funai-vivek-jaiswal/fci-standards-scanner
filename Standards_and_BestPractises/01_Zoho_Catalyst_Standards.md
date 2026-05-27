# 01 — Zoho Catalyst Standards & Best Practices

> **Platform:** Zoho Catalyst — Full-Stack Serverless  
> **Applies to:** All Catalyst projects under FCI (Fun AI Consulting)  
> **Last updated:** 2026-05-25  
> **Status:** Active

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

1. [Project Naming & Structure](#1-project-naming--structure)
2. [Function Naming Conventions](#2-function-naming-conventions)
3. [Node.js Code Standards](#3-nodejs-code-standards)
4. [DataStore Standards](#4-datastore-standards)
5. [Environment Variables & Credentials](#5-environment-variables--credentials)
6. [Connector Standards](#6-connector-standards)
7. [Cron Job Standards](#7-cron-job-standards)
8. [Web Hosting Standards](#8-web-hosting-standards)
9. [Security Standards](#9-security-standards)
10. [Logging Standards](#10-logging-standards)
11. [Deployment Checklist](#11-deployment-checklist)

---

## 1. Project Naming & Structure

### 1.1 Project Naming Rules

| Rule | Detail |
|---|---|
| Case | PascalCase |
| Prefix | `FCI_` for all FCI-owned projects |
| Max length | 50 characters |
| Format | `FCI_<Domain><Purpose>` |

**Valid examples:**

- `FCI_CustomerPortal`
- `FCI_InternalTools`
- `FCI_HROnboarding`
- `FCI_PaymentGateway`

**Invalid examples:**

- `fci_customer_portal` — wrong case, wrong separator
- `FCICustPrtl` — unclear abbreviation
- `Customer Portal` — spaces not allowed
- `cp` — not descriptive

### 1.2 Standard Directory Structure

Every Catalyst project must follow this layout:

```
project-root/
  functions/
    customer-service/          # each function group has its own folder
      index.js
      package.json
    email-processor/
      index.js
      package.json
    payment-webhook/
      index.js
      package.json
  web/
    app/                       # hosted web app files (static only)
      index.html
      src/
        main.js
        styles.css
  catalyst-config.json         # Catalyst CLI config — committed to Git
  .env.development             # local dev secrets — NEVER committed
  .gitignore
  README.md                    # project-level readme: purpose, setup, owner
```

### 1.3 Function Group Organisation Rules

- Each function group is a separate folder under `functions/`
- Each function group has its own `package.json` — dependencies are scoped to the group
- Do not share `node_modules` across function groups
- One function group = one logical domain (e.g., all customer-related operations together)
- Keep function groups small: if a group exceeds 10 functions, split by subdomain

### 1.4 catalyst-config.json

The `catalyst-config.json` is committed to Git. It must contain:

```json
{
  "project": {
    "project_name": "FCI_CustomerPortal",
    "project_id": "<catalyst-project-id>"
  },
  "functions": [
    {
      "function_name": "customer-service",
      "lang_type": "Node",
      "memory": 256,
      "timeout": 30
    }
  ]
}
```

- `project_id` is not a secret — safe to commit
- Never commit API keys or credentials inside this file

---

## 2. Function Naming Conventions

### 2.1 General Rules

| Component | Convention | Example |
|---|---|---|
| Function name | kebab-case, verb-noun | `get-customer-details`, `process-payment-webhook` |
| Function group name | kebab-case noun | `customer-service`, `payment-processing` |
| Handler function (Node.js) | always `handler` | `module.exports = async (context, basicIO) => {}` |
| Cron functions | prefix `cron-` | `cron-daily-report`, `cron-sync-crm` |
| Event listener functions | prefix `on-` | `on-datastore-insert`, `on-form-submit` |

### 2.2 Verb Conventions for Function Names

Use consistent verbs to signal intent:

| Verb | Use for |
|---|---|
| `get-` | Read / fetch a resource |
| `create-` | Insert a new resource |
| `update-` | Modify an existing resource |
| `delete-` | Remove a resource |
| `process-` | Handle a complex operation or webhook |
| `send-` | Dispatch a message, email, or notification |
| `sync-` | Synchronise data between systems |
| `validate-` | Check input or business rules |
| `cron-` | Scheduled background task |
| `on-` | Event-driven listener |

### 2.3 Naming Examples

**Valid:**

- `get-customer-details`
- `create-order-record`
- `process-payment-webhook`
- `send-welcome-email`
- `cron-daily-revenue-sync`
- `cron-hourly-lead-check`
- `on-datastore-insert`
- `on-form-submit`

**Invalid:**

- `customerDetails` — wrong case, missing verb
- `GetCustomer` — PascalCase not used for functions
- `func1` — not descriptive
- `daily_report` — underscores not used; missing `cron-` prefix for scheduled tasks

---

## 3. Node.js Code Standards

> Catalyst Cloud Functions support Node.js, Java, and Python. These standards cover **Node.js** (the primary language for FCI Catalyst projects). Deluge is **not used** in Catalyst functions.

### 3.1 File Structure Per Function

Every function file must follow this structure:

```javascript
'use strict';

const catalyst = require('zcatalyst-sdk-node');

// ─── Constants ────────────────────────────────────────────────────────────────
const TABLE_NAME = 'Customers';
const MAX_RECORDS = 500;
const SERVICE_NAME = 'customer-service';

// ─── Main Handler ─────────────────────────────────────────────────────────────
// Handler is always named `handler` and always async.
module.exports = async (context, basicIO) => {
  // implementation here
};
```

Rules:
- `'use strict';` is mandatory at the top of every file
- Import `zcatalyst-sdk-node` as `catalyst` (consistent alias)
- Constants declared at module level, not inside the handler
- The exported function is always named implicitly via `module.exports` — never use a named export
- The handler signature is always `(context, basicIO)`

### 3.2 Error Handling Pattern

All handlers must wrap their logic in try-catch:

```javascript
'use strict';

const catalyst = require('zcatalyst-sdk-node');

const FUNCTION_NAME = 'get-customer-details';

module.exports = async (context, basicIO) => {
  try {
    const app = catalyst.initialize(context);

    // Validate input early
    const customerId = basicIO.getParameter('customer_id');
    if (!customerId) {
      basicIO.send({ success: false, error: 'Missing required parameter: customer_id' });
      return;
    }

    // Core logic
    const datastore = app.datastore();
    const table = datastore.table('CustomerProfile');
    const rows = await table.queryTableRows()
      .max(1)
      .execute();

    basicIO.send({ success: true, data: rows });

  } catch (error) {
    // Log full error server-side — stack trace never sent to client
    console.error(JSON.stringify({
      level: 'error',
      fn: FUNCTION_NAME,
      msg: 'Unhandled exception',
      error: error.message,
      stack: error.stack
    }));

    // Send safe response to client — no stack trace
    basicIO.send({ success: false, error: 'An unexpected error occurred. Please contact support.' });
  }
};
```

Rules:
- Every `await` expression inside the handler is covered by a try-catch
- Never let an unhandled promise rejection propagate
- Stack traces are logged server-side only — never sent to the client
- Return early (using `return`) after sending an error response — do not let code continue

### 3.3 Variable and Constant Naming (Node.js)

| Pattern | Convention | Example |
|---|---|---|
| Variables | camelCase | `customerId`, `orderList`, `isActive` |
| Constants (module-level) | UPPER_SNAKE_CASE | `TABLE_NAME`, `MAX_RECORDS`, `API_BASE_URL` |
| Function names (internal) | camelCase | `fetchCustomerById`, `buildEmailPayload` |
| Parameters | camelCase | `context`, `basicIO`, `customerId` |

Additional rules:
- `const` and `let` only — `var` is forbidden
- Use `const` by default; only use `let` when the variable is reassigned
- Names must be descriptive — single-letter variables are only acceptable as loop counters (`i`, `j`) or in mathematical formulas
- Boolean variables: prefix `is`, `has`, `can`, `should` — e.g. `isActive`, `hasPermission`, `canDelete`

### 3.4 Async/Await Standards

- Always use `async/await` — callbacks and raw `.then()/.catch()` chains are forbidden
- Every `await` call must be inside a try-catch or a function that itself is wrapped in try-catch
- `Promise.all()` is acceptable for parallel operations, but must be wrapped in try-catch

```javascript
// CORRECT — parallel operations with error handling
try {
  const [customer, orders] = await Promise.all([
    fetchCustomer(customerId),
    fetchOrders(customerId)
  ]);
} catch (error) {
  // handle
}

// FORBIDDEN — raw .then() chains
fetchCustomer(id).then(data => { ... }).catch(err => { ... });

// FORBIDDEN — callbacks
someFunction(arg, (err, result) => { ... });

// FORBIDDEN — unhandled Promise.all
const results = await Promise.all([op1(), op2()]); // no try-catch
```

### 3.5 package.json Standards

```json
{
  "name": "customer-service",
  "version": "1.0.0",
  "description": "Customer-facing CRUD operations for FCI_CustomerPortal",
  "main": "index.js",
  "engines": {
    "node": ">=18.0.0"
  },
  "dependencies": {
    "zcatalyst-sdk-node": "1.1.0",
    "axios": "1.6.2"
  }
}
```

Rules:
- Dependencies must be pinned to exact versions in production (no `^` or `~`)
- Use `^` or `~` only in development/non-production projects
- `zcatalyst-sdk-node` must always be listed as a dependency (not devDependency)
- The `engines` field must specify the Node.js version being used
- The `description` field must explain what the function group does

### 3.6 Internal Helper Functions

For logic reused within a function group, extract to a `helpers/` subfolder:

```
customer-service/
  index.js
  helpers/
    validateInput.js
    buildResponse.js
  package.json
```

- Helper files use camelCase filenames
- Each helper file exports a single function or a set of related utilities
- Helpers must not import `zcatalyst-sdk-node` — pass the `app` instance as a parameter

---

## 4. DataStore Standards

### 4.1 Table Naming

| Rule | Detail |
|---|---|
| Case | PascalCase |
| Domain prefix | Required for cross-domain tables |
| Max length | 40 characters |
| Clarity | Full words — no single-letter abbreviations |

**Valid examples:**

- `CustomerProfile`
- `OrderHistory`
- `ProjectConfig`
- `HR_EmployeeRecord`
- `CRM_LeadActivity`
- `FIN_InvoiceRecord`

**Invalid examples:**

- `cust` — too abbreviated
- `customer_profile` — wrong case
- `TBL_CustomerProfile` — unnecessary `TBL_` prefix
- `C` — single letter

### 4.2 Column Naming

| Column type | Convention | Examples |
|---|---|---|
| General | snake_case | `customer_name`, `phone_number`, `region_code` |
| Boolean | prefix `is_`, `has_`, `can_` | `is_active`, `has_paid`, `can_edit`, `is_deleted` |
| Date/time | suffix `_date` or `_at` | `created_at`, `updated_date`, `deleted_at`, `last_login_date` |
| ID / primary key | suffix `_id` | `customer_id`, `project_id`, `record_id` |
| Foreign key | `<tablename>_id` | `order_customer_id`, `invoice_project_id` |
| Status fields | noun + `_status` | `payment_status`, `order_status` |

### 4.3 Standard Columns (Every Table Should Have)

Include these columns in every DataStore table:

| Column | Type | Purpose |
|---|---|---|
| `ROWID` | Auto (Catalyst default) | Primary key — provided by Catalyst automatically |
| `created_at` | DateTime | Record creation timestamp — set on insert, never changed |
| `updated_at` | DateTime | Last modified timestamp — updated on every write |
| `is_deleted` | Boolean | Soft delete flag — default `false` |
| `created_by` | String | User ID or function name that created the record |

### 4.4 Query Best Practices

**Always set row limits — never fetch unbounded results:**

```javascript
// CORRECT — bounded query with pagination
const datastore = app.datastore();
const table = datastore.table('CustomerProfile');
const PAGE_SIZE = 200;

const rows = await table.queryTableRows()
  .max(PAGE_SIZE)
  .offset(pageNumber * PAGE_SIZE)
  .execute();
```

```javascript
// FORBIDDEN — no row limit
const rows = await table.queryTableRows().execute();
```

**Pagination pattern for large datasets:**

```javascript
const PAGE_SIZE = 200;
let offset = 0;
let allRows = [];
let hasMore = true;

while (hasMore) {
  const page = await table.queryTableRows()
    .max(PAGE_SIZE)
    .offset(offset)
    .execute();

  allRows = allRows.concat(page);
  offset += PAGE_SIZE;
  hasMore = page.length === PAGE_SIZE;
}
```

### 4.5 Soft Delete Pattern

Never hard-delete production data without a backup strategy. Always use soft delete:

```javascript
// Soft delete — mark is_deleted = true, never physically remove
const updateData = {
  ROWID: rowId,
  is_deleted: true,
  deleted_at: new Date().toISOString(),
  deleted_by: context.userId || 'system'
};

await table.updateRow(updateData);
```

**All read queries must filter out soft-deleted records:**

```javascript
// Always exclude soft-deleted rows in normal queries
const rows = await table.queryTableRows()
  .max(200)
  .execute();

const activeRows = rows.filter(row => !row.is_deleted);
```

> Note: Catalyst DataStore does not natively support WHERE clauses in all SDK versions. Filter in application code when needed, or use Catalyst's ZCQL (Zoho Catalyst Query Language) for server-side filtering where available.

### 4.6 DataStore Performance Guidelines

- Index columns that are used in frequent filter/WHERE conditions — configure indexes in the Catalyst Console under DataStore settings
- Avoid storing large blobs (images, documents) in DataStore columns — use File Store instead and store the file reference URL
- Keep row payloads lean — store only structured data, not full HTML or large JSON strings
- If a table will exceed 100,000 rows, discuss archival and partitioning strategy with the India Manager before going live

---

## 5. Environment Variables & Credentials

### 5.1 The Golden Rule

> **NEVER hardcode API keys, passwords, tokens, or secrets in source code.**

This applies to all files: `.js`, `.json`, config files, README files, and comments. Violations must be treated as security incidents.

### 5.2 Production Secrets — Catalyst App Config

Store all production secrets in the Catalyst Console:

1. Navigate to: Catalyst Console → Project → App Config → Environment Variables
2. Add each secret as a key-value pair
3. Access in code via `process.env.VARIABLE_NAME`

```javascript
// CORRECT — reading from environment
const sendGridApiKey = process.env.SENDGRID_API_KEY;
const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
const crmApiBase = process.env.CRM_API_BASE_URL;

// FORBIDDEN — hardcoded secret
const sendGridApiKey = 'SG.abc123xyz...';
```

### 5.3 Environment Variable Naming

| Rule | Detail |
|---|---|
| Case | UPPER_SNAKE_CASE |
| Prefix by service | `SENDGRID_`, `STRIPE_`, `ZOHO_`, `AWS_` |
| Descriptive | Full name — no abbreviation |

**Examples:**

- `SENDGRID_API_KEY`
- `STRIPE_SECRET_KEY`
- `ZOHO_CRM_CLIENT_ID`
- `ZOHO_CRM_CLIENT_SECRET`
- `AWS_S3_BUCKET_NAME`
- `INTERNAL_NOTIFICATION_EMAIL`

### 5.4 Local Development — .env.development

For local testing with `catalyst serve`:

```
# .env.development
# Local development secrets — NEVER commit this file
SENDGRID_API_KEY=SG.test_key_here
STRIPE_SECRET_KEY=sk_test_...
CRM_API_BASE_URL=https://sandbox.zohocrm.com
```

This file must always be in `.gitignore`.

### 5.5 Required .gitignore Entries

Every Catalyst project must include this `.gitignore`:

```gitignore
# Secrets and environment files
.env
.env.*
.env.development
.env.production
.env.local

# Dependencies
node_modules/
*/node_modules/

# Logs
*.log
logs/

# Catalyst CLI cache
.catalyst/

# OS files
.DS_Store
Thumbs.db

# IDE files
.vscode/settings.json
.idea/
```

---

## 6. Connector Standards

Connectors are Catalyst's managed integration layer for calling external APIs. Use connectors instead of raw `axios`/`fetch` calls where the service is supported.

### 6.1 Connector Naming

| Rule | Detail |
|---|---|
| Prefix | `ext-` (for external service) |
| Case | lowercase kebab-case |
| Format | `ext-<servicename>` |

**Examples:**

- `ext-sendgrid`
- `ext-stripe`
- `ext-zoho-crm`
- `ext-twilio`
- `ext-aws-s3`

### 6.2 Connector Documentation Requirement

Every connector used in a project must be documented in the project's `README.md` with this table:

| Connector Name | Service | Purpose | Auth Method | Rate Limit | Catalyst Project |
|---|---|---|---|---|---|
| `ext-sendgrid` | SendGrid | Transactional email | API Key | 100 req/s | FCI_CustomerPortal |
| `ext-stripe` | Stripe | Payment processing | Secret Key | 100 req/s | FCI_CustomerPortal |

### 6.3 Connector Credential Rules

- Store connector credentials **only** in Catalyst Connector config (Catalyst Console → Connections)
- Never copy connector credentials into App Config environment variables (they are managed separately)
- Never reference connector auth tokens directly in code — always invoke through the Catalyst SDK connector interface

### 6.4 Connector Usage Pattern

```javascript
'use strict';

const catalyst = require('zcatalyst-sdk-node');

const FUNCTION_NAME = 'send-welcome-email';
const CONNECTOR_NAME = 'ext-sendgrid';

module.exports = async (context, basicIO) => {
  try {
    const app = catalyst.initialize(context);
    const connection = app.connection(CONNECTOR_NAME);

    const response = await connection.sendRequest({
      method: 'POST',
      url: 'https://api.sendgrid.com/v3/mail/send',
      headers: { 'Content-Type': 'application/json' },
      data: {
        to: [{ email: recipientEmail }],
        subject: 'Welcome to FCI Portal',
        content: [{ type: 'text/plain', value: 'Welcome!' }]
      }
    });

    basicIO.send({ success: true, data: response });

  } catch (error) {
    console.error(JSON.stringify({ level: 'error', fn: FUNCTION_NAME, msg: error.message }));
    basicIO.send({ success: false, error: 'Failed to send email.' });
  }
};
```

### 6.5 Connector Testing

- Always test a new connector in the **development** Catalyst project before adding it to production
- Validate auth, rate limits, and error responses in the dev environment
- Document any rate limit restrictions in the connector table (see 6.2)

---

## 7. Cron Job Standards

### 7.1 Naming Convention

Format: `cron-[frequency]-[action]`

| Frequency token | Meaning |
|---|---|
| `daily` | Runs once a day |
| `hourly` | Runs every hour |
| `weekly` | Runs once a week |
| `monthly` | Runs once a month |
| `minutely` | Runs every N minutes (use sparingly) |

**Examples:**

- `cron-daily-revenue-sync`
- `cron-hourly-lead-check`
- `cron-weekly-report-email`
- `cron-monthly-invoice-summary`

### 7.2 Execution Time Limit

Catalyst cron functions have a default execution timeout of **50 seconds**. Design all cron jobs to complete within this limit.

Strategies for staying within the limit:
- Process data in small batches — do not attempt to process all records in one run
- Use a "watermark" pattern: store the last processed record ID or timestamp in DataStore, and continue from there on the next run
- If processing truly requires more than 50 seconds, split into multiple cron jobs with staggered schedules

### 7.3 Cron Function Structure

Every cron function must follow this pattern:

```javascript
'use strict';

const catalyst = require('zcatalyst-sdk-node');

const CRON_NAME = 'cron-daily-revenue-sync';

module.exports = async (context, basicIO) => {
  const startTime = new Date().toISOString();

  console.log(JSON.stringify({
    level: 'info',
    fn: CRON_NAME,
    msg: 'Cron job started',
    startTime
  }));

  try {
    const app = catalyst.initialize(context);

    // ── Core logic here ──────────────────────────────────────────────────────
    // ... process data
    // ─────────────────────────────────────────────────────────────────────────

    const endTime = new Date().toISOString();
    console.log(JSON.stringify({
      level: 'info',
      fn: CRON_NAME,
      msg: 'Cron job completed successfully',
      startTime,
      endTime
    }));

    basicIO.send({ success: true });

  } catch (error) {
    console.error(JSON.stringify({
      level: 'error',
      fn: CRON_NAME,
      msg: 'Cron job failed',
      error: error.message,
      stack: error.stack
    }));

    // Send alert — never silently fail
    await sendCronFailureAlert(CRON_NAME, error);

    basicIO.send({ success: false, error: error.message });
  }
};
```

### 7.4 Idempotency Requirement

Every cron job must be **idempotent** — if it runs twice due to a retry or scheduling overlap, it must not create duplicate records, double-send emails, or double-process payments.

Techniques:
- Track processed items with a `is_synced` or `processed_at` flag in DataStore
- Use a unique key (e.g., order ID + date) to prevent duplicate inserts
- Check before acting: "has this already been processed today?"

```javascript
// Example: idempotent daily sync
const existingSync = await table.queryTableRows()
  .max(1)
  .execute();

const alreadySyncedToday = existingSync.some(row => {
  const syncDate = new Date(row.synced_at).toDateString();
  return syncDate === new Date().toDateString();
});

if (alreadySyncedToday) {
  console.log(JSON.stringify({ level: 'info', fn: CRON_NAME, msg: 'Already synced today — skipping' }));
  basicIO.send({ success: true, skipped: true });
  return;
}
```

### 7.5 Cron Failure Alerting

If a cron job fails, it must:
1. Log the full error (see Logging Standards)
2. Send an alert email to the India Manager (`j-vivek@funaiconsulting.in`)

Never fail silently. A cron job that stops working without an alert can go unnoticed for days.

```javascript
async function sendCronFailureAlert(cronName, error) {
  try {
    const app = catalyst.initialize(context); // pass context appropriately
    const mailer = app.email();
    await mailer.sendMail({
      to_address: process.env.ALERT_EMAIL_INDIA_MANAGER,
      subject: `[ALERT] Catalyst Cron Failed: ${cronName}`,
      content: `Cron job "${cronName}" failed at ${new Date().toISOString()}.\n\nError: ${error.message}`
    });
  } catch (alertError) {
    console.error(JSON.stringify({ level: 'error', fn: 'sendCronFailureAlert', msg: alertError.message }));
  }
}
```

Set `ALERT_EMAIL_INDIA_MANAGER` in Catalyst App Config (not hardcoded).

---

## 8. Web Hosting Standards

### 8.1 Static Files Only

Catalyst Web Hosting serves **static files only** — HTML, CSS, JavaScript, images, and fonts. There is no server-side rendering.

- Do not attempt to host Node.js Express apps or server-rendered pages on Catalyst Web Hosting
- All dynamic functionality must be implemented via Catalyst Cloud Functions (called via fetch/AJAX from the frontend)
- Single Page Applications (SPAs) are the recommended pattern

### 8.2 Directory Structure for Hosted Apps

```
web/
  app/
    index.html           # entry point
    404.html             # custom 404 page (required)
    src/
      js/
        main.js
        api.js           # all API call wrappers
      css/
        styles.css
      assets/
        images/
        fonts/
```

### 8.3 HTML/CSS/JS Standards

Refer to Widget Standards in the cross-module document for detailed HTML, CSS, and JavaScript coding standards.

→ [00_Cross_Module_Standards.md — Widget HTML / CSS / JS Standards]

### 8.4 Authentication

- Use **Catalyst SDK JS** (`catalyst-js-sdk`) for user authentication
- Do not implement custom JWT handling or session management — rely on Catalyst's built-in auth
- Protected pages must check authentication state before rendering content

```javascript
// Authentication check on page load
const catalystApp = window.catalyst.initialize();
const userManagement = catalystApp.userManagement();

userManagement.getLoggedInUser()
  .then(user => {
    if (!user) {
      window.location.href = '/login';
    }
  })
  .catch(() => {
    window.location.href = '/login';
  });
```

### 8.5 Domain Configuration

- Configure a **custom domain** for all production web apps — never ship a production app on the default `.catalystapps.com` domain
- SSL/HTTPS is mandatory for all production domains (Catalyst provides this via Let's Encrypt)
- Document the custom domain in the project README

### 8.6 DDoS Protection

- Enable Catalyst's built-in DDoS protection for all public-facing web apps
- Location: Catalyst Console → Web → Settings → DDoS Protection
- This is mandatory before going live

---

## 9. Security Standards

### 9.1 Function-Level Access Control

Every Catalyst function has a permission setting. Set it correctly:

| Permission Level | When to use |
|---|---|
| `Admin` | Internal automation, admin-only operations, no external access |
| `App User` | Functions called by authenticated portal users |
| `Public` | Functions callable without authentication (webhooks, public APIs) |

Rules:
- Default to `App User` or `Admin` — only use `Public` when explicitly required
- Public functions require strict input validation (see 9.2)
- Review and audit function permissions before every production deployment

### 9.2 Input Validation for Public Functions

All `Public`-permission functions must validate every input parameter before processing:

```javascript
function validateInput(params) {
  const errors = [];

  if (!params.customer_id || typeof params.customer_id !== 'string') {
    errors.push('customer_id is required and must be a string');
  }

  if (params.customer_id && params.customer_id.length > 50) {
    errors.push('customer_id must not exceed 50 characters');
  }

  if (!params.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(params.email)) {
    errors.push('email is required and must be a valid email address');
  }

  return errors;
}

module.exports = async (context, basicIO) => {
  try {
    const params = {
      customer_id: basicIO.getParameter('customer_id'),
      email: basicIO.getParameter('email')
    };

    const validationErrors = validateInput(params);
    if (validationErrors.length > 0) {
      basicIO.send({ success: false, errors: validationErrors });
      return;
    }

    // ... safe to proceed
  } catch (error) {
    // ...
  }
};
```

### 9.3 Response Security Rules

- Never return stack traces to the client — log them server-side only
- Never return database row internals (e.g., Catalyst internal fields) directly to clients — map to a safe response object
- Sanitise all string outputs to prevent XSS if content will be rendered as HTML

### 9.4 Row-Level Security

- Where DataStore tables store multi-tenant data (multiple customers' records), implement row-level checks in code
- Before returning any DataStore row, verify the requesting user owns or has permission to access that row
- Catalyst does not enforce row-level security automatically — this is the function's responsibility

```javascript
// Row-level security check
const row = await table.getRow(rowId);
const requestingUserId = context.userId;

if (row.owner_user_id !== requestingUserId) {
  basicIO.send({ success: false, error: 'Access denied.' });
  return;
}
```

### 9.5 VAPT Requirement

**Vulnerability Assessment and Penetration Testing (VAPT) is required** for any customer-facing Catalyst web app before it goes into production.

- Engage the VAPT team or a designated third-party tool
- Resolve all Critical and High severity findings before go-live
- Document VAPT completion date and findings summary in the project README

→ See security checklist: [00_Cross_Module_Standards.md — Security Checklist]

---

## 10. Logging Standards

### 10.1 Structured Logging Format

All log statements must use structured JSON format. Plain-text `console.log('something happened')` is not acceptable in production code.

```javascript
// CORRECT — structured log
console.log(JSON.stringify({
  level: 'info',
  fn: 'get-customer-details',
  msg: 'Customer record fetched successfully',
  customerId: customerId,
  rowCount: rows.length
}));

console.warn(JSON.stringify({
  level: 'warn',
  fn: 'process-payment-webhook',
  msg: 'Duplicate webhook received — skipping processing',
  webhookId: webhookId
}));

console.error(JSON.stringify({
  level: 'error',
  fn: 'send-welcome-email',
  msg: 'Email dispatch failed',
  error: error.message,
  stack: error.stack
}));

// FORBIDDEN — unstructured log
console.log('Customer fetched');
console.log('Error: ' + error.message);
```

### 10.2 Log Levels

| Level | console method | When to use |
|---|---|---|
| `info` | `console.log` | Normal successful operations, function entry/exit |
| `warn` | `console.warn` | Unexpected condition that was handled without failure (duplicate request, empty result where data was expected) |
| `error` | `console.error` | Failures, exceptions, unhandled conditions |

### 10.3 What to Log

**Log these events:**

- Function invocation start (for cron jobs and event listeners)
- Successful completion with key metrics (row count, items processed)
- Warnings: empty results, retries, skipped processing
- All errors with `error.message` and `error.stack`

**Do NOT log:**

- Customer names, emails, phone numbers, ID card numbers — PII in plain text
- Raw passwords, API keys, or tokens — even partially
- Full database rows that contain PII
- Verbose debug output in production (remove before deploying)

### 10.4 PII in Logs

If you need to identify a record in logs, log the record's internal ID (e.g., `ROWID` or `customer_id` from the database) — not the customer's personal details.

```javascript
// CORRECT — log the ID only
console.log(JSON.stringify({ level: 'info', fn: FUNCTION_NAME, msg: 'Processing customer', customerId: row.ROWID }));

// FORBIDDEN — PII in logs
console.log(JSON.stringify({ level: 'info', fn: FUNCTION_NAME, msg: 'Processing customer', name: row.customer_name, email: row.email }));
```

### 10.5 Viewing Logs

Catalyst function logs are available at:
Catalyst Console → Functions → [Function Name] → Logs

Logs are retained for a limited period (check current Catalyst plan). For long-term audit logging, write critical events to a DataStore audit table.

---

## 11. Deployment Checklist

Complete this checklist before every production deployment.

### 11.1 Code Readiness

- [ ] All `console.log` debug statements removed from code (only structured `info`/`warn`/`error` logs remain)
- [ ] No hardcoded API keys, passwords, or secrets anywhere in the codebase
- [ ] All `package.json` dependencies pinned to exact versions (no `^` or `~` for production)
- [ ] `'use strict';` present in every function file
- [ ] All functions use `async/await` with try-catch — no raw callbacks or unhandled promise chains
- [ ] Input validation implemented for all `Public`-permission functions

### 11.2 Configuration Readiness

- [ ] All required environment variables set in the production Catalyst project (App Config)
- [ ] All connectors configured in the production Catalyst project (not only in dev)
- [ ] Function permissions (Admin / App User / Public) reviewed and correctly set
- [ ] Function timeout values configured appropriately in `catalyst-config.json`
- [ ] Custom domain configured for web-hosted apps
- [ ] DDoS protection enabled for public web apps

### 11.3 Testing

- [ ] All changes tested in the development Catalyst project
- [ ] Cron jobs tested manually (triggered via Catalyst Console) in development
- [ ] Event listeners tested with test data
- [ ] Connector integrations verified in development
- [ ] VAPT completed (for customer-facing web apps)

### 11.4 Alerting & Monitoring

- [ ] Error notification email configured for all functions
- [ ] Cron failure alert email points to `ALERT_EMAIL_INDIA_MANAGER`
- [ ] `ALERT_EMAIL_INDIA_MANAGER` environment variable set in production

### 11.5 Git Commit Standards

All commits related to Catalyst must follow this commit message format:

```
[CAT] <type>: <short description>

<optional body>
```

| Type | Meaning |
|---|---|
| `feat` | New function, connector, cron job, or feature |
| `fix` | Bug fix |
| `refactor` | Code restructure without behaviour change |
| `config` | Configuration change (env vars, timeout, permissions) |
| `docs` | Documentation update |
| `chore` | Dependency updates, `.gitignore`, non-code changes |

**Examples:**

```
[CAT] feat: add get-customer-details function to customer-service group
[CAT] fix: handle empty result in cron-daily-revenue-sync
[CAT] config: pin axios to 1.6.2 in payment-processing package.json
[CAT] refactor: extract email builder to helpers/buildEmailPayload.js
```

---

## Appendix A — Quick Reference Cheat Sheet

| Item | Convention |
|---|---|
| Project name | `FCI_CustomerPortal` (PascalCase, FCI_ prefix) |
| Function name | `get-customer-details` (kebab-case, verb-noun) |
| Function group | `customer-service` (kebab-case noun) |
| Cron function | `cron-daily-revenue-sync` |
| Event listener | `on-datastore-insert` |
| Handler signature | `module.exports = async (context, basicIO) => {}` |
| Variable | `camelCase` |
| Constant | `UPPER_SNAKE_CASE` |
| DataStore table | `CustomerProfile` (PascalCase) |
| DataStore column | `snake_case` |
| Boolean column | `is_active`, `has_paid`, `can_edit` |
| Date column | `created_at`, `updated_date` |
| Connector name | `ext-sendgrid`, `ext-stripe` |
| Commit prefix | `[CAT] feat:`, `[CAT] fix:` |

---

## Appendix B — Catalyst Service Reference

| Service | SDK Access | Notes |
|---|---|---|
| DataStore | `app.datastore()` | NoSQL-like table storage |
| File Store | `app.filestore()` | Object/blob storage |
| Cache | `app.cache()` | Key-value cache |
| Email | `app.email()` | Catalyst managed email |
| Search | `app.search()` | Catalyst search index |
| Connector | `app.connection('name')` | External API integrations |
| User Management | `app.userManagement()` | Auth and user operations |
| Zia (ML) | `app.zia()` | ML/AI functions (OCR, sentiment, etc.) |

---

## Cross-Module References

→ Cross-module standards: [00_Cross_Module_Standards.md]  
→ Web app (HTML/JS/CSS): see Widget Standards in [00_Cross_Module_Standards.md]

---

## 📚 Source Classification

| Standard / Section | Source | Notes |
|---|---|---|
| Catalyst uses Node.js / Java / Python (not Deluge) | 🔵 Zoho Official | Catalyst serverless functions officially support Node.js, Java, Python — docs.catalyst.zoho.com/en/ |
| DataStore table naming — PascalCase | 🟢 FCI Internal | FCI convention; Catalyst does not mandate a naming style |
| DataStore column naming — snake_case | 🟡 Community | Aligns with SQL and Zoho API conventions; not formally mandated by Catalyst |
| Environment variables via Catalyst App Config | 🔵 Zoho Official | App Config is the official Catalyst mechanism for env vars — docs.catalyst.zoho.com/en/ |
| Cron job naming: cron-[frequency]-[action] | 🟢 FCI Internal | FCI naming convention; Catalyst has no naming requirement |
| Catalyst SDK usage (@zohocatalyst/datastore etc.) | 🔵 Zoho Official | Official Catalyst SDKs — docs.catalyst.zoho.com/en/ |
| catalyst.json configuration file | 🔵 Zoho Official | Official Catalyst project config file |
| Deployment via Catalyst CLI | 🔵 Zoho Official | Official deployment mechanism — docs.catalyst.zoho.com/en/ |
| Max function execution time | 🔴 Unverified | Stated as platform limit; verify at docs.catalyst.zoho.com/en/ — limits vary by Catalyst plan |
| No console.log in production | 🟢 FCI Internal | FCI security policy (log hygiene) |
