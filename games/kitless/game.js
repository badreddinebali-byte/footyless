/* ============================================================
   FOOTYLESS · KITLESS — progressive deblur shirt quiz
   Mystery shirt starts shredded in fat pixels; every wrong pick
   among the 4 choices sharpens another notch. ≤2 failed shirts wins.
   ============================================================ */
(function () {
  "use strict";
  const GL = window.GL, Shell = window.Shell, T = window.I18N.t;
  const K = window.KT_DATA;

  const ROUNDS = 10, MAX_WRONG_PER_SHIRT = 3, ALLOWED_FAILS = 2;
  /* pixel block sizes, coarse → perfect */
  const LEVELS = [14, 10, 7, 5, 3, 2, 1];

  const app = document.getElementById("duel-app");
  let round = 1, track = [], shirt = null, level = 0, wrongs = 0, img = null, busy = false;

  /* ---------- shirt canvas painting ---------- */
  function paintLevel() {
    const cv = app.querySelector("#kit-canvas");
    if (!cv || !img) return;
    const ctx = cv.getContext("2d");
    const size = cv.width;                       // square canvas
    ctx.imageSmoothingEnabled = false;
    ctx.clearRect(0, 0, size, size);
    const px = LEVELS[level];                    // block size
    const small = Math.max(2, Math.floor(size / px));
    const tmp = document.createElement("canvas");
    tmp.width = small; tmp.height = small;
    const tc = tmp.getContext("2d");
    tc.drawImage(img, 0, 0, small, small);
    ctx.drawImage(tmp, 0, 0, small, small, 0, 0, size, size);
  }

  function loadShirt(club) {
    const blob = new Blob([K.kitSVG(club)], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    img = new Image();
    img.onload = () => { paintLevel(); URL.revokeObjectURL(url); };
    img.src = url;
  }

  /* ---------- round construction ---------- */
  function pickChoices(answer) {
    const pool = K.CLUBS.filter(c => c.id !== answer.id);
    const picks = [answer];
    while (picks.length < 4) {
      const cand = pool[(Math.random() * pool.length) | 0];
      if (!picks.some(p => p.id === cand.id)) picks.push(cand);
    }
    return picks.sort(() => Math.random() - 0.5);
  }

  function boardHTML(choices) {
    return `
      <div class="round-track" id="round-track">${dotsHTML()}</div>
      <div class="sr-type">🎽 ${T("kl_round", { n: round, total: ROUNDS })}</div>
      <div class="kit-stage">
        <canvas id="kit-canvas" width="280" height="280" aria-label="${T("tl_kitless")}"></canvas>
        <div class="kit-blurtier" id="kit-hint">${T("kl_wrongs_left", { n: MAX_WRONG_PER_SHIRT - wrongs })}</div>
      </div>
      <p class="sr-question">${T("kl_prompt")}</p>
      <div class="choice-bar" style="grid-template-columns:1fr 1fr" id="kit-options">
        ${choices.map(c => `<button class="choice-btn" data-kit="${c.id}" style="font-size:15px;height:52px">${c.n}</button>`).join("")}
      </div>
      <p class="wip-text" style="margin-top:14px;text-align:center;font-size:12.5px">${T("kl_rules")}</p>`;
  }

  function dotsHTML() {
    return Array.from({ length: ROUNDS }, (_, i) => {
      const s = track[i] === true ? "is-win" : track[i] === false ? "is-loss" : i === round - 1 && !busy ? "is-now" : "";
      return `<span class="round-dot ${s}"></span>`;
    }).join("");
  }

  /* ---- daily deterministic shirt sequence ---- */
  let KRNG = Math.random;
  function makeSeedRng(seedStr) {
    let h = 2166136261;
    for (let i = 0; i < seedStr.length; i++) { h ^= seedStr.charCodeAt(i); h = Math.imul(h, 16777619); }
    let a = h >>> 0;
    return () => { a |= 0; a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  }
  function newRound() {
    busy = false; wrongs = 0; level = 0;
    const answer = K.CLUBS[(KRNG() * K.CLUBS.length) | 0];
    shirt = { answer };
    app.innerHTML = boardHTML(pickChoices(answer));
    loadShirt(answer);
    app.querySelectorAll("[data-kit]").forEach(b =>
      b.addEventListener("click", () => pick(b)));
    GL.sfx.tick();
  }

  function pick(btn) {
    if (busy) return;
    const ans = shirt.answer;
    if (btn.dataset.kit === ans.id) {
      busy = true;
      /* solved: sharpen fully, celebrate */
      level = LEVELS.length - 1;
      paintLevel();
      btn.classList.add("picked-correct");
      const quality = wrongs === 0 ? "clean" : "deblur";
      track.push(true);
      app.querySelector("#round-track").innerHTML = dotsHTML();
      GL.sfx.correct(); GL.confetti(30);
      GL.haptic(12);
      setTimeout(nextRound, 1200);
    } else {
      btn.classList.add("picked-wrong");
      btn.disabled = true;
      wrongs++;
      level = Math.min(level + 1, LEVELS.length - 1);
      paintLevel();
      GL.sfx.wrong(); GL.haptic([8, 30, 8]);
      const hint = app.querySelector("#kit-hint");
      if (wrongs >= MAX_WRONG_PER_SHIRT) {
        /* shirt failed: reveal */
        busy = true;
        level = LEVELS.length - 1;
        paintLevel();
        track.push(false);
        app.querySelector("#round-track").innerHTML = dotsHTML();
        GL.sfx.whistle();
        GL.toast(T("kl_was", { club: ans.n }), { error: true });
        setTimeout(nextRound, 1600);
      } else if (hint) {
        hint.textContent = T("kl_wrongs_left", { n: MAX_WRONG_PER_SHIRT - wrongs });
        hint.classList.add("anim-shake");
        setTimeout(() => hint.classList.remove("anim-shake"), 500);
      }
    }
  }

  function nextRound() {
    if (round >= ROUNDS) { end(); return; }
    const fails = track.filter(x => x === false).length;
    if (fails > ALLOWED_FAILS) { end(); return; }   // cannot recover now
    round++;
    newRound();
  }

  function resultRow() {
    const fails = track.filter(x => x === false).length;
    return { solved: track.filter(Boolean).length, fails, won: fails <= ALLOWED_FAILS };
  }

  function shareText(res) {
    const marks = track.map(r => (r ? (r === true ? "🟩" : "🟨") : "🟥")).join("");
    return `Footyless · Kitless — ${res.solved}/${ROUNDS} shirts ${marks}\nDecode yours → footyless.com`;
  }

  function end() {
    const res = resultRow();
    GL.recordResult("kitless", { won: res.won, score: res.solved, max: ROUNDS });
    res.won ? GL.sfx.win() : GL.sfx.fanfare();

    const st = GL.statsFor("kitless");
    const quip = res.fails === 0 ? T("quip_perf") : res.won ? T("kl_quip_ok") : T("quip_low");
    const body = document.createElement("div");
    body.innerHTML = `
      <div class="stat-row" style="margin:6px 0 2px">
        <div class="stat-chip"><div class="stat-chip__num ${res.won ? "is-good" : ""}">${res.solved}</div><div class="stat-chip__label">${T("kl_shirts")}</div></div>
        <div class="stat-chip"><div class="stat-chip__num">${st.bestStreak || res.solved}</div><div class="stat-chip__label">${T("best_streak")}</div></div>
        <div class="stat-chip"><div class="stat-chip__num">${st.played}</div><div class="stat-chip__label">${T("played")}</div></div>
      </div>
      <p style="text-align:center;margin-top:8px">${quip}</p>`;
    GL.openModal({
      title: res.won ? T("perf_title") : T("ft_title"),
      bodyEl: body,
      actions: [
        { label: T("rematch"), variant: "btn-primary", onClick: close => { close(); restart(true); } },
        { label: T("share"), variant: "btn-secondary", onClick: () => GL.copyText(shareText(res)) },
      ],
    });
    GL.confetti(res.won ? 150 : 40);
  }

  function restart(practice) {
    round = 1; track = [];
    KRNG = practice ? Math.random : makeSeedRng(GL.todayStr() + "|kitless");
    newRound();
    GL.sfx.drum();
  }

  /* ---------- boot ---------- */
  Shell.mount(".app", "kitless");
  const rb = document.getElementById("btn-restart");
  if (rb) { rb.textContent = T("restart_label"); rb.addEventListener("click", restart); }
  KRNG = makeSeedRng(GL.todayStr() + "|kitless");
  newRound();
})();
