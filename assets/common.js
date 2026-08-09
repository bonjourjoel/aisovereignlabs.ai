// ========== LANG UTILS ===========
const SUPPORTED_LANGS = ["en", "fr"];
const DEFAULT_LANG = "en";

function getLangFromPath() {
  const parts = window.location.pathname.split("/").filter(Boolean);
  return parts.length > 0 && SUPPORTED_LANGS.includes(parts[0])
    ? parts[0]
    : null;
}

function getStoredLangOverride() {
  const storedLang = localStorage.getItem("lang-override");

  // Ignore unsupported values so the public site always resolves to a known language tree.
  return SUPPORTED_LANGS.includes(storedLang) ? storedLang : null;
}

function getPathWithoutLangSuffix() {
  const pathname = window.location.pathname || "/";
  const currentLang = getLangFromPath();

  // Preserve the raw served suffix so `/services/` and `/services/index.html`
  // remain stable instead of being rewritten into another equivalent URL shape.
  if (currentLang === null) {
    return pathname;
  }

  const prefix = "/" + currentLang;
  const suffix = pathname.slice(prefix.length);

  return suffix.length > 0 ? suffix : "/";
}

function buildLocalizedPath(lang, pathWithoutLangSuffix) {
  const suffix = pathWithoutLangSuffix || "/";
  const localizedPath =
    lang === DEFAULT_LANG
      ? suffix
      : "/" + lang + (suffix === "/" ? "/" : suffix);

  // Preserve query parameters and anchors so the language pin survives any entry point.
  return localizedPath + window.location.search + window.location.hash;
}

function switchLang(select) {
  localStorage.setItem("lang-override", select.value);
  const pathWithoutLangSuffix = getPathWithoutLangSuffix();
  const newPath = buildLocalizedPath(select.value, pathWithoutLangSuffix);
  window.location.href = newPath;
}

// ========== AUTO LANG REDIRECT ===========
(function () {
  const pathWithoutLangSuffix = getPathWithoutLangSuffix();
  const storedLang = getStoredLangOverride();

  // Once the user selected a language manually, keep that language pinned on every visit.
  if (storedLang !== null) {
    const desiredStoredPath = buildLocalizedPath(
      storedLang,
      pathWithoutLangSuffix,
    );
    const currentFullPath =
      window.location.pathname + window.location.search + window.location.hash;

    // English uses the bare root path, so compare against the rebuilt absolute target
    // instead of relying on `currentLang`, which is null on canonical English URLs.
    if (desiredStoredPath === currentFullPath) return;

    window.location.replace(desiredStoredPath);
    return;
  }

  if (getLangFromPath() !== null) return;
  const browserLang = (navigator.language || "").slice(0, 2).toLowerCase();
  if (browserLang === DEFAULT_LANG || !SUPPORTED_LANGS.includes(browserLang))
    return;
  window.location.replace(
    buildLocalizedPath(browserLang, pathWithoutLangSuffix),
  );
})();

// ========== LANG SWITCHER INIT ===========
document.addEventListener("DOMContentLoaded", function () {
  const sel = document.querySelector(".lang-switcher select");
  if (sel)
    sel.value = getStoredLangOverride() || getLangFromPath() || DEFAULT_LANG;
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
        inner.style.backgroundPosition =
          p.toFixed(2) + "px " + p.toFixed(2) + "px";
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
