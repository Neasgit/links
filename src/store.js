const KEYS = {
  favs: 'agent.favs.v2',
  open: 'agent.openSections.v2',
  theme: 'agent.theme',
  view: 'agent.view',
  filters: 'agent.filters.v1',
  usage: 'agent.usage.v1',
  smartSearch: 'agent.smartSearch',
  accent: 'agent.accent',
};

export function loadStore() {
  return {
    favIds: JSON.parse(localStorage.getItem(KEYS.favs) || '[]'),
    openSectionIds: JSON.parse(localStorage.getItem(KEYS.open) || '[]'),
    theme: localStorage.getItem(KEYS.theme) || 'light',
    view: localStorage.getItem(KEYS.view) || 'grid',
    usage: JSON.parse(localStorage.getItem(KEYS.usage) || '{}'),
    smartSearch: localStorage.getItem(KEYS.smartSearch) === 'true',
    accent: localStorage.getItem(KEYS.accent) || 'slate',
    compact: true, // Forced Default
    filters: JSON.parse(localStorage.getItem(KEYS.filters) || '{"onlyFavs":false,"vis":[]}'),
  };
}

export function saveFavs(ids) {
  localStorage.setItem(KEYS.favs, JSON.stringify(ids));
}
export function saveOpenSections(ids) {
  localStorage.setItem(KEYS.open, JSON.stringify(ids));
}
export function saveTheme(t) {
  localStorage.setItem(KEYS.theme, t);
}
export function saveView(v) {
  localStorage.setItem(KEYS.view, v);
}
export function saveFilters(f) {
  localStorage.setItem(KEYS.filters, JSON.stringify(f));
}
export function saveUsage(u) {
  localStorage.setItem(KEYS.usage, JSON.stringify(u));
}
export function saveSmartSearch(s) {
  localStorage.setItem(KEYS.smartSearch, String(s));
}
export function saveAccent(a) {
  localStorage.setItem(KEYS.accent, a);
}
