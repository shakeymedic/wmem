#!/usr/bin/env node
/**
 * send-newsletter.mjs — EM Evidence automated newsletter sender
 *
 * Reads updates.js to find newsletter issues that haven't been sent yet,
 * creates a Loops.so campaign for each, sets the email content (LMX),
 * and sends it to the appropriate mailing list.
 *
 * Usage:
 *   node scripts/send-newsletter.mjs              # send all unsent
 *   node scripts/send-newsletter.mjs --dry-run    # preview without sending
 *   node scripts/send-newsletter.mjs --type em     # only EM weekly
 *   node scripts/send-newsletter.mjs --type phem   # only PHEM monthly
 *   node scripts/send-newsletter.mjs --type anaes  # only Anaesthetics monthly
 *
 * Required environment variables:
 *   LOOPS_API_KEY  — Loops.so API key (Content API must be enabled)
 *
 * State file: state/sent-newsletters.json
 *   Tracks which newsletter driveIds have already been sent to avoid duplicates.
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, "..");

// ─── Configuration ──────────────────────────────────────────────────────────

const LOOPS_API = "https://app.loops.so/api/v1";

const NEWSLETTER_TYPES = {
  em: {
    name: "EM Evidence Rundown",
    matchLabel: (label) =>
      /EM Evidence Rundown/i.test(label) &&
      !/anaesthetics?|phem/i.test(label),
    matchTitle: (title) =>
      /EM Evidence Rundown/i.test(title) &&
      !/anaesthetics?|phem/i.test(title),
    mailingListId: "cmpy5zd8u04zv0j1a9ame4p3l",
    subjectPrefix: "EM Evidence Rundown",
    color: "2563a8",
    schedule: "weekly",
  },
  phem: {
    name: "PHEM Evidence Rundown",
    matchLabel: (label) => /PHEM Evidence Rundown/i.test(label),
    matchTitle: (title) => /PHEM Evidence Rundown/i.test(title),
    mailingListId: "cmpy60jzs05gt0jzi26tj1acx",
    subjectPrefix: "PHEM Evidence Rundown",
    color: "7c3aed",
    schedule: "monthly",
  },
  anaes: {
    name: "Anaesthetics & ICU Evidence Rundown",
    matchLabel: (label) =>
      /anaesthetics?|ICU Evidence Rundown/i.test(label),
    matchTitle: (title) =>
      /anaesthetics?|ICU Evidence Rundown/i.test(title),
    mailingListId: "cmpy6170t05ob0j0cfkut3vio",
    subjectPrefix: "Anaesthetics & ICU Evidence Rundown",
    color: "059669",
    schedule: "monthly",
  },
};

const STATE_FILE = path.join(ROOT, "state", "sent-newsletters.json");
const UPDATES_FILE = path.join(ROOT, "updates.js");

// ─── Helpers ───────────────────────────────────────────────────────────────

function loadState() {
  try {
    const raw = fs.readFileSync(STATE_FILE, "utf8");
    return JSON.parse(raw);
  } catch {
    return { sent: {} };
  }
}

function saveState(state) {
  fs.mkdirSync(path.dirname(STATE_FILE), { recursive: true });
  fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2) + "\n");
}

/**
 * Parse updates.js to extract the updates array.
 * The file defines `const updates = [ ... ];` at the top level.
 */
function loadUpdates() {
  const source = fs.readFileSync(UPDATES_FILE, "utf8");

  // Extract the array content between `const updates = [` and the closing `];`
  const match = source.match(/const\s+updates\s*=\s*\[([\s\S]*?)\];/);
  if (!match) {
    throw new Error("Could not parse updates array from updates.js");
  }

  // Use a temporary file + dynamic import to safely evaluate the data
  // We wrap it in an ES module that exports the array
  const tmpFile = path.join(ROOT, ".updates-tmp.mjs");
  const wrapped = `
const audioIcon = "";
const docIcon = "";
export const updates = [${match[1]}];
`;
  fs.writeFileSync(tmpFile, wrapped);

  try {
    // Use a cache-busting query param so Node re-imports each time
    const fileUrl = "file://" + tmpFile + "?t=" + Date.now();
    return import(fileUrl).then((mod) => {
      fs.unlinkSync(tmpFile);
      return mod.updates;
    });
  } catch (err) {
    fs.unlinkSync(tmpFile);
    throw err;
  }
}

