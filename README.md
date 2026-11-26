# ⚽ FOOTYLESS

Daily football-knowledge puzzles — footyless.com. Dark, fast, quadrilingual
(EN/FR/ES/AR + RTL), zero build step, zero backend.

**Games (V1):** Capless (caps duel) · Scoreless (mixed goals deck) · Kitless
(pixel-deblur shirts) · **Missing XI** (name the legendary XI via mini-wordles).
Later slate: Groundless · Statless · Legendless.

## Run locally

```powershell
powershell -ExecutionPolicy Bypass -File serve.ps1 8123
# → http://127.0.0.1:8123
```

(or any static server; `index.html` even works from file:// with graceful fallbacks)

## Systems

- **i18n** (`js/i18n.js`): 4 dictionaries, RTL flip, `data-i18n` binding, language in Preferences.
- **Audio**: Howler.js + 13 synthesized WAVs (`tools/gen-audio.cjs`), event taxonomy, synth fallback.
- **Daily engine**: UTC-seeded puzzles, countdown, played-today badges, localStorage stats + histogram.
- **Supporter pass**: Stripe-payment-link ready, `?supporter=CODE` auto-redeem, local device token (V2: accounts).
- **Freshness Pipeline**: `tools/bake-data.cjs` (Wikidata CC0 SPARQL + EntityData) → `data/players.json`,
  quality-gated adoption via `js/packs.js`; weekly re-bake by `.github/workflows/freshness.yml`.

## Deploy (footyless.com)

1. Create GitHub repo `footyless`, push this folder (`git remote add origin …; git push -u origin main`).
2. Repo → Settings → Pages → Deploy from branch: `main` / root.
3. Cloudflare: add site `footyless.com` (nameservers to Cloudflare), CNAME `@ → <user>.github.io`,
   CNAME `www → <user>.github.io`, proxy ON, SSL Full.
4. `CNAME` file is already in the repo, so Pages binds the custom domain automatically.
5. Paste your Stripe Payment Links into `js/shell.js → STRIPE = { month, year }`.

## Roadmap
M7 deploy → Stripe live keys → Groundless/Statless/Legendless → accounts & leaderboards (Supabase) →
custom-puzzle creator (subscriber perk).

---
*All code, art, and audio original. Facts via Wikidata (CC0). Not affiliated with any league.*
