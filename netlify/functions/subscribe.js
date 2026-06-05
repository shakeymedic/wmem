// Netlify Serverless Function: subscribe.js
// Uses native fetch (Node 18+, available on Netlify)
// Environment variable required: LOOPS_API_KEY

const WELCOME_ID = "cmpy5ftku03bf0jykghy0jz0f";

const LISTS = {
  "Weekly EM Evidence Updates":                    "cmpy5zd8u04zv0j1a9ame4p3l",
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
  const res = await fetch(`https://app.loops.so/api/v1${path}`, {
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

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  const apiKey = process.env.LOOPS_API_KEY;
  if (!apiKey) {
    console.error("LOOPS_API_KEY not set");
    return { statusCode: 500, body: "Server configuration error" };
  }

  try {
    const params = new URLSearchParams(event.body);
    const email  = (params.get("email") || "").trim().toLowerCase();
    const prefs  = params.getAll("preferences[]");

    // Honeypot
    if (params.get("_honeypot")) {
      return { statusCode: 303, headers: { Location: "/?subscribed=true" }, body: "" };
    }

    if (!email || !email.includes("@")) {
      return { statusCode: 400, body: JSON.stringify({ error: "Invalid email" }) };
    }

    // Build contact properties and list memberships
    const contactProps = { source: "emevidence.org website" };
    const mailingLists = {};
    for (const pref of prefs) {
      if (PROPS[pref])  contactProps[PROPS[pref]]  = true;
      if (LISTS[pref])  mailingLists[LISTS[pref]]   = true;
    }

    // 1. Create contact (update if already exists)
    const createRes = await loopsPost("/contacts/create", {
      email,
      mailingLists,
      ...contactProps,
    }, apiKey);

    console.log("Create contact:", createRes.status, JSON.stringify(createRes.body));

    // If duplicate, update instead
    if (createRes.status === 409 || createRes.body?.message?.includes("exists")) {
      const updateRes = await loopsPost("/contacts/update", {
        email,
        mailingLists,
        ...contactProps,
      }, apiKey);
      console.log("Update contact:", updateRes.status, JSON.stringify(updateRes.body));
    }

    // 2. Send welcome email
    const welcomeRes = await loopsPost("/transactional", {
      email,
      transactionalId: WELCOME_ID,
      addToAudience:   true,
      dataVariables: {
        hello: "there",
        preferences: prefs.length > 0 ? prefs.join(", ") : "General updates",
      },
    }, apiKey);

    console.log("Welcome email:", welcomeRes.status, JSON.stringify(welcomeRes.body));

    return {
      statusCode: 303,
      headers:    { Location: "/?subscribed=true" },
      body:       "",
    };

  } catch (err) {
    console.error("Subscribe error:", err.message, err.stack);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Subscription failed. Please try again." }),
    };
  }
};
