/* =========================================================================
   dashboard.js — Resource Hub
   Organization key:
     [S01] Strict mode + micro helpers
     [S02] App state & DOM cache
     [S03] Favourites (load/save/toggle)
     [S04] Card + list rendering
     [S05] Navigation (sidebar buttons)
     [S06] Accent & Theme helpers
     [S07] Data loader (links.json)
     [S08] Search (debounced) + keyboard shortcuts
     [S09] Settings overlay + persistence (theme, view, compact, accent)
     [S10] Import/Export/Reset of preferences
     [S11] Sidebar collapse + persistence
     [S12] App bootstrap (DOMContentLoaded)
   ========================================================================= */

(function () {
  'use strict';

  // [S01] -------------------------------------------------------------------
  // Tiny utilities kept dependency-free and crash-proof (LS is try/catch).
  const qs = (id) => document.getElementById(id); // get by id
  const $ = (sel, root = document) => root.querySelector(sel); // first match
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel)); // all matches

  const setLS = (k, v) => {
    try {
      localStorage.setItem(k, v);
    } catch (_) {}
  };
  const getLS = (k, fallback = null) => {
    try {
      const v = localStorage.getItem(k);
      return v === null ? fallback : v;
    } catch (_) {
      return fallback;
    }
  };
  const parseJSON = (s, fallback) => {
    try {
      return JSON.parse(s);
    } catch {
      return fallback;
    }
  };

  // [S02] -------------------------------------------------------------------
  // App state (data + UI memory) and one-time DOM lookups.
  let groups = []; // Loaded from links.json: [{ title, items: [{ title, url, notes }] }]
  let currentGroup = null; // Currently shown group (or null for "All")
  let favSet = new Set(); // Cached favourites (Set of titles)
  let searchTerm = ''; // Lowercased search text
  let searchDebounceId = null; // Debounce handle

  // Cache DOM nodes once; we re-use references everywhere.
  const grid = qs('grid');
  const nav = qs('nav-section');
  const showAllBtn = qs('show-all-toggle');
  const themeBtn = qs('theme-toggle');
  const settingsBtn = qs('settings-btn');
  const overlay = qs('settings-overlay');
  const settingsClose = qs('settings-close');
  const accentSlider = qs('accent-brightness');
  const compactToggle = qs('compact-mode');
  const sectionTitle = qs('section-title');
  const searchEl = qs('search');
  const aside = document.querySelector('aside');
  const sidebarToggle = qs('sidebar-toggle');

  // [S03] -------------------------------------------------------------------
  // Favourites (localStorage <-> Set) with tiny DOM sync for the star button.
  const FAV_KEY = 'favourites';

  function loadFavs() {
    favSet = new Set(parseJSON(getLS(FAV_KEY, '[]'), []));
  }

  function saveFavs() {
    setLS(FAV_KEY, JSON.stringify([...favSet]));
  }

  function toggleFav(title, btnEl) {
    // Toggle in-memory
    favSet.has(title) ? favSet.delete(title) : favSet.add(title);
    // Persist
    saveFavs();
    // Reflect in UI (if a button element was provided)
    if (btnEl) {
      const active = favSet.has(title);
      btnEl.textContent = active ? '★' : '☆';
      btnEl.classList.toggle('active', active);
      btnEl.setAttribute('aria-label', active ? 'Unfavourite' : 'Favourite');
    }
  }

  // [S04] -------------------------------------------------------------------
  // Rendering: cards, groups, "All", favourites, and generic list render.
  function cardEl(item) {
    // Card shell
    const c = document.createElement('div');
    c.className = 'card';
    c.tabIndex = 0;
    c.setAttribute('role', 'link');
    c.setAttribute('aria-label', item.title);

    // Header with title + favourite star
    const header = document.createElement('div');
    header.className = 'card-header';

    const title = document.createElement('span');
    title.className = 'card-title';
    title.textContent = item.title;

    const star = document.createElement('button');
    star.type = 'button';
    star.textContent = favSet.has(item.title) ? '★' : '☆';
    star.className = 'star-btn';
    star.setAttribute('aria-label', favSet.has(item.title) ? 'Unfavourite' : 'Favourite');

    header.appendChild(title);
    header.appendChild(star);
    c.appendChild(header);

    // Optional note
    if (item.notes) {
      const note = document.createElement('small');
      note.textContent = item.notes;
      c.appendChild(note);
    }

    // Interactions
    c.addEventListener('click', () => {
      if (item.url) window.open(item.url, '_blank', 'noopener');
    });
    c.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && item.url) window.open(item.url, '_blank', 'noopener');
    });

    star.addEventListener('click', (ev) => {
      ev.stopPropagation();
      toggleFav(item.title, star);
    });

    return c;
  }

  function renderItems(items, titleText) {
    sectionTitle.textContent = titleText;
    grid.replaceChildren();

    if (!items.length) {
      const p = document.createElement('p');
      p.style.opacity = '.6';
      p.textContent = 'No results.';
      grid.appendChild(p);
      return;
    }

    const frag = document.createDocumentFragment();
    for (const it of items) frag.appendChild(cardEl(it));
    grid.appendChild(frag);
  }

  function filterItems(list) {
    if (!searchTerm) return list;
    return list.filter(
      (i) => i.title.toLowerCase().includes(searchTerm) || (i.notes || '').toLowerCase().includes(searchTerm)
    );
  }

  function renderGroup(g) {
    currentGroup = g;
    renderItems(filterItems(g.items || []), g.title);
  }

  function renderAll() {
    currentGroup = null;
    sectionTitle.textContent = 'All Resources';
    grid.replaceChildren();

    const frag = document.createDocumentFragment();
    for (const g of groups) {
      const group = document.createElement('div');
      group.className = 'group-block';

      const h = document.createElement('h3');
      h.textContent = g.title;

      const inner = document.createElement('div');
      inner.className = 'inner-grid';

      for (const it of filterItems(g.items || [])) inner.appendChild(cardEl(it));

      group.appendChild(h);
      group.appendChild(inner);
      frag.appendChild(group);
    }
    grid.appendChild(frag);
  }

  function renderFavs() {
    const allItems = groups.flatMap((g) => g.items || []);
    const items = filterItems(allItems.filter((i) => favSet.has(i.title)));
    renderItems(items, '⭐ Favourites');
  }

  // [S05] -------------------------------------------------------------------
  // Sidebar navigation: build buttons for Favourites + each group, track active.
  function buildNav() {
    nav.replaceChildren();

    // Favourites "virtual group"
    const favBtn = document.createElement('button');
    favBtn.textContent = '⭐ Favourites';
    favBtn.addEventListener('click', () => {
      setActiveButton(favBtn);
      renderFavs();
    });
    nav.appendChild(favBtn);

    // One button per group
    for (const g of groups) {
      const b = document.createElement('button');
      b.textContent = g.title;
      b.addEventListener('click', () => {
        setActiveButton(b);
        renderGroup(g);
      });
      nav.appendChild(b);
    }
  }

  function setActiveButton(activeBtn) {
    $$('button', nav).forEach((b) => b.classList.toggle('active', b === activeBtn));
    if (showAllBtn) showAllBtn.classList.toggle('active', !activeBtn);
  }

  // [S06] -------------------------------------------------------------------
  // Accent color helpers: adjust brightness on top of a saved base accent.
  function hexToRgb(hex) {
    hex = hex.replace('#', '');
    if (hex.length === 3)
      hex = hex
        .split('')
        .map((h) => h + h)
        .join('');
    const n = parseInt(hex, 16);
    return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
  }
  function rgbToHex(r, g, b) {
    const h = (v) =>
      Math.max(0, Math.min(255, Math.round(v)))
        .toString(16)
        .padStart(2, '0');
    return `#${h(r)}${h(g)}${h(b)}`;
  }
  function applyAccentShift() {
    const base = getLS('accent') || '#0a84ff';
    const shift = parseInt(accentSlider?.value || '0', 10);
    const c = hexToRgb(base);
    const mod = (v) => Math.min(255, Math.max(0, v + shift * 2)); // small 2px step feels controllable
    const hex = rgbToHex(mod(c.r), mod(c.g), mod(c.b));
    const root = document.documentElement;
    root.style.setProperty('--accent', hex);
    root.style.setProperty('--accent-strong', hex);
    setLS('accentShift', String(shift));
  }

  // [S07] -------------------------------------------------------------------
  // Data loader: fetch links.json (no-cache) and render initial view.
  async function loadData() {
    try {
      const res = await fetch('links.json', { cache: 'no-store' });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();

      groups = data.groups || [];
      buildNav();

      // Default view behavior
      const def = getLS('defaultView', 'all');
      if (def === 'favs') {
        renderFavs();
        setActiveButton(null);
      } else if (def === 'first' && groups[0]) {
        setActiveButton(nav.querySelectorAll('button')[1] || null); // [0] is Favourites
        renderGroup(groups[0]);
      } else {
        renderAll();
        setActiveButton(null);
        showAllBtn?.classList.add('active');
      }
    } catch (err) {
      console.error('⚠️ Failed to load links.json', err);
      grid.innerHTML = '<p style="color:red;">Could not load links.json</p>';
    }
  }

  // [S08] -------------------------------------------------------------------
  // Search with debounce + keyboard shortcuts for quick focus.
  function handleSearchInput() {
    searchTerm = (searchEl?.value || '').toLowerCase().trim();
    if (currentGroup) {
      renderGroup(currentGroup);
    } else {
      const activeText = $('.nav-section button.active')?.textContent || '';
      activeText.includes('Favourites') ? renderFavs() : renderAll();
    }
  }
  function debouncedSearch() {
    clearTimeout(searchDebounceId);
    searchDebounceId = setTimeout(handleSearchInput, 120); // 120ms feels snappy without reflow spam
  }

  // [S09] -------------------------------------------------------------------
  // Settings overlay + preferences wiring (theme, view, compact, accent).
  function initSettingsAndPrefs() {
    // Open/close dialog + ESC to close
    if (settingsBtn && overlay) {
      settingsBtn.addEventListener('click', () => overlay.classList.add('visible'));
      overlay.addEventListener('click', (e) => {
        if (e.target === overlay) overlay.classList.remove('visible');
      });
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') overlay.classList.remove('visible');
      });
    }
    if (settingsClose && overlay) {
      settingsClose.addEventListener('click', () => overlay.classList.remove('visible'));
    }

    // Theme toggle button (moon/sun)
    if (themeBtn) {
      const icons = { moon: '🌙', sun: '☀️' };
      const getActual = () => document.documentElement.dataset.theme;
      const updateIcon = () => {
        const dark = getActual() === 'dark';
        themeBtn.textContent = dark ? icons.sun : icons.moon;
        themeBtn.setAttribute('aria-label', dark ? 'Switch to light' : 'Switch to dark');
      };
      themeBtn.addEventListener('click', () => {
        const next = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
        if (window.__hubTheme?.setTheme) window.__hubTheme.setTheme(next);
        else {
          document.documentElement.dataset.theme = next;
          setLS('theme', next);
        }
        updateIcon();
      });
      updateIcon();
    }

    // Theme radio pills (auto/light/dark)
    $$('input[name="theme"]').forEach((r) => {
      r.addEventListener('change', () => {
        const val = r.value;
        if (window.__hubTheme?.setTheme) window.__hubTheme.setTheme(val);
        else {
          const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
          const actual = val === 'auto' ? (prefersDark ? 'dark' : 'light') : val;
          document.documentElement.dataset.theme = actual;
          setLS('theme', val);
        }
      });
    });
    // Reflect saved theme selection (so pills stay in sync)
    (() => {
      const saved = getLS('theme', 'auto');
      const input = document.querySelector(`input[name="theme"][value="${saved}"]`);
      if (input) input.checked = true;
    })();

    // Default view pills (All / First / Favourites)
    $$('input[name="default-view"]').forEach((r) => {
      const saved = getLS('defaultView', 'all');
      if (r.value === saved) r.checked = true;
      r.addEventListener('change', () => {
        if (r.checked) setLS('defaultView', r.value);
      });
    });
    // Ensure radio reflects persisted value on load
    (() => {
      const saved = getLS('defaultView', 'all');
      const input = document.querySelector(`input[name="default-view"][value="${saved}"]`);
      if (input) input.checked = true;
    })();

    // Accent brightness slider + swatches
    if (accentSlider) {
      accentSlider.value = getLS('accentShift', '0');
      accentSlider.addEventListener('input', applyAccentShift);
      applyAccentShift();
    }
    const savedAccent = getLS('accent');
    if (savedAccent) {
      $$('.swatch').forEach((s) =>
        s.classList.toggle('selected', s.dataset.color?.toLowerCase() === savedAccent.toLowerCase())
      );
    }
    $$('.swatch').forEach((s) => {
      s.addEventListener('click', () => {
        const color = s.dataset.color;
        document.documentElement.style.setProperty('--accent', color);
        document.documentElement.style.setProperty('--accent-strong', color);
        setLS('accent', color);
        $$('.swatch').forEach((x) => x.classList.toggle('selected', x === s));
        applyAccentShift();
      });
    });

    // Compact mode
    if (getLS('compactMode') === 'true') document.body.classList.add('compact-mode');
    if (compactToggle) {
      compactToggle.checked = document.body.classList.contains('compact-mode');
      compactToggle.addEventListener('change', () => {
        document.body.classList.toggle('compact-mode', compactToggle.checked);
        setLS('compactMode', String(compactToggle.checked));
      });
    }
  }

  // [S10] -------------------------------------------------------------------
  // Import/Export/Reset preferences (simple JSON file).
  function initImportExportReset() {
    const exportBtn = qs('export-settings');
    const importBtn = qs('import-settings');
    const importFile = qs('import-file');
    const resetBtn = qs('reset-settings');
    const confirmReset = qs('confirm-reset');

    // Export: dump selected LS keys as a JSON download.
    if (exportBtn) {
      exportBtn.addEventListener('click', () => {
        const keys = ['theme', 'accent', 'accentShift', 'compactMode', 'defaultView', 'collapsedSidebar', 'favourites'];
        const data = {};
        keys.forEach((k) => (data[k] = getLS(k)));
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'resource-hub-settings.json';
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
      });
    }

    // Import: read JSON file and rehydrate LS + sync UI bits where needed.
    if (importBtn && importFile) {
      importBtn.addEventListener('click', () => importFile.click());
      importFile.addEventListener('change', async () => {
        const file = importFile.files?.[0];
        if (!file) return;
        try {
          const text = await file.text();
          const data = JSON.parse(text);

          Object.entries(data).forEach(([k, v]) => {
            if (v !== undefined) setLS(k, String(v));
          });

          // Reflect theme immediately if helper exists
          if (data.theme && window.__hubTheme?.setTheme) window.__hubTheme.setTheme(data.theme);

          // Accent + selection ring
          if (data.accent) {
            document.documentElement.style.setProperty('--accent', data.accent);
            document.documentElement.style.setProperty('--accent-strong', data.accent);
            $$('.swatch').forEach((x) =>
              x.classList.toggle('selected', x.dataset.color?.toLowerCase() === data.accent.toLowerCase())
            );
          }

          // Accent brightness slider
          if (typeof data.accentShift !== 'undefined') {
            const v = String(data.accentShift);
            const slider = qs('accent-brightness');
            if (slider) slider.value = v;
            applyAccentShift();
          }

          // Compact mode reflect
          if (typeof data.compactMode !== 'undefined') {
            document.body.classList.toggle('compact-mode', data.compactMode === 'true');
            const t = qs('compact-mode');
            if (t) t.checked = data.compactMode === 'true';
          }

          // Default view radio reflect
          if (typeof data.defaultView !== 'undefined') {
            const input = document.querySelector(`input[name="default-view"][value="${data.defaultView}"]`);
            if (input) input.checked = true;
          }

          // Sidebar collapsed reflect
          if (typeof data.collapsedSidebar !== 'undefined') {
            const collapsed = data.collapsedSidebar === 'true';
            aside.classList.toggle('collapsed', collapsed);
            sidebarToggle?.setAttribute('aria-expanded', (!collapsed).toString());
          }

          // Re-render according to current state
          handleSearchInput();
        } catch (e) {
          console.error('Failed to import settings:', e);
          alert('Invalid settings file.');
        } finally {
          importFile.value = '';
        }
      });
    }

    // Reset: wipe keys, restore defaults, re-render All.
    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        if (confirmReset?.checked !== false) {
          const ok = confirm('Reset all saved settings? This clears your preferences and favourites.');
          if (!ok) return;
        }
        const keys = ['theme', 'accent', 'accentShift', 'compactMode', 'defaultView', 'collapsedSidebar', 'favourites'];
        keys.forEach((k) => localStorage.removeItem(k));
        favSet.clear();

        // Restore sensible defaults visually
        window.__hubTheme?.setTheme('auto');
        document.documentElement.style.setProperty('--accent', '#0a84ff');
        document.documentElement.style.setProperty('--accent-strong', '#0a84ff');

        const slider = qs('accent-brightness');
        if (slider) slider.value = '0';
        applyAccentShift();

        const t = qs('compact-mode');
        if (t) t.checked = false;
        document.body.classList.remove('compact-mode');

        $$('.swatch').forEach((x) => x.classList.remove('selected'));
        const input = document.querySelector(`input[name="default-view"][value="all"]`);
        if (input) input.checked = true;

        renderAll();
        setActiveButton(null);
        showAllBtn?.classList.add('active');
      });
    }
  }

  // [S11] -------------------------------------------------------------------
  // Sidebar collapse persistence (button only appears when collapsed via CSS).
  function initSidebarPersistence() {
    const collapsedSaved = getLS('collapsedSidebar', 'false') === 'true';
    if (collapsedSaved) aside.classList.add('collapsed');

    if (sidebarToggle) {
      sidebarToggle.setAttribute('aria-expanded', (!collapsedSaved).toString());
      sidebarToggle.addEventListener('click', () => {
        const collapsed = aside.classList.toggle('collapsed');
        setLS('collapsedSidebar', String(collapsed));
        sidebarToggle.setAttribute('aria-expanded', (!collapsed).toString());
        // Visibility is handled purely by CSS:
        //   main #sidebar-toggle { display:none }
        //   aside.collapsed + main #sidebar-toggle { display:inline-flex }
      });
    }
  }

  // [S12] -------------------------------------------------------------------
  // App bootstrap: wire everything after DOM is ready.
  document.addEventListener('DOMContentLoaded', () => {
    loadFavs(); // pull favourites from LS (so stars render correctly)
    initSettingsAndPrefs(); // settings panel, theme/view/compact/accent wiring
    initImportExportReset(); // import/export/reset buttons
    initSidebarPersistence(); // sidebar collapsed state

    // Show All button (top-right of main)
    showAllBtn?.addEventListener('click', () => {
      currentGroup = null;
      renderAll();
      setActiveButton(null);
      showAllBtn.classList.add('active');
    });

    // Search: input + shortcuts (Ctrl/Cmd+K and Ctrl/Cmd+F focus it)
    if (searchEl) {
      searchEl.addEventListener('input', debouncedSearch);
      const isMac = navigator.platform.toUpperCase().includes('MAC');

      // Quick open "omnibox" vibe
      document.addEventListener('keydown', (e) => {
        const mod = isMac ? e.metaKey : e.ctrlKey;
        if (mod && e.key.toLowerCase() === 'k') {
          e.preventDefault();
          searchEl.focus();
          searchEl.select();
        }
      });
      // Override browser find to focus our search
      document.addEventListener('keydown', (e) => {
        const mod = isMac ? e.metaKey : e.ctrlKey;
        if (mod && e.key.toLowerCase() === 'f') {
          e.preventDefault();
          searchEl.focus();
          searchEl.select();
        }
      });
    }

    // Finally load data + initial render
    loadData();
  });
})();
