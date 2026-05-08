// ========== TOGGLE HELP ===========
function toggleHelp(id) {
  const el = document.getElementById(id);
  const isVisible = el.classList.contains("visible");
  document.querySelectorAll(".explanation").forEach((e) => {
    if (e.id !== id) e.classList.remove("visible");
  });
  if (isVisible) {
    el.classList.remove("visible");
  } else {
    el.classList.add("visible");
  }
}
