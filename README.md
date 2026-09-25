# Astral of the Sun

A data-driven companion app — plain HTML/CSS/JS, no framework or build step, so it runs cleanly in GitHub Actions and on any static host.

## Pages

| Page | File | What's on it |
|------|------|--------------|
| Home | `index.html` | Profile header, stats (Level · Solars · Gems), hero banner, quick actions, shop highlights, Pokémon roster, dungeons, friends, top-up |
| Season | `season.html` | Large season banner **→** battle pass (Free/Premium tracks + XP bar) **→** reward strip **→** season characters |
| Shop | `shop.html` | Total currency bar (Solars + Gems) at top, search + category filters, item grid |
| Profile | `profile.html` | Banner **→** profile picture overlapping it **→** player stats **→** wallet **→** inventory (button opens the inventory/chest overlay with **drag & drop**) |

## Structure

```
index.html / season.html / shop.html / profile.html     Pages
css/styles.css                                           All styling (Poppins + Montserrat)
js/navigator.js                                          Shared shell: fonts, nav, starfield, empty data layer
js/app.js / js/season.js / js/shop.js / js/profile.js   Per-page renderers
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

### Inventory drag & drop

On the Profile page, **Open Inventory & Chest** opens a full-screen overlay.
Items can be dragged between the **inventory bag**, the **chest**, and the
**PvP loadout** (HTML5 drag events — verified working in headless Chrome).
State lives in `Astral.data.inventory/vault/pvp`; hook the moves to your
backend by reacting to those arrays.

## Local preview

Any static server works:

```sh
npx serve .          # or
python3 -m http.server 8000
```

## Build / artifact

Push to `main` (or any `arena/**` branch) and GitHub Actions will:
1. Validate every HTML page, and
2. Upload the app as a build artifact (`astral-of-the-sun`).
