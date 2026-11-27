/* ============================================================
   FOOTYLESS · MORE/LESS — 5-category circuit (lessgames parity)
   5 categories × 5 rounds · tap-photo to pick · sequential number
   roll · edge flash verdict · OR-coin progress badge · splashes.
   ============================================================ */
(function () {
  "use strict";
  const GL = window.GL, Shell = window.Shell, T = window.I18N.t;
  const PACKS = window.Packs;

  const ROUNDS_PER_CAT = 5;

  /* ---------------- category definitions ---------------- */
  const CATS = [
    { id: "caps",  icon: "🧢", key: "ml_caps",  prop: "caps",  fmt: v => String(v) },
    { id: "cl",    icon: "🏆", key: "ml_cl",    prop: "cl",    fmt: v => String(v) },
    { id: "troph", icon: "🥇", key: "ml_troph", prop: "troph", fmt: v => String(v) },
    { id: "spend", icon: "💶", key: "ml_spend", prop: "spend", fmt: v => String(v) },
    { id: "ast",   icon: "🎯", key: "ml_ast",   prop: "ast",   fmt: v => String(v) },
  ];

  /* fallback roster (trimmed) while pack loads — real pack merges in */
  const FALLBACK = [
    { n: "Cristiano Ronaldo", c: "Portugal", caps: 217, cl: 5, troph: 35, spend: 193, ast: 275 },
    { n: "Lionel Messi", c: "Argentina", caps: 191, cl: 4, troph: 46, spend: 0, ast: 385 },
    { n: "Luka Modrić", c: "Croatia", caps: 187, cl: 6, troph: 28, spend: 49, ast: 160 },
    { n: "Sergio Ramos", c: "Spain", caps: 180, cl: 4, troph: 30, spend: 80, ast: 60 },
    { n: "Gianluigi Buffon", c: "Italy", caps: 176, cl: 1, troph: 32, spend: 61, ast: 0 },
    { n: "Robert Lewandowski", c: "Poland", caps: 158, cl: 1, troph: 34, spend: 84, ast: 190 },
    { n: "Sunil Chhetri", c: "India", caps: 151, cl: 0, troph: 14, spend: 0, ast: 30 },
    { n: "Luis Suárez", c: "Uruguay", caps: 142, cl: 1, troph: 27, spend: 121, ast: 210 },
    { n: "Son Heung-min", c: "South Korea", caps: 133, cl: 0, troph: 4, spend: 76, ast: 130 },
    { n: "Neymar", c: "Brazil", caps: 128, cl: 1, troph: 32, spend: 400, ast: 250 },
    { n: "Zlatan Ibrahimović", c: "Sweden", caps: 122, cl: 0, troph: 34, spend: 180, ast: 120 },
    { n: "Wayne Rooney", c: "England", caps: 120, cl: 1, troph: 17, spend: 0, ast: 200 },
    { n: "Karim Benzema", c: "France", caps: 97, cl: 5, troph: 30, spend: 130, ast: 170 },
    { n: "Harry Kane", c: "England", caps: 109, cl: 0, troph: 3, spend: 110, ast: 150 },
    { n: "Erling Haaland", c: "Norway", caps: 43, cl: 1, troph: 8, spend: 170, ast: 70 },
    { n: "Dani Alves", c: "Brazil", caps: 126, cl: 3, troph: 43, spend: 130, ast: 170 },
    { n: "Toni Kroos", c: "Germany", caps: 114, cl: 6, troph: 34, spend: 35, ast: 150 },
    { n: "Kevin De Bruyne", c: "Belgium", caps: 109, cl: 1, troph: 20, spend: 105, ast: 270 },
    { n: "Thomas Müller", c: "Germany", caps: 131, cl: 2, troph: 32, spend: 0, ast: 260 },
  ];
  let POOL = FALLBACK;

  PACKS.load("players-v2").then(pack => {
    const list = (pack?.players || []).filter(p => p.qid);
    if (list.length >= 20) { POOL = list; console.info("[MoreLess] roster v2:", list.length); }
  }).catch(() => {});

  /* canonical photo registry lookup (site-wide consistency) */
  let PHOTOS = {};
  PACKS.load("capless-photos").then(pk => {
    (pk?.players || []).forEach(p => { if (p.qid) PHOTOS[p.qid] = p.img; });
    (pk?.players || []).forEach(p => { if (!PHOTOS[p.qid] && p.img) PHOTOS[p.n.toLowerCase()] = p.img; });
  }).catch(() => {});
  function photoOf(p) { return p.img || PHOTOS[p.qid] || PHOTOS[p.n.toLowerCase()] || null; }

  /* ---------------- state ---------------- */
  const app = document.getElementById("duel-app");
  let catIdx = 0, roundInCat = 0, pair = null, busy = false;
  const rounds = [];   /* {cat, won} in play order */
  let usedPairs = new Set();

  /* ---------------- helpers ---------------- */
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const initials = n => n.split(" ").filter(Boolean).slice(0, 2).map(w => w[0]).join("").toUpperCase();

  function pickPair(cat) {
    const prop = cat.prop;
    for (let tries = 0; tries < 120; tries++) {
      const a = POOL[(Math.random() * POOL.length) | 0];
      const b = POOL[(Math.random() * POOL.length) | 0];
      if (!b || a.n === b.n) continue;
      if (a[prop] === b[prop]) continue;         // no-brainer: ties are boring here; ties elsewhere still count correct
      const key = [cat.id, [a.n, b.n].sort().join("&")].join("|");
      if (usedPairs.has(key)) continue;
      usedPairs.add(key);
      return Math.random() < 0.5 ? [a, b] : [b, a];
    }
    const a = POOL[0], b = POOL[1];
    return [a, b];
  }

  /* ---------------- rendering ---------------- */
  function cardHTML(p, side) {
    const src = photoOf(p);
    const media = src
      ? `<img class="dp-photo" src="${esc(src)}" alt="${esc(p.n)}" draggable="false">`
      : `<div class="dp-photo dp-ph-fallback"><span>${initials(p.n)}</span></div>`;
    return `
      <button class="dp-card" data-side="${side}" id="dp-${side}" aria-label="${esc(p.n)}">
        ${media}
        <span class="dp-rollbox"><span class="dp-val" data-val>?</span></span>
        <span class="dp-plate">${esc(p.n)}</span>
      </button>`;
  }

  function boardHTML() {
    const cat = CATS[catIdx];
    return `
      <div class="round-track" id="round-track"></div>
      <div class="dp-catline"><span class="dp-caticon">${cat.icon}</span> ${T(cat.key)}</div>
      <div class="dp-question">${T("ml_prompt")}</div>
      <div class="dp-board">
        ${cardHTML(pair[0], "l")}
        <div class="dp-orcoin"><span>OR</span><span class="dp-progress" data-progress></span></div>
        ${cardHTML(pair[1], "r")}
      </div>
      <p class="wip-text" style="margin-top:14px;text-align:center;font-size:12.5px">${T("ml_hint_tap")}</p>`;
  }

  function paintTrack() {
    const t = app.querySelector("#round-track");
    if (!t) return;
    let html = "";
    CATS.forEach((c, ci) => {
      for (let r = 0; r < ROUNDS_PER_CAT; r++) {
        const gi = ci * ROUNDS_PER_CAT + r;
        const rec = rounds[gi];
        const cls = rec ? (rec.won ? "is-win" : "is-loss") : (ci === catIdx && r === roundInCat && !busy ? "is-now" : "");
        html += `<span class="round-dot ${cls}"></span>`;
      }
    });
    t.innerHTML = html;
  }

  function paintProgress() {
    const p = app.querySelector("[data-progress]");
    if (p) p.textContent = `${roundInCat + 1}/${ROUNDS_PER_CAT}`;
  }

  function paintCatLine() {
    const el = app.querySelector(".dp-catline");
    const cat = CATS[catIdx];
    if (el) el.innerHTML = `<span class="dp-caticon">${cat.icon}</span> ${T(cat.key)}`;
  }

  function newBoard(withCatIntro) {
    busy = false;
    const cat = CATS[catIdx];
    pair = pickPair(cat);
    app.innerHTML = boardHTML();
    if (withCatIntro) {
      const line = app.querySelector(".dp-catline");
      line.classList.add("anim-rise");
    }
    paintTrack();
    paintProgress();
    app.querySelectorAll(".dp-card").forEach(c => c.addEventListener("click", onPick));
  }

  /* ---------------- the pick + reveal choreography ---------------- */
  function onPick(ev) {
    if (busy) return;
    busy = true;
    const card = ev.currentTarget;
    const side = card.dataset.side;              /* 'l' | 'r' (visual; RTL mapped below) */
    const logical = document.documentElement.dir === "rtl" ? (side === "l" ? "r" : "l") : side;
    const cat = CATS[catIdx];
    const L = pair[0], R = pair[1];
    const lv = L[cat.prop], rv = R[cat.prop];

    /* immediate affordance */
    app.querySelectorAll(".dp-card").forEach(c => c.classList.remove("is-picked"));
    card.classList.add("is-picked");
    GL.sfx.press();
    GL.haptic(10);

    const gc = (p) => p.img
      ? `<img class="dp-mini" src="${esc(p.img)}" alt="">` : "";

    /* SEQUENTIAL REVEAL — left rolls, settles; right rolls, settles */
    const lc = app.querySelector("#dp-l"), rc = app.querySelector("#dp-r");
    roll(lc, lv, 0).then(() => roll(rc, rv, 150)).then(() => {
      /* verdict */
      const tie = lv === rv;
      const wonSide = tie ? null : (lv > rv ? "l" : "r");
      const correct = tie || wonSide === logical;
      const wc = tie ? null : (lv > rv ? lc : rc);
      const loser = tie ? null : (lv > rv ? rc : lc);
      if (wc) wc.classList.add("is-winner");
      if (loser) loser.classList.add("is-loser");
      const pickedCard = app.querySelector(`#dp-${logical === "l" ? "l" : "r"}`);
      pickedCard.classList.add(correct ? "flash-good" : "flash-bad");
      app.querySelector(".dp-board").classList.add(correct ? "vgood" : "vbad");
      correct ? (GL.sfx.correct(), GL.confetti(30)) : (GL.sfx.wrong(), GL.sfx.whistle());
      GL.haptic(correct ? 14 : [12, 45, 12]);

      /* verdict banner */
      const banner = document.createElement("div");
      banner.className = "dp-verdict " + (correct ? "is-ok" : "is-no");
      banner.innerHTML = correct
        ? `${gc(pair.find(x => x[cat.prop] === Math.max(lv, rv)))}<span>${T("verdict_ok")}</span>`
        : `<span>${T("verdict_no")} · ${esc((lv > rv ? L : R).n)} ${cat.fmt(Math.max(lv, rv))}</span>`;
      app.querySelector(".dp-question").replaceWith(banner);

      rounds.push({ cat: cat.id, won: correct });
      paintTrack();
      advance(wonSide);
    });
  }

  /* number roll: scramble digits then settle to final (rolls only this card) */
  function roll(card, finalVal, delay) {
    return new Promise(done => {
      const el = card.querySelector("[data-val]");
      card.classList.add("is-showing");
      const dur = 900;
      const t0 = performance.now() + delay;
      const frames = "0123456789";
      (function frame(now) {
        if (now - t0 < 0) { requestAnimationFrame(frame); return; }
        const t = Math.min((now - t0) / dur, 1);
        if (t < 1) {
          let s = "";
          const fv = String(finalVal);
          for (let i = 0; i < fv.length; i++)
            s += (i / fv.length) < t ? fv[i] : frames[(Math.random() * 10) | 0];
          el.textContent = s;
          GL.sfx.tick();
          requestAnimationFrame(frame);
        } else {
          el.textContent = String(finalVal);
          el.classList.add("settled");
          setTimeout(done, 140);
        }
      })(performance.now());
    });
  }

  /* advance: next round or splash or finish */
  function advance(wonSide) {
    setTimeout(() => {
      roundInCat++;
      if (roundInCat >= ROUNDS_PER_CAT) {
        catIdx++;
        roundInCat = 0;
        if (catIdx >= CATS.length) { end(); return; }
        splash(catIdx - 1, catIdx, () => newBoard(true));
      } else {
        /* brief OR-badge update & fresh pair */
        const stale = app.querySelector(".dp-board");
        stale?.classList.add("dp-out");
        setTimeout(() => newBoard(false), 260);
      }
    }, 1900);
  }

  function splash(fromCatIdx, toCatIdx, next) {
    const from = CATS[fromCatIdx], to = CATS[toCatIdx];
    const block = rounds.slice(fromCatIdx * ROUNDS_PER_CAT, toCatIdx * ROUNDS_PER_CAT);
    const marks = block.map(r => (r.won ? "🟢" : "🔴")).join("");
    const score = block.filter(r => r.won).length;
    const ov = document.createElement("div");
    ov.className = "dp-splash";
    ov.innerHTML = `
      <div class="dp-splash__card anim-rise">
        <div class="dp-splash__done">${T(from.icon + "") || from.icon} ${T(from.key)} · ${score}/${ROUNDS_PER_CAT} <span class="dp-splash__emo">${marks}</span></div>
        <div class="dp-splash__up">${T("splash_upnext")}</div>
        <div class="dp-splash__cat">${to.icon} ${T(to.key)}</div>
      </div>`;
    document.body.appendChild(ov);
    GL.sfx.fanfare();
    setTimeout(() => { ov.classList.add("is-out"); setTimeout(() => { ov.remove(); next(); }, 300); }, 2600);
  }

  /* ---------------- full time ---------------- */
  function shareText(score) {
    let out = `Footyless · More/Less — ${score}/25\n`;
    CATS.forEach((c, ci) => {
      out += (c.icon) + " ";
      for (let r = 0; r < ROUNDS_PER_CAT; r++) {
        const rec = rounds[ci * ROUNDS_PER_CAT + r];
        out += rec ? (rec.won ? "🟢" : "🔴") : "⚪";
      }
      out += "\n";
    });
    return out + `\nPlay → footyless.com`;
  }

  function end() {
    const score = rounds.filter(r => r.won).length;
    const wonAll = score >= 20;
    GL.recordResult("moreless", { won: wonAll, score, max: 25 });
    (wonAll || score >= 15) ? GL.sfx.win() : GL.sfx.fanfare();
    const st = GL.statsFor("moreless");

    const chips = CATS.map((c, ci) => {
      const block = rounds.slice(ci * ROUNDS_PER_CAT, (ci + 1) * ROUNDS_PER_CAT);
      const s = block.filter(r => r.won).length;
      return `<div class="stat-chip" style="min-width:92px"><div class="stat-chip__num ${s >= 4 ? "is-good" : s <= 1 ? "is-bad" : ""}" style="font-size:22px">${s}/${ROUNDS_PER_CAT}</div><div class="stat-chip__label">${c.icon} ${T(c.key)}</div></div>`;
    }).join("");

    const body = document.createElement("div");
    body.innerHTML = `
      <div class="stat-row" style="margin:6px 0 2px">
        <div class="stat-chip"><div class="stat-chip__num ${wonAll ? "is-good" : ""}">${score}</div><div class="stat-chip__label">${T("rounds_won")}</div></div>
        <div class="stat-chip"><div class="stat-chip__num">${st.played}</div><div class="stat-chip__label">${T("played")}</div></div>
      </div>
      <div class="stat-row">${chips}</div>
      <p style="text-align:center;margin-top:6px">${wonAll ? T("quip_perf") : score >= 15 ? T("quip_good") : T("quip_low")}</p>`;
    GL.openModal({
      title: wonAll ? T("perf_title") : T("ft_title"),
      bodyEl: body,
      actions: [
        { label: T("rematch"), variant: "btn-primary", onClick: close => { close(); restart(); } },
        { label: T("share"), variant: "btn-secondary", onClick: () => GL.copyText(shareText(score)) },
      ],
    });
    GL.confetti(wonAll ? 170 : 60);
  }

  function restart() {
    catIdx = 0; roundInCat = 0; rounds.length = 0; usedPairs.clear();
    newBoard(true);
    GL.sfx.drum();
  }

  /* ---------- boot ---------- */
  Shell.mount(".app", "moreless");
  const rb = document.getElementById("btn-restart");
  if (rb) { rb.textContent = T("restart_label"); rb.addEventListener("click", restart); }
  restart();
})();
