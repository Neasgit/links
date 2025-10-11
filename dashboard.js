/* ==========================================================
   DASHBOARD.JS — Ducks in the Pool Resource Hub
   ========================================================== */

document.addEventListener("DOMContentLoaded", () => {
  fetch("links.json")
    .then(res => {
      if (!res.ok) throw new Error(`Failed to load links.json: ${res.status}`);
      return res.json();
    })
    .then(data => initDashboard(data))
    .catch(err => {
      console.error("Error loading links.json:", err);
      const grid = document.getElementById("grid");
      if (grid) grid.innerHTML = `<p style="color:red;">⚠️ Could not load links.json</p>`;
    });
});

function initDashboard(data) {
  // === DOM refs ===
  const nav = document.getElementById("nav-section");
  const grid = document.getElementById("grid");
  const title = document.getElementById("section-title");
  const search = document.getElementById("search");
  const showAllBtn = document.getElementById("show-all-toggle");
  const themeToggle = document.getElementById("theme-toggle");
  const layoutToggle = document.getElementById("layout-toggle");
  const compactToggle = document.getElementById("compact-toggle");

  // === State ===
  let currentGroup = null;
  let favourites = JSON.parse(localStorage.getItem("favourites") || "[]");
  let compactMode = localStorage.getItem("compact") === "true";

  // === Theme ===
  const storedTheme =
    localStorage.getItem("theme") ||
    (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
  document.body.dataset.theme = storedTheme;
  updateThemeIcon();

  themeToggle.onclick = () => {
    const newTheme = document.body.dataset.theme === "dark" ? "light" : "dark";
    document.body.dataset.theme = newTheme;
    localStorage.setItem("theme", newTheme);
    updateThemeIcon();
  };
  function updateThemeIcon() {
    themeToggle.textContent = document.body.dataset.theme === "dark" ? "🌞" : "🌙";
  }

  // === Accent palette ===
  const palette = document.getElementById("color-palette");
  const colors = ["#0a84ff","#34c759","#ff2d55","#af52de","#ff9f0a","#5ac8fa"];
  const savedAccent = localStorage.getItem("accent") || "#0a84ff";
  updateAccent(savedAccent);
  colors.forEach(c => {
    const dot = document.createElement("div");
    dot.className = "color-dot";
    dot.style.background = c;
    if (c === savedAccent) dot.classList.add("active");
    dot.onclick = () => {
      localStorage.setItem("accent", c);
      updateAccent(c);
      document.querySelectorAll(".color-dot").forEach(d => d.classList.remove("active"));
      dot.classList.add("active");
    };
    palette.appendChild(dot);
  });
  function updateAccent(c) {
    document.documentElement.style.setProperty("--accent", c);
    document.querySelector("meta[name='theme-color']").setAttribute("content", c);
  }

  // === Layout toggle ===
  let verticalLayout = false;
  layoutToggle.onclick = () => {
    verticalLayout = !verticalLayout;
    document.body.classList.toggle("vertical-layout", verticalLayout);
  };

  // === Compact mode ===
  applyCompact(compactMode);
  compactToggle.onclick = () => {
    compactMode = !compactMode;
    localStorage.setItem("compact", compactMode);
    applyCompact(compactMode);
  };
  function applyCompact(enabled) {
    document.body.classList.toggle("compact", enabled);
    compactToggle.textContent = enabled ? "🔎" : "📏";
  }

  // === Build sidebar ===
  nav.innerHTML = "";
  const favBtn = document.createElement("button");
  favBtn.textContent = "⭐ Favourites";
  favBtn.onclick = () => {
    currentGroup = "favourites";
    render();
    updateActive(favBtn);
  };
  nav.appendChild(favBtn);

  data.groups.forEach(g => {
    const btn = document.createElement("button");
    btn.textContent = g.title;
    btn.onclick = () => {
      currentGroup = g;
      render();
      updateActive(btn);
    };
    nav.appendChild(btn);
  });

  // === Update active nav state ===
  function updateActive(activeBtn) {
    nav.querySelectorAll("button").forEach(b => b.classList.remove("active"));
    if (activeBtn) activeBtn.classList.add("active");
  }

  // === Render main view ===
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
    const items = group.items.filter(matchesSearch);
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
    data.groups.forEach(g => {
      const section = document.createElement("div");
      section.className = "section-group";
      const h = document.createElement("h3");
      h.textContent = g.title;
      section.appendChild(h);
      g.items.filter(matchesSearch).forEach(i => section.appendChild(createCard(i)));
      grid.appendChild(section);
    });
  }

  function renderFavourites() {
    title.textContent = "⭐ Favourites";
    const favItems = data.groups.flatMap(g => g.items.filter(i => favourites.includes(i.title)));
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
    card.innerHTML = `<strong>${item.title}</strong><small>${item.notes}</small>`;

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
    card.onclick = () => window.open(item.url, "_blank");
    return card;
  }

  function toggleFavourite(title) {
    if (favourites.includes(title)) {
      favourites = favourites.filter(f => f !== title);
    } else {
      favourites.push(title);
    }
    localStorage.setItem("favourites", JSON.stringify(favourites));
  }

  // === Search ===
  search.addEventListener("input", () => {
    render();
  });
  function matchesSearch(i) {
    const q = search.value.toLowerCase().trim();
    return !q || i.title.toLowerCase().includes(q) || i.notes.toLowerCase().includes(q);
  }

  // === Show All toggle ===
  showAllBtn.onclick = () => {
    currentGroup = null;
    render();
    updateActive(null);
  };

  // === Initial render ===
  currentGroup = data.groups[0];
  render();
}
