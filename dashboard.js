/* ==========================================================
DASHBOARD.JS — Ducks in the Pool Resource Hub (Stable Build)
========================================================== */

document.addEventListener("DOMContentLoaded", () => {
const grid = document.getElementById("grid");

fetch("./links.json", { cache: "no-store", mode: "same-origin" })
.then(r => {
if (!r.ok) throw new Error(HTTP ${r.status});
return r.json();
})
.then(data => initDashboard(data))
.catch(err => {
console.error("Error loading links.json:", err);
grid.innerHTML = <p style="color:red;">⚠️ Could not load links.json</p><small style="opacity:.6;">${err.message}</small>;
});
});

function initDashboard(data) {
const nav = document.getElementById("nav-section");
const grid = document.getElementById("grid");
const title = document.getElementById("section-title");
const search = document.getElementById("search");
const showAll = document.getElementById("show-all-toggle");
const theme = document.getElementById("theme-toggle");
const layout = document.getElementById("layout-toggle");
const palette = document.getElementById("color-palette");

let currentGroup = null;
let favourites = JSON.parse(localStorage.getItem("favourites") || "[]");

/* ===== THEME ===== */
const storedTheme =
localStorage.getItem("theme") ||
(window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
document.body.dataset.theme = storedTheme;
updateThemeIcon();

theme.onclick = () => {
const newTheme = document.body.dataset.theme === "dark" ? "light" : "dark";
document.body.dataset.theme = newTheme;
localStorage.setItem("theme", newTheme);
updateThemeIcon();
};

function updateThemeIcon() {
theme.textContent = document.body.dataset.theme === "dark" ? "🌞" : "🌙";
}

/* ===== ACCENT ===== */
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

/* ===== LAYOUT ===== */
layout.onclick = () => {
document.body.classList.toggle("vertical-layout");
};

/* ===== SIDEBAR ===== */
nav.innerHTML = "";
const favBtn = document.createElement("button");
favBtn.textContent = "⭐ Favourites";
favBtn.onclick = () => {
currentGroup = "favourites";
render();
highlight(favBtn);
};
nav.appendChild(favBtn);

data.groups.forEach(g => {
const btn = document.createElement("button");
btn.textContent = g.title;
btn.onclick = () => {
currentGroup = g;
render();
highlight(btn);
};
nav.appendChild(btn);
});

function highlight(btn) {
nav.querySelectorAll("button").forEach(b => b.classList.remove("active"));
if (btn) btn.classList.add("active");
}

/* ===== RENDER ===== */
function render() {
grid.innerHTML = "";
if (currentGroup === "favourites") return renderFavs();
if (!currentGroup) return renderAll();
renderGroup(currentGroup);
}

function renderGroup(group) {
title.textContent = group.title;
showAll.classList.remove("active");
const items = group.items.filter(matchSearch);
if (!items.length) {
grid.innerHTML = <p style="opacity:.6;">No results.</p>;
return;
}
items.forEach(i => grid.appendChild(makeCard(i)));
}

function renderAll() {
title.textContent = "All Resources";
showAll.classList.add("active");
grid.innerHTML = "";
data.groups.forEach(g => {
const section = document.createElement("div");
section.className = "section-group";
const h = document.createElement("h3");
h.textContent = g.title;
section.appendChild(h);
g.items.filter(matchSearch).forEach(i => section.appendChild(makeCard(i)));
grid.appendChild(section);
});
}

function renderFavs() {
title.textContent = "⭐ Favourites";
const favItems = data.groups.flatMap(g => g.items.filter(i => favourites.includes(i.title)));
if (!favItems.length) {
grid.innerHTML = <p style="opacity:.6;">No favourites yet.</p>;
return;
}
favItems.filter(matchSearch).forEach(i => grid.appendChild(makeCard(i)));
}

/* ===== CARDS ===== */
function makeCard(i) {
const card = document.createElement("div");
card.className = "card";
card.innerHTML = <strong>${i.title}</strong><small>${i.notes}</small>;

const star = document.createElement("span");
star.className = "star";
star.textContent = favourites.includes(i.title) ? "★" : "☆";
if (favourites.includes(i.title)) star.classList.add("active");

star.onclick = e => {
  e.stopPropagation();
  toggleFav(i.title);
  star.textContent = favourites.includes(i.title) ? "★" : "☆";
  star.classList.toggle("active");
};

card.appendChild(star);
card.onclick = () => window.open(i.url, "_blank");
return card;


}

function toggleFav(name) {
if (favourites.includes(name)) {
favourites = favourites.filter(f => f !== name);
} else {
favourites.push(name);
}
localStorage.setItem("favourites", JSON.stringify(favourites));
}

/* ===== SEARCH ===== */
search.addEventListener("input", render);
function matchSearch(i) {
const q = search.value.toLowerCase().trim();
return !q || i.title.toLowerCase().includes(q) || i.notes.toLowerCase().includes(q);
}

/* ===== SHOW ALL ===== */
showAll.onclick = () => {
currentGroup = null;
render();
highlight(null);
};

/* ===== INITIAL RENDER ===== */
currentGroup = data.groups[0];
render();
}
