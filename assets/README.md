# Yolanda Gunter Ministries — June 2026 Prayer Focus Website

**5 AM Fire Prayer Focus: Recover. Produce. Build.**
Monthly ministry landing page | Version 1.0 | June 2026

---

## Project Overview

A fully accessible, responsive, one-page ministry website for the June 2026 Prayer Focus campaign. Built with semantic HTML5, vanilla CSS, and vanilla JavaScript — no frameworks, no build tools, no dependencies beyond Google Fonts.

Designed to:
- Meet WCAG 2.1 AA accessibility standards (JAWS, screen readers, keyboard navigation)
- Display correctly on desktop, tablet, and mobile
- Connect to a Supabase PostgreSQL database for sign-up form submissions
- Deploy as static files to DreamHost shared hosting

---

## Repository Structure

```
/
├── home_062026.html          # Main HTML page
├── css/
│   └── styles.css            # All styles — brand system, layout, components
├── js/
│   └── main.js               # Carousel, mobile nav, slide counter
├── images/
│   ├── yolandagunter_logo.png
│   ├── yolanda_headshot.jpg
│   ├── PRAYER FOCUS — JUNE 2026A.png
│   ├── PRAYER FOCUS — JUNE 2026B.png
│   ├── PRAYER FOCUS — JUNE 2026C.png
│   ├── PRAYER FOCUS — JUNE 2026D.png
│   ├── PRAYER FOCUS — JUNE 2026E.png
│   └── PRAYER FOCUS — JUNE 2026P.png
├── README.md                 # This file
└── SOP_Supabase_Form_to_Database.md  # Data collection setup guide
```

---

## Brand System

Defined as CSS custom properties in `css/styles.css`:

| Variable | Hex | Usage |
|---|---|---|
| `--color-purple` | `#740074` | Primary brand, CTAs, headings |
| `--color-mauve` | `#A16691` | Secondary accents, hover states |
| `--color-mint` | `#A2BFAF` | Eyebrows, rule lines, highlights |
| `--color-slate` | `#423E50` | Body text, footer, hero panel |
| `--color-bg` | `#F5F0E8` | Page background (soft beige) |

**Fonts:** Cormorant Garamond (display) · Inter (body) — loaded via Google Fonts

---

## Making Updates in VS Code

### Prerequisites
- VS Code installed
- GitHub Desktop installed and signed in
- Git Bash installed

### Workflow

**1. Open the project in VS Code**
- In GitHub Desktop, click **Open in Visual Studio Code**

**2. Make your edits**
- Content changes → edit `home_062026.html`
- Style changes → edit `css/styles.css`
- Behavior changes → edit `js/main.js`

**3. Preview your changes locally**
- Install the VS Code extension **Live Server** (by Ritwick Dey)
- Right-click `home_062026.html` → **Open with Live Server**
- Your browser will open and auto-refresh on every save

**4. Save and commit via GitHub Desktop**
- Switch to GitHub Desktop — changed files appear automatically
- Write a short commit message describing what you changed
  - Example: `Update hero body copy for Week 3`
  - Example: `Add new scripture card — Philippians 4:13`
- Click **Commit to main**
- Click **Push origin** to sync to GitHub

---

## Git Commit Message Convention

Keep commits short and descriptive. Use this format:

```
[Section] Brief description of change

Examples:
  Hero: Update CTA button text
  Scriptures: Add Romans 8:28 card
  CSS: Adjust mobile hero padding
  JS: Fix carousel dot state on mobile
  Images: Replace headshot with updated photo
```

---

## Deploying to DreamHost

After committing changes, upload updated files to DreamHost via File Manager.

### Server File Structure
```
yourdomain.com/          ← domain root on DreamHost
├── home_062026.html     ← upload here
├── css/
│   └── styles.css
├── js/
│   └── main.js
└── images/
    └── (all image files)
```

### Upload Steps
1. Go to [panel.dreamhost.com](https://panel.dreamhost.com) → sign in
2. **Manage Websites** → **Manage** → **File Manager**
3. Navigate to your domain root folder
4. Upload only the files you changed
5. Verify the live site in an incognito browser window after upload

> **Tip:** If the site looks unchanged after upload, force a hard refresh with `Ctrl+Shift+R` (Windows) or `Cmd+Shift+R` (Mac) to clear the browser cache.

---

## Sign-Up Form — Supabase Integration

The sign-up form currently submits to `action="#"` (placeholder).

To wire it to your Supabase PostgreSQL database, follow the full procedure in:
**`SOP_Supabase_Form_to_Database.md`**

Summary of steps:
1. Create a Supabase project at [supabase.com](https://supabase.com)
2. Run the `CREATE TABLE subscribers` SQL from the SOP
3. Copy your Project URL and anon key into `js/main.js`
4. Update the form `action` attribute and add the fetch script per the SOP

---

## Accessibility Features

- Skip-to-content link (first tab stop — for keyboard and screen reader users)
- `aria-live` region announces current carousel slide to screen readers
- All images have descriptive `alt` text
- Carousel pauses on hover, focus, and respects `prefers-reduced-motion`
- All YouVersion scripture links include `aria-label` noting they open in a new tab
- Form fields use `aria-required`, `aria-describedby`, and `role="alert"` for error messaging
- Full keyboard navigation: arrow keys advance carousel, Tab moves through all controls
- `forced-colors` media query supports Windows High Contrast mode

---

## Monthly Campaign Reuse

To reuse this template for future months:
1. Duplicate `home_062026.html` → rename (e.g., `home_072026.html`)
2. Swap out images in the `images/` folder (or create `images/july2026/`)
3. Update carousel `src` paths and `alt` text
4. Update hero copy, scripture cards, and section text
5. Create a new Supabase table per the SOP (`july2026_prayer_focus`)
6. Commit and deploy

---

## Contact & Ownership

**Ministry:** Yolanda Gunter Ministries
**Email:** yolandaegunter@gmail.com
**Repository owner:** Yolanda Gunter
**Maintained with:** VS Code + GitHub Desktop + Git Bash
