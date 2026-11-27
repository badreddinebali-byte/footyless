/* ============================================================
   FOOTYLESS · SCORELESS — mixed duel deck
   Round types: 'match' (fixtures), 'career' (players), 'bet' (scoreline)
   ============================================================ */
(function () {
  "use strict";
  const GL = window.GL, Shell = window.Shell, T = window.I18N.t;
  const D = window.SL_DATA;
  const PACKS = window.Packs;

  /* upgrade career-duel pool from the baked pack when present */
  PACKS.load("players")
    .then(pack => {
      const scorers = PACKS.scorerPool(pack);
      if (scorers && scorers.length >= 12) {
        D.CAREER_DUELS_DYNAMIC = scorers;
        console.info("[Scoreless] scorers pack loaded:", scorers.length, "·", PACKS.meta(pack)?.bakedAt?.slice(0, 10));
      }
    })
    .catch(() => {});

  const MAX_ROUNDS = 10;
  const app = document.getElementById("duel-app");
  let round = 1, locked = false, deck = [], track = [];

  /* consecutive scorer pairs with meaningful gap → career duels */
  /* ---- daily deterministic RNG ---- */
  let RNG = Math.random;
  function makeSeedRng(seedStr) {
    let h = 2166136261;
    for (let i = 0; i < seedStr.length; i++) { h ^= seedStr.charCodeAt(i); h = Math.imul(h, 16777619); }
    let a = h >>> 0;
    return () => { a |= 0; a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  }
  function pairUp(list) {
    const out = [];
    for (let i = 0; i + 1 < list.length; i += 2) {
      const a = list[i], b = list[i + 1];
      if (Math.abs(a.v - b.v) >= 8) out.push({ l: { n: a.n, c: a.c, v: a.v }, r: { n: b.n, c: b.c, v: b.v } });
    }
    return out;
  }

  /* ---------- deal a mixed deck ---------- */
  function buildDeck(practice) {
    const careerPool = (D.CAREER_DUELS_DYNAMIC && D.CAREER_DUELS_DYNAMIC.length >= 12)
      ? D.CAREER_DUELS_DYNAMIC.map(s => ({ l: { n: s.n, c: s.c, v: s.v } }))
      : null;
    const types = [];
    for (let i = 0; i < MAX_ROUNDS; i++) {
      types.push(["match", "career", "bet"][i % 3]);   // even 3/3/3 split +1
    }
    const dealt = D.shuffle(types, RNG);
    const pools = {
      match: D.shuffle(D.MATCH_DUELS, RNG).map(d => ({ l: d.l, r: d.r })),
      career: careerPool
        ? pairUp(D.shuffle(careerPool, RNG))
        : D.shuffle(D.CAREER_DUELS, RNG).map(d => ({ l: d.l, r: d.r })),
      bet: D.shuffle(D.SCORE_BETS, RNG).map(b => ({ team: b.team, meta: b.meta, options: b.options, answerIdx: b.answerIdx })),
    };
    deck = dealt.map(ty => ({ type: ty, data: pools[ty].pop() })).filter(r => r.data);
    /* fill shortfall by recycling */
    while (deck.length < MAX_ROUNDS) {
      const ty = deck[deck.length % 3].type;
      deck.push({ type: ty, data: pools[ty][(Math.random() * pools[ty].length) | 0] });
    }
    deck = deck.slice(0, MAX_ROUNDS);
  }

  /* ---------- renderers ---------- */
  const initials = n => n.split(" ").filter(Boolean).slice(0, 2).map(w => w[0]).join("").toUpperCase();

  function roundLabel(type) {
    return type === "match" ? "⚽ " + T("sr_match")
         : type === "career" ? "👑 " + T("sr_career")
         : "🔮 " + T("sr_bet");
  }

  function boardHTML(roundDef) {
    const trackHTML = `
      <div class="round-track" id="round-track">${paintTrackDots()}</div>`;
    if (roundDef.type === "bet") {
      const b = roundDef.data;
      const opts = D.shuffle(b.options.map((o, i) => ({ o, i })), null);
      return `${trackHTML}
        <div class="duel-board" style="grid-template-columns:1fr">
          <div class="duel-card revealed" style="transform:none">
            <div class="avatar">🏟</div>
            <div class="who">${b.team}</div>
            <div class="ctry">${b.meta}</div>
            <div class="val" style="font-size:15px;font-family:var(--font-body);color:var(--fg-muted)">
              ${T("sr_bet_prompt")}</div>
          </div>
        </div>
        <div class="choice-bar" style="grid-template-columns:repeat(${opts.length},1fr)" id="bet-options">
          ${opts.map(({ o, i }) => `<button class="choice-btn" data-bet="${i}" style="font-size:14px;padding:0 10px">${o}</button>`).join("")}
        </div>
        <p class="wip-text" style="margin-top:16px;text-align:center;font-size:12.5px">${T("sample_note")}</p>`;
    }
    // duel layout (match or career)
    const L = roundDef.data.l, R = roundDef.data.r;
    const titleL = roundDef.type === "match" ? L.t : L.n;
    const titleR = roundDef.type === "match" ? R.t : R.n;
    const metaL  = roundDef.type === "match" ? L.meta : L.c;
    const metaR  = roundDef.type === "match" ? R.meta : R.c;
    return `${trackHTML}
      <div class="sr-question">${roundDef.type === "match" ? T("sr_match_q") : T("sr_career_q")}</div>
      <div class="duel-board">
        <div class="duel-card" id="card-l">
          <div class="avatar">${roundDef.type === "match" ? "🗓" : initials(titleL)}</div>
          <div class="who">${titleL}</div>
          <div class="ctry">${metaL}</div>
          <div class="val">?</div>
        </div>
        <div class="duel-vs">${T("versus")}</div>
        <div class="duel-card" id="card-r">
          <div class="avatar">${roundDef.type === "match" ? "🗓" : initials(titleR)}</div>
          <div class="who">${titleR}</div>
          <div class="ctry">${metaR}</div>
          <div class="val">?</div>
        </div>
      </div>
      <div class="choice-bar">
        <button class="choice-btn" data-dir="left">${Shell.icons.arrowL} ${T("sr_more")}</button>
        <button class="choice-btn" data-dir="right">${T("sr_more")} ${Shell.icons.arrowR}</button>
      </div>
      <p class="wip-text" style="margin-top:16px;text-align:center;font-size:12.5px">${T("sample_note")}</p>`;
  }

  function paintTrackDots() {
    return Array.from({ length: MAX_ROUNDS }, (_, i) => {
      const state = track[i] === true ? "is-win" : track[i] === false ? "is-loss" : i === round - 1 && !locked ? "is-now" : "";
      return `<span class="round-dot ${state}"></span>`;
    }).join("");
  }

  function newRound() {
    locked = false;
    app.innerHTML = boardHTML(deck[round - 1]);

    /* wire per-type handlers */
    app.querySelectorAll("[data-dir]").forEach(btn =>
      btn.addEventListener("click", () => chooseDuel(btn)));
    app.querySelectorAll("[data-bet]").forEach(btn =>
      btn.addEventListener("click", () => chooseBet(btn)));

    /* topline type banner */
    const q = app.querySelector(".sr-question") ||
      app.querySelector(".duel-card .val");
    if (q) app.insertAdjacentHTML("afterbegin",
      `<div class="sr-type">${roundLabel(deck[round - 1].type)}</div>`);
  }

  /* ---------- scoring ---------- */
  function chooseDuel(btn) {
    if (locked) return;
    locked = true;
    const def = deck[round - 1];
    const dir = document.documentElement.dir === "rtl"
      ? (btn.dataset.dir === "left" ? "right" : "left") : btn.dataset.dir;
    const l = def.data.l, r = def.data.r;
    const correct = (l.v > r.v && dir === "left") || (r.v > l.v && dir === "right");

    setTimeout(() => GL.sfx.reveal(), 150);
    setTimeout(() => {
      const lc = app.querySelector("#card-l"), rc = app.querySelector("#card-r");
      lc.querySelector(".val").textContent = def.type === "match" ? l.v + " ⚽" : l.v.toLocaleString("en");
      rc.querySelector(".val").textContent = def.type === "match" ? r.v + " ⚽" : r.v.toLocaleString("en");
      lc.classList.add("revealed", "anim-flip");
      rc.classList.add("revealed", "anim-flip");
      (l.v > r.v ? lc : rc).classList.add("win-glow");
      btn.classList.add(correct ? "picked-correct" : "picked-wrong");
      setTimeout(() => {
        correct ? (GL.sfx.correct(), GL.confetti(36)) : GL.sfx.wrong();
        GL.haptic(correct ? 12 : [10, 40, 10]);
      }, 260);
    }, 550);
    track.push(correct);
    repaintTrack();
    setTimeout(() => next(correct), 2400);
  }

  function chooseBet(btn) {
    if (locked) return;
    locked = true;
    const def = deck[round - 1];
    const idx = +btn.dataset.bet;
    const correct = idx === def.data.answerIdx;
    const optRow = app.querySelector("#bet-options");
    optRow.querySelectorAll(".choice-btn").forEach((b, i) => {
      const isAns = +b.dataset.bet === def.data.answerIdx;
      if (isAns) b.classList.add("picked-correct");
      else if (b === btn) b.classList.add("picked-wrong");
      b.disabled = true;
    });
    setTimeout(() => correct ? (GL.sfx.correct(), GL.confetti(36)) : GL.sfx.wrong(), 200);
    track.push(correct);
    repaintTrack();
    setTimeout(() => next(correct), 2200);
  }

  function repaintTrack() {
    const t = app.querySelector("#round-track");
    if (t) t.innerHTML = paintTrackDots();
  }

  function next(lastWon) {
    const over = !lastWon || round >= MAX_ROUNDS;
    if (!over) { round++; newRound(); return; }
    end(track.filter(Boolean).length);
  }

  function shareText(score) {
    const marks = track.map(r => (r ? "🟢" : "🔴")).join("");
    return `Footyless · Scoreless — ${score}/${MAX_ROUNDS} ${marks}\nBeat that → footyless.com`;
  }

  function end(score) {
    const wonAll = score === MAX_ROUNDS;
    GL.recordResult("scoreless", { won: wonAll, score, max: MAX_ROUNDS });
    if (wonAll || score >= 7) GL.sfx.win(); else GL.sfx.fanfare();

    const st = GL.statsFor("scoreless");
    const quip = wonAll ? T("quip_perf") : score >= 7 ? T("quip_good") : T("quip_low");
    const body = document.createElement("div");
    body.innerHTML = `
      <div class="stat-row" style="margin:6px 0 2px">
        <div class="stat-chip"><div class="stat-chip__num ${wonAll ? "is-good" : ""}">${score}</div><div class="stat-chip__label">${T("rounds_won")}</div></div>
        <div class="stat-chip"><div class="stat-chip__num">${st.bestStreak || score}</div><div class="stat-chip__label">${T("best_streak")}</div></div>
        <div class="stat-chip"><div class="stat-chip__num">${st.played}</div><div class="stat-chip__label">${T("played")}</div></div>
      </div>
      <p style="text-align:center;margin-top:8px">${quip}</p>`;
    GL.openModal({
      title: wonAll ? T("perf_title") : T("ft_title"),
      bodyEl: body,
      actions: [
        { label: T("rematch"), variant: "btn-primary", onClick: close => { close(); restart(true); } },
        { label: T("share"), variant: "btn-secondary", onClick: () => GL.copyText(shareText(score)) },
      ],
    });
    GL.confetti(wonAll ? 160 : 40);
  }

  function restart(practice) {
    round = 1; track = [];
    RNG = practice ? Math.random : makeSeedRng(GL.todayStr() + "|scoreless");
    buildDeck();
    newRound();
    GL.sfx.drum();
  }

  /* ---------- boot ---------- */
  Shell.mount(".app", "scoreless");
  const rb = document.getElementById("btn-restart");
  if (rb) { rb.textContent = T("restart_label"); rb.setAttribute("aria-label", T("restart_aria")); rb.addEventListener("click", restart); }
  RNG = makeSeedRng(GL.todayStr() + "|scoreless");
  buildDeck();
  newRound();
})();
