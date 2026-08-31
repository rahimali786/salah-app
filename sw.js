const DB_NAME = 'salah-reminders';
const DB_VERSION = 1;
const STORE = 'alarms';
const CHECK_MS = 60000;
const CATCHUP_MS = 15 * 60 * 1000;

let checkInterval = null;
const pendingTimeouts = [];
const firingIds = new Set();

function todayDateString() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function tomorrowDateString() {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function getAlarmDate(id) {
  const parts = String(id).split('-');
  if (parts.length < 4) return null;
  return parts.slice(0, 3).join('-');
}

function isActiveAlarmDate(alarmDate) {
  if (!alarmDate) return true;
  return alarmDate === todayDateString() || alarmDate === tomorrowDateString();
}

function supportsTimestampTriggers() {
  return typeof TimestampTrigger !== 'undefined';
}

function openDb() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onerror = () => reject(req.error);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE)) {
        db.createObjectStore(STORE, { keyPath: 'id' });
      }
    };
    req.onsuccess = () => resolve(req.result);
  });
}

async function clearAlarms() {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, 'readwrite');
    tx.objectStore(STORE).clear();
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

async function putAlarms(alarms) {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, 'readwrite');
    const store = tx.objectStore(STORE);
    alarms.forEach((a) => store.put(a));
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

async function getPendingAlarms() {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, 'readonly');
    const req = tx.objectStore(STORE).getAll();
    req.onsuccess = () => resolve(req.result || []);
    req.onerror = () => reject(req.error);
  });
}

async function markFired(id) {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, 'readwrite');
    const store = tx.objectStore(STORE);
    const req = store.get(id);
    req.onsuccess = () => {
      const row = req.result;
      if (row) {
        row.fired = true;
        store.put(row);
      }
      resolve();
    };
    req.onerror = () => reject(req.error);
  });
}

function clearTimeouts() {
  pendingTimeouts.forEach((id) => clearTimeout(id));
  pendingTimeouts.length = 0;
}

function notificationContent(alarm) {
  const title = `Time for ${alarm.prayer}`;
  const body = alarm.prayer === 'Fajr' ? 'Fajr has started' : `${alarm.prayer} prayer time`;
  const options = {
    body,
    tag: `salah-${alarm.id}`,
    renotify: true,
    icon: 'icons/icon-192.png',
    badge: 'icons/icon-192.png',
    silent: false,
    data: { prayer: alarm.prayer, alarmId: alarm.id, url: './' },
    actions: [{ action: 'play-adhan', title: 'Play Adhan' }]
  };
  return { title, options };
}

async function postPlayAdhanToClient(client, alarmId, prayer) {
  const payload = { type: 'PLAY_ADHAN', alarmId, prayer };
  client.postMessage(payload);
  setTimeout(() => client.postMessage(payload), 400);
  setTimeout(() => client.postMessage(payload), 900);
}

async function scheduleTriggerNotification(alarm) {
  if (!supportsTimestampTriggers()) return false;
  const now = Date.now();
  if (alarm.fired || alarm.fireAt <= now) return false;

  const { title, options } = notificationContent(alarm);
  try {
    options.showTrigger = new TimestampTrigger(alarm.fireAt);
    await self.registration.showNotification(title, options);
    await markFired(alarm.id);
    return true;
  } catch (e) {
    return false;
  }
}

async function scheduleTriggerNotifications(alarms) {
  if (!supportsTimestampTriggers()) return;
  for (const alarm of alarms) {
    if (alarm.fired) continue;
    if (!isActiveAlarmDate(getAlarmDate(alarm.id))) continue;
    await scheduleTriggerNotification(alarm);
  }
}

async function fireAlarm(alarm) {
  if (alarm.fired) return;
  if (firingIds.has(alarm.id)) return;
  const prefs = alarm.prefs || {};
  if (!prefs.enabled) return;

  const alarmDate = getAlarmDate(alarm.id);
  if (alarmDate && !isActiveAlarmDate(alarmDate)) return;

  const now = Date.now();
  if (alarm.fireAt <= now && now - alarm.fireAt > CATCHUP_MS) {
    await markFired(alarm.id);
    return;
  }

  firingIds.add(alarm.id);
  const { title, options } = notificationContent(alarm);

  try {
    try {
      await self.registration.showNotification(title, options);
    } catch (e) {
      return;
    }

    await markFired(alarm.id);

    const clients = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
    if (prefs.playAdhan) {
      clients.forEach((client) => {
        client.postMessage({ type: 'PLAY_ADHAN', alarmId: alarm.id, prayer: alarm.prayer });
      });
      clients.forEach((client) => {
        client.postMessage({ type: 'SHOW_ADHAN_BANNER', prayer: alarm.prayer, alarmId: alarm.id });
      });
    }
  } finally {
    firingIds.delete(alarm.id);
  }
}

