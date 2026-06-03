// Netlify Serverless Function: subscribe.js
// Handles newsletter signups — stores subscriber data and sends a welcome email
// Uses nodemailer with Gmail SMTP (OAuth2 or App Password via environment variables)
// Environment variables required (set in Netlify UI → Site configuration → Environment variables):
//   GMAIL_USER      — emevidence999@gmail.com
//   GMAIL_APP_PASS  — Gmail App Password (16-char, generated at myaccount.google.com/apppasswords)

const https = require("https");

// Minimal SMTP send via Gmail using a raw HTTPS call to Gmail API is complex.
// Instead we use nodemailer — available in Netlify Functions via npm.
// This function is self-contained: it sends the welcome email directly.

// ─────────────────────────────────────────────────────────────
// WELCOME EMAIL TEMPLATE
// ─────────────────────────────────────────────────────────────
function buildWelcomeEmail(email, preferences) {
  const prefList = preferences.length > 0
    ? preferences.map(p => `<li style="margin-bottom:6px;">✅ ${p}</li>`).join("")
    : "<li>No specific preferences selected</li>";

  return {
    subject: "Welcome to EM Evidence — You're subscribed!",
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0;padding:0;background:#f3f4f6;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f3f4f6;padding:32px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;max-width:600px;width:100%;">
        
        <!-- Header -->
        <tr>
          <td style="background:linear-gradient(135deg,#1e3a5f 0%,#2563a8 100%);padding:32px 40px;text-align:center;">
            <h1 style="color:#ffffff;margin:0;font-size:26px;font-weight:700;letter-spacing:-0.5px;">EM Evidence</h1>
            <p style="color:#93c5fd;margin:6px 0 0 0;font-size:14px;">Evidence-Based Emergency Medicine</p>
          </td>
        </tr>

        <!-- Body -->
        <tr>
          <td style="padding:40px 40px 32px;">
            <h2 style="color:#1e3a5f;margin:0 0 16px;font-size:22px;">You're in — welcome aboard!</h2>
            <p style="color:#374151;font-size:15px;line-height:1.7;margin:0 0 20px;">
              Thanks for subscribing to EM Evidence. You'll start receiving updates based on your preferences below.
            </p>

            <div style="background:#eff6ff;border-left:4px solid #2563a8;border-radius:6px;padding:20px 24px;margin:0 0 28px;">
              <p style="color:#1e3a5f;font-weight:600;margin:0 0 12px;font-size:14px;">YOUR SUBSCRIPTIONS</p>
              <ul style="margin:0;padding-left:20px;color:#374151;font-size:14px;line-height:1.8;">
                ${prefList}
              </ul>
            </div>

            <p style="color:#374151;font-size:15px;line-height:1.7;margin:0 0 20px;">
              In the meantime, all our tools and the latest Evidence Rundown are always available at:
            </p>

            <table cellpadding="0" cellspacing="0" style="margin:0 0 28px;">
              <tr>
                <td style="background:#2563a8;border-radius:8px;">
                  <a href="https://emevidence.org" style="display:inline-block;color:#ffffff;text-decoration:none;font-weight:600;font-size:15px;padding:14px 28px;">Visit emevidence.org →</a>
                </td>
              </tr>
            </table>

            <p style="color:#6b7280;font-size:13px;line-height:1.6;margin:0;border-top:1px solid #e5e7eb;padding-top:20px;">
              If you didn't sign up for this, or wish to unsubscribe, simply reply to this email with "Unsubscribe" 
              and we'll remove you straight away. This list is managed by Dr Jake Turner at Heartlands Hospital.
            </p>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="background:#f9fafb;padding:20px 40px;text-align:center;border-top:1px solid #e5e7eb;">
            <p style="color:#9ca3af;font-size:12px;margin:0;">© ${new Date().getFullYear()} EM Evidence · Created by Dr Jake Turner</p>
            <p style="color:#9ca3af;font-size:12px;margin:6px 0 0;">
              <a href="mailto:emevidence999@gmail.com" style="color:#2563a8;text-decoration:none;">emevidence999@gmail.com</a>
            </p>
            <p style="color:#9ca3af;font-size:11px;margin:6px 0 0;">
              <strong>MEDICAL DISCLAIMER:</strong> These tools are for educational purposes only and do not replace clinical judgement.
            </p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`,
    text: `Welcome to EM Evidence!

Thanks for subscribing. You'll receive updates for:
${preferences.map(p => `- ${p}`).join("\n")}

Visit the site any time: https://emevidence.org

To unsubscribe, reply to this email with "Unsubscribe".

© ${new Date().getFullYear()} EM Evidence · Dr Jake Turner · emevidence999@gmail.com
MEDICAL DISCLAIMER: Tools are for educational purposes only.`
  };
}

// ─────────────────────────────────────────────────────────────
// SEND EMAIL via Gmail SMTP using nodemailer
// ─────────────────────────────────────────────────────────────
async function sendWelcomeEmail(toEmail, preferences) {
  // Dynamic import works in Node 14+ (Netlify Functions runtime)
  const nodemailer = require("nodemailer");

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASS,
    },
  });

  const { subject, html, text } = buildWelcomeEmail(toEmail, preferences);

  await transporter.sendMail({
    from: `"EM Evidence" <${process.env.GMAIL_USER}>`,
    to: toEmail,
    subject,
    html,
    text,
  });
}

// ─────────────────────────────────────────────────────────────
// MAIN HANDLER
// ─────────────────────────────────────────────────────────────
exports.handler = async (event) => {
  // Only accept POST
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  try {
    // Parse form-urlencoded body (standard HTML form POST)
    const params = new URLSearchParams(event.body);
    const email = params.get("email") || "";
    const rawPrefs = params.getAll("preferences[]");

    if (!email || !email.includes("@")) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Invalid email address" }),
      };
    }

    // ── Send welcome email ──────────────────────────────────
    if (process.env.GMAIL_USER && process.env.GMAIL_APP_PASS) {
      await sendWelcomeEmail(email, rawPrefs);
    } else {
      console.warn("GMAIL_USER or GMAIL_APP_PASS not set — welcome email skipped");
    }

    // ── Notify admin (Jake) ─────────────────────────────────
    if (process.env.GMAIL_USER && process.env.GMAIL_APP_PASS) {
      const nodemailer = require("nodemailer");
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: process.env.GMAIL_USER,
          pass: process.env.GMAIL_APP_PASS,
        },
      });
      await transporter.sendMail({
        from: `"EM Evidence" <${process.env.GMAIL_USER}>`,
        to: process.env.GMAIL_USER,
        subject: `New subscriber: ${email}`,
        text: `New signup on emevidence.org\n\nEmail: ${email}\nPreferences:\n${rawPrefs.map(p => `  - ${p}`).join("\n") || "  (none selected)"}\n\nTime: ${new Date().toISOString()}`,
      });
    }

    // ── Redirect to thank-you page ──────────────────────────
    return {
      statusCode: 303,
      headers: {
        Location: "/?subscribed=true",
      },
      body: "",
    };
  } catch (err) {
    console.error("Subscribe function error:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Subscription failed. Please try again." }),
    };
  }
};
