/* ============================================================
   GOALESS core — settings, storage, audio, toasts, modals, fx
   Classic-script global: window.GL
   ============================================================ */
(function () {
  "use strict";

  const LS_PREFIX = "footyless.";
  const DAY_MS = 86400000;

  /* ---------------- storage ---------------- */
  const store = {
    get(key, fallback) {
      try {
        const raw = localStorage.getItem(LS_PREFIX + key);
        return raw == null ? fallback : JSON.parse(raw);
      } catch (_) { return fallback; }
    },
    set(key, value) {
      try { localStorage.setItem(LS_PREFIX + key, JSON.stringify(value)); } catch (_) {}
    },
    remove(key) {
      try { localStorage.removeItem(LS_PREFIX + key); } catch (_) {}
    },
  };

  /* ---------------- settings ---------------- */
  const DEFAULT_SETTINGS = {
    theme: "dark",          // 'dark' | 'light'
    sfx: true,
    music: false,
    colorblind: false,
    reducedMotion: "system" // 'system' | 'on' | 'off'
  };
  let settings = Object.assign({}, DEFAULT_SETTINGS, store.get("settings", {}));
  const settingsListeners = [];

  function applyDocumentSettings() {
    const root = document.documentElement;
    root.dataset.theme = settings.theme;
    root.dataset.colorblind = String(settings.colorblind);
    const sysReduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const reduced =
      settings.reducedMotion === "on" ? true :
      settings.reducedMotion === "off" ? false : sysReduce;
    root.dataset.reduced = reduced ? "on" : "off";
  }
  function setSetting(key, value) {
    settings[key] = value;
    store.set("settings", settings);
    applyDocumentSettings();
    settingsListeners.forEach(fn => fn(key, value, settings));
  }
  applyDocumentSettings();
  window.addEventListener("matchMedia" in window ? "change" : "change", () => {}, { once: true });

  /* ---------------- audio engine (procedural, royalty-free) ---------------- */
  let ctx = null;
  let musicNodes = null;

  function audioCtx() {
    if (!ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      ctx = new AC();
    }
    if (ctx.state === "suspended") ctx.resume();
    return ctx;
  }
  // unlock on first gesture
  window.addEventListener("pointerdown", () => audioCtx(), { once: true, passive: true });

  function tone({ freq = 440, endFreq = null, dur = 0.12, type = "sine", gain = 0.16, delay = 0, glide = false }) {
    if (!settings.sfx) return;
    const ac = audioCtx(); if (!ac) return;
    const t0 = ac.currentTime + delay;
    const osc = ac.createOscillator();
    const g = ac.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t0);
    if (endFreq != null) osc.frequency.exponentialRampToValueAtTime(Math.max(30, endFreq), t0 + dur);
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(gain, t0 + 0.012);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    osc.connect(g).connect(ac.destination);
    osc.start(t0); osc.stop(t0 + dur + 0.05);
  }

  function noise({ dur = 0.2, gain = 0.1, delay = 0, hp = 800 }) {
    if (!settings.sfx) return;
    const ac = audioCtx(); if (!ac) return;
    const t0 = ac.currentTime + delay;
    const len = Math.floor(ac.sampleRate * dur);
    const buf = ac.createBuffer(1, len, ac.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / len);
    const src = ac.createBufferSource(); src.buffer = buf;
    const filt = ac.createBiquadFilter(); filt.type = "highpass"; filt.frequency.value = hp;
    const g = ac.createGain();
    g.gain.setValueAtTime(gain, t0);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    src.connect(filt).connect(g).connect(ac.destination);
    src.start(t0);
  }

  const sfx = (() => {
    /* --- 1) WAV engine: Kenney CC0 UI pack (assets/audio/ui) + game stingers, with synth fallback --- */
    const ROOT = document.body.dataset.page === "game" ? "../../" : "";
    const LIB = {
      tap: "ui/tap", select: "ui/select", reveal: "ui/reveal", correct: "ui/correct",
      wrong: "ui/wrong", won: "ui/win", lost: "ui/lost", open: "ui/open", close: "ui/close",
      tick: "ui/tick", intro: "ui/intro", swish: "ui/swish", howto: "ui/howto",
      drum: "drum", whistle: "whistle", finished: "finished",
    };
    let howls = null;
    function initHowler() {
      if (howls || !window.Howl) return;
      howls = {};
      Object.entries(LIB).forEach(([name, path]) => {
        try { howls[name] = new Howl({ src: [`${ROOT}assets/audio/${path}.wav`], preload: true, volume: name === "drum" ? 0.8 : 0.7 }); } catch (_) {}
      });
    }
    function wav(name) {
      if (!settings.sfx) return true;
      initHowler();
      const h = howls && howls[name];
      if (h) { h.play(); return true; }
      return false;
    }
    return {
      tap()    { wav("tap"); },
      press()  { wav("select"); },
      swoosh() { wav("swish"); },
      type()   { wav("tick"); },
      reveal() { wav("reveal"); },
      correct(){ wav("correct"); },
      wrong()  { wav("wrong"); },
      win()    { wav("won"); },
      lost()   { wav("lost"); },
      whistle(){ wav("whistle"); },
      drum()   { wav("intro"); },
      tick()   { wav("tick"); },
      fanfare(){ wav("finished"); },
      openUI() { wav("open"); },
      closeUI(){ wav("close"); },
    };
  })();

  /* generative ambient pad for "music" toggle — crowds if WAV lib ready, pad otherwise */
  function startMusic() {
    if (musicNodes || !settings.music) return;
    const ac = audioCtx(); if (!ac) return;
    // prefer looping crowd bed
    initCrowdProbe();
    function initCrowdProbe() {
      const ROOT = document.body.dataset.page === "game" ? "../../" : "";
      if (window.Howl) {
        try {
          const c = new Howl({ src: [`${ROOT}assets/audio/crowd.wav`], loop: true, volume: 0 });
          musicNodes = { crowd: c };
          c.play();
          c.fade(0, 0.22, 1200);
          return;
        } catch (_) {}
      }
      padFallback();
    }
    function padFallback() {
      const master = ac.createGain(); master.gain.value = 0;
      master.gain.linearRampToValueAtTime(0.05, ac.currentTime + 2);
      const filt = ac.createBiquadFilter(); filt.type = "lowpass"; filt.frequency.value = 420; filt.Q.value = 0.6;
      const lfo = ac.createOscillator(); lfo.frequency.value = 0.08;
      const lfoGain = ac.createGain(); lfoGain.gain.value = 160;
      lfo.connect(lfoGain).connect(filt.frequency); lfo.start();
      const oscs = [];
      [130.8, 196.0, 261.6, 130.8, 196.0, 261.6].forEach((f, i) => {
        const o = ac.createOscillator();
        o.type = i % 2 ? "sawtooth" : "triangle";
        o.frequency.value = f * (i >= 3 ? 1.003 : 0.997);
        const og = ac.createGain(); og.gain.value = i >= 3 ? 0.35 : 0.22;
        o.connect(og).connect(filt); o.start();
        oscs.push(o);
      });
      filt.connect(master).connect(ac.destination);
      musicNodes = { oscs, lfo, master };
    }
  }
  function stopMusic() {
    if (!musicNodes) return;
    const ac = ctx;
    if (musicNodes.crowd) {
      try {
        musicNodes.crowd.fade(musicNodes.crowd.volume(), 0, 500);
        const c = musicNodes.crowd;
        setTimeout(() => { try { c.unload(); } catch (_) {} }, 600);
      } catch (_) {}
      musicNodes = null; return;
    }
    const { oscs, lfo, master } = musicNodes;
    try {
      master.gain.cancelScheduledValues(ac.currentTime);
      master.gain.setValueAtTime(master.gain.value, ac.currentTime);
      master.gain.linearRampToValueAtTime(0, ac.currentTime + 0.5);
      setTimeout(() => { oscs.forEach(o => { try { o.stop(); } catch (_) {} }); try { lfo.stop(); } catch (_) {} }, 700);
    } catch (_) {}
    musicNodes = null;
  }
  if (settings.music) { window.addEventListener("pointerdown", () => startMusic(), { once: true, passive: true }); }

  /* ---------------- toasts ---------------- */
  let toastRegion = null;
  function ensureToastRegion() {
    if (!toastRegion) {
      toastRegion = document.createElement("div");
      toastRegion.className = "toast-region";
      toastRegion.id = "gl-toasts";
      document.body.appendChild(toastRegion);
    }
    return toastRegion;
  }
  const ICON_OK = '<svg class="toast-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>';
  function toast(message, opts = {}) {
    const region = ensureToastRegion();
    const el = document.createElement("div");
    el.className = "toast" + (opts.error ? " is-error" : "");
    el.innerHTML = (opts.error ? "" : ICON_OK) + "<span></span>";
    el.lastChild.textContent = message;
    region.appendChild(el);
    requestAnimationFrame(() => el.classList.add("is-in"));
    if (settings.sfx && !opts.silent) opts.error ? sfx.tick() : sfx.tap();
    setTimeout(() => {
      el.classList.remove("is-in");
      setTimeout(() => el.remove(), 320);
    }, opts.duration || 2400);
  }

  /* ---------------- modal ---------------- */
  let layer = null;
  let currentClose = null;
  function ensureLayer() {
    if (!layer) {
      layer = document.createElement("div");
      layer.className = "modal-layer";
      layer.innerHTML =
        '<div class="modal-backdrop" data-close></div>' +
        '<div class="modal" role="dialog" aria-modal="true">' +
        '  <div class="modal-head"><div class="modal-title"></div>' +
        '    <button class="icon-btn modal-close" data-close aria-label="Close">' +
        '      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M18 6 6 18M6 6l12 12"/></svg>' +
        '    </button></div>' +
        '  <div class="modal-body"></div>' +
        '  <div class="modal-actions"></div>' +
        "</div>";
      document.body.appendChild(layer);
      layer.addEventListener("click", e => {
        if (e.target.closest("[data-close]") || e.target.classList.contains("modal-backdrop")) closeModal();
      });
      document.addEventListener("keydown", e => { if (e.key === "Escape" && layer.classList.contains("is-open")) closeModal(); });
    }
    return layer;
  }
  function openModal({ title = "", bodyHTML = "", bodyEl = null, actions = [], onClose = null }) {
    const l = ensureLayer();
    l.querySelector(".modal-title").textContent = title;
    const bodySlot = l.querySelector(".modal-body");
    if (bodyEl) { bodySlot.replaceChildren(bodyEl); }
    else { bodySlot.innerHTML = bodyHTML; }
    const actSlot = l.querySelector(".modal-actions");
    actSlot.replaceChildren();
    actions.forEach(a => {
      const b = document.createElement("button");
      b.className = "btn " + (a.variant || "btn-secondary");
      b.textContent = a.label;
      b.addEventListener("click", () => { sfx.tap(); a.onClick?.(closeModal); });
      actSlot.appendChild(b);
    });
    currentClose = onClose;
    l.classList.add("is-open");
    sfx.swoosh();
    const focusables = l.querySelectorAll("button, [href], input, select, textarea");
    setTimeout(() => focusables[0]?.focus(), 60);
  }
  function closeModal() {
    if (!layer || !layer.classList.contains("is-open")) return;
    layer.classList.remove("is-open");
    const cb = currentClose; currentClose = null;
    cb?.();
  }

  /* ---------------- confetti ---------------- */
  const CONFETTI_COLORS = ["#55b725", "#dac316", "#3a8dca", "#c62121", "#e67e22", "#ececec"];
  function confetti(count = 120) {
    if (document.documentElement.dataset.reduced === "on") return;
    let cv = document.getElementById("gl-confetti");
    if (!cv) {
      cv = document.createElement("canvas");
      cv.id = "gl-confetti";
      document.body.appendChild(cv);
    }
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    cv.width = innerWidth * dpr; cv.height = innerHeight * dpr;
    const g = cv.getContext("2d");
    g.scale(dpr, dpr);
    const parts = Array.from({ length: count }, () => ({
      x: innerWidth / 2 + (Math.random() - 0.5) * innerWidth * 0.5,
      y: innerHeight * 0.32,
      vx: (Math.random() - 0.5) * 9,
      vy: -4 - Math.random() * 7,
      rot: Math.random() * Math.PI,
      vr: (Math.random() - 0.5) * 0.3,
      w: 5 + Math.random() * 5,
      h: 3 + Math.random() * 4,
      c: CONFETTI_COLORS[(Math.random() * CONFETTI_COLORS.length) | 0],
      life: 1,
    }));
    const t0 = performance.now();
    (function frame(now) {
      const dt = Math.min((now - t0) / 1600, 1);
      g.clearRect(0, 0, innerWidth, innerHeight);
      parts.forEach(p => {
        p.vy += 0.22; p.x += p.vx; p.y += p.vy; p.rot += p.vr;
        p.life = 1 - dt;
        g.save();
        g.translate(p.x, p.y);
        g.rotate(p.rot);
        g.globalAlpha = Math.max(p.life, 0);
        g.fillStyle = p.c;
        g.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
        g.restore();
      });
      if (dt < 1) requestAnimationFrame(frame);
      else g.clearRect(0, 0, innerWidth, innerHeight);
    })(t0);
  }

  /* ---------------- daily helpers ---------------- */
  function todayStr(offsetDays = 0) {
    const d = new Date(Date.now() - offsetDays * DAY_MS);
    return d.toISOString().slice(0, 10);
  }
  // deterministic seeded RNG so daily puzzles are identical for everyone
  function mulberry32(seed) {
    let a = seed >>> 0;
    return function () {
      a |= 0; a = (a + 0x6D2B79F5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  function hashStr(str) {
    let h = 2166136261;
    for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); }
    return h >>> 0;
  }
  function dailyRng(gameSlug) { return mulberry32(hashStr(todayStr() + "|" + gameSlug)); }

  function msUntilNextUtcMidnight() {
    const now = new Date();
    const next = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1);
    return next - now.getTime();
  }
  function fmtHMS(ms) {
    const s = Math.max(0, Math.floor(ms / 1000));
    const hh = String(Math.floor(s / 3600)).padStart(2, "0");
    const mm = String(Math.floor((s % 3600) / 60)).padStart(2, "0");
    const ss = String(s % 60).padStart(2, "0");
    return `${hh}:${mm}:${ss}`;
  }

  /* progress bookkeeping: results per game */
  function recordResult(slug, payload) {
    const all = store.get("results", {});
    const arr = all[slug] || (all[slug] = []);
    arr.push(Object.assign({ date: todayStr(), ts: Date.now() }, payload));
    all[slug] = arr.slice(-400);
    store.set("results", all);
  }
  function getResults(slug) {
    return (store.get("results", {})[slug]) || [];
  }
  function playedToday(slug) {
    return getResults(slug).some(r => r.date === todayStr());
  }
  function statsFor(slug) {
    const rs = getResults(slug);
    const played = rs.length;
    const wins = rs.filter(r => !!r.won).length;
    let cur = 0, best = 0, run = 0;
    rs.forEach(r => {
      if (r.won) { run++; best = Math.max(best, run); }
      else run = 0;
    });
    for (let i = rs.length - 1; i >= 0 && rs[i].won; i--) cur++;
    return {
      played, winRate: played ? Math.round((wins / played) * 100) : 0,
      currentStreak: cur, bestStreak: best,
      avgScore: played ? +(rs.reduce((s, r) => s + (r.score ?? 0), 0) / played).toFixed(1) : 0,
    };
  }
  function wipeProgress() {
    ["results"].forEach(store.remove);
  }

  /* async clipboard with toast */
  async function copyText(text) {
    const T = k => (window.I18N ? window.I18N.t(k) : null) || {
      copy_ok: "Copied to clipboard",
      copy_fail: "Couldn't copy — long-press to select",
    }[k];
    try {
      await navigator.clipboard.writeText(text);
      toast(T("copy_ok"));
    } catch (_) {
      const ta = document.createElement("textarea");
      ta.value = text; ta.style.position = "fixed"; ta.style.opacity = "0";
      document.body.appendChild(ta); ta.select();
      try { document.execCommand("copy"); toast(T("copy_ok")); }
      catch (_) { toast(T("copy_fail"), { error: true }); }
      ta.remove();
    }
  }

  function onSettingsChange(fn) { settingsListeners.push(fn); }

  /* ---------------- supporter pass (local token, V1) ----------------
     Redeems ?supporter=<code> or manual entry. Device-local until V2 accounts.
     Codes are plain human words; the code list lives in ONE obvious place.   */
  const SUPPORT_CODES = new Set(["ROWZ-FAN-2026", "TOPBINS", "PANENKA"]);
  const SUP_KEY = "supporter";
  function redeemSupporter(code) {
    const ok = SUPPORT_CODES.has(String(code || "").trim().toUpperCase());
    if (ok) store.set(SUP_KEY, { code: String(code).trim().toUpperCase(), ts: Date.now() });
    return ok;
  }
  function isSupporter() { return !!store.get(SUP_KEY, null); }
  function revokeSupporter() { store.remove(SUP_KEY); }
  // auto-redeem from URL once per load (payment-link return trip)
  (function scanUrlToken() {
    try {
      const q = new URLSearchParams(location.search);
      const tok = q.get("supporter");
      if (tok) { redeemSupporter(tok); q.delete("supporter");
        const url = location.pathname + (q.toString() ? "?" + q : "");
        history.replaceState(null, "", url);
      }
    } catch (_) {}
  })();

  window.GL = {
    store, settings: () => settings, setSetting, onSettingsChange,
    sfx, startMusic, stopMusic,
    toast, openModal, closeModal, confetti, copyText,
    todayStr, dailyRng, msUntilNextUtcMidnight, fmtHMS,
    recordResult, getResults, playedToday, statsFor, wipeProgress,
    redeemSupporter, isSupporter, revokeSupporter,
    haptic: ms => { try { navigator.vibrate?.(ms || 10); } catch (_) {} },
    version: "0.3.0",
  };
})();
