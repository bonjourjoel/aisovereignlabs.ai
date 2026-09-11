// ---- Shared header runtime contract ----

const SITE_NAV_MOBILE_QUERY = "(max-width: 960px)";
const DEFAULT_SITE_NAV_BACKGROUND = "rgba(10,13,19,0.86)";
const SCROLLED_SITE_NAV_BACKGROUND = "rgba(10,13,19,0.96)";
const OPEN_SITE_NAV_BACKGROUND = "rgba(10,13,19,0.98)";
const INDEX_HTML_SUFFIX = "/index.html";

/**
 * Returns whether the shared header should switch to its fullscreen mobile sheet.
 * This breakpoint is intentionally wider than AICode because this site carries a
 * longer brand name and several cross-site links in the same shell.
 */
function isSiteNavMobile() {
  return window.matchMedia(SITE_NAV_MOBILE_QUERY).matches;
}

/**
 * Computes the correct header background for the current scroll and menu state.
 */
function computeSiteNavBackground(nav) {
  if (!nav) {
    return DEFAULT_SITE_NAV_BACKGROUND;
  }

  // The open mobile sheet needs an opaque cap so the close button and brand stay
  // readable while the fullscreen panel animates beneath the fixed header.
  if (nav.classList.contains("is-mobile-nav-open")) {
    return OPEN_SITE_NAV_BACKGROUND;
  }

  // Scrolling deepens the surface slightly so the sticky shell keeps separating
  // itself from the content while staying consistent with the site palette.
  return window.scrollY > 40
    ? SCROLLED_SITE_NAV_BACKGROUND
    : DEFAULT_SITE_NAV_BACKGROUND;
}

/**
 * Reapplies the sticky header background after scroll or menu-state changes.
 */
function syncSiteNavBackground() {
  const nav =
    document.querySelector(".site-nav") || document.querySelector("nav");

  if (!nav) {
    return;
  }

  nav.style.background = computeSiteNavBackground(nav);
}

(function () {
  syncSiteNavBackground();
  window.addEventListener("scroll", syncSiteNavBackground, { passive: true });
})();

// ---- Lang utils ----

const SUPPORTED_LANGS = ["en", "fr"];
const DEFAULT_LANG = "en";

/**
 * Reads the current language prefix from the URL.
 */
function getLangFromPath() {
  const parts = window.location.pathname.split("/").filter(Boolean);

  return parts.length > 0 && SUPPORTED_LANGS.includes(parts[0])
    ? parts[0]
    : null;
}

/**
 * Returns the last language explicitly selected by the visitor, if any.
 */
function getStoredLangOverride() {
  const storedLang = localStorage.getItem("lang-override");

  // Ignore unsupported values so the public site always resolves to a known language tree.
  return SUPPORTED_LANGS.includes(storedLang) ? storedLang : null;
}

/**
 * Removes the language prefix while preserving the raw served suffix.
 */
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

/**
 * Rebuilds the target URL for a given language while preserving query and hash state.
 */
function buildLocalizedPath(lang, pathWithoutLangSuffix) {
  const suffix = pathWithoutLangSuffix || "/";
  const localizedPath =
    lang === DEFAULT_LANG
      ? suffix
      : "/" + lang + (suffix === "/" ? "/" : suffix);

  // Preserve query parameters and anchors so the language pin survives any entry point.
  return localizedPath + window.location.search + window.location.hash;
}

/**
 * Switches the current page between the English root tree and the generated French tree.
 */
function switchLang(select) {
  localStorage.setItem("lang-override", select.value);

  const pathWithoutLangSuffix = getPathWithoutLangSuffix();
  const newPath = buildLocalizedPath(select.value, pathWithoutLangSuffix);

  window.location.href = newPath;
}

// ---- Auto lang redirect ----

(function () {
  const currentLang = getLangFromPath();
  const pathWithoutLangSuffix = getPathWithoutLangSuffix();
  const storedLang = getStoredLangOverride();

  // When the URL already carries a supported language prefix, that explicit
  // destination wins over any stale domain-local preference stored earlier.
  if (currentLang !== null) {
    if (storedLang !== currentLang) {
      localStorage.setItem("lang-override", currentLang);
    }
    return;
  }

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
    if (desiredStoredPath === currentFullPath) {
      return;
    }

    window.location.replace(desiredStoredPath);
    return;
  }

  const browserLang = (navigator.language || "").slice(0, 2).toLowerCase();

  if (browserLang === DEFAULT_LANG || !SUPPORTED_LANGS.includes(browserLang)) {
    return;
  }

  window.location.replace(
    buildLocalizedPath(browserLang, pathWithoutLangSuffix),
  );
})();

// ---- Lang switcher init ----

/**
 * Synchronizes the shared language selector with the effective site locale.
 */
function initLangSelect() {
  const select = document.querySelector(".lang-switcher select");

  if (!select) {
    return;
  }

  select.value = getStoredLangOverride() || getLangFromPath() || DEFAULT_LANG;
}

/**
 * Normalizes one internal site path so header links can be compared across
 * English, French, slashless, and explicit /index.html variants.
 */
