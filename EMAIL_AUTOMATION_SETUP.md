# EM Evidence — Email Automation Setup Guide

## Architecture Overview

The email system has two independent parts:

| Part | What it does | How it works |
|------|-------------|--------------|
| **Signup** | Adds subscribers to Loops.so mailing lists | Client-side `subscribe.js` posts to Loops public form endpoint |
| **Sending** | Creates and sends newsletter campaigns via Loops API | GitHub Actions runs `scripts/send-newsletter.mjs` on schedule and on push |

```
┌─────────────────────────────────────────────────────────────────┐
│  WEBSITE (emevidence.org)                                       │
│                                                                 │
│  User fills form → subscribe.js → Loops.so API (add to lists)  │
│                                                                 │
├─────────────────────────────────────────────────────────────────┤
│  GITHUB ACTIONS (this repo)                                    │
│                                                                 │
│  Schedule/push → send-newsletter.mjs → Loops Campaign API     │
│  1. Reads updates.js for new newsletter issues                  │
│  2. Creates a Loops campaign (draft)                           │
│  3. Sets email content (LMX) with Drive PDF link               │
│  4. Sends campaign to the matching mailing list                 │
│  5. Records sent state in state/sent-newsletters.json          │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## Mailing Lists (Loops.so)

| List name | Loops List ID | Newsletter type |
|-----------|---------------|-----------------|
| Weekly EM Evidence Updates | `cmpy5zd8u04zv0j1a9ame4p3l` | EM Evidence Rundown (weekly) |
| Monthly PHEM Evidence Updates | `cmpy60jzs05gt0jzi26tj1acx` | PHEM Evidence Rundown (monthly) |
| Monthly Anaesthetics and ICM Evidence Updates | `cmpy6170t05ob0j0cfkut3vio` | Anaesthetics & ICU Evidence Rundown (monthly) |
| Website Updates | `cmpy61pvr05uz0j0efg7c20v5` | Site changes and new tools |

---

## Part 1: Signup (already configured)

The signup form on `emevidence.org/#newsletter` posts directly to the Loops.so public form endpoint from the browser via `subscribe.js`. No server-side function is needed for this — Loops handles the contact creation and list subscription.

### How it works

1. User enters email and checks preference boxes
2. `subscribe.js` validates the input (email format, at least one checkbox, honeypot check)
3. Posts to `https://app.loops.so/api/newsletter-form/cmpy4nf4l2e3d0j1bio5c5g9z` with the selected mailing list IDs
4. Loops creates the contact and adds them to the selected lists
5. Success banner shows on the website

### Welcome email

The welcome email is sent via a Loops transactional email (ID: `cmpy5ftku03bf0jykghy0jz0f`). This is configured in Loops's visual editor — to edit the welcome email content, go to [app.loops.so](https://app.loops.so) → Transactional → find the welcome email.

---

## Part 2: Automated Newsletter Sending

### Step 1: Get a Loops API Key

