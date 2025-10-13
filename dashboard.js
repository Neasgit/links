// dashboard.js
// Updated: removed card-size button, improved responsive & color select for small screens

(function () {
  'use strict';

  const dbg = (...args) => { console.debug('[dashboard]', ...args); };
  const qs = id => document.getElementById(id);
  const safeJSON = (s, fallback) => { try { return JSON.parse(s); } catch (e) { return fallback; } };
  const setLS = (k, v) => { try { localStorage.setItem(k, v); } catch(e) {} };
  const rmLS = (k) => { try { localStorage.removeItem(k); } catch(e) {} };

  function toggleClassPersist(cls, iconElem, onGlyph, offGlyph) {
    const enabled = document.body.classList.toggle(cls);
    setLS(cls, enabled ? 'true' : 'false');
    if (iconElem) iconElem.textContent = enabled ? (onGlyph ?? iconElem.textContent) : (offGlyph ?? iconElem.textContent);
    dbg('toggled', cls, enabled);
    return enabled;
  }
  function attach(el, ev, fn, name) {
    if (!el) { console.warn(`[dashboard] missing element for ${name}`); return; }
    el.addEventListener(ev, fn);
  }

  document.addEventListener('DOMContentLoaded', () => {
    fetch('links.json')
      .then(res => { if (!res.ok) throw new Error(`Failed to load links.json (${res.status})`); return res.json(); })
      .then(data => initDashboard(data))
      .catch(err => {
        console.error('[dashboard] error loading links.json', err);
        const grid = qs('grid');
        if (grid) grid.innerHTML = `<p style="color:red;">⚠️ Could not load links.json</p>`;
      });
  });

  function initDashboard(data) {
    dbg('initDashboard');
    const nav = qs('nav-section');
    const grid = qs('grid');
    const titleEl = qs('section-title');
    const searchEl = qs('search');
    const showAllBtn = qs('show-all-toggle');

    // toggles
    const themeBtn = qs('theme-toggle');
    const compactBtn = qs('compact-toggle');
    const sidebarBtn = qs('sidebar-toggle');
    const gridSizeBtn = qs('grid-size-toggle');
    const paletteEl = qs('color-palette');
    const colorSelect = qs('color-select');

    const persisted = {
      compact: localStorage.getItem('compact') === 'true',
      hideSidebar: localStorage.getItem('hide-sidebar') === 'true',
      gridClass: localStorage.getItem('grid-class') || null,
      theme: localStorage.getItem('theme') || (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'),
      accent: localStorage.getItem('accent') || '#0a84ff',
      favourites: safeJSON(localStorage.getItem('favourites'), [])
    };

    if (persisted.compact) document.body.classList.add('compact');
    if (persisted.hideSidebar) document.body.classList.add('hide-sidebar');
    if (persisted.gridClass) document.body.classList.add(persisted.gridClass);
    document.body.dataset.theme = persisted.theme;
    document.documentElement.dataset.theme = persisted.theme;
    document.documentElement.style.setProperty('--accent', persisted.accent);
    const metaTheme = document.querySelector("meta[name='theme-color']");
    if (metaTheme) metaTheme.setAttribute('content', persisted.accent);

    let favourites = Array.isArray(persisted.favourites) ? persisted.favourites : [];
    let currentGroup = (data && data.groups && data.groups[0]) ? data.groups[0] : null;

    // Colors
    const COLORS = [
      { v:'#0a84ff', n:'Blue' },
      { v:'#34c759', n:'Green' },
      { v:'#ff2d55', n:'Pink' },
      { v:'#af52de', n:'Purple' },
      { v:'#ff9f0a', n:'Orange' },
      { v:'#5ac8fa', n:'Sky' }
    ];

    // populate palette (dots)
    if (paletteEl) {
      paletteEl.innerHTML = '';
      COLORS.forEach(c => {
        const dot = document.createElement('button');
        dot.type = 'button';
        dot.className = 'color-dot';
        dot.style.background = c.v;
        dot.title = c.n;
        if (c.v === persisted.accent) dot.classList.add('active');
        dot.addEventListener('click', () => {
          setLS('accent', c.v);
          document.documentElement.style.setProperty('--accent', c.v);
          const meta = document.querySelector("meta[name='theme-color']");
          if (meta) meta.setAttribute('content', c.v);
          paletteEl.querySelectorAll('.color-dot').forEach(d => d.classList.remove('active'));
          dot.classList.add('active');
          // sync select
          if (colorSelect) colorSelect.value = c.v;
        });
        paletteEl.appendChild(dot);
      });
    }

    // populate accessible select for small screens
    if (colorSelect) {
      colorSelect.innerHTML = '';
      const placeholder = document.createElement('option');
      placeholder.value = '';
      placeholder.textContent = 'Accent color';
      placeholder.disabled = true;
      placeholder.selected = true;
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
        setLS('accent', v);
        document.documentElement.style.setProperty('--accent', v);
        const meta = document.querySelector("meta[name='theme-color']");
        if (meta) meta.setAttribute('content', v);
        // sync dots
        if (paletteEl) paletteEl.querySelectorAll('.color-dot').forEach(d => d.classList.remove('active'));
        const activeDot = paletteEl && Array.from(paletteEl.children).find(btn => btn.style.background === v);
        if (activeDot) activeDot.classList.add('active');
      });
    }

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
    function currentGridIndex(){ return GRID_KEYS.findIndex(k => document.body.classList.contains(k)); }
    attach(gridSizeBtn, 'click', (e) => {
      e.preventDefault(); e.stopPropagation();
      let idx = currentGridIndex();
      GRID_KEYS.forEach(k => document.body.classList.remove(k));
      idx = (idx + 1) % (GRID_KEYS.length + 1);
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
      if (persisted.gridClass && GRID_KEYS.includes(persisted.gridClass)) gridSizeBtn.textContent = (GRID_KEYS.indexOf(persisted.gridClass) + 1) + '▦';
      else gridSizeBtn.textContent = '▦';
    }

    // sync icons when body class changes
    const classObserver = new MutationObserver(() => {
      if (compactBtn) compactBtn.textContent = document.body.classList.contains('compact') ? '🔎' : '📏';
      if (sidebarBtn) sidebarBtn.textContent = document.body.classList.contains('hide-sidebar') ? '⫸' : '⫷';
    });
    classObserver.observe(document.body, { attributes:true, attributeFilter:['class'] });

    // NAV + render
    if (!nav) { console.error('[dashboard] nav-section missing'); return; }
    nav.innerHTML = '';

    const favBtn = document.createElement('button'); favBtn.type='button'; favBtn.textContent='⭐ Favourites';
    favBtn.addEventListener('click', () => { currentGroup = 'favourites'; render(); updateActive(favBtn); });
    nav.appendChild(favBtn);

    (data.groups || []).forEach(g => {
      const btn = document.createElement('button');
      btn.type='button'; btn.textContent = g.title;
      btn.addEventListener('click', () => { currentGroup = g; render(); updateActive(btn); });
      nav.appendChild(btn);
    });

    function updateActive(activeBtn) {
      nav.querySelectorAll('button').forEach(b => b.classList.remove('active'));
      if (activeBtn) activeBtn.classList.add('active');
    }

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
      if (!items.length) { grid.innerHTML = `<p style="opacity:0.6;">No results.</p>`; return; }
      items.forEach(i => grid.appendChild(createCard(i)));
    }

    function renderAll() {
      if (titleEl) titleEl.textContent = 'All Resources';
      if (showAllBtn) showAllBtn.classList.add('active');
      grid.innerHTML = '';
      (data.groups || []).forEach(g => {
        const section = document.createElement('div'); section.className='section-group';
        const h = document.createElement('h3'); h.textContent = g.title; section.appendChild(h);
        (g.items || []).filter(matchesSearch).forEach(i => section.appendChild(createCard(i)));
        grid.appendChild(section);
      });
    }

    function renderFavourites() {
      if (titleEl) titleEl.textContent = '⭐ Favourites';
      const favItems = (data.groups || []).flatMap(g => (g.items || []).filter(i => favourites.includes(i.title)));
      if (!favItems.length) { grid.innerHTML = `<p style="opacity:0.6;">No favourites yet.</p>`; return; }
      favItems.filter(matchesSearch).forEach(i => grid.appendChild(createCard(i)));
    }

    // createCard: put title + star in a header row to avoid overlap
    function createCard(item) {
      const card = document.createElement('div'); card.className='card';

      const header = document.createElement('div'); header.className='card-header';
      const strong = document.createElement('strong'); strong.textContent = item.title || 'Untitled';
      header.appendChild(strong);

      const starBtn = document.createElement('button');
      starBtn.type = 'button';
      starBtn.className = 'star';
      starBtn.textContent = favourites.includes(item.title) ? '★' : '☆';
      if (favourites.includes(item.title)) starBtn.classList.add('active');
      starBtn.addEventListener('click', (ev) => {
        ev.stopPropagation();
        toggleFavourite(item.title);
        starBtn.textContent = favourites.includes(item.title) ? '★' : '☆';
        starBtn.classList.toggle('active');
      });
      header.appendChild(starBtn);

      card.appendChild(header);

      if (item.img) {
        const img = document.createElement('img');
        img.src = item.img; img.alt = item.title || '';
        img.style.maxWidth='100%'; img.style.borderRadius='6px'; img.style.marginTop='6px';
        card.appendChild(img);
      }

      if (item.notes) {
        const small = document.createElement('small'); small.textContent = item.notes;
        card.appendChild(small);
      }

      card.addEventListener('click', () => { if (item.url) window.open(item.url, '_blank'); });
      return card;
    }

    function toggleFavourite(title) {
      if (!title) return;
      if (favourites.includes(title)) favourites = favourites.filter(f => f !== title);
      else favourites.push(title);
      setLS('favourites', JSON.stringify(favourites));
      dbg('favourites updated', favourites);
    }

    // search
    attach(searchEl, 'input', () => render(), 'searchInput');
    function matchesSearch(i) {
      const q = (searchEl && searchEl.value || '').toLowerCase().trim();
      return !q || (i.title && i.title.toLowerCase().includes(q)) || (i.notes && i.notes.toLowerCase().includes(q));
    }

    // Show All
    if (showAllBtn) showAllBtn.addEventListener('click', (e) => { e.preventDefault(); e.stopPropagation(); currentGroup = null; render(); updateActive(null); });

    // initial render and nav highlight
    render();
    if (currentGroup && nav) {
      const navBtns = Array.from(nav.querySelectorAll('button'));
      const match = navBtns.find(b => b.textContent === currentGroup.title);
      if (match) updateActive(match);
    }

    dbg('initDashboard complete');
  } // end initDashboard
})(); // end IIFE
