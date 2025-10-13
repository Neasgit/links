// dashboard.js
// Minimal controls: theme (SVG icons) + color palette / select
// Sidebar width nudged to 240px; color-dot animation; favourites/stars preserved.

(function () {
  'use strict';

  const qs = id => document.getElementById(id);
  const setLS = (k, v) => { try { localStorage.setItem(k, v); } catch (e) {} };
  const rmLS = (k) => { try { localStorage.removeItem(k); } catch (e) {} };
  const safeJSON = (s, fallback) => { try { return JSON.parse(s); } catch (e) { return fallback; } };

  // Inline SVG icons (small, crisp)
  const ICONS = {
    moon: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" fill="currentColor"/></svg>`,
    sun: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M6.76 4.84l-1.8-1.79L3.17 4.85l1.79 1.79 1.8-1.8zM1 13h3v-2H1v2zm10 9h2v-3h-2v3zM17.24 4.84l1.79-1.79 1.79 1.79-1.79 1.79-1.79-1.79zM20 11v2h3v-2h-3zM6.76 19.16l-1.8 1.79-1.79-1.79 1.79-1.79 1.8 1.79zM17.24 19.16l1.79 1.79 1.79-1.79-1.79-1.79-1.79 1.79zM12 7a5 5 0 100 10 5 5 0 000-10z" fill="currentColor"/></svg>`
  };

  // DOM refs
  const nav = qs('nav-section');
  const grid = qs('grid');
  const searchEl = qs('search');
  const themeBtn = qs('theme-toggle');
  const paletteEl = qs('color-palette');
  const colorSelect = qs('color-select');

  // persisted
  const persisted = {
    theme: localStorage.getItem('theme') || (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'),
    accent: localStorage.getItem('accent') || '#0a84ff',
    favourites: safeJSON(localStorage.getItem('favourites'), [])
  };

  // apply immediately
  document.documentElement.dataset.theme = persisted.theme;
  document.body.dataset.theme = persisted.theme;
  document.documentElement.style.setProperty('--accent', persisted.accent);
  const metaTheme = document.querySelector("meta[name='theme-color']");
  if (metaTheme) metaTheme.setAttribute('content', persisted.theme === 'dark' ? '#111216' : '#f7f8fa');

  // set theme button SVG & aria
  function updateThemeIcon() {
    if (!themeBtn) return;
    const dark = document.body.dataset.theme === 'dark';
    themeBtn.innerHTML = dark ? ICONS.sun : ICONS.moon;
    themeBtn.setAttribute('aria-pressed', dark ? 'true' : 'false');
  }
  updateThemeIcon();

  // Theme toggle handler
  if (themeBtn) {
    themeBtn.addEventListener('click', (e) => {
      e.preventDefault();
      const newTheme = document.body.dataset.theme === 'dark' ? 'light' : 'dark';
      document.body.dataset.theme = newTheme;
      document.documentElement.dataset.theme = newTheme;
      setLS('theme', newTheme);
      if (metaTheme) metaTheme.setAttribute('content', newTheme === 'dark' ? '#111216' : '#f7f8fa');
      updateThemeIcon();
    });
  }

  // Colors config
  const COLORS = [
    { v:'#0a84ff', n:'Blue' },
    { v:'#34c759', n:'Green' },
    { v:'#ff2d55', n:'Pink' },
    { v:'#af52de', n:'Purple' },
    { v:'#ff9f0a', n:'Orange' },
    { v:'#5ac8fa', n:'Sky' }
  ];

  // Populate color dots (desktop) and select (mobile)
  function initColorControls() {
    if (paletteEl) {
      paletteEl.innerHTML = '';
      COLORS.forEach(c => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'color-dot';
        btn.style.background = c.v;
        btn.title = c.n;
        btn.setAttribute('aria-label', c.n);
        if (c.v === persisted.accent) btn.classList.add('active');
        btn.addEventListener('click', () => {
          applyAccent(c.v);
          // animate active (class triggers CSS transform)
          paletteEl.querySelectorAll('.color-dot').forEach(d => d.classList.remove('active'));
          btn.classList.add('active');
          // sync select
          if (colorSelect) colorSelect.value = c.v;
        });
        paletteEl.appendChild(btn);
      });
    }

    if (colorSelect) {
      colorSelect.innerHTML = '';
      const placeholder = document.createElement('option');
      placeholder.value = '';
      placeholder.disabled = true;
      placeholder.selected = true;
      placeholder.textContent = 'Accent';
      colorSelect.appendChild(placeholder);
      COLORS.forEach(c => {
        const opt = document.createElement('option');
        opt.value = c.v;
        opt.textContent = c.n;
        if (c.v === persisted.accent) opt.selected = true;
        colorSelect.appendChild(opt);
      });
      colorSelect.addEventListener('change', () => {
        const v = colorSelect.value;
        if (!v) return;
        applyAccent(v);
        // sync dots visually
        if (paletteEl) {
          paletteEl.querySelectorAll('.color-dot').forEach(d => d.classList.remove('active'));
          const found = Array.from(paletteEl.children).find(b => b.style.background === v);
          if (found) found.classList.add('active');
        }
      });
    }
  }

  function applyAccent(v) {
    setLS('accent', v);
    document.documentElement.style.setProperty('--accent', v);
    // update meta theme to reflect accent contrast lightly (keeps status bar coherent)
    const themeIsDark = document.body.dataset.theme === 'dark';
    if (metaTheme) metaTheme.setAttribute('content', themeIsDark ? '#111216' : '#f7f8fa');
  }

  initColorControls();

  // ---------- Data load & render ----------
  document.addEventListener('DOMContentLoaded', () => {
    fetch('links.json')
      .then(res => { if (!res.ok) throw new Error('links.json load failed'); return res.json(); })
      .then(data => {
        mountNav(data.groups || []);
        mountGrid(data.groups || []);
      })
      .catch(err => {
        if (grid) grid.innerHTML = `<p style="color:red;">⚠️ Could not load links.json</p>`;
        console.error(err);
      });
  });

  function mountNav(groups) {
    if (!nav) return;
    nav.innerHTML = '';
    const favBtn = document.createElement('button');
    favBtn.type = 'button'; favBtn.textContent = '⭐ Favourites'; favBtn.className = 'nav-root-btn';
    favBtn.addEventListener('click', () => renderFavourites(groups));
    nav.appendChild(favBtn);
    groups.forEach(g => {
      const b = document.createElement('button');
      b.type = 'button';
      b.textContent = g.title;
      b.addEventListener('click', () => renderGroup(g));
      nav.appendChild(b);
    });
  }

  function mountGrid(groups) {
    // default to first group
    if (!groups || !groups.length) return;
    renderGroup(groups[0]);
  }

  function renderGroup(group) {
    if (!grid) return;
    if (document.getElementById('section-title')) document.getElementById('section-title').textContent = group.title;
    grid.innerHTML = '';
    const items = (group.items || []);
    if (!items.length) { grid.innerHTML = `<p style="opacity:0.6;">No items</p>`; return; }
    items.forEach(i => grid.appendChild(createCard(i)));
  }

  function renderFavourites(groups) {
    if (!grid) return;
    if (document.getElementById('section-title')) document.getElementById('section-title').textContent = 'Favourites';
    grid.innerHTML = '';
    const favs = (groups || []).flatMap(g => (g.items || []).filter(it => persisted.favourites.includes(it.title)));
    if (!favs.length) { grid.innerHTML = `<p style="opacity:0.6;">No favourites yet.</p>`; return; }
    favs.forEach(i => grid.appendChild(createCard(i)));
  }

  function createCard(item) {
    const card = document.createElement('div');
    card.className = 'card';

    const header = document.createElement('div'); header.className = 'card-header';
    const title = document.createElement('strong'); title.textContent = item.title || 'Untitled';
    header.appendChild(title);

    const starBtn = document.createElement('button');
    starBtn.type = 'button';
    starBtn.className = 'star';
    starBtn.textContent = persisted.favourites.includes(item.title) ? '★' : '☆';
    if (persisted.favourites.includes(item.title)) starBtn.classList.add('active');
    starBtn.addEventListener('click', (ev) => {
      ev.stopPropagation();
      toggleFav(item.title);
      starBtn.textContent = persisted.favourites.includes(item.title) ? '★' : '☆';
      starBtn.classList.toggle('active');
    });
    header.appendChild(starBtn);

    card.appendChild(header);

    if (item.notes) {
      const s = document.createElement('small'); s.textContent = item.notes; card.appendChild(s);
    }

    card.addEventListener('click', () => { if (item.url) window.open(item.url, '_blank'); });
    return card;
  }

  function toggleFav(title) {
    if (!title) return;
    if (persisted.favourites.includes(title)) {
      persisted.favourites = persisted.favourites.filter(f => f !== title);
    } else {
      persisted.favourites.push(title);
    }
    setLS('favourites', JSON.stringify(persisted.favourites));
  }

  // Search basic
  if (searchEl) {
    searchEl.addEventListener('input', () => {
      const q = (searchEl.value || '').toLowerCase().trim();
      // quick client-side filter: find first group containing matches and show filtered cards
      fetch('links.json').then(r => r.json()).then(data => {
        const groups = data.groups || [];
        // if empty query, show first group's full list
        if (!q) { if (groups[0]) renderGroup(groups[0]); return; }
        // find all items matching
        const matches = groups.flatMap(g => (g.items || []).filter(i => (i.title && i.title.toLowerCase().includes(q)) || (i.notes && i.notes.toLowerCase().includes(q))));
        grid.innerHTML = '';
        if (!matches.length) grid.innerHTML = `<p style="opacity:.6">No results.</p>`;
        else matches.forEach(i => grid.appendChild(createCard(i)));
      }).catch(()=>{}); // ignore fetch errors here
    });
  }

})();
