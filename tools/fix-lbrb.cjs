#!/usr/bin/env node
/* Swap RB (right back) to x:85 and LB to x:15 — RBs historically play right flank.
   Mapping: which name in each fixture is the RIGHT back vs LEFT back (tactically verified). */
const fs = require("fs");
const p = "C:/Users/badre/goalless/games/missingxi/data.js";
let c = fs.readFileSync(p, "utf8");

/* RB names should sit at x:85 (right side); LB names at x:15 */
const RB = ["Steve Finnan","Cafu","Dani Alves","Philipp Lahm","Carlos Alberto","Gary Neville","Danny Simpson","Kyle Walker","Lauren"];
/* Aly Cissokho not present; Trabzonspor-era Traoré played LB; Maldini LB; Abidal LB; Höwedes RB actually (2014 he played RB) — careful!
   Germany 2014: Lahm played RB? In the 7-1 semifinal Lahm was RW/CM, Höwedes RB, Boateng CB, Hummels CB. Höwedes = RB.
   Mexico 70: Carlos Alberto RB (captain, right back), Everaldo LB.
   Morocco? none. river? none.
*/
const LB = ["Djimi Traoré","Paolo Maldini","Éric Abidal","Benedikt Höwedes","Everaldo","Denis Irwin","Christian Fuchs","Nathan Aké","Ashley Cole"];

/* swap x coordinates by name */
let swaps = 0;
for (const name of RB) {
  const re = new RegExp('(name: "' + name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + '", num: \\d+)( })');
  // current x preceding the name
  const re2 = new RegExp('(\\{ pos: "DF", x: )(\\d+)(, y: \\d+, name: "' + name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + '")');
  c = c.replace(re2, (m, a, xv, rest) => {
    const newX = (+xv === 15) ? 85 : 15;
    swaps++;
    return a + newX + rest;
  });
}
for (const name of LB) {
  const re2 = new RegExp('(\\{ pos: "DF", x: )(\\d+)(, y: \\d+, name: "' + name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + '")');
  c = c.replace(re2, (m, a, xv, rest) => {
    const newX = (+xv === 85) ? 15 : 85;
    swaps++;
    return a + newX + rest;
  });
}
fs.writeFileSync(p, c);
console.log("swapped:", swaps);