function normalizeSitePathForNav(pathname) {
  const normalizedInput = (pathname || "/").trim();

  if (normalizedInput.length === 0) {
    return "/";
  }

  const withoutIndexHtml = normalizedInput.endsWith(INDEX_HTML_SUFFIX)
    ? normalizedInput.slice(0, -INDEX_HTML_SUFFIX.length)
    : normalizedInput;
  const withLeadingSlash = withoutIndexHtml.startsWith("/")
    ? withoutIndexHtml
    : "/" + withoutIndexHtml;

  if (withLeadingSlash === "/") {
    return "/";
  }

  return withLeadingSlash.endsWith("/")
    ? withLeadingSlash
    : withLeadingSlash + "/";
}

/**
 * Marks only the current internal page link in the shared header.
 *
 * The header partial is shared between several routes, so the active state
 * must be derived at runtime instead of being hardcoded in the fragment.
 */
function syncCurrentInternalNavLink() {
  const navLinks = document.querySelectorAll('.nav-links a[href^="/"]');

  if (navLinks.length === 0) {
    return;
  }

  const currentInternalPath = normalizeSitePathForNav(
    getPathWithoutLangSuffix(),
  );

  navLinks.forEach(function (navLink) {
    const href = navLink.getAttribute("href");

    if (href === null) {
      navLink.removeAttribute("aria-current");
      return;
    }

    const normalizedHref = normalizeSitePathForNav(href);

    if (normalizedHref === currentInternalPath) {
      navLink.setAttribute("aria-current", "page");
      return;
    }

    navLink.removeAttribute("aria-current");
  });
}

// ---- Mobile nav fullscreen sheet ----

/**
 * Wires the shared burger button to the fullscreen navigation sheet.
 */
function initMobileNav() {
  const nav =
    document.querySelector(".site-nav") || document.querySelector("nav");

  if (!nav) {
    return;
  }

  const toggle = nav.querySelector("[data-nav-toggle]");
  const panel = nav.querySelector("[data-nav-panel]");

  if (!toggle || !panel) {
    return;
  }

  /**
   * Keeps ARIA state, body scroll locking, and sticky background aligned after every interaction.
   */
  function syncMobileNavState() {
    const isMobile = isSiteNavMobile();

    // Moving back to desktop must tear the sheet down because the same DOM nodes
    // are reused inline in the desktop header.
    if (!isMobile && nav.classList.contains("is-mobile-nav-open")) {
      nav.classList.remove("is-mobile-nav-open");
    }

    const isOpen = isMobile && nav.classList.contains("is-mobile-nav-open");
    const openLabel =
      toggle.getAttribute("data-label-open") || "Open mobile menu";
    const closeLabel =
      toggle.getAttribute("data-label-close") || "Close mobile menu";

    toggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
    toggle.setAttribute("aria-label", isOpen ? closeLabel : openLabel);
    panel.setAttribute("aria-hidden", isMobile ? String(!isOpen) : "false");
    document.body.classList.toggle("has-mobile-nav-open", isOpen);
    syncSiteNavBackground();
  }

  toggle.addEventListener("click", function () {
    if (!isSiteNavMobile()) {
      return;
    }

    nav.classList.toggle("is-mobile-nav-open");
    syncMobileNavState();
  });

  panel.addEventListener("click", function (event) {
    const navLink = event.target.closest(".nav-links a");

    if (!navLink || !isSiteNavMobile()) {
      return;
    }

    // Same-page links do not reload the document, so the sheet must close
    // immediately after the tap to reveal the destination section.
    nav.classList.remove("is-mobile-nav-open");
    syncMobileNavState();
  });

  document.addEventListener("keydown", function (event) {
    if (event.key !== "Escape") {
      return;
    }

    if (!nav.classList.contains("is-mobile-nav-open")) {
      return;
    }

    nav.classList.remove("is-mobile-nav-open");
    syncMobileNavState();
  });

  window.addEventListener("resize", syncMobileNavState);
  syncMobileNavState();
}

// ---- Background grid animation ----
// CSS animation timelines can be frozen in some embedded previews, so the
// tilted grid is driven here with requestAnimationFrame: it slowly drifts,
// breathes (scale), and a soft gold sheen sweeps across — all on a 16s feel.

(function () {
  /**
   * Animates the background grid and sheen while keeping the DOM contract minimal.
   */
  function initGrid() {
    const outer = document.querySelector(".bg-grid");

    if (!outer) {
      return;
    }

    const inner = outer.querySelector("div");
    const sheen = document.querySelector(".bg-sheen");
    const start = performance.now();

    /**
     * Drives one animation frame of the background drift.
     */
    function loop(now) {
      const t = (now - start) / 1000;
      const breath = 1.02 + 0.09 * Math.sin((t * 2 * Math.PI) / 16);

      // The outer plane breathes slowly so the grid never feels completely static.
      outer.style.transform = "rotate(-9deg) scale(" + breath.toFixed(4) + ")";

      if (inner) {
        const p = ((t / 16) % 1) * 72;

        // The inner grid drifts diagonally to create continuous motion without reflow.
        inner.style.backgroundPosition =
          p.toFixed(2) + "px " + p.toFixed(2) + "px";
      }

      if (sheen) {
        const s = Math.sin((t * 2 * Math.PI) / 17);

        // The sheen uses a slightly different cadence so the composition never loops in lockstep.
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

document.addEventListener("DOMContentLoaded", function () {
  initLangSelect();
  syncCurrentInternalNavLink();
  initMobileNav();
});
