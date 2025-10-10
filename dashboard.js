// dashboard.js
// Ducksinthepool Resource Hub – Multi-View Edition

const container = document.getElementById("card-container");
const searchInput = document.getElementById("search");

let currentData = { groups: [] };
let currentView = localStorage.getItem("viewMode") || "grid";
let currentGroup = 0;

// ---------- INITIAL SETUP ----------
createViewSelector();
loadLinks();

async function loadLinks() {
  try {
    const res = await fetch("links.json", { cache: "no-store" });
    const data = await res.json();
    currentData = data;
    render(currentView, data.groups);
  } catch (err) {
    console.error("Failed to load links.json:", err);
    container.innerHTML = `<p style="opacity:0.6;">⚠️ Unable to load links.json</p>`;
  }
}

// ---------- VIEW SELECTOR ----------
function createViewSelector() {
  const sidebar = document.querySelector("aside");
  const viewContainer = document.createElement("div");
  viewContainer.style.marginTop = "1rem";
  viewContainer.innerHTML = `
    <label style="font-size:0.9rem; opacity:0.8;">View:</label>
    <select id="viewSelect"
      style="margin-top:0.4rem; padding:0.3rem; border-radius:6px; border:none;
             background:rgba(255,255,255,0.1); color:inherit;">
      <option value="grid">Kanban Grid</option>
      <option value="list">Compact List</option>
      <option value="tiles">Large Tiles</option>
      <option value="table">Table</option>
      <option value="focus">Focus</option>
      <option value="cloud">Tag Cloud</option>
    </select>`;
  sidebar.insertBefore(viewContainer, sidebar.lastElementChild);
  const select = viewContainer.querySelector("#viewSelect");
  select.value = currentView;
  select.addEventListener("change", (e) => setView(e.target.value));
}

function setView(mode) {
  currentView = mode;
  localStorage.setItem("viewMode", mode);
  render(mode, currentData.groups);
}

// ---------- MASTER RENDER SWITCH ----------
function render(mode, groups) {
  container.innerHTML = "";
  switch (mode) {
    case "grid":
    case "list":
    case "tiles":
      renderGroups(groups, mode);
      break;
    case "table":
      renderTable(groups);
      break;
    case "focus":
      renderFocus(groups);
      break;
    case "cloud":
      renderTagCloud(groups);
      break;
  }
}

// ---------- GROUPED LAYOUTS ----------
function renderGroups(groups, mode) {
  groups.forEach((group) => {
    const section = document.createElement("section");
    const title = document.createElement("h2");
    title.textContent = group.title;
    title.style.borderBottom = `2px solid var(--accent)`;
    title.style.paddingBottom = "0.3rem";
    title.style.marginTop = "0";
    title.style.marginBottom = "0.8rem";
    title.style.fontSize = "1.1rem";
    section.appendChild(title);

    const grid = document.createElement("div");
    applyGridStyle(grid, mode);

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

function applyGridStyle(grid, mode) {
  grid.style.display = "";
  grid.style.gridTemplateColumns = "";
  grid.style.gap = "";

  switch (mode) {
    case "grid":
      grid.style.display = "grid";
      grid.style.gridTemplateColumns = "repeat(auto-fill, minmax(250px, 1fr))";
      grid.style.gap = "1rem";
      break;
    case "list":
      grid.style.display = "flex";
      grid.style.flexDirection = "column";
      grid.style.gap = "0.6rem";
      break;
    case "tiles":
      grid.style.display = "grid";
      grid.style.gridTemplateColumns = "repeat(auto-fill, minmax(320px, 1fr))";
      grid.style.gap = "1.5rem";
      grid.style.textAlign = "center";
      break;
  }
}

// ---------- TABLE VIEW ----------
function renderTable(groups) {
  const table = document.createElement("table");
  table.style.width = "100%";
  table.style.borderCollapse = "collapse";
  table.innerHTML = `
    <thead style="border-bottom:2px solid var(--accent)">
      <tr><th align="left">Group</th><th align="left">Title</th>
          <th align="left">Notes</th><th align="left">Type</th></tr>
    </thead>`;
  const tbody = document.createElement("tbody");
  groups.forEach((g) =>
    g.items.forEach((i) => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${g.title}</td>
        <td><a href="${i.url}" target="_blank">${i.title}</a></td>
        <td>${i.notes || ""}</td>
        <td>${i.vis || ""}</td>`;
      tbody.appendChild(row);
    })
  );
  table.appendChild(tbody);
  container.appendChild(table);
}

// ---------- FOCUS VIEW ----------
function renderFocus(groups) {
  const g = groups[currentGroup];
  if (!g) return;
  const title = document.createElement("h2");
  title.textContent = g.title;
  title.style.textAlign = "center";

  const nav = document.createElement("div");
  nav.style.display = "flex";
  nav.style.justifyContent = "center";
  nav.style.gap = "1rem";
  nav.style.margin = "1rem 0";
  nav.innerHTML = `
    <button id="prevGroup">←</button>
    <button id="nextGroup">→</button>
  `;

  const cards = document.createElement("div");
  cards.style.display = "flex";
  cards.style.flexWrap = "wrap";
  cards.style.justifyContent = "center";
  cards.style.gap = "1rem";

  g.items.forEach((i) => {
    const c = document.createElement("div");
    c.className = "card";
    c.style.width = "260px";
    c.innerHTML = `<h3>${i.title}</h3><p>${i.notes || ""}</p>`;
    c.onclick = () => window.open(i.url, "_blank");
    cards.appendChild(c);
  });

  container.append(title, nav, cards);

  document.getElementById("prevGroup").onclick = () => {
    currentGroup = (currentGroup - 1 + groups.length) % groups.length;
    render("focus", groups);
  };
  document.getElementById("nextGroup").onclick = () => {
    currentGroup = (currentGroup + 1) % groups.length;
    render("focus", groups);
  };
}

// ---------- TAG CLOUD ----------
function renderTagCloud(groups) {
  const all = groups.flatMap((g) => g.items);
  all.forEach((item) => {
    const span = document.createElement("span");
    span.textContent = item.title + " ";
    span.style.fontSize = (Math.random() * 0.6 + 0.8) + "rem";
    span.style.cursor = "pointer";
    span.style.color = "var(--accent)";
    span.onclick = () => window.open(item.url, "_blank");
    container.appendChild(span);
  });
}

// ---------- SEARCH ----------
searchInput.addEventListener("input", async (e) => {
  const term = e.target.value.toLowerCase();
  try {
    const res = await fetch("links.json", { cache: "no-store" });
    const data = await res.json();
    const filteredGroups = data.groups
      .map((g) => {
        const matches = g.items.filter(
          (i) =>
            i.title.toLowerCase().includes(term) ||
            (i.notes && i.notes.toLowerCase().includes(term))
        );
        return matches.length ? { ...g, items: matches } : null;
      })
      .filter(Boolean);
    currentData = { groups: filteredGroups };
    render(currentView, filteredGroups);
  } catch (err) {
    console.error(err);
  }
});
