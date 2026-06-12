// ========== TOGGLE HELP ===========
function toggleHelp(id) {
  const el = document.getElementById(id);
  if (!el) return;
  const willOpen = !el.classList.contains("visible");
  // close other panels and reset every button to "?"
  document.querySelectorAll(".explanation").forEach(function (e) {
    if (e.id !== id) e.classList.remove("visible");
  });
  document.querySelectorAll(".help-btn").forEach(function (b) {
    b.textContent = "?";
  });
  if (willOpen) {
    el.classList.add("visible");
  } else {
    el.classList.remove("visible");
  }
  // show "-" on the active button while open
  const btn = document.querySelector('[data-exp-btn="' + id + '"]');
  if (btn) btn.textContent = willOpen ? "\u2212" : "?";
}

// ========== WHOLE-BULLET ACCORDION ===========
// The entire bullet (not just the button) toggles its explanation.
document.addEventListener("DOMContentLoaded", function () {
  document.querySelectorAll(".bullet-item").forEach(function (item) {
    item.addEventListener("click", function () {
      const exp = item.querySelector(".explanation");
      if (exp) toggleHelp(exp.id);
    });
  });
});
