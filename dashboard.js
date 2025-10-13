// dashboard.js
// Ducks in the Pool — cleaned version (images + high-contrast removed)
// Copy this file as-is to replace your current dashboard.js

(function () {
  'use strict';

  // ---------- Utility helpers ----------
  const dbg = (...args) => { console.debug('[dashboard]', ...args); };
  const qs = id => document.getElementById(id);
  const safeJSON = (s, fallback) => {
    try { return JSON.parse(s); } catch (e) { return fallback; }
  };
  const setLS = (k, v) => { try { localStorage.setItem(k, v); } catch (e) {} };
  const rmLS = (k) => { try { localStorage.removeItem(k); } catch (e) {} };

  // Toggle class + persist helper
  function toggleClassPersist(cls, iconElem, onGlyph, offGlyph) {
    const enabled = document.body.classList.toggle(cls);
    setLS(cls, enabled ? 'true' : 'false');
    if (iconElem) iconElem.textContent = enabled ? (onGlyph ?? iconElem.textContent) : (offGlyph ?? iconElem.textContent);
    dbg('toggled', cls, enabled);
    return enabled;
  }

  // Safe attach: only add listener if element exists
  function attach(el, ev, fn, name) {
    if (!el) {
      console.warn(`[dashboard] missing element for ${name}`);
      return;
    }
    el.addEventListener(ev, fn);
  }

  // Wait for DOM ready, then fetch links.json and init
  document.addEventListener('DOMContentLoaded', () => {
    fetch('links.json')
      .then(res => {
        if (!res.ok) throw new Error(`Failed to load links.json (${res.status})`);
        return res.json();
      })
      .then(data => initDashboard(data))
      .catch(err => {
        console.error('[dashboard] error loading links.json', err);
        const grid = qs('grid');
        if (grid) grid.innerHTML = `<p style="color:red;">⚠️ Could not load links.json</p>`;
      });
  });

  // ---------- Main ----------
  function initDashboard(data) {
    dbg('initDashboard');

    // --- DOM refs ---
    const nav = qs('nav-section');
    const grid = qs('grid');
    const titleEl = qs('section-title');
    const searchEl = qs('search');
    const showAllBtn = qs('show-all-toggle');

    // Toggle buttons / UI (note: images + contrast removed)
    const themeBtn = qs('theme-toggle');
    const layoutBtn = qs('layout-toggle');
    const compactBtn = qs('compact-toggle');
    const sidebarBtn = qs('sidebar-toggle');
    const gridSizeBtn = qs('grid-size-toggle');
    const cardSizeBtn = qs('card-size-toggle');
    const paletteEl = qs('color-palette');

    // --- Restore persisted classes/state immediately so CSS matches on first paint ---
    const persisted = {
      vertical: localStorage.getItem('vertical-layout') === 'true',
      compact: localStorage.getItem('compact') === 'true',
      hideSidebar: localStorage.getItem('hide-sidebar') === 'true',
      gridClass: localStorage.getItem('grid-class') || null,
      cardClass: localStorage.getItem('card-class') || 'card-medium',
      theme: localStorage.getItem('theme') || (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'),
      accent: localStorage.getItem('accent') || '#0a84ff',
      favourites: safeJSON(localStorage.getItem('favourites'), [])
    };

    if (persisted.vertical) document.body.classList.add('vertical-layout');
    if (persisted.compact) document.body.classList.add('compact');
    if (persisted.hideSidebar) document.body.classList.add('hide-sidebar');
    if (persisted.gridClass) document.body.classList.add(persisted.gridClass);
    if (persisted.cardClass) document.body.classList.add(persisted.cardClass);
    document.body.dataset.theme = persisted.theme;
    document.documentElement.dataset.theme = persisted.theme;
    document.documentElement.style.setProperty('--accent', persisted.accent);
    const metaTheme = document.querySelector("meta[name='theme-color']");
    if (metaTheme) metaTheme.setAttribute('content', persisted.accent);

    // App state
    let favourites = Array.isArray(persisted.favourites) ? persisted.favourites : [];
    let currentGroup = (data && data.groups && data.groups[0]) ? data.groups[0] : null;

    // --- Accent palette setup ---
    const COLORS = ['#0a84ff','#34c759','#ff2d55','#af52de','#ff9f0a','#5ac8fa'];
    if (paletteEl) {
      paletteEl.innerHTML = '';
      COLORS.forEach(c => {
        const dot = document.createElement('div');
        dot.className = 'color-dot';
        dot.style.background = c;
        if (c === persisted.accent) dot.classList.add('active');
        dot.addEventListener('click', () => {
          setLS('accent', c);
          document.documentElement.style.setProperty('--accent', c);
          const meta = document.querySelector("meta[name='theme-color']");
          if (meta) meta.setAttribute('content', c);
          paletteEl.querySelectorAll('.color-dot').forEach(d => d.classList.remove('active'));
          dot.classList.add('active');
          dbg('accent changed', c);
        });
        paletteEl.appendChild(dot);
      });
    }

    // --- Toggle handlers (defensive) ---

    // Theme toggle
    attach(themeBtn, 'click', (e) => {
      e.preventDefault(); e.stopPropagation();
      const newTheme = document.body.dataset.theme === 'dark' ? 'light' : 'dark';
      document.body.dataset.theme = newTheme;
      document.documentElement.dataset.theme = newTheme;
      setLS('theme', newTheme);
      if (themeBtn) themeBtn.textContent = newTheme === 'dark' ? '🌞' : '🌙';
      dbg('theme switched', newTheme);
    }, 'themeBtn');
    if (themeBtn) themeBtn.textContent = document.body.dataset.theme === 'dark' ? '🌞' : '🌙';

    // Layout (vertical vs grid) - glyphs changed to ≡ (list) and ▦ (grid)
    attach(layoutBtn, 'click', (e) => {
      e.preventDefault(); e.stopPropagation();
      // toggle class
      const enabled = document.body.classList.toggle('vertical-layout');
      setLS('vertical-layout', enabled ? 'true' : 'false');
      // update glyph: show ≡ when vertical/list, ▦ when grid
      if (layoutBtn) layoutBtn.textContent = enabled ? '≡' : '▦';
      dbg('layout toggled', enabled);
    }, 'layoutBtn');
    if (layoutBtn) layoutBtn.textContent = document.body.classList.contains('vertical-layout') ? '≡' : '▦';

    // Compact
    function applyCompact(enabled) {
      document.body.classList.toggle('compact', enabled);
      if (compactBtn) compactBtn.textContent = enabled ? '🔎' : '📏';
    }
    attach(compactBtn, 'click', (e) => {
      e.preventDefault(); e.stopPropagation();
      const newVal = !document.body.classList.contains('compact');
      applyCompact(newVal);
      setLS('compact', newVal ? 'true' : 'false');
    }, 'compactBtn');
    applyCompact(document.body.classList.contains('compact'));

    // Sidebar hide/unhide
    attach(sidebarBtn, 'click', (e) => {
      e.preventDefault(); e.stopPropagation();
      const enabled = toggleClassPersist('hide-sidebar', sidebarBtn, '⫸', '⫷');
      setLS('hide-sidebar', enabled ? 'true' : 'false');
    }, 'sidebarBtn');
    if (sidebarBtn) sidebarBtn.textContent = document.body.classList.contains('hide-sidebar') ? '⫸' : '⫷';

    // Grid size cycle (1 / 2 / 3 / auto)
    const GRID_KEYS = ['grid-1','grid-2','grid-3'];
    function currentGridIndex() { return GRID_KEYS.findIndex(k => document.body.classList.contains(k)); }
    attach(gridSizeBtn, 'click', (e) => {
      e.preventDefault(); e.stopPropagation();
      let idx = currentGridIndex();
      GRID_KEYS.forEach(k => document.body.classList.remove(k));
      idx = (idx + 1) % (GRID_KEYS.length + 1); // +1 = auto (no class)
      if (idx < GRID_KEYS.length) {
        document.body.classList.add(GRID_KEYS[idx]);
        setLS('grid-class', GRID_KEYS[idx]);
        if (gridSizeBtn) gridSizeBtn.textContent = (idx + 1) + '▦';
      } else {
        rmLS('grid-class');
        if (gridSizeBtn) gridSizeBtn.textContent = '▦';
      }
      dbg('grid-size toggled', idx);
    }, 'gridSizeBtn');
    if (gridSizeBtn) {
      if (persisted.gridClass && GRID_KEYS.includes(persisted.gridClass)) {
        gridSizeBtn.textContent = (GRID_KEYS.indexOf(persisted.gridClass) + 1) + '▦';
      } else {
        gridSizeBtn.textContent = '▦';
      }
    }

    // Card size (S/M/L cycle)
    const CARD_KEYS = ['card-small','card-medium','card-large'];
    attach(cardSizeBtn, 'click', (e) => {
      e.preventDefault(); e.stopPropagation();
      let idx = CARD_KEYS.findIndex(k => document.body.classList.contains(k));
      CARD_KEYS.forEach(k => document.body.classList.remove(k));
      idx = (idx + 1) % CARD_KEYS.length;
      document.body.classList.add(CARD_KEYS[idx]);
      setLS('card-class', CARD_KEYS[idx]);
      if (cardSizeBtn) cardSizeBtn.textContent = ['S','M','L'][idx];
      dbg('card-size toggled', CARD_KEYS[idx]);
    }, 'cardSizeBtn');
    if (cardSizeBtn) cardSizeBtn.textContent = persisted.cardClass === 'card-small' ? 'S' : (persisted.cardClass === 'card-large' ? 'L' : 'M');

    // Keep icons synced if classes change from other scripts
    const classObserver = new MutationObserver(() => {
      if (layoutBtn) layoutBtn.textContent = document.body.classList.contains('vertical-layout') ? '≡' : '▦';
      if (compactBtn) compactBtn.textContent = document.body.classList.contains('compact') ? '🔎' : '📏';
      if (sidebarBtn) sidebarBtn.textContent = document.body.classList.contains('hide-sidebar') ? '⫸' : '⫷';
    });
    classObserver.observe(document.body, { attributes: true, attributeFilter: ['class'] });

    // ---------- Build nav & render flow ----------
    if (!nav) {
      console.error('[dashboard] nav-section missing');
      return;
    }
    nav.innerHTML = '';

    // Favourites button
    const favBtn = document.createElement('button');
    favBtn.type = 'button';
    favBtn.textContent = '⭐ Favourites';
    favBtn.addEventListener('click', () => {
      currentGroup = 'favourites';
      render();
      updateActive(favBtn);
    });
    nav.appendChild(favBtn);

    // Group buttons from links.json
    (data.groups || []).forEach(g => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.textContent = g.title;
      btn.addEventListener('click', () => {
        currentGroup = g;
        render();
        updateActive(btn);
      });
      nav.appendChild(btn);
    });

    function updateActive(activeBtn) {
      nav.querySelectorAll('button').forEach(b => b.classList.remove('active'));
      if (activeBtn) activeBtn.classList.add('active');
    }

    // Rendering
    function render() {
      if (!grid) return;
      grid.innerHTML = '';
      if (currentGroup === 'favourites') return renderFavourites();
      if (currentGroup === null) return renderAll();
      return renderGroup(currentGroup);
    }

    function renderGroup(group) {
      if (titleEl) titleEl.textContent = group.title;
      if (showAllBtn) showAllBtn.classList.remove('active');
      const items = (group.items || []).filter(matchesSearch);
      if (!items.length) {
        grid.innerHTML = `<p style="opacity:0.6;">No results.</p>`;
        return;
      }
      items.forEach(i => grid.appendChild(createCard(i)));
    }

    function renderAll() {
      if (titleEl) titleEl.textContent = 'All Resources';
      if (showAllBtn) showAllBtn.classList.add('active');
      grid.innerHTML = '';
      (data.groups || []).forEach(g => {
        const section = document.createElement('div');
        section.className = 'section-group';
        const h = document.createElement('h3');
        h.textContent = g.title;
        section.appendChild(h);
        (g.items || []).filter(matchesSearch).forEach(i => section.appendChild(createCard(i)));
        grid.appendChild(section);
      });
    }

    function renderFavourites() {
      if (titleEl) titleEl.textContent = '⭐ Favourites';
      const favItems = (data.groups || []).flatMap(g => (g.items || []).filter(i => favourites.includes(i.title)));
      if (!favItems.length) {
        grid.innerHTML = `<p style="opacity:0.6;">No favourites yet.</p>`;
        return;
      }
      favItems.filter(matchesSearch).forEach(i => grid.appendChild(createCard(i)));
    }

    // Card creation
    function createCard(item) {
      const card = document.createElement('div');
      card.className = 'card';

      const strong = document.createElement('strong');
      strong.textContent = item.title || 'Untitled';
      card.appendChild(strong);

      if (item.img) {
        const img = document.createElement('img');
        img.src = item.img;
        img.alt = item.title || '';
        img.style.maxWidth = '100%';
        img.style.borderRadius = '6px';
        img.style.marginTop = '6px';
        card.appendChild(img);
      }

      if (item.notes) {
        const small = document.createElement('small');
        small.textContent = item.notes;
        card.appendChild(small);
      }

      const star = document.createElement('span');
      star.className = 'star';
      star.textContent = favourites.includes(item.title) ? '★' : '☆';
      if (favourites.includes(item.title)) star.classList.add('active');
      star.addEventListener('click', (ev) => {
        ev.stopPropagation();
        toggleFavourite(item.title);
        star.textContent = favourites.includes(item.title) ? '★' : '☆';
        star.classList.toggle('active');
      });
      card.appendChild(star);

      card.addEventListener('click', () => {
        if (item.url) window.open(item.url, '_blank');
      });

      return card;
    }

    function toggleFavourite(title) {
      if (!title) return;
      if (favourites.includes(title)) favourites = favourites.filter(f => f !== title);
      else favourites.push(title);
      setLS('favourites', JSON.stringify(favourites));
      dbg('favourites updated', favourites);
    }

    // Search handling
    attach(searchEl, 'input', () => render(), 'searchInput');
    function matchesSearch(i) {
      const q = (searchEl && searchEl.value || '').toLowerCase().trim();
      return !q || (i.title && i.title.toLowerCase().includes(q)) || (i.notes && i.notes.toLowerCase().includes(q));
    }

    // Show All
    if (showAllBtn) showAllBtn.addEventListener('click', (e) => {
      e.preventDefault(); e.stopPropagation();
      currentGroup = null;
      render();
      updateActive(null);
    });

    // Initial render and active nav highlight
    render();
    if (currentGroup && nav) {
      const navBtns = Array.from(nav.querySelectorAll('button'));
      const match = navBtns.find(b => b.textContent === currentGroup.title);
      if (match) updateActive(match);
    }

    dbg('initDashboard complete');
  } // end initDashboard
})(); // end IIFE
