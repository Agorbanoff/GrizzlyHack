const API = "http://localhost:6969";
const DEFAULTS = { mode: "manual", reminderMinutes: 15 };

function log(step, data) {
    console.log(`[EXT] ${step}`, data ?? "");
}

async function getSettings() {
    return await chrome.storage.local.get(DEFAULTS);
}

async function getState() {
    return await chrome.storage.local.get({
        sessionId: null,
        lastCheckpointId: null
    });
}

async function setState(patch) {
    await chrome.storage.local.set(patch);
}

async function apiFetch(path, init = {}) {
    const url = `${API}${path}`;
    log("FETCH ->", { url, method: init.method || "GET" });

    const r = await fetch(url, { ...init, credentials: "include" });

    const text = await r.text().catch(() => "");
    log("FETCH <-", { url, status: r.status, ok: r.ok, body: text });

    return { r, text };
}

async function ensureSessionId() {
    const st = await getState();
    if (st.sessionId) {
        log("SESSION exists", { sessionId: st.sessionId });
        return st.sessionId;
    }

    log("SESSION start", null);
    const { r, text } = await apiFetch("/sessions/start", { method: "POST" });
    if (!r.ok) throw new Error(`sessions/start failed: ${r.status} ${text}`);

    const data = JSON.parse(text || "{}");
    if (!data.sessionId) throw new Error("sessions/start returned no sessionId");

    await setState({ sessionId: data.sessionId });
    log("SESSION started", { sessionId: data.sessionId });

    return data.sessionId;
}

async function getActiveTab() {
    const [tab] = await chrome.tabs.query({ active: true, lastFocusedWindow: true });
    if (!tab || tab.windowId == null) return null;
    return tab;
}

async function createCheckpoint(sessionId, url) {
    log("CHECKPOINT create ->", { sessionId, url });

    const { r, text } = await apiFetch("/checkpoints", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId, url })
    });

    if (!r.ok) throw new Error(`checkpoints failed: ${r.status} ${text}`);

    const data = JSON.parse(text || "{}");
    if (!data.checkpointId) throw new Error("checkpoints returned no checkpointId");

    await setState({ lastCheckpointId: data.checkpointId });
    log("CHECKPOINT created", { checkpointId: data.checkpointId });

    return data.checkpointId;
}

async function dataUrlToBlob(dataUrl) {
    const res = await fetch(dataUrl);
    return await res.blob();
}

async function captureScreenshot(tab) {
    log("SCREENSHOT capture ->", { windowId: tab.windowId, url: tab.url });

    const dataUrl = await chrome.tabs.captureVisibleTab(tab.windowId, { format: "png" });

    log("SCREENSHOT captured", { dataUrlPrefix: dataUrl.slice(0, 30) });

    const blob = await dataUrlToBlob(dataUrl);
    log("SCREENSHOT blob", { size: blob.size, type: blob.type });

    return blob;
}

async function uploadScreenshot(checkpointId, blob) {
    log("SCREENSHOT upload ->", { checkpointId, size: blob.size });

    const form = new FormData();
    form.append("file", blob, `checkpoint-${checkpointId}-${Date.now()}.png`);
    form.append("checkpoint_id", String(checkpointId));

    const { r, text } = await apiFetch("/screenshots", {
        method: "POST",
        body: form
    });

    if (!r.ok) throw new Error(`screenshots failed: ${r.status} ${text}`);

    log("SCREENSHOT uploaded", { checkpointId, status: r.status });
    return true;
}

async function makeCheckpointNow() {
    const tab = await getActiveTab();
    if (!tab) throw new Error("No active tab");

    const sessionId = await ensureSessionId();
    const url = tab.url || "";

    const checkpointId = await createCheckpoint(sessionId, url);
    const blob = await captureScreenshot(tab);
    await uploadScreenshot(checkpointId, blob);

    return { sessionId, checkpointId };
}

async function takeScreenshotNow() {
    const tab = await getActiveTab();
    if (!tab) throw new Error("No active tab");

    const st = await getState();
    const checkpointId = st.lastCheckpointId;
    if (!checkpointId) {
        throw new Error("No checkpointId yet. Use 'Make checkpoint now' first.");
    }

    const blob = await captureScreenshot(tab);
    await uploadScreenshot(checkpointId, blob);

    return { checkpointId };
}

async function applySchedules() {
    const st = await getSettings();

    await chrome.alarms.clear("checkpoint_auto");
    await chrome.alarms.clear("checkpoint_reminder");

    log("SCHEDULE apply", st);

    if (st.mode === "auto") {
        chrome.alarms.create("checkpoint_auto", { periodInMinutes: 5 });
        log("SCHEDULE auto set", { everyMinutes: 5 });
    } else {
        chrome.alarms.create("checkpoint_reminder", { periodInMinutes: Math.max(1, Number(st.reminderMinutes)) });
        log("SCHEDULE reminder set", { everyMinutes: Math.max(1, Number(st.reminderMinutes)) });
    }
}

chrome.runtime.onInstalled.addListener(async () => {
    try {
        log("INSTALLED", null);
        await applySchedules();
        await ensureSessionId();
    } catch (e) {
        console.error("[EXT] onInstalled failed", e);
    }
});

chrome.alarms.onAlarm.addListener(async (alarm) => {
    const st = await getSettings();

    if (alarm.name === "checkpoint_auto") {
        if (st.mode !== "auto") return;
        log("ALARM auto fired", null);
        try {
            const res = await makeCheckpointNow();
            log("ALARM auto success", res);
        } catch (e) {
            console.error("[EXT] ALARM auto failed", e);
        }
        return;
    }

    if (alarm.name === "checkpoint_reminder") {
        if (st.mode !== "manual") return;
        log("ALARM reminder fired", null);

        chrome.notifications.create({
            type: "basic",
            iconUrl: "icon.png",
            title: "Checkpoint reminder",
            message: "Open the extension and click “Make checkpoint now”."
        });
    }
});

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
    if (msg?.type === "APPLY_SCHEDULES") {
        applySchedules()
            .then(() => sendResponse({ ok: true }))
            .catch((e) => sendResponse({ ok: false, error: String(e) }));
        return true;
    }

    if (msg?.type === "MAKE_CHECKPOINT_NOW") {
        (async () => {
            try {
                const res = await makeCheckpointNow();
                return { ok: true, ...res };
            } catch (e) {
                return { ok: false, error: String(e) };
            }
        })().then(sendResponse);
        return true;
    }

    if (msg?.type === "TAKE_SCREENSHOT_NOW") {
        (async () => {
            try {
                const res = await takeScreenshotNow();
                return { ok: true, ...res };
            } catch (e) {
                return { ok: false, error: String(e) };
            }
        })().then(sendResponse);
        return true;
    }
});