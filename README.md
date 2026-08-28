# Salah — Prayer Times & Qibla

A personal, ad-free prayer times and Qibla direction web app, built to replace a cluttered, ad-heavy app. It's a static web app — no account, no backend, no build step — that uses your phone's GPS to show today's prayer times and point you toward the Qibla.

**Live app:** https://rahimali786.github.io/salah-app/

## Features

- **Today's prayer times** — Fajr, Dhuhr, Asr, Maghrib, Isha, pulled from the [AlAdhan API](https://aladhan.com/prayer-times-api) based on your device's GPS when you tap **Find my location** or **Refresh location**. Location is not stored between sessions except in a local offline cache (see Privacy).
- **Gregorian and Hijri date** — today's civil and Islamic dates shown under the app title.
- **Next-prayer countdown** — highlighted with a live countdown (updates every second) while the app is open and when you return from another app.
- **After Isha** — next prayer shows as tomorrow's Fajr with a **Tomorrow** label, tomorrow's clock time, and a real countdown.
- **Asr school** — Shafi or Hanafi calculation for Asr; saved in the browser (localStorage).
- **Optional Sunrise** — toggle in settings to show Sunrise in today's list (hidden by default).
- **Offline fallback** — if AlAdhan is unreachable, shows the last successfully loaded times with an offline banner.
- **Auto-locate** — if you already granted location permission, opens directly to your times without tapping Find my location again.
- **Place label** — human-readable area from AlAdhan's timezone metadata (e.g. "New York"), with coordinates shown underneath.
- **Pull to refresh** — on the main screen, pull down to refresh location.
- **Qibla compass** — direction calculated on-device; static ring points toward Qibla before live compass is enabled; optional live needle via your phone's sensors.
- **Adjustable calculation method** — ISNA, Muslim World League, Umm al-Qura, Karachi, or Egyptian Authority; saved in localStorage.
- **Home-screen install** — add to your home screen for a full-screen standalone window with app icon (web app manifest).
- **No ads, no analytics, no tracking, no account.** Network calls go to AlAdhan only.

## Setup on your phone

This is a web app, not an app-store app — you open it in your browser and add it to your home screen so it behaves like one.

### iPhone (Safari)

1. Open **https://rahimali786.github.io/salah-app/** in Safari (must be Safari — other iOS browsers can't add home screen icons the same way).
2. Tap **Find my location** and allow location access when prompted (skipped on later opens if permission is already granted).
3. Tap the **Share** icon (square with an arrow, bottom toolbar).
4. Scroll down and tap **Add to Home Screen**, then **Add**.
5. Open it from your home screen going forward — it launches full-screen, without Safari's address bar.
6. To use the live Qibla compass: tap **Enable live compass** and allow motion & orientation access when iOS prompts you.

### Android (Chrome)

1. Open **https://rahimali786.github.io/salah-app/** in Chrome.
2. Tap **Find my location** and allow location access when prompted.
3. Tap the **⋮** menu (top right) → **Add to Home screen** (or **Install app**).
4. Confirm the name and tap **Add**.
5. Open it from your home screen going forward.
6. The live Qibla compass should work automatically once location is granted on most Android devices.

### Notes

- Location access is scoped to this page only. GPS is requested when you tap **Find my location**, **Refresh location**, or pull to refresh — not on every app switch.
- If you added Salah to your home screen before app icons were added, delete the old icon and **Add to Home Screen** once more.
- If the compass needle looks off, move away from metal objects or rotate your phone in a figure-8 to recalibrate.

## How it works

- **Prayer times**: AlAdhan `timings` API with `method` and `school` (Asr) parameters. Re-fetched on a new calendar day, method/school change, or location refresh. After Isha, one extra fetch loads tomorrow's Fajr.
- **Staying current**: next prayer and countdown recompute every second in the hero while visible; on return from another app they update immediately from loaded times.
- **Offline**: last successful day's timings, dates, and coordinates are saved in localStorage; shown when the network or API fails.
- **Place name**: derived from AlAdhan `meta.timezone` (AlAdhan does not offer reverse geocoding).
- **Qibla**: great-circle bearing client-side to the Kaaba (21.4225°N, 39.8262°E).
- **Preferences**: calculation method, Asr school, and Sunrise toggle in localStorage.

## Tech

Plain HTML, CSS, and vanilla JavaScript — `index.html`, `manifest.webmanifest`, and icons in `icons/`. No frameworks, no build tools, no service worker, no backend. Hosted on GitHub Pages.

## Roadmap / ideas

- [x] Hijri (Islamic) date display
- [x] Asr calculation school toggle (Shafi/Hanafi)
- [x] Offline fallback if AlAdhan is unreachable (cache last-known times)
- [ ] Light/dark theme toggle
- [ ] Monthly prayer time calendar view
- [ ] Adjustable notification-style reminders (in-browser, when the tab is open)

Contributions and suggestions welcome — open an issue or a pull request.

## Privacy

No accounts, no analytics, no cookies, no third-party trackers. Your location is used to calculate Qibla on-device and request prayer times from AlAdhan. Coordinates are not kept in memory between sessions except in an optional local offline cache (last successful times + coordinates) so the app can still show prayer times when AlAdhan is unreachable.

## License

Personal project — feel free to fork and adapt for your own use.
