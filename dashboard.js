/* ==========================================================
DASHBOARD.JS — Ducks in the Pool Resource Hub (No Backticks Version)
========================================================== */

document.addEventListener("DOMContentLoaded", function () {
var grid = document.getElementById("grid");

fetch("links.json", { cache: "no-store" })
.then(function (r) {
if (!r.ok) throw new Error("HTTP " + r.status);
return r.json();
})
.then(function (data) {
initDashboard(data);
})
.catch(function (err) {
console.error("Error loading links.json:", err);
grid.innerHTML =
'<p style="color:red;">⚠️ Could not load links.json</p>' +
'<small style="opacity:.6;">' + err.message + "</small>";
});
});

function initDashboard(data) {
var nav = document.getElementById("nav-section");
var grid = document.getElementById("grid");
var title = document.getElementById("section-title");
var search = document.getElementById("search");
var showAll = document.getElementById("show-all-toggle");
var theme = document.getElementById("theme-toggle");
var layout = document.getElementById("layout-toggle");
var palette = document.getElementById("color-palette");

var currentGroup = null;
var favourites = JSON.parse(localStorage.getItem("favourites") || "[]");

/* ===== THEME ===== */
var storedTheme =
localStorage.getItem("theme") ||
(window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
document.body.dataset.theme = storedTheme;
updateThemeIcon();

theme.onclick = function () {
var newTheme = document.body.dataset.theme === "dark" ? "light" : "dark";
document.body.dataset.theme = newTheme;
localStorage.setItem("theme", newTheme);
updateThemeIcon();
};

function updateThemeIcon() {
theme.textContent = document.body.dataset.theme === "dark" ? "🌞" : "🌙";
}

/* ===== ACCENT ===== */
var colors = ["#0a84ff", "#34c759", "#ff2d55", "#af52de", "#ff9f0a", "#5ac8fa"];
var savedAccent = localStorage.getItem("accent") || "#0a84ff";
updateAccent(savedAccent);

colors.forEach(function (c) {
var dot = document.createElement("div");
dot.className = "color-dot";
dot.style.background = c;
if (c === savedAccent) dot.classList.add("active");
dot.onclick = function () {
localStorage.setItem("accent", c);
updateAccent(c);
document.querySelectorAll(".color-dot").forEach(function (d) {
d.classList.remove("active");
});
dot.classList.add("active");
};
palette.appendChild(dot);
});

function updateAccent(c) {
document.documentElement.style.setProperty("--accent", c);
document
.querySelector("meta[name='theme-color']")
.setAttribute("content", c);
}

/* ===== LAYOUT ===== */
layout.onclick = function () {
document.body.classList.toggle("vertical-layout");
};

/* ===== SIDEBAR ===== */
nav.innerHTML = "";
var favBtn = document.createElement("button");
favBtn.textContent = "⭐ Favourites";
favBtn.onclick = function () {
currentGroup = "favourites";
render();
highlight(favBtn);
};
nav.appendChild(favBtn);

data.groups.forEach(function (g) {
var btn = document.createElement("button");
btn.textContent = g.title;
btn.onclick = function () {
currentGroup = g;
render();
highlight(btn);
};
nav.appendChild(btn);
});

function highlight(btn) {
nav.querySelectorAll("button").forEach(function (b) {
b.classList.remove("active");
});
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
var items = group.items.filter(matchSearch);
if (!items.length) {
grid.innerHTML = '<p style="opacity:.6;">No results.</p>';
return;
}
items.forEach(function (i) {
grid.appendChild(makeCard(i));
});
}

function renderAll() {
title.textContent = "All Resources";
showAll.classList.add("active");
grid.innerHTML = "";
data.groups.forEach(function (g) {
var section = document.createElement("div");
section.className = "section-group";
var h = document.createElement("h3");
h.textContent = g.title;
section.appendChild(h);
g.items
.filter(matchSearch)
.forEach(function (i) {
section.appendChild(makeCard(i));
});
grid.appendChild(section);
});
}

function renderFavs() {
title.textContent = "⭐ Favourites";
var favItems = data.groups.flatMap(function (g) {
return g.items.filter(function (i) {
return favourites.includes(i.title);
});
});
if (!favItems.length) {
grid.innerHTML = '<p style="opacity:.6;">No favourites yet.</p>';
return;
}
favItems.filter(matchSearch).forEach(function (i) {
grid.appendChild(makeCard(i));
});
}

/* ===== CARDS ===== */
function makeCard(i) {
var card = document.createElement("div");
card.className = "card";
card.innerHTML =
"<strong>" + i.title + "</strong><small>" + i.notes + "</small>";
