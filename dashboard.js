// dashboard.js
// Ducks in the Pool — unified dashboard logic + toggle handlers
// Copy this whole file as-is to replace your existing dashboard.js

(function () {
  // --- Utility helpers ---
  function qs(id) { return document.getElementById(id); }
  function toggleClassPersist(cls, iconElem, onGlyph, offGlyph) {
    const enabled = document.body.classList.toggle(cls);
    try { localStorage.setItem(cls, enabled ? "true" : "false"); } catch(e) {}
    if (iconElem) iconElem.textContent = enabled ? (onGlyph ?? iconElem.textContent) : (offGlyph ?? iconElem.textContent);
    return enabled;
  }
  function safeJSONParse(s, fallback) {
    try { return JSON.parse(s); } catch(e) { return fallback; }
  }

  // Fetch links.json and init
  document.addEventListener("DOMContentLoaded", () => {
    fetch("links.json")
      .then(res => {
        if (!res.ok) throw new Error(`Failed to load links.json: ${res.status}`);
        return res.json();
      })
      .then(data => initDashboard(data))
      .catch(err => {
        console.error("Error loading links.json:", err);
        const grid = qs("grid");
        if (grid) grid.innerHTML = `<p style="color:red;">⚠️ Could not load links.json</p>`;
      });
  });

  // main
  function initDashboard(data) {
    // === DOM refs ===
    const nav = qs("nav-section");
    const grid = qs("grid");
    const title = qs("section-title");
    const search = qs("search");
    const showAllBtn = qs("show-all-toggle");
    const themeToggle = qs("theme-toggle");
    const layoutToggle = qs("layout-toggle");
    const compactToggle = qs("compact-toggle");

    // Extra toggles
    const sidebarToggle = qs("sidebar-toggle");
    const gridSizeToggle = qs("grid-size-toggle");
    const cardSizeToggle = qs("card-size-toggle");
    const imagesToggle = qs("images-toggle");
    const contrastToggle = qs("contrast-toggle");

    // === State ===
    let currentGroup = null;
    let favourites = safeJSONParse(localStorage.getItem("favourites"), []);
    let compactMode = localStorage.getItem("compact") === "true";
    // layout persisted via class 'vertical-layout'
    // initialize any persisted classes early (so CSS reflects correctly)
    if (localStorage.getItem("vertical-layout") === "true") document.body.classList.add("vertical-layout");
    if (localStorage.getItem("compact") === "true") document.body.classList.add("compact");
    if (localStorage.getItem("hide-sidebar") === "true") document.body.classList.add("hide-sidebar");
    if (localStorage.getItem("images-hidden") === "true") document.body.classList.add("images-hidden");
    if (localStorage.getItem("high-contrast") === "true") document.body.classList.add("high-contrast");
    const savedGridClass = localStorage.getItem("grid-class");
    if (savedGridClass) document.body.classList.add(savedGridClass);
    const savedCardClass = localStorage.getItem("card-class") || "card-medium";
    if (savedCardClass) document.body.classList.add(savedCardClass);

    // === Theme ===
    const storedTheme = localStorage.getItem("theme") || (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
    document.body.dataset.theme = storedTheme;
    document.documentElement.dataset.theme = storedTheme;
    updateThemeIcon();

    if (themeToggle) {
      themeToggle.onclick = () => {
        const newTheme = document.body.dataset.theme === "dark" ? "light" : "dark";
        document.body.dataset.theme = newTheme;
        document.documentElement.dataset.theme = newTheme;
        localStorage.setItem("theme", newTheme);
        updateThemeIcon();
      };
    }
    function updateThemeIcon() {
      if (!themeToggle) return;
      themeToggle.textContent = document.body.dataset.theme === "dark" ? "🌞" : "🌙";
    }

    // === Accent palette ===
    const palette = qs("color-palette");
    const colors = ["#0a84ff","#34c759","#ff2d55","#af52de","#ff9f0a","#5ac8fa"];
    const savedAccent = localStorage.getItem("accent") || "#0a84ff";
    updateAccent(savedAccent);
    if (palette) {
      palette.innerHTML = "";
      colors.forEach(c => {
        const dot = document.createElement("div");
        dot.className = "color-dot";
        dot.style.background = c;
        if (c === savedAccent) dot.classList.add("active");
        dot.onclick = () => {
          localStorage.setItem("accent", c);
          updateAccent(c);
          palette.querySelectorAll(".color-dot").forEach(d => d.classList.remove("active"));
          dot.classList.add("active");
        };
        palette.appendChild(dot);
      });
    }
    function updateAccent(c) {
      document.documentElement.style.setProperty("--accent", c);
      const meta = document.querySelector("meta[name='theme-color']");
      if (meta) meta.setAttribute("content", c);
    }

    // === Layout toggle (vertical/list) ===
    if (layoutToggle) {
      layoutToggle.addEventListener("click", () => {
        const enabled = toggleClassPersist("vertical-layout", layoutToggle, "⬍", "⇆");
        // persist the vertical-layout flag explicitly (older code may read it)
        try { localStorage.setItem("vertical-layout", enabled ? "true" : "false"); } catch(e){}
      });
    }

    // === Compact mode ===
    function applyCompact(enabled) {
      document.body.classList.toggle("compact", enabled);
      if (compactToggle) compactToggle.textContent = enabled ? "🔎" : "📏";
    }
    applyCompact(compactMode);
    if (compactToggle) {
      compactToggle.onclick = () => {
        compactMode = !document.body.classList.contains("compact");
        applyCompact(compactMode);
        try { localStorage.setItem("compact", compactMode ? "true" : "false"); } catch(e){}
      };
    }

    // === Extra toggles handlers & restore state ===
    if (sidebarToggle) {
      sidebarToggle.addEventListener("click", () => {
        const enabled = toggleClassPersist("hide-sidebar", sidebarToggle, "⫸", "⫷");
        try { localStorage.setItem("hide-sidebar", enabled ? "true" : "false"); } catch(e){}
      });
      sidebarToggle.textContent = document.body.classList.contains("hide-sidebar") ? "⫸" : "⫷";
    }

    // grid size cycle
    const GRID_KEYS = ["grid-1","grid-2","grid-3"];
    function getCurrentGridIndex() { return GRID_KEYS.findIndex(k => document.body.classList.contains(k)); }
    if (gridSizeToggle) {
      gridSizeToggle.addEventListener("click", () => {
        let idx = getCurrentGridIndex();
        GRID_KEYS.forEach(k => document.body.classList.remove(k));
        idx = (idx + 1) % (GRID_KEYS.length + 1); // extra = auto
        if (idx < GRID_KEYS.length) {
          document.body.classList.add(GRID_KEYS[idx]);
          try { localStorage.setItem("grid-class", GRID_KEYS[idx]); } catch(e){}
          gridSizeToggle.textContent = (idx + 1) + "▦";
        } else {
          try { localStorage.removeItem("grid-class"); } catch(e){}
          gridSizeToggle.textContent = "▦";
        }
      });
      if (savedGridClass && GRID_KEYS.includes(savedGridClass)) {
        gridSizeToggle.textContent = (GRID_KEYS.indexOf(savedGridClass) + 1) + "▦";
      } else {
        gridSizeToggle.textContent = "▦";
      }
    }

    // card size cycle
    const CARD_KEYS = ["card-small","card-medium","card-large"];
    if (cardSizeToggle) {
      cardSizeToggle.addEventListener("click", () => {
        let idx = CARD_KEYS.findIndex(k => document.body.classList.contains(k));
        CARD_KEYS.forEach(k => document.body.classList.remove(k));
        idx = (idx + 1) % CARD_KEYS.length;
        document.body.classList.add(CARD_KEYS[idx]);
        try { localStorage.setItem("card-class", CARD_KEYS[idx]); } catch(e){}
        cardSizeToggle.textContent = ["S","M","L"][idx];
      });
      cardSizeToggle.textContent = savedCardClass === "card-small" ? "S" : (savedCardClass === "card-large" ? "L" : "M");
    }

    // images toggle
    if (imagesToggle) {
      imagesToggle.addEventListener("click", () => {
        const enabled = toggleClassPersist("images-hidden", imagesToggle, "🖼️", "🖼️");
        try { localStorage.setItem("images-hidden", enabled ? "true" : "false"); } catch(e){}
      });
      imagesToggle.textContent = document.body.classList.contains("images-hidden") ? "🖼️" : "🖼️";
    }

    // high contrast
    if (contrastToggle) {
      contrastToggle.addEventListener("click", () => {
        const enabled = toggleClassPersist("high-contrast", contrastToggle, "⚪", "⚫");
        try { localStorage.setItem("high-contrast", enabled ? "true" : "false"); } catch(e){}
      });
      contrastToggle.textContent = document.body.classList.contains("high-contrast") ? "⚪" : "⚫";
    }

    // MutationObserver to keep icons synced if classes change elsewhere
    const classObserver = new MutationObserver(() => {
      if (layoutToggle) layoutToggle.textContent = document.body.classList.contains("vertical-layout") ? "⬍" : "⇆";
      if (compactToggle) compactToggle.textContent = document.body.classList.contains("compact") ? "🔎" : "📏";
      if (sidebarToggle) sidebarToggle.textContent = document.body.classList.contains("hide-sidebar") ? "⫸" : "⫷";
      if (contrastToggle) contrastToggle.textContent = document.body.classList.contains("high-contrast") ? "⚪" : "⚫";
      // grid/card buttons keep their own labels except when restored on load
    });
    classObserver.observe(document.body, { attributes: true, attributeFilter: ["class"] });

    // === Build sidebar nav ===
    nav.innerHTML = "";
    const favBtn = document.createElement("button");
    favBtn.textContent = "⭐ Favourites";
    favBtn.onclick = () => {
      currentGroup = "favourites";
      render();
      updateActive(favBtn);
    };
    nav.appendChild(favBtn);

    (data.groups || []).forEach(g => {
      const btn = document.createElement("button");
      btn.textContent = g.title;
      btn.onclick = () => {
        currentGroup = g;
        render();
        updateActive(btn);
      };
      nav.appendChild(btn);
    });

    // === update active nav state utility ===
    function updateActive(activeBtn) {
      nav.querySelectorAll("button").forEach(b => b.classList.remove("active"));
      if (activeBtn) activeBtn.classList.add("active");
    }

    // === Render logic ===
    function render() {
      grid.innerHTML = "";
      if (currentGroup === "favourites") {
        renderFavourites();
      } else if (currentGroup === null) {
        renderAll();
      } else {
        renderGroup(currentGroup);
      }
    }

    function renderGroup(group) {
      title.textContent = group.title;
      showAllBtn.classList.remove("active");
      const items = (group.items || []).filter(matchesSearch);
      if (!items.length) {
        grid.innerHTML = `<p style="opacity:0.6;">No results.</p>`;
        return;
      }
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
      if (!favItems.length) {
        grid.innerHTML = `<p style="opacity:0.6;">No favourites yet.</p>`;
        return;
      }
      favItems.filter(matchesSearch).forEach(i => grid.appendChild(createCard(i)));
    }

    // === Card creation ===
    function createCard(item) {
      const card = document.createElement("div");
      card.className = "card";
      // allow optional image
      const titleEl = document.createElement("strong");
      titleEl.textContent = item.title;
      card.appendChild(titleEl);
      if (item.img) {
        const img = document.createElement("img");
        img.src = item.img;
        img.alt = item.title;
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
      star.onclick = e => {
        e.stopPropagation();
        toggleFavourite(item.title);
        star.textContent = favourites.includes(item.title) ? "★" : "☆";
        star.classList.toggle("active");
      };
      card.appendChild(star);

      card.onclick = () => {
        if (item.url) window.open(item.url, "_blank");
      };
      return card;
    }

    function toggleFavourite(title) {
      if (favourites.includes(title)) {
        favourites = favourites.filter(f => f !== title);
      } else {
        favourites.push(title);
      }
      try { localStorage.setItem("favourites", JSON.stringify(favourites)); } catch(e){}
    }

    // === Search ===
    if (search) search.addEventListener("input", () => render());
    function matchesSearch(i) {
      const q = (search && search.value || "").toLowerCase().trim();
      return !q || (i.title && i.title.toLowerCase().includes(q)) || (i.notes && i.notes.toLowerCase().includes(q));
    }

    // === Show All toggle ===
    if (showAllBtn) {
      showAllBtn.onclick = () => {
        currentGroup = null;
        render();
        updateActive(null);
      };
    }

    // === Initial render ===
    currentGroup = (data.groups && data.groups[0]) || null;
    render();
    // mark active nav button
    if (currentGroup && nav) {
      const btns = Array.from(nav.querySelectorAll("button"));
      const match = btns.find(b => b.textContent === currentGroup.title);
      if (match) updateActive(match);
    }

    // === Restore other UI icons (initial) ===
    if (layoutToggle) layoutToggle.textContent = document.body.classList.contains("vertical-layout") ? "⬍" : "⇆";
    if (compactToggle) compactToggle.textContent = document.body.classList.contains("compact") ? "🔎" : "📏";
    if (sidebarToggle) sidebarToggle.textContent = document.body.classList.contains("hide-sidebar") ? "⫸" : "⫷";
    if (contrastToggle) contrastToggle.textContent = document.body.classList.contains("high-contrast") ? "⚪" : "⚫";
    // gridSizeToggle and cardSizeToggle text were set earlier during restore
  } // end initDashboard
})(); // end module
