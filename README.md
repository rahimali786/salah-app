# Salah — Prayer Times & Qibla

A personal, ad-free prayer times and Qibla direction web app, built to replace a cluttered, ad-heavy app. It's a single self-contained HTML page — no account, no backend, no build step — that uses your phone's live GPS to show today's prayer times and point you toward the Qibla.

**Live app:** https://rahimali786.github.io/salah-app/

## Features

- **Today's prayer times** — Fajr, Dhuhr, Asr, Maghrib, Isha, pulled fresh from the [AlAdhan API](https://aladhan.com/prayer-times-api) based on your device's current GPS coordinates. Never a saved or guessed location.
- **Next-prayer countdown** — the upcoming prayer is highlighted with a live countdown.
- **Qibla compass** — direction to the Kaaba is calculated locally on your device (great-circle bearing), with an optional live needle driven by your phone's compass/magnetometer.
- **Adjustable calculation method** — defaults to ISNA, switchable to Muslim World League, Umm al-Qura, Karachi, or Egyptian Authority; your choice is remembered for next time.
- **No ads, no analytics, no tracking, no account.** The only network calls are to AlAdhan (for prayer times) — nothing else.

## Setup on your phone

This is a web page, not an app-store app — you open it in your browser and add it to your home screen so it behaves like one.

### iPhone (Safari)

1. Open **https://rahimali786.github.io/salah-app/** in Safari (must be Safari — other iOS browsers can't add home screen icons the same way).
2. Tap **Find my location** and allow location access when prompted.
3. Tap the **Share** icon (square with an arrow, bottom toolbar).
4. Scroll down and tap **Add to Home Screen**, then **Add**.
5. Open it from your home screen going forward — it launches full-screen, without Safari's address bar.
6. To use the live Qibla compass: tap **Enable live compass** and allow motion & orientation access when iOS prompts you (iOS requires this explicit tap-to-allow step).

### Android (Chrome)

1. Open **https://rahimali786.github.io/salah-app/** in Chrome.
2. Tap **Find my location** and allow location access when prompted.
3. Tap the **⋮** menu (top right) → **Add to Home screen** (or **Install app**, depending on your Chrome version).
4. Confirm the name and tap **Add**.
5. Open it from your home screen going forward.
6. The live Qibla compass should work automatically once location is granted — no extra permission step is needed on most Android devices.

### Notes

- Location access is scoped to this page only — it isn't shared with any other site or app, and you can revoke it anytime from your browser's site settings.
- The app needs a live GPS fix each time you open it — it never remembers or reuses a previous location.
- If the compass needle looks off, try moving away from metal objects/magnets, or rotating your phone in a figure-8 to recalibrate the sensor (a common fix for phone compasses generally).

## How it works

- **Prayer times**: fetched from `https://api.aladhan.com/v1/timings/{date}?latitude=...&longitude=...&method=...` using your current coordinates.
- **Qibla bearing**: computed entirely client-side with the great-circle bearing formula, from your coordinates to the Kaaba (21.4225°N, 39.8262°E). No extra API call needed.
- **Live compass**: uses the `deviceorientation` / `deviceorientationabsolute` browser APIs to read your phone's heading and rotate the needle in real time.
- **Preferences**: your chosen calculation method is saved locally so you don't have to reselect it each visit.

## Tech

Plain HTML, CSS, and vanilla JavaScript in a single file — no frameworks, no build tools, no dependencies. Hosted as a static file on GitHub Pages.

## Roadmap / ideas

- [ ] Hijri (Islamic) date display
- [ ] Light/dark theme toggle
- [ ] Monthly prayer time calendar view
- [ ] Adjustable notification-style reminders (in-browser, when the tab is open)
- [ ] Asr calculation school toggle (Shafi/Hanafi)
- [ ] Offline fallback if AlAdhan is unreachable (cache last-known times)

Contributions and suggestions welcome — open an issue or a pull request.

## Privacy

No accounts, no analytics, no cookies, no third-party trackers. Your location is used only to (1) calculate the Qibla bearing on-device and (2) request prayer times from AlAdhan — it is never stored or sent anywhere else.

## License

Personal project — feel free to fork and adapt for your own use.
