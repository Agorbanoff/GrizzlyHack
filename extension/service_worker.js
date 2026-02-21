async function dataUrlToBlob(dataUrl) {
    const res = await fetch(dataUrl);
    return await res.blob();
}

chrome.action.onClicked.addListener(async (tab) => {
    try {
        const timestamp = new Date().toISOString(); // ISO format

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

        console.log("Sent:", response.status);
    } catch (e) {
        console.error("Failed:", e);
    }
});