/* ============================================================
   FOOTYLESS · MISSING XI 2.0 — playfootball.games parity
   Structure mirrored: fixture header triptych, Normal/Hard picker,
   pitch board (440px, formation shirts, dotted masks, per-shirt
   try counters, 0/11, GIVE UP), full-screen wordle takeover w/
   BACK preserving progress, on-screen keyboard.
   Skin: FOOTYLESS palette/fonts. Normal shows numbers; Hard hides.
   ============================================================ */
(function () {
  "use strict";
  const GL = window.GL, Shell = window.Shell, T = window.I18N.t;
  const M = window.MX_DATA;

  const TRIES = 6;
  const ROWS_Q = ["QWERTYUIOP", "ASDFGHJKL", "ZXCVBNM"];

  const app = document.getElementById("duel-app");
  let fx = null, hard = false, view = "start"; // start | pitch | wordle | done
  let activeSlot = -1;

  /* per-shirt persistent state */
  let S = null;

  Shell.mount(".app", "missingxi");

  /* ================= VIEW: START (mode picker over pitch bg) ================= */
  function renderStart() {
    view = "start";
    app.innerHTML = `
      <div class="mx2-wrap">
        <div class="mx2-head">
          <div class="mx2-comp">${fx.comp} <span>${fx.season}</span></div>
          <div class="mx2-tri">
            <div class="mx2-team"><svg class="mx2-crest" viewBox="0 0 24 24"><path d="M7 4h10v6a5 5 0 0 1-10 0Z"/></svg><span>${fx.team}</span></div>
            <div class="mx2-score"><b>${fx.score}</b><span>${fx.note || fx.date || ""}</span></div>
            <div class="mx2-team opp"><svg class="mx2-crest" viewBox="0 0 24 24"><path d="M7 4h10v6a5 5 0 0 1-10 0Z"/></svg><span>${fx.home === fx.team ? fx.away : fx.home}</span></div>
          </div>
        </div>
        <div class="mx2-pitchbg">
          <div class="mx2-modewrap">
            <button class="mx2-mode" data-mode="normal"><span>NORMAL</span></button>
            <button class="mx2-mode" data-mode="hard"><span>HARD</span></button>
          </div>
        </div>
      </div>`;
    app.querySelectorAll(".mx2-mode").forEach(b =>
      b.addEventListener("click", () => {
      hard = b.dataset.mode === "hard";
      GL.sfx.press();
      const saved = GL.store.get("mx-run-" + GL.todayStr(), null);
      if (saved && saved.hard === hard && saved.fxId === fx.id && saved.S) { S = saved.S; renderPitch(); }
      else startRun();
    }));
  }

  /* ================= VIEW: PITCH ================= */
  function startRun() {
    S = fx.lineup.map(() => ({ rows: [], solved: false, failed: false, tries: 0, dirty: false }));
    GL.sfx.drum();
    renderPitch();
  }

  /* ---- compound surnames: "Kevin De Bruyne" -> display "DE BRUYNE" ---- */
  function surnameFull(p) {
    const tokens = String(p.name).trim().split(/\s+/);
    if (tokens.length === 1) return tokens[0].toUpperCase();
    const PARTICLE = /^(de|del|van|von|der|den|di|da|dos|das|la|le|el|al|ben|mac|mc)$/i;
    const out = [tokens[tokens.length - 1]];
    let i = tokens.length - 2;
    while (i >= 0 && PARTICLE.test(tokens[i])) { out.unshift(tokens[i]); i--; }
    return out.join(" ").toUpperCase();
  }
  /* grading target: letters only (folded) */
  function targetOf(p) { return M.fold(surnameFull(p)); }
  /* display target with spaces (grid includes space columns) */
  function displayTarget(p) { return surnameFull(p); }

  function maskOf(p) {
    const disp = displayTarget(p);
    let m = "";
    for (const ch of disp) m += ch === " " ? " " : (/[-']/.test(ch) ? "-" : ".");
    return m;
  }

  function solvedCount() { return S.filter(x => x.solved).length; }
  function failedCount() { return S.filter(x => x.failed).length; }

  function renderPitch() {
    view = "pitch";
    const revealing = S && S.some(x => x.revealed);
    const solved = solvedCount(), failed = failedCount();
    app.innerHTML = `
      <div class="mx2-wrap">
        <div class="mx2-head">
          <div class="mx2-comp">${fx.comp} <span>${fx.season}</span></div>
          <div class="mx2-tri">
            <div class="mx2-team"><svg class="mx2-crest" viewBox="0 0 24 24"><path d="M7 4h10v6a5 5 0 0 1-10 0Z"/></svg><span>${fx.team}</span></div>
            <div class="mx2-score"><b>${fx.score}</b><span>${fx.note || ""}</span></div>
            <div class="mx2-team opp"><svg class="mx2-crest" viewBox="0 0 24 24"><path d="M7 4h10v6a5 5 0 0 1-10 0Z"/></svg><span>${fx.home === fx.team ? fx.away : fx.home}</span></div>
          </div>
        </div>
        <div class="mx2-pitch" data-pitch>
          ${fx.lineup.map((p, i) => shirtHTML(p, i)).join("")}
          <div class="mx2-boardfoot">
            <span class="mx2-counter"><b>${solved}</b>/${fx.lineup.length}</span>
            <button class="mx2-giveup" id="mx-giveup">${T("mx_giveup")}</button>
          </div>
        </div>
        <button class="mx2-backrow" id="mx-restart">↻ ${T("mx_newmatch")}</button>
      </div>`;
    paintShirts();
    if (revealing) {
      let d = 0;
      S.forEach((s, i) => { if (s.revealed) { const el = app.querySelector(`[data-shirt="${i}"] .mx2-name`); if (el) { el.style.setProperty('--rd', (d * 90) + 'ms'); d++; } } });
    }
    app.querySelectorAll("[data-shirt]").forEach(el =>
      el.addEventListener("click", () => openWordle(+el.dataset.shirt)));
    app.querySelector("#mx-giveup").addEventListener("click", confirmGiveUp);
    app.querySelector("#mx-restart").addEventListener("click", () => newMatch(true));
  }

  function shirtHTML(p, i) {
    const s = S[i];
    const num = (!hard || s.solved || s.revealed) ? `<span class="mx2-num">${p.num ?? i + 1}</span>` : "";
    const cls = s.solved ? " is-solved" : s.failed ? " is-failed" : s.dirty ? " is-touched" : "";
    const reveal = s.failed && s.revealed;
    const label = s.solved || s.failed
      ? `<span class="mx2-name${reveal ? " reveal" : ""}">${displayTarget(p)}</span>`
      : `<span class="mx2-mask">${maskOf(p)}</span>`;
    return `
      <button class="mx2-shirt${cls}" data-shirt="${i}" style="--x:${p.x}%;--y:${p.y}%" aria-label="${p.pos}">
        <span class="mx2-jersey">${num}<i>${p.num ?? i + 1}</i></span>
        <span class="mx2-under"><u class="mx2-tries">${s.tries}</u>${label}</span>
      </button>`;
  }

  function paintShirts() {
    fx.lineup.forEach((p, i) => {
      const el = app.querySelector(`[data-shirt="${i}"]`);
      if (el) el.outerHTML = shirtHTML(p, i);
    });
    app.querySelectorAll("[data-shirt]").forEach(el =>
      el.addEventListener("click", () => openWordle(+el.dataset.shirt)));
    const c = app.querySelector("[data-pitch] .mx2-counter b");
    if (c) c.textContent = solvedCount();
  }

  /* ================= VIEW: WORDLE TAKEOVER ================= */
  function openWordle(idx) {
    const s = S[idx];
    if (s.solved || s.failed) { GL.toast(displayTarget(fx.lineup[idx].name) + (s.failed ? " ✗" : " ✓"), { silent: false }); return; }
    activeSlot = idx;
    view = "wordle";
    const p = fx.lineup[idx];
    const target = displayTarget(p);
    app.innerHTML = `
      <div class="mx2-wx">
        <button class="mx2-back" id="wx-back">← ${T("mx_back")}</button>
        <div class="mx2-grid" style="--cols:${target.length}" data-grid>
          ${gridHTML(s, target)}
        </div>
        <div class="mx2-keys" data-keys></div>
      </div>`;
    app.querySelector("#wx-back").addEventListener("click", closeWordle);
    drawKeys(target);
    const kb = app.querySelector("[data-keys]");
    kb.onclick = e => {
      const b = e.target.closest("[data-k]");
      if (!b) return;
      const k = b.dataset.k;
      if (k === "ENTER") submitRow(idx, target);
      else if (k === "DEL") delChar(s);
      else addChar(s, k);
    };
  }

  function gridHTML(s, target, changedOnly) {
    const graded = s.rows.filter(r => r.marks);
    const draft = s.rows.find(r => !r.marks) || null;
    let html = "";
    for (let r = 0; r < TRIES; r++) {
      for (let c = 0; c < target.length; c++) {
        let ch = "", st = "";
        let isNew = r === graded.length && c === (draft ? draft.word.length - 1 : -1);
        if (r < graded.length) { ch = graded[r].word[c] || ""; st = graded[r].marks[c] || ""; }
        else if (r === graded.length && draft) { ch = draft.word[c] || ""; }
        const anim = changedOnly && !isNew ? " style=\"animation:none\"" : (st ? "" : ` style="animation-delay:${c * 50}ms"`);
        html += `<span class="mx2-tile ${st}${r === graded.length ? " is-cur" : ""}"${changedOnly ? " data-live" : ""}${anim}>${ch}</span>`;
      }
    }
    return html;
  }

  function rerender(idx) {
    const target = displayTarget(fx.lineup[idx]);
    const g = app.querySelector("[data-grid]");
    if (g) g.innerHTML = gridHTML(S[idx], target, true); /* typed edits: no re-poof */
  }

  function drawKeys(target) {
    const needSpace = target.includes(" ");
    const kb = app.querySelector("[data-keys]");
    let html = `<div class="mx2-krow">` + (needSpace ? `<button class="mx2-key wide" data-k=" ">␣</button>` : ``) + ROWS_Q[0].split("").map(k => `<button class="mx2-key" data-k="${k}">${k}</button>`).join("") + `</div>`;
    html += `<div class="mx2-krow">` + ROWS_Q[1].split("").map(k => `<button class="mx2-key" data-k="${k}">${k}</button>`).join("") + `</div>`;
    html += `<div class="mx2-krow"><button class="mx2-key wide" data-k="DEL">${T("mx_delete")}</button>` + ROWS_Q[2].split("").map(k => `<button class="mx2-key" data-k="${k}">${k}</button>`).join("") + `<button class="mx2-key wide" data-k="ENTER">${T("mx_enter")}</button></div>`;
    kb.innerHTML = html;
  }

  /* physical keys */
  document.addEventListener("keydown", e => {
    if (view !== "wordle" || activeSlot < 0) return;
    const s = S[activeSlot];
    if (!s || s.solved || s.failed) return;
    const target = displayTarget(fx.lineup[activeSlot]);
    if (e.key === "Enter") { e.preventDefault(); submitRow(activeSlot, target); }
    else if (e.key === "Backspace") { e.preventDefault(); delChar(s); }
    else if (/^[a-zA-Zà-ÿÀ-ŸçÇñÑ ]$/.test(e.key)) addChar(s, /[ ]/.test(e.key) ? ' ' : M.fold(e.key));
  });

  function addChar(s, ch) {
    if (s.solved || s.failed) return;
    s.rows = s.rows || [];
    let row = s.rows.find(r => !r.marks);
    if (!row) {
      if (s.rows.filter(r => r.marks).length >= TRIES) return;
      row = { word: "", marks: null }; s.rows.push(row);
    }
    if (row.word.length >= 12) return;
    row.word += (ch === " " ? " " : ch);
    s.dirty = true;
    rerender(activeSlot);
  }
  function delChar(s) {
    const row = (s.rows || []).find(r => !r.marks);
    if (!row || !row.word.length) return;
    row.word = row.word.slice(0, -1);
    rerender(activeSlot);
  }

  function grade(word, target) {
    const marks = Array(target.length).fill("bad");
    const pool = target.split("");
    for (let i = 0; i < target.length; i++)
      if (word[i] === target[i]) { marks[i] = "good"; pool[i] = null; }
    for (let i = 0; i < target.length; i++) {
      if (marks[i] === "good") continue;
      const j = pool.indexOf(word[i]);
      if (j >= 0) { marks[i] = "warm"; pool[j] = null; }
    }
    return marks;
  }

  function submitRow(idx, target) {
    const s = S[idx];
    const row = (s.rows || []).find(r => !r.marks);
    if (!row || !row.word) return;
    if (row.word.length !== target.length) {
      GL.toast(T("mx_len_needed", { n: target.length }), { error: true });
      return;
    }
    const aliases = M.ALIASES[target] || [];
    const exact = row.word === target || aliases.includes(row.word);
    row.marks = exact ? Array(target.length).fill("good") : grade(row.word, target);
    s.tries++; s.dirty = true;

    rerender(idx);
    if (exact) { GL.sfx.correct(); GL.confetti(26); s.solved = true; setTimeout(backToPitch, 800); }
    else {
      GL.sfx.wrong();
      if (s.tries >= TRIES) {
        s.failed = true;
        GL.sfx.press();
        GL.toast(T("mx_failed_reveal", { name: fx.lineup[idx].name }), { error: true });
        setTimeout(backToPitch, 900);
      }
    }
  }

  function closeWordle() { persistRun();
    /* BACK keeps progress: rows/tries preserved in S */
    GL.sfx.closeUI();
    backToPitch();
  }
  function backToPitch() { persistRun();
    activeSlot = -1;
    renderPitch();
    if (S.every(x => x.solved || x.failed) && failedCount() > 2) endNormal();
    else if (S.every(x => x.solved || x.failed)) endNormal();
  }

  /* ================= GIVE UP / END ================= */
  function confirmGiveUp() {
    GL.openModal({
      title: T("mx_giveup_q"),
      bodyHTML: `<p>${T("mx_giveup_body")}</p>`,
      actions: [
        { label: T("cancel") },
        { label: T("ft_title"), variant: "btn-primary", onClick: c => { c(); surrender(); } },
      ],
    });
  }

  /* surrender: reveal every remaining surname on the pitch (show-answers), then results */
  function surrender() {
    GL.sfx.lost();
    S.forEach((s, i) => {
      if (!s.solved && !s.failed) { s.failed = true; s.revealed = true; }
    });
    renderPitch();
    setTimeout(() => endNormal(true), 1400); /* let the reveal breathe */
  }

  function computedResult(forfeit) {
    const solved = S.filter(x => x.solved).length;
    const fails = S.filter(x => x.failed).length;
    return { solved, fails, won: !forfeit && fails <= 2 && solved === fx.lineup.length };
  }

  function endNormal(forfeit) {
    const res = computedResult(forfeit);
    GL.recordResult("missingxi", { won: res.won, score: res.solved, max: 11 });
    res.won || res.solved >= 8 ? GL.sfx.win() : GL.sfx.fanfare();
    const st = GL.statsFor("missingxi");
    const quip = res.solved === 11 ? T("quip_perf") : res.won ? T("mx_quip_win", { n: res.fails }) : forfeit ? T("mx_quip_forfeit") : T("quip_low");
    const body = document.createElement("div");
    body.innerHTML = `
      <div class="stat-row" style="margin:6px 0 2px">
        <div class="stat-chip"><div class="stat-chip__num ${res.won ? "is-good" : ""}">${res.solved}</div><div class="stat-chip__label">${T("mx_named")}</div></div>
        <div class="stat-chip"><div class="stat-chip__num">${res.fails}</div><div class="stat-chip__label">${T("mx_missed")}</div></div>
        <div class="stat-chip"><div class="stat-chip__num">${st.played}</div><div class="stat-chip__label">${T("played")}</div></div>
      </div>
      <p style="text-align:center;margin-top:8px">${quip}</p>`;
    GL.openModal({
      title: res.won ? T("perf_title") : T("ft_title"),
      bodyEl: body,
      actions: [
        { label: T("rematch"), variant: "btn-primary", onClick: close => { close(); newMatch(); } },
        { label: T("share"), variant: "btn-secondary", onClick: () => GL.copyText(shareText(res)) },
      ],
    });
    GL.confetti(res.won ? 160 : 50);
  }

  function shareMarks(res) {
    return fx.lineup.map((p, i) => {
      const s = S[i];
      return s.failed ? "🟥" : s.solved ? (s.tries <= 2 ? "🟩" : "🟨") : "⬛";
    }).join("").replace(/(.{4})/g, "$1\n").trim();
  }
  function shareText(res) {
    return `Footyless · Missing XI — ${fx.home} ${fx.score} ${fx.away} (${fx.note})\n${shareMarks(res)}\n${res.solved}/11 · ${fx.season}\nName yours → footyless.com`;
  }

  function newMatch(randomDraw) {
    /* daily fixture = seeded by UTC date + mode; everyone worldwide same game.
       Practice/extras (New match button, Rematch) draw randomly. */
    if (randomDraw) {
      fx = M.FIXTURES[(Math.random() * M.FIXTURES.length) | 0];
      /* avoid same-fixture boredom vs last played */
      const last = GL.store.get("mx-last", null);
      if (M.FIXTURES.length > 1 && fx.id === last) {
        fx = M.FIXTURES[(M.FIXTURES.indexOf(fx) + 1) % M.FIXTURES.length];
      }
      GL.store.set("mx-last", fx.id);
    } else {
      const rng = GL.dailyRng("missingxi");
      const dayIdx = Math.floor(rng() * M.FIXTURES.length);
      fx = M.FIXTURES[dayIdx];
      /* progress persistence: resume today's fixture if abandoned mid-run */
      const saved = GL.store.get("mx-run-" + GL.todayStr(), null);
      if (saved && saved.fxId === fx.id) {
        S = saved.S;
        hard = saved.hard;
      } else {
        S = null;
      }
    }
    if (S) { renderPitch(); } else { renderStart(); }
  }

  function persistRun() {
    if (!S) return;
    GL.store.set("mx-run-" + GL.todayStr(), { fxId: fx.id, hard, S });
  }

  /* ---------- boot ---------- */
  newMatch();
})();
