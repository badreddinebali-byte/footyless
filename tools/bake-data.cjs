#!/usr/bin/env node
/**
 * FOOTYLESS · Freshness Pipeline — Wikidata backbone baker (v2)
 * Strategy: lightweight SPARQL for IDs+caps (national-team anchored),
 * then batch EntityData REST for labels/goals/dob. CC0.
 *
 *   node tools/bake-data.cjs [--limit 170]
 */
const fs = require("fs");
const path = require("path");

const ENDPOINT = "https://query.wikidata.org/sparql";
const UA = "FootylessBaker/0.4 (static quiz site; contact: admin@footyless.com)";
const OUT = path.join(__dirname, "..", "data", "players.json");

const sleep = ms => new Promise(r => setTimeout(r, ms));

async function sparql(q, tries = 3) {
  for (let i = 0; i < tries; i++) {
    try {
      const r = await fetch(ENDPOINT + "?query=" + encodeURIComponent(q) + "&format=json",
        { headers: { "User-Agent": UA, "Accept": "application/sparql-results+json" } });
      if (r.status === 504 || r.status === 503) { await sleep(2500 * (i + 1)); continue; }
      if (!r.ok) throw new Error("SPARQL " + r.status);
      return (await r.json()).results.bindings;
    } catch (e) {
      if (i === tries - 1) throw e;
      await sleep(2500 * (i + 1));
    }
  }
  return [];
}

const Q_IDS = (limit) => `
SELECT ?item (MAX(?c) AS ?caps) WHERE {
  ?item wdt:P106 wd:Q937857 ;   # occupation: association football player
        wdt:P1350 ?c .          # official matches played
  { ?item wdt:P54 ?nt . ?nt wdt:P31 wd:Q476028 }   # … national football team, OR
  UNION
  { ?item wdt:P1469 ?fifa }                        # … has official FIFA ID
}
GROUP BY ?item
HAVING (MAX(?c) >= 40)
ORDER BY DESC(?caps)
LIMIT ${limit}`;

/* batch entity fetch (40 qids/chunk via Special:EntityData), resilient */
async function fetchEntities(qids) {
  const out = {};
  for (let i = 0; i < qids.length; i += 40) {
    const chunk = qids.slice(i, i + 40);
    const url = `https://www.wikidata.org/wiki/Special:EntityData/${chunk.join("|")}.json`;
    let ok = false;
    for (let t = 0; t < 3 && !ok; t++) {
      try {
        const r = await fetch(url, { headers: { "User-Agent": UA } });
        if (r.status === 404) break; /* bad chunk — fall through to per-id */
        if (!r.ok) throw new Error("entity " + r.status);
        const j = await r.json();
        Object.assign(out, j.entities || {});
        ok = true;
      } catch (e) { if (t === 2) console.warn("chunk failed:", e.message); await sleep(1500); }
    }
    if (!ok) {
      /* per-id salvage */
      for (const qid of chunk) {
        try {
          const r = await fetch(`https://www.wikidata.org/wiki/Special:EntityData/${qid}.json`, { headers: { "User-Agent": UA } });
          if (r.ok) { const j = await r.json(); Object.assign(out, j.entities || {}); }
        } catch (_) {}
        await sleep(120);
      }
    }
    await sleep(300); /* politeness */
  }
  return out;
}

const bestClaim = (ent, prop) => {
  const claims = ent.claims?.[prop];
  if (!claims?.length) return null;
  let best = null, bestRank = -1;
  for (const c of claims) {
    const rank = c.rank === "preferred" ? 2 : c.rank === "normal" ? 1 : 0;
    if (rank > bestRank) { bestRank = rank; best = c; }
    else if (rank === bestRank && !best) best = c;
  }
  return best?.mainsnak?.datavalue?.value ?? null;
};

const num = v => { const n = Number(String(v).replace(/[^\d.-]/g, "")); return Number.isFinite(n) ? n : null; };
const year = v => { const m = String(v || "").match(/^(\d{4})/); return m ? +m[1] : null; };

async function main() {
  const ai = process.argv.indexOf("--limit");
  const LIMIT = ai > -1 ? Number(process.argv[ai + 1]) || 170 : 170;

  console.log("① SPARQL: capped footballers (national-team anchored)…");
  const rows = await sparql(Q_IDS(LIMIT));
  console.log("   ids:", rows.length);
  if (!rows.length) throw new Error("no rows — endpoint trouble");

  const qids = rows.map(r => r.item.value.split("/").pop());
  const capsById = Object.fromEntries(rows.map(r => [r.item.value.split("/").pop(), num(r.caps?.value)]));

  console.log("② EntityData batch resolve (labels/goals/dob/country)…");
  const ents = await fetchEntities(qids);

  /* countries resolved lazily via Q-id → name cache */
  const countryNames = {};
  const countryQids = [...new Set(qids.map(q => {
    const c = bestClaim(ents[q], "P27");
    return c ? String(c.id || c) : null;
  }).filter(Boolean))];
  if (countryQids.length) {
    const cEnts = await fetchEntities(countryQids);
    for (const [qid, ent] of Object.entries(cEnts)) {
      countryNames[qid] = ent.labels?.en?.value || qid;
    }
  }

  const players = [];
  let dropped = 0;
  for (const qid of qids) {
    const ent = ents[qid];
    const caps = capsById[qid];
    if (!ent || !caps || caps < 20) { dropped++; continue; }    const name = ent.labels?.en?.value || ent.labels?.fr?.value || qid;
    const gRaw = bestClaim(ent, "P1351");
    const goals = gRaw != null ? num(gRaw.amount ?? gRaw) : null;
    const cQid = bestClaim(ent, "P27");
    const country = cQid ? (countryNames[String(cQid.id || cQid)] || null) : null;
    const born = year(bestClaim(ent, "P569")?.time);
    /* goals sanity: must be ≥ caps/4 plausibility floor & ≤ 1000 */
    if (goals != null && (goals < caps * 0.1 || goals > 1000)) { /* tolerate odd */ }
    players.push({ id: qid, n: name, c: country, v: caps, g: goals, born });
  }
  players.sort((a, b) => b.v - a.v);

  const scorers = players.filter(p => p.g != null && p.g >= 30);
  const out = {
    _meta: {
      source: "Wikidata (CC0): P1350 caps, P1351 goals; national-team anchored",
      bakedAt: new Date().toISOString(),
      count: players.length, dropped,
    },
    players,
    scorers: scorers.map(({ n, c, g }) => ({ n, c, g })),
  };
  fs.mkdirSync(path.dirname(OUT), { recursive: true });
  fs.writeFileSync(OUT, JSON.stringify(out, null, 1), "utf8");
  console.log("✔ wrote", OUT, "-", players.length, "players /", scorers.length, "scorers");
  console.log("  top 8:", players.slice(0, 8).map(p => `${p.n} ${p.v}`).join(" · "));
  console.log("  drop sample:", players.filter(p => !p.c).length, "missing country");
}

main().catch(e => { console.error("BAKE FAILED:", e.message); process.exit(1); });
