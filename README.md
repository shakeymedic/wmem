# EM Evidence website

Source for [emevidence.org](https://emevidence.org): a static site listing EM Evidence's clinical and educational tools, the archive of Evidence Rundown newsletters, and the newsletter sign-up form.

It is hosted on Netlify (project `wmem`) and deploys from the `main` branch of this repository. There is no framework or bundler; the pages are plain HTML, CSS and JavaScript.

## What's where

| File | What it does |
| --- | --- |
| `index.html` | The home page: latest newsletter, tools, archive and sign-up |
| `privacy.html`, `404.html` | Privacy notice and the "page not found" page |
| `tools.js` | The list of tools shown as cards (name, description, category, tags, URL, screenshot) |
| `updates.js` | The newsletter archive (the `updates` array) and the code that draws the archive sidebar |
| `app.js` | Search, filters, tool cards, the tool viewer and the "Latest newsletter" card |
| `subscribe.js` | Sign-up form; posts straight to Loops from the browser |
| `theme-init.js` | Applies dark mode before the page paints (saved choice, else the device setting) |
| `styles.css` | All styling |
| `sw.js`, `manifest.json` | Service worker and web app manifest |
| `icons/` | Logo, app icons and the link-preview image (`og-image.jpg`) |
| `fonts/`, `vendor/` | Self-hosted Inter font and Fuse.js search library |
| `robots.txt`, `sitemap.xml` | For search engines |
| `screenshots/` | Tool card images; see [screenshots/README.md](screenshots/README.md) for the file list |
| `newsletters/` | Reserved for on-site HTML versions of each issue; see [newsletters/README.md](newsletters/README.md) |
| `netlify/functions/loops-webhook.js` | Syncs Loops subscriber changes to the newsletter pipeline repo |
| `netlify.toml` | Build command, security and caching headers, and redirects (including the old wmebem domains) |
| `scripts/validate-updates.js` | Checks the newsletter archive before each deploy |
| `scripts/check-links.js` | Checks every tool and Drive link opens for the public; run weekly by `.github/workflows/check-links.yml` |
| `EMAIL_AUTOMATION_SETUP.md` | Older notes on the sign-up and email setup (may be out of date now Loops is used) |

## Adding a newsletter issue

The newsletter pipeline adds a new object to the top of the `updates` array in `updates.js`. To add one by hand, copy the newest entry and change it:

```js
{
  date: "9 Oct 2026",
  label: "EM Evidence Rundown — Issue 33",
  links: [
    { title: "EM Evidence Rundown — Issue 33", driveId: "<Google Drive file ID>", audioId: "<optional audio summary ID>" }
  ]
},
```

- Newest entries go at the top.
- The Drive file must be shared as "Anyone with the link can view".
- If an issue is re-uploaded, replace the `driveId` in the existing entry rather than adding a second entry.
- The "Latest newsletter" card shows the most recently dated link whose title contains "EM Evidence Rundown".

### The archive check

`node scripts/validate-updates.js` checks `updates.js` for missing titles or labels, labels that are only a date, unreadable dates, entries out of order, Drive IDs that are malformed or used twice, and two links for the same issue or month. Netlify runs it as the build command, so if it finds a problem the deploy fails and the live site stays as it was. The Netlify deploy log lists each problem.

## Adding a tool

Copy an existing object in `tools.js`, change its details, and add a screenshot to `screenshots/` with the file name you gave it. Cards without a screenshot show a blue fallback with the tool's icon.

- `category` must be one of `Bedside Aids`, `UHB Tools`, `Simulation`, `Education & Advisory` or `Journal Club`. `UHB Tools` is for tools specific to University Hospitals Birmingham sites (BHH, GHH, QEHB, Solihull).
- `isNew: true` also shows the tool in the Highlighted Apps row. Each tool should have only one entry.
- `openInNewTab: true` opens the tool in a new tab instead of the in-page viewer. Use it for tools that refuse to be framed, or that are hosted anywhere other than `*.netlify.app` (the site's security policy only allows those in the viewer).

### The link check

`node scripts/check-links.js` requests every tool URL and every Drive file as a member of the public would, and lists any that fail (a Drive file that isn't shared as "Anyone with the link" shows as 401). GitHub runs it every Monday; a failed run means a link needs fixing.

## Deploying

Push to `main`; Netlify builds and publishes automatically. To check the archive locally first, run `node scripts/validate-updates.js` (Node 18 or later).
