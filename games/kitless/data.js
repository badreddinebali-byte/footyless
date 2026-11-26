/* ============================================================
   FOOTYLESS · Kitless data — original abstract kit artwork
   Colour-block jerseys inspired by famous club palettes.
   (Colour schemes and facts are not trademarkable; art is ours.)
   ============================================================ */
(function (K) {
  "use strict";

  /* pattern kinds: stripesV | hoops | half | sash | panel | plain */
  const CLUBS = [
    { id: "barca",     n: "FC Barcelona",      lg: "La Liga",      a: "#A50044", b: "#004D98", pat: "stripesV" },
    { id: "madrid",    n: "Real Madrid",       lg: "La Liga",      a: "#FFFFFF", b: "#FEBE10", pat: "plain"   },
    { id: "utd",       n: "Manchester United", lg: "Premier League", a: "#DA291C", b: "#FFE500", pat: "plain" },
    { id: "liverpool", n: "Liverpool",         lg: "Premier League", a: "#C8102E", b: "#F6EB61", pat: "plain" },
    { id: "arsenal",   n: "Arsenal",           lg: "Premier League", a: "#EF0107", b: "#FFFFFF", pat: "panel" },
    { id: "celtic",    n: "Celtic",            lg: "Scottish Prem",  a: "#018749", b: "#FFFFFF", pat: "hoops" },
    { id: "inter",     n: "Inter Milan",       lg: "Serie A",      a: "#0068A8", b: "#000000", pat: "stripesV" },
    { id: "milan",     n: "AC Milan",          lg: "Serie A",      a: "#FB090B", b: "#000000", pat: "stripesV" },
    { id: "psg",       n: "Paris SG",          lg: "Ligue 1",      a: "#004170", b: "#DA291C", pat: "sash"    },
    { id: "boca",      n: "Boca Juniors",      lg: "Argentina",    a: "#103F79", b: "#FCB514", pat: "hoops"   },
    { id: "river",     n: "River Plate",       lg: "Argentina",    a: "#FFFFFF", b: "#EB0A1E", pat: "sash"    },
    { id: "ajax",      n: "Ajax",              lg: "Eredivisie",   a: "#FFFFFF", b: "#D2122E", pat: "panel"   },
    { id: "juve",      n: "Juventus",          lg: "Serie A",      a: "#FFFFFF", b: "#000000", pat: "stripesV" },
    { id: "bayern",    n: "Bayern München",    lg: "Bundesliga",   a: "#DC052D", b: "#0066B2", pat: "plain"   },
    { id: "chelsea",   n: "Chelsea",           lg: "Premier League", a: "#034694", b: "#DBA111", pat: "plain" },
    { id: "bvb",       n: "Borussia Dortmund", lg: "Bundesliga",   a: "#FDE100", b: "#000000", pat: "hoops"   },
    { id: "newcastle", n: "Newcastle",         lg: "Premier League", a: "#FFFFFF", b: "#241F20", pat: "stripesV" },
    { id: "atleti",    n: "Atlético Madrid",   lg: "La Liga",      a: "#CB3524", b: "#FFFFFF", pat: "stripesV" },
    { id: "benfica",   n: "Benfica",           lg: "Primeira Liga", a: "#E00319", b: "#FFFFFF", pat: "plain"  },
    { id: "galata",    n: "Galatasaray",       lg: "Süper Lig",    a: "#FDB912", b: "#A90432", pat: "half"    },
  ];

  /* shirt silhouette 200×220 viewBox */
  const SHIRT_PATH = "M60 18 L86 6 C100 16 100 16 100 16 C100 16 100 16 114 6 L140 18 L172 44 L150 74 L138 62 L138 200 L62 200 L62 62 L50 74 L28 44 Z";

  let UID = 0;
  function kitSVG(club) {
    const { a, b, pat } = club;
    const id = "kt" + (++UID);
    let inner = "";
    switch (pat) {
      case "stripesV":
        inner = `<g fill="${b}">${[0,1,2,3,4].map(i=>`<rect x="${44+i*26}" y="0" width="13" height="220"/>`).join("")}</g>`;
        break;
      case "hoops":
        inner = `<g fill="${b}">${[0,1,2,3,4].map(i=>`<rect x="0" y="${18+i*40}" width="200" height="20"/>`).join("")}</g>`;
        break;
      case "half":
        inner = `<rect x="100" y="0" width="100" height="220" fill="${b}"/>`;
        break;
      case "sash":
        inner = `<path d="M-20 190 L180 8 L204 40 L4 222 Z" fill="${b}"/>`;
        break;
      case "panel":
        inner = `<rect x="76" y="0" width="48" height="220" fill="${b}"/>`;
        break;
      default: /* plain: secondary collar+cuff accents */
        inner = `<rect x="86" y="4" width="28" height="14" fill="${b}"/>
                 <rect x="26" y="32" width="36" height="12" fill="${b}" transform="rotate(35 44 38)"/>
                 <rect x="138" y="32" width="36" height="12" fill="${b}" transform="rotate(-35 156 38)"/>`;
    }
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 220">
      <defs><clipPath id="${id}"><path d="${SHIRT_PATH}"/></clipPath></defs>
      <path d="${SHIRT_PATH}" fill="${a}"/>
      <g clip-path="url(#${id})">${inner}</g>
      <path d="${SHIRT_PATH}" fill="none" stroke="rgba(0,0,0,.28)" stroke-width="4"/>
    </svg>`;
  }

  K.CLUBS = CLUBS;
  K.kitSVG = kitSVG;
  K.SHIRT_PATH = SHIRT_PATH;
})(window.KT_DATA = {});