/**
 * Find unsent newsletter entries for a given type.
 * Returns [{ entry, link }] pairs.
 */
function findUnsent(updates, state, typeKey) {
  const config = NEWSLETTER_TYPES[typeKey];
  if (!config) return [];

  const results = [];
  for (const entry of updates) {
    const links = entry.links || [];
    for (const link of links) {
      // Check if this link matches the newsletter type
      const titleMatch = config.matchTitle(link.title || "");
      const labelMatch = config.matchLabel(entry.label || "");
      if (!titleMatch && !labelMatch) continue;

      // Skip audio-only links
      if (link.audio) continue;

      // Check if already sent
      const sentKey = link.driveId;
      if (state.sent[sentKey]) continue;

      results.push({ entry, link });
    }
  }
  return results;
}

/**
 * Build LMX email content for a newsletter issue.
 */
function buildLMX(issue, config) {
  const driveUrl = `https://drive.google.com/file/d/${issue.link.driveId}/view?usp=sharing`;
  const title = issue.link.title || issue.entry.label;
  const date = issue.entry.date || "";
  const audioLink = issue.entry.links?.find((l) => l.audio || l.audioId);

  let lmx = `<H1>EM Evidence</H1>
<Paragraph><Strong>${escapeXml(title)}</Strong></Paragraph>
<Paragraph>Your latest ${escapeXml(config.name)} is ready. Click below to read the full issue.</Paragraph>
<Button href="${escapeXml(driveUrl)}">Read ${escapeXml(config.name)} →</Button>`;

  if (audioLink) {
    const audioUrl = audioLink.driveId
      ? `https://drive.google.com/file/d/${audioLink.driveId}/view?usp=sharing`
      : audioLink.audioId
        ? `https://drive.google.com/file/d/${audioLink.audioId}/view?usp=sharing`
        : null;
    if (audioUrl) {
      lmx += `\n<Paragraph><Link href="${escapeXml(audioUrl)}">🔊 Listen to audio summary</Link></Paragraph>`;
    }
  }

  lmx += `
<Paragraph>All past issues and tools are available at <Link href="https://emevidence.org">emevidence.org</Link></Paragraph>
<Divider />
<Paragraph><Text textColor="#9ca3af">© ${new Date().getFullYear()} EM Evidence · Dr Jake Turner</Text></Paragraph>
<Paragraph><Text textColor="#9ca3af">To unsubscribe, use the unsubscribe link below.</Text></Paragraph>
<Paragraph><Text textColor="#9ca3af">MEDICAL DISCLAIMER: Tools are for educational purposes only and do not replace clinical judgement.</Text></Paragraph>`;

  return lmx;
}

