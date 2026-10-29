(function () {
  var STORAGE_KEY = "restaurant_cookie_consent";
  var GA_ID = "G-2MFMP6783S";
  var gaLoaded = false;

  function ensureGtag() {
    window.dataLayer = window.dataLayer || [];
    if (typeof window.gtag !== "function") {
      window.gtag = function () {
        window.dataLayer.push(arguments);
      };
    }
  }

  function clearGoogleAnalyticsCookies() {
    var hostname = window.location.hostname;
    var known = ["_ga", "_gid", "_gat"];
    var found = document.cookie.split(";").map(function (part) {
      return part.split("=")[0].trim();
    }).filter(function (name) {
      return (
        name.indexOf("_ga") === 0 ||
        name.indexOf("_gid") === 0 ||
        name.indexOf("_gat") === 0
      );
    });
    var names = known.concat(found).filter(function (name, index, list) {
      return name && list.indexOf(name) === index;
    });

    names.forEach(function (name) {
      document.cookie = name + "=; Max-Age=0; path=/";
      if (!hostname) return;
      document.cookie = name + "=; Max-Age=0; path=/; domain=" + hostname;
      if (hostname.indexOf("www.") === 0) {
        document.cookie = name + "=; Max-Age=0; path=/; domain=" + hostname.slice(4);
      }
      if (hostname.indexOf(".") !== -1) {
        document.cookie = name + "=; Max-Age=0; path=/; domain=." + hostname.replace(/^www\./, "");
      }
    });
  }

  function getConsent() {
    try {
      var value = localStorage.getItem(STORAGE_KEY);
      if (value === "granted" || value === "denied") return value;
    } catch (e) {}
    try {
      var sessionValue = sessionStorage.getItem(STORAGE_KEY);
      if (sessionValue === "granted" || sessionValue === "denied") return sessionValue;
    } catch (e2) {}
    return null;
  }

  function setConsent(value) {
    try {
      localStorage.setItem(STORAGE_KEY, value);
      return;
    } catch (e) {}
    try {
      sessionStorage.setItem(STORAGE_KEY, value);
    } catch (e2) {}
  }

  function getAnalyticsToggle() {
    return document.getElementById("cookie-analytics-toggle");
  }

  function setToggleFromConsent(consent) {
    var toggle = getAnalyticsToggle();
    if (!toggle) return;
    toggle.checked = consent !== "denied";
  }

  function hideBanner() {
    var banner = document.getElementById("cookie-banner");
    if (!banner) return;
    banner.hidden = true;
    banner.setAttribute("aria-hidden", "true");
  }

  function showBanner() {
    var banner = document.getElementById("cookie-banner");
    if (!banner) return;
    banner.hidden = false;
    banner.removeAttribute("aria-hidden");
  }

  function closeModal() {
    var modal = document.getElementById("cookie-settings-modal");
    if (!modal) return;
    modal.hidden = true;
    modal.setAttribute("aria-hidden", "true");
    document.body.classList.remove("cookie-modal-open");
  }

  function openModal() {
    var modal = document.getElementById("cookie-settings-modal");
    if (!modal) return;
    setToggleFromConsent(getConsent());
    modal.hidden = false;
    modal.removeAttribute("aria-hidden");
    document.body.classList.add("cookie-modal-open");
    var toggle = getAnalyticsToggle();
    if (toggle) toggle.focus();
  }

  function grantAnalyticsConsent() {
    ensureGtag();
    gtag("consent", "update", {
      analytics_storage: "granted",
      ad_storage: "denied",
      ad_user_data: "denied",
      ad_personalization: "denied"
    });
  }

  function denyAnalyticsConsent() {
    ensureGtag();
    gtag("consent", "update", {
      analytics_storage: "denied",
      ad_storage: "denied",
      ad_user_data: "denied",
      ad_personalization: "denied"
    });
  }

  function configureGoogleAnalytics() {
    ensureGtag();
    grantAnalyticsConsent();
    gtag("js", new Date());
    gtag("config", GA_ID, {
      anonymize_ip: true,
      allow_google_signals: false,
      allow_ad_personalization_signals: false
    });
    gaLoaded = true;
  }

  function loadGoogleAnalytics() {
    if (gaLoaded) {
      configureGoogleAnalytics();
      return;
    }

    ensureGtag();
    grantAnalyticsConsent();

    var existing = document.querySelector("script[data-hummus-ga]");
    if (existing) {
      if (existing.getAttribute("data-loaded") === "true") {
        configureGoogleAnalytics();
        return;
      }
      existing.addEventListener("load", function () {
        existing.setAttribute("data-loaded", "true");
        configureGoogleAnalytics();
      });
      return;
    }

    var script = document.createElement("script");
    script.async = true;
    script.src = "https://www.googletagmanager.com/gtag/js?id=" + GA_ID;
    script.setAttribute("data-hummus-ga", "true");
    script.onload = function () {
      script.setAttribute("data-loaded", "true");
      configureGoogleAnalytics();
    };
    script.onerror = function () {
      gaLoaded = false;
    };
    document.head.appendChild(script);
  }

  function applyConsent(granted) {
    closeModal();
    if (granted) {
      setConsent("granted");
      hideBanner();
      loadGoogleAnalytics();
      return;
    }
    setConsent("denied");
    hideBanner();
    denyAnalyticsConsent();
    clearGoogleAnalyticsCookies();
  }

  function acceptAll() {
    applyConsent(true);
  }

  function acceptSelected() {
    var toggle = getAnalyticsToggle();
    applyConsent(toggle ? toggle.checked : false);
  }

  function bindModalClose() {
    document.querySelectorAll("[data-cookie-modal-close]").forEach(function (el) {
      el.addEventListener("click", closeModal);
    });
    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape") {
        var modal = document.getElementById("cookie-settings-modal");
        if (modal && !modal.hidden) closeModal();
      }
    });
  }

  function bindSettingsLinks() {
    document.querySelectorAll("[data-cookie-settings]").forEach(function (link) {
      link.addEventListener("click", function (event) {
        event.preventDefault();
        if (!getConsent()) showBanner();
        openModal();
      });
    });
  }

  function init() {
    ensureGtag();

    var acceptAllBtn = document.getElementById("cookie-accept-all");
    var openSettingsBtn = document.getElementById("cookie-open-settings");
    var acceptSelectedBtn = document.getElementById("cookie-accept-selected");

    if (acceptAllBtn) acceptAllBtn.addEventListener("click", acceptAll);
    if (openSettingsBtn) openSettingsBtn.addEventListener("click", openModal);
    if (acceptSelectedBtn) acceptSelectedBtn.addEventListener("click", acceptSelected);
    bindModalClose();
    bindSettingsLinks();

    var consent = getConsent();
    if (consent === "granted") {
      hideBanner();
      closeModal();
      loadGoogleAnalytics();
      return;
    }
    if (consent === "denied") {
      hideBanner();
      closeModal();
      clearGoogleAnalyticsCookies();
      return;
    }
    showBanner();
    openModal();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }

  window.hummusCookieConsent = {
    acceptAll: acceptAll,
    acceptSelected: acceptSelected,
    openModal: openModal,
    showBanner: showBanner
  };
})();