1. Go to [app.loops.so → Settings → API](https://app.loops.so/settings?page=api)
2. Click **Generate API key**
3. Copy the key (shown once — save it)
4. Make sure **Content API** is enabled for your account (contact Loops support if you don't see the Content API endpoints)

### Step 2: Add the API Key to GitHub Secrets

1. Go to your GitHub repo: [github.com/shakeymedic/wmem](https://github.com/shakeymedic/wmem)
2. Click **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**
4. Name: `LOOPS_API_KEY`
5. Value: *(paste your Loops API key)*
6. Click **Add secret**

### Step 3: How the automation works

The GitHub Actions workflow (`.github/workflows/send-newsletters.yml`) runs automatically:

| Trigger | When | What it does |
|---------|------|--------------|
| **Push to main** | When `updates.js` is changed | Checks for new newsletter entries and sends them immediately |
| **Weekly schedule** | Every Monday at ~8am UK time | Sends any new EM Evidence Rundown issues |
| **Monthly schedule** | 1st of each month at ~8am UK time | Sends any new PHEM and Anaesthetics issues |
| **Manual dispatch** | When you trigger it from GitHub UI | Sends a specific type or all, with optional dry-run |

### Step 4: Publishing a new newsletter

When you have a new newsletter PDF ready:

1. Upload the PDF to Google Drive
2. Set sharing to **Anyone with the link can view**
3. Copy the file ID from the URL (the long string between `/d/` and `/view`)
4. Add a new entry to the **top** of the `updates` array in `updates.js`:

```javascript
{
    date: "2026-09-07",
    label: "EM Evidence Rundown — Issue 28 (7 Sep 2026)",
    links: [
        { title: "EM Evidence Rundown Issue 28.pdf", driveId: "YOUR_DRIVE_FILE_ID" },
    ]
},
```

5. Commit and push to the `main` branch
6. The GitHub Action will automatically:
   - Detect the new entry in `updates.js`
   - Create a Loops campaign targeting the matching mailing list
   - Set the email content with a button linking to your Google Drive PDF
   - Send the campaign to all subscribers on that list
   - Record the send in `state/sent-newsletters.json` (so it won't be sent twice)

### Newsletter type matching

The script matches newsletter entries to mailing lists based on the link title:

| Title contains | Mailing list |
|----------------|-------------|
| "EM Evidence Rundown" (but not "PHEM" or "Anaesthetics") | Weekly EM list |
| "PHEM Evidence Rundown" | Monthly PHEM list |
| "Anaesthetics" or "ICU Evidence Rundown" | Monthly Anaesthetics list |

### Adding audio summaries

If an issue has an audio summary, add it as a second link with `audio: true`:

```javascript
{
    date: "2026-09-07",
    label: "EM Evidence Rundown — Issue 28 (7 Sep 2026)",
    links: [
        { title: "EM Evidence Rundown Issue 28.pdf", driveId: "PDF_FILE_ID" },
        { title: "Audio Summary — Issue 28", driveId: "AUDIO_FILE_ID", audio: true },
    ]
},
```

The email will include a "Listen to audio summary" link.

### Manual sending / dry run

To preview what would be sent without actually sending emails:

1. Go to [GitHub Actions](https://github.com/shakeymedic/wmem/actions)
2. Select **Send Newsletters**
3. Click **Run workflow**
4. Check "Dry run" and optionally select a specific type
5. Click **Run workflow**
6. Check the workflow logs to see what emails would be sent

To force-send a specific type:
1. Same as above but uncheck "Dry run"
2. Select the type (em, phem, or anaes)
3. Run

---

## Optional: Webhook Subscriber Sync to GitHub

The `netlify/functions/loops-webhook.js` function can sync Loops subscriber events to a GitHub repo for backup/tracking. This is optional and not required for the core email automation.

### To enable:

1. Create a repo named `shakeymedic/newsletter-pipeline` (private)
2. Add a file `state/subscribers.json` with content: `{"subscribers": []}`
3. Create a fine-grained GitHub PAT with **Contents: read+write** on that repo
4. Add Netlify environment variables:
   - `LOOPS_WEBHOOK_SECRET` — from Loops Settings → Webhooks (signing secret)
   - `GITHUB_TOKEN` — the PAT from step 3
5. In Loops: Settings → Webhooks → add your Netlify function URL: `https://emevidence.org/.netlify/functions/loops-webhook`

---

## Troubleshooting

| Issue | Fix |
|-------|-----|
| Signups not working | Check Loops form endpoint in `subscribe.js` matches your Loops form ID |
| Welcome email not sending | Check the transactional email ID `cmpy5ftku03bf0jykghy0jz0f` is published in Loops |
| Newsletter campaign not sending | Check `LOOPS_API_KEY` is set in GitHub Secrets and Content API is enabled |
| Campaign created but not sent | The email message content must be set before scheduling — check the workflow logs for API errors |
| Same newsletter sent twice | The state file tracks sent Drive IDs; check `state/sent-newsletters.json` |
| Loops API 401 | API key is invalid or expired — regenerate in Loops Settings |
| Loops API 403 | Content API not enabled for your account — contact Loops support |
| "No sending domain configured" | Set up a custom sending domain in Loops (e.g., mail.emevidence.org) |

---

## Environment Variables Summary

### GitHub Secrets (for newsletter sending)

| Secret | Purpose |
|--------|---------|
| `LOOPS_API_KEY` | Loops.so API key for creating and sending campaigns |

### Netlify Environment Variables (optional, for webhook sync only)

| Variable | Purpose |
|----------|---------|
| `LOOPS_WEBHOOK_SECRET` | Verifies Loops webhook signatures |
| `GITHUB_TOKEN` | PAT for writing to the newsletter-pipeline repo |

---

## Testing

### Test the signup flow
1. Visit [emevidence.org/#newsletter](https://emevidence.org/#newsletter)
2. Enter a test email address, tick some preferences, click Subscribe
3. You should see a green success banner
4. Check the test inbox for a welcome email

### Test the sending flow
1. Go to [GitHub Actions](https://github.com/shakeymedic/wmem/actions)
2. Run the **Send Newsletters** workflow with **Dry run** checked
3. Check the logs — it will list any unsent newsletters it found
4. If it looks correct, run again without dry-run to actually send

### Verify a sent campaign
1. Go to [app.loops.so → Campaigns](https://app.loops.so/campaigns)
2. You should see the campaign with status "Sent"
3. Check the recipient count matches the mailing list size
