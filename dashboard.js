// dashboard.js
// Ducksinthepool Resource Hub – Minimal Multi-View (no resets)
// Includes: Kanban, Tag Cloud, Gallery, Accordion, Split

const container = document.getElementById("card-container");
const searchInput = document.getElementById("search");

let currentData = { groups: [] };
let currentView = localStorage.getItem("viewMode") || "kanban";
let currentGroup = 0;

// ---------- INITIAL SETUP ----------
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
      <option value="kanban">Kanban Grid</option>
      <option value="gallery">Gallery</option>
      <option value="accordion">Accordion</option>
      <option value="split">Split View</option>
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
  render(mode);
}

// ---------- MASTER RENDER ----------
function render(mode) {
  switch (mode) {
    case "kanban":
      renderKanban();
      break;
    case "gallery":
      renderGallery();
      break;
    case "accordion":
      renderAccordion();
      break;
    case "split":
      renderSplit();
      break;
    case "cloud":
      renderTagCloud();
      break;
  }
}

// ---------- KANBAN VIEW ----------
function renderKanban() {
  container.innerHTML = "";
  currentData.groups.forEach((group) => {
    const section = document.createElement("section");
    const title = document.createElement("h2");
    title.textContent = group.title;
    title.style.borderBottom = `2px solid var(--accent)`;
    title.style.paddingBottom = "0.3rem";
    title.style.marginBottom = "0.8rem";
    title.style.fontSize = "1.1rem";
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

// ---------- GALLERY VIEW ----------
function renderGallery() {
  container.innerHTML = "";
  currentData.groups.forEach((group) => {
    const title = document.createElement("h2");
    title.textContent = group.title;
    title.style.marginBottom = "0.5rem";
    title.style.borderBottom = `1px solid var(--accent)`;
    container.appendChild(title);

    group.items.forEach((item) => {
      const card = document.createElement("div");
      card.className = "card";
      card.style.display = "flex";
      card.style.alignItems = "center";
      card.style.justifyContent = "space-between";
      card.style.padding = "1rem 1.2rem";
      card.innerHTML = `
        <div>
          <h3>${item.title}</h3>
          <p>${item.notes || ""}</p>
        </div>
        <span style="opacity:0.6;font-size:0.8rem;">${item.vis || ""}</span>
      `;
      card.onclick = () => window.open(item.url, "_blank");
      container.appendChild(card);
    });
  });
}

// ---------- ACCORDION VIEW ----------
function renderAccordion() {
  container.innerHTML = "";
  currentData.groups.forEach((group) => {
    const wrapper = document.createElement("div");
    wrapper.className = "accordion-group";
    wrapper.style.marginBottom = "1rem";

    const header = document.createElement("div");
    header.textContent = group.title;
    header.style.fontWeight = "600";
    header.style.padding = "0.6rem 0.8rem";
    header.style.cursor = "pointer";
    header.style.border = `1px solid var(--accent)`;
    header.style.borderRadius = "8px";
    header.style.backdropFilter = "blur(6px)";
    header.onclick = () => {
      const isOpen = content.style.display === "block";
      content.style.display = isOpen ? "none" : "block";
    };

    const content = document.createElement("div");
    content.style.display = "none";
    content.style.marginTop = "0.4rem";

    group.items.forEach((item) => {
      const card = document.createElement("div");
      card.className = "card";
      card.style.borderLeft = `4px solid var(--accent)`;
      card.style.marginBottom = "0.4rem";
      card.innerHTML = `<h3>${item.title}</h3><p>${item.notes || ""}</p>`;
      card.onclick = () => window.open(item.url, "_blank");
      content.appendChild(card);
    });

    wrapper.append(header, content);
    container.appendChild(wrapper);
  });
}

// ---------- SPLIT VIEW ----------
function renderSplit() {
  container.innerHTML = "";
  const layout = document.createElement("div");
  layout.style.display = "flex";
  layout.style.height = "80vh";
  layout.style.gap = "1rem";

  const sidebar = document.createElement("div");
  sidebar.style.width = "240px";
  sidebar.style.overflowY = "auto";
  sidebar.style.paddingRight = "0.5rem";

  const mainPanel = document.createElement("div");
  mainPanel.style.flex = "1";
  mainPanel.style.overflowY = "auto";

  currentData.groups.forEach((g, idx) => {
    const btn = document.createElement("div");
    btn.textContent = g.title;
    btn.style.padding = "0.6rem 0.8rem";
    btn.style.cursor = "pointer";
    btn.style.borderLeft = `4px solid ${
      idx === currentGroup ? "var(--accent)" : "transparent"
    }`;
    btn.onclick = () => {
      currentGroup = idx;
      renderSplit(); // re-render only this layout
    };
    sidebar.appendChild(btn);
  });

  const active = currentData.groups[currentGroup];
  if (active) {
    const header = document.createElement("h2");
    header.textContent = active.title;
    header.style.borderBottom = `2px solid var(--accent)`;
    mainPanel.appendChild(header);

    const grid = document.createElement("div");
    grid.style.display = "grid";
    grid.style.gridTemplateColumns = "repeat(auto-fill, minmax(260px, 1fr))";
    grid.style.gap = "1rem";
    active.items.forEach((item) => {
      const card = document.createElement("div");
      card.className = "card";
      card.style.borderLeft = `4px solid var(--accent)`;
      card.innerHTML = `<h3>${item.title}</h3><p>${item.notes || ""}</p>`;
      card.onclick = () => window.open(item.url, "_blank");
      grid.appendChild(card);
    });
    mainPanel.appendChild(grid);
  }

  layout.append(sidebar, mainPanel);
  container.appendChild(layout);
}

// ---------- TAG CLOUD ----------
function renderTagCloud() {
  container.innerHTML = "";
  const all = currentData.groups.flatMap((g) => g.items);
  const cloud = document.createElement("div");
  cloud.style.lineHeight = "2rem";
  all.forEach((item) => {
    const span = document.createElement("span");
    span.textContent = item.title + " ";
    span.style.fontSize = (Math.random() * 0.6 + 0.8) + "rem";
    span.style.cursor = "pointer";
    span.style.color = "var(--accent)";
    span.onclick = () => window.open(item.url, "_blank");
    cloud.appendChild(span);
  });
  container.appendChild(cloud);
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
