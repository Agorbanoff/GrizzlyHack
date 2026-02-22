const DEFAULTS = { mode: "manual", reminderMinutes: 15 };

function setStatus(t) {
    document.getElementById("status").textContent = t || "";
}

function toggleReminderSelect(mode) {
    document.getElementById("reminderMinutes").disabled = mode !== "manual";
}

async function load() {
    const st = await chrome.storage.local.get(DEFAULTS);

    const radio = document.querySelector(`input[name="mode"][value="${st.mode}"]`);
    if (radio) radio.checked = true;

    document.getElementById("reminderMinutes").value = String(st.reminderMinutes);
    toggleReminderSelect(st.mode);

    setStatus("Ready");
}

async function saveAndApply(patch) {
    await chrome.storage.local.set(patch);
    const st = await chrome.storage.local.get(DEFAULTS);
    toggleReminderSelect(st.mode);

    const res = await chrome.runtime.sendMessage({ type: "APPLY_SCHEDULES" });
    if (!res?.ok) setStatus(`Apply failed: ${res?.error || "unknown"}`);
    else setStatus("Saved");
}

document.addEventListener("change", (e) => {
    const t = e.target;

    if (t && t.name === "mode") saveAndApply({ mode: t.value });
    if (t && t.id === "reminderMinutes") saveAndApply({ reminderMinutes: Number(t.value) });
});

document.getElementById("btnShot").addEventListener("click", async () => {
    setStatus("Taking screenshot...");
    const res = await chrome.runtime.sendMessage({ type: "TAKE_SCREENSHOT_NOW" });
    if (res?.ok) setStatus(`Screenshot uploaded (checkpoint_id=${res.checkpointId})`);
    else setStatus(`Screenshot failed: ${res?.error || "unknown"}`);
});

document.getElementById("btnCheckpoint").addEventListener("click", async () => {
    setStatus("Creating checkpoint...");
    const res = await chrome.runtime.sendMessage({ type: "MAKE_CHECKPOINT_NOW" });
    if (res?.ok) setStatus(`Checkpoint ${res.checkpointId} + screenshot uploaded`);
    else setStatus(`Checkpoint failed: ${res?.error || "unknown"}`);
});

load();