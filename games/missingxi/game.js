/* ============================================================
   FOOTYLESS · MISSING XI — name the legendary XI
   Pitch slots → mini-Wordle per player (6 letter tries each).
   ≤2 failed shirts = victorious full time.
   ============================================================ */
(function () {
  "use strict";
  const GL = window.GL, Shell = window.Shell, T = window.I18N.t;
  const M = window.MX_DATA;

  const WORD_LEN_MAX = 12, TRIES = 6;
  const ROWS_Q = ["QWERTYUIOP", "ASDFGHJKL", "ZXCVBNM"];

  const app = document.getElementById("duel-app");
  let fx = null, state = null, activeSlot = -1;

  /* ---------- boot ---------- */
  Shell.mount(".app", "missingxi");
  const rb = document.getElementById("btn-restart");
  if (rb) { rb.textContent = T("restart_label"); rb.addEventListener("click", restart); }
  restart();

  function restart() {
    fx = M.FIXTURES[(Math.random() * M.FIXTURES.length) | 0];
    state = fx.lineup.map(() => ({ tries: 0, solved: false, failed: false, tried: false, guessRows: [] }));
    GL.sfx.whistle();
    renderPitch();
  }

  /* ================= PITCH ================= */
  function renderPitch() {
    const fails = state.filter(s => s.failed).length;
    const solved = state.filter(s => s.solved).length;
    app.innerHTML = `
      <div class="mx-matchinfo">
        <div class="mx-comp">${fx.comp} · ${fx.season}</div>
        <div class="mx-fixture"><b>${fx.home} ${fx.score} ${fx.away}</b> <span>${fx.note}</span></div>
        <div class="mx-task">${T("mx_task", { team: fx.team })} · <span class="mx-formation">${fx.formation}</span></div>
        <div class="mx-progress">${solved} ✓ · ${fails} ✗</div>
      </div>
      <div class="mx-pitch">
        <div class="mx-lines"></div>
        ${fx.lineup.map((p, i) => slotHTML(p, i)).join("")}
      </div>
      <div class="choice-bar" style="margin-top:18px;grid-template-columns:1fr 1fr">
        <button class="choice-btn" id="mx-giveup" style="font-size:15px">${T("mx_giveup")}</button>
        <button class="choice-btn" id="mx-nextun" style="font-size:15px">${T("mx_next")}</button>
      </div>
      <p class="wip-text" style="margin-top:12px;text-align:center;font-size:12.5px">${T("mx_rule")}</p>
      <div id="mx-wordle-anchor"></div>`;

    app.querySelectorAll("[data-slot]").forEach(el =>
      el.addEventListener("click", () => openWordle(+el.dataset.slot)));
    app.querySelector("#mx-giveup").addEventListener("click", () => {
      GL.openModal({
        title: T("mx_giveup_q"),
        bodyHTML: `<p>${T("mx_giveup_body")}</p>`,
        actions: [
          { label: T("cancel") },
          { label: T("ft_title"), variant: "btn-primary", onClick: close => { close(); endEarly(); } },
        ],
      });
    });
    app.querySelector("#mx-nextun").addEventListener("click", () => {
      const firstOpen = state.findIndex(s => !s.solved && !s.failed);
      if (firstOpen >= 0) openWordle(firstOpen);
    });
  }

  function slotHTML(p, i) {
    const s = state[i];
    const cls = s.solved ? "is-solved" : s.failed ? "is-failed" : s.tried ? "is-touched" : "";
    const label = s.solved || s.failed ? M.surnameOf(p.name).charAt(0) + M.surnameOf(p.name).slice(1).toLowerCase() : "?";
    return `
      <button class="mx-slot ${cls}" data-slot="${i}"
        style="--x:${p.x}%;--y:${p.y}%" aria-label="${p.pos} ${s.solved || s.failed ? p.name : T("mx_hidden")}">
        <span class="mx-jersey">${s.failed ? "✗" : s.solved ? "✓" : i + 1}</span>
        <span class="mx-pos">${p.pos}</span>
        <span class="mx-name">${label}</span>
      </button>`;
  }

  function refreshSlots() {
    fx.lineup.forEach((p, i) => {
      const el = app.querySelector(`[data-slot="${i}"]`);
      if (el) el.outerHTML = slotHTML(p, i);
    });
    app.querySelectorAll("[data-slot]").forEach(el =>
      el.addEventListener("click", () => openWordle(+el.dataset.slot)));
  }

  /* ================= WORDLE PER PLAYER ================= */
  function openWordle(slotIdx) {
    const s = state[slotIdx];
    if (s.solved || s.failed) {
      /* gentle no-spam reminder (max once per slot per session) */
      if (!s._reminded) { s._reminded = true; GL.toast(M.surnameOf(fx.lineup[slotIdx].name) + (s.failed ? " — ✗" : " — ✓")); }
      return;
    }
    activeSlot = slotIdx;
    const player = fx.lineup[slotIdx];
    const anchor = app.querySelector("#mx-wordle-anchor");
    anchor.innerHTML = `
      <div class="wx-panel anim-rise" role="dialog" aria-label="${player.pos}">
        <div class="wx-head">
          <span class="wx-pos">${player.pos}</span>
          <span class="wx-hint">${T("mx_hintline", { team: fx.team, tries: TRIES })}</span>
          <button class="icon-btn wx-close" aria-label="${T("cancel")}">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M18 6 6 18M6 6l12 12"/></svg>
          </button>
        </div>
        <div class="wx-grid" id="wx-grid"></div>
        <div class="wx-keys" id="wx-keys"></div>
        <div class="wx-note">${T("mx_surname_note")}</div>
      </div>`;
    anchor.querySelector(".wx-close").addEventListener("click", closePanel);
    anchor.dataset.slot = slotIdx;

    drawRows(anchor, s);
    drawKeys(anchor, s, player);
  }

  /* one delegated physical-key listener for the app lifetime */
  document.addEventListener("keydown", e => {
    if (activeSlot < 0 || !app.querySelector(".wx-panel")) return;
    if (e.target && /INPUT|TEXTAREA/.test(e.target.tagName)) return;
    if (e.key === "Enter") { e.preventDefault(); submitCurrent(fx.lineup[activeSlot]); }
    else if (e.key === "Backspace") { e.preventDefault(); bksp(fx.lineup[activeSlot]); }
    else if (/^[a-zA-Zà-ÿÀ-ŸçÇñÑ]$/.test(e.key)) addLetter(M.fold(e.key));
  });

  function drawRows(panel, s) {
    const grid = panel.querySelector("#wx-grid");
    if (!grid) return;
    const target = surnameTarget();
    const graded = (s.guessRows || []).filter(g => g.marks);
    const draft = (s.guessRows || []).find(g => !g.marks);
    let html = "";
    for (let r = 0; r < TRIES; r++) {
      let cells = "";
      for (let c = 0; c < target.length; c++) {
        if (r < graded.length) {
          const g = graded[r];
          cells += `<span class="wx-tile ${g.marks[c]}" style="animation-delay:${c * 55}ms">${g.word[c] || ""}</span>`;
        } else if (r === graded.length && draft) {
          cells += `<span class="wx-tile">${draft.word[c] || ""}</span>`;
        } else {
          cells += `<span class="wx-tile"></span>`;
        }
      }
      html += `<div class="wx-row${r === graded.length ? " is-draft" : ""}">${cells}</div>`;
    }
    grid.innerHTML = html;
  }

  function renderWordle() {
    const panel = app.querySelector("#mx-wordle-anchor .wx-panel");
    const s = state[activeSlot];
    if (!panel || !s) return;
    drawRows(panel, s);
  }

  let draft = "";
  function surnameTarget() { return M.surnameOf(fx.lineup[activeSlot].name); }

  function drawKeys(panel, s, player) {
    const keysEl = panel.querySelector("#wx-keys");
    const mk = (label, handler, cls) => `<button class="wx-key ${cls || ""}" data-k="${label}">${label}</button>`;
    let html = ROWS_Q[0].split("").map(k => mk(k)).join("");
    html += `<div class="wx-krow">${ROWS_Q[1].split("").map(k => mk(k)).join("")}</div>`;
    html += `<div class="wx-krow">${mk("⌫", null, "wide")}${ROWS_Q[2].split("").map(k => mk(k)).join("")}${mk("ENTER", null, "wide")}</div>`;
    keysEl.innerHTML = html;
    keysEl.onclick = e => {
      const b = e.target.closest(".wx-key");
      if (!b) return;
      const k = b.dataset.k;
      if (k === "ENTER") submitCurrent(player);
      else if (k === "⌫") bksp(player);
      else addLetter(k);
    };
  }

  function addLetter(ch) {
    if (activeSlot < 0) return;
    const s = state[activeSlot];
    if (!s || s.solved || s.failed) return;
    s.guessRows = s.guessRows || [];
    if (s.guessRows.filter(g => g.marks).length >= TRIES) return;
    let row = s.guessRows[s.guessRows.length - 1];
    if (!row || row.marks) { row = { word: "", marks: null }; s.guessRows.push(row); }
    if (row.word.length < WORD_LEN_MAX) { row.word += ch; GL.sfx.type(); renderWordle(); }
  }
  function bksp(player) {
    if (activeSlot < 0) return;
    const s = state[activeSlot];
    if (!s) return;
    s.guessRows = s.guessRows || [];
    const row = s.guessRows[s.guessRows.length - 1];
    if (!row || row.marks || !row.word.length) return;
    row.word = row.word.slice(0, -1);
    GL.sfx.type();
    renderWordle();
  }
  function redrawDraft() { renderWordle(); }

  function grade(word, target) {
    const marks = Array(target.length).fill("bad");
    const pool = target.split("");
    for (let i = 0; i < target.length; i++)
      if (word[i] === target[i]) { marks[i] = "good"; pool[i] = null; }
    for (let i = 0; i < target.length; i++) {
      if (marks[i] === "good") continue;
      const idx = pool.indexOf(word[i]);
      if (idx >= 0) { marks[i] = "warm"; pool[idx] = null; }
    }
    return marks;
  }

  function submitCurrent(player) {
    if (activeSlot < 0) return;
    const s = state[activeSlot];
    if (!s || !s.guessRows) return;
    const row = s.guessRows[s.guessRows.length - 1];
    if (!row || !row.word) return;
    if (row.marks) return; /* already graded — need next row */
    if (row.word.length !== surnameTarget().length) {
      GL.toast(T("mx_len_needed", { n: surnameTarget().length }), { error: true });
      GL.sfx.wrong();
      return;
    }
    const target = surnameTarget();
    const foldedAliases = (M.ALIASES[target] || []);
    const isExact = row.word === target || foldedAliases.includes(row.word);
    row.marks = isExact ? Array(target.length).fill("good") : grade(row.word, target);
    s.tries++;
    s.tried = true;

    renderWordle();
    row.marks.every(mm => mm === "good")
      ? (GL.sfx.correct(), GL.confetti(24))
      : GL.sfx.reveal();

    if (isExact) {
      s.solved = true;
      setTimeout(closePanel, 750);
    } else if (s.tries >= TRIES) {
      s.failed = true;
      GL.sfx.whistle();
      GL.toast(T("mx_failed_reveal", { name: player.name }), { error: true });
      setTimeout(closePanel, 950);
    } else {
      /* clear draft for the next row */
      row.word = "";
      row.marks = null;
    }
  }

  function closePanel() {
    app.querySelector("#mx-wordle-anchor").innerHTML = "";
    activeSlot = -1;
    refreshSlots();
    const solvedAll = state.every(x => x.solved || x.failed);
    const fails = state.filter(x => x.failed).length;
    if (solvedAll || fails > 2) setTimeout(endNormal, 400);
  }

  /* ================= RESULTS ================= */
  function computedResult() {
    const solved = state.filter(x => x.solved);
    const failed = state.filter(x => x.failed);
    const quick = solved.filter(x => x.tries <= 2).length;
    return { solved: solved.length, quick, fails: failed.length,
      won: failed.length <= 2 && solved.length === fx.lineup.length };
  }

  function shareMarks(res) {
    return fx.lineup.map((_, i) => {
      const s = state[i];
      return s.failed ? "🟥" : s.solved ? (s.tries <= 2 ? "🟩" : "🟨") : "⬛";
    }).reduce((rows, mk, i) => {
      const lane = fx.lineup[i].pos === "GK" ? 0 : ["DF"].includes(fx.lineup[i].pos) ? 1 : ["MF", "AM"].includes(fx.lineup[i].pos) ? 2 : 3;
      (rows[lane] = rows[lane] || []).push(mk);
      return rows;
    }, []).map(r => r.join("")).join("\n");
  }

  function endShareText(res) {
    return `Footyless · Missing XI — ${fx.home} ${fx.score} ${fx.away} (${fx.note})\n${shareMarks(res)}\n${res.solved}/11 · ${fx.season}\nName yours → footyless.com`;
  }

  function recordAndShow(res, forfeited) {
    GL.recordResult("missingxi", { won: res.won, score: res.solved, max: 11 });
    res.won || res.solved >= 8 ? GL.sfx.win() : GL.sfx.fanfare();
    const st = GL.statsFor("missingxi");
    const quip = res.solved === 11 && !res.fails ? T("quip_perf")
      : res.won ? T("mx_quip_win", { n: res.fails })
      : forfeited ? T("mx_quip_forfeit") : T("quip_low");
    const body = document.createElement("div");
    body.innerHTML = `
      <div class="stat-row" style="margin:6px 0 2px">
        <div class="stat-chip"><div class="stat-chip__num ${res.won ? "is-good" : ""}">${res.solved}</div><div class="stat-chip__label">${T("mx_named")}</div></div>
        <div class="stat-chip"><div class="stat-chip__num">${res.quick}</div><div class="stat-chip__label">${T("mx_quick")}</div></div>
        <div class="stat-chip"><div class="stat-chip__num">${res.fails}</div><div class="stat-chip__label">${T("mx_missed")}</div></div>
      </div>
      <p style="text-align:center;margin-top:8px">${quip}</p>`;
    GL.openModal({
      title: res.won ? T("perf_title") : T("ft_title"),
      bodyEl: body,
      onClose: () => { window.removeEventListener("keydown", physHandler); },
      actions: [
        { label: T("rematch"), variant: "btn-primary", onClick: close => { close(); restart(); } },
        { label: T("share"), variant: "btn-secondary", onClick: () => GL.copyText(endShareText(res)) },
      ],
    });
    GL.confetti(res.won ? 160 : 50);
  }
  let physHandler = null;

  function endNormal() { const res = computedResult(); recordAndShow(res, false); }
  function endEarly() {
    /* forfeit: leave unnamed shirts unresolved; only fails already earned count */
    refreshSlots();
    const res = computedResult();
    res.won = false;
    recordAndShow(res, true);
  }
})();
