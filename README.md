# ⚽ Goalless

A football-knowledge daily puzzle hub — our take on the crisp "dark game hub" format
(inspired by sites like lessgames.com; all code, art and sounds here are original).

Built with **zero dependencies**: plain HTML + CSS + vanilla JS. No build step, no npm.
Deploy by dragging the folder to Netlify / GitHub Pages / Vercel.

---

## Run it

Option 1 — just open `index.html` in a browser.

Option 2 — serve locally (nicer URLs, no quirks):

```bash
npx serve goalless
# or
python -m http.server 8000 --directory goalless
```

---

## What's inside

```
goalless/
├─ index.html            Home: header, game card grid, daily countdown
├─ stats.html            Local stats dashboard
├─ css/base.css          Design system (tokens, components, animations, themes)
├─ js/core.js            Engine: settings·storage·WebAudio SFX·modals·toasts·confetti·daily RNG
├─ js/shell.js           Injects header/drawer/footer on every page + card art + game registry
├─ js/home.js            Grid builder + countdown wiring
├─ js/stats.js           Aggregates localStorage results
├─ js/stub.js            Renders "in the making" panels for unwritten games
└─ games/
   ├─ capless/           ★ PLAYABLE demo duel (sample data)
   ├─ scoreless/         stub
   ├─ kitless/           stub
   ├─ groundless/        stub
   ├─ statless/          stub
   └─ legendless/        stub
```

### Systems already wired (shared by every future game)

- **Design tokens** — dark/light themes, colour-blind palette remap, reduced-motion.
- **Sound engine** — procedural WebAudio: taps, reveals, correct/wrong stings, drum,
  win fanfare, ambient stand-rumble music toggle. Mute-safe, lazy-initialised.
- **Daily infrastructure** — `GL.dailyRng(slug)` seeded by UTC date (everyone worldwide
  gets the same puzzle), midnight countdown, `played today` badges, result recorder
  (`GL.recordResult`), streak/win-rate aggregation.
- **Shared chrome** — sticky header, slide-in drawer, preferences modal, toast stack,
  accessible modals with focus handling, confetti bursts, haptics on mobile.
- **Card grid** — responsive 1/2/3 columns, corner SVG art, hover physics,
  TODAY ✓ badges.

### Making the next game

1. Duplicate `games/capless/` (smallest full loop: board → choice → reveal → results
   modal → share text → stats saved).
2. Register metadata in `Shell.GAMES` (title, tagline, art key) inside `js/shell.js`.
3. Build the board UI — slots/inputs/grids you might reuse are already styled
   (`.slot`, `.duel-*`, `.round-track`, `.choice-bar`).
4. Fire the lifecycle: `GL.sfx.*` at moments, `GL.recordResult(slug,{won,score})` at the
   end, `GL.openModal` for results, `GL.confetti()` on celebration.

Rename the site: change the wordmark string + `<title>` in each HTML file
(search for `GOALESS` / `Goalless`).

---

## Roadmap brainstorm (games we could add next)

- **Scoreless** — higher/lower: "did this striker bag more goals?"
- **Kitless** — recognise the club from a stripe pattern alone.
- **Groundless** — progressive clues (capacity → city → stand nickname).
- **Statless** — "which of these two absurd records is real?"
- **Legendless** — chain the career: club → next club → era.
- Extras worth discussing: timed knockout mode, weekly "cup weekend" specials,
  head-to-head links, share-image cards.

Tell me which games to build first and we wire them into the shell above. 🥁
