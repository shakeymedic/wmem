// subscribe.js — Frontend newsletter form handler for emevidence.org
// Handles form submission UX, validation, and success/error states.

(function () {
  "use strict";

  // ── Show success banner if returning from subscribe redirect ─────────────
  function checkSubscribeSuccess() {
    const url = new URL(window.location.href);
    if (url.searchParams.get("subscribed") === "true") {
      const banner = document.getElementById("subscribeSuccessBanner");
      if (banner) {
        banner.style.display = "block";
        // Scroll to newsletter section briefly to confirm
        setTimeout(() => {
          const section = document.getElementById("newsletter");
          if (section) section.scrollIntoView({ behavior: "smooth", block: "center" });
        }, 300);
        // Auto-hide after 10 seconds
        setTimeout(() => {
          banner.style.opacity = "0";
          banner.style.transition = "opacity 0.5s";
          setTimeout(() => { banner.style.display = "none"; }, 500);
        }, 10000);
      }
      // Clean the URL so refreshing doesn't re-trigger
      const cleanUrl = window.location.pathname;
      window.history.replaceState({}, document.title, cleanUrl);
    }
  }

  // ── Enhance the newsletter form with client-side UX improvements ─────────
  function enhanceNewsletterForm() {
    const form = document.getElementById("newsletterForm");
    if (!form) return;

    const submitBtn = form.querySelector("button[type='submit']");

    // Require at least one preference to be checked
    form.addEventListener("submit", function (e) {
      const checkboxes = form.querySelectorAll("input[type='checkbox']");
      const anyChecked = Array.from(checkboxes).some(cb => cb.checked);

      if (!anyChecked) {
        e.preventDefault();
        showFormError(form, "Please select at least one update preference.");
        return;
      }

      // Bot honeypot check
      const honeypot = form.querySelector("input[name='_honeypot']");
      if (honeypot && honeypot.value) {
        e.preventDefault();
        return; // silently discard bot submission
      }

      // Show loading state
      if (submitBtn) {
        submitBtn.textContent = "Subscribing…";
        submitBtn.disabled = true;
        submitBtn.style.opacity = "0.7";
      }
    });
  }

  function showFormError(form, message) {
    let errorEl = form.querySelector(".form-error-msg");
    if (!errorEl) {
      errorEl = document.createElement("p");
      errorEl.className = "form-error-msg";
      errorEl.style.cssText = "color:#dc2626;font-size:14px;font-weight:500;margin:0;padding:10px 14px;background:#fef2f2;border-radius:6px;border-left:3px solid #dc2626;";
      const submitBtn = form.querySelector("button[type='submit']");
      form.insertBefore(errorEl, submitBtn);
    }
    errorEl.textContent = message;
    errorEl.scrollIntoView({ behavior: "smooth", block: "nearest" });
    setTimeout(() => { errorEl.textContent = ""; }, 5000);
  }

  // ── Init ─────────────────────────────────────────────────────────────────
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
