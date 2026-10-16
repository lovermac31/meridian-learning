/* JE × WWL founder film: custom controls, subtitle picker (10 SEO languages, independent of page language),
 * timed links, end card, audience chooser. The page HTML is complete without this script (built by build_pages.py).
 * Analytics: Vercel Web Analytics (window.va) when present; always window.__filmEvents + a "film:event" DOM event.
 * Events carry only language, slot and percentage: never personal data. */
(() => {
  "use strict";
  const $ = (id) => document.getElementById(id);
  const body = document.body, video = $("video"), player = $("player"), stage = player.querySelector(".stage");
  const lang = body.dataset.lang, root = body.dataset.root, primary = body.dataset.primary;
  let D = null, t = null, track = null, sub = lang, captionsOn = true;
  const sent = new Set();
  window.__filmEvents = [];

  function emit(name, data = {}) {
    const ev = { name, data: { lang, ...data } };
    window.__filmEvents.push(ev);
    document.dispatchEvent(new CustomEvent("film:event", { detail: ev }));
    try { if (typeof window.va === "function") window.va("event", ev); } catch (_) { /* never break playback */ }
  }
  const store = {
    get(k) { try { return localStorage.getItem(k); } catch (_) { return null; } },
    set(k, v) { try { localStorage.setItem(k, v); } catch (_) { /* private mode */ } },
  };

  function labels() {
    $("play").setAttribute("aria-label", video.paused ? t.play : t.pause);
    $("mute").setAttribute("aria-label", video.muted ? t.unmute : t.mute);
    $("fs").setAttribute("aria-label", document.fullscreenElement ? t.exitFullscreen : t.fullscreen);
  }

  function loadTrack() {
    video.querySelectorAll("track").forEach((n) => n.remove());
    $("cc").textContent = "";
    track = null;
    if (!captionsOn || sub === "off") return;
    const S = D.langs[sub];
    track = document.createElement("track");
    Object.assign(track, { kind: "subtitles", srclang: S.htmlLang || sub, label: S.name, src: `${root}captions/${sub}.vtt`, default: true });
    video.append(track);
    track.track.mode = "hidden";
    track.track.addEventListener("cuechange", showCue);
  }

  function showCue() {
    const box = $("cc");
    box.textContent = "";
    if (!track) return;
    const cue = track.track.activeCues && track.track.activeCues[0];
    if (!cue) return;
    const S = D.langs[sub];
    box.lang = S.htmlLang || sub; box.dir = S.dir;
    const s = document.createElement("span");
    s.textContent = cue.text;
    box.append(s);
  }

  const fmt = (s) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;

  function onTime() {
    const now = video.currentTime, d = video.duration || 67, tl = D.timeline;
    $("seek").value = now; $("seek").max = d;
    $("time").textContent = `${fmt(now)} / ${fmt(d)}`;
    $("cta-je").hidden = !(now >= tl.je[0] && now < tl.je[1]);
    $("cta-wwl").hidden = !(now >= tl.wwl[0] && now < tl.wwl[1]);
    $("cta-paths").hidden = !(now >= tl.paths[0] && now < tl.paths[1]);
    $("endcard").hidden = !(now >= tl.end || video.ended);
    $("bigplay").hidden = !video.paused || now > 0;
    if (!$("endcard").hidden && !sent.has("qr") && getComputedStyle(document.querySelector(".qrs")).display !== "none") { sent.add("qr"); emit("film_qr_displayed"); }
    for (const q of [25, 50, 75]) {
      if (!video.paused && !video.seeking && now / d * 100 >= q && !sent.has(q)) { sent.add(q); emit("film_progress", { percent: q }); }
    }
  }

  function setPlaying() { $("play").classList.toggle("playing", !video.paused); onTime(); labels(); }
  function toggle() { video.paused ? video.play() : video.pause(); }

  async function fullscreen() {
    try {
      if (document.fullscreenElement || document.webkitFullscreenElement) await (document.exitFullscreen || document.webkitExitFullscreen).call(document);
      else if (player.requestFullscreen || player.webkitRequestFullscreen) await (player.requestFullscreen || player.webkitRequestFullscreen).call(player);
      else if (video.webkitEnterFullscreen) video.webkitEnterFullscreen(); // iPhone: native player shows the selected track
    } catch (_) { /* refused: stay inline */ }
  }

  function setSub(code, user) {
    sub = code;
    captionsOn = code !== "off";
    $("sub").value = code;
    $("ccbtn").setAttribute("aria-pressed", String(captionsOn));
    document.querySelectorAll(".qs").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.sub === code)));
    if (code !== "off") store.set("film-sub-last", code);
    if (user) { store.set("film-sub", code); emit("film_subtitles", { to: code }); }
    loadTrack();
  }

  function wire() {
    video.removeAttribute("controls");
    $("controls").hidden = false;

    const sel = $("sub");
    sel.append(new Option(t.off, "off"));
    for (const [code, x] of Object.entries(D.langs)) { const o = new Option(x.name, code); o.lang = x.htmlLang || code; sel.append(o); }
    const saved = store.get("film-sub");
    setSub(saved && (saved === "off" || D.langs[saved]) ? saved : lang, false);
    sel.addEventListener("change", () => setSub(sel.value, true));

    $("bigplay").addEventListener("click", () => video.play());
    stage.addEventListener("click", (ev) => { if (ev.target === video) toggle(); });
    $("play").addEventListener("click", toggle);
    $("mute").addEventListener("click", () => { video.muted = !video.muted; });
    $("vol").addEventListener("input", (ev) => { video.volume = Number(ev.target.value); video.muted = video.volume === 0; });
    $("ccbtn").addEventListener("click", () => setSub(captionsOn ? "off" : (store.get("film-sub-last") || lang), true));
    $("fs").addEventListener("click", fullscreen);
    $("fs2").addEventListener("click", fullscreen);
    $("cine").addEventListener("click", () => { video.muted = false; video.volume = 1; $("vol").value = 1; video.play(); emit("film_cinematic_audio"); });
    document.querySelectorAll(".qs").forEach((b) => b.addEventListener("click", () => setSub(b.dataset.sub, true)));
    $("seek").addEventListener("input", (ev) => { video.currentTime = Number(ev.target.value); });
    $("replay").addEventListener("click", () => { video.currentTime = 0; video.play(); emit("film_replay"); });

    video.addEventListener("timeupdate", onTime);
    video.addEventListener("loadedmetadata", onTime);
    video.addEventListener("play", () => { setPlaying(); $("replay").hidden = true; if (!sent.has("play")) { sent.add("play"); emit("film_play"); } });
    video.addEventListener("pause", setPlaying);
    video.addEventListener("volumechange", () => { $("mute").classList.toggle("muted", video.muted); if (!video.muted) $("vol").value = video.volume; labels(); });
    video.addEventListener("ended", () => { $("replay").hidden = false; onTime(); if (!sent.has(100)) { sent.add(100); emit("film_complete"); } });
    video.addEventListener("webkitbeginfullscreen", () => { if (track) track.track.mode = "showing"; });
    video.addEventListener("webkitendfullscreen", () => { if (track) track.track.mode = "hidden"; });
    document.addEventListener("fullscreenchange", labels);

    document.addEventListener("click", (ev) => {
      const a = ev.target.closest("a[data-slot]");
      if (!a) return;
      emit("film_cta_click", { slot: a.dataset.slot, at: Math.round(video.currentTime) });
      if (a.href.includes("/inquiry")) emit("film_inquiry_start", { slot: a.dataset.slot });
    });

    document.querySelectorAll(".tabs button").forEach((b) => b.addEventListener("click", () => {
      document.querySelectorAll(".tabs button").forEach((x) => {
        const on = x === b;
        x.setAttribute("aria-pressed", String(on));
        $(`aud-${x.dataset.aud}`).hidden = !on;
      });
      emit("film_audience", { audience: b.dataset.aud });
    }));

    $("lang").addEventListener("change", (ev) => {
      const code = ev.target.value;
      emit("film_language", { to: code });
      location.href = root + (code === primary ? "" : `${code}/`);
    });

    document.addEventListener("keydown", (ev) => {
      const tag = (ev.target.tagName || "").toLowerCase();
      if (ev.metaKey || ev.ctrlKey || ev.altKey || ["input", "select", "textarea"].includes(tag)) return;
      const k = ev.key.toLowerCase();
      if (k === " " && tag === "button") return;
      if (k === " " || k === "k") { ev.preventDefault(); toggle(); }
      else if (k === "m") video.muted = !video.muted;
      else if (k === "c") $("ccbtn").click();
      else if (k === "f") fullscreen();
      else if (k === "arrowleft") video.currentTime = Math.max(0, video.currentTime - 5);
      else if (k === "arrowright") video.currentTime = Math.min(video.duration || 67, video.currentTime + 5);
    });
  }

  fetch(`${root}i18n.json`).then((r) => r.json()).then((data) => {
    D = data; t = D.langs[lang].ui;
    wire(); setPlaying();
  }).catch(() => { /* data failed: the video keeps native controls; the page text is already in the HTML */ });
})();
