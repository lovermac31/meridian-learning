/* Founder-film deck: present mode (one slide at a time on wide screens: arrows, swipe, #n deep links), the language
 * menu, and the film slide's 10-language subtitle picker. Without this script the slides stay stacked and readable,
 * and the video still plays with the browser's own subtitle menu. */
(() => {
  "use strict";
  const slides = [...document.querySelectorAll(".slide")];
  const wide = window.matchMedia("(min-width: 821px) and (min-height: 520px)");
  const video = document.querySelector(".dvideo");
  let i = 0;

  /* language menu: go to the same slide in the chosen language */
  const dlang = document.getElementById("dlang");
  if (dlang) dlang.addEventListener("change", () => { location.href = dlang.value + location.hash; });

  /* subtitle picker: show exactly one track (or none) */
  const pick = document.querySelector(".dsub");
  function setSub(code) {
    if (!video) return;
    [...video.textTracks].forEach((tr) => { tr.mode = "disabled"; });
    if (code !== "off") {
      const want = [...video.querySelectorAll("track")].findIndex((t) => t.src.endsWith(`/captions/${code}.vtt`));
      if (want >= 0) video.textTracks[want].mode = "showing";
    }
  }
  if (pick && video) {
    // each deck language starts with its own subtitles (set in the HTML); the viewer can switch any time
    pick.addEventListener("change", () => setSub(pick.value));
    // tracks attach asynchronously; apply once they exist
    const apply = () => setSub(pick.value);
    if (video.textTracks.length) apply(); else video.addEventListener("loadedmetadata", apply, { once: true });
    video.textTracks.addEventListener && video.textTracks.addEventListener("addtrack", apply);
    setTimeout(apply, 300);
  }

  const fromHash = () => Math.min(slides.length - 1, Math.max(0, (parseInt(location.hash.slice(2), 10) || 1) - 1));

  function show(n, push) {
    i = Math.min(slides.length - 1, Math.max(0, n));
    slides.forEach((s, k) => { s.classList.toggle("on", k === i); s.setAttribute("aria-hidden", String(k !== i)); s.inert = k !== i; });
    if (video && !slides[i].contains(video)) video.pause();
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
    const tag = (ev.target.tagName || "").toLowerCase();
    if (["video", "select", "input", "textarea", "button"].includes(tag)) return; // let the player and menus use their keys
    const k = ev.key;
    if (["ArrowRight", "PageDown", " "].includes(k)) { ev.preventDefault(); show(i + 1, true); }
    else if (["ArrowLeft", "PageUp"].includes(k)) { ev.preventDefault(); show(i - 1, true); }
    else if (k === "Home") show(0, true);
    else if (k === "End") show(slides.length - 1, true);
    else if (k.toLowerCase() === "f") document.getElementById("dfs").click();
  });
  let x0 = null;
  document.addEventListener("touchstart", (ev) => { x0 = ev.target.closest("video") ? null : ev.touches[0].clientX; }, { passive: true });
  document.addEventListener("touchend", (ev) => {
    if (x0 === null || !document.body.classList.contains("present")) return;
    const dx = ev.changedTouches[0].clientX - x0; x0 = null;
    if (Math.abs(dx) > 50) show(i + (dx < 0 ? 1 : -1), true);
  });
  window.addEventListener("hashchange", () => { if (document.body.classList.contains("present")) show(fromHash(), false); });
  wide.addEventListener("change", setMode);
  setMode();
})();
