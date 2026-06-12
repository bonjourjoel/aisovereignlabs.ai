// ========== CONTACT EMAIL ===========
// Two-step reveal preserved: the first click reveals the address on every
// contact link (and switches them to a mailto:), the second click opens it.
// Updates ALL anchors marked .contact-link so the top-bar button and the
// footer link both work.
function openContactEmail() {
  const user = "joel";
  const domain = "aisovereignlabs";
  const tld = "ai";
  const fullAddress = user + "@" + domain + "." + tld;
  const links = document.querySelectorAll("a.contact-link");
  links.forEach(function (anchor) {
    anchor.href = "mai" + "lto" + ":" + fullAddress;
    anchor.textContent = fullAddress;
  });
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

// ========== BACKGROUND GRID ANIMATION ===========
// CSS animation timelines can be frozen in some embedded previews, so the
// tilted grid is driven here with requestAnimationFrame: it slowly drifts,
// breathes (scale), and a soft gold sheen sweeps across — all on a 16s feel.
(function () {
  function initGrid() {
    const outer = document.querySelector(".bg-grid");
    if (!outer) return;
    const inner = outer.querySelector("div");
    const sheen = document.querySelector(".bg-sheen");
    const start = performance.now();
    function loop(now) {
      const t = (now - start) / 1000;
      const breath = 1.02 + 0.09 * Math.sin((t * 2 * Math.PI) / 16);
      outer.style.transform = "rotate(-9deg) scale(" + breath.toFixed(4) + ")";
      if (inner) {
        const p = ((t / 16) % 1) * 72;
        inner.style.backgroundPosition = p.toFixed(2) + "px " + p.toFixed(2) + "px";
      }
      if (sheen) {
        const s = Math.sin((t * 2 * Math.PI) / 17);
        sheen.style.transform = "translateX(" + (s * 22).toFixed(2) + "%)";
        sheen.style.opacity = (0.45 + 0.45 * s).toFixed(3);
      }
      requestAnimationFrame(loop);
    }
    requestAnimationFrame(loop);
  }
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initGrid);
  } else {
    initGrid();
  }
})();
