# EM Evidence website

Source for [emevidence.org](https://emevidence.org): a static site listing EM Evidence's clinical and educational tools, the archive of Evidence Rundown newsletters, and the newsletter sign-up form.

It is hosted on Netlify (project `wmem`) and deploys from the `main` branch of this repository. There is no framework or bundler; the pages are plain HTML, CSS and JavaScript.

## What's where

| File | What it does |
| --- | --- |
| `index.html` | The single page: tools, latest newsletter, archive and sign-up |
| `tools.js` | The list of tools shown as cards (name, description, category, tags, URL, screenshot) |
| `updates.js` | The newsletter archive (the `updates` array) and the code that draws the archive sidebar |
| `app.js` | Search, filters, tool cards and the "Latest newsletter" panel |
| `subscribe.js` | Sign-up form; posts straight to Loops from the browser |
| `styles.css` | All styling |
| `sw.js`, `manifest.json` | Service worker and web app manifest |
| `screenshots/` | Tool card images; see [screenshots/README.md](screenshots/README.md) for the file list |
| `newsletters/` | Reserved for on-site HTML versions of each issue; see [newsletters/README.md](newsletters/README.md) |
| `netlify/functions/` | `subscribe.js` (sign-up via the Loops API) and `loops-webhook.js` (syncs subscribers to the newsletter pipeline repo) |
| `netlify/edge-functions/subscribe.js` | An edge version of the sign-up function; not currently routed to any path (its EM list ID and Loops URL differ from `netlify/functions/subscribe.js`) |
| `scripts/validate-updates.js` | Checks the newsletter archive before each deploy |
| `EMAIL_AUTOMATION_SETUP.md` | How the sign-up emails, Loops and the subscriber sheet are set up |

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
- The "Latest newsletter" panel shows the newest link whose title contains "EM Evidence Rundown".

### The archive check

`node scripts/validate-updates.js` checks `updates.js` for missing titles or labels, labels that are only a date, unreadable dates, entries out of order, Drive IDs that are malformed or used twice, and two links for the same issue or month. Netlify runs it as the build command, so if it finds a problem the deploy fails and the live site stays as it was. The Netlify deploy log lists each problem.

## Adding a tool

Copy an existing object in `tools.js`, change its details, and add a screenshot to `screenshots/` with the file name you gave it. Cards without a screenshot show a blue fallback with the tool's icon.

## Deploying

Push to `main`; Netlify builds and publishes automatically. To check the archive locally first, run `node scripts/validate-updates.js` (Node 18 or later).
