/* FOOTYLESS home — i18n game grid + countdown */
(function () {
  "use strict";
  const GL = window.GL, Shell = window.Shell, T = window.I18N.t;

  Shell.mount(".app", "home");

  /* ---- build cards ---- */
  const grid = document.getElementById("game-grid");
  grid.innerHTML = Shell.GAMES.map(g => `
    <div class="game-cell anim-rise">
      <a class="game-card" href="games/${g.slug}/index.html" data-slug="${g.slug}" aria-label="${g.title}">
        <span class="game-card__badge">TODAY ✓</span>
        ${Shell.cardArt(g.art)}
        <div class="game-card__body">
          <span class="game-card__title">${g.title}</span>
          <span class="game-card__sub">${T(g.tagKey)}</span>
        </div>
      </a>
    </div>`).join("");

  /* press feedback + completed badges */
  grid.querySelectorAll(".game-card").forEach(card => {
    card.addEventListener("pointerenter", () => GL.sfx.tick());
    if (GL.playedToday(card.dataset.slug)) card.classList.add("is-done");
  });

  /* ---- countdown to next daily set ---- */
  const label = document.querySelector(".daily-strip span:last-child");
  Shell.countdownInto(ms => {
    document.getElementById("daily-countdown").textContent = GL.fmtHMS(ms);
  });
  if (label) label.firstChild.textContent = T("countdown_in") + " ";

  /* footer soon-links */
  document.querySelectorAll("[data-soon]").forEach(a =>
    a.addEventListener("click", e => {
      e.preventDefault();
      GL.toast(T("coming_soon_toast"));
    })
  );
})();
