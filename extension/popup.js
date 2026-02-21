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
}

async function saveAndApply(patch) {
    await chrome.storage.local.set(patch);
    const st = await chrome.storage.local.get(DEFAULTS);
    toggleReminderSelect(st.mode);
    await chrome.runtime.sendMessage({ type: "APPLY_SCHEDULES" });
    setStatus("Saved");
}

document.addEventListener("change", (e) => {
    const t = e.target;

    if (t && t.name === "mode") saveAndApply({ mode: t.value });
    if (t && t.id === "reminderMinutes") saveAndApply({ reminderMinutes: Number(t.value) });
});

document.getElementById("takeNow").addEventListener("click", async () => {
    setStatus("Sending...");
    const res = await chrome.runtime.sendMessage({ type: "TAKE_CHECKPOINT_NOW" });
    setStatus(res?.ok ? "Sent" : `Failed: ${res?.error || "unknown"}`);
});

load();