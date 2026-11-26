/* ============================================================
   FOOTYLESS · CAPLESS — duel loop (who has more international caps?)
   Data: data/players.json pack when available, embedded fallback otherwise.
   ============================================================ */
(function () {
  "use strict";
  const GL = window.GL, Shell = window.Shell, T = window.I18N.t;
  const PACKS = window.Packs;

  /* -------- FALLBACK SAMPLE (approximate, late 2025) -------- */
  const FALLBACK = [
    { n: "Cristiano Ronaldo", c: "Portugal", v: 217 },
    { n: "Lionel Messi", c: "Argentina", v: 191 },
    { n: "Ahmed Hassan", c: "Egypt", v: 184 },
    { n: "Luka Modrić", c: "Croatia", v: 187 },
    { n: "Sergio Ramos", c: "Spain", v: 180 },
    { n: "Gianluigi Buffon", c: "Italy", v: 176 },
    { n: "Iker Casillas", c: "Spain", v: 167 },
    { n: "Robert Lewandowski", c: "Poland", v: 158 },
    { n: "Sunil Chhetri", c: "India", v: 151 },
    { n: "Sergei Ignashevich", c: "Russia", v: 127 },
    { n: "Claudio Bravo", c: "Chile", v: 145 },
    { n: "Andrés Iniesta", c: "Spain", v: 131 },
    { n: "Neymar Jr", c: "Brazil", v: 128 },
    { n: "Eden Hazard", c: "Belgium", v: 126 },
    { n: "Son Heung-min", c: "South Korea", v: 133 },
    { n: "Zlatan Ibrahimović", c: "Sweden", v: 122 },
    { n: "Bastian Schweinsteiger", c: "Germany", v: 121 },
    { n: "Wayne Rooney", c: "England", v: 120 },
    { n: "Andrea Pirlo", c: "Italy", v: 116 },
    { n: "David Beckham", c: "England", v: 115 },
    { n: "Steven Gerrard", c: "England", v: 114 },
    { n: "Xabi Alonso", c: "Spain", v: 114 },
    { n: "Kylian Mbappé", c: "France", v: 90 },
    { n: "Ronaldinho", c: "Brazil", v: 97 },
    { n: "Erling Haaland", c: "Norway", v: 43 },
    { n: "Kwadwo Asamoah", c: "Ghana", v: 78 },
    { n: "Paul Scholes", c: "England", v: 66 },
    { n: "Mesut Özil", c: "Germany", v: 92 },
  ];

  let POOL = FALLBACK;

  /* try to upgrade to the baked pack silently */
  PACKS.load("players")
    .then(pack => {
      const pool = PACKS.caplessPool(pack, 40);
      if (pool && pool.length >= 20) {
        POOL = pool;
        console.info("[Capless] data pack loaded:", pool.length, "players ·", PACKS.meta(pack)?.bakedAt?.slice(0, 10));
      }
    })
    .catch(() => {/* offline/sample mode */});

  const MAX_ROUNDS = 12;
  const roundTrack = [];
  let round = 1, pair = null, locked = false;

  function pickPair() {
    const pool = POOL.slice();
    for (let tries = 0; tries < 80; tries++) {
      const a = pool.splice((Math.random() * pool.length) | 0, 1)[0];
      const b = pool[(Math.random() * pool.length) | 0];
      if (!b) break;
      const diff = Math.abs(a.v - b.v);
      if (a.n !== b.n && diff >= 12) return [a, b];
    }
    return [POOL[0], POOL[7] || POOL[1]];
  }

  const app = document.getElementById("duel-app");

  function initials(n) {
    return n.split(" ").filter(Boolean).slice(0, 2).map(w => w[0]).join("").toUpperCase();
  }

  function boardHTML() {
    return `
      <div class="round-track" id="round-track"></div>
      <div class="duel-board">
        <div class="duel-card" id="card-l">
          <div class="avatar">${initials(pair[0].n)}</div>
          <div class="who">${pair[0].n}</div>
          <div class="ctry">${pair[0].c}</div>
          <div class="val">?</div>
        </div>
        <div class="duel-vs">${T("versus")}</div>
        <div class="duel-card" id="card-r">
          <div class="avatar">${initials(pair[1].n)}</div>
          <div class="who">${pair[1].n}</div>
          <div class="ctry">${pair[1].c}</div>
          <div class="val">?</div>
        </div>
      </div>
      <div class="choice-bar">
        <button class="choice-btn" data-dir="left" aria-label="${T("more_choice")} ←">
          ${Shell.icons.arrowL} ${T("more_choice")}
        </button>
        <button class="choice-btn" data-dir="right" aria-label="→ ${T("more_choice")}">
          ${T("more_choice")} ${Shell.icons.arrowR}
        </button>
      </div>
      <p class="wip-text" style="margin-top:16px;text-align:center;font-size:12.5px">
        ${T("sample_note")}
      </p>`;
  }

  function paintTrack() {
    const t = app.querySelector("#round-track");
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
    app.querySelectorAll(".choice-btn").forEach(btn =>
      btn.addEventListener("click", () => choose(btn))
    );
  }

  function choose(btn) {
    if (locked) return;
    locked = true;
    const dir = document.documentElement.dir === "rtl"
      ? (btn.dataset.dir === "left" ? "right" : "left") /* visual sides flip under RTL */
      : btn.dataset.dir;
    const [l, r] = pair;
    const correct = (l.v > r.v && dir === "left") || (r.v > l.v && dir === "right");
    const wonRound = correct;

    setTimeout(() => GL.sfx.reveal(), 150);
    setTimeout(() => {
      const lc = app.querySelector("#card-l"), rc = app.querySelector("#card-r");
      lc.querySelector(".val").textContent = l.v;
      rc.querySelector(".val").textContent = r.v;
      lc.classList.add("revealed", "anim-flip");
      rc.classList.add("revealed", "anim-flip");
      const winnerCard = l.v > r.v ? lc : rc;
      winnerCard.classList.add("win-glow");
      btn.classList.add(correct ? "picked-correct" : "picked-wrong");
      setTimeout(() => {
        wonRound ? GL.sfx.correct() : GL.sfx.wrong();
        wonRound ? GL.confetti(36) : btn.closest(".choice-bar").classList.add("anim-shake");
        GL.haptic(wonRound ? 12 : [10, 40, 10]);
      }, 260);
    }, 550);

    roundTrack.push(wonRound);
    paintTrack();

    setTimeout(() => finishOrNext(wonRound), 2400);
  }

  function scoreSoFar() { return roundTrack.filter(Boolean).length; }

  function finishOrNext(lastWon) {
    const gameOver = !lastWon || round >= MAX_ROUNDS;
    if (!gameOver) { round++; newBoard(); return; }
    endGame(scoreSoFar());
  }

  function shareText(score) {
    const balls = roundTrack.map(r => (r ? "🟢" : "🔴")).join("");
    return `Footyless · Capless — ${score}/${MAX_ROUNDS} ${balls}\nCan you beat me? → footyless.com`;
  }

  function endGame(score) {
    const wonAll = score === MAX_ROUNDS;
    GL.recordResult("capless", { won: wonAll, score, max: MAX_ROUNDS });
    if (wonAll || score >= 8) GL.sfx.win(); else GL.sfx.fanfare();

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
  document.getElementById("btn-restart").textContent = T("restart_label");
  document.getElementById("btn-restart").setAttribute("aria-label", T("restart_aria"));
  document.getElementById("btn-restart").addEventListener("click", restart);
  document.querySelector(".caps-instr").textContent = T("caps_instr");
  newBoard();
})();
