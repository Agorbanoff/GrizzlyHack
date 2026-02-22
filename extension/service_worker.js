const API = "http://localhost:6969";

const DEFAULTS = {
  mode: "auto",
  checkpointEveryMinutes: 5,
  captureEveryMinutes: 2,
  shotsPerCheckpoint: 2,
  reminderMinutes: 15
};

function log(step, data) {
  console.log(`[EXT] ${step}`, data ?? "");
}

async function apiFetch(path, init = {}) {
  const url = `${API}${path}`;
  log("FETCH ->", { url, method: init.method || "GET" });
  const r = await fetch(url, { ...init, credentials: "include" });
  const text = await r.text().catch(() => "");
  log("FETCH <-", { url, status: r.status, ok: r.ok, body: text });
  return { r, text };
}

async function getSettings() {
  return await chrome.storage.local.get(DEFAULTS);
}

async function getState() {
  return await chrome.storage.local.get({
    sessionId: null,
    windowStartedAt: 0,
    lastCaptureAt: 0,
    active: null,
    activities: {},
    lastReminderAt: 0
  });
}

async function setState(patch) {
  await chrome.storage.local.set(patch);
}

async function ensureSessionId() {
  const { sessionId } = await getState();
  if (sessionId) return Number(sessionId);

  const { r, text } = await apiFetch("/sessions/start", { method: "POST" });
  if (!r.ok) throw new Error(`sessions/start failed: ${r.status} ${text}`);
  const data = JSON.parse(text || "{}");
  if (!data.sessionId) throw new Error("sessions/start returned no sessionId");

  await setState({ sessionId: Number(data.sessionId) });
  return Number(data.sessionId);
}

async function endSession() {
  const { sessionId } = await getState();
  if (!sessionId) return { ok: true };

  const { r, text } = await apiFetch(`/sessions/end/${sessionId}`, { method: "POST" });
  if (!r.ok) throw new Error(`sessions/end failed: ${r.status} ${text}`);

  await clearShots();
  await setState({
    sessionId: null,
    windowStartedAt: 0,
    lastCaptureAt: 0,
    active: null,
    activities: {},
    lastReminderAt: 0
  });

  return { ok: true };
}

function openDb() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open("checkpoint_db", 1);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains("shots")) {
        const store = db.createObjectStore("shots", { keyPath: "id" });
        store.createIndex("by_ts", "timestamp");
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function putShot(shot) {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction("shots", "readwrite");
    tx.objectStore("shots").put(shot);
    tx.oncomplete = () => resolve(true);
    tx.onerror = () => reject(tx.error);
  });
}

async function getAllShots() {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction("shots", "readonly");
    const store = tx.objectStore("shots");
    const req = store.getAll();
    req.onsuccess = () => resolve(req.result || []);
    req.onerror = () => reject(req.error);
  });
}

async function deleteShots(ids) {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction("shots", "readwrite");
    const store = tx.objectStore("shots");
    for (const id of ids) store.delete(id);
    tx.oncomplete = () => resolve(true);
    tx.onerror = () => reject(tx.error);
  });
}

async function clearShots() {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction("shots", "readwrite");
    tx.objectStore("shots").clear();
    tx.oncomplete = () => resolve(true);
    tx.onerror = () => reject(tx.error);
  });
}

async function queueCount() {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction("shots", "readonly");
    const req = tx.objectStore("shots").count();
    req.onsuccess = () => resolve(req.result || 0);
    req.onerror = () => reject(req.error);
  });
}

function hostFromUrl(u) {
  try {
    return new URL(u).hostname || "";
  } catch {
    return "";
  }
}

function isHttpUrl(u) {
  try {
    const x = new URL(u);
    return x.protocol === "http:" || x.protocol === "https:";
  } catch {
    return false;
  }
}

async function getActiveTab() {
  const [tab] = await chrome.tabs.query({ active: true, lastFocusedWindow: true });
  return tab && tab.windowId != null ? tab : null;
}

async function dataUrlToBlob(dataUrl) {
  const res = await fetch(dataUrl);
  return await res.blob();
}

