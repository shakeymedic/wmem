// subscribe.js — EM Evidence newsletter signup
// Posts directly to the Loops.so form endpoint from the browser.
// No backend required.

(function () {
  "use strict";

  const LOOPS_ENDPOINT = "https://app.loops.so/api/newsletter-form/cmpy4nf4l2e3d0j1bio5c5g9z";

  // Mailing list IDs (all Public in Loops)
  const LIST_IDS = {
    "Weekly EM Evidence Updates":                    "cmpy5zd8u4kzv8j1a9emeip31",
    "Monthly PHEM Evidence Updates":                 "cmpy60jzs05gt0jzi26tj1acx",
    "Monthly Anaesthetics and ICM Evidence Updates": "cmpy6170t05ob0j0cfkut3vio",
    "Website Updates":                               "cmpy61pvr05uz0j0efg7c20v5",
  };

  // ── Show success banner when returning from a successful signup ────────
  function checkSubscribeSuccess() {
    const url = new URL(window.location.href);
    if (url.searchParams.get("subscribed") === "true") {
      const banner = document.getElementById("subscribeSuccessBanner");
      if (banner) {
        banner.style.display = "block";
        setTimeout(() => {
          const section = document.getElementById("newsletter");
          if (section) section.scrollIntoView({ behavior: "smooth", block: "center" });
        }, 300);
        setTimeout(() => {
          banner.style.opacity = "0";
          banner.style.transition = "opacity 0.5s";
          setTimeout(() => { banner.style.display = "none"; }, 500);
        }, 10000);
      }
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }

  // ── Wire up the newsletter form ────────────────────────────────────────
  function enhanceNewsletterForm() {
    const form      = document.getElementById("newsletterForm");
    if (!form) return;
    const submitBtn = form.querySelector("button[type='submit']");

    form.addEventListener("submit", async function (e) {
      e.preventDefault();

      // Require at least one checkbox
      const checkboxes = form.querySelectorAll("input[type='checkbox']");
      const checked    = Array.from(checkboxes).filter(cb => cb.checked);
      if (checked.length === 0) {
        showFormMessage(form, "error", "Please select at least one update preference.");
        return;
      }

      // Honeypot
      const honeypot = form.querySelector("input[name='_honeypot']");
      if (honeypot && honeypot.value) return;

      const email = (form.querySelector("input[name='email']").value || "").trim();
      if (!email || !email.includes("@")) {
        showFormMessage(form, "error", "Please enter a valid email address.");
        return;
      }

      // Loading state
      if (submitBtn) {
        submitBtn.textContent = "Subscribing\u2026";
        submitBtn.disabled    = true;
        submitBtn.style.opacity = "0.7";
      }

      // Build the Loops form body
      // Pass all selected list IDs as a comma-separated mailingLists field
      const selectedLists = checked
        .map(cb => LIST_IDS[cb.value])
        .filter(Boolean)
        .join(",");

      const body = new URLSearchParams({
        email:        email,
        mailingLists: selectedLists,
        source:       "emevidence.org website",
      }).toString();

      try {
        const res  = await fetch(LOOPS_ENDPOINT, {
          method:  "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body:    body,
        });
        const data = await res.json().catch(() => ({}));

        if (res.ok && data.success !== false) {
          // Success — show banner and reset form
          const banner = document.getElementById("subscribeSuccessBanner");
          if (banner) {
            banner.style.display  = "block";
            banner.style.opacity  = "1";
            banner.style.transition = "";
            setTimeout(() => {
              const section = document.getElementById("newsletter");
              if (section) section.scrollIntoView({ behavior: "smooth", block: "center" });
            }, 200);
            setTimeout(() => {
              banner.style.opacity    = "0";
              banner.style.transition = "opacity 0.5s";
              setTimeout(() => { banner.style.display = "none"; }, 500);
            }, 10000);
          }
          form.reset();
          // Update URL without reloading
          window.history.replaceState({}, document.title, "/?subscribed=true");
          setTimeout(() => window.history.replaceState({}, document.title, "/"), 100);
        } else {
          showFormMessage(form, "error", data.message || "Something went wrong. Please try again.");
        }
      } catch (err) {
        console.error("Subscribe error:", err);
        showFormMessage(form, "error", "Network error. Please check your connection and try again.");
      } finally {
        if (submitBtn) {
          submitBtn.textContent = "Subscribe";
          submitBtn.disabled    = false;
          submitBtn.style.opacity = "1";
        }
      }
    });
  }

  function showFormMessage(form, type, message) {
    let el = form.querySelector(".form-msg");
    if (!el) {
      el = document.createElement("p");
      el.className = "form-msg";
      const btn = form.querySelector("button[type='submit']");
      form.insertBefore(el, btn);
    }
    const isError = type === "error";
    el.style.cssText = `
      color: ${isError ? "#dc2626" : "#065f46"};
      font-size: 14px; font-weight: 500; margin: 0;
      padding: 10px 14px; border-radius: 6px;
      border-left: 3px solid ${isError ? "#dc2626" : "#059669"};
      background: ${isError ? "#fef2f2" : "#ecfdf5"};
    `;
    el.textContent = message;
    el.scrollIntoView({ behavior: "smooth", block: "nearest" });
    if (isError) setTimeout(() => { el.textContent = ""; }, 6000);
  }

  // ── Init ───────────────────────────────────────────────────────────────
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function () {
      checkSubscribeSuccess();
      enhanceNewsletterForm();
    });
  } else {
    checkSubscribeSuccess();
    enhanceNewsletterForm();
  }
})();
