// dashboard.js
// Ducksinthepool Resource Hub — Split View Fixed + Light/Dark Accent Integration

const container = document.getElementById("card-container");
const searchInput = document.getElementById("search");

let currentData = { groups: [] };
let currentView = localStorage.getItem("viewMode") || "kanban";
let currentGroup = 0;

createViewSelector();
loadLinks();

async function loadLinks() {
  try {
    const res = await fetch("links.json", { cache: "no-store" });
    const data = await res.json();
    currentData = data;
    render(currentView);
  } catch (err) {
    console.error("Failed to load links.json:", err);
    container.innerHTML = `<p style="opacity:0.6;">⚠️ Unable to load links.json</p>`;
  }
}

function createViewSelector() {
  const sidebar = document.querySelector("aside");
  const viewContainer = document.createElement("div");
  viewContainer.style.marginTop = "1rem";
  viewContainer.innerHTML = `
    <label style="font-size:0.9rem; opacity:0.8;">View:</label>
    <select id="viewSelect"
      style="margin-top:0.4rem; padding:0.3rem; border-radius:6px; border:none;
             background:rgba(255,255,255,0.1); color:inherit;">
      <option value="kanban">Kanban Grid</option>
      <option value="split">Split View</option>
    </select>`;
  sidebar.insertBefore(viewContainer, sidebar.lastElementChild);
  const select = viewContainer.querySelector("#viewSelect");
  select.value = currentView;
  select.addEventListener("change", (e) => setView(e.target.value));
}

function setView(mode) {
  currentView = mode;
  localStorage.setItem("viewMode", mode);
  render(mode);
}

// ---------- VIEW RENDER ----------
function render(mode) {
  if (mode === "split") renderSplit();
  else renderKanban();
}

// ---------- KANBAN ----------
function renderKanban() {
  container.innerHTML = "";
  currentData.groups.forEach((group) => {
    const section = document.createElement("section");
    const title = document.createElement("h2");
    title.textContent = group.title;
    title.style.borderBottom = `2px solid var(--accent)`;
    title.style.paddingBottom = "0.3rem";
    section.appendChild(title);

    const grid = document.createElement("div");
    grid.style.display = "grid";
    grid.style.gridTemplateColumns = "repeat(auto-fill, minmax(250px, 1fr))";
    grid.style.gap = "1rem";

    group.items.forEach((item) => {
      const card = document.createElement("div");
      card.className = "card";
      card.style.borderLeft = `4px solid var(--accent)`;
      card.innerHTML = `<h3>${item.title}</h3><p>${item.notes || ""}</p>`;
      card.onclick = () => window.open(item.url, "_blank");
      grid.appendChild(card);
    });

    section.appendChild(grid);
    container.appendChild(section);
  });
}

// ---------- FIXED SPLIT VIEW ----------
function renderSplit() {
  container.innerHTML = "";

  const layout = document.createElement("div");
  layout.style.display = "grid";
  layout.style.gridTemplateColumns = "220px 1fr";
  layout.style.gap = "1.5rem";
  layout.style.height = "calc(100vh - 4rem)";
  layout.style.overflow = "hidden";

  const nav = document.createElement("div");
  nav.style.display = "flex";
  nav.style.flexDirection = "column";
  nav.style.overflowY = "auto";
  nav.style.paddingRight = "0.4rem";
  nav.style.backdropFilter = "blur(10px)";

  currentData.groups.forEach((g, i) => {
    const btn = document.createElement("button");
    btn.textContent = g.title;
    btn.style.margin = "0.2rem 0";
    btn.style.padding = "0.5rem";
    btn.style.border = "1px solid var(--accent)";
    btn.style.borderRadius = "6px";
    btn.style.background =
      i === currentGroup
        ? "var(--accent)"
        : "rgba(255,255,255,0.05)";
    btn.style.color = i === currentGroup ? "#fff" : "inherit";
    btn.style.fontWeight = i === currentGroup ? "600" : "400";
    btn.onclick = () => {
      currentGroup = i;
      renderSplit();
    };
    nav.appendChild(btn);
  });

  const main = document.createElement("div");
  main.style.overflowY = "auto";
  main.style.paddingRight = "0.6rem";

  const group = currentData.groups[currentGroup];
  if (group) {
    const head = document.createElement("h2");
    head.textContent = group.title;
    head.style.borderBottom = `2px solid var(--accent)`;
    head.style.marginBottom = "1rem";
    main.appendChild(head);

    const grid = document.createElement("div");
    grid.style.display = "grid";
    grid.style.gridTemplateColumns = "repeat(auto-fill, minmax(260px, 1fr))";
    grid.style.gap = "1rem";

    group.items.forEach((item) => {
      const card = document.createElement("div");
      card.className = "card";
      card.style.borderLeft = `4px solid var(--accent)`;
      card.innerHTML = `<h3>${item.title}</h3><p>${item.notes || ""}</p>`;
      card.onclick = () => window.open(item.url, "_blank");
      grid.appendChild(card);
    });
    main.appendChild(grid);
  }

  layout.append(nav, main);
  container.appendChild(layout);
}

// ---------- SEARCH ----------
searchInput.addEventListener("input", async (e) => {
  const term = e.target.value.toLowerCase();
  try {
    const res = await fetch("links.json", { cache: "no-store" });
    const data = await res.json();
    const filtered = data.groups
      .map((g) => {
        const matches = g.items.filter(
          (i) =>
            i.title.toLowerCase().includes(term) ||
            (i.notes && i.notes.toLowerCase().includes(term))
        );
        return matches.length ? { ...g, items: matches } : null;
      })
      .filter(Boolean);
    currentData = { groups: filtered };
    render(currentView);
  } catch (err) {
    console.error(err);
  }
});
