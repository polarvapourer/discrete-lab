// The digital exercise views share a preference. A paper keeps its own settings.
const key = 'discrete-lab-guided';
export function guidanceEnabled() {
  try { return localStorage.getItem(key) === 'on'; } catch { return false; }
}

export function saveGuidance(enabled) {
  try { localStorage.setItem(key, enabled ? 'on' : 'off'); } catch {
    // The live checkbox still works when storage is unavailable.
  }
}

export function guidanceCheckbox(enabled) {
  return `<label class="guided-toggle"><input type="checkbox" data-guided ${enabled ? 'checked' : ''}> Guided mode</label>`;
}
