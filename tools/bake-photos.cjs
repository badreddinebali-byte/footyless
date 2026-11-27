#!/usr/bin/env node
/**
 * FOOTYLESS · Capless portrait baker
 * For each player: Wikidata Q-id → P18 (image) + P1350 (caps) + P27 (country).
 * Resolves P18 filename → real Commons thumbnail URL (Special:FilePath, 640px).
 * Writes games/capless/photos-data.json for the game to consume.
 *
 *   node tools/bake-photos.cjs
 */
const fs = require("fs");
const path = require("path");

const UA = "FootylessPortraitBaker/0.1 (quiz game; admin@footyless.com)";
const OUT = path.join(__dirname, "..", "data", "capless-photos.json");
const sleep = ms => new Promise(r => setTimeout(r, ms));

const NAMES = [
  "Cristiano Ronaldo", "Lionel Messi", "Luka Modrić", "Sergio Ramos",
  "Robert Lewandowski", "Sunil Chhetri", "Gianluigi Buffon", "Iker Casillas",
  "Claudio Bravo", "Son Heung-min", "Andrés Iniesta", "Neymar",
  "Eden Hazard", "Zlatan Ibrahimović", "Bastian Schweinsteiger", "Wayne Rooney",
  "Andrea Pirlo", "David Beckham", "Xabi Alonso", "Steven Gerrard",
  "Kylian Mbappé", "Ronaldinho", "Mesut Özil", "Harry Kane",
  "Mohamed Salah", "Erling Haaland", "Karim Benzema", "Luis Suárez",
];

async function jget(url, tries = 3) {
  for (let i = 0; i < tries; i++) {
    try {
      const r = await fetch(url, { headers: { "User-Agent": UA } });
      if (r.status === 429 || r.status === 503) { await sleep(3000 * (i + 1)); continue; }
      if (!r.ok) throw new Error("HTTP " + r.status);
      return await r.json();
    } catch (e) {
      if (i === tries - 1) throw e;
      await sleep(2000 * (i + 1));
    }
  }
  throw new Error("unreachable " + url.slice(0, 60));
}

async function thumbFromFile(file, width = 640) {
  /* Special:Redirect/file -> resized thumb; fetch headers only to learn final URL */
  const url = `https://commons.wikimedia.org/wiki/Special:Redirect/file/${encodeURIComponent(file)}?width=${width}`;
  const r = await fetch(url, { method: "GET", headers: { "User-Agent": UA }, redirect: "follow" });
  return r.url; /* final CDN url */
}

(async () => {
  const out = [];
  for (const name of NAMES) {
    try {
      const s = await jget(`https://www.wikidata.org/w/api.php?action=wbsearchentities&search=${encodeURIComponent(name)}&language=en&type=item&limit=1&format=json`);
      const qid = s.search?.[0]?.id;
      if (!qid) { console.warn("? no entity:", name); continue; }
      await sleep(400);

      const d = await jget(`https://www.wikidata.org/w/api.php?action=wbgetentities&ids=${qid}&props=claims|labels&languages=en&format=json`);
      const ent = d.entities?.[qid];
      if (!ent) { console.warn("? no entity data:", name); continue; }

      const label = ent.labels?.en?.value || name;
      const p18File = ent.claims?.P18?.[0]?.mainsnak?.datavalue?.value; // "Foo.jpg"
      const capsRaw = ent.claims?.P1350 || [];
      const capsVals = capsRaw
        .map(c => +(c.mainsnak?.datavalue?.value?.amount || 0))
        .filter(n => n >= 20 && n <= 220);
      const caps = capsVals.sort((a, b) => b - a)[0] || null;

      const p27ids = (ent.claims?.P27 || []).map(c => c.mainsnak?.datavalue?.value?.id).filter(Boolean);
      let country = null;
      if (p27ids.length) {
        await sleep(300);
        const cd = await jget(`https://www.wikidata.org/w/api.php?action=wbgetentities&ids=${p27ids[0]}&props=labels&languages=en&format=json`);
        country = cd.entities?.[p27ids[0]]?.labels?.en?.value || null;
      }

      let img = null;
      if (p18File) {
        img = await thumbFromFile(p18File, 640);
      }

      if (!img) { console.warn("~ skipped (no image):", name); continue; }
      /* caps intentionally nullable — game merges trusted curated values by name */
      out.push({ qid, n: label, c: country, v: caps, img, file: p18File });
      console.log("+", label, "caps=" + (caps ?? "curated"), "img ok");
      await sleep(450);
    } catch (e) {
      console.warn("! failed:", name, e.message);
    }
  }

  fs.writeFileSync(OUT, JSON.stringify({
    _meta: { source: "Wikidata P18/P1350/P27", bakedAt: new Date().toISOString(), count: out.length },
    players: out,
  }, null, 1), "utf8");
  console.log("\nwrote", OUT, "-", out.length, "players with portraits");
})();
