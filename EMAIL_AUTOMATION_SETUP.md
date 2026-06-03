# EM Evidence — Email Automation Setup Guide

## Overview

The email system has three parts:

| Part | What it does | Where it lives |
|------|-------------|----------------|
| **Netlify Function** | Receives signups, sends welcome email, notifies you | `netlify/functions/subscribe.js` |
| **Google Sheet** | Master subscriber list | Google Drive (you create once) |
| **Google Apps Script** | Sends weekly/monthly newsletters | Google Apps Script (you create once) |

---

## Step 1: Set Up Gmail App Password

You need a Gmail App Password so the Netlify function can send emails via `emevidence999@gmail.com`.

1. Go to [myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords)
2. Sign in as `emevidence999@gmail.com`
3. Under "Select app", choose **Mail**; under "Select device", choose **Other** → type `emevidence-netlify`
4. Click **Generate**
5. Copy the 16-character password (shown once — save it)

---

## Step 2: Add Environment Variables in Netlify

1. Go to [app.netlify.com](https://app.netlify.com) → your emevidence.org site
2. Click **Site configuration** → **Environment variables**
3. Add these two variables:

| Key | Value |
|-----|-------|
| `GMAIL_USER` | `emevidence999@gmail.com` |
| `GMAIL_APP_PASS` | *(the 16-char App Password from Step 1)* |

4. Click **Save**, then **Redeploy** the site (Deploys → Trigger deploy → Deploy site)

---

## Step 3: Create the Subscriber Google Sheet

1. Go to [sheets.google.com](https://sheets.google.com) and create a new sheet named **EM Evidence Subscribers**
2. Set up the header row (Row 1) exactly like this:

| A | B | C | D | E | F | G |
|---|---|---|---|---|---|---|
| Email | SubscribedDate | Weekly_EM | Monthly_PHEM | Monthly_Anaesthetics | Website_Updates | Unsubscribed |

3. Note the **Spreadsheet ID** from the URL:  
   `https://docs.google.com/spreadsheets/d/`**`THIS_IS_YOUR_SHEET_ID`**`/edit`

---

## Step 4: Update the Netlify Function to log to Google Sheet

Once you have the Sheet ID, update `netlify/functions/subscribe.js` and add this to the handler after the welcome email send:

```javascript
// Add this at the top of subscribe.js:
const { google } = require("googleapis");

// Add this function:
async function logToSheet(email, preferences) {
  const auth = new google.auth.JWT(
    process.env.GOOGLE_SA_EMAIL,
    null,
    process.env.GOOGLE_SA_KEY.replace(/\\n/g, '\n'),
    ["https://www.googleapis.com/auth/spreadsheets"]
  );
  const sheets = google.sheets({ version: "v4", auth });
  const now = new Date().toISOString();
  await sheets.spreadsheets.values.append({
    spreadsheetId: process.env.SHEET_ID,
    range: "Sheet1!A:G",
    valueInputOption: "USER_ENTERED",
    resource: {
      values: [[
        email,
        now,
        preferences.includes("Weekly EM Evidence Updates") ? "TRUE" : "FALSE",
        preferences.includes("Monthly PHEM Evidence Updates") ? "TRUE" : "FALSE",
        preferences.includes("Monthly Anaesthetics and ICM Evidence Updates") ? "TRUE" : "FALSE",
        preferences.includes("Website Updates") ? "TRUE" : "FALSE",
        "FALSE"
      ]]
    }
  });
}
```

**Alternatively** (simpler): forward all Netlify form submissions to the sheet using [Netlify's form notification webhook](https://docs.netlify.com/forms/notifications/) → this triggers on every signup automatically.

---

## Step 5: Google Apps Script — Newsletter Sender

This script reads your subscriber sheet and sends the right newsletter to the right people.

1. Go to [script.google.com](https://script.google.com) → **New project**
2. Name it **EM Evidence Newsletter Sender**
3. Replace all code with the script below
4. Update the `CONFIG` section with your Sheet ID and Drive file IDs

```javascript
// EM Evidence Newsletter Sender
// Paste this into Google Apps Script at script.google.com

const CONFIG = {
  SHEET_ID: "YOUR_SPREADSHEET_ID_HERE",       // From your subscriber sheet URL
  SENDER_NAME: "EM Evidence",
  SENDER_EMAIL: "emevidence999@gmail.com",
  SITE_URL: "https://emevidence.org",
};

// ──────────────────────────────────────────────────────────────
// MAIN SEND FUNCTIONS — call these from triggers or manually
// ──────────────────────────────────────────────────────────────

/**
 * Call this to send the Weekly EM Evidence newsletter.
 * Add a time-based trigger to run every Monday morning.
 * Pass the Google Drive file ID of the new newsletter PDF.
 */
function sendWeeklyEM(driveFileId, issueTitle, audioFileId) {
  const subscribers = getSubscribers("Weekly_EM");
  const emailHtml = buildNewsletterEmail({
    type: "EM Evidence Rundown",
    title: issueTitle || "This Week's EM Evidence Rundown",
    driveFileId: driveFileId,
    audioFileId: audioFileId || null,
    color: "#2563a8",
  });
  sendToList(subscribers, emailHtml.subject, emailHtml.html, emailHtml.text);
  Logger.log(`Sent weekly EM newsletter to ${subscribers.length} subscribers`);
}

/**
 * Call this to send the Monthly PHEM newsletter.
 */
function sendMonthlyPHEM(driveFileId, issueTitle) {
  const subscribers = getSubscribers("Monthly_PHEM");
  const emailHtml = buildNewsletterEmail({
    type: "PHEM Evidence Rundown",
    title: issueTitle || "This Month's PHEM Evidence Rundown",
    driveFileId: driveFileId,
    color: "#7c3aed",
  });
  sendToList(subscribers, emailHtml.subject, emailHtml.html, emailHtml.text);
  Logger.log(`Sent PHEM newsletter to ${subscribers.length} subscribers`);
}

/**
 * Call this to send the Monthly Anaesthetics & ICM newsletter.
 */
function sendMonthlyAnaesthetics(driveFileId, issueTitle) {
  const subscribers = getSubscribers("Monthly_Anaesthetics");
  const emailHtml = buildNewsletterEmail({
    type: "Anaesthetics & ICM Evidence Rundown",
    title: issueTitle || "This Month's Anaesthetics & ICM Evidence Rundown",
    driveFileId: driveFileId,
    color: "#059669",
  });
  sendToList(subscribers, emailHtml.subject, emailHtml.html, emailHtml.text);
  Logger.log(`Sent Anaesthetics newsletter to ${subscribers.length} subscribers`);
}

/**
 * Send a website update to all "Website_Updates" subscribers.
 */
function sendWebsiteUpdate(subject, bodyHtml) {
  const subscribers = getSubscribers("Website_Updates");
  sendToList(subscribers, subject, bodyHtml, "Visit https://emevidence.org for the latest updates.");
  Logger.log(`Sent website update to ${subscribers.length} subscribers`);
}

// ──────────────────────────────────────────────────────────────
// HELPER: READ SUBSCRIBERS
// ──────────────────────────────────────────────────────────────
function getSubscribers(columnName) {
  const ss = SpreadsheetApp.openById(CONFIG.SHEET_ID);
  const sheet = ss.getSheets()[0];
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  
  const emailCol = headers.indexOf("Email");
  const unsubCol = headers.indexOf("Unsubscribed");
  const filterCol = headers.indexOf(columnName);
  
  if (filterCol === -1) {
    throw new Error(`Column "${columnName}" not found in spreadsheet. Check headers.`);
  }
  
  return data.slice(1)
    .filter(row => {
      const email = row[emailCol];
      const unsub = String(row[unsubCol]).toUpperCase();
      const subscribed = String(row[filterCol]).toUpperCase();
      return email && unsub !== "TRUE" && subscribed === "TRUE";
    })
    .map(row => row[emailCol]);
}

// ──────────────────────────────────────────────────────────────
// HELPER: SEND TO LIST (batched to respect Gmail limits)
// ──────────────────────────────────────────────────────────────
function sendToList(emails, subject, html, plainText) {
  let sent = 0;
  for (const email of emails) {
    try {
      GmailApp.sendEmail(email, subject, plainText, {
        from: CONFIG.SENDER_EMAIL,
        name: CONFIG.SENDER_NAME,
        htmlBody: html,
        replyTo: CONFIG.SENDER_EMAIL,
      });
      sent++;
      // Pause every 50 emails to respect rate limits
      if (sent % 50 === 0) Utilities.sleep(2000);
    } catch (e) {
      Logger.log(`Failed to send to ${email}: ${e.message}`);
    }
  }
  return sent;
}

// ──────────────────────────────────────────────────────────────
// HELPER: BUILD EMAIL HTML
// ──────────────────────────────────────────────────────────────
function buildNewsletterEmail({ type, title, driveFileId, audioFileId, color }) {
  const viewUrl = `https://drive.google.com/file/d/${driveFileId}/view?usp=sharing`;
  const previewUrl = `https://drive.google.com/file/d/${driveFileId}/preview`;
  const subject = `${type} — ${title}`;
  
  const audioSection = audioFileId ? `
    <tr><td style="padding:0 40px 24px;">
      <a href="https://drive.google.com/file/d/${audioFileId}/view?usp=sharing"
         style="display:inline-flex;align-items:center;color:${color};font-size:14px;text-decoration:none;font-weight:500;">
        🔊 Listen to audio summary
      </a>
    </td></tr>` : "";

  const html = `<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#f3f4f6;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f3f4f6;padding:32px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;max-width:600px;width:100%;">
        <tr>
          <td style="background:linear-gradient(135deg,#1e3a5f 0%,${color} 100%);padding:32px 40px;text-align:center;">
            <h1 style="color:#ffffff;margin:0;font-size:26px;font-weight:700;">EM Evidence</h1>
            <p style="color:rgba(255,255,255,0.8);margin:6px 0 0;font-size:14px;">${type}</p>
          </td>
        </tr>
        <tr><td style="padding:36px 40px 24px;">
          <h2 style="color:#1e3a5f;margin:0 0 16px;font-size:20px;">${title}</h2>
          <p style="color:#374151;font-size:15px;line-height:1.7;margin:0 0 24px;">
            Your latest ${type} is ready. Click below to read the full issue.
          </p>
          <table cellpadding="0" cellspacing="0">
            <tr><td style="background:${color};border-radius:8px;">
              <a href="${viewUrl}" style="display:inline-block;color:#ffffff;text-decoration:none;font-weight:600;font-size:15px;padding:14px 28px;">
                Read ${type} →
              </a>
            </td></tr>
          </table>
        </td></tr>
        ${audioSection}
        <tr><td style="padding:0 40px 32px;">
          <p style="color:#6b7280;font-size:14px;line-height:1.6;margin:0;">
            All past issues and tools are available at 
            <a href="${CONFIG.SITE_URL}" style="color:${color};">${CONFIG.SITE_URL}</a>
          </p>
        </td></tr>
        <tr><td style="background:#f9fafb;padding:20px 40px;text-align:center;border-top:1px solid #e5e7eb;">
          <p style="color:#9ca3af;font-size:12px;margin:0;">© ${new Date().getFullYear()} EM Evidence · Dr Jake Turner</p>
          <p style="color:#9ca3af;font-size:12px;margin:6px 0 0;">
            To unsubscribe, reply with "Unsubscribe" · 
            <a href="mailto:emevidence999@gmail.com" style="color:#2563a8;">emevidence999@gmail.com</a>
          </p>
          <p style="color:#9ca3af;font-size:11px;margin:6px 0 0;">
            MEDICAL DISCLAIMER: Tools are for educational purposes only and do not replace clinical judgement.
          </p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;

  return { subject, html, text: `${title}\n\nRead online: ${viewUrl}\n\nVisit ${CONFIG.SITE_URL} for all tools.\n\nTo unsubscribe reply with "Unsubscribe" to emevidence999@gmail.com` };
}

// ──────────────────────────────────────────────────────────────
// UNSUBSCRIBE HANDLER
// Call this if someone replies "Unsubscribe" to mark them in sheet
// ──────────────────────────────────────────────────────────────
function markUnsubscribed(email) {
  const ss = SpreadsheetApp.openById(CONFIG.SHEET_ID);
  const sheet = ss.getSheets()[0];
  const data = sheet.getDataRange().getValues();
  const emailCol = 0;
  const unsubCol = data[0].indexOf("Unsubscribed");
  
  for (let i = 1; i < data.length; i++) {
    if (data[i][emailCol].toLowerCase() === email.toLowerCase()) {
      sheet.getRange(i + 1, unsubCol + 1).setValue("TRUE");
      Logger.log(`Unsubscribed: ${email}`);
      return true;
    }
  }
  return false;
}
```

---

## Step 6: Set Up Automated Triggers in Apps Script

1. In the Apps Script editor, click **Triggers** (alarm clock icon on the left)
2. Click **+ Add Trigger**
3. For **weekly EM newsletter**: set to run `sendWeeklyEM` — but you'll actually call this manually each time you have a new PDF, passing the Drive file ID

**The recommended workflow for each newsletter:**

### Sending a New EM Evidence Rundown (Weekly)
1. Upload the PDF to Google Drive
2. Copy the file ID from the URL
3. In Apps Script, open `sendWeeklyEM` function and run it with the new file ID:
   ```javascript
   sendWeeklyEM("YOUR_NEW_FILE_ID", "EM Evidence Rundown — Issue 15");
   ```
4. Done — it sends to all weekly subscribers automatically

### Sending PHEM or Anaesthetics (Monthly)
Same process — run `sendMonthlyPHEM` or `sendMonthlyAnaesthetics` with the new Drive file ID.

---

## Step 7: Handle New Subscribers Logging to the Sheet

Currently the Netlify function sends welcome emails but doesn't automatically add subscribers to the Google Sheet. The two options are:

### Option A: Netlify Webhook → Apps Script Web App (Recommended)

1. In Apps Script, add a `doPost(e)` function to create a Web App endpoint
2. In Netlify: Site configuration → Forms → newsletter → Notifications → Add webhook → point to your Apps Script URL
3. Every new Netlify form submission triggers the webhook, which logs to the sheet

### Option B: Manual Export (Simple)
1. In Netlify: Site configuration → Forms → newsletter → Export submissions (CSV)
2. Paste into your Google Sheet
3. Do this whenever you want to send a newsletter

---

## Environment Variables Summary

Set these in Netlify (Site configuration → Environment variables):

| Variable | Value | Purpose |
|----------|-------|---------|
| `GMAIL_USER` | `emevidence999@gmail.com` | Sender address |
| `GMAIL_APP_PASS` | *(App Password)* | Gmail authentication |

---

## Testing

After deploying:
1. Visit https://emevidence.org/#newsletter
2. Enter a test email address, tick some preferences, click Subscribe
3. You should be redirected back to the site with a green success banner
4. Check the test inbox for a welcome email
5. Check `emevidence999@gmail.com` for the admin notification

---

## Troubleshooting

| Issue | Fix |
|-------|-----|
| Welcome email not sending | Check `GMAIL_USER` and `GMAIL_APP_PASS` are set in Netlify environment variables |
| 404 on form submit | Ensure site has been redeployed after `netlify.toml` changes |
| Apps Script can't access sheet | Make sure the script is running as `emevidence999@gmail.com` and the sheet is in that account |
| Gmail sending limit | Gmail free accounts can send ~500 emails/day. Fine for most lists. For larger lists, use SendGrid free tier |
