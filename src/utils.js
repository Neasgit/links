export function escapeHtml(str = '') {
  return String(str).replace(
    /[&<>"']/g,
    (m) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m])
  );
}
export function isSafeUrl(url = '') {
  const u = String(url).trim().toLowerCase();
  return u.startsWith('/') || u.startsWith('https://') || u.startsWith('http://');
}
export function highlight(text, query) {
  const t = String(text ?? ''),
    q = String(query ?? '').trim();
  if (!q) return escapeHtml(t);
  const re = new RegExp(`(${q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'ig');
  return t
    .split(re)
    .map((p) => (p.toLowerCase() === q.toLowerCase() ? `<mark>${escapeHtml(p)}</mark>` : escapeHtml(p)))
    .join('');
}
export function stableId(item) {
  if (item?.id) return String(item.id);
  const seed = `${item?.title ?? ''}::${item?.url ?? ''}`;
  let h = 0x811c9dc5;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = (h * 0x01000193) >>> 0;
  }
  return `auto_${h.toString(16).padStart(8, '0')}`;
}

// Google Sheet CSV to Dashboard Object
export function parseSheetCsv(csv) {
  const lines = csv
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => l);
  const groupsMap = new Map();
  // Assume: Group, Title, URL, Notes, Visibility
  lines.slice(1).forEach((line) => {
    const [group, title, url, notes, vis] = line.split(',').map((c) => c.replace(/^"|"$/g, ''));
    if (!group || !title) return;
    if (!groupsMap.has(group)) groupsMap.set(group, { title: group, items: [] });
    groupsMap.get(group).items.push({ title, url, notes, vis });
  });
  return { groups: Array.from(groupsMap.values()) };
}
