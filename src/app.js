import { renderApp } from './render.js';
import { loadStore, saveFavs, saveFilters, saveOpenSections, saveSmartSearch, saveTheme } from './store.js';
import { parseSheetCsv, stableId } from './utils.js';

// Set your CSV URL here for Google Sheet integration
const GOOGLE_SHEET_CSV_URL = null;
const LOCAL_DATA_URL = './data/links.json';

const els = {
  q: document.getElementById('q'),
  sideNav: document.getElementById('sideNav'),
  container: document.getElementById('container'),
  subtitle: document.getElementById('subtitle'),
  themeToggle: document.getElementById('themeToggle'),
  menuBtn: document.getElementById('menuBtn'),
  expandAll: document.getElementById('expandAll'),
  collapseAll: document.getElementById('collapseAll'),
  chipFavs: document.getElementById('chipFavs'),
  smartSearchToggle: document.getElementById('smartSearchToggle'),
};

let data = { groups: [] },
  allItems = [],
  store = loadStore();

init();
async function init() {
  try {
    const url = GOOGLE_SHEET_CSV_URL || LOCAL_DATA_URL;
    const res = await fetch(url, { cache: 'no-store' });
    let json;
    if (url.endsWith('.csv') || GOOGLE_SHEET_CSV_URL) {
      const csv = await res.text();
      json = parseSheetCsv(csv);
    } else {
      json = await res.json();
    }
    data.groups = (json.groups || []).map((g) => ({
      ...g,
      id: (g.id || g.title).toLowerCase().replace(/\s+/g, '-'),
      items: (g.items || []).map((i) => {
        const it = { ...i, id: i.id || stableId(i) };
        allItems.push(it);
        return it;
      }),
    }));

    // Expanded by Default logic
    if (!store.openSectionIds.length) {
      store.openSectionIds = data.groups.map((g) => g.id);
      saveOpenSections(store.openSectionIds);
    }

    document.body.classList.toggle('dark', store.theme === 'dark');
    wireUI();
    doRender();
    setupScrollSpy();
  } catch (err) {
    els.container.innerHTML = `<div class="empty">⚠️ Failed to load data.</div>`;
  }
}

function wireUI() {
  els.q.oninput = () => doRender();
  els.themeToggle.onclick = () => {
    store.theme = store.theme === 'dark' ? 'light' : 'dark';
    document.body.classList.toggle('dark');
    saveTheme(store.theme);
  };

  // Robust button logic
  els.expandAll.onclick = () => {
    document.querySelectorAll('details').forEach((d) => (d.open = true));
    saveOpenSections(data.groups.map((g) => g.id));
  };
  els.collapseAll.onclick = () => {
    document.querySelectorAll('details').forEach((d) => (d.open = false));
    saveOpenSections([]);
  };

  els.menuBtn.onclick = () => document.body.classList.toggle('nav-open');
  els.smartSearchToggle.onclick = () => {
    store.smartSearch = !store.smartSearch;
    saveSmartSearch(store.smartSearch);
    doRender();
  };
  els.chipFavs.onclick = () => {
    store.filters.onlyFavs = !store.filters.onlyFavs;
    saveFilters(store.filters);
    syncChips();
    doRender();
  };

  document.querySelectorAll('.chip[data-vis]').forEach((btn) => {
    btn.onclick = () => {
      const v = btn.dataset.vis,
        list = new Set(store.filters.vis);
      if (list.has(v)) list.delete(v);
      else {
        list.clear();
        list.add(v);
      }
      store.filters.vis = [...list];
      saveFilters(store.filters);
      syncChips();
      doRender();
    };
  });

  els.sideNav.onclick = (e) => {
    const id = e.target.closest('[data-jump]')?.dataset.jump;
    if (id) {
      const sec = document.getElementById(id);
      if (sec) {
        sec.querySelector('details').open = true;
        sec.scrollIntoView({ behavior: 'smooth' });
      }
      document.body.classList.remove('nav-open');
    }
  };

  els.container.onclick = (e) => {
    const favBtn = e.target.closest('[data-action="toggle-fav"]');
    if (favBtn) {
      const id = favBtn.closest('[data-item-id]').dataset.itemId;
      const set = new Set(store.favIds);
      if (set.has(id)) set.delete(id);
      else set.add(id);
      store.favIds = [...set];
      saveFavs(store.favIds);
      doRender();
      return;
    }
  };

  els.container.ontoggle = (e) => {
    const d = e.target;
    if (!(d instanceof HTMLDetailsElement)) return;
    const id = d.dataset.sectionId;
    if (!id) return;
    const current = new Set(JSON.parse(localStorage.getItem('agent.openSections.v2') || '[]'));
    if (d.open) current.add(id);
    else current.delete(id);
    saveOpenSections([...current]);
  };
}

function setupScrollSpy() {
  const observer = new IntersectionObserver(
    (entries) => {
      const visible = entries.find((e) => e.isIntersecting);
      if (visible) {
        const id = visible.target.id;
        document.querySelectorAll('.navLink').forEach((el) => el.classList.toggle('active', el.dataset.jump === id));
      }
    },
    { rootMargin: '-10% 0px -80% 0px', threshold: 0.1 }
  );
  document.querySelectorAll('.section').forEach((s) => observer.observe(s));
}

function doRender() {
  els.smartSearchToggle.textContent = `🔍 Smart Search: ${store.smartSearch ? 'On' : 'Off'}`;
  const res = renderApp({ data, allItems, query: els.q.value, store, containerEl: els.container });
  els.sideNav.innerHTML = res.sections
    .map((s) => `<div class="navLink" data-jump="${s.id}"><span>${s.title}</span></div>`)
    .join('');
  els.subtitle.textContent = `${res.totalShown} items shown`;
  syncChips();
}

function syncChips() {
  els.chipFavs.setAttribute('aria-pressed', String(!!store.filters.onlyFavs));
  document
    .querySelectorAll('.chip[data-vis]')
    .forEach((btn) => btn.setAttribute('aria-pressed', String(new Set(store.filters.vis).has(btn.dataset.vis))));
}
