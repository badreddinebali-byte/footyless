/* ============================================================
   FOOTYLESS · Scoreless data — mixed duel deck
   Curated sample pack (values approximate, pipeline replaces later).
   Each duel has: a/b entities, numeric value, category, labels.
   ============================================================ */
(function (G) {
  "use strict";

  /* ---------- CATEGORY 1 · MATCH-GOAL DUELS ----------
     Two real fixtures; which produced MORE total goals? */
  G.MATCH_DUELS = [
    { l: { t: "Bayern 8–2 Barcelona", meta: "CL QF · Lisbon 2020", v: 10 },
      r: { t: "Italy 4–3 Brazil",      meta: "WC Final · Spain 1982", v: 7 } },
    { l: { t: "Reading 7–5 Arsenal",  meta: "League Cup · 2012",     v: 12 },
      r: { t: "Man Utd 8–2 Arsenal",   meta: "Premier League · 2011", v: 10 } },
    { l: { t: "Germany 7–1 Brazil",   meta: "WC Semi · 2014",        v: 8 },
      r: { t: "Liverpool 4–3 Milan",   meta: "CL Final · Istanbul 2005", v: 7 } },
    { l: { t: "Tottenham 9–1 Wigan",  meta: "Premier League · 2009", v: 10 },
      r: { t: "Barcelona 5–1 Real Madrid", meta: "La Liga · 2011",    v: 6 } },
    { l: { t: "Portugal 6–1 Switzerland", meta: "WC R16 · Qatar 2022", v: 7 },
      r: { t: "Man City 6–1 Man Utd",  meta: "Premier League · 2011", v: 7 } },
    { l: { t: "Netherlands 5–1 Spain", meta: "WC Group · 2014",       v: 6 },
      r: { t: "PSG 6–1 Auxerre",       meta: "Ligue 1 · 2025 runner-up signal", v: 7 } },
    { l: { t: "Chelsea 6–0 Stoke",    meta: "Premier League · 2010", v: 6 },
      r: { t: "Real Madrid 6–0 Espanyol", meta: "La Liga · 2016",     v: 6 } },
    { l: { t: "Australia 31–0 Samoa", meta: "WC Qualifier · 2001",   v: 31 },
      r: { t: "Germany 16–0 San Marino", meta: "Euro Qualifier · 2006", v: 16 } },
  ];

  /* ---------- CATEGORY 2 · CAREER-GOAL DUELS ----------
     Two legends; who scored more TOTAL senior career goals (club+country)?
     Values include friendlies/national totals where famously claimed. */
  G.CAREER_DUELS = [
    { l: { n: "Pelé",            c: "Brazil",      v: 762 }, r: { n: "Romário",       c: "Brazil",   v: 772 } },
    { l: { n: "Ferenc Puskás",   c: "Hungary",     v: 709 }, r: { n: "Josef Bican",   c: "Austria",  v: 805 } },
    { l: { n: "Cristiano Ronaldo", c: "Portugal",  v: 920 }, r: { n: "Lionel Messi",  c: "Argentina", v: 850 } },
    { l: { n: "Gerd Müller",     c: "Germany",     v: 566 }, r: { n: "Eusébio",       c: "Portugal", v: 565 } },
    { l: { n: "Ferenc Deák",     c: "Hungary",     v: 440 }, r: { n: "Imre Schlosser", c: "Hungary", v: 411 } },
    { l: { n: "Robert Lewandowski", c: "Poland",   v: 620 }, r: { n: "Zlatan Ibrahimović", c: "Sweden", v: 570 } },
    { l: { n: "Raúl",            c: "Spain",       v: 385 }, r: { n: "Thierry Henry", c: "France",   v: 411 } },
    { l: { n: "Wayne Rooney",    c: "England",     v: 366 }, r: { n: "Sergio Agüero", c: "Argentina", v: 420 } },
    { l: { n: "Karim Benzema",   c: "France",      v: 480 }, r: { n: "Edinson Cavani", c: "Uruguay", v: 500 } },
    { l: { n: "Harry Kane",      c: "England",     v: 400 }, r: { n: "Mohamed Salah", c: "Egypt",    v: 350 } },
    { l: { n: "Kylian Mbappé",   c: "France",      v: 360 }, r: { n: "Erling Haaland", c: "Norway",  v: 300 } },
    { l: { n: "Alfredo Di Stéfano", c: "Argentina/Spain", v: 509 }, r: { n: "Eusébio", c: "Portugal", v: 565 } },
  ];

  /* ---------- CATEGORY 3 · SCORELINE BETS ----------
     A famous club is named; bet the TRUE final score of a real iconic match.
     Format: options (2-3), answerIdx, fixtureMeta. */
  G.SCORE_BETS = [
    { team: "FC Barcelona", meta: "CL Final · Berlin 2015",
      options: ["Juventus 1–3 Barcelona", "Juventus 2–3 Barcelona", "Juventus 0–2 Barcelona"], answerIdx: 0 },
    { team: "Manchester City", meta: "CL Final · Porto 2021",
      options: ["City 0–1 Chelsea", "City 1–2 Chelsea", "City 1–0 Chelsea"], answerIdx: 0 },
    { team: "Liverpool", meta: "CL Final · Paris 2022",
      options: ["Liverpool 0–1 Real Madrid", "Liverpool 1–2 Real Madrid", "Liverpool 1–0 Real Madrid"], answerIdx: 0 },
    { team: "Arsenal", meta: "The 49ers' season peak · Sheffield 2003",
      options: ["Arsenal 1–1 Sheff Utd", "Arsenal 2–1 Sheff Utd", "Arsenal 6–3 Sheff Utd"], answerIdx: 1 },
    { team: "Real Madrid", meta: "La Décima · Lisbon 2014",
      options: ["Atlético 1–4 Real (aet)", "Atlético 1–2 Real", "Atlético 1–3 Real"], answerIdx: 2 },
    { team: "Bayern Munich", meta: "CL Final · Wembley 2013",
      options: ["Dortmund 1–2 Bayern", "Dortmund 2–3 Bayern", "Dortmund 1–3 Bayern"], answerIdx: 0 },
    { team: "Manchester United", meta: "CL Final · Moscow 2008",
      options: ["Chelsea 1–1 United (6–7 pens)", "Chelsea 0–1 United", "Chelsea 1–2 United"], answerIdx: 0 },
    { team: "Ajax", meta: "European Cup Final · Turin 1996",
      options: ["Ajax 1–1 Juventus (2–4 pens)", "Ajax 0–1 Juventus", "Ajax 2–1 Juventus"], answerIdx: 0 },
    { team: "West Germany", meta: "World Cup Final · Rome 1990",
      options: ["Argentina 0–1 West Germany", "Argentina 1–2 West Germany", "Argentina 0–2 West Germany"], answerIdx: 0 },
    { team: "Brazil", meta: "World Cup Final · Yokohama 2002",
      options: ["Germany 0–2 Brazil", "Germany 1–2 Brazil", "Germany 0–1 Brazil"], answerIdx: 0 },
  ];

  /* shuffle helper shared by the game */
  G.shuffle = function (arr, rng) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor((rng ? rng() : Math.random()) * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  };
})(window.SL_DATA = {});
