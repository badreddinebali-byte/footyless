#!/usr/bin/env node
const fs = require("fs");
const s = fs.readFileSync("C:/Users/badre/goalless/games/missingxi/data.js", "utf8");
const ids = [...s.matchAll(/id: "([a-z0-9]+)"/g)].map(m => m[1]);
console.log("total fixtures:", ids.length);
const uniq = new Set(ids);
console.log("unique:", uniq.size);
const dup = ids.filter((x, i) => ids.indexOf(x) !== i);
if (dup.length) console.log("DUPLICATES:", dup); else console.log("no duplicates");
/* lineup sanity: each fixture 11 players */
const lineups = [...s.matchAll(/lineup:\s*\[([\s\S]*?)\]\s*,\s*\}\s*,/g)];
let bad = 0;
lineups.forEach((L, i) => {
  const n = (L[1].match(/pos:/g) || []).length;
  if (n !== 11) { console.log("fixture #" + i + " has " + n + " players"); bad++; }
});
console.log("lineups checked:", lineups.length, "bad:", bad);
