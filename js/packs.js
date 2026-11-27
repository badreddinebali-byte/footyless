/* ============================================================
   FOOTYLESS · data packs loader — global: Packs
   Fetches /data/*.json once, caches, exposes game-shaped getters.
   Falls back gracefully to embedded sample data when packs absent
   (so file:// previews and offline dev still work).
   ============================================================ */
(function (P) {
  "use strict";

  const cache = {};
  const ROOT = document.body.dataset.page === "game" ? "../../" : "";

  P.load = function (name) {
    return cache[name]
      ? Promise.resolve(cache[name])
      : fetch(`${ROOT}data/${name}.json`)
          .then(r => (r.ok ? r.json() : Promise.reject(r.status)))
          .then(j => (cache[name] = j));
  };

  /* ---- game adapters ---- */

  /* Capless photo pack (P18 portraits, baked from Wikidata) */
  P.photoPool = function (pack) {
    if (!pack || !Array.isArray(pack.players)) return null;
    const ok = pack.players.filter(p => p.img && p.v >= 20 && p.v <= 220);
    return ok.length >= 10 ? ok : null;
  };

  /* Capless pool — QUALITY-GATED: Wikidata P1350 often mixes club appearances,
     so a pack entry only qualifies if it *looks* like genuine caps. */
  P.caplessPool = function (pack, minCaps = 30) {
    if (!pack || !pack.players) return null;
    const pass = pack.players.filter(p =>
      p.v >= minCaps && p.v <= 220 &&          // caps plausibility band
      p.born == null || (p.born && p.born > 1940) &&
      !!p.c                                    // country present
    );
    return pass.length >= 20
      ? pass.map(p => ({ n: p.n, c: p.c || "", v: p.v }))
      : null;                                   // pack too weak → caller keeps curated data
  };

  /* Scoreless career duels — gated to believable senior goal tallies */
  P.scorerPool = function (pack) {
    if (!pack || !pack.scorers) return null;
    const pass = pack.scorers.filter(s => s.g >= 50 && s.g <= 800);
    return pass.length >= 12
      ? pass.map(s => ({ n: s.n, c: s.c || "", v: s.g }))
      : null;
  };

  P.meta = function (pack) { return pack?._meta || null; };
})(window.Packs = {});
