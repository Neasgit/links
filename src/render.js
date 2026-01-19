import { escapeHtml, highlight, isSafeUrl } from './utils.js';

export function renderApp({ data, allItems, query, store, containerEl }) {
  const favSet = new Set(store.favIds);
  const q = String(query || '').trim();
  const visFilter = new Set((store.filters.vis || []).map((v) => v.toLowerCase()));

  const sections = [];
  const usageEntries = Object.entries(store.usage || {})
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([id]) => allItems.find((i) => i.id === id))
    .filter(Boolean);

  if (usageEntries.length > 0 && !q) {
    sections.push({ id: 'suggested', title: 'Suggested for You', items: usageEntries });
  }

  const favItems = allItems.filter((i) => favSet.has(i.id));
  if (favItems.length) sections.push({ id: 'favs', title: 'Favourites', items: favItems });
  data.groups.forEach((g) => sections.push(g));

  let filtered;
  if (q && store.smartSearch && typeof Fuse !== 'undefined') {
    const fuse = new Fuse(allItems, { keys: ['title', 'notes'], threshold: 0.4 });
    const results = fuse.search(q).map((r) => r.item);
    filtered = [{ id: 'search-results', title: 'Smart Search Results', items: results }];
  } else {
    const lowerQ = q.toLowerCase();
    filtered = sections
      .map((s) => ({
        ...s,
        items: s.items.filter((i) => {
          if (store.filters.onlyFavs && !favSet.has(i.id)) return false;
          if (visFilter.size && !visFilter.has(String(i.vis || 'internal').toLowerCase())) return false;
          if (!lowerQ) return true;
          return `${i.title} ${i.notes}`.toLowerCase().includes(lowerQ);
        }),
      }))
      .filter((s) => s.items.length > 0);
  }

  containerEl.innerHTML = filtered.length
    ? filtered.map((s) => sectionHtml(s, q, favSet, store)).join('')
    : '<div class="empty">No matches found.</div>';
  return {
    sections: filtered,
    totalShown: filtered.reduce((n, s) => n + s.items.length, 0),
    totalAll: allItems.length,
  };
}

function sectionHtml(section, q, favSet, store) {
  const currentOpen = new Set(JSON.parse(localStorage.getItem('agent.openSections.v2') || '[]'));
  const cards = section.items
    .map((i) => {
      const isFav = favSet.has(i.id);
      const visClass = (i.vis || 'internal').toLowerCase();
      return `
      <div class="linkCard ${visClass}" data-item-id="${escapeHtml(i.id)}">
        <a href="${escapeHtml(
          isSafeUrl(i.url) ? i.url : '#'
        )}" target="_blank" rel="noopener" class="cardTitle" data-action="track-click">
          ${highlight(i.title, q)}
        </a>
        <div class="badge ${visClass}">${escapeHtml(i.vis || 'internal')}</div>
        <button class="starBtn ${isFav ? 'fav' : ''}" data-action="toggle-fav">★</button>
      </div>`;
    })
    .join('');

  return `
    <section class="section" id="${escapeHtml(section.id)}">
      <details class="card" data-section-id="${escapeHtml(section.id)}" ${currentOpen.has(section.id) ? 'open' : ''}>
        <summary>${escapeHtml(section.title)}</summary>
        <div class="cardGrid">${cards}</div>
      </details>
    </section>`;
}
