# Astral of the Sun

A data-driven companion home screen — plain HTML/CSS/JS, no framework or build step, so it runs cleanly in GitHub Actions and on any static host.

## Structure

```
index.html                 App shell + empty templates
css/styles.css             All styling (self-contained, system fonts)
js/app.js                  Data layer + renderer + UI behaviours
assets/                    Reserved for real images / assets (empty)
.github/workflows/         Build + upload-artifact workflow
```

## Data

The app ships **empty** on purpose — no fake names, numbers or images.
All values live in the `state` object at the top of `js/app.js`.
Wire `loadState()` to your backend (fetch/WebSocket/…) and it will
hydrate every slot automatically.

| Key | Shape | Renders into |
|-----|-------|--------------|
| `player` | `{ name, sub, avatar }` | Profile header |
| `banner` | string URL | Hero box |
| `stats` | `{ level, solars, gems }` | Stats row (coin icon sits beside Solars) |
| `shop` | `[{ name, desc, price, image }]` | Shop grid (coin icon beside prices) |
| `roster` | `[{ name, meta, cp, image }]` | Pokémon roster |
| `dungeons` | `[{ name, sub, diff }]` | Dungeons list |
| `friends` | `[{ name, avatar }]` | Friends row |
| `notifications` | `[{ title, sub }]` | Notification dropdown |

> The Top-up section is static UI (buttons for the backend to wire up when needed).

## Local preview

Any static server works:

```sh
npx serve .          # or
python3 -m http.server 8000
```

## Build / artifact

Push to `main` (or any `arena/**` branch) and GitHub Actions will:
1. Validate the HTML, and
2. Upload the app as a build artifact (`astral-of-the-sun`).
