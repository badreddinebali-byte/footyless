/* ============================================================
   FOOTYLESS · Missing XI data — legendary fixtures & their XIs
   Hand-verified starting lineups. Players fold to SURNAME keys.
   Names must match football history: these are the starters only.
   ============================================================ */
(function (M) {
  "use strict";

  /* formation coordinates are percentages on the pitch (x: 0-100 left→right, y: 0-100 top=own goal) */
  const FIXTURES = [
    {
      id: "istanbul05",
      comp: "Champions League Final", season: "2004–05",
      home: "Liverpool", away: "Milan", score: "3–3", note: "Istanbul",
      team: "Liverpool", formation: "4-4-1-1",
      lineup: [
        { pos: "GK", x: 50, y: 92, name: "Jerzy Dudek", num: 1 },
        { pos: "DF", x: 15, y: 72, name: "Steve Finnan", num: 2 },
        { pos: "DF", x: 38, y: 76, name: "Jamie Carragher", num: 3 },
        { pos: "DF", x: 62, y: 76, name: "Sami Hyypiä", num: 4 },
        { pos: "DF", x: 85, y: 72, name: "Djimi Traoré", num: 5 },
        { pos: "MF", x: 15, y: 48, name: "Steven Gerrard", num: 6 },
        { pos: "MF", x: 38, y: 52, name: "Xabi Alonso", num: 7 },
        { pos: "MF", x: 62, y: 52, name: "John Arne Riise", num: 8 },
        { pos: "MF", x: 85, y: 48, name: "Harry Kewell", num: 9 },
        { pos: "FW", x: 35, y: 24, name: "Milan Baroš", num: 10 },
        { pos: "FW", x: 65, y: 24, name: "Luis García", num: 11 },
      ],
    },
    {
      id: "istanbul05a",
      comp: "Champions League Final", season: "2004–05",
      home: "Milan", away: "Liverpool", score: "3–3", note: "Istanbul",
      team: "Milan", formation: "4-3-1-2",
      lineup: [
        { pos: "GK", x: 50, y: 92, name: "Dida", num: 1 },
        { pos: "DF", x: 15, y: 72, name: "Cafu", num: 2 },
        { pos: "DF", x: 38, y: 76, name: "Jaap Stam", num: 3 },
        { pos: "DF", x: 62, y: 76, name: "Alessandro Nesta", num: 4 },
        { pos: "DF", x: 85, y: 72, name: "Paolo Maldini", num: 5 },
        { pos: "MF", x: 20, y: 55, name: "Gennaro Gattuso", num: 6 },
        { pos: "MF", x: 50, y: 58, name: "Andrea Pirlo", num: 7 },
        { pos: "MF", x: 80, y: 55, name: "Clarence Seedorf", num: 8 },
        { pos: "AM", x: 50, y: 36, name: "Kaká", num: 9 },
        { pos: "FW", x: 35, y: 18, name: "Andriy Shevchenko", num: 10 },
        { pos: "FW", x: 65, y: 18, name: "Hernán Crespo", num: 11 },
      ],
    },
    {
      id: "wembley11",
      comp: "Champions League Final", season: "2010–11",
      home: "Barcelona", away: "Man Utd", score: "3–1", note: "Wembley",
      team: "Barcelona", formation: "4-3-3",
      lineup: [
        { pos: "GK", x: 50, y: 92, name: "Victor Valdés", num: 1 },
        { pos: "DF", x: 15, y: 72, name: "Dani Alves", num: 2 },
        { pos: "DF", x: 38, y: 76, name: "Gerard Piqué", num: 3 },
        { pos: "DF", x: 62, y: 76, name: "Javier Mascherano", num: 4 },
        { pos: "DF", x: 85, y: 72, name: "Éric Abidal", num: 5 },
        { pos: "MF", x: 20, y: 55, name: "Sergio Busquets", num: 6 },
        { pos: "MF", x: 50, y: 58, name: "Xavi", num: 7 },
        { pos: "MF", x: 80, y: 55, name: "Andrés Iniesta", num: 8 },
        { pos: "FW", x: 18, y: 28, name: "Pedro", num: 9 },
        { pos: "FW", x: 50, y: 24, name: "Lionel Messi", num: 10 },
        { pos: "FW", x: 82, y: 28, name: "David Villa", num: 11 },
      ],
    },
    {
      id: "lisbon14",
      comp: "Champions League Final", season: "2013–14",
      home: "Atlético", away: "Real Madrid", score: "1–4", note: "La Décima",
      team: "Real Madrid", formation: "4-3-3",
      lineup: [
        { pos: "GK", x: 50, y: 92, name: "Iker Casillas", num: 1 },
        { pos: "DF", x: 15, y: 72, name: "Daniel Carvajal", num: 2 },
        { pos: "DF", x: 38, y: 76, name: "Raphaël Varane", num: 3 },
        { pos: "DF", x: 62, y: 76, name: "Sergio Ramos", num: 4 },
        { pos: "DF", x: 85, y: 72, name: "Fábio Coentrão", num: 5 },
        { pos: "MF", x: 20, y: 55, name: "Sami Khedira", num: 6 },
        { pos: "MF", x: 50, y: 58, name: "Luka Modrić", num: 7 },
        { pos: "MF", x: 80, y: 55, name: "Ángel Di María", num: 8 },
        { pos: "FW", x: 18, y: 28, name: "Gareth Bale", num: 9 },
        { pos: "FW", x: 50, y: 24, name: "Karim Benzema", num: 10 },
        { pos: "FW", x: 82, y: 28, name: "Cristiano Ronaldo", num: 11 },
      ],
    },
    {
      id: "belohorizonte14",
      comp: "World Cup Semi-final", season: "2014",
      home: "Brazil", away: "Germany", score: "1–7", note: "Mineirazo",
      team: "Germany", formation: "4-2-3-1",
      lineup: [
        { pos: "GK", x: 50, y: 92, name: "Manuel Neuer", num: 1 },
        { pos: "DF", x: 15, y: 72, name: "Philipp Lahm", num: 2 },
        { pos: "DF", x: 38, y: 76, name: "Jérôme Boateng", num: 3 },
        { pos: "DF", x: 62, y: 76, name: "Mats Hummels", num: 4 },
        { pos: "DF", x: 85, y: 72, name: "Benedikt Höwedes", num: 5 },
        { pos: "MF", x: 35, y: 56, name: "Bastian Schweinsteiger", num: 6 },
        { pos: "MF", x: 65, y: 56, name: "Toni Kroos", num: 7 },
        { pos: "AM", x: 18, y: 36, name: "Thomas Müller", num: 8 },
        { pos: "AM", x: 50, y: 40, name: "Mesut Özil", num: 9 },
        { pos: "AM", x: 82, y: 36, name: "Sami Khedira", num: 10 },
        { pos: "FW", x: 50, y: 18, name: "Miroslav Klose", num: 11 },
      ],
    },
    {
      id: "mexico70",
      comp: "World Cup Final", season: "1970",
      home: "Brazil", away: "Italy", score: "4–1", note: "Azteca",
      team: "Brazil", formation: "4-2-3-1",
      lineup: [
        { pos: "GK", x: 50, y: 92, name: "Félix", num: 1 },
        { pos: "DF", x: 15, y: 72, name: "Carlos Alberto", num: 2 },
        { pos: "DF", x: 38, y: 76, name: "Brito", num: 3 },
        { pos: "DF", x: 62, y: 76, name: "Piazza", num: 4 },
        { pos: "DF", x: 85, y: 72, name: "Everaldo", num: 5 },
        { pos: "MF", x: 35, y: 56, name: "Clodoaldo", num: 6 },
        { pos: "MF", x: 65, y: 56, name: "Gérson", num: 7 },
        { pos: "AM", x: 18, y: 36, name: "Rivellino", num: 8 },
        { pos: "AM", x: 50, y: 40, name: "Tostão", num: 9 },
        { pos: "AM", x: 82, y: 36, name: "Jairzinho", num: 10 },
        { pos: "FW", x: 50, y: 18, name: "Pelé", num: 11 },
      ],
    },
    {
      id: "campnou99",
      comp: "Champions League Final", season: "1998–99",
      home: "Man Utd", away: "Bayern", score: "2–1", note: "Camp Nou",
      team: "Man Utd", formation: "4-4-2",
      lineup: [
        { pos: "GK", x: 50, y: 92, name: "Peter Schmeichel", num: 1 },
        { pos: "DF", x: 15, y: 72, name: "Gary Neville", num: 2 },
        { pos: "DF", x: 38, y: 76, name: "Jaap Stam", num: 3 },
        { pos: "DF", x: 62, y: 76, name: "Ronny Johnsen", num: 4 },
        { pos: "DF", x: 85, y: 72, name: "Denis Irwin", num: 5 },
        { pos: "MF", x: 15, y: 50, name: "David Beckham", num: 6 },
        { pos: "MF", x: 38, y: 54, name: "Roy Keane", num: 7 },
        { pos: "MF", x: 62, y: 54, name: "Paul Scholes", num: 8 },
        { pos: "MF", x: 85, y: 50, name: "Ryan Giggs", num: 9 },
        { pos: "FW", x: 35, y: 24, name: "Dwight Yorke", num: 10 },
        { pos: "FW", x: 65, y: 24, name: "Andy Cole", num: 11 },
      ],
    },
    {
      id: "kingpower16",
      comp: "Premier League champions XI", season: "2015–16",
      home: "Leicester", away: "Everton", score: "3–1", note: "Title season",
      team: "Leicester", formation: "4-4-2",
      lineup: [
        { pos: "GK", x: 50, y: 92, name: "Kasper Schmeichel", num: 1 },
        { pos: "DF", x: 15, y: 72, name: "Danny Simpson", num: 2 },
        { pos: "DF", x: 38, y: 76, name: "Wes Morgan", num: 3 },
        { pos: "DF", x: 62, y: 76, name: "Robert Huth", num: 4 },
        { pos: "DF", x: 85, y: 72, name: "Christian Fuchs", num: 5 },
        { pos: "MF", x: 15, y: 50, name: "Riyad Mahrez", num: 6 },
        { pos: "MF", x: 38, y: 54, name: "Danny Drinkwater", num: 7 },
        { pos: "MF", x: 62, y: 54, name: "N'Golo Kanté", num: 8 },
        { pos: "MF", x: 85, y: 50, name: "Marc Albrighton", num: 9 },
        { pos: "FW", x: 35, y: 24, name: "Shinji Okazaki", num: 10 },
        { pos: "FW", x: 65, y: 24, name: "Jamie Vardy", num: 11 },
      ],
    },
    {
      id: "treble23",
      comp: "Champions League Final", season: "2022–23",
      home: "Man City", away: "Inter", score: "1–0", note: "Treble seal",
      team: "Man City", formation: "4-1-4-1",
      lineup: [
        { pos: "GK", x: 50, y: 92, name: "Ederson", num: 1 },
        { pos: "DF", x: 15, y: 72, name: "Kyle Walker", num: 2 },
        { pos: "DF", x: 38, y: 76, name: "Ruben Dias", num: 3 },
        { pos: "DF", x: 62, y: 76, name: "Manuel Akanji", num: 4 },
        { pos: "DF", x: 85, y: 72, name: "Nathan Aké", num: 5 },
        { pos: "MF", x: 50, y: 58, name: "Rodri", num: 6 },
        { pos: "MF", x: 18, y: 42, name: "Bernardo Silva", num: 7 },
        { pos: "MF", x: 45, y: 46, name: "Kevin De Bruyne", num: 8 },
        { pos: "MF", x: 74, y: 46, name: "İlkay Gündoğan", num: 9 },
        { pos: "FW", x: 38, y: 24, name: "Erling Haaland", num: 10 },
        { pos: "FW", x: 66, y: 22, name: "Julián Álvarez", num: 11 },
      ],
    },
    {
      id: "invincibles04",
      comp: "Premier League", season: "2003–04",
      home: "Arsenal", away: "Leicester", score: "2–1", note: "Invincibles finale",
      team: "Arsenal", formation: "4-4-2",
      lineup: [
        { pos: "GK", x: 50, y: 92, name: "Jens Lehmann", num: 1 },
        { pos: "DF", x: 15, y: 72, name: "Lauren", num: 2 },
        { pos: "DF", x: 38, y: 76, name: "Sol Campbell", num: 3 },
        { pos: "DF", x: 62, y: 76, name: "Kolo Touré", num: 4 },
        { pos: "DF", x: 85, y: 72, name: "Ashley Cole", num: 5 },
        { pos: "MF", x: 15, y: 50, name: "Freddie Ljungberg", num: 6 },
        { pos: "MF", x: 38, y: 54, name: "Patrick Vieira", num: 7 },
        { pos: "MF", x: 62, y: 54, name: "Gilberto Silva", num: 8 },
        { pos: "MF", x: 85, y: 50, name: "Robert Pirès", num: 9 },
        { pos: "FW", x: 35, y: 24, name: "Dennis Bergkamp", num: 10 },
        { pos: "FW", x: 65, y: 24, name: "Thierry Henry", num: 11 },
      ],
    },
  ];

  /* surname extractor: last whitespace-separated token, accent-folded, uppercased */
  M.surnameOf = function (full) {
    const last = String(full).trim().split(/\s+/).pop();
    return M.fold(last);
  };
  M.fold = s => String(s || "")
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/['.\- ]/g, "")
    .toUpperCase();

  /* accepted alternate answers per folded surname */
  M.ALIASES = {
    PELE: ["PELE"],
    "JULIANALVAREZ": ["LVAREZ"],
    PIRESPERES: [],
  };

  M.FIXTURES = FIXTURES;
})(window.MX_DATA = {});
