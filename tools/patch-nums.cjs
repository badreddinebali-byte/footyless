#!/usr/bin/env node
/* Patch real historical squad numbers into missingxi data.js fixtures. */
const fs = require("fs");
const p = "C:/Users/badre/goalless/games/missingxi/data.js";
let c = fs.readFileSync(p, "utf8");

const REAL = {
  lisbon14: { "Iker Casillas":1,"Daniel Carvajal":15,"Raphaël Varane":2,"Sergio Ramos":4,"Fábio Coentrão":5,"Sami Khedira":6,"Luka Modrić":19,"Ángel Di María":22,"Gareth Bale":11,"Karim Benzema":9,"Cristiano Ronaldo":7 },
  istanbul05: { "Jerzy Dudek":1,"Steve Finnan":3,"Jamie Carragher":23,"Sami Hyypiä":4,"Djimi Traoré":18,"Steven Gerrard":8,"Xabi Alonso":14,"John Arne Riise":6,"Harry Kewell":7,"Milan Baroš":5,"Luis García":10 },
  istanbul05a: { "Dida":1,"Cafu":2,"Jaap Stam":31,"Alessandro Nesta":13,"Paolo Maldini":3,"Gennaro Gattuso":8,"Andrea Pirlo":21,"Clarence Seedorf":20,"Kaká":22,"Andriy Shevchenko":7,"Hernán Crespo":11 },
  wembley11: { "Victor Valdés":1,"Dani Alves":2,"Gerard Piqué":3,"Javier Mascherano":14,"Éric Abidal":22,"Sergio Busquets":16,"Xavi":6,"Andrés Iniesta":8,"Pedro":17,"Lionel Messi":10,"David Villa":7 },
  belohorizonte14: { "Manuel Neuer":1,"Philipp Lahm":16,"Jérôme Boateng":20,"Mats Hummels":5,"Benedikt Höwedes":4,"Bastian Schweinsteiger":7,"Toni Kroos":18,"Thomas Müller":13,"Mesut Özil":8,"Sami Khedira":6,"Miroslav Klose":11 },
  mexico70: { "Félix":1,"Carlos Alberto":2,"Brito":3,"Piazza":5,"Everaldo":6,"Clodoaldo":5,"Gérson":10,"Rivellino":11,"Tostão":9,"Jairzinho":7,"Pelé":10 },
  campnou99: { "Peter Schmeichel":1,"Gary Neville":2,"Jaap Stam":12,"Ronny Johnsen":6,"Denis Irwin":3,"David Beckham":7,"Roy Keane":16,"Paul Scholes":18,"Ryan Giggs":11,"Dwight Yorke":10,"Andy Cole":9 },
  kingpower16: { "Kasper Schmeichel":1,"Danny Simpson":17,"Wes Morgan":5,"Robert Huth":6,"Christian Fuchs":28,"Riyad Mahrez":26,"Danny Drinkwater":4,"N'Golo Kanté":14,"Marc Albrighton":11,"Shinji Okazaki":20,"Jamie Vardy":9 },
  treble23: { "Ederson":31,"Kyle Walker":2,"Ruben Dias":3,"Manuel Akanji":25,"Nathan Aké":6,"Rodri":16,"Bernardo Silva":20,"Kevin De Bruyne":17,"İlkay Gündoğan":8,"Erling Haaland":9,"Julián Álvarez":19 },
  invincibles04: { "Jens Lehmann":1,"Lauren":12,"Sol Campbell":23,"Kolo Touré":28,"Ashley Cole":3,"Freddie Ljungberg":8,"Patrick Vieira":4,"Gilberto Silva":19,"Robert Pirès":7,"Dennis Bergkamp":10,"Thierry Henry":14 },
};

const parts = c.split(/(?=id: ")/);
let patched = 0;
const out = parts.map(sec => {
  const idm = sec.match(/id: "([a-z0-9]+)"/);
  if (!idm) return sec;
  const table = REAL[idm[1]];
  if (!table) { console.log("no table for", idm[1]); return sec; }
  let slot = 0;
  sec = sec.replace(/(name: "([^"]+)"), num: \d+ \}/g, (m, grp, name) => {
    slot++;
    const num = (table[name] !== undefined) ? table[name] : slot;
    if (table[name] !== undefined) patched++;
    return grp + ", num: " + num + " }";
  });
  return sec;
}).join("");

fs.writeFileSync(p, out);
console.log("matched-real-nums:", patched, "/ 110");
