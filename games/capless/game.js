/* ============================================================
   FOOTYLESS · CAPLESS — photo duel (lessgames More/less grammar)
   Two big portrait cards side by side · central OR coin ·
   white name plates · value reveals after pick.
   Photos: Wikidata P18 (CC) via photos-data.json; fallback initials.
   ============================================================ */
(function () {
  "use strict";
  const GL = window.GL, Shell = window.Shell, T = window.I18N.t;
  const PACKS = window.Packs;

  /* -------- FALLBACK (used until photo pack loads) -------- */
  const FALLBACK = [
    { n: "Cristiano Ronaldo", c: "Portugal", v: 217 },
    { n: "Lionel Messi", c: "Argentina", v: 191 },
    { n: "Luka Modrić", c: "Croatia", v: 187 },
    { n: "Sergio Ramos", c: "Spain", v: 180 },
    { n: "Gianluigi Buffon", c: "Italy", v: 176 },
    { n: "Iker Casillas", c: "Spain", v: 167 },
    { n: "Robert Lewandowski", c: "Poland", v: 158 },
    { n: "Sunil Chhetri", c: "India", v: 151 },
    { n: "Claudio Bravo", c: "Chile", v: 145 },
    { n: "Luis Suárez", c: "Uruguay", v: 142 },
    { n: "Son Heung-min", c: "South Korea", v: 133 },
    { n: "Andrés Iniesta", c: "Spain", v: 131 },
    { n: "Neymar", c: "Brazil", v: 128 },
    { n: "Eden Hazard", c: "Belgium", v: 126 },
    { n: "Zlatan Ibrahimović", c: "Sweden", v: 122 },
    { n: "Wayne Rooney", c: "England", v: 120 },
    { n: "Andrea Pirlo", c: "Italy", v: 116 },
    { n: "David Beckham", c: "England", v: 115 },
    { n: "Xabi Alonso", c: "Spain", v: 114 },
    { n: "Mohamed Salah", c: "Egypt", v: 115 },
    { n: "Harry Kane", c: "England", v: 109 },
    { n: "Ronaldinho", c: "Brazil", v: 97 },
    { n: "Kylian Mbappé", c: "France", v: 90 },
    { n: "Mesut Özil", c: "Germany", v: 92 },
    { n: "Erling Haaland", c: "Norway", v: 43 },
  ];

  let POOL = FALLBACK;
  PACKS.load("capless-photos")
    .then(pack => {
      const photos = pack?.players || [];
      const norm = s => String(s).normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
      const withFaces = photos
        .map(p => {
          const base = FALLBACK.find(f => norm(f.n) === norm(p.n));
          return base ? Object.assign({}, base, { img: p.img, qid: p.qid }) : null;
        })
        .filter(Boolean);
      if (withFaces.length >= 12) {
        POOL = withFaces;
        console.info("[Capless] photo pack merged:", withFaces.length);
      }
    })
    .catch(() => {});

  const MAX_ROUNDS = 12;
  const app = document.getElementById("duel-app");
  let round = 1, pair = null, locked = false;
  const roundTrack = [];

  function pickPair() {
    const pool = POOL.slice();
    for (let tries = 0; tries < 90; tries++) {
      const a = pool.splice((Math.random() * pool.length) | 0, 1)[0];
      const b = pool[(Math.random() * pool.length) | 0];
      if (!b) break;
      if (a.n !== b.n && Math.abs(a.v - b.v) >= 12) return [a, b];
    }
    return [POOL[0], POOL[1] || POOL[0]];
  }

  const esc = s => String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

  function initials(n) {
    return n.split(" ").filter(Boolean).slice(0, 2).map(w => w[0]).join("").toUpperCase();
  }

  function cardHTML(p, side) {
    const img = p.img
      ? `<img class="dp-photo" src="${esc(p.img)}" alt="${esc(p.n)}" loading="eager"
           onerror="this.classList.add('is-broken')">`
      : `<div class="dp-photo dp-ph-fallback"><span>${initials(p.n)}</span></div>`;
    return `
      <figure class="dp-card" data-side="${side}" id="dp-${side}">
        ${img}
        <figcaption class="dp-plate">${esc(p.n)}</figcaption>
        <div class="dp-meta">${esc(p.c || "")}</div>
        <div class="dp-val">?</div>
      </figure>`;
  }

  function boardHTML() {
    return `
      <div class="round-track" id="round-track"></div>
      <div class="dp-question">${T("caps_instr")}</div>
      <div class="dp-board">
        ${cardHTML(pair[0], "l")}
        <div class="dp-orcoin"><span>OR</span></div>
        ${cardHTML(pair[1], "r")}
      </div>
      <div class="dp-actions">
        <button class="dp-pick" data-dir="l" aria-label="${T("more_choice")} — left">${Shell.icons.arrowL}</button>
        <button class="dp-pick" data-dir="r" aria-label="${T("more_choice")} — right">${Shell.icons.arrowR}</button>
      </div>
      <p class="wip-text" style="margin-top:14px;text-align:center;font-size:12.5px">${T("sample_note")}</p>`;
  }

  function paintTrack() {
    const t = app.querySelector("#round-track");
    if (!t) return;
    t.innerHTML = Array.from({ length: MAX_ROUNDS }, (_, i) => {
      const state = roundTrack[i] === true ? "is-win" : roundTrack[i] === false ? "is-loss" : i === round - 1 && !locked ? "is-now" : "";
      return `<span class="round-dot ${state}"></span>`;
    }).join("");
  }

  function newBoard() {
    pair = pickPair();
    locked = false;
    app.innerHTML = boardHTML();
    paintTrack();
    app.querySelectorAll(".dp-pick").forEach(btn =>
      btn.addEventListener("click", () => choose(btn)));
  }

  function choose(btn) {
    if (locked) return;
    locked = true;
    const dir = document.documentElement.dir === "rtl"
      ? (btn.dataset.dir === "l" ? "r" : "l")
      : btn.dataset.dir;
    const [l, r] = pair;
    const correct = (l.v > r.v && dir === "l") || (r.v > l.v && dir === "r");

    btn.classList.add("is-picked");
    setTimeout(() => GL.sfx.reveal(), 140);
    setTimeout(() => {
      const lc = app.querySelector("#dp-l"), rc = app.querySelector("#dp-r");
      lc.querySelector(".dp-val").textContent = l.v.toLocaleString("en");
      rc.querySelector(".dp-val").textContent = r.v.toLocaleString("en");
      lc.classList.add("is-revealed", "anim-flip");
      rc.classList.add("is-revealed", "anim-flip");
      (l.v > r.v ? lc : rc).classList.add("is-winner");
      btn.classList.add(correct ? "is-correct" : "is-wrong");
      setTimeout(() => {
        correct ? (GL.sfx.correct(), GL.confetti(34)) : (GL.sfx.wrong(), GL.sfx.whistle());
        GL.haptic(correct ? 12 : [10, 40, 10]);
      }, 240);
    }, 520);

    roundTrack.push(correct);
    paintTrack();
    setTimeout(() => nextRound(correct), 2350);
  }

  function nextRound(lastWon) {
    if (!lastWon || round >= MAX_ROUNDS) { end(roundTrack.filter(Boolean).length); return; }
    round++;
    newBoard();
  }

  function shareText(score) {
    const balls = roundTrack.map(r => (r ? "🟢" : "🔴")).join("");
    return `Footyless · Capless — ${score}/${MAX_ROUNDS} ${balls}\nBeat me → footyless.com`;
  }

  function end(score) {
    const wonAll = score === MAX_ROUNDS;
    GL.recordResult("capless", { won: wonAll, score, max: MAX_ROUNDS });
    (wonAll || score >= 8) ? GL.sfx.win() : GL.sfx.fanfare();

    const st = GL.statsFor("capless");
    const quip = wonAll ? T("quip_perf") : score >= 8 ? T("quip_good") : T("quip_low");
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
        { label: T("rematch"), variant: "btn-primary", onClick: close => { close(); restart(); } },
        { label: T("share"), variant: "btn-secondary", onClick: () => GL.copyText(shareText(score)) },
      ],
    });
    GL.confetti(wonAll ? 160 : 40);
  }

  function restart() {
    round = 1; roundTrack.length = 0;
    newBoard();
    GL.sfx.drum();
  }

  /* ---------- boot ---------- */
  Shell.mount(".app", "capless");
  const rb = document.getElementById("btn-restart");
  if (rb) { rb.textContent = T("restart_label"); rb.addEventListener("click", restart); }
  newBoard();
})();
