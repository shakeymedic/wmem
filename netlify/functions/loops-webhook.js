// Netlify Function: loops-webhook.js
// Receives Loops webhook events and syncs the subscriber list to
// shakeymedic/newsletter-pipeline state/subscribers.json on GitHub.
//
// Events handled:
//   contact.mailingList.subscribed   → add to subscribers.json
//   contact.mailingList.unsubscribed → set subscribed: false
//   contact.unsubscribed             → set subscribed: false for all lists
//
// Required environment variables:
//   LOOPS_WEBHOOK_SECRET  — from Loops Settings > Webhooks (signing secret)
//   GITHUB_TOKEN          — fine-grained PAT with Contents: read+write on
//                           shakeymedic/newsletter-pipeline
//
// GitHub file path:  state/subscribers.json
// GitHub repo:       shakeymedic/newsletter-pipeline
// Branch:            main

const GITHUB_REPO  = "shakeymedic/newsletter-pipeline";
const GITHUB_FILE  = "state/subscribers.json";
const GITHUB_BRANCH = "main";
const GITHUB_API   = "https://api.github.com";

// Loops mailing list ID → newsletter key
const LIST_MAP = {
  "cmpy5zd8u04zv0j1a9ame4p3l": "em",
  "cmpy60jzs05gt0jzi26tj1acx": "phem",
  "cmpy6170t05ob0j0cfkut3vio": "anaesthetics",
  "cmpy61pvr05uz0j0efg7c20v5": "website",
};

// ── GitHub helpers ──────────────────────────────────────────────────────────

async function ghGet(path, token) {
  const res = await fetch(`${GITHUB_API}${path}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
    },
  });
  if (!res.ok) throw new Error(`GitHub GET ${path} → ${res.status}`);
  return res.json();
}

async function ghPut(path, body, token) {
  const res = await fetch(`${GITHUB_API}${path}`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github+json",
      "Content-Type": "application/json",
      "X-GitHub-Api-Version": "2022-11-28",
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`GitHub PUT ${path} → ${res.status}: ${err}`);
  }
  return res.json();
}

async function readSubscribers(token) {
  const data = await ghGet(
    `/repos/${GITHUB_REPO}/contents/${GITHUB_FILE}?ref=${GITHUB_BRANCH}`,
    token
  );
  const content = Buffer.from(data.content, "base64").toString("utf8");
  return { json: JSON.parse(content), sha: data.sha };
}

async function writeSubscribers(subscribers, sha, message, token) {
  const content = Buffer.from(
    JSON.stringify(subscribers, null, 2) + "\n"
  ).toString("base64");
  await ghPut(
    `/repos/${GITHUB_REPO}/contents/${GITHUB_FILE}`,
    {
      message,
      content,
      sha,
      branch: GITHUB_BRANCH,
    },
    token
  );
}

// ── Webhook signature verification ─────────────────────────────────────────
// Loops uses HMAC-SHA256; signature is in Webhook-Signature header as
// "v1,<base64>" or comma-separated list of such values.

async function verifySignature(rawBody, headers, secret) {
  if (!secret) return true; // skip if secret not configured (dev mode)

  const sigHeader = headers["webhook-signature"] || headers["Webhook-Signature"] || "";
  const timestamp = headers["webhook-timestamp"] || headers["Webhook-Timestamp"] || "";

  if (!sigHeader) return false;

  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw", enc.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["verify"]
  );

  // Loops signs: "<webhook-id>.<timestamp>.<body>"
  const webhookId = headers["webhook-id"] || headers["Webhook-Id"] || "";
  const toSign = `${webhookId}.${timestamp}.${rawBody}`;

  const signatures = sigHeader.split(" ");
  for (const sig of signatures) {
    const b64 = sig.startsWith("v1,") ? sig.slice(3) : sig;
    try {
      const sigBytes = Buffer.from(b64, "base64");
      const valid = await crypto.subtle.verify(
        "HMAC", key, sigBytes, enc.encode(toSign)
      );
      if (valid) return true;
    } catch { /* try next */ }
  }
  return false;
}

// ── Main handler ────────────────────────────────────────────────────────────

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  const secret = process.env.LOOPS_WEBHOOK_SECRET || "";
  const token  = process.env.GITHUB_TOKEN;

  if (!token) {
    console.error("GITHUB_TOKEN not set");
    return { statusCode: 500, body: "Server configuration error" };
  }

  // Verify signature
  const valid = await verifySignature(event.body, event.headers, secret);
  if (secret && !valid) {
    console.warn("Invalid webhook signature");
    return { statusCode: 401, body: "Invalid signature" };
  }

  let payload;
  try {
    payload = JSON.parse(event.body);
  } catch {
    return { statusCode: 400, body: "Invalid JSON" };
  }

  const { eventName, contactIdentity, mailingList } = payload;
  const email = contactIdentity?.email?.trim().toLowerCase();

  if (!email) {
    return { statusCode: 200, body: "No email — ignored" };
  }

  console.log(`Loops webhook: ${eventName} for ${email}`);

  // Read current subscribers
  let current, sha;
  try {
    ({ json: current, sha } = await readSubscribers(token));
  } catch (err) {
    console.error("Failed to read subscribers.json:", err.message);
    return { statusCode: 500, body: "Failed to read subscriber list" };
  }

  const subs = current.subscribers || [];
  const idx  = subs.findIndex(
    s => (typeof s === "string" ? s : s.email) === email
  );

  // Convert legacy plain-string entries to objects
  if (idx !== -1 && typeof subs[idx] === "string") {
    subs[idx] = { email: subs[idx], lists: [], subscribed: true, added: "legacy" };
  }

  const listId   = mailingList?.id || null;
  const listName = mailingList?.name || null;
  let changed = false;
  let commitMsg = "";

  if (eventName === "contact.mailingList.subscribed" && listId) {
    if (idx === -1) {
      // New subscriber
      subs.push({
        email,
        lists: [listId],
        subscribed: true,
        name: contactIdentity?.userId || null,
        added: new Date().toISOString().slice(0, 10),
      });
      commitMsg = `Add subscriber ${email} to ${LIST_MAP[listId] || listId}`;
    } else {
      // Existing subscriber — add list if not already present
      const sub = subs[idx];
      if (!sub.lists.includes(listId)) {
        sub.lists.push(listId);
        sub.subscribed = true;
        commitMsg = `Add list ${LIST_MAP[listId] || listId} for ${email}`;
      }
    }
    changed = true;

  } else if (
    eventName === "contact.mailingList.unsubscribed" && listId && idx !== -1
  ) {
    const sub = subs[idx];
    sub.lists = sub.lists.filter(l => l !== listId);
    if (sub.lists.length === 0) sub.subscribed = false;
    commitMsg = `Remove list ${LIST_MAP[listId] || listId} for ${email}`;
    changed = true;

  } else if (eventName === "contact.unsubscribed" && idx !== -1) {
    subs[idx].subscribed = false;
    subs[idx].lists = [];
    commitMsg = `Unsubscribe ${email} from all lists`;
    changed = true;
  }

  if (!changed) {
    return { statusCode: 200, body: "No change needed" };
  }

  current.subscribers = subs;

  try {
    await writeSubscribers(current, sha, `[webhook] ${commitMsg}`, token);
    console.log(`Updated subscribers.json: ${commitMsg}`);
    return { statusCode: 200, body: "OK" };
  } catch (err) {
    console.error("Failed to write subscribers.json:", err.message);
    return { statusCode: 500, body: "Failed to update subscriber list" };
  }
};
