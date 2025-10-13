// dashboard.js (defensive + debug logging + toggle handlers)
// Replace your existing dashboard.js with this file.

(function () {
  // --- Utility helpers ---
  const log = (...args) => { console.debug('[dashboard]', ...args); };
  function qs(id) { return document.getElementById(id); }
  function safeJSONParse(s, fallback) {
    try { return JSON.parse(s); } catch (e) { return fallback; }
  }
  function setLS(k, v) { try { localStorage.setItem(k, v); } catch(e) { /* ignore */ } }
  function rmLS(k) { try { localStorage.removeItem(k); } catch(e) { /* ignore */ } }

  // toggle class + persist (returns enabled boolean)
  function toggleClassPersist(cls, iconElem, onGlyph, offGlyph) {
    const enabled = document.body.classList.toggle(cls);
    setLS(cls, enabled ? "true" : "false");
    if (iconElem) iconElem.textContent = enabled ? (onGlyph ?? iconElem.textContent) : (offGlyph ?? iconElem.textContent);
    log('toggled', cls, enabled);
    return enabled;
  }

  // Safe: attach listener if element exists, otherwise warn
  function attach(el, ev, fn, name) {
    if (!el) { console.warn(`[dashboard] element missing for ${name}`); return; }
    el.addEventListener(ev, fn);
  }

  // Wait for DOM ready then fetch + init
  document.addEventListener("DOMContentLoaded", () => {
    fetch("links.json")
      .then(res => {
        if (!res.ok) throw new Error(`Failed to load links.json: ${res.status}`);
        return res.json();
      })
      .then(data => initDashboard(data))
      .catch(err => {
        console.error("[dashboard] Error loading links.json:", err);
        const grid = qs("grid");
        if (grid) grid.innerHTML = `<p style="color:red;">⚠️ Could not load links.json</p>`;
      });
  });

  // ---------- main ----------
  function initDashboard(data) {
    log('initDashboard');

    // DOM refs
    const nav = qs("nav-section");
    const grid = qs("grid");
    const title = qs("section-title");
    const search = qs("search");
    const showAllBtn = qs("show-all-toggle");

    // toggles (icons/buttons)
    const themeToggle = qs("theme-toggle");
    const layoutToggle = qs("layout-toggle");
    const compactToggle = qs("compact-toggle");
    const sidebarToggle = qs("sidebar-toggle");
    const gridSizeToggle = qs("grid-size-toggle");
    const cardSizeToggle = qs("card-size-toggle");
    const imagesToggle = qs("images-toggle");
    const contrastToggle = qs("contrast-toggle");
    const palette = qs("color-palette");

    // state + restore persisted classes early
    let favourites = safeJSONParse(localStorage.getItem("favourites"), []);
    if (localStorage.getItem("vertical-layout") === "true") document.body.classList.add("vertical-layout");
    if (localStorage.getItem("compact") === "true") document.body.classList.add("compact");
    if (localStorage.getItem("hide-sidebar") === "true") document.body.classList.add("hide-sidebar");
    if (localStorage.getItem("images-hidden") === "true") document.body.classList.add("images-hidden");
    if (localStorage.getItem("high-contrast") === "true") document.body.classList.add("high-contrast");
    const savedGridClass = localStorage.getItem("grid-class");
    if (savedGridClass) document.body.classList.add(savedGridClass);
    const savedCardClass = localStorage.getItem("card-class") || "card-medium";
    if (savedCardClass) document.body.classList.add(savedCardClass);

    // Theme init
    const storedTheme = localStorage.getItem("theme") || (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
    document.body.dataset.theme = storedTheme;
    document.documentElement.dataset.theme = storedTheme;
    if (themeToggle) themeToggle.textContent = document.body.dataset.theme === "dark" ? "🌞" : "🌙";

    // Accent palette (safe)
    const colors = ["#0a84ff","#34c759","#ff2d55","#af52de","#ff9f0a","#5ac8fa"];
    const savedAccent = localStorage.getItem("accent") || "#0a84ff";
    if (palette) {
      palette.innerHTML = "";
      colors.forEach(c => {
        const dot = document.createElement("div");
        dot.className = "color-dot";
        dot.style.background = c;
        if (c === savedAccent) dot.classList.add("active");
        attach(dot, "click", () => {
          setLS("accent", c);
          document.documentElement.style.setProperty("--accent", c);
          palette.querySelectorAll(".color-dot").forEach(d => d.classList.remove("active"));
          dot.classList.add("active");
          const meta = document.querySelector("meta[name='theme-color']");
          if (meta) meta.setAttribute("content", c);
          log('accent set', c);
        }, `palette-dot-${c}`);
        palette.appendChild(dot);
      });
      // apply saved accent
      document.documentElement.style.setProperty("--accent", savedAccent);
      const meta = document.querySelector("meta[name='theme-color']");
      if (meta) meta.setAttribute("content", savedAccent);
    }

    // ---------- Toggle handlers (defensive) ----------

    // Theme toggle
    attach(themeToggle, "click", (e) => {
      e.preventDefault(); e.stopPropagation();
      const newTheme = document.body.dataset.theme === "dark" ? "light" : "dark";
      document.body.dataset.theme = newTheme;
      document.documentElement.dataset.theme = newTheme;
      setLS("theme", newTheme);
      themeToggle.textContent = newTheme === "dark" ? "🌞" : "🌙";
      log('theme toggled', newTheme);
    }, "themeToggle");

    // Layout toggle (vertical/layout)
    attach(layoutToggle, "click", (e) => {
      e.preventDefault(); e.stopPropagation();
      const enabled = toggleClassPersist("vertical-layout", layoutToggle, "⬍", "⇆");
      setLS("vertical-layout", enabled ? "true" : "false");
    }, "layoutToggle");
    // set initial icon
    if (layoutToggle) layoutToggle.textContent = document.body.classList.contains("vertical-layout") ? "⬍" : "⇆";

    // Compact toggle
    function applyCompact(enabled) {
      document.body.classList.toggle("compact", enabled);
      if (compactToggle) compactToggle.textContent = enabled ? "🔎" : "📏";
      log('compact', enabled);
    }
    attach(compactToggle, "click", (e) => {
      e.preventDefault(); e.stopPropagation();
      const enabled = !document.body.classList.contains("compact");
      applyCompact(enabled);
      setLS("compact", enabled ? "true" : "false");
    }, "compactToggle");
    applyCompact(document.body.classList.contains("compact"));

    // Sidebar toggle
    attach(sidebarToggle, "click", (e) => {
      e.preventDefault(); e.stopPropagation();
      const enabled = toggleClassPersist("hide-sidebar", sidebarToggle, "⫸", "⫷");
      setLS("hide-sidebar", enabled ? "true" : "false");
    }, "sidebarToggle");
    if (sidebarToggle) sidebarToggle.textContent = document.body.classList.contains("hide-sidebar") ? "⫸" : "⫷";

    // Grid size cycle
    const GRID_KEYS = ["grid-1","grid-2","grid-3"];
    function getCurrentGridIndex() { return GRID_KEYS.findIndex(k => document.body.classList.contains(k)); }
    attach(gridSizeToggle, "click", (e) => {
      e.preventDefault(); e.stopPropagation();
      let idx = getCurrentGridIndex();
      GRID_KEYS.forEach(k => document.body.classList.remove(k));
      idx = (idx + 1) % (GRID_KEYS.length + 1); // extra = auto
      if (idx < GRID_KEYS.length) {
        document.body.classList.add(GRID_KEYS[idx]);
        setLS("grid-class", GRID_KEYS[idx]);
        gridSizeToggle.textContent = (idx + 1) + "▦";
      } else {
        rmLS("grid-class");
        gridSizeToggle.textContent = "▦";
      }
      log('grid size cycle', idx);
    }, "gridSizeToggle");
    // restore label
    if (gridSizeToggle) {
      if (savedGridClass && GRID_KEYS.includes(savedGridClass)) {
        gridSizeToggle.textContent = (GRID_KEYS.indexOf(savedGridClass) + 1) + "▦";
      } else {
        gridSizeToggle.textContent = "▦";
      }
    }

    // Card size cycle
    const CARD_KEYS = ["card-small","card-medium","card-large"];
    attach(cardSizeToggle, "click", (e) => {
      e.preventDefault(); e.stopPropagation();
      let idx = CARD_KEYS.findIndex(k => document.body.classList.contains(k));
      CARD_KEYS.forEach(k => document.body.classList.remove(k));
      idx = (idx + 1) % CARD_KEYS.length;
      document.body.classList.add(CARD_KEYS[idx]);
      setLS("card-class", CARD_KEYS[idx]);
      cardSizeToggle.textContent = ["S","M","L"][idx];
      log('card size', CARD_KEYS[idx]);
    }, "cardSizeToggle");
    if (cardSizeToggle) cardSizeToggle.textContent = savedCardClass === "card-small" ? "S" : (savedCardClass === "card-large" ? "L" : "M");

    // Images toggle
    attach(imagesToggle, "click", (e) => {
      e.preventDefault(); e.stopPropagation();
      const enabled = toggleClassPersist("images-hidden", imagesToggle, "🖼️", "🖼️");
      setLS("images-hidden", enabled ? "true" : "false");
    }, "imagesToggle");

    // High contrast toggle
    attach(contrastToggle, "click", (e) => {
      e.preventDefault(); e.stopPropagation();
      const enabled = toggleClassPersist("high-contrast", contrastToggle, "⚪", "⚫");
      setLS("high-contrast", enabled ? "true" : "false");
    }, "contrastToggle");
    if (contrastToggle) contrastToggle.textContent = document.body.classList.contains("high-contrast") ? "⚪" : "⚫";

    // Keep icons synced if other code toggles classes
    const classObs = new MutationObserver(() => {
      if (layoutToggle) layoutToggle.textContent = document.body.classList.contains("vertical-layout") ? "⬍" : "⇆";
      if (compactToggle) compactToggle.textContent = document.body.classList.contains("compact") ? "🔎" : "📏";
      if (sidebarToggle) sidebarToggle.textContent = document.body.classList.contains("hide-sidebar") ? "⫸" : "⫷";
      if (contrastToggle) contrastToggle.textContent = document.body.classList.contains("high-contrast") ? "⚪" : "⚫";
    });
    classObs.observe(document.body, { attributes: true, attributeFilter: ["class"] });

    // ---------- Dashboard UI: nav, render, cards ----------

    // build sidebar nav
    nav.innerHTML = "";
    const favBtn = document.createElement("button");
    favBtn.type = "button";
    favBtn.textContent = "⭐ Favourites";
    favBtn.addEventListener("click", () => { currentGroup = "favourites"; render(); updateActive(favBtn); });
    nav.appendChild(favBtn);

    (data.groups || []).forEach(g => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.textContent = g.title;
      btn.addEventListener("click", () => { currentGroup = g; render(); updateActive(btn); });
      nav.appendChild(btn);
    });

    function updateActive(activeBtn) {
      nav.querySelectorAll("button").forEach(b => b.classList.remove("active"));
      if (activeBtn) activeBtn.classList.add("active");
    }

    // render helpers
    let currentGroup = (data.groups && data.groups[0]) || null;

    function render() {
      grid.innerHTML = "";
      if (currentGroup === "favourites") return renderFavourites();
      if (currentGroup === null) return renderAll();
      return renderGroup(currentGroup);
    }

    function renderGroup(group) {
      title.textContent = group.title;
      showAllBtn.classList.remove("active");
      const items = (group.items || []).filter(matchesSearch);
      if (!items.length) { grid.innerHTML = `<p style="opacity:0.6;">No results.</p>`; return; }
      items.forEach(i => grid.appendChild(createCard(i)));
    }

    function renderAll() {
      title.textContent = "All Resources";
      showAllBtn.classList.add("active");
      grid.innerHTML = "";
      (data.groups || []).forEach(g => {
        const section = document.createElement("div");
        section.className = "section-group";
        const h = document.createElement("h3");
        h.textContent = g.title;
        section.appendChild(h);
        (g.items || []).filter(matchesSearch).forEach(i => section.appendChild(createCard(i)));
        grid.appendChild(section);
      });
    }

    function renderFavourites() {
      title.textContent = "⭐ Favourites";
      const favItems = (data.groups || []).flatMap(g => (g.items || []).filter(i => favourites.includes(i.title)));
      if (!favItems.length) { grid.innerHTML = `<p style="opacity:0.6;">No favourites yet.</p>`; return; }
      favItems.filter(matchesSearch).forEach(i => grid.appendChild(createCard(i)));
    }

    function createCard(item) {
      const card = document.createElement("div");
      card.className = "card";
      const titleEl = document.createElement("strong");
      titleEl.textContent = item.title || "Untitled";
      card.appendChild(titleEl);

      if (item.img) {
        const img = document.createElement("img");
        img.src = item.img;
        img.alt = item.title || "";
        img.style.maxWidth = "100%";
        img.style.borderRadius = "6px";
        img.style.marginTop = "6px";
        card.appendChild(img);
      }

      if (item.notes) {
        const small = document.createElement("small");
        small.textContent = item.notes;
        card.appendChild(small);
      }

      const star = document.createElement("span");
      star.className = "star";
      star.textContent = favourites.includes(item.title) ? "★" : "☆";
      if (favourites.includes(item.title)) star.classList.add("active");
      star.addEventListener("click", (e) => {
        e.stopPropagation();
        toggleFavourite(item.title);
        star.textContent = favourites.includes(item.title) ? "★" : "☆";
        star.classList.toggle("active");
      });
      card.appendChild(star);

      card.addEventListener("click", () => { if (item.url) window.open(item.url, "_blank"); });
      return card;
    }

    function toggleFavourite(title) {
      if (!title) return;
      if (favourites.includes(title)) favourites = favourites.filter(f => f !== title);
      else favourites.push(title);
      setLS("favourites", JSON.stringify(favourites));
      log('favourites', favourites);
    }

    // search
    attach(search, "input", () => render(), "searchInput");
    function matchesSearch(i) {
      const q = (search && search.value || "").toLowerCase().trim();
      return !q || (i.title && i.title.toLowerCase().includes(q)) || (i.notes && i.notes.toLowerCase().includes(q));
    }

    // show all
    if (showAllBtn) showAllBtn.addEventListener("click", (e) => { e.preventDefault(); e.stopPropagation(); currentGroup = null; render(); updateActive(null); });

    // initial render + highlight nav button
    render();
    if (currentGroup && nav) {
      const btns = Array.from(nav.querySelectorAll("button"));
      const match = btns.find(b => b.textContent === currentGroup.title);
      if (match) updateActive(match);
    }

    // restore other UI icons (initial)
    if (layoutToggle) layoutToggle.textContent = document.body.classList.contains("vertical-layout") ? "⬍" : "⇆";
    if (compactToggle) compactToggle.textContent = document.body.classList.contains("compact") ? "🔎" : "📏";
    if (sidebarToggle) sidebarToggle.textContent = document.body.classList.contains("hide-sidebar") ? "⫸" : "⫷";
    if (contrastToggle) contrastToggle.textContent = document.body.classList.contains("high-contrast") ? "⚪" : "⚫";

    log('initDashboard complete');
  } // end initDashboard
})(); // end module
