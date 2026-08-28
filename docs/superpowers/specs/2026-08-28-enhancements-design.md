# Salah enhancements (items 1–10) — design spec

## Scope

Ten improvements in one release: Hijri/Gregorian date, Asr school, offline cache, second-level countdown, auto-locate, place label, pull-to-refresh, optional Sunrise row, static Qibla compass ring, refresh loading state. README updated to match.

## API

Single provider remains AlAdhan. `fetchDayData` replaces `fetchTimings` and returns `timings`, `date` (gregorian + hijri), and `meta.timezone`.

Query params: `method`, `school` (0 = Shafi, 1 = Hanafi).

No AlAdhan reverse-geocode endpoint exists. Place label uses humanized `meta.timezone` from the same response (e.g. `America/New_York` → "New York"). Coordinates remain as secondary text in hero footer.

## Preferences (localStorage)

| Key | Default |
|-----|---------|
| `salah-calc-method` | 2 (ISNA) |
| `salah-asr-school` | 0 (Shafi) |
| `salah-show-sunrise` | false |

## Offline cache (`salah-offline-cache`)

JSON: `timingsDate`, `timings`, `dateInfo`, `timezone`, `method`, `school`, `lat`, `lon`, `tomorrowTimings`, `tomorrowDate`, `cachedAt`.

**Roles**

1. **Same-day online reuse** — if cache date is today, method/school match, and GPS is within ~1 km (`|Δlat|` and `|Δlon|` < 0.01), skip AlAdhan and apply the cache (no offline banner).
2. **Offline fallback** — on network failure, load cache and show banner: "Offline — showing saved times from {date}". If cache date ≠ today, still show with same banner (stale).

**Invalidate / refetch** when the calendar date rolls, calculation method or Asr school changes, or location moves past the ~1 km epsilon. After Isha, tomorrow’s timings are fetched once and stored; reused while `tomorrowDate` and prefs/coords still match.

Location in cache is last session coords for offline Qibla/times — documented in README privacy section.

## Countdown

Hero countdown updates every second (`in 4m 32s`). Separate `secondInterval`; paused when tab hidden. Minute interval retained for date rollover and tomorrow fetch.

## Auto-locate

On load, if `navigator.permissions.query('geolocation')` is `granted`, call `locate({ silent: true })` without start-screen tap. On failure, show start card.

## UI

- `date-line` under brand: Gregorian + Hijri from API.
- Settings row: method, Asr school, Sunrise checkbox.
- Optional Sunrise row after Fajr (not in next-prayer logic).
- `offline-banner` above main content when showing cache.
- Pull-to-refresh on main screen (touch, threshold 70px) triggers `locate()`.
- Compass: when live compass off, rotate `#compass-ring` by `-qiblaBearing`; needle at 0°. When live on, ring at 0°, needle rotates.
- Refresh location button shows "Updating…" while locating.

## Out of scope

Service worker, third-party geocoding APIs, notifications, monthly calendar.
