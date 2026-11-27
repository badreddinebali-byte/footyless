# More/Less board cleanup: remove scuffed bottom elements, ship Option-1 wrong sound, sweep dead UI code

Written against: goalless repo commit 8161b18

## Evidence chain

- Surface: `games/moreless/index.html` rendered board (`#duel-app`), bottom region beneath `.round-track`
- Problem: Two user-reported defects at the board's bottom edge:
  1. A leftover "How to play"-associated visual remainder and detached bottom area reads as broken ("scuffed"). The on-page How-to button was removed from `boardHTML()` (games/moreless/game.js, `boardHTML()` now ends at `.round-track`), but the page can still surface stale `.dp-howto` styling context and an orphaned sub-section; the drawer still deep-links to `#howto` although nothing consumes that hash.
  2. Wrong-answer sound perceived as annoying; user auditioned four candidates from the Kenney CC0 interface pack and selected Option 1 (`minimize_001.wav`, soft downward pop, 0.27s). The promoted file already matches Option 1 byte-for-byte (hash-verified, 24,014 bytes) but is not yet committed/deployed.
- Design evidence: lessgames More/less parity contract (accepted blueprint: board bottom terminates at the progress dots; no secondary control row). Kenney Interface Sounds pack (`assets/audio/ui/LICENSE-kenney.txt`, CC0). User's audition selection (Option 1) is direct user evidence and overrides heuristic sample choice.
- Owner: `games/moreless/game.js` (board markup, how-to modal), `css/base.css` (`.dp-howto` rules, shell bottom padding), `js/shell.js` (drawer sublink `#howto` target), `assets/audio/ui/wrong.wav` (binary, already correct).
- Scope and affected surfaces: More/Less game page; drawer shortcuts (How-to sublink behavior); shared `.dp-howto` CSS (only consumer is More/Less).
- Uncertainty: Whether the "scuffed text" the user sees is the browser-held old build (cache) or a rendered remnant. The plan clears both possibilities simultaneously (markup already clean + cache-bust + orphan-rule removal). If after deploy the bottom still shows foreign text, stop and capture a screenshot.

## Design decision

Terminate the More/Less board at the progress dots with matching symmetric spacing, remove every dead artifact of the withdrawn on-page How-to button (markup refs, orphan CSS rules, `#howto` deep-link target), keep the How-to modal reachable solely from the drawer's "How to play" sublink (wire it to open the existing modal via a documented hash listener instead of a dead anchor), and finalize the user-selected Option-1 wrong-answer sound at reduced volume (0.5) so the negative cue stays gentle.

## Reuse

- `.round-track` bottom spacing rhythm: `css/base.css` (`.ml-shell .round-track { margin: 16px 0 6px; }`)
- How-to modal: existing `openHowTo()` in `games/moreless/game.js` (kept; entry point moves to hash `#howto`)
- Kenney sample: `assets/audio/ui/wrong-a.wav`… candidates already extracted; final binary is Option 1 (minimize_001)
- Exemplar: `games/moreless/game.js` `boardHTML()` (post-cleanup shape is the canonical board ending)

No new primitive is required; all changes reuse existing owners.

## Changes

1. `games/moreless/game.js`
   - Change: Add a hashchange/load listener: when `location.hash === '#howto'`, call `openHowTo()` and clear the hash. Delete nothing else; `openHowTo` remains the modal factory (its text stays intact).
   - Preserve: Existing tap-pick choreography, verdict flow, splash transitions.
   - Verify: Visiting `games/moreless/index.html#howto` opens the How-to modal; visiting without the hash never shows a How-to button or bottom text row.

2. `css/base.css`
   - Change: Delete orphaned `.dp-howto` rules (~lines 959–971) and the `.ml-shell { align-items: center; }` compensator pair that fights `#duel-app` width (keep `#duel-app { width: 100%; }`). Adjust `.ml-shell` bottom padding from `30px` to `22px` and `.ml-shell .round-track` bottom margin from `6px` to `0` so the board ends evenly after the dots.
   - Preserve: All live selectors (.dp-card, .dp-plate, .dp-orcoin, .ht-* modal styles — modal remains used via drawer link).
   - Verify: Rendered board bottom shows symmetric padding under the dots; no orphan class remains (grep `dp-howto` returns 0).

3. `js/shell.js`
   - Change: Point the drawer's "How to play" sublink for every game at `…index.html#howto` (already does for all four) AND — for More/Less only is acceptable, but prefer uniformly — document that target pages own the hash behavior. No markup change required; verify only.
   - Preserve: Play sublink behavior.
   - Verify: Drawer → MORE/LESS → How to play opens the game with modal visible.

4. `assets/audio/ui/wrong.wav`
   - Change: Commit the already-promoted Option-1 binary (minimize_001, 24,014 bytes) and remove `_listen/` audition folder plus `_audition.html` from the working tree (moving audition page out of deploy scope).
   - Preserve: Kenney LICENSE file inside `assets/audio/ui/`.
   - Verify: `wrong.wav` hash equals `_listen/option1-minimize.wav`; site purge serves the new file.

5. `games/moreless/game.js` (audio wiring)
   - Change: In the Howl initialization map (`js/core.js` LIB), set the `wrong` entry's volume to 0.5 (currently 0.7) so the negative cue sits under the positive one.
   - Preserve: All other volumes.
   - Verify: Losing a round plays the soft pop audibly quieter than the correct sting.

6. Root-level caches
   - Change: Bump every HTML `?v=` param to `2026112705` (css/base.css, game.js, i18n.js, shell.js, packs.js, core.js) so Cloudflare + browsers drop stale audio/markup.
   - Preserve: Param scheme (single global version constant per release).
   - Verify: Served HTML contains `v=2026112705`; served `wrong.wav` is 24,014 bytes.

## Scope

- Inherit: More/Less page (all changes), drawer How-to links (behavioral verify), shared audio engine volume map.
- Verify: Scoreless/Kitless/Missing XI pages (share `.dp-howto`-free CSS state and audio volumes — must not regress).
- Exclude: Kitless, Missing XI, Scoreless game logic; home page; data packs; supporter/paywall systems.

## Validation

- Product: Lose one round deliberately → soft single "pop" at reduced volume, no digit-roll ticking; win one round → correct sting louder than wrong cue.
- Interface: More/Less at 1000px and 390px widths — board ends at progress dots with even spacing; no button/text row under dots; drawer → How to play opens modal; direct `#howto` URL opens modal.
- System: `grep -r "dp-howto"` returns only history-free results (0 in css/base.css); audition artifacts absent from deploy tree.
- Repository: `git grep -n "dp-howto"` → no matches after change; `git status` shows `wrong.wav` modified, `_audition.html`/`_listen/` deleted.

## Stop conditions

- Stop if the user reports the "scuffed text" persisting after this deploy — then capture a full-page screenshot and treat the remnant as an unknown renderer (possible stale Cloudflare edge purge needed).
- Stop if drawer How-to links for other games (Scoreless/Kitless/Missing XI) 404 on `#howto` — those games lack hash listeners; either add per-game listeners or scope the link to More/Less only.

## Design documentation

- After acceptance and validation: Record in README ("Systems → Audio"): wrong-answer cue = Kenney `minimize_001` at 0.5 volume, chosen by user audition; More/Less board bottom terminates at progress dots (no on-page How-to button; modal via `#howto` hash or drawer).
