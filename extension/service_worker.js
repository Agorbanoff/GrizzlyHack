const DEFAULTS = { mode: "manual", reminderMinutes: 15 };

async function getSettings() {
    return await chrome.storage.local.get(DEFAULTS);
}

async function dataUrlToBlob(dataUrl) {
    const res = await fetch(dataUrl);
    return await res.blob();
}

async function getActiveTab() {
    const [tab] = await chrome.tabs.query({ active: true, lastFocusedWindow: true });
    return tab && tab.windowId ? tab : null;
}

async function sendCheckpoint(tab) {
    const timestamp = new Date().toISOString();

    const dataUrl = await chrome.tabs.captureVisibleTab(tab.windowId, { format: "png" });
    const blob = await dataUrlToBlob(dataUrl);

    const form = new FormData();
    form.append("screenshot", blob, `checkpoint-${Date.now()}.png`);
    form.append("url", tab.url || "");
    form.append("timestamp", timestamp);

    const r = await fetch("http://localhost:6969/screenshots", { method: "POST", body: form });
    return r.status;
}

async function applySchedules() {
    const st = await getSettings();

    await chrome.alarms.clear("checkpoint_auto");
    await chrome.alarms.clear("checkpoint_reminder");

    if (st.mode === "auto") {
        chrome.alarms.create("checkpoint_auto", { periodInMinutes: 5 });
    } else {
        chrome.alarms.create("checkpoint_reminder", { periodInMinutes: Math.max(1, Number(st.reminderMinutes)) });
    }
}

chrome.runtime.onInstalled.addListener(applySchedules);

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
    if (msg?.type === "APPLY_SCHEDULES") {
        applySchedules().then(() => sendResponse({ ok: true })).catch((e) => sendResponse({ ok: false, error: String(e) }));
        return true;
    }

    if (msg?.type === "TAKE_CHECKPOINT_NOW") {
        (async () => {
            const tab = await getActiveTab();
            if (!tab) return { ok: false, error: "No active tab" };
            try {
                const status = await sendCheckpoint(tab);
                return { ok: true, status };
            } catch (e) {
                return { ok: false, error: String(e) };
            }
        })().then(sendResponse);
        return true;
    }
});

chrome.alarms.onAlarm.addListener(async (alarm) => {
    const st = await getSettings();

    if (alarm.name === "checkpoint_auto") {
        if (st.mode !== "auto") return;
        const tab = await getActiveTab();
        if (!tab) return;
        try { await sendCheckpoint(tab); } catch { }
        return;
    }

    if (alarm.name === "checkpoint_reminder") {
        if (st.mode !== "manual") return;

        chrome.notifications.create({
            type: "basic",
            iconUrl: "icon.png",
            title: "Checkpoint reminder",
            message: "Open the extension and click “Take checkpoint now”."
        });
    }
});