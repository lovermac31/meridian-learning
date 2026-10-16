/* Present mode for the founder-film deck: one slide at a time on wide screens, arrows/swipe/keys, #n deep links.
 * Without this script (or on phones) the slides stay stacked and fully readable. */
(() => {
  "use strict";
  const slides = [...document.querySelectorAll(".slide")];
  const wide = window.matchMedia("(min-width: 821px) and (min-height: 520px)");
  let i = 0;

  const fromHash = () => Math.min(slides.length - 1, Math.max(0, (parseInt(location.hash.slice(2), 10) || 1) - 1));

  function show(n, push) {
    i = Math.min(slides.length - 1, Math.max(0, n));
    slides.forEach((s, k) => { s.classList.toggle("on", k === i); s.setAttribute("aria-hidden", String(k !== i)); s.inert = k !== i; });
    document.getElementById("count").textContent = `${i + 1} / ${slides.length}`;
    document.getElementById("bar").style.width = `${((i + 1) / slides.length) * 100}%`;
    if (push) history.replaceState(null, "", `#s${i + 1}`);
  }

  function setMode() {
    const on = wide.matches;
    document.body.classList.toggle("present", on);
    document.getElementById("dctl").hidden = !on;
    if (on) show(fromHash(), false);
    else slides.forEach((s) => { s.classList.remove("on"); s.removeAttribute("aria-hidden"); s.inert = false; });
  }

  document.getElementById("prev").addEventListener("click", () => show(i - 1, true));
  document.getElementById("next").addEventListener("click", () => show(i + 1, true));
  document.getElementById("dfs").addEventListener("click", () => {
    try { document.fullscreenElement ? document.exitFullscreen() : document.documentElement.requestFullscreen(); } catch (_) { /* not allowed */ }
  });
  document.addEventListener("keydown", (ev) => {
    if (!document.body.classList.contains("present") || ev.metaKey || ev.ctrlKey || ev.altKey) return;
    const k = ev.key;
    if (["ArrowRight", "PageDown", " "].includes(k)) { ev.preventDefault(); show(i + 1, true); }
    else if (["ArrowLeft", "PageUp"].includes(k)) { ev.preventDefault(); show(i - 1, true); }
    else if (k === "Home") show(0, true);
    else if (k === "End") show(slides.length - 1, true);
    else if (k.toLowerCase() === "f") document.getElementById("dfs").click();
  });
  let x0 = null;
  document.addEventListener("touchstart", (ev) => { x0 = ev.touches[0].clientX; }, { passive: true });
  document.addEventListener("touchend", (ev) => {
    if (x0 === null || !document.body.classList.contains("present")) return;
    const dx = ev.changedTouches[0].clientX - x0; x0 = null;
    if (Math.abs(dx) > 50) show(i + (dx < 0 ? 1 : -1), true);
  });
  window.addEventListener("hashchange", () => { if (document.body.classList.contains("present")) show(fromHash(), false); });
  wide.addEventListener("change", setMode);
  setMode();
})();
