const DB_NAME = 'salah-reminders';
const DB_VERSION = 1;
const STORE = 'alarms';
const CHECK_MS = 60000;

let checkInterval = null;
const pendingTimeouts = [];

function todayDateString() {
  const d = new Date();
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

async function playAdhanOnClients(alarmId) {
  const clients = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
  clients.forEach((client) => client.postMessage({ type: 'PLAY_ADHAN', alarmId }));
}

async function fireAlarm(alarm) {
  if (alarm.fired) return;
  const prefs = alarm.prefs || {};
  if (!prefs.enabled) return;

  const alarmDate = getAlarmDate(alarm.id);
  if (alarmDate && alarmDate !== todayDateString()) return;

  const title = `Time for ${alarm.prayer}`;
  const body = alarm.prayer === 'Fajr' ? 'Fajr has started' : `${alarm.prayer} prayer time`;

  try {
    await self.registration.showNotification(title, {
      body,
      tag: `salah-${alarm.id}`,
      renotify: true,
      icon: 'icons/icon-192.png',
      badge: 'icons/icon-192.png',
      silent: false,
      data: { prayer: alarm.prayer, url: './' }
    });
  } catch (e) {
    return;
  }

  await markFired(alarm.id);

  if (prefs.playAdhan) {
    await playAdhanOnClients(alarm.id);
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
  const today = todayDateString();
  alarms.forEach((alarm) => {
    if (alarm.fired) return;
    const alarmDate = getAlarmDate(alarm.id);
    if (alarmDate && alarmDate !== today) return;
    const delay = alarm.fireAt - now;
    if (delay > 0 && delay < 86400000) {
      const tid = setTimeout(() => fireAlarm(alarm), delay);
      pendingTimeouts.push(tid);
    }
  });
}

async function applySchedule(payload) {
  clearTimeouts();
  const existing = await getPendingAlarms();
  const firedMap = new Map(existing.map((a) => [a.id, a.fired]));
  const hadUnfired = new Set(existing.filter((a) => !a.fired).map((a) => a.id));
  await clearAlarms();

  if (!payload || !payload.enabled || !payload.alarms || !payload.alarms.length) {
    return;
  }

  const now = Date.now();
  const prefs = { enabled: payload.enabled, playAdhan: payload.playAdhan };
  const rows = payload.alarms.map((a) => {
    const id = `${payload.date}-${a.prayer}`;
    let fired = firedMap.get(id) || false;
    // Past when first scheduled: skip notify. Prior unfired = genuine SW miss → allow catch-up.
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

  await putAlarms(rows);
  scheduleTimeouts(rows);
  await checkAlarms();
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
    event.waitUntil(applySchedule({ enabled: false, alarms: [] }));
  } else if (data.type === 'CHECK_NOW') {
    event.waitUntil(checkAlarms());
  }
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    (async () => {
      const clients = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
      for (const client of clients) {
        if ('focus' in client) {
          await client.focus();
          client.postMessage({ type: 'PLAY_ADHAN', alarmId: 'notification-tap' });
          return;
        }
      }
      if (self.clients.openWindow) {
        const client = await self.clients.openWindow(event.notification.data?.url || './');
        if (client) client.postMessage({ type: 'PLAY_ADHAN', alarmId: 'notification-tap' });
      }
    })()
  );
});

startCheckLoop();
