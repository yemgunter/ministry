# SOP: Website Form → Supabase PostgreSQL Database
**Yolanda Gunter Ministries — Standard Operating Procedure**
Version 1.0 | June 2026
Prepared by: Claude (Cowork) | Owner: Yolanda Gunter

---

## Purpose

This SOP defines the standard, repeatable route for connecting any ministry website sign-up or contact form to a secure, managed PostgreSQL database via Supabase. This route replaces third-party email marketing platforms (Mailchimp, Constant Contact) and gives the ministry full data ownership with zero monthly per-subscriber fees.

Use this document as the template every time a new form or campaign is launched.

---

## Platform Selection Criteria

Before selecting any database or backend platform, the chosen solution must satisfy all four criteria:

| Criterion | Requirement |
|---|---|
| Simplicity | Maintainable by a non-developer via a web portal |
| Security | Brute force protection built in at platform level |
| Accessibility | Login portal accessible from any browser, any device, anywhere |
| Data Ownership | Full export capability; no vendor lock-in |

**Approved Platform: Supabase** meets all four criteria:
- Web dashboard requires no SQL knowledge for viewing/exporting data
- fail2ban + Cloudflare CDN brute force protection on all logins
- Access via supabase.com from any device, any location
- PostgreSQL underneath — data fully exportable at any time as CSV or SQL dump

**Do not use** shared hosting (e.g., DreamHost shared/VPS plans) for PostgreSQL-backed forms. Those plans do not support PostgreSQL natively and require dedicated server upgrades that increase cost and complexity.

---

## System Architecture

```
Visitor fills out HTML form
        ↓
Form submits POST request (JavaScript fetch)
        ↓
Supabase REST API (auto-generated, no server needed)
        ↓
PostgreSQL table in Supabase project
        ↓
You log in at supabase.com → view Table Editor → manage subscribers
```

No server. No FastAPI. No deployment pipeline. One moving part.

---

## Phase 1: Supabase Account Setup

**Time required: 10–15 minutes | Do once per organization**

