let allGroups = [];
let currentGroup = null;
let favourites = JSON.parse(localStorage.getItem("favourites") || "[]");

const nav = document.getElementById("nav-section");
const title = document.getElementById("section-title");
const showAllToggle = document.getElementById("show-all-toggle");
const searchInput = document.getElementById("search");
const grid = document.getElementById("grid");

/* === Theme === */
const themeBtn = document.getElementById("theme-toggle");
const storedTheme = localStorage.getItem("theme") || (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
document.body.dataset.theme = storedTheme;
updateThemeIcon();
themeBtn.onclick = () => {
  document.body.dataset.theme = document.body.dataset.theme === "dark" ? "light" : "dark";
  localStorage.setItem("theme", document.body.dataset.theme);
  updateThemeIcon();
};
function updateThemeIcon() {
  themeBtn.textContent = document.body.dataset.theme === "dark" ? "🌞" : "🌙";
}

/* === Accent Colours === */
const palette = document.getElementById("color-palette");
const colors = ["#0a84ff", "#34c759", "#ff2d55", "#af52de", "#ff9f0a", "#5ac8fa"];
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

/* === Data Load === */
fetch("links.json").then(r => r.json()).then(data => {
  allGroups = data.groups;
  renderSidebar();
  currentGroup = allGroups[0];
  render();
});

/* === Sidebar === */
function renderSidebar() {
  nav.innerHTML = "";
  const favBtn = document.createElement("button");
  favBtn.textContent = "⭐ Favourites";
  favBtn.onclick = () => {
    currentGroup = "favourites";
    render();
    updateSidebarActive(favBtn);
  };
  nav.appendChild(favBtn);

  allGroups.forEach(g => {
    const btn = document.createElement("button");
    btn.textContent = g.title;
    btn.onclick = () => {
      currentGroup = g;
      render();
      updateSidebarActive(btn);
    };
    nav.appendChild(btn);
  });
}
function updateSidebarActive(activeBtn) {
  nav.querySelectorAll("button").forEach(b => b.classList.remove("active"));
  if (activeBtn) activeBtn.classList.add("active");
}

/* === Render === */
function render() {
  grid.innerHTML = "";
  if (currentGroup === "favourites") {
    title.textContent = "⭐ Favourites";
    const favs = allGroups.flatMap(g => g.items.filter(i => favourites.includes(i.title) && matchesSearch(i)));
    if (!favs.length) {
      grid.textContent = "No favourites yet.";
    }
    favs.forEach(renderCard);
  } else if (currentGroup === null) {
    renderAll();
  } else {
    renderGroup(currentGroup);
  }
}
function renderGroup(group) {
  title.textContent = group.title;
  showAllToggle.classList.remove("active");
  group.items.filter(matchesSearch).forEach(i => grid.appendChild(renderCard(i, true)));
}
function renderAll() {
  title.textContent = "All Resources";
  showAllToggle.classList.add("active");
  grid.innerHTML = "";
  allGroups.forEach(g => {
    const sec = document.createElement("div");
    sec.className = "section-group";
    const h = document.createElement("h3");
    h.textContent = g.title;
    sec.appendChild(h);
    g.items.filter(matchesSearch).forEach(i => sec.appendChild(renderCard(i, true)));
    grid.appendChild(sec);
  });
}
showAllToggle.onclick = () => {
  currentGroup = null;
  render();
  updateSidebarActive();
};
searchInput.addEventListener("input", () => {
  const val = searchInput.value.trim().toLowerCase();
  if (val === "raccoon" || val === "racoon") {
    activateRaccoonMode();
  }
  render();
});
function matchesSearch(i) {
  const q = searchInput.value.toLowerCase().trim();
  return !q || i.title.toLowerCase().includes(q) || i.notes.toLowerCase().includes(q);
}

/* === Cards === */
function renderCard(item) {
  const card = document.createElement("div");
  card.className = "card";
  card.innerHTML = `<strong>${item.title}</strong><small>${item.notes}</small>`;
  const star = document.createElement("span");
  star.className = "star";
  star.textContent = favourites.includes(item.title) ? "★" : "☆";
  if (favourites.includes(item.title)) star.classList.add("active");
  star.onclick = e => {
    e.stopPropagation();
    if (favourites.includes(item.title))
      favourites = favourites.filter(f => f !== item.title);
    else favourites.push(item.title);
    localStorage.setItem("favourites", JSON.stringify(favourites));
    star.textContent = favourites.includes(item.title) ? "★" : "☆";
    star.classList.toggle("active");
  };
  card.appendChild(star);
  card.onclick = () => window.open(item.url, "_blank");
  return card;
}

/* === Raccoon Mode === */
function activateRaccoonMode() {
  if (document.body.classList.contains("raccoon")) return;
  document.body.classList.add("raccoon");
  document.documentElement.style.setProperty("--accent", "#c79d6a");
  document.body.style.backgroundImage =
    "url('https://cdn.jsdelivr.net/gh/Neasgit/assets/raccoon-bg.jpg')";
  document.body.style.backgroundSize = "cover";
  const icon = document.createElement("span");
  icon.textContent = "🦝";
  icon.style.marginLeft = "6px";
  icon.id = "raccoon-icon";
  title.appendChild(icon);
}