async function captureAndCache() {
  const tab = await getActiveTab();
  if (!tab || !tab.url) return;

  if (!isHttpUrl(tab.url)) {
    log("SHOT skipped (non-http)", { url: tab.url });
    return;
  }

  const dataUrl = await chrome.tabs.captureVisibleTab(tab.windowId, { format: "png" });
  const blob = await dataUrlToBlob(dataUrl);

  const shot = {
    id: crypto.randomUUID(),
    timestamp: Date.now(),
    url: tab.url || "",
    host: hostFromUrl(tab.url || ""),
    title: tab.title || "",
    blob
  };

  await putShot(shot);
  log("SHOT cached", { id: shot.id, host: shot.host, size: blob.size });
}

function keyForActivity(host, url, title) {
  return `${host}||${url}||${title}`;
}

async function updateActivityTracker() {
  const now = Date.now();
  const st = await getState();

  const tab = await getActiveTab();

  if (st.active) {
    const dt = Math.max(0, now - st.active.startedAt);
    const k = st.active.key;
    const prev =
      st.activities[k] || {
        title: st.active.title,
        host: st.active.host,
        url: st.active.url,
        timeSpentMillis: 0
      };
    st.activities[k] = { ...prev, timeSpentMillis: prev.timeSpentMillis + dt };
  }

  if (!tab || !tab.url || !isHttpUrl(tab.url)) {
    st.active = null;
    await setState({ active: st.active, activities: st.activities });
    return;
  }

  const host = hostFromUrl(tab.url || "");
  const title = tab.title || "";
  const url = tab.url || "";
  const key = keyForActivity(host, url, title);

  st.active = { key, host, title, url, startedAt: now };

  await setState({ active: st.active, activities: st.activities });
}

function buildAutoDescription(webActivities) {
  const top = [...webActivities].sort((a, b) => b.timeSpentMillis - a.timeSpentMillis).slice(0, 3);
  const parts = top.map((a) => {
    const s = Math.round(a.timeSpentMillis / 1000);
    const m = Math.floor(s / 60);
    const r = s % 60;
    return `${a.host} (${m}m ${r}s)`;
  });
  return parts.length ? `Auto checkpoint: ${parts.join(", ")}` : "Auto checkpoint";
}

async function createCheckpoint(sessionId, webActivities, description) {
  const payload = { sessionId: Number(sessionId), webActivities, description };

  log("CHECKPOINT payload", payload);
  log("CHECKPOINT json", JSON.stringify(payload));

  const { r, text } = await apiFetch("/checkpoints", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });

  if (!r.ok) throw new Error(`checkpoints failed: ${r.status} ${text}`);

  const data = JSON.parse(text || "{}");
  if (!data.checkpointId) throw new Error("checkpoints returned no checkpointId");
  return data.checkpointId;
}

async function uploadScreenshot(checkpointId, blob) {
  const form = new FormData();
  form.append("file", blob, `checkpoint-${checkpointId}-${Date.now()}.png`);
  form.append("checkpoint_id", String(checkpointId));

  const { r, text } = await apiFetch("/screenshots", { method: "POST", body: form });
  if (!r.ok) throw new Error(`screenshots failed: ${r.status} ${text}`);
}

async function sendCheckpoint(descriptionOverride) {
  const settings = await getSettings();
  const st = await getState();
  const sessionId = await ensureSessionId();

  let webActivities = Object.values(st.activities || {})
    .filter((a) => a && a.url && isHttpUrl(a.url))
    .map((a) => ({
      title: a.title || "",
      host: hostFromUrl(a.url),
      url: a.url || "",
      timeSpentMillis: Number(a.timeSpentMillis || 0)
    }))
    .filter((a) => a.timeSpentMillis > 0);

  if (!webActivities.length) {
    const tab = await getActiveTab();
    if (tab?.url && isHttpUrl(tab.url)) {
      webActivities.push({
        title: tab.title || "",
        host: hostFromUrl(tab.url),
        url: tab.url,
        timeSpentMillis: 1
      });
    }
  }

  const description =
    (descriptionOverride && String(descriptionOverride).trim()) || buildAutoDescription(webActivities);

  const checkpointId = await createCheckpoint(sessionId, webActivities, description);

  const shots = await getAllShots();
  shots.sort((a, b) => a.timestamp - b.timestamp);

  const N = Math.max(1, Number(settings.shotsPerCheckpoint) || 1);
  const selected = shots.slice(-N);

  for (const s of selected) {
    await uploadScreenshot(checkpointId, s.blob);
  }

  await deleteShots(selected.map((s) => s.id));

  await setState({
    windowStartedAt: Date.now(),
    activities: {},
    active: null
  });

  log("CHECKPOINT sent", { checkpointId, shotsUploaded: selected.length, activities: webActivities.length });
  return checkpointId;
}

