// Keep the public route canonical so the language switcher and relative footer links stay stable.
if (!window.location.pathname.endsWith("/")) {
  window.location.replace(window.location.pathname + "/");
}
