// Netlify Edge Function: subscribe.js
// Runs on Deno/V8 at the edge — full outbound network access
// Environment variable required: LOOPS_API_KEY

const WELCOME_ID = "cmpy5ftku03bf0jykghy0jz0f";

const LISTS = {
  "Weekly EM Evidence Updates":                    "cmpy5zd8u4kzv8j1a9emeip31",
  "Monthly PHEM Evidence Updates":                 "cmpy60jzs05gt0jzi26tj1acx",
  "Monthly Anaesthetics and ICM Evidence Updates": "cmpy6170t05ob0j0cfkut3vio",
  "Website Updates":                               "cmpy61pvr05uz0j0efg7c20v5",
};

const PROPS = {
  "Weekly EM Evidence Updates":                    "weeklyEmEvidence",
  "Monthly PHEM Evidence Updates":                 "monthlyPhem",
  "Monthly Anaesthetics and ICM Evidence Updates": "monthlyAnaestheticsIcm",
  "Website Updates":                               "websiteUpdates",
};

async function loopsPost(path, body, apiKey) {
  const res = await fetch(`https://api.loops.so/v1${path}`, {
    method:  "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type":  "application/json",
    },
    body: JSON.stringify(body),
  });
  const json = await res.json().catch(() => ({}));
  return { status: res.status, body: json };
}

export default async function handler(request, context) {
  if (request.method !== "POST") {
    return new Response("Method Not Allowed", { status: 405 });
  }

  const apiKey = Deno.env.get("LOOPS_API_KEY");
  if (!apiKey) {
    console.error("LOOPS_API_KEY not set");
    return new Response("Server configuration error", { status: 500 });
  }

  try {
    const body   = await request.text();
    const params = new URLSearchParams(body);
    const email  = (params.get("email") || "").trim().toLowerCase();
    const prefs  = params.getAll("preferences[]");

    // Honeypot
    if (params.get("_honeypot")) {
      return Response.redirect(new URL("/?subscribed=true", request.url), 303);
    }

    if (!email || !email.includes("@")) {
      return new Response(JSON.stringify({ error: "Invalid email" }), { status: 400 });
    }

    // Build properties and list memberships
    const contactProps = { source: "emevidence.org website" };
    const mailingLists = {};
    for (const pref of prefs) {
      if (PROPS[pref]) contactProps[PROPS[pref]] = true;
      if (LISTS[pref]) mailingLists[LISTS[pref]] = true;
    }

    // 1. Create or update contact
    const createRes = await loopsPost("/contacts/create", {
      email,
      mailingLists,
      ...contactProps,
    }, apiKey);

    console.log("Create contact:", createRes.status, JSON.stringify(createRes.body));

    if (createRes.status === 409 || createRes.body?.message?.includes("exists")) {
      const updateRes = await loopsPost("/contacts/update", {
        email,
        mailingLists,
        ...contactProps,
      }, apiKey);
      console.log("Update contact:", updateRes.status, JSON.stringify(updateRes.body));
    }

    // 2. Send welcome transactional email
    const welcomeRes = await loopsPost("/transactional", {
      email,
      transactionalId: WELCOME_ID,
      addToAudience:   true,
      dataVariables: {
        preferences: prefs.length > 0 ? prefs.join(", ") : "General updates",
      },
    }, apiKey);

    console.log("Welcome email:", welcomeRes.status, JSON.stringify(welcomeRes.body));

    return Response.redirect(new URL("/?subscribed=true", request.url), 303);

  } catch (err) {
    console.error("Subscribe error:", err.message);
    return new Response(
      JSON.stringify({ error: "Subscription failed. Please try again." }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}

export const config = { path: "/subscribe" };