async function tick() {
  const now = Date.now();
  const settings = await getSettings();
  const st = await getState();

  if (!st.windowStartedAt) {
    await setState({ windowStartedAt: now, lastCaptureAt: 0, activities: {}, active: null });
  }

  await updateActivityTracker();

  if (settings.mode === "auto") {
    const captureMs = Math.max(1, settings.captureEveryMinutes) * 60 * 1000;
    const flushMs = Math.max(1, settings.checkpointEveryMinutes) * 60 * 1000;

    const st2 = await getState();

    if (!st2.lastCaptureAt || now - st2.lastCaptureAt >= captureMs) {
      try {
        await captureAndCache();
        await setState({ lastCaptureAt: now });
      } catch (e) {
        console.error("[EXT] capture error", e);
      }
    }

    const windowStartedAt = (await getState()).windowStartedAt || now;

    if (now - windowStartedAt >= flushMs) {
      try {
        await sendCheckpoint(null);
      } catch (e) {
        console.error("[EXT] checkpoint error", e);
        await setState({ windowStartedAt: Date.now() });
      }
    }
  } else {
    const reminderMs = Math.max(1, settings.reminderMinutes) * 60 * 1000;
    const st2 = await getState();
    if (!st2.lastReminderAt || now - st2.lastReminderAt >= reminderMs) {
      await setState({ lastReminderAt: now });
    }
  }
}

async function apply() {
  await chrome.alarms.clearAll();
  chrome.alarms.create("tick_1m", { periodInMinutes: 1 });
  log("APPLY", await getSettings());
}

chrome.runtime.onInstalled.addListener(apply);

chrome.alarms.onAlarm.addListener(async (alarm) => {
  if (alarm.name === "tick_1m") await tick();
});

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg?.type === "APPLY") {
    apply()
      .then(() => sendResponse({ ok: true }))
      .catch((e) => sendResponse({ ok: false, error: String(e) }));
    return true;
  }

  if (msg?.type === "GET_QUEUE_COUNT") {
    queueCount()
      .then((c) => sendResponse({ ok: true, count: c }))
      .catch((e) => sendResponse({ ok: false, error: String(e) }));
    return true;
  }

  if (msg?.type === "MANUAL_CHECKPOINT_NOW") {
    (async () => {
      try {
        const checkpointId = await sendCheckpoint(msg.description || "");
        return { ok: true, checkpointId };
      } catch (e) {
        return { ok: false, error: String(e) };
      }
    })().then(sendResponse);
    return true;
  }

  if (msg?.type === "FORCE_CHECKPOINT_NOW") {
    (async () => {
      try {
        const checkpointId = await sendCheckpoint(null);
        return { ok: true, checkpointId };
      } catch (e) {
        return { ok: false, error: String(e) };
      }
    })().then(sendResponse);
    return true;
  }

  if (msg?.type === "END_SESSION") {
    endSession()
      .then(() => sendResponse({ ok: true }))
      .catch((e) => sendResponse({ ok: false, error: String(e) }));
    return true;
  }

  if (msg?.type === "CAPTURE_NOW") {
    (async () => {
      try {
        await captureAndCache();
        return { ok: true };
      } catch (e) {
        return { ok: false, error: String(e) };
      }
    })().then(sendResponse);
    return true;
  }

  if (msg?.type === "TICK_NOW") {
    tick()
      .then(() => sendResponse({ ok: true }))
      .catch((e) => sendResponse({ ok: false, error: String(e) }));
    return true;
  }
});