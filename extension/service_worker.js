async function dataUrlToBlob(dataUrl) {
    const res = await fetch(dataUrl);
    return await res.blob();
}

async function sendCheckpoint(tab) {
    try {
        const timestamp = new Date().toISOString();

        const dataUrl = await chrome.tabs.captureVisibleTab(
            tab.windowId,
            { format: "png" }
        );

        const blob = await dataUrlToBlob(dataUrl);

        const form = new FormData();

        form.append(
            "screenshot",
            blob,
            `checkpoint-${Date.now()}.png`
        );

        form.append("url", tab.url || "");
        form.append("timestamp", timestamp);

        const response = await fetch("http://localhost:6969/screenshots", {
            method: "POST",
            body: form
        });

        console.log("Checkpoint sent:", response.status);
    } catch (e) {
        console.error("Auto checkpoint failed:", e);
    }
}

// Create alarm when extension installs
chrome.runtime.onInstalled.addListener(() => {
    chrome.alarms.create("checkpoint", { periodInMinutes: 5 });
});

// Trigger every 5 minutes
chrome.alarms.onAlarm.addListener(async (alarm) => {
    if (alarm.name !== "checkpoint") return;

    const [tab] = await chrome.tabs.query({
        active: true,
        lastFocusedWindow: true
    });

    if (!tab || !tab.windowId) return;

    sendCheckpoint(tab);
});