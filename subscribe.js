// subscribe.js — EM Evidence newsletter signup
// Posts directly to the Loops.so public form endpoint from the browser.

(function () {
  "use strict";

  var LOOPS_ENDPOINT = "https://app.loops.so/api/newsletter-form/cmpy4nf4l2e3d0j1bio5c5g9z";

  var LIST_IDS = {
    "Weekly EM Evidence Updates":                    "cmpy5zd8u4kzv8j1a9emeip31",
    "Monthly PHEM Evidence Updates":                 "cmpy60jzs05gt0jzi26tj1acx",
    "Monthly Anaesthetics and ICM Evidence Updates": "cmpy6170t05ob0j0cfkut3vio",
    "Website Updates":                               "cmpy61pvr05uz0j0efg7c20v5"
  };

  function showBanner() {
    var banner = document.getElementById("subscribeSuccessBanner");
    if (!banner) { return; }
    banner.style.display    = "block";
    banner.style.opacity    = "1";
    banner.style.transition = "";
    setTimeout(function () {
      var section = document.getElementById("newsletter");
      if (section) { section.scrollIntoView({ behavior: "smooth", block: "center" }); }
    }, 200);
    setTimeout(function () {
      banner.style.opacity    = "0";
      banner.style.transition = "opacity 0.5s";
      setTimeout(function () { banner.style.display = "none"; }, 500);
    }, 10000);
  }

  function showMsg(form, isError, message) {
    var el = form.querySelector(".form-msg");
    if (!el) {
      el = document.createElement("p");
      el.className = "form-msg";
      var btn = form.querySelector("button[type='submit']");
      form.insertBefore(el, btn);
    }
    el.style.cssText = "color:" + (isError ? "#dc2626" : "#065f46") + ";" +
      "font-size:14px;font-weight:500;margin:0;padding:10px 14px;border-radius:6px;" +
      "border-left:3px solid " + (isError ? "#dc2626" : "#059669") + ";" +
      "background:" + (isError ? "#fef2f2" : "#ecfdf5") + ";";
    el.textContent = message;
    el.scrollIntoView({ behavior: "smooth", block: "nearest" });
    if (isError) {
      setTimeout(function () { el.textContent = ""; }, 6000);
    }
  }

  function init() {
    // Show success banner if returning from subscribed=true URL
    var params = new URLSearchParams(window.location.search);
    if (params.get("subscribed") === "true") {
      showBanner();
      window.history.replaceState({}, document.title, window.location.pathname);
    }

    // Wire up the form
    var form = document.getElementById("newsletterForm");
    if (!form) { return; }

    var submitBtn = form.querySelector("button[type='submit']");

    form.addEventListener("submit", function (e) {
      e.preventDefault();

      // Honeypot check
      var honeypot = form.querySelector("input[name='_honeypot']");
      if (honeypot && honeypot.value) { return; }

      // Require at least one checkbox
      var checkboxes = Array.from(form.querySelectorAll("input[type='checkbox']"));
      var checked    = checkboxes.filter(function (cb) { return cb.checked; });
      if (checked.length === 0) {
        showMsg(form, true, "Please select at least one update preference.");
        return;
      }

      // Validate email
      var emailInput = form.querySelector("input[name='email']");
      var email      = (emailInput ? emailInput.value : "").trim();
      if (!email || email.indexOf("@") === -1) {
        showMsg(form, true, "Please enter a valid email address.");
        return;
      }

      // Loading state
      if (submitBtn) {
        submitBtn.textContent   = "Subscribing...";
        submitBtn.disabled      = true;
        submitBtn.style.opacity = "0.7";
      }

      // Build list IDs string
      var selectedLists = checked
        .map(function (cb) { return LIST_IDS[cb.value]; })
        .filter(Boolean)
        .join(",");

      var bodyStr = "email=" + encodeURIComponent(email) +
                    "&mailingLists=" + encodeURIComponent(selectedLists) +
                    "&source=" + encodeURIComponent("emevidence.org website");

      fetch(LOOPS_ENDPOINT, {
        method:  "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body:    bodyStr
      })
      .then(function (res) {
        return res.json().then(function (data) {
          return { ok: res.ok, data: data };
        });
      })
      .then(function (result) {
        if (result.ok && result.data.success !== false) {
          form.reset();
          showBanner();
        } else {
          showMsg(form, true, (result.data && result.data.message) || "Something went wrong. Please try again.");
        }
      })
      .catch(function (err) {
        console.error("Subscribe error:", err);
        showMsg(form, true, "Network error. Please check your connection and try again.");
      })
      .finally(function () {
        if (submitBtn) {
          submitBtn.textContent   = "Subscribe";
          submitBtn.disabled      = false;
          submitBtn.style.opacity = "1";
        }
      });
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }

}());
