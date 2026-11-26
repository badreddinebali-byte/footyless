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
        { pos: "GK", x: 50, y: 92, name: "Jerzy Dudek" },
        { pos: "DF", x: 15, y: 72, name: "Steve Finnan" },
        { pos: "DF", x: 38, y: 76, name: "Jamie Carragher" },
        { pos: "DF", x: 62, y: 76, name: "Sami Hyypiä" },
        { pos: "DF", x: 85, y: 72, name: "Djimi Traoré" },
        { pos: "MF", x: 15, y: 48, name: "Steven Gerrard" },
        { pos: "MF", x: 38, y: 52, name: "Xabi Alonso" },
        { pos: "MF", x: 62, y: 52, name: "John Arne Riise" },
        { pos: "MF", x: 85, y: 48, name: "Harry Kewell" },
        { pos: "FW", x: 35, y: 24, name: "Milan Baroš" },
        { pos: "FW", x: 65, y: 24, name: "Luis García" },
      ],
    },
    {
      id: "istanbul05a",
      comp: "Champions League Final", season: "2004–05",
      home: "Milan", away: "Liverpool", score: "3–3", note: "Istanbul",
      team: "Milan", formation: "4-3-1-2",
      lineup: [
        { pos: "GK", x: 50, y: 92, name: "Dida" },
        { pos: "DF", x: 15, y: 72, name: "Cafu" },
        { pos: "DF", x: 38, y: 76, name: "Jaap Stam" },
        { pos: "DF", x: 62, y: 76, name: "Alessandro Nesta" },
        { pos: "DF", x: 85, y: 72, name: "Paolo Maldini" },
        { pos: "MF", x: 20, y: 55, name: "Gennaro Gattuso" },
        { pos: "MF", x: 50, y: 58, name: "Andrea Pirlo" },
        { pos: "MF", x: 80, y: 55, name: "Clarence Seedorf" },
        { pos: "AM", x: 50, y: 36, name: "Kaká" },
        { pos: "FW", x: 35, y: 18, name: "Andriy Shevchenko" },
        { pos: "FW", x: 65, y: 18, name: "Hernán Crespo" },
      ],
    },
    {
      id: "wembley11",
      comp: "Champions League Final", season: "2010–11",
      home: "Barcelona", away: "Man Utd", score: "3–1", note: "Wembley",
      team: "Barcelona", formation: "4-3-3",
      lineup: [
        { pos: "GK", x: 50, y: 92, name: "Victor Valdés" },
        { pos: "DF", x: 15, y: 72, name: "Dani Alves" },
        { pos: "DF", x: 38, y: 76, name: "Gerard Piqué" },
        { pos: "DF", x: 62, y: 76, name: "Javier Mascherano" },
        { pos: "DF", x: 85, y: 72, name: "Éric Abidal" },
        { pos: "MF", x: 20, y: 55, name: "Sergio Busquets" },
        { pos: "MF", x: 50, y: 58, name: "Xavi" },
        { pos: "MF", x: 80, y: 55, name: "Andrés Iniesta" },
        { pos: "FW", x: 18, y: 28, name: "Pedro" },
        { pos: "FW", x: 50, y: 24, name: "Lionel Messi" },
        { pos: "FW", x: 82, y: 28, name: "David Villa" },
      ],
    },
    {
      id: "lisbon14",
      comp: "Champions League Final", season: "2013–14",
      home: "Atlético", away: "Real Madrid", score: "1–4", note: "La Décima",
      team: "Real Madrid", formation: "4-3-3",
      lineup: [
        { pos: "GK", x: 50, y: 92, name: "Iker Casillas" },
        { pos: "DF", x: 15, y: 72, name: "Daniel Carvajal" },
        { pos: "DF", x: 38, y: 76, name: "Raphaël Varane" },
        { pos: "DF", x: 62, y: 76, name: "Sergio Ramos" },
        { pos: "DF", x: 85, y: 72, name: "Fábio Coentrão" },
        { pos: "MF", x: 20, y: 55, name: "Sami Khedira" },
        { pos: "MF", x: 50, y: 58, name: "Luka Modrić" },
        { pos: "MF", x: 80, y: 55, name: "Ángel Di María" },
        { pos: "FW", x: 18, y: 28, name: "Gareth Bale" },
        { pos: "FW", x: 50, y: 24, name: "Karim Benzema" },
        { pos: "FW", x: 82, y: 28, name: "Cristiano Ronaldo" },
      ],
    },
    {
      id: "belohorizonte14",
      comp: "World Cup Semi-final", season: "2014",
      home: "Brazil", away: "Germany", score: "1–7", note: "Mineirazo",
      team: "Germany", formation: "4-2-3-1",
      lineup: [
        { pos: "GK", x: 50, y: 92, name: "Manuel Neuer" },
        { pos: "DF", x: 15, y: 72, name: "Philipp Lahm" },
        { pos: "DF", x: 38, y: 76, name: "Jérôme Boateng" },
        { pos: "DF", x: 62, y: 76, name: "Mats Hummels" },
        { pos: "DF", x: 85, y: 72, name: "Benedikt Höwedes" },
        { pos: "MF", x: 35, y: 56, name: "Bastian Schweinsteiger" },
        { pos: "MF", x: 65, y: 56, name: "Toni Kroos" },
        { pos: "AM", x: 18, y: 36, name: "Thomas Müller" },
        { pos: "AM", x: 50, y: 40, name: "Mesut Özil" },
        { pos: "AM", x: 82, y: 36, name: "Sami Khedira" },
        { pos: "FW", x: 50, y: 18, name: "Miroslav Klose" },
      ],
    },
    {
      id: "mexico70",
      comp: "World Cup Final", season: "1970",
      home: "Brazil", away: "Italy", score: "4–1", note: "Azteca",
      team: "Brazil", formation: "4-2-3-1",
      lineup: [
        { pos: "GK", x: 50, y: 92, name: "Félix" },
        { pos: "DF", x: 15, y: 72, name: "Carlos Alberto" },
        { pos: "DF", x: 38, y: 76, name: "Brito" },
        { pos: "DF", x: 62, y: 76, name: "Piazza" },
        { pos: "DF", x: 85, y: 72, name: "Everaldo" },
        { pos: "MF", x: 35, y: 56, name: "Clodoaldo" },
        { pos: "MF", x: 65, y: 56, name: "Gérson" },
        { pos: "AM", x: 18, y: 36, name: "Rivellino" },
        { pos: "AM", x: 50, y: 40, name: "Tostão" },
        { pos: "AM", x: 82, y: 36, name: "Jairzinho" },
        { pos: "FW", x: 50, y: 18, name: "Pelé" },
      ],
    },
    {
      id: "campnou99",
      comp: "Champions League Final", season: "1998–99",
      home: "Man Utd", away: "Bayern", score: "2–1", note: "Camp Nou",
      team: "Man Utd", formation: "4-4-2",
      lineup: [
        { pos: "GK", x: 50, y: 92, name: "Peter Schmeichel" },
        { pos: "DF", x: 15, y: 72, name: "Gary Neville" },
        { pos: "DF", x: 38, y: 76, name: "Jaap Stam" },
        { pos: "DF", x: 62, y: 76, name: "Ronny Johnsen" },
        { pos: "DF", x: 85, y: 72, name: "Denis Irwin" },
        { pos: "MF", x: 15, y: 50, name: "David Beckham" },
        { pos: "MF", x: 38, y: 54, name: "Roy Keane" },
        { pos: "MF", x: 62, y: 54, name: "Paul Scholes" },
        { pos: "MF", x: 85, y: 50, name: "Ryan Giggs" },
        { pos: "FW", x: 35, y: 24, name: "Dwight Yorke" },
        { pos: "FW", x: 65, y: 24, name: "Andy Cole" },
      ],
    },
    {
      id: "kingpower16",
      comp: "Premier League champions XI", season: "2015–16",
      home: "Leicester", away: "Everton", score: "3–1", note: "Title season",
      team: "Leicester", formation: "4-4-2",
      lineup: [
        { pos: "GK", x: 50, y: 92, name: "Kasper Schmeichel" },
        { pos: "DF", x: 15, y: 72, name: "Danny Simpson" },
        { pos: "DF", x: 38, y: 76, name: "Wes Morgan" },
        { pos: "DF", x: 62, y: 76, name: "Robert Huth" },
        { pos: "DF", x: 85, y: 72, name: "Christian Fuchs" },
        { pos: "MF", x: 15, y: 50, name: "Riyad Mahrez" },
        { pos: "MF", x: 38, y: 54, name: "Danny Drinkwater" },
        { pos: "MF", x: 62, y: 54, name: "N'Golo Kanté" },
        { pos: "MF", x: 85, y: 50, name: "Marc Albrighton" },
        { pos: "FW", x: 35, y: 24, name: "Shinji Okazaki" },
        { pos: "FW", x: 65, y: 24, name: "Jamie Vardy" },
      ],
    },
    {
      id: "treble23",
      comp: "Champions League Final", season: "2022–23",
      home: "Man City", away: "Inter", score: "1–0", note: "Treble seal",
      team: "Man City", formation: "4-1-4-1",
      lineup: [
        { pos: "GK", x: 50, y: 92, name: "Ederson" },
        { pos: "DF", x: 15, y: 72, name: "Kyle Walker" },
        { pos: "DF", x: 38, y: 76, name: "Ruben Dias" },
        { pos: "DF", x: 62, y: 76, name: "Manuel Akanji" },
        { pos: "DF", x: 85, y: 72, name: "Nathan Aké" },
        { pos: "MF", x: 50, y: 58, name: "Rodri" },
        { pos: "MF", x: 18, y: 42, name: "Bernardo Silva" },
        { pos: "MF", x: 45, y: 46, name: "Kevin De Bruyne" },
        { pos: "MF", x: 74, y: 46, name: "İlkay Gündoğan" },
        { pos: "FW", x: 38, y: 24, name: "Erling Haaland" },
        { pos: "FW", x: 66, y: 22, name: "Julián Álvarez" },
      ],
    },
    {
      id: "invincibles04",
      comp: "Premier League", season: "2003–04",
      home: "Arsenal", away: "Leicester", score: "2–1", note: "Invincibles finale",
      team: "Arsenal", formation: "4-4-2",
      lineup: [
        { pos: "GK", x: 50, y: 92, name: "Jens Lehmann" },
        { pos: "DF", x: 15, y: 72, name: "Lauren" },
        { pos: "DF", x: 38, y: 76, name: "Sol Campbell" },
        { pos: "DF", x: 62, y: 76, name: "Kolo Touré" },
        { pos: "DF", x: 85, y: 72, name: "Ashley Cole" },
        { pos: "MF", x: 15, y: 50, name: "Freddie Ljungberg" },
        { pos: "MF", x: 38, y: 54, name: "Patrick Vieira" },
        { pos: "MF", x: 62, y: 54, name: "Gilberto Silva" },
        { pos: "MF", x: 85, y: 50, name: "Robert Pirès" },
        { pos: "FW", x: 35, y: 24, name: "Dennis Bergkamp" },
        { pos: "FW", x: 65, y: 24, name: "Thierry Henry" },
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
