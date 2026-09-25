# Astral of the Sun

A data-driven companion app — plain HTML/CSS/JS, no framework or build step, so it runs cleanly in GitHub Actions and on any static host.

## Pages

| Page | File | What's on it |
|------|------|--------------|
| Home | `index.html` | Profile header, stats (Level · Solars · Gems), hero banner, quick actions, shop highlights, Pokémon roster, dungeons, friends, top-up |
| Season | `season.html` | Large season banner **→** battle pass (Free/Premium tracks + XP bar) **→** reward strip **→** season characters |
| Shop | `shop.html` | Total currency bar (Solars + Gems) at top, search + category filters, item grid |
| Profile | `profile.html` | Banner **→** profile picture overlapping it **→** player stats **→** wallet **→** inventory (button opens the inventory/chest overlay with **drag & drop**) |
| Top-up | `topup.html` | Solars/Gems top-up (manual amount + backend packages), Premium purchase, **Server Offers**, and the purchase-request process list. Home's "Solars Top-up" / "Gems Top-up" buttons deep-link here with the currency preselected |

## Structure

```
index.html / season.html / shop.html / profile.html     Pages
topup.html                                               Top-up / Premium / server offers page
css/styles.css                                           All styling + @font-face (self-hosted Poppins & Montserrat)
js/navigator.js                                          Shared shell: fonts, nav, starfield, empty data layer, SPA router
js/app.js / js/season.js / js/shop.js / js/profile.js   Per-page renderers
js/topup.js                                              Top-up renderer + purchase-request process
serve.py                                                 Dev server with no-cache headers for the live preview
assets/fonts/                                            Poppins & Montserrat woff2 (bundled — no CDN needed)
assets/                                                  Reserved for real images / assets (empty)
.github/workflows/                                       Build + upload-artifact workflow
```

## Data

The app ships **empty** on purpose — no fake names, numbers or images.
All values live in the `Astral.data` object in `js/navigator.js`.
Wire `Astral.loadData()` to your backend (fetch/WebSocket/…) and it will
hydrate every slot automatically.

| Key | Shape | Renders into |
|-----|-------|--------------|
| `player` | `{ name, sub, avatar }` | Profile header / profile page |
| `banner` | string URL | Home hero box |
| `stats` | `{ level, solars, gems }` | Home stats row + profile stats |
| `wallet` | `{ solars, gems }` | Shop total + profile wallet (coins sit beside each) |
| `shop` | `[{ name, desc, price, image, category }]` | Shop grid (coin beside prices) |
| `season` | `{ banner, title, duration, tierIndex, tierCount, xpCurrent, xpNeeded, rewards[], characters[], tiers[] }` | Season page |
| `inventory` | `[{ id, name, image }]` | Inventory bag |
| `vault` | `[{ id, name, image }]` | Chest |
| `pvp` | `[{ id, name, image }]` | PvP loadout |
| `notifications` | `[{ title, sub }]` | Notification dropdown |
| `topup` | `{ solars[], gems[], premium[], offers[] }` | Top-up page: Solars/Gems packages, Premium packs, server offers (all empty until a backend fills them) |

### Top-up & purchase process

On the Top-up page every purchase (manual Solars/Gems top-up, Premium, package,
server-offer claim) creates a **request** via `Astral.topup.create(kind, payload)`.
Requests show up in "Your requests" with a live status (`created → processing →
fulfilled / failed`, or `awaiting backend` when nothing is wired). Hook your
payment backend by assigning `Astral.topup.onRequest = (req) => Promise<{ ok, reason? }>`
— the page never charges anything itself and ships with no fake prices or packs.

### Fast page switching

`js/navigator.js` includes a tiny client-side router: each page's `<main>` is
fetched once (prefetched on idle), swapped in place, and the per-page script is
loaded only on first visit — so switching tabs doesn't reload fonts, styles or
the starfield. `pushState` keeps URLs shareable and the back button working;
every page still renders standalone when opened directly.

### Inventory drag & drop

On the Profile page, **Open Inventory & Chest** opens a full-screen overlay.
Items can be dragged between the **inventory bag**, the **chest**, and the
**PvP loadout** (HTML5 drag events — verified working in headless Chrome).
State lives in `Astral.data.inventory/vault/pvp`; hook the moves to your
backend by reacting to those arrays.

## Native app (Kotlin)

A pure-native Android port (Kotlin + Jetpack Compose, no HTML/JS) lives in
[`android/`](android/README.md). It mirrors all five screens with in-memory
navigation and the same empty-by-design data layer and purchase process.
It builds with Gradle/Android Studio — not in the web CI or this sandbox.

## Local preview

Any static server works:

```sh
npx serve .          # or
python3 -m http.server 8000
python3 serve.py     # same, but no-cache headers (live-preview dev server)
```

## Build / artifact

Push to `main` (or any `arena/**` branch) and GitHub Actions will:
1. Validate every HTML page, and
2. Upload the app as a build artifact (`astral-of-the-sun`).
