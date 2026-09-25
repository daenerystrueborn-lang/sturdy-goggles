# Astral of the Sun — Native Android app (Kotlin + Jetpack Compose)

A pure-native port of the companion app. No HTML, no JS: the UI is declarative
Jetpack Compose and navigation is an in-memory screen switch, so moving between
tabs is an instant recomposition (no reloads, no network).

It mirrors the web app's screens and its **empty-by-design** data layer:

| Screen | Mirrors | Notes |
|--------|---------|-------|
| Home | `index.html` | Profile header, Level/Solars/Gems stats, hero box, Solars/Gems top-up deep-links, shop/roster/dungeons/friends empty states |
| Season | `season.html` | Banner, battle pass (Tier/XP bar, Free/Premium tabs, track), rewards, characters |
| Shop | `shop.html` | Wallet bar, search, category chips, 2-column item grid |
| Top-up | `topup.html` | Manual Solars/Gems top-up, Premium, Server Offers, purchase-request process list |
| Profile | `profile.html` | Banner + overlapping pfp, stats, wallet, inventory/chest/PvP |

## Data layer

`data/AstralData.kt` ships **empty** (no fake names/numbers/images), exactly like
`js/navigator.js` on the web. Wire `Astral.loadData` to your backend and every
screen hydrates.

## Purchase process

`data/TopUp.kt` mirrors `Astral.topup` on the web: every purchase creates a
`PurchaseRequest` (`solars` / `gems` / `premium` / `offer`). With no backend the
request parks at `AwaitingBackend`; assign `Astral.topUp.onRequest` to hand it to
your payment server and drive it to `Fulfilled`/`Failed`. Nothing is charged
on-device.

## Building

This directory is a standard Gradle Android project (AGP 8.2 / Kotlin 1.9 /
Compose BOM 2024.02). Open it in Android Studio, or from `android/`:

```sh
gradle wrapper          # once, to generate the wrapper
./gradlew :app:assembleDebug
```

> **Note:** the project sandbox that hosts this repo has no access to the
> Gradle/Maven/Google artifact servers, so this module **cannot be compiled in
> the sandbox or in the repo's web CI**. Build it locally or in a runner with
> network access. It is intentionally separate from the web app and the
> `build-artifact.yml` workflow, which continue to validate/serve the HTML app.
