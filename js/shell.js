/* ============================================================
   FOOTYLESS page shell — header, drawer, footer, settings modal,
   game registry & card art. Globals: window.Shell (uses GL + I18N)
   ============================================================ */
(function () {
  "use strict";
  const GL = window.GL;
  const T = (k, v) => (window.I18N ? window.I18N.t(k, v) : k);

  /* ---------------- icons (original, feather-style) ---------------- */
  const I = {
    menu:  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M4 7h16M4 12h16M4 17h10"/></svg>',
    cal:   '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="5" width="18" height="16" rx="3"/><path d="M8 3v4M16 3v4M3 10h18"/></svg>',
    gear:  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3.2"/><path d="M19.4 15a1.7 1.7 0 0 0 .34 1.87l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.7 1.7 0 0 0-1.87-.34 1.7 1.7 0 0 0-1 1.56V21a2 2 0 1 1-4 0v-.09a1.7 1.7 0 0 0-1.12-1.56 1.7 1.7 0 0 0-1.87.34l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.7 1.7 0 0 0 .34-1.87 1.7 1.7 0 0 0-1.56-1H3a2 2 0 1 1 0-4h.09A1.7 1.7 0 0 0 4.65 8.9a1.7 1.7 0 0 0-.34-1.87l-.06-.06A2 2 0 1 1 7.08 4.14l.06.06a1.7 1.7 0 0 0 1.87.34h.08a1.7 1.7 0 0 0 1-1.56V3a2 2 0 1 1 4 0v.09a1.7 1.7 0 0 0 1 1.56 1.7 1.7 0 0 0 1.87-.34l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.7 1.7 0 0 0-.34 1.87v.08a1.7 1.7 0 0 0 1.56 1H21a2 2 0 1 1 0 4h-.09a1.7 1.7 0 0 0-1.51 1.06Z"/></svg>',
    chart: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M4 20V10M10 20V4M16 20v-7M21 20H3"/></svg>',
    bell:  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9a6 6 0 1 1 12 0c0 5 2 6 2 6H4s2-1 2-6"/><path d="M10 20a2 2 0 0 0 4 0"/></svg>',
    home:  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m3 11 9-8 9 8"/><path d="M5 9.5V21h5v-6h4v6h5V9.5"/></svg>',
    info:  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="9"/><path d="M12 11v5"/><circle cx="12" cy="7.6" r="0.6" fill="currentColor"/></svg>',
    trophy:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M7 4h10v6a5 5 0 0 1-10 0Z"/><path d="M7 5H4v2a4 4 0 0 0 3 3.87M17 5h3v2a4 4 0 0 1-3 3.87"/><path d="M12 15v3M8 21h8"/></svg>',
    arrowL:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M19 12H5m6-7-7 7 7 7"/></svg>',
    arrowR:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14m-6-7 7 7-7 7"/></svg>',
    globe: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c2.7 2.6 4 5.7 4 9s-1.3 6.4-4 9c-2.7-2.6-4-5.7-4-9s1.3-6.4 4-9Z"/></svg>',
    heart: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20.5s-8.2-4.9-8.2-11A4.6 4.6 0 0 1 12 6.3a4.6 4.6 0 0 1 8.2 3.2c0 6.1-8.2 11-8.2 11Z"/></svg>',
    rotate:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="7" y="3" width="10" height="18" rx="2.5"/><path d="M21 8a9 9 0 0 0-3.5-4.6M3 16a9 9 0 0 0 3.5 4.6"/><path d="M21 4v4h-4M3 20v-4h4"/></svg>',
  };

  /* ---------------- flat pictogram card art (instantly readable) ---------------- */
  const FG = "var(--fg)", DIM = "var(--fg-muted)", GOOD = "var(--answer-correct)", BAD = "var(--answer-wrong)", WARM = "var(--answer-warm)";
  const ART = {
    /* More/Less: green UP + red DOWN arrows (their signature) */
    wave: `<svg class="game-card__art" viewBox="0 0 400 200" aria-hidden="true">
      <g stroke-linecap="round" stroke-width="34" fill="none">
        <path d="M295 165V55" stroke="${GOOD}"/>
        <path d="M262 88 295 52l33 36" stroke="${GOOD}"/>
        <path d="M365 40v110" stroke="${BAD}"/>
        <path d="M332 112l33 36 33-36" stroke="${BAD}"/>
      </g>
    </svg>`,
    /* Scoreless: goal net + ball */
    pitch: `<svg class="game-card__art" viewBox="0 0 400 200" aria-hidden="true">
      <g fill="none" stroke="${FG}" stroke-width="9">
        <rect x="250" y="30" width="140" height="120" rx="6"/>
        <path d="M250 70h140M250 110h140M290 30v120M330 30v120M370 30v120M270 70l40 40M310 70l40 40M350 70l30 30M290 30l40 40M330 30l40 40"/>
      </g>
      <circle cx="315" cy="92" r="17" fill="${WARM}"/>
      <path d="M308 86h14M308 98h14M315 82v20" stroke="${FG}" stroke-width="3"/>
    </svg>`,
    /* Kitless: hooped jersey */
    scarf: `<svg class="game-card__art" viewBox="0 0 400 200" aria-hidden="true">
      <path d="M268 42l30-14c8 10 36 10 44 0l30 14 26 30-28 22-6-8V186h-88V86l-6 8-26-30Z" fill="${FG}"/>
      <g stroke="var(--tile)" stroke-width="8">
        <path d="M290 84v90M310 74v102M350 74v102M370 84v90"/>
      </g>
    </svg>`,
    /* Missing XI: pitch with dots */
    eleven: `<svg class="game-card__art" viewBox="0 0 400 200" aria-hidden="true">
      <rect x="245" y="14" width="150" height="176" rx="10" fill="none" stroke="${GOOD}" stroke-width="8"/>
      <path d="M245 102h150" stroke="${GOOD}" stroke-width="6" opacity=".7"/>
      <rect x="292" y="14" width="56" height="34" fill="none" stroke="${GOOD}" stroke-width="5" opacity=".7"/>
      <g fill="${FG}">
        <circle cx="320" cy="160" r="11"/>
        <circle cx="268" cy="122" r="11"/><circle cx="302" cy="128" r="11"/><circle cx="338" cy="128" r="11"/><circle cx="372" cy="122" r="11"/>
        <circle cx="262" cy="84" r="11"/><circle cx="320" cy="90" r="11"/><circle cx="378" cy="84" r="11"/>
        <circle cx="290" cy="48" r="11"/><circle cx="350" cy="48" r="11"/>
      </g>
      <circle cx="320" cy="26" r="7" fill="${WARM}"/>
    </svg>`,
    /* Groundless: stadium bowl */
    dart: `<svg class="game-card__art" viewBox="0 0 400 200" aria-hidden="true">
      <ellipse cx="320" cy="112" rx="72" ry="58" fill="none" stroke="${FG}" stroke-width="9"/>
      <ellipse cx="320" cy="104" rx="44" ry="34" fill="none" stroke="${DIM}" stroke-width="6"/>
      <g stroke="${FG}" stroke-width="5" opacity=".8">
        <path d="M262 84l116 0M254 104h132M262 124l116 0M276 66v92M304 56v110M336 56v110M364 66v92"/>
      </g>
      <circle cx="320" cy="104" r="9" fill="${GOOD}"/>
    </svg>`,
    /* Statless: rising bars + trend */
    stair: `<svg class="game-card__art" viewBox="0 0 400 200" aria-hidden="true">
      <g fill="${GOOD}">
        <rect x="260" y="120" width="26" height="52" rx="4"/>
        <rect x="296" y="96" width="26" height="76" rx="4"/>
        <rect x="332" y="66" width="26" height="106" rx="4"/>
      </g>
      <path d="M258 108 348 52" stroke="${WARM}" stroke-width="8" stroke-linecap="round"/>
      <path d="M348 52l-16 2m16-2-2 16" stroke="${WARM}" stroke-width="8" stroke-linecap="round"/>
      <circle cx="290" cy="86" r="6" fill="${FG}"/><circle cx="326" cy="62" r="6" fill="${FG}"/>
    </svg>`,
    /* Legendless: star career path */
    shuttle: `<svg class="game-card__art" viewBox="0 0 400 200" aria-hidden="true">
      <path d="M258 150c30-8 34-52 66-56 28-4 34-38 66-40" fill="none" stroke="${DIM}" stroke-width="7" stroke-dasharray="2 14" stroke-linecap="round"/>
      <path d="M258 150c30-8 34-52 66-56 28-4 34-38 66-40" fill="none" stroke="${FG}" stroke-width="7" stroke-linecap="round" opacity=".4"/>
      <g fill="${WARM}">
        <path d="M266 132l7 14 15 2-11 11 3 15-14-7-14 7 3-15-11-11 15-2Z"/>
        <path d="M392 42l5 10 11 2-8 8 2 11-10-5-10 5 2-11-8-8 11-2Z"/>
      </g>
      <circle cx="324" cy="94" r="9" fill="${FG}"/>
    </svg>`,
  };

  /* ---------------- game registry ---------------- */
  const GAMES = [
    { slug: "moreless",   title: "More/Less",  tagKey: "tl_moreless",   art: "wave",    playable: true },
    { slug: "scoreless",  title: "Scoreless",  tagKey: "tl_scoreless",  art: "pitch" },
    { slug: "kitless",    title: "Kitless",    tagKey: "tl_kitless",    art: "scarf" },
    { slug: "missingxi",  title: "Missing XI", tagKey: "tl_missingxi",  art: "eleven" },
    { slug: "groundless", title: "Groundless", tagKey: "tl_groundless", art: "dart" },
    { slug: "statless",   title: "Statless",   tagKey: "tl_statless",   art: "stair" },
    { slug: "legendless", title: "Legendless", tagKey: "tl_legendless", art: "shuttle" },
  ];
  const gameBy = slug => GAMES.find(g => g.slug === slug);

  /* ---------------- DOM builders ---------------- */
  function el(html) {
    const t = document.createElement("template");
    t.innerHTML = html.trim();
    return t.content.firstElementChild;
  }

  /* pages live either at root or in games/<slug>/ — derive "../.." from body marker */
  const ROOT = document.body.dataset.page === "game" ? "../../" : "";

  function buildHeader() {
    return el(`
      <header class="site-header">
        <div class="container header-row">
          <div class="header-cluster">
            <button class="icon-btn" id="btn-menu" aria-label="${T("home")} menu">${I.menu}</button>
          </div>
          <a class="wordmark" href="${ROOT}index.html" aria-label="Footyless home">FOOTYLESS<span class="ball-dot"></span></a>
          <div class="header-cluster">
            <button class="icon-btn" id="btn-prefs" aria-label="${T("prefs_title")}">${I.gear}</button>
            <button class="icon-btn" id="btn-supporter" aria-label="${T("sup_badge")}">${I.heart}</button>
            <button class="icon-btn" id="btn-archive" aria-label="${T("archive_title")}">${I.cal}</button>
            <button class="icon-btn" id="btn-stats" aria-label="${T("stats_nav")}">${I.chart}</button>
            <button class="btn-signin" id="btn-signin">Sign in</button>
          </div>
        </div>
      </header>`);
  }

  function buildDrawer(activeNav) {
    /* helper: simple icon link */
    const item = (href, icon, label, slug) =>
      `<a class="drawer-link${activeNav === slug ? " is-active" : ""}" href="${href}" data-nav>${icon}<span>${label}</span></a>`;

    /* game shortcuts with expandable sub-items (Play / How-to) */
    const gameLinks = Shell.GAMES.slice(0, 4).map((g, i) => `
      <div class="drawer-game" data-game="${g.slug}">
        <button class="drawer-game__head${activeNav === g.slug ? " is-active" : ""}" data-expand="${g.slug}" aria-expanded="false">
          <span>${g.title.toUpperCase()}</span>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" class="drawer-chev"><path d="m6 9 6 6 6-6"/></svg>
        </button>
        <div class="drawer-game__sub" data-sub="${g.slug}">
          <a class="drawer-sublink" href="${ROOT}games/${g.slug}/index.html"><span>●</span> Play</a>
          <a class="drawer-sublink" href="${ROOT}games/${g.slug}/index.html#howto"><span>○</span> How to play</a>
        </div>
      </div>`).join("");

    /* activity calendar: current month, from local results */
    const now = new Date();
    const monthName = now.toLocaleDateString(undefined, { month: "long" }).toUpperCase();
    const y = now.getFullYear(), m = now.getMonth();
    const firstDay = new Date(y, m, 1).getDay();
    const daysInMonth = new Date(y, m + 1, 0).getDate();
    /* played-days set across all games */
    const played = new Set();
    Shell.GAMES.forEach(g => GL.getResults(g.slug).forEach(r => r.date && played.add(r.date)));
    const iso = d => `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    const todayD = now.getDate();
    const streak = (() => {
      /* current streak: consecutive played days ending today/yesterday */
      let n = 0; const probe = new Date();
      if (!played.has(iso(todayD))) probe.setDate(probe.getDate() - 1);
      while (played.has(isoD(probe))) { n++; probe.setDate(probe.getDate() - 1); }
      return n;
      function isoD(d) { return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`; }
    })();

    let cal = "";
    for (let i = 0; i < firstDay; i++) cal += `<span class="cal-day is-empty"></span>`;
    for (let d = 1; d <= daysInMonth; d++) {
      const isPlayed = played.has(iso(d));
      const isToday = d === todayD;
      cal += `<span class="cal-day${isPlayed ? " is-played" : ""}${isToday ? " is-today" : ""}">${d}</span>`;
    }

    return `
      <div class="drawer-layer" id="drawer-layer" aria-hidden="true">
        <div class="drawer-backdrop" data-drawer-close></div>
        <nav class="drawer" aria-label="Main menu">
          <div class="drawer-head">
            <span class="wordmark" style="font-size:24px">FOOTYLESS<span class="ball-dot"></span></span>
            <button class="icon-btn" data-drawer-close aria-label="Close menu">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M18 6 6 18M6 6l12 12"/></svg>
            </button>
          </div>

          <div class="drawer-games">
            ${gameLinks}
          </div>

          <div class="drawer-activity">
            <div class="da-head">
              <span>${monthName} ACTIVITY</span>
              <span class="da-count">⟳ <b data-drawer-countdown>--:--:--</b></span>
            </div>
            <div class="da-cal">${cal}</div>
            <div class="da-streak">${streak > 0
              ? T("drawer_streak_on", { n: streak })
              : T("drawer_streak_off")}</div>
          </div>

          <div class="drawer-nav" style="margin-top:6px">
            ${item("#", I.trophy, T("achievements"), "achv")}
            ${item(ROOT + "stats.html", I.chart, T("stats_nav"), "stats")}
          </div>

          <a class="drawer-feedback" href="mailto:hello@footyless.com?subject=Footyless%20feedback">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2Z"/></svg>
            ${T("feedback")}
          </a>

          <div class="drawer-foot">
            <div class="drawer-foot__links">
              <a href="#" data-soon>${T("about")}</a>
              <a href="#" data-soon>${T("changelog")}</a>
              <a href="#" data-soon>${T("terms")}</a>
              <a href="#" data-soon>${T("privacy")}</a>
            </div>
            <span>v${GL.version} · ${T("drawer_foot")}</span>
          </div>
        </nav>
      </div>`;
  }

  function mount(rootSel, activeNav) {
    const root = document.querySelector(rootSel || ".app");
    root.prepend(buildHeader());
    document.body.insertAdjacentHTML("beforeend", buildDrawer(activeNav));

    const $ = s => document.querySelector(s);
    $("#btn-menu").addEventListener("click", () => openDrawer(true));
    $("#btn-prefs").addEventListener("click", () => { GL.sfx.tap(); openSettings(); });
    $("#btn-supporter").addEventListener("click", () => { GL.sfx.tap(); openSupporter(); });
    $("#btn-stats").addEventListener("click", () => { GL.sfx.tap(); location.href = ROOT + "stats.html"; });

    /* drawer: expandable games + countdown + soon-links */
    const dl = document.getElementById("drawer-layer");
    dl.addEventListener("click", e => {
      if (e.target.closest("[data-drawer-close]")) { openDrawer(false); return; }
      const exp = e.target.closest("[data-expand]");
      if (exp) {
        const slug = exp.dataset.expand;
        const sub = dl.querySelector(`[data-sub="${slug}"]`);
        const isOpen = sub.classList.toggle("is-open");
        exp.setAttribute("aria-expanded", String(isOpen));
        GL.sfx.tap();
        return;
      }
      if (e.target.closest("[data-nav]")) GL.sfx.swish();
      const dead = e.target.closest('.drawer-link[href="#"], .drawer-foot a[href="#"]');
      if (dead) { e.preventDefault(); openDrawer(false); GL.toast(T("nav_coming")); }
    });
    /* countdown inside drawer */
    const cd = dl.querySelector("[data-drawer-countdown]");
    if (cd) countdownInto(ms => { cd.textContent = GL.fmtHMS(ms); });

    mountRotateBlocker();
    $("#btn-archive").addEventListener("click", () => {
      GL.sfx.tap();
      GL.openModal({
        title: T("archive_title"),
        bodyHTML: `<p>${T("archive_body")}</p>`,
        actions: [{ label: T("done"), variant: "btn-primary" }],
      });
    });
    $("#btn-signin").addEventListener("click", () => {
      GL.sfx.tap();
      GL.toast(T("accounts_toast"));
    });

    document.getElementById("drawer-layer").dataset.wired = "1";

    mountRotateBlocker();

    /* language toggle lives in settings; expose it on Shift+L too (power users) */
    document.addEventListener("keydown", e => {
      if (e.shiftKey && (e.key === "L" || e.key === "l")) { e.preventDefault(); openSettings(); }
    });
  }

  function openDrawer(open) {
    const layer = document.getElementById("drawer-layer");
    layer.classList.toggle("is-open", open);
    layer.setAttribute("aria-hidden", String(!open));
    open ? GL.sfx.openUI() : GL.sfx.closeUI();
  }

  /* ---------------- supporter pass modal ---------------- */
  const STRIPE = {
    month: "#",   // ← paste Stripe Payment Link for €1.99/mo here
    year:  "#",   // ← paste Stripe Payment Link for €9.99/yr here
  };
  function openSupporter() {
    const body = document.createElement("div");
    const active = GL.isSupporter();

    body.innerHTML = active ? `
      <div style="text-align:center;padding:10px 4px 4px">
        <div style="font-size:44px;line-height:1">🏅</div>
        <p style="font-weight:600;font-size:17px;margin-top:10px">${T("sup_active")}</p>
        <button class="btn btn-danger-ghost" data-sup-remove style="margin-top:14px">${T("remove_pass")}</button>
      </div>`
    : `
      <p style="color:var(--fg-muted)">${T("sup_pitch")}</p>
      <div class="choice-bar" style="margin-top:16px">
        <button class="choice-btn" data-plan="month">${T("sup_month")}</button>
        <button class="choice-btn" data-plan="year" style="background:var(--answer-correct);color:#0b1a04">${T("sup_year")}</button>
      </div>
      <div class="setting-row" style="margin-top:14px">
        <div><div class="setting-label">${T("sup_code_label")}</div></div>
        <div style="display:flex;gap:8px">
          <input id="sup-code" type="text" spellcheck="false" autocomplete="off"
            style="height:36px;width:130px;background:var(--bg-recessed);border:0;border-radius:9px;color:var(--fg);padding:0 10px;font-size:14px">
          <button class="btn btn-secondary" data-sup-redeem style="height:36px;padding:0 14px;font-size:13px">${T("sup_redeem")}</button>
        </div>
      </div>`;

    GL.openModal({
      title: T("sup_badge"),
      bodyEl: body,
      actions: [{ label: T("done"), variant: "btn-primary" }],
    });

    body.addEventListener("click", e => {
      const plan = e.target.closest("[data-plan]");
      if (plan) {
        const link = STRIPE[plan.dataset.plan] || "#";
        if (link === "#") { GL.toast(T("sup_checkout_ticker")); }
        else { window.open(link, "_blank"); }
        return;
      }
      if (e.target.closest("[data-sup-redeem]")) {
        const inp = body.querySelector("#sup-code");
        if (GL.redeemSupporter(inp.value)) {
          GL.sfx.win(); GL.confetti(90);
          GL.closeModal(); openSupporter(); // re-render in active state
          GL.toast(T("sup_thanks"));
        } else {
          GL.sfx.wrong(); GL.toast(T("sup_invalid"), { error: true });
        }
        return;
      }
      if (e.target.closest("[data-sup-remove]")) {
        GL.revokeSupporter();
        GL.toast(T("sup_removed"));
        GL.closeModal();
      }
    });
  }

  /* ---------------- rotate blocker (desktop-first stance) ----------------
     Game pages declare <body data-wide="true">. Phones in portrait get
     the friendly flip interstitial; everything wider just plays.       */
  function mountRotateBlocker() {
    if (document.body.dataset.wide !== "true") return;
    const layer = document.createElement("div");
    layer.className = "rotate-layer";
    layer.id = "rotate-layer";
    layer.innerHTML = `
      <div class="rotate-inner">
        <div class="rotate-ballwrap"><span class="rotate-ball"></span></div>
        <div class="rotate-title">${T("rotate_title")}</div>
        <p class="rotate-body">${T("rotate_body")}</p>
        <div class="rotate-icon">${I.rotate}</div>
      </div>`;
    document.body.appendChild(layer);
    const update = () => {
      const portraitPhone = window.innerWidth < 640 && window.innerHeight > window.innerWidth * 1.15;
      layer.classList.toggle("is-on", portraitPhone);
    };
    update();
    window.addEventListener("resize", update);
    window.addEventListener("orientationchange", update);
  }

  /* ---------------- settings modal (with LANGUAGE row) ---------------- */
  function openSettings() {
    const s = GL.settings();
    const loc = window.I18N ? window.I18N.locale : "en";
    const langButtons = window.I18N
      ? window.I18N.locales.map(l => `<button data-v="${l.id}">${l.label}</button>`).join("")
      : "";

    const body = document.createElement("div");
    body.innerHTML = `
      <div class="setting-row" data-row="theme">
        <div><div class="setting-label">${T("theme")}</div><div class="setting-hint">${T("theme_hint")}</div></div>
        <div class="seg" role="group" aria-label="${T("theme")}">
          <button data-v="dark">🌙</button><button data-v="light">☀️</button>
        </div>
      </div>
      <div class="setting-row" data-row="sfx">
        <div><div class="setting-label">${T("sfx")}</div><div class="setting-hint">${T("sfx_hint")}</div></div>
        <button class="toggle" role="switch" aria-checked="${s.sfx}" aria-label="${T("sfx")}"></button>
      </div>
      <div class="setting-row" data-row="music">
        <div><div class="setting-label">${T("music")}</div><div class="setting-hint">${T("music_hint")}</div></div>
        <button class="toggle" role="switch" aria-checked="${s.music}" aria-label="${T("music")}"></button>
      </div>
      <div class="setting-row" data-row="language">
        <div><div class="setting-label">${T("language")}</div><div class="setting-hint">${T("language_hint")}</div></div>
        <div class="seg" role="group" aria-label="${T("language")}">${langButtons}</div>
      </div>
      <div class="setting-row" data-row="colorblind">
        <div><div class="setting-label">${T("colorblind")}</div><div class="setting-hint">${T("colorblind_hint")}</div></div>
        <button class="toggle" role="switch" aria-checked="${s.colorblind}" aria-label="${T("colorblind")}"></button>
      </div>
      <div class="setting-row" data-row="reducedMotion">
        <div><div class="setting-label">${T("reduced")}</div><div class="setting-hint">${T("reduced_hint")}</div></div>
        <div class="seg" role="group" aria-label="${T("reduced")}">
          <button data-v="system">Auto</button><button data-v="on">On</button><button data-v="off">Off</button>
        </div>
      </div>
      <div class="setting-row" data-row="reset">
        <div><div class="setting-label">${T("reset_progress")}</div><div class="setting-hint">${T("reset_hint")}</div></div>
        <button class="btn btn-danger-ghost" data-reset style="height:34px;padding:0 12px;font-size:13px">${T("reset_btn")}</button>
      </div>`;

    const syncSeg = (row, val) => {
      row.querySelectorAll(".seg button").forEach(b => {
        b.classList.toggle("is-on", b.dataset.v === String(val));
        if (row.dataset.row === "language") b.classList.toggle("is-on", b.dataset.v === String(loc));
      });
    };
    body.querySelectorAll(".setting-row").forEach(row => {
      const key = row.dataset.row;
      if (["theme", "reducedMotion", "language"].includes(key)) syncSeg(row, GL.settings()[key] ?? loc);
    });

    body.addEventListener("click", e => {
      const segBtn = e.target.closest(".seg button");
      if (segBtn) {
        const row = segBtn.closest(".setting-row");
        const key = row.dataset.row;
        if (key === "language") {
          GL.sfx.tick();
          if (segBtn.dataset.v !== window.I18N.locale) {
            window.I18N.setLocale(segBtn.dataset.v, /*reload*/ true);
          }
          return;
        }
        GL.setSetting(key, segBtn.dataset.v);
        syncSeg(row, segBtn.dataset.v);
        GL.sfx.tick();
        return;
      }
      const tg = e.target.closest(".toggle");
      if (tg) {
        const key = tg.closest(".setting-row").dataset.row;
        const next = !(tg.getAttribute("aria-checked") === "true");
        GL.setSetting(key, next);
        tg.setAttribute("aria-checked", String(next));
        key === "music" ? (next ? GL.startMusic() : GL.stopMusic()) : GL.sfx.tick();
        return;
      }
      const rst = e.target.closest("[data-reset]");
      if (rst) {
        GL.openModal({
          title: T("reset_confirm_title"),
          bodyHTML: `<p>${T("reset_confirm_body")}</p>`,
          actions: [
            { label: T("cancel") },
            { label: T("reset_btn"), variant: "btn-primary", onClick: close => { GL.wipeProgress(); GL.toast(T("reset_done"), { error: true }); close(); } },
          ],
        });
      }
    });

    GL.openModal({
      title: T("prefs_title"),
      bodyEl: body,
      actions: [{ label: T("done"), variant: "btn-primary" }],
    });
  }

  /* ---------------- public helpers ---------------- */
  function countdownInto(nodeFmt) {
    const tick = () => nodeFmt(GL.msUntilNextUtcMidnight());
    tick();
    return setInterval(tick, 1000);
  }

  function renderComingSoon(mountSel, cfg) {
    const g = gameBy(cfg.slug) || cfg;
    const wrap = document.querySelector(mountSel);
    const wip = T("wip_" + g.slug) !== "wip_" + g.slug ? T("wip_" + g.slug) : T("wip_generic");
    wrap.innerHTML = `
      <section class="game-hero anim-rise">
        <div class="game-hero__eyebrow">${T("hero_teaser")}</div>
        <h1>${g.title}</h1>
        <p>${T(g.tagKey)}</p>
      </section>
      <section class="wip-panel anim-rise" style="animation-delay:.08s">
        ${ART[g.art] || ""}
        <div class="wip-title">${T("coming_soon_toast").split("✍")[0]}</div>
        <p class="wip-text">${wip}</p>
        <button class="btn btn-primary" data-notify>${I.bell} ${T("notify_cta")}</button>
      </section>`;
    wrap.querySelector("[data-notify]").addEventListener("click", () => {
      GL.sfx.correct();
      GL.toast(T("ping_listed", { game: g.title }));
    });
  }

  function cardArt(name) { return ART[name] || ""; }

  window.Shell = {
    mount, openSettings, GAMES, gameBy, ART, cardArt, countdownInto, icons: I, renderComingSoon,
  };
})();
