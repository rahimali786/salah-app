# Salah — Prayer Times & Qibla

A personal, ad-free prayer times and Qibla direction web app, built to replace a cluttered, ad-heavy app. It's a static web app — no account, no backend, no build step — that uses your phone's GPS to show today's prayer times and point you toward the Qibla.

**Live app:** https://rahimali786.github.io/salah-app/

## Features

- **Today's prayer times** — Fajr, Dhuhr, Asr, Maghrib, Isha, pulled from the [AlAdhan API](https://aladhan.com/prayer-times-api) based on your device's GPS when you tap **Find my location** or **Refresh location**. Location is never stored.
- **Next-prayer countdown** — the upcoming prayer is highlighted with a live countdown that updates every minute while the app is open and when you return from another app.
- **After Isha** — next prayer shows as tomorrow's Fajr with a **Tomorrow** label, tomorrow's clock time, and a real countdown (one extra AlAdhan fetch for the next calendar day).
- **Qibla compass** — direction to the Kaaba is calculated locally on your device (great-circle bearing), with an optional live needle driven by your phone's compass/magnetometer.
- **Adjustable calculation method** — defaults to ISNA, switchable to Muslim World League, Umm al-Qura, Karachi, or Egyptian Authority; your choice is saved in the browser (localStorage), not an account.
- **Home-screen install** — add to your home screen for a full-screen standalone window with app icon (via web app manifest).
- **No ads, no analytics, no tracking, no account.** Network calls go to AlAdhan only (for prayer times).

## Setup on your phone

This is a web app, not an app-store app — you open it in your browser and add it to your home screen so it behaves like one.

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
- GPS is requested when you tap **Find my location** or **Refresh location**, not every time you switch back to the app. Your coordinates are not saved between sessions.
- If you added Salah to your home screen before the app icon was added, delete the old icon and **Add to Home Screen** once more to pick up the new icon and standalone window.
- If the compass needle looks off, try moving away from metal objects/magnets, or rotating your phone in a figure-8 to recalibrate the sensor (a common fix for phone compasses generally).

## How it works

- **Prayer times**: fetched from `https://api.aladhan.com/v1/timings/{date}?latitude=...&longitude=...&method=...` when you first load times, when the calendar day changes, or when you change calculation method or refresh location. After Isha, one additional fetch loads tomorrow's Fajr time.
- **Staying current**: while the app is open, next prayer and countdown recompute every minute. When you return from another app or unlock your phone, they update immediately from the times already loaded — no loading spinner unless the calendar day has changed.
- **Qibla bearing**: computed entirely client-side with the great-circle bearing formula, from your coordinates to the Kaaba (21.4225°N, 39.8262°E). No extra API call needed.
- **Live compass**: uses the `deviceorientation` / `deviceorientationabsolute` browser APIs to read your phone's heading and rotate the needle in real time.
- **Preferences**: your chosen calculation method is saved in the browser (localStorage) so you don't have to reselect it each visit.

## Tech

Plain HTML, CSS, and vanilla JavaScript — `index.html`, `manifest.webmanifest`, and icons in `icons/`. No frameworks, no build tools, no service worker, no backend. Hosted as static files on GitHub Pages.

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
