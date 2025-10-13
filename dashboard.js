// dashboard.js
// Fixed: robust accent handling (palette <-> select), compute accent-strong, persist, sync meta theme-color
(function () {
  'use strict';

  const qs = id => document.getElementById(id);
  const setLS = (k, v) => { try { localStorage.setItem(k, v); } catch (e) {} };
  const getLS = (k, fallback = null) => {
    try { const v = localStorage.getItem(k); return v === null ? fallback : v; } catch (e) { return fallback; }
  };
  const safeJSON = (s, fallback) => { try { return JSON.parse(s); } catch (e) { return fallback; } };

  // Color helpers
  function hexToRgb(hex) {
    hex = hex.replace('#','');
    if (hex.length === 3) hex = hex.split('').map(h => h+h).join('');
    const bigint = parseInt(hex, 16);
    return { r: (bigint >> 16) & 255, g: (bigint >> 8) & 255, b: bigint & 255 };
  }
  function rgbToHex(r,g,b) {
    const h = (n) => Math.max(0, Math.min(255, Math.round(n))).toString(16).padStart(2,'0');
    return `#${h(r)}${h(g)}${h(b)}`;
  }
  function shadeHex(hex, percent) {
    const { r, g, b } = hexToRgb(hex);
    const factor = (100 + percent) / 100;
    return rgbToHex(r * factor, g * factor, b * factor);
  }

  // DOM refs
  const nav = qs('nav-section');
  const grid = qs('grid');
  const searchEl = qs('search');
  const themeBtn = qs('theme-toggle');
  const paletteEl = qs('color-palette');
  const colorSelect = qs('color-select');
  const metaTheme = document.querySelector("meta[name='theme-color']");

  // persisted state
  const persisted = {
    theme: getLS('theme') || (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'),
    accent: getLS('accent') || '#0a84ff',
    favourites: safeJSON(getLS('favourites'), [])
  };

  // apply theme + accent early
  document.documentElement.dataset.theme = persisted.theme;
  if (document.body) document.body.dataset.theme = persisted.theme;
  document.documentElement.style.setProperty('--accent', persisted.accent);
  const accentStrong = shadeHex(persisted.accent, -18);
  document.documentElement.style.setProperty('--accent-strong', accentStrong);
  if (metaTheme) metaTheme.setAttribute('content', persisted.accent);

  // tiny inline icons for theme button
  const ICONS = {
    moon: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" fill="currentColor"/></svg>`,
    sun: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M6.76 4.84l-1.8-1.79L3.17 4.85l1.79 1.79 1.8-1.8zM1 13h3v-2H1v2zm10 9h2v-3h-2v3zM17.24 4.84l1.79-1.79 1.79 1.79-1.79 1.79-1.79-1.79zM20 11v2h3v-2h-3zM6.76 19.16l-1.8 1.79-1.79-1.79 1.79-1.79 1.8 1.79zM17.24 19.16l1.79 1.79 1.79-1.79-1.79-1.79-1.79 1.79zM12 7a5 5 0 100 10 5 5 0 000-10z" fill="currentColor"/></svg>`
  };

  function updateThemeIcon() {
    if (!themeBtn) return;
    const dark = document.body.dataset.theme === 'dark';
    themeBtn.innerHTML = dark ? ICONS.sun : ICONS.moon;
    themeBtn.setAttribute('aria-pressed', dark ? 'true' : 'false');
  }
  updateThemeIcon();

  const COLORS = [
    { v:'#0a84ff', n:'Blue' },
    { v:'#34c759', n:'Green' },
    { v:'#ff2d55', n:'Pink' },
    { v:'#af52de', n:'Purple' },
    { v:'#ff9f0a', n:'Orange' },
    { v:'#5ac8fa', n:'Sky' }
  ];

  function initColorControls() {
    if (paletteEl) {
      paletteEl.innerHTML = '';
      COLORS.forEach(c => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'color-dot';
        btn.dataset.color = c.v;
        btn.title = c.n;
        btn.setAttribute('aria-label', c.n);
        const swatch = document.createElement('span');
        swatch.style.display = 'block';
        swatch.style.width = '100%';
        swatch.style.height = '100%';
        swatch.style.borderRadius = '50%';
        swatch.style.background = c.v;
        btn.appendChild(swatch);

        if (c.v.toLowerCase() === persisted.accent.toLowerCase()) btn.classList.add('active');

        btn.addEventListener('click', () => {
          applyAccent(c.v);
          paletteEl.querySelectorAll('button').forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
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
        if (c.v.toLowerCase() === persisted.accent.toLowerCase()) {
          opt.selected = true;
          placeholder.selected = false;
        }
        colorSelect.appendChild(opt);
      });

      colorSelect.addEventListener('change', () => {
        const v = colorSelect.value;
        if (!v) return;
        applyAccent(v);
        if (paletteEl) {
          paletteEl.querySelectorAll('button').forEach(b => b.classList.remove('active'));
          const found = Array.from(paletteEl.children).find(b => (b.dataset.color || '').toLowerCase() === v.toLowerCase());
          if (found) found.classList.add('active');
        }
      });
    }
  }

  function applyAccent(hex) {
    if (!hex) return;
    const normalized = hex.trim().toLowerCase();
    setLS('accent', normalized);
    document.documentElement.style.setProperty('--accent', normalized);
    const strong = shadeHex(normalized, -18);
    document.documentElement.style.setProperty('--accent-strong', strong);
    if (metaTheme) metaTheme.setAttribute('content', normalized);
  }

  initColorControls();

  if (themeBtn) {
    themeBtn.addEventListener('click', (e) => {
      e.preventDefault();
      const newTheme = (document.body.dataset.theme === 'dark') ? 'light' : 'dark';
      document.body.dataset.theme = newTheme;
      document.documentElement.dataset.theme = newTheme;
      setLS('theme', newTheme);
      const accent = getLS('accent') || getComputedStyle(document.documentElement).getPropertyValue('--accent').trim() || '#0a84ff';
      if (metaTheme) metaTheme.setAttribute('content', accent);
      updateThemeIcon();
    });
  }

  document.addEventListener('DOMContentLoaded', () => {
    if (paletteEl) {
      paletteEl.querySelectorAll('button').forEach(b => {
        if ((b.dataset.color || '').toLowerCase() === (getLS('accent') || persisted.accent).toLowerCase()) {
          b.classList.add('active');
        } else {
          b.classList.remove('active');
        }
      });
    }
    if (colorSelect) {
      try { colorSelect.value = getLS('accent') || persisted.accent; } catch(e){}
    }

    fetch('links.json').then(res => {
      if (!res.ok) throw new Error('links.json load failed');
      return res.json();
    }).then(data => {
      mountNav(data.groups || []);
      if (data.groups && data.groups.length) renderGroup(data.groups[0]);
    }).catch(err => {
      if (grid) grid.innerHTML = `<p style="color:red;">⚠️ Could not load links.json</p>`;
      console.error(err);
    });
  });

  function mountNav(groups) {
    if (!nav) return;
    nav.innerHTML = '';
    const favBtn = document.createElement('button');
    favBtn.type = 'button';
    favBtn.textContent = '⭐ Favourites';
    favBtn.addEventListener('click', () => renderFavourites(groups));
    nav.appendChild(favBtn);

    (groups || []).forEach(g => {
      const b = document.createElement('button');
      b.type = 'button';
      b.textContent = g.title;
      b.addEventListener('click', () => renderGroup(g));
      nav.appendChild(b);
    });
  }

  function renderGroup(group) {
    if (!grid) return;
    const titleEl = document.getElementById('section-title');
    if (titleEl) titleEl.textContent = group.title || '';
    grid.innerHTML = '';
    const items = (group.items || []);
    if (!items.length) { grid.innerHTML = `<p style="opacity:0.6;">No items</p>`; return; }
    items.forEach(i => grid.appendChild(createCard(i)));
  }

  function renderFavourites(groups) {
    if (!grid) return;
    const titleEl = document.getElementById('section-title');
    if (titleEl) titleEl.textContent = 'Favourites';
    grid.innerHTML = '';
    const favs = (groups || []).flatMap(g => (g.items || []).filter(it => (safeJSON(getLS('favourites'), []) || []).includes(it.title)));
    if (!favs.length) { grid.innerHTML = `<p style="opacity:0.6;">No favourites yet.</p>`; return; }
    favs.forEach(i => grid.appendChild(createCard(i)));
  }

  function createCard(item) {
    const card = document.createElement('div');
    card.className = 'card';
    const header = document.createElement('div'); header.className = 'card-header';
    const strong = document.createElement('strong'); strong.textContent = item.title || 'Untitled';
    header.appendChild(strong);
    const star = document.createElement('button');
    star.type = 'button';
    star.className = 'star';
    const favourites = safeJSON(getLS('favourites'), []);
    star.textContent = favourites.includes(item.title) ? '★' : '☆';
    if (favourites.includes(item.title)) star.classList.add('active');
    star.addEventListener('click', (ev) => {
      ev.stopPropagation();
      toggleFavorite(item.title, star);
    });
    header.appendChild(star);
    card.appendChild(header);
    if (item.notes) {
      const small = document.createElement('small'); small.textContent = item.notes; card.appendChild(small);
    }
    card.addEventListener('click', () => { if (item.url) window.open(item.url, '_blank'); });
    return card;
  }

  function toggleFavorite(title, starBtn) {
    if (!title) return;
    const current = safeJSON(getLS('favourites'), []);
    let updated;
    if (current.includes(title)) updated = current.filter(t => t !== title);
    else updated = current.concat([title]);
    setLS('favourites', JSON.stringify(updated));
    if (starBtn) {
      starBtn.textContent = updated.includes(title) ? '★' : '☆';
      starBtn.classList.toggle('active', updated.includes(title));
    }
  }

  if (searchEl) {
    searchEl.addEventListener('input', () => {
      const q = (searchEl.value || '').toLowerCase().trim();
      if (!q) {
        fetch('links.json').then(r => r.json()).then(data => { if (data.groups && data.groups.length) renderGroup(data.groups[0]); }).catch(()=>{});
        return;
      }
      fetch('links.json').then(r => r.json()).then(data => {
        const items = (data.groups || []).flatMap(g => (g.items || []).filter(i => {
          return (i.title && i.title.toLowerCase().includes(q)) || (i.notes && i.notes.toLowerCase().includes(q));
        }));
        grid.innerHTML = '';
        if (!items.length) grid.innerHTML = `<p style="opacity:0.6">No results.</p>`;
        else items.forEach(it => grid.appendChild(createCard(it)));
      }).catch(()=>{});
    });
  }

})();
