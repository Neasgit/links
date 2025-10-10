// dashboard.js
// Ducksinthepool Resource Hub
// Supports grouped link sections + multiple layout views

const container = document.getElementById("card-container");
const searchInput = document.getElementById("search");

// ---- View Handling ----
let currentView = localStorage.getItem("viewMode") || "grid";

function setView(mode) {
  currentView = mode;
  localStorage.setItem("viewMode", mode);
  renderGroups(currentData.groups);
}

// Create view selector in sidebar dynamically
function createViewSelector() {
  const sidebar = document.querySelector("aside");
  const viewContainer = document.createElement("div");
  viewContainer.style.marginTop = "1rem";
  viewContainer.innerHTML = `
    <label style="font-size:0.9rem; opacity:0.8;">View:</label>
    <select id="viewSelect" style="margin-top:0.4rem; padding:0.3rem; border-radius:6px; border:none; background:rgba(255,255,255,0.1); color:inherit;">
      <option value="grid">Kanban Grid</option>
      <option value="list">Compact List</option>
      <option value="tiles">Large Tiles</option>
    </select>
  `;
  sidebar.insertBefore(viewContainer, sidebar.lastElementChild);
  const select = viewContainer.querySelector("#viewSelect");
  select.value = currentView;
  select.addEventListener("change", (e) => setView(e.target.value));
}

// ---- Data + Rendering ----
let currentData = { groups: [] };

async function loadLinks() {
  try {
    const res = await fetch("links.json", { cache: "no-store" });
    const data = await res.json();
    currentData = data;
    renderGroups(data.groups);
  } catch (err) {
    console.error("Failed to load links.json:", err);
    container.innerHTML = `<p style="opacity:0.6;">⚠️ Unable to load links.json</p>`;
  }
}

function renderGroups(groups) {
  container.innerHTML = "";

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
    grid.className = `view-${currentView}`;
    applyGridStyle(grid);

    group.items.forEach((item) => {
      const card = document.createElement("div");
      card.className = "card";
      card.style.borderLeft = `4px solid var(--accent)`;
      card.innerHTML = `
        <h3>${item.title}</h3>
        <p>${item.notes || ""}</p>
      `;
      card.onclick = () => window.open(item.url, "_blank");
      grid.appendChild(card);
    });

    section.appendChild(grid);
    container.appendChild(section);
  });
}

function applyGridStyle(grid) {
  // Reset styles before applying new ones
  grid.style.display = "";
  grid.style.gridTemplateColumns = "";
  grid.style.gap = "";

  switch (currentView) {
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
      break;
  }
}

// ---- Search Filter ----
searchInput.addEventListener("input", async (e) => {
  const term = e.target.value.toLowerCase();
  try {
    const res = await fetch("links.json", { cache: "no-store" });
    const data = await res.json();

    const filteredGroups = data.groups
      .map((group) => {
        const matchingItems = group.items.filter(
          (item) =>
            item.title.toLowerCase().includes(term) ||
            (item.notes && item.notes.toLowerCase().includes(term))
        );
        return matchingItems.length ? { ...group, items: matchingItems } : null;
      })
      .filter(Boolean);

    currentData = { groups: filteredGroups };
    renderGroups(filteredGroups);
  } catch (err) {
    console.error(err);
  }
});

// ---- Init ----
createViewSelector();
loadLinks();
