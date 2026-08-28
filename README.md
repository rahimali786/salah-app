# Salah — Prayer Times & Qibla

A personal, ad-free prayer times and Qibla direction web app, built to replace a cluttered, ad-heavy app. It's a static web app — no account, no backend, no build step — that uses your phone's GPS to show today's prayer times and point you toward the Qibla.

**Live app:** https://rahimali786.github.io/salah-app/

## Features

- **Today's prayer times** — Fajr, Dhuhr, Asr, Maghrib, Isha, pulled from the [AlAdhan API](https://aladhan.com/prayer-times-api) when you tap **Find my location** or **Refresh location**. Location is not stored between sessions except in a local offline cache (see Privacy).
- **Gregorian and Hijri date** — today's civil and Islamic dates under the app title.
- **Next-prayer countdown** — live countdown (every second) while open and when you return from another app.
- **After Isha** — tomorrow's Fajr with a **Tomorrow** label and real countdown.
- **Asr school** — Shafi or Hanafi; saved in localStorage.
- **Optional Sunrise** — toggle to show Sunrise in today's list.
- **Offline fallback** — last loaded times if AlAdhan is unreachable; same-day cache also skips repeat AlAdhan calls when date, method, Asr school, and location (~1 km) are unchanged.
- **Auto-locate** — opens directly if location permission was already granted.
- **Place label** — area from AlAdhan timezone metadata, with coordinates underneath.
- **Pull to refresh** — pull down on the main screen to refresh location.
- **Prayer reminders** — optional notifications at each prayer time (enable in the app; works best from the home screen).
- **Adhan sound** — optional toggle (**Play Adhan sound**, on by default) plays a real Fajr adhan recording when a reminder fires.
- **Qibla compass** — on-device bearing; static ring or live needle.
- **Calculation method** — ISNA, MWL, Umm al-Qura, Karachi, Egyptian; saved in localStorage.
- **Home-screen install** — web app manifest for standalone mode and icon.
- **No ads, no analytics, no tracking, no account.** Network calls go to AlAdhan only.

## Setup on your phone

1. Open **https://rahimali786.github.io/salah-app/** in Safari (iOS) or Chrome (Android).
2. Tap **Find my location** and allow location when prompted.
3. **Add to Home Screen** (see below) — important for reminders and full-screen use.
4. Open Salah from your home screen going forward.

### Add to Home Screen

**iPhone (Safari):** Share → **Add to Home Screen** → **Add**.

**Android (Chrome):** Menu (⋮) → **Add to Home screen** or **Install app**.

If you added Salah before app icons were added, delete the old icon and add it again once.

### Prayer reminders & Adhan sound

After your prayer times are loaded:

1. Scroll to the **Prayer reminders** section (below the Qibla compass).
2. Tap **Enable prayer reminders**.
3. When your phone asks, allow **notifications** for Salah.
4. Leave **Play Adhan sound** checked (on by default) to hear the adhan when a reminder fires.

**What you get**

- A notification at **Fajr, Dhuhr, Asr, Maghrib, and Isha** (exact prayer time, all five).
- With **Play Adhan sound** on: the adhan plays when Salah is open; if the app was closed, tap the notification to open Salah and hear the adhan.
- To turn reminders off: tap **Turn off reminders** in the same section.
- To get notifications only (no adhan audio): uncheck **Play Adhan sound**.

Reminders are scheduled from today's loaded times and update when you refresh location, change calculation method or Asr school, or when the calendar day changes.

### iPhone notes

- Use **Add to Home Screen** and allow notifications when prompted.
- Reminders work best from the home-screen icon, not a regular Safari tab.
- iOS may be less reliable than native prayer apps for background notifications; adhan may not play until you open Salah from the notification.

### Android notes

- Install from Chrome (**Add to Home screen** / **Install app**) for background notifications.
- Allow notifications when you tap **Enable prayer reminders**.

## How it works

- **Prayer times**: AlAdhan API with `method` and `school` parameters.
- **Reminders**: a service worker (`sw.js`) schedules today's five prayers in IndexedDB and shows a notification at each time. Adhan audio plays via the open app; closed app gets the system notification sound until you tap to open.
- **Offline**: last successful times (and optional tomorrow Fajr) in localStorage — reused same day to avoid repeat AlAdhan calls until date, prefs, or ~1 km location change; also used when the API is unreachable.
- **Preferences**: calculation method, Asr school, Sunrise, **Enable prayer reminders**, and **Play Adhan sound** — saved in localStorage.

## Tech

Plain HTML, CSS, and vanilla JavaScript — `index.html`, `sw.js`, `manifest.webmanifest`, `icons/` (Kaaba in compass ring; source `icons/icon.svg`), `assets/adhan.mp3`. No frameworks, no build step. GitHub Pages.

## Roadmap / ideas

- [x] Hijri date, Asr school, offline cache, prayer reminders, real adhan audio
- [ ] Light/dark theme toggle
- [ ] Monthly prayer time calendar view

## Privacy

No accounts or third-party trackers. Location is used for Qibla and AlAdhan requests. Last times, coordinates, and reminder schedules are stored locally (localStorage + IndexedDB in the service worker) for offline use and prayer notifications only.

## License

Personal project — feel free to fork and adapt for your own use.
