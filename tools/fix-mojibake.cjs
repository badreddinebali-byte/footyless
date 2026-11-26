#!/usr/bin/env node
/* One-shot repairer: rebuilds any mojibake'd HTML titles/h1 from known-good bytes. */
const fs = require("fs");
const path = require("path");
const ROOT = path.join(__dirname, "..");

const EM = "\u2014";
const games = ["capless","scoreless","kitless","missingxi","groundless","statless","legendless"];

// title: strip everything between <title> and " Footyless</title>", insert clean em dash
games.forEach(g => {
  const p = path.join(ROOT, "games", g, "index.html");
  if (!fs.existsSync(p)) return;
  let c = fs.readFileSync(p, "utf8");
  const title = g === "missingxi" ? "Missing XI" : g.charAt(0).toUpperCase() + g.slice(1);
  const cleaned = c.replace(/<title>[^<]*<\/title>/, `<title>${title} ${EM} Footyless</title>`);
  if (cleaned !== c) { fs.writeFileSync(p, cleaned, "utf8"); console.log("fixed title:", g); }
});

// stats.html: title + h1 emoji
const sp = path.join(ROOT, "stats.html");
let sc = fs.readFileSync(sp, "utf8");
const s2 = sc
  .replace(/<title>[^<]*<\/title>/, `<title>Statistics ${EM} Footyless</title>`)
  .replace(/<h1>[^<]*<\/h1>/, "<h1>\u{1F4CA}</h1>");
if (s2 !== sc) { fs.writeFileSync(sp, s2, "utf8"); console.log("fixed stats.html"); }

// root index: footer separators etc — audit for any non-ascii mojibake patterns
const ip = path.join(ROOT, "index.html");
let ic = fs.readFileSync(ip, "utf8");
const i2 = ic
  .replace(/\u00e2\u20ac\u201c|\u00e2\u20ac\u201d|\uFFFD+/g, EM)
  .replace(/\u00e2\u20ac\u2122/g, "'");
if (i2 !== ic) { fs.writeFileSync(ip, i2, "utf8"); console.log("fixed index.html"); }

// final audit: report any remaining suspicious high-byte garbage
const bad = /[\u00c2-\u00c3][\u0080-\u00bf]|\uFFFD/;
function walk(dir) {
  fs.readdirSync(dir, { withFileTypes: true }).forEach(e => {
    const p = path.join(dir, e.name);
    if (e.isDirectory() && !e.name.startsWith(".")) return walk(p);
    if (/\.(html|js|css)$/.test(e.name)) {
      const c = fs.readFileSync(p, "utf8");
      const m = c.match(new RegExp(bad, "g"));
      if (m && !p.includes("i18n.js") && !p.includes("\\ar")) {
        // i18n legitimately contains accented chars — the pattern above targets lone Ã/Â prefixes only
        console.log("suspect:", path.relative(ROOT, p), (m||[]).length, JSON.stringify((c.match(new RegExp(bad+".{0,12}"))||[]).slice(0,3)));
      }
    }
  });
}
walk(ROOT);
console.log("audit done");
