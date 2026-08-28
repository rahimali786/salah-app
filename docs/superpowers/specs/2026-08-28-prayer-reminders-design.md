# Prayer reminders + Adhan (Hybrid Plan B)

## Scope

Service-worker-based local notifications at exact prayer time for all five prayers. Separate "Play Adhan sound" toggle (default on). No backend.

## Scheduling

- After successful times fetch, page sends `SCHEDULE` to SW with today's five `fireAt` timestamps (ms) — all five prayers, including those already passed today (for missed-alarm recovery).
- SW stores in IndexedDB and sets `setTimeout` per alarm (backup: 60s poll). Resync preserves `fired` flags so already-notified prayers are not repeated.
- Re-schedule on: new day, location/method/school change, reminder toggle, app wake (`syncRemindersToSW` + `CHECK_NOW`).

## Adhan (hybrid)

- Bundled `assets/adhan.mp3` (same-origin).
- On alarm: `showNotification` always.
- If Play Adhan on: `postMessage` visible clients → `Audio` plays adhan.
- App fully closed: notification uses system sound; full adhan when user opens Salah from notification.
- UI note: best on home screen; iOS less reliable than native apps.

## Preferences (localStorage)

- `salah-reminders-enabled`
- `salah-play-adhan` (default true)

## Files

- `sw.js` — alarms, notifications, client messaging
- `index.html` — UI, registration, schedule on load
- `assets/adhan.mp3`
