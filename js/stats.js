/* FOOTYLESS stats page — i18n aware */
(function () {
  "use strict";
  const GL = window.GL, Shell = window.Shell, T = window.I18N.t;
  Shell.mount(".app", "stats");

  const esc = s => String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

  const chip = (num, label, cls) => `
    <div class="stat-chip">
      <div class="stat-chip__num ${cls || ""}">${esc(num)}</div>
      <div class="stat-chip__label">${esc(label)}</div>
    </div>`;

  const slugs = Shell.GAMES.map(g => g.slug);
  const total = slugs.reduce((acc, s) => acc.concat(GL.getResults(s)), []);
  const wins = total.filter(r => r.won).length;

  let best = 0, run = 0;
  total.forEach(r => { run = r.won ? run + 1 : 0; best = Math.max(best, run); });

  document.getElementById("global-stats").innerHTML = `
    ${chip(total.length, T("played"))}
    ${chip(total.length ? Math.round((wins / total.length) * 100) + "%" : "—", T("win_rate"))}
    ${chip(best, T("best_streak"), "is-good")}
  `;

  /* per-game breakdown */
  const rows = Shell.GAMES.map(g => {
    const st = GL.statsFor(g.slug);
    const denom = g.slug === "moreless" ? 25 : 12;
    const pct = Math.min((st.avgScore ?? 0) / denom, 1) * 100;
    return `
      <div class="setting-row" style="background:var(--tile);border-radius:12px;padding:14px 16px;margin-bottom:10px;box-shadow:var(--shadow-sm)">
        <div>
          <div class="setting-label">${esc(g.title)}</div>
          <div class="setting-hint">${st.played
            ? `${st.played} ${T("played").toLowerCase()} · ${st.winRate}% ${T("win_rate").toLowerCase()} · ${T("best_streak").toLowerCase()} ${st.bestStreak}`
            : T("no_runs")}</div>
        </div>
        <div style="width:min(140px,36%)">
          <div style="height:8px;border-radius:6px;background:var(--bg-recessed);overflow:hidden">
            <div style="height:100%;width:${pct.toFixed(0)}%;background:var(--answer-correct);transition:width .6s var(--ease-out)"></div>
          </div>
          <div style="font-size:11.5px;color:var(--fg-muted);margin-top:5px;text-align:end">${T("avg")} ${st.avgScore || 0}</div>
        </div>
      </div>`;
  }).join("");

  document.getElementById("per-game").innerHTML = `
    <div class="game-hero__eyebrow" style="margin-bottom:12px">${T("per_game")}</div>
    ${rows}
  `;

  /* ------- score-distribution histogram (More/Less: 25-round circuit) ------- */
  const dist = Array.from({ length: 26 }, () => 0);
  GL.getResults("moreless").forEach(r => dist[Math.max(0, Math.min(25, r.score ?? 0))]++);
  const playedSum = dist.reduce((a, b) => a + b, 0);
  if (playedSum > 0) {
    const peak = Math.max(...dist);
    const bars = dist.map((cnt, i) => `
      <div class="hist__col ${cnt === peak && cnt > 0 ? "is-peak" : ""}">
        <div class="hist__num">${cnt || ""}</div>
        <div class="hist__bar" style="height:${Math.max(3, Math.round((cnt / peak) * 92))}%"></div>
        <div class="hist__lbl">${i}</div>
      </div>`).join("");
    document.getElementById("per-game").insertAdjacentHTML("beforeend", `
      <div class="hist-wrap" style="margin-top:22px">
        <div class="hist-title">${T("hist_title")}</div>
        <div class="hist">${bars}</div>
      </div>`);
  }
})();
