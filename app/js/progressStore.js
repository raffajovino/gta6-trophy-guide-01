// progressStore.js — earned trophies in localStorage, plus export and import.
// One key, one shape: a JSON array of earned trophy ids. Nothing else is stored.
export const STORAGE_KEY = "leonida55.progress.v1";

export function loadEarned() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return new Set();
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return new Set();
    return new Set(parsed.filter((id) => Number.isInteger(id)));
  } catch {
    return new Set();
  }
}

export function saveEarned(earned) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...earned].sort((a, b) => a - b)));
  } catch {
    // Storage full or unavailable: the page still works, it just forgets.
  }
}

export function toggleEarned(earned, id) {
  const next = new Set(earned);
  if (next.has(id)) next.delete(id);
  else next.add(id);
  saveEarned(next);
  return next;
}

export function exportProgress(earned) {
  const payload = {
    app: "Leonida 55",
    version: 1,
    exportedAt: new Date().toISOString(),
    earned: [...earned].sort((a, b) => a - b),
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "leonida55-progress.json";
  link.click();
  URL.revokeObjectURL(url);
}

export async function importProgressFile(file, knownIds) {
  const text = await file.text();
  const parsed = JSON.parse(text);
  const ids = Array.isArray(parsed) ? parsed : parsed.earned;
  if (!Array.isArray(ids)) throw new Error("not a progress file");
  const kept = ids.filter((id) => knownIds.has(id));
  const earned = new Set(kept);
  saveEarned(earned);
  return earned;
}
