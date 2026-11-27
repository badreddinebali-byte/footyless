#!/usr/bin/env node
/* Match-photo baker: iconic-match photographs from Wikimedia Commons.
   Maps fixture ids in games/scoreless/data.js MATCH_DUELS / SCORE_BETS meta
   to real match photos. Uses Commons search + Special:Redirect 640px thumbs. */
const fs = require("fs");
const path = require("path");
const UA = "FootylessMatchBaker/0.1 (admin@footyless.com)";
const OUT = path.join(__dirname, "..", "data", "match-photos.json");

/* queries crafted per MATCH_DUELS fixture (10) + SCORE_BETS (10) meta strings */
const MAP = {
  "Bayern 8–2 Barcelona": ["FC Bayern Munich vs FC Barcelona 2020", "FC Barcelona 2020"],
  "Italy 4–3 Brazil": ["Italy Brazil 1982 World Cup", "Paolo Rossi 1982"],
  "Reading 7–5 Arsenal": ["Reading Arsenal 2012", "Arsenal Reading"],
  "Man Utd 8–2 Arsenal": ["Manchester United Arsenal 2011", "Old Trafford 2011"],
  "Germany 7–1 Brazil": ["Germany Brazil 2014 Mineirazo", "Germany 2014 World Cup"],
  "Liverpool 4–3 Milan": ["Liverpool Milan 2005 Istanbul", "2005 UEFA Champions League Final"],
  "Tottenham 9–1 Wigan": ["Tottenham Wigan 2009", "White Hart Lane"],
  "Barcelona 5–1 Real Madrid": ["Barcelona Real Madrid 2011", "El Clásico 2011"],
  "Portugal 6–1 Switzerland": ["Portugal Switzerland 2022", "Portugal 2022 World Cup"],
  "Man City 6–1 Man Utd": ["Manchester derby 2011", "Etihad Stadium"],
  "Chelsea 6–0 Stoke": ["Chelsea Stoke 2010", "Stamford Bridge"],
  "Real Madrid 6–0 Espanyol": ["Real Madrid Espanyol", "Bernabéu"],
  "Australia 31–0 Samoa": ["American Samoa Australia 2001", "Australia 2001"],
  "Germany 16–0 San Marino": ["Germany San Marino 2006", "Germany 2006"],
  /* score bets — famous finals */
  "CL Final · Berlin 2015": ["2015 UEFA Champions League Final", "Berlin Olympiastadion 2015"],
  "CL Final · Porto 2021": ["2021 UEFA Champions League Final", "Porto 2021 final"],
  "CL Final · Paris 2022": ["2022 UEFA Champions League Final", "Paris 2022 final"],
  "The 49ers' season peak · Sheffield 2003": ["Arsenal Sheffield 2003", "Arsenal 2003"],
  "La Décima · Lisbon 2014": ["2014 UEFA Champions League Final", "Lisbon 2014 final"],
  "CL Final · Wembley 2013": ["2013 UEFA Champions League Final", "Wembley 2013 final"],
  "CL Final · Moscow 2008": ["2008 UEFA Champions League Final", "Moscow 2008 final"],
  "European Cup Final · Turin 1996": ["1996 UEFA Champions League Final", "Turin 1996"],
  "World Cup Final · Rome 1990": ["1990 FIFA World Cup Final", "Rome 1990 final"],
  "World Cup Final · Yokohama 2002": ["2002 FIFA World Cup Final", "Yokohama 2002"],
};

const sleep = ms => new Promise(r => setTimeout(r, ms));

async function commonsThumb(query, width = 640) {
  const api = "https://commons.wikimedia.org/w/api.php?action=query&generator=search&gsrsearch=" +
    encodeURIComponent(query) + "&gsrnamespace=6&gsrlimit=1&prop=imageinfo&iiprop=url&iiurlwidth=" + width + "&format=json";
  for (let t = 0; t < 3; t++) {
    try {
      const r = await fetch(api, { headers: { "User-Agent": UA } });
      const j = await r.json();
      const pg = Object.values(j.query?.pages || {})[0];
      if (pg?.imageinfo?.[0]) return { thumb: pg.imageinfo[0].thumburl, file: pg.title };
      return null;
    } catch (e) { if (t === 2) return null; await sleep(1500); }
  }
  return null;
}

(async () => {
  const out = [];
  for (const [key, candidates] of Object.entries(MAP)) {
    let hit = null;
    for (const q of candidates) {
      hit = await commonsThumb(q);
      if (hit) break;
      await sleep(300);
    }
    if (hit) { out.push({ id: key, img: hit.thumb, file: hit.file }); console.log("+", key.slice(0, 32)); }
    else console.log("- no img:", key.slice(0, 32));
    await sleep(400);
  }
  fs.writeFileSync(OUT, JSON.stringify({ _meta: { source: "Wikimedia Commons", bakedAt: new Date().toISOString(), count: out.length }, matches: out }, null, 1), "utf8");
  console.log("wrote", OUT, "-", out.length, "match photos");
})();
