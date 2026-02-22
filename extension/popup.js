const API = "http://localhost:6969";

function $(id) {
    return document.getElementById(id);
}

function setStatus(msg) {
    $("status").textContent = msg || "";
}

async function sw(msg) {
    return await chrome.runtime.sendMessage(msg);
}

async function apiFetch(path, init = {}) {
    const r = await fetch(`${API}${path}`, {
        ...init,
        credentials: "include"
    });
    const text = await r.text().catch(() => "");
    return { r, text };
}

async function login(username, password) {
    const { r, text } = await apiFetch("/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password })
    });
    if (!r.ok) throw new Error(`login failed: ${r.status} ${text}`);
}

async function startSession() {
    const { r, text } = await apiFetch("/sessions/start", { method: "POST" });
    if (!r.ok) throw new Error(`sessions/start failed: ${r.status} ${text}`);
    const data = JSON.parse(text || "{}");
    await chrome.storage.local.set({ sessionId: data.sessionId });
    return data.sessionId;
}

async function me() {
    const { r, text } = await apiFetch("/me");
    if (!r.ok) return null;
    return JSON.parse(text || "null");
}

async function refreshQueue() {
    const res = await sw({ type: "GET_QUEUE_COUNT" });
    $("queue").textContent = res?.ok ? res.count : 0;
}

async function updateUi() {
    const user = await me();
    const { sessionId } = await chrome.storage.local.get({ sessionId: null });

    $("authBlock").style.display = user ? "none" : "block";
    $("appBlock").style.display = user ? "block" : "none";

    if (user) {
        $("who").textContent = user.username || "Logged in";
        $("session").textContent = sessionId || "-";
    }

    const pill = $("pill");
    if (user) {
        pill.textContent = sessionId ? "Online" : "Logged in";
        pill.className = sessionId ? "pill pill--on" : "pill";
    } else {
        pill.textContent = "Offline";
        pill.className = "pill pill--off";
    }

    await refreshQueue();
}

document.addEventListener("DOMContentLoaded", async () => {

    $("btnLogin").onclick = async () => {
        try {
            setStatus("Logging in...");
            await login($("username").value, $("password").value);
            const id = await startSession();
            setStatus(`Session #${id}`);
            await updateUi();
        } catch (e) {
            setStatus(e.message);
        }
    };

    $("btnShotNow").onclick = async () => {
        try {
            setStatus("Capturing...");
            const res = await sw({ type: "CAPTURE_NOW" });
            if (!res.ok) throw new Error(res.error);
            setStatus("Screenshot cached");
            await refreshQueue();
        } catch (e) {
            setStatus(e.message);
        }
    };

    $("btnCheckpointNow").onclick = async () => {
        try {
            setStatus("Creating checkpoint...");
            const desc = $("manualDesc").value || "";
            const res = await sw({
                type: "MANUAL_CHECKPOINT_NOW",
                description: desc
            });
            if (!res.ok) throw new Error(res.error);
            setStatus(`Checkpoint #${res.checkpointId}`);
            $("manualDesc").value = "";
            await refreshQueue();
        } catch (e) {
            setStatus(e.message);
        }
    };

    $("btnStartSession").onclick = async () => {
        try {
            const id = await startSession();
            setStatus(`Session #${id}`);
            await updateUi();
        } catch (e) {
            setStatus(e.message);
        }
    };

    $("btnEndSession").onclick = async () => {
        try {
            const { sessionId } = await chrome.storage.local.get({ sessionId: null });
            if (!sessionId) return setStatus("No active session");
            await fetch(`${API}/sessions/end/${sessionId}`, {
                method: "POST",
                credentials: "include"
            });
            await chrome.storage.local.set({ sessionId: null });
            setStatus("Session ended");
            await updateUi();
        } catch (e) {
            setStatus(e.message);
        }
    };

    $("btnApply").onclick = async () => {
        await chrome.storage.local.set({
            captureEveryMinutes: Number($("captureEvery").value || 2),
            checkpointEveryMinutes: Number($("checkpointEvery").value || 5),
            shotsPerCheckpoint: Number($("shotsPerCheckpoint").value || 2),
            reminderMinutes: Number($("reminderMinutes").value || 15)
        });
        await sw({ type: "APPLY" });
        setStatus("Settings applied");
    };

    await updateUi();
});