### Step 1.1 — Create Account
1. Go to [https://supabase.com](https://supabase.com)
2. Click **Start your project** → Sign up with Google or email
3. Use your ministry email address (`yolandaegunter@gmail.com` or a dedicated ministry address)
4. Verify your email

### Step 1.2 — Create a New Project
1. From the dashboard click **New Project**
2. Fill in:
   - **Organization:** Yolanda Gunter Ministries
   - **Project name:** e.g., `ministry-subscribers`
   - **Database password:** Use the auto-generated strong password — **save this in a password manager immediately**
   - **Region:** US East (N. Virginia) — closest to your location
3. Click **Create new project** — takes 1–2 minutes to provision

### Step 1.3 — Retrieve Your API Keys
1. In your project, go to **Project Settings → API**
2. Copy and save two values in your password manager:
   - **Project URL** — looks like `https://xyzabcdef.supabase.co`
   - **anon / public key** — a long string starting with `eyJ...`

> **Security note:** The `anon` key is safe to use in your HTML — it is read-restricted by Row Level Security (configured in Phase 2). Never use the `service_role` key in any public-facing file.

---

## Phase 2: Database Table Setup

**Time required: 5 minutes | Repeat for each new campaign**

### Step 2.1 — Open the SQL Editor
In your Supabase project, click **SQL Editor** in the left sidebar.

### Step 2.2 — Run the Table Creation Script

Paste and run the following SQL. Replace `subscribers` with a campaign-specific name if needed (e.g., `june2026_prayer_focus`).

```sql
-- Create subscribers table
CREATE TABLE subscribers (
  id           UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name         TEXT NOT NULL,
  email        TEXT NOT NULL UNIQUE,
  timezone     TEXT,
  sms_opt_in   BOOLEAN DEFAULT FALSE,
  source       TEXT DEFAULT 'website',   -- tracks which form/campaign
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

-- Prevent duplicate emails silently (upsert-safe)
CREATE UNIQUE INDEX idx_subscribers_email ON subscribers (email);

-- Enable Row Level Security
ALTER TABLE subscribers ENABLE ROW LEVEL SECURITY;

-- Allow anonymous inserts only (no reads from public)
CREATE POLICY "Allow public insert"
  ON subscribers
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Only authenticated users (you) can read/update/delete
CREATE POLICY "Allow authenticated read"
  ON subscribers
  FOR SELECT
  TO authenticated
  USING (true);
```

Click **Run**. You will see "Success. No rows returned."

### Step 2.3 — Verify the Table
1. Click **Table Editor** in the left sidebar
2. You should see your `subscribers` table listed
3. It will be empty — that is correct

---

## Phase 3: Wire the HTML Form

**Time required: 10 minutes | Repeat for each new form**

### Step 3.1 — Form HTML Requirements

Your HTML form must have:
- `id="signup-form"` on the `<form>` element
- Input fields with `name` attributes matching your table columns
- A visible success/error message element

Minimum required fields:
```html
<form id="signup-form" action="#" method="post" novalidate>
  <input type="text"  name="name"     id="signup-name"     required />
  <input type="email" name="email"    id="signup-email"    required />
  <select             name="timezone" id="signup-timezone"></select>
  <input type="checkbox" name="sms"   id="signup-sms"      value="yes" />
  <button type="submit">Sign Up</button>
  <p id="form-message" role="alert" aria-live="polite"></p>
</form>
```

### Step 3.2 — Add the Supabase Submission Script

Add the following `<script>` block just before `</body>`. Replace the two placeholder values with your actual Supabase credentials from Phase 1.

```html
<script>
  (function () {
    'use strict';

    // ── CONFIGURE THESE TWO VALUES ──────────────────────────────
    var SUPABASE_URL = 'https://YOUR_PROJECT_ID.supabase.co';
    var SUPABASE_ANON_KEY = 'YOUR_ANON_KEY';
    var TABLE_NAME = 'subscribers';          // match your table name
    // ────────────────────────────────────────────────────────────

    var form = document.getElementById('signup-form');
    var msg  = document.getElementById('form-message');

    if (!form) return;

    form.addEventListener('submit', function (e) {
      e.preventDefault();

      var submitBtn = form.querySelector('[type="submit"]');
      submitBtn.disabled = true;
      submitBtn.textContent = 'Submitting…';
      if (msg) { msg.textContent = ''; msg.style.color = ''; }

      var data = {
        name:       form.querySelector('[name="name"]').value.trim(),
        email:      form.querySelector('[name="email"]').value.trim().toLowerCase(),
        timezone:   form.querySelector('[name="timezone"]') ? form.querySelector('[name="timezone"]').value : null,
        sms_opt_in: form.querySelector('[name="sms"]') ? form.querySelector('[name="sms"]').checked : false,
        source:     'website'
      };

      // Basic client-side validation
      if (!data.name || !data.email) {
        showMessage('Please fill in your name and email.', 'error');
        submitBtn.disabled = false;
        submitBtn.textContent = 'Sign Up';
        return;
      }

      fetch(SUPABASE_URL + '/rest/v1/' + TABLE_NAME, {
        method: 'POST',
        headers: {
          'Content-Type':  'application/json',
          'apikey':        SUPABASE_ANON_KEY,
          'Authorization': 'Bearer ' + SUPABASE_ANON_KEY,
          'Prefer':        'return=minimal'
        },
        body: JSON.stringify(data)
      })
      .then(function (res) {
        if (res.ok || res.status === 201) {
          showMessage('You\'re in! Check your inbox for the Prayer Focus guide.', 'success');
          form.reset();
        } else if (res.status === 409) {
          // Duplicate email — unique constraint
          showMessage('This email is already registered. You\'re all set!', 'success');
        } else {
          return res.json().then(function (err) {
            throw new Error(err.message || 'Submission failed.');
          });
        }
      })
      .catch(function (err) {
        console.error('Form error:', err);
        showMessage('Something went wrong. Please try again or contact us directly.', 'error');
      })
      .finally(function () {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Sign Up';
      });
    });

    function showMessage(text, type) {
      if (!msg) return;
      msg.textContent = text;
      msg.style.color = type === 'error' ? '#cc0000' : '#006600';
    }

  }());
</script>
```

### Step 3.3 — Test the Form
1. Open the HTML file in a browser
2. Fill out and submit the form
3. Go to Supabase → **Table Editor → subscribers**
4. You should see your test row appear
5. Delete the test row after confirming it works

---

## Phase 4: Security Checklist

Run through this checklist before any form goes live:

- [ ] `anon` key used in HTML — never `service_role` key
- [ ] Row Level Security (RLS) enabled on the table (Step 2.2)
- [ ] INSERT-only policy for `anon` role — no public reads
- [ ] Supabase account protected with a strong password (saved in password manager)
- [ ] Supabase account 2FA (two-factor authentication) enabled
  - Go to: Account → Security → Enable Two-Factor Authentication
- [ ] Form has client-side validation (name and email required before submission)
- [ ] Duplicate email handled gracefully (409 response → friendly message)
- [ ] Test submission deleted from table after QA

---

## Phase 5: Ongoing Maintenance

### Viewing Your Subscriber List
1. Go to [https://supabase.com](https://supabase.com) → sign in
2. Select your project
3. Click **Table Editor** → select your table
4. Filter, sort, or search as needed — functions like a spreadsheet

### Exporting Data (e.g., for a mailing or event)
1. Table Editor → select table
2. Click the **export** icon (top right of table) → Download as CSV
3. Open in Excel or Google Sheets

### Adding a New Campaign Table
Repeat Phase 2 with a new table name (e.g., `july2026_fast_focus`). Use the same `source` column to distinguish sign-ups if you use one shared table instead.

### Backing Up Data
Supabase includes automated daily backups on paid plans. On the free plan:
- Export your table as CSV monthly (10 minutes)
- Store the CSV in your **June 2026** ministry folder

### When Something Breaks
| Symptom | Likely Cause | Fix |
|---|---|---|
| Form submits but no row appears | Wrong table name in script | Check `TABLE_NAME` variable |
| 401 error in browser console | Wrong or missing API key | Re-copy `anon` key from Supabase settings |
| 409 error shown to user | Duplicate email | Expected behavior — message shown |
| Form shows error on every submit | RLS policy missing | Re-run the policy SQL from Step 2.2 |

---

## Reuse Checklist — New Campaign Setup

Use this checklist each time you launch a new form:

- [ ] Supabase project exists (create once — reuse forever)
- [ ] New table created with campaign-specific name
- [ ] RLS enabled and INSERT policy applied
- [ ] HTML form has correct `id` and `name` attributes
- [ ] Script added with correct `SUPABASE_URL`, `SUPABASE_ANON_KEY`, and `TABLE_NAME`
- [ ] Test submission verified in Table Editor
- [ ] Test row deleted
- [ ] Security checklist completed
- [ ] Form is live

---

## Reference: Table Schema Template

```sql
CREATE TABLE [campaign_name] (
  id           UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name         TEXT NOT NULL,
  email        TEXT NOT NULL UNIQUE,
  timezone     TEXT,
  sms_opt_in   BOOLEAN DEFAULT FALSE,
  source       TEXT DEFAULT 'website',
  created_at   TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE [campaign_name] ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public insert" ON [campaign_name]
  FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Allow authenticated read" ON [campaign_name]
  FOR SELECT TO authenticated USING (true);
```

---

## Document Control

| Field | Value |
|---|---|
| Document Title | SOP: Website Form → Supabase PostgreSQL Database |
| Owner | Yolanda Gunter Ministries |
| Version | 1.0 |
| Created | June 2026 |
| Next Review | December 2026 |
| Tool | Supabase (supabase.com) |
| Database | PostgreSQL (managed) |
| Replaces | Mailchimp / Constant Contact form workflows |
