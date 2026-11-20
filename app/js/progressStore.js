// Progress store: earned trophies live in localStorage, with export to a file and import back.
// Nothing leaves the browser; the file the export writes is plain JSON with trophy names.
export const progressStorageKey = 'leonida55-progress-v1';
export const spoilerStorageKey = 'leonida55-spoiler-v1';

// Read the earned set back from localStorage. Unknown names are dropped silently.
export function loadProgress(knownNames) {
  try {
    const raw = localStorage.getItem(progressStorageKey);
    if (!raw) return new Set();
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return new Set();
    const known = new Set(knownNames);
    return new Set(parsed.filter((name) => typeof name === 'string' && known.has(name)));
  } catch {
    return new Set();
  }
}

// Persist the earned set.
export function saveProgress(earned) {
  localStorage.setItem(progressStorageKey, JSON.stringify([...earned]));
}

// Read the spoiler toggle back (defaults to on: story trophies stay hidden until earned).
export function loadSpoilerSetting() {
  try {
    const raw = localStorage.getItem(spoilerStorageKey);
    return raw === null ? true : raw === '1';
  } catch {
    return true;
  }
}

export function saveSpoilerSetting(on) {
  localStorage.setItem(spoilerStorageKey, on ? '1' : '0');
}

// Download the earned set as a JSON file the import can read back.
export function exportProgress(earned) {
  const payload = {
    app: 'leonida55',
    version: 1,
    exportedAt: new Date().toISOString(),
    earned: [...earned],
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = 'leonida55-progress.json';
  link.click();
  setTimeout(() => URL.revokeObjectURL(link.href), 1000);
}

// Read an exported file back into an earned set. Throws on bad files so the caller can report it.
export async function importProgressFile(file, knownNames) {
  const text = await file.text();
  const parsed = JSON.parse(text);
  const names = Array.isArray(parsed) ? parsed : parsed.earned;
  if (!Array.isArray(names)) throw new Error('Not a Leonida 55 progress file.');
  const known = new Set(knownNames);
  const earned = new Set(names.filter((name) => typeof name === 'string' && known.has(name)));
  return earned;
}
