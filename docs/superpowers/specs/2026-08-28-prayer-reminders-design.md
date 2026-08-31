# Prayer reminders + Adhan (Hybrid Plan B)

## Scope

Service-worker-based local notifications at exact prayer time for all five prayers. Separate "Play Adhan sound" toggle (default on). No backend.

## Scheduling

- After successful times fetch, page sends `SCHEDULE` to SW with today's five `fireAt` timestamps (ms) — all five prayers.
- SW stores in IndexedDB and sets `setTimeout` per alarm (backup: 60s poll). Resync preserves `fired` flags so already-notified prayers are not repeated.
- **Android (Chrome):** when `TimestampTrigger` is supported, future prayers are OS-scheduled via `showTrigger` (timer fallback remains).
- Past prayers on **first** schedule (no prior unfired row) are silently marked `fired` — no notification burst when enabling mid-day.
- Miss recovery: `CHECK_NOW` on app wake only (not full reschedule); 15-minute catch-up grace for notifications.
- Single-flight guard prevents duplicate `showNotification` for the same alarm id.
- Full reschedule (`SCHEDULE`) on: new day, location/method/school change, reminder toggle, times load.
- App wake: `CHECK_NOW` only (800ms debounce, 2s cooldown).
- After Isha: `SCHEDULE` with `merge: true` adds tomorrow's five prayers to IndexedDB (and triggers when supported).

## Adhan (hybrid)

- Bundled `assets/adhan.mp3` (same-origin).
- On alarm: `showNotification` with optional **Play Adhan** action.
- If Play Adhan on: `postMessage` to visible clients + in-app banner ("Tap to hear Adhan").
- iOS: unlock audio on enable reminders (user gesture); tap notification action or banner for reliable playback.
- App fully closed: system notification sound; full adhan after tap.

## UI

- Reminder status: permission state, next reminder time, test notification button.
- Platform note: locked-phone limits on iOS vs Android.

## Preferences (localStorage)

- `salah-reminders-enabled`
- `salah-play-adhan` (default true)

## Platform limits (documented)

- iPhone locked + app closed: exact-time alerts unreliable without Web Push or native app.
- Full adhan MP3 on iOS usually requires tapping the notification or in-app banner.

## Files

- `sw.js` — alarms, triggers, notifications, client messaging
- `index.html` — UI, registration, schedule on load
- `assets/adhan.mp3`
