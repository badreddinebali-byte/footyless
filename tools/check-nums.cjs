#!/usr/bin/env node
const s = require("fs").readFileSync("C:/Users/badre/goalless/games/missingxi/data.js", "utf8");
const checks = [["Luka Modrić", 19], ["N'Golo Kanté", 14], ["İlkay Gündoğan", 8], ["Fábio Coentrão", 5], ["Riyad Mahrez", 26], ["Thierry Henry", 14]];
let ok = 0;
for (const [name, want] of checks) {
  const m = s.match(new RegExp('name: "' + name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + '", num: (\\d+)'));
  const got = m ? +m[1] : null;
  console.log((got === want ? "OK " : "BAD") , name, "->", got, "(want", want + ")");
  if (got === want) ok++;
}
console.log(ok + "/" + checks.length + " spot checks pass");
