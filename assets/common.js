// ========== CONTACT EMAIL ===========
function openContactEmail() {
  const user = "joel";
  const domain = "aisovereignlabs";
  const tld = "ai";
  const fullAddress = user + "@" + domain + "." + tld;
  const anchor = document.getElementById("contact-link");
  anchor.href = "mai" + "lto" + ":" + fullAddress;
  anchor.textContent = fullAddress;
}

// ========== LANG UTILS ===========
const SUPPORTED_LANGS = ["en", "fr"];
const DEFAULT_LANG = "en";

function getLangFromPath() {
  const parts = window.location.pathname.split("/").filter(Boolean);
  return parts.length > 0 && SUPPORTED_LANGS.includes(parts[0])
    ? parts[0]
    : null;
}

function switchLang(select) {
  localStorage.setItem("lang-override", select.value);
  const parts = window.location.pathname.split("/").filter(Boolean);
  const hasLang = parts.length > 0 && SUPPORTED_LANGS.includes(parts[0]);
  const pathWithoutLang = hasLang ? parts.slice(1) : parts;
  const suffix =
    pathWithoutLang.length > 0 ? "/" + pathWithoutLang.join("/") : "/";
  const newPath =
    select.value === DEFAULT_LANG ? suffix : "/" + select.value + suffix;
  window.location.href = newPath;
}

// ========== AUTO LANG REDIRECT ===========
(function () {
  if (getLangFromPath() !== null) return;
  if (localStorage.getItem("lang-override") === DEFAULT_LANG) return;
  const browserLang = (navigator.language || "").slice(0, 2).toLowerCase();
  if (browserLang === DEFAULT_LANG || !SUPPORTED_LANGS.includes(browserLang))
    return;
  const parts = window.location.pathname.split("/").filter(Boolean);
  const suffix = parts.length > 0 ? "/" + parts.join("/") : "/";
  window.location.replace("/" + browserLang + suffix);
})();

// ========== LANG SWITCHER INIT ===========
document.addEventListener("DOMContentLoaded", function () {
  const sel = document.querySelector(".lang-switcher select");
  if (sel) sel.value = getLangFromPath() || DEFAULT_LANG;
});