async function checkAlarms() {
  const now = Date.now();
  const today = todayDateString();
  const alarms = await getPendingAlarms();
  for (const alarm of alarms) {
    const alarmDate = getAlarmDate(alarm.id);
    if (alarmDate && alarmDate !== today) continue;
    if (!alarm.fired && alarm.fireAt <= now) {
      await fireAlarm(alarm);
    }
  }
}

function scheduleTimeouts(alarms) {
  clearTimeouts();
  const now = Date.now();
  alarms.forEach((alarm) => {
    if (alarm.fired) return;
    if (!isActiveAlarmDate(getAlarmDate(alarm.id))) return;
    const delay = alarm.fireAt - now;
    if (delay > 0 && delay < 172800000) {
      const tid = setTimeout(() => fireAlarm(alarm), delay);
      pendingTimeouts.push(tid);
    }
  });
}

async function applySchedule(payload) {
  clearTimeouts();

  if (!payload || !payload.enabled) {
    if (!payload?.merge) {
      await clearAlarms();
    }
    return;
  }

  if (!payload.alarms || !payload.alarms.length) {
    if (!payload.merge) await clearAlarms();
    return;
  }

  const existing = payload.merge ? await getPendingAlarms() : [];
  const firedMap = new Map(existing.map((a) => [a.id, a.fired]));
  const hadUnfired = new Set(existing.filter((a) => !a.fired).map((a) => a.id));

  if (!payload.merge) {
    await clearAlarms();
  }

  const now = Date.now();
  const prefs = { enabled: payload.enabled, playAdhan: payload.playAdhan };
  const newRows = payload.alarms.map((a) => {
    const id = `${payload.date}-${a.prayer}`;
    let fired = firedMap.get(id) || false;
    if (!fired && a.fireAt <= now && !hadUnfired.has(id)) {
      fired = true;
    }
    return {
      id,
      prayer: a.prayer,
      fireAt: a.fireAt,
      fired,
      prefs
    };
  });

  let rows;
  if (payload.merge) {
    const merged = new Map(existing.map((a) => [a.id, a]));
    newRows.forEach((row) => merged.set(row.id, row));
    rows = Array.from(merged.values());
  } else {
    rows = newRows;
  }

  await putAlarms(rows);
  await scheduleTriggerNotifications(rows);
  scheduleTimeouts(rows);
  await checkAlarms();
}

async function showTestNotification() {
  await self.registration.showNotification('Salah test', {
    body: 'Prayer reminders are working. Tap Play Adhan to hear a sample.',
    tag: 'salah-test',
    icon: 'icons/icon-192.png',
    badge: 'icons/icon-192.png',
    silent: false,
    data: { prayer: 'Test', alarmId: 'test', url: './' },
    actions: [{ action: 'play-adhan', title: 'Play Adhan' }]
  });
}

function startCheckLoop() {
  if (checkInterval) return;
  checkInterval = setInterval(checkAlarms, CHECK_MS);
}

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      await self.clients.claim();
      startCheckLoop();
      const alarms = await getPendingAlarms();
      scheduleTimeouts(alarms);
      await checkAlarms();
    })()
  );
});

self.addEventListener('message', (event) => {
  const data = event.data || {};
  if (data.type === 'SCHEDULE') {
    event.waitUntil(applySchedule(data.payload));
  } else if (data.type === 'CLEAR') {
    event.waitUntil(
      (async () => {
        clearTimeouts();
        await clearAlarms();
      })()
    );
  } else if (data.type === 'CHECK_NOW') {
    event.waitUntil(checkAlarms());
  } else if (data.type === 'TEST_NOTIFY') {
    event.waitUntil(showTestNotification());
  }
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const data = event.notification.data || {};
  const alarmId = data.alarmId || 'notification-tap';
  const prayer = data.prayer || '';
  const wantAdhan = event.action === 'play-adhan' || !event.action || event.action === 'default';

  event.waitUntil(
    (async () => {
      const clients = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
      for (const client of clients) {
        if ('focus' in client) {
          await client.focus();
          if (wantAdhan) {
            await postPlayAdhanToClient(client, alarmId, prayer);
            client.postMessage({ type: 'SHOW_ADHAN_BANNER', prayer, alarmId });
          }
          return;
        }
      }
      if (self.clients.openWindow) {
        const client = await self.clients.openWindow(data.url || './');
        if (client) {
          if (wantAdhan) {
            await postPlayAdhanToClient(client, alarmId, prayer);
            client.postMessage({ type: 'SHOW_ADHAN_BANNER', prayer, alarmId });
          }
        }
      }
    })()
  );
});

startCheckLoop();
