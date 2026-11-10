window.dataLayer = window.dataLayer || [];
function gtag() {
  dataLayer.push(arguments);
}

var GA_MEASUREMENT_ID = "G-2MFMP6783S";
var CONSENT_STORAGE_KEY = "restaurant_cookie_consent";

function readStoredConsent() {
  try {
    var value = localStorage.getItem(CONSENT_STORAGE_KEY);
    if (value === "granted" || value === "denied") return value;
  } catch (e) {}
  try {
    var sessionValue = sessionStorage.getItem(CONSENT_STORAGE_KEY);
    if (sessionValue === "granted" || sessionValue === "denied") return sessionValue;
  } catch (e2) {}
  return null;
}

gtag("consent", "default", {
  analytics_storage: "denied",
  ad_storage: "denied",
  ad_user_data: "denied",
  ad_personalization: "denied",
  wait_for_update: 2000
});

gtag("set", "ads_data_redaction", true);
gtag("set", "url_passthrough", true);

var storedConsent = readStoredConsent();
if (storedConsent === "granted") {
  gtag("consent", "update", {
    analytics_storage: "granted",
    ad_storage: "denied",
    ad_user_data: "denied",
    ad_personalization: "denied"
  });
} else if (storedConsent === "denied") {
  gtag("consent", "update", {
    analytics_storage: "denied",
    ad_storage: "denied",
    ad_user_data: "denied",
    ad_personalization: "denied"
  });
}

gtag("js", new Date());
gtag("config", GA_MEASUREMENT_ID, {
  anonymize_ip: true,
  allow_google_signals: false,
  allow_ad_personalization_signals: false
});

var googleTag = document.createElement("script");
googleTag.async = true;
googleTag.src = "https://www.googletagmanager.com/gtag/js?id=" + GA_MEASUREMENT_ID;
googleTag.setAttribute("data-hummus-ga", "true");
document.head.appendChild(googleTag);