function escapeXml(str) {
  return String(str)
    .replace(/&/g, "\x26")
    .replace(/</g, "\x3c")
    .replace(/>/g, "\x3e")
    .replace(/"/g, "\x22")
    .replace(/'/g, "\x27");
}

function buildSubject(issue, config) {
  const title = issue.link.title || issue.entry.label;
  // Clean up the title for the subject line
  let subject = title.replace(/\.pdf$/i, "").trim();
  return `${config.subjectPrefix} — ${subject}`;
}

// ─── Loops API ──────────────────────────────────────────────────────────────

async function loopsRequest(method, path, body, apiKey) {
  const url = `${LOOPS_API}${path}`;
  const res = await fetch(url, {
    method,
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  const text = await res.text();
  let json;
  try {
    json = JSON.parse(text);
  } catch {
    json = { raw: text };
  }

  if (!res.ok) {
    throw new Error(
      `Loops API ${method} ${path} → ${res.status}: ${JSON.stringify(json)}`
    );
  }
  return json;
}

/**
 * Create a campaign, set its email content, and send it to a mailing list.
 */
async function sendCampaign(issue, typeKey, apiKey, dryRun) {
  const config = NEWSLETTER_TYPES[typeKey];
  const subject = buildSubject(issue, config);
  const lmx = buildLMX(issue, config);
  const driveUrl = `https://drive.google.com/file/d/${issue.link.driveId}/view?usp=sharing`;

  console.log(`\n  📧 ${subject}`);
  console.log(`     List: ${config.name} (${config.mailingListId})`);
  console.log(`     PDF:  ${driveUrl}`);

  if (dryRun) {
    console.log(`     [DRY RUN] Would create and send campaign`);
    return { dryRun: true, subject };
  }

  // Step 1: Create the campaign (draft)
  console.log(`     Creating campaign draft...`);
  const campaign = await loopsRequest("POST", "/campaigns", {
    name: subject,
    mailingListId: config.mailingListId,
  }, apiKey);

  const campaignId = campaign.id;
  const emailMessageId = campaign.emailMessageId;
  const revisionId = campaign.emailMessageContentRevisionId;

  console.log(`     Campaign ID: ${campaignId}`);

  // Step 2: Update the email message with LMX content
  console.log(`     Setting email content...`);
  await loopsRequest("POST", `/email-messages/${emailMessageId}`, {
    expectedRevisionId: revisionId,
    subject: subject,
    previewText: `Your latest ${config.name} is ready to read`,
    fromName: "EM Evidence",
    fromEmail: "emevidence999",
    replyToEmail: "emevidence999@gmail.com",
    emailFormat: "styled",
    lmx: lmx,
  }, apiKey);

  // Step 3: Send the campaign immediately
  console.log(`     Sending campaign...`);
  await loopsRequest("PATCH", `/campaigns/${campaignId}`, {
    scheduling: { method: "now" },
  }, apiKey);

  console.log(`     ✅ Sent!`);
  return { campaignId, subject };
}

// ─── Main ────────────────────────────────────────────────────────────────────

async function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes("--dry-run");
  const typeArgIdx = args.indexOf("--type");
  const typeFilter = typeArgIdx !== -1 ? args[typeArgIdx + 1] : null;

  const apiKey = process.env.LOOPS_API_KEY;
  if (!apiKey && !dryRun) {
    console.error("❌ LOOPS_API_KEY environment variable is required");
    process.exit(1);
  }

  console.log(" EM Evidence Newsletter Sender");
  console.log("══════════════════════════════════");
  if (dryRun) console.log(" 🔍 DRY RUN MODE — no emails will be sent\n");

  // Load data
  const updates = await loadUpdates();
  const state = loadState();

  console.log(` 📂 Loaded ${updates.length} newsletter entries from updates.js`);

  // Determine which types to process
  const typesToProcess = typeFilter
    ? [typeFilter]
    : Object.keys(NEWSLETTER_TYPES);

  let totalSent = 0;
  let totalSkipped = 0;

  for (const typeKey of typesToProcess) {
    const config = NEWSLETTER_TYPES[typeKey];
    if (!config) {
      console.error(`❌ Unknown type: ${typeKey}`);
      continue;
    }

    console.log(`\n── ${config.name} ──`);

    const unsent = findUnsent(updates, state, typeKey);

    if (unsent.length === 0) {
      console.log(`  No new unsent issues found.`);
      continue;
    }

    console.log(`  Found ${unsent.length} unsent issue(s):`);

    for (const issue of unsent) {
      try {
        const result = await sendCampaign(issue, typeKey, apiKey, dryRun);

        if (!result.dryRun) {
          // Mark as sent in state
          state.sent[issue.link.driveId] = {
            type: typeKey,
            subject: result.subject,
            campaignId: result.campaignId,
            sentAt: new Date().toISOString(),
            date: issue.entry.date,
            label: issue.entry.label,
          };
          saveState(state);
        }
        totalSent++;
      } catch (err) {
        console.error(`  ❌ Failed: ${err.message}`);
        totalSkipped++;
      }
    }
  }

  console.log(`\n══════════════════════════════════`);
  console.log(` Done: ${totalSent} sent, ${totalSkipped} failed`);
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
