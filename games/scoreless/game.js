/* ============================================================
   FOOTYLESS · SCORELESS 2.0 — More/Less parity
   Stripped shell, big square photo cards, survive-all-10 scoring,
   wrong = soft pop only, silent digit rolls, daily seeded deck.
   Photos: players from photo registry; matches from match-photos pack.
   ============================================================ */
(function () {
  "use strict";
  const GL = window.GL, Shell = window.Shell, T = window.I18N.t;
  const D = window.SL_DATA;
  const PACKS = window.Packs;

  const MAX_ROUNDS = 10;
  const app = document.getElementById("duel-app");
  let round = 1, locked = false, deck = [], track = [];
  let PHOTOS = {};     /* qid/name -> img */
  let MATCHPICS = {};  /* note/id -> img */

  /* daily rng */
  let RNG = Math.random;
  function makeSeedRng(seedStr) {
    let h = 2166136261;
    for (let i = 0; i < seedStr.length; i++) { h ^= seedStr.charCodeAt(i); h = Math.imul(h, 16777619); }
    let a = h >>> 0;
    return () => { a |= 0; a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  }

  /* photo registry (same canonical source as More/Less) */
  PACKS.load("capless-photos").then(pk => {
    (pk?.players || []).forEach(p => { if (p.qid && p.img) PHOTOS[p.qid] = p.img; });
  }).catch(() => {});
  PACKS.load("match-photos").then(pk => {
    (pk?.matches || []).forEach(m => { if (m.id && m.img) MATCHPICS[m.id] = m.img; });
  }).catch(() => {});

  function photoPlayer(name) {
    /* find any photo by folded-name containment in registry */
    const fold = s => String(s).normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
    for (const p of (window.KT_CACHE_PHOTOS || [])) if (fold(p.n).includes(fold(name)) || fold(name).includes(fold(p.n))) return p.img;
    return null;
  }
  function photoMatch(fixtureId) { return MATCHPICS[fixtureId] || null; }

  /* cached player photo list for name-lookup */
  PACKS.load("capless-photos").then(pk => { window.KT_CACHE_PHOTOS = pk?.players || []; }).catch(() => {});

  function pickPair(pool, prop) {
    for (let tries = 0; tries < 120; tries++) {
      const a = pool[(RNG() * pool.length) | 0];
      const b = pool[(RNG() * pool.length) | 0];
      if (!b || !a) continue;
      if (JSON.stringify(a) === JSON.stringify(b)) continue;
      if (a[prop] === b[prop]) continue;
      return RNG() < 0.5 ? [a, b] : [b, a];
    }
    return [pool[0], pool[1]];
  }

  /* career pool: pack or fallback from More/Less-style fallback names (imported via MISSINGXI pool? — reuse SL_DATA fallback) */
  const FALLBACK_CAREER = [
    { n: "Cristiano Ronaldo", c: "Portugal", v: 920 },
    { n: "Lionel Messi", c: "Argentina", v: 850 },
    { n: "Pelé", c: "Brazil", v: 762 },
    { n: "Romário", c: "Brazil", v: 772 },
    { n: "Josef Bican", c: "Austria", v: 805 },
    { n: "Ferenc Puskás", c: "Hungary", v: 709 },
    { n: "Gerd Müller", c: "Germany", v: 566 },
    { n: "Eusébio", c: "Portugal", v: 565 },
    { n: "Robert Lewandowski", c: "Poland", v: 620 },
    { n: "Zlatan Ibrahimović", c: "Sweden", v: 570 },
    { n: "Karim Benzema", c: "France", v: 480 },
    { n: "Edinson Cavani", c: "Uruguay", v: 500 },
    { n: "Thierry Henry", c: "France", v: 411 },
    { n: "Sergio Agüero", c: "Argentina", v: 420 },
    { n: "Wayne Rooney", c: "England", v: 366 },
    { n: "Kylian Mbappé", c: "France", v: 360 },
    { n: "Erling Haaland", c: "Norway", v: 300 },
    { n: "Mohamed Salah", c: "Egypt", v: 350 },
    { n: "Harry Kane", c: "England", v: 400 },
  ];

  function pairUp(list) {
    const out = [];
    for (let i = 0; i + 1 < list.length; i += 2) {
      const a = list[i], b = list[i + 1];
      if (Math.abs(a.v - b.v) >= 8) out.push({ l: { n: a.n, c: a.c, v: a.v }, r: { n: b.n, c: b.c, v: b.v } });
    }
    return out;
  }

  function buildDeck(practice) {
    RNG = practice ? Math.random : makeSeedRng(GL.todayStr() + "|scoreless");
    const types = [];
    for (let i = 0; i < MAX_ROUNDS; i++) types.push(["match", "career", "bet"][i % 3]);
    const dealt = D.shuffle(types, RNG);
    const careerPool = (D.CAREER_DUELS_DYNAMIC && D.CAREER_DUELS_DYNAMIC.length >= 12)
      ? D.CAREER_DUELS_DYNAMIC.map(s => ({ l: { n: s.n, c: s.c, v: s.v } }))
      : pairUp(D.shuffle(FALLBACK_CAREER, RNG).map(s => ({ n: s.n, c: s.c, v: s.v })));
    const pools = {
      match: D.shuffle(D.MATCH_DUELS, RNG).map(d => ({ l: { ...d.l, id: d.l.t }, r: { ...d.r, id: d.r.t } })),
      career: careerPool,
      bet: D.shuffle(D.SCORE_BETS, RNG).map(b => ({ team: b.team, meta: b.meta, options: b.options, answerIdx: b.answerIdx })),
    };
    deck = dealt.map(ty => ({ type: ty, data: pools[ty].pop() })).filter(r => r.data);
    while (deck.length < MAX_ROUNDS) {
      const ty = deck[deck.length % 3].type;
      deck.push({ type: ty, data: pools[ty][(RNG() * pools[ty].length) | 0] });
    }
    deck = deck.slice(0, MAX_ROUNDS);
  }

  /* ---------- render ---------- */
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

  function cardHTML(entity, side, kind, def) {
    let imgTag = "";
    if (kind === "career") {
      const src = photoPlayer(entity.n);
      imgTag = src
        ? `<img class="dp-photo" src="${esc(src)}" alt="${esc(entity.n)}" draggable="false">`
        : `<div class="dp-photo dp-ph-fallback"><span>${esc(initials(entity.n))}</span></div>`;
    } else if (kind === "match") {
      const src = photoMatch(entity.id);
      imgTag = src
        ? `<img class="dp-photo dp-photo--match" src="${esc(src)}" alt="${esc(entity.t)}" draggable="false">`
        : `<div class="dp-photo dp-ph-fallback dp-ph-fallback--match"><span>⚽</span></div>`;
    } else { /* bet: match photo by fixture meta key */
      const src = photoMatch(entity.meta);
      imgTag = src
        ? `<img class="dp-photo dp-photo--match" src="${esc(src)}" alt="${esc(entity.t)}" draggable="false">`
        : `<div class="dp-photo dp-ph-fallback dp-ph-fallback--match"><span>🏟</span></div>`;
    }
    return `
      <button class="dp-card" data-side="${side}" id="dp-${side}" aria-label="${esc(entity.t || entity.n)}">
        ${imgTag}
        <span class="dp-rollbox"><span class="dp-val" data-val>?</span></span>
        <span class="dp-plate">${esc(entity.t || entity.n)}</span>
        <span class="dp-meta">${esc(entity.meta || entity.c || "")}</span>
      </button>`;
  }

  function initials(n) { return n.split(" ").filter(Boolean).slice(0, 2).map(w => w[0]).join("").toUpperCase(); }

  function boardHTML() {
    const def = deck[round - 1];
    const trackHTML = `<div class="round-track" id="round-track">${dotsHTML()}</div>`;
    const typeLabel = def.type === "match" ? "⚽ " + T("sr_match") : def.type === "career" ? "👑 " + T("sr_career") : "🔮 " + T("sr_bet");
    if (def.type === "bet") {
      const b = def.data;
      const opts = D.shuffle(b.options.map((o, i) => ({ o, i })), RNG);
      def._opts = opts;
      return `${trackHTML}
        <div class="dp-catline"><span>${typeLabel}</span></div>
        <div class="dp-board">
          ${cardHTML({ t: b.team, meta: b.meta }, "l", "bet", def)}
          <div class="dp-orcoin"><span>OR</span><span class="dp-progress" data-progress>${round}/${MAX_ROUNDS}</span></div>
          <div class="dp-betcol" id="bet-options">
            ${opts.map(({ o, i }) => `<button class="choice-btn dp-betbtn" data-bet="${i}">${esc(o)}</button>`).join("")}
          </div>
        </div>`;
    }
    const q = def.type === "match" ? T("sr_match_q") : T("sr_career_q");
    const L = def.data.l, R = def.data.r;
    return `${trackHTML}
      <div class="dp-catline"><span>${typeLabel}</span></div>
      <div class="dp-board">
        ${cardHTML(def.type === "match" ? { t: L.t, meta: L.meta, id: L.id } : { t: L.n, meta: L.c }, "l", def.type, def)}
        <div class="dp-orcoin"><span>OR</span><span class="dp-progress" data-progress>${round}/${MAX_ROUNDS}</span></div>
        ${cardHTML(def.type === "match" ? { t: R.t, meta: R.meta, id: R.id } : { t: R.n, meta: R.c }, "r", def.type, def)}
      </div>
      <div class="mx2-question">${q}</div>`;
  }

  function dotsHTML() {
    return Array.from({ length: MAX_ROUNDS }, (_, i) => {
      const s = track[i] === true ? "is-win" : track[i] === false ? "is-loss" : i === round - 1 && !locked ? "is-now" : "";
      return `<span class="round-dot ${s}"></span>`;
    }).join("");
  }

  function newRound() {
    locked = false;
    app.innerHTML = boardHTML();
    app.querySelectorAll("[data-side]").forEach(el => el.addEventListener("click", () => choose(el)));
    app.querySelectorAll("[data-bet]").forEach(b => b.addEventListener("click", () => chooseBet(b)));
  }

  /* ---------- reveal + verdict (More/Less choreography) ---------- */
  function reveal(side, value) {
    const card = app.querySelector(`#dp-${side}`);
    const el = card?.querySelector("[data-val]");
    if (!el) return;
    card.classList.add("is-showing");
    const dur = 900, t0 = performance.now();
    const frames = "0123456789";
    (function frame(now) {
      const t = Math.min((now - t0) / dur, 1);
      if (t < 1) {
        let s = "";
        const fv = String(value);
        for (let i = 0; i < fv.length; i++) s += (i / fv.length) < t ? fv[i] : frames[(Math.random() * 10) | 0];
        el.textContent = s;
        requestAnimationFrame(frame);
      } else { el.textContent = String(value); el.classList.add("settled"); setTimeout(() => done(), 140); }
    })(performance.now());
  }

  function choose(el) {
    if (locked) return;
    locked = true;
    const def = deck[round - 1];
    const side = el.dataset.side;
    const logical = document.documentElement.dir === "rtl" ? (side === "l" ? "r" : "l") : side;
    let correct, lval, rval, winner;
    if (def.type === "match" || def.type === "career") {
      const l = def.data.l, r = def.data.r;
      const prop = def.type === "match" ? "v" : "v";
      lval = l.v; rval = r.v;
      correct = (l.v > r.v && logical === "l") || (r.v > l.v && logical === "r");
      winner = l.v > r.v ? "l" : r.v > l.v ? "r" : null;
    } else {
      /* bet round handled elsewhere */
      return;
    }
    el.classList.add("is-picked");
    GL.sfx.press();
    /* SEQUENTIAL: left rolls then right rolls */
    reveal("l", lval).then(() => reveal("r", rval)).then(() => {
      const lc = app.querySelector("#dp-l"), rc = app.querySelector("#dp-r");
      if (winner) (winner === "l" ? lc : rc).classList.add("is-winner");
      el.classList.add(correct ? "flash-good" : "flash-bad");
      app.querySelector(".dp-board").classList.add(correct ? "vgood" : "vbad");
      setTimeout(() => {
        correct ? (GL.sfx.correct(), GL.confetti(30)) : GL.sfx.wrong();
        GL.haptic(correct ? 12 : [10, 30, 10]);
      }, 240);
      track.push(correct);
      paintDots();
      setTimeout(nextRound, 1900);
    });
  }

  function chooseBet(btn) {
    if (locked) return;
    locked = true;
    const def = deck[round - 1];
    const idx = +btn.dataset.bet;
    const correct = idx === def.data.answerIdx;
    def._opts.forEach(({ o, i }) => {
      const b = app.querySelector(`[data-bet="${i}"]`);
      if (!b) return;
      if (i === def.data.answerIdx) b.classList.add("picked-correct");
      else if (b === btn) b.classList.add("picked-wrong");
      b.disabled = true;
    });
    setTimeout(() => correct ? (GL.sfx.correct(), GL.confetti(30)) : GL.sfx.wrong(), 200);
    GL.haptic(correct ? 12 : [10, 30, 10]);
    track.push(correct);
    paintDots();
    setTimeout(nextRound, 1900);
  }

  function paintDots() {
    const t = app.querySelector("#round-track");
    if (t) t.innerHTML = dotsHTML();
  }

  function nextRound() {
    if (round >= MAX_ROUNDS) { end(); return; }
    round++;
    newRound();
  }

  /* ---------- end: survive-all-10 scoring ---------- */
  function shareText(score) {
    const marks = track.map(r => (r ? "🟢" : "🔴")).join("");
    return `Footyless · Scoreless — ${score}/${MAX_ROUNDS} ${marks}\nBeat that → footyless.com`;
  }

  function end() {
    const score = track.filter(Boolean).length;
    const wonAll = score === MAX_ROUNDS;
    GL.recordResult("scoreless", { won: wonAll, score, max: MAX_ROUNDS });
    (wonAll || score >= 7) ? GL.sfx.win() : GL.sfx.fanfare();
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
    buildDeck(practice);
    newRound();
    GL.sfx.drum();
  }

  /* ---------- boot ---------- */
  Shell.mount(".app", "scoreless");
  const rb = document.getElementById("btn-restart");
  if (rb) { rb.textContent = T("restart_label"); rb.addEventListener("click", () => restart(true)); }
  buildDeck(false);
  newRound();
})();
