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

  /* ---------------- original decorative card art ---------------- */
  const ART = {
    pitch: `<svg class="game-card__art" viewBox="0 0 400 200" aria-hidden="true">
      <rect x="230" y="-30" width="230" height="260" rx="14" fill="var(--answer-correct)"/>
      <rect x="262" y="0" width="196" height="196" rx="10" fill="none" stroke="var(--bg)" stroke-width="6" opacity=".85"/>
      <path d="M262 78h58a40 40 0 0 1 0 40h-58" fill="none" stroke="var(--bg)" stroke-width="6" opacity=".85"/>
      <circle cx="360" cy="98" r="30" fill="none" stroke="var(--bg)" stroke-width="6" opacity=".85"/>
      <circle cx="330" cy="30" r="34" fill="var(--bg)"/>
      <path d="M330 12l17 12-6.5 20h-21L313 24Z" fill="var(--answer-correct)"/>
    </svg>`,
    wave: `<svg class="game-card__art" viewBox="0 0 400 200" aria-hidden="true">
      <g fill="var(--answer-warm)">
        <rect x="238" y="70" width="18" height="86" rx="9"/>
        <rect x="266" y="38" width="18" height="118" rx="9"/>
        <rect x="294" y="82" width="18" height="74" rx="9"/>
        <rect x="322" y="14" width="18" height="142" rx="9"/>
        <rect x="350" y="56" width="18" height="100" rx="9"/>
      </g>
      <circle cx="376" cy="52" r="26" fill="var(--answer-warm)"/>
      <path d="M368 44v18l15-9Z" fill="var(--tile)"/>
    </svg>`,
    shuttle: `<svg class="game-card__art" viewBox="0 0 400 200" aria-hidden="true">
      <rect x="235" y="20" width="150" height="120" rx="16" fill="var(--bg)"/>
      <rect x="255" y="38" width="110" height="26" rx="13" fill="var(--answer-correct)"/>
      <rect x="255" y="74" width="82" height="26" rx="13" fill="var(--answer-correct)"/>
      <rect x="255" y="110" width="52" height="26" rx="13" fill="var(--answer-wrong)"/>
      <path d="M282 158l18 26-7-26Zm26 0l18 26-7-26Z" fill="var(--bg)"/>
    </svg>`,
    dart: `<svg class="game-card__art" viewBox="0 0 400 200" aria-hidden="true">
      <g fill="none" stroke="var(--answer-warm)" stroke-width="7">
        <circle cx="325" cy="95" r="76"/><circle cx="325" cy="95" r="50"/><circle cx="325" cy="95" r="24"/>
      </g>
      <path d="M244 176 320 100" stroke="var(--bg)" stroke-width="10" stroke-linecap="round"/>
      <path d="M320 100l28-28" stroke="var(--answer-correct)" stroke-width="10" stroke-linecap="round"/>
    </svg>`,
    stair: `<svg class="game-card__art" viewBox="0 0 400 200" aria-hidden="true">
      <g fill="var(--answer-correct)">
        <rect x="238" y="138" width="34" height="40" rx="4"/>
        <rect x="280" y="110" width="34" height="68" rx="4"/>
        <rect x="322" y="76" width="34" height="102" rx="4"/>
        <path d="M370 34h8v144h-8z" opacity=".45"/>
      </g>
      <path d="M244 128 306 84l20 12 30-46" fill="none" stroke="var(--bg)" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M344 40h14v14" fill="none" stroke="var(--bg)" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>`,
    scarf: `<svg class="game-card__art" viewBox="0 0 400 200" aria-hidden="true">
      <rect x="240" y="16" width="52" height="150" rx="10" fill="var(--answer-wrong)"/>
      <rect x="246" y="40" width="40" height="14" fill="var(--bg)" opacity=".85"/>
      <rect x="246" y="70" width="40" height="14" fill="var(--bg)" opacity=".85"/>
      <rect x="246" y="100" width="40" height="14" fill="var(--bg)" opacity=".85"/>
      <path d="M300 30c26 0 44 10 52 24-20-4-34 0-44 10 16 4 26 12 30 24-18-6-34-4-46 6l-10-8Z" fill="var(--answer-correct)"/>
    </svg>`,
    eleven: `<svg class="game-card__art" viewBox="0 0 400 200" aria-hidden="true">
      <path d="M40 190V96a30 30 0 0 1 12-24l70-52 70 52a30 30 0 0 1 12 24v94Z" fill="none" stroke="var(--answer-correct)" stroke-width="7" opacity=".5" transform="translate(150 0)"/>
      <g fill="var(--answer-correct)">
        <circle cx="365" cy="40" r="17"/><rect x="354" y="60" width="22" height="26" rx="7"/>
        <circle cx="322" cy="76" r="17"/><rect x="311" y="96" width="22" height="26" rx="7"/>
        <circle cx="308" cy="128" r="17"/><rect x="297" y="148" width="22" height="26" rx="7"/>
        <circle cx="352" cy="150" r="17"/><rect x="341" y="170" width="22" height="26" rx="7"/>
      </g>
      <g fill="var(--bg)" opacity=".55">
        <circle cx="365" cy="40" r="17"/><circle cx="322" cy="76" r="17"/><circle cx="308" cy="128" r="17"/><circle cx="352" cy="150" r="17"/>
      </g>
      <path d="M348 40h34M338 79l-23 23M338 141l-16 14" stroke="var(--answer-correct)" stroke-width="4" stroke-dasharray="5 5"/>
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
    const item = (href, icon, label, slug) =>
      `<a class="drawer-link${activeNav === slug ? " is-active" : ""}" href="${ROOT}${href}" data-nav>${icon}<span>${label}</span></a>`;
    return `
      <div class="drawer-layer" id="drawer-layer" aria-hidden="true">
        <div class="drawer-backdrop" data-drawer-close></div>
        <nav class="drawer" aria-label="Main menu">
          <div class="drawer-head">
            <span class="wordmark" style="font-size:20px">FOOTYLESS<span class="ball-dot"></span></span>
            <button class="icon-btn" data-drawer-close aria-label="Close menu">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M18 6 6 18M6 6l12 12"/></svg>
            </button>
          </div>
          <div class="drawer-nav">
            ${item("index.html", I.home, T("home"), "home")}
            ${item("stats.html", I.chart, T("stats_nav"), "stats")}
            ${item("#", I.trophy, T("achievements"), "achv")}
            ${item("#", I.info, T("about"), "about")}
          </div>
          <div class="drawer-foot">
            <span>v${GL.version} · concept build</span>
            <span>${T("drawer_foot")}</span>
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

    document.getElementById("drawer-layer").addEventListener("click", e => {
      if (e.target.closest("[data-drawer-close]")) openDrawer(false);
      if (e.target.closest("[data-nav]")) GL.sfx.swoosh();
      const dead = e.target.closest('.drawer-link[href="#"]');
      if (dead) {
        e.preventDefault(); openDrawer(false);
        GL.toast(T("nav_coming"));
      }
    });

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
    GL.sfx.swoosh();
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
