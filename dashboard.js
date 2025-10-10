// dashboard.js
// Ducksinthepool Resource Hub — Experimental Layout Collection (v2)
// Includes: Kanban, Accordion, Split + 10 new layouts

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
      <option value="accordion">Accordion</option>
      <option value="split">Split View</option>
      <option value="masonry">Masonry</option>
      <option value="timeline">Timeline</option>
      <option value="carousel">Carousel</option>
      <option value="columns">Columns</option>
      <option value="focusdeck">Focus Deck</option>
      <option value="map">Map View</option>
      <option value="compact">Compact Table</option>
      <option value="stacked">Stacked Cards</option>
      <option value="board">Board View</option>
      <option value="metro">Metro</option>
      <option value="text">Text Mode</option>
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

// ---------- RENDER DISPATCH ----------
function render(mode) {
  switch (mode) {
    case "kanban": renderKanban(); break;
    case "accordion": renderAccordion(); break;
    case "split": renderSplit(); break;
    case "masonry": renderMasonry(); break;
    case "timeline": renderTimeline(); break;
    case "carousel": renderCarousel(); break;
    case "columns": renderColumns(); break;
    case "focusdeck": renderFocusDeck(); break;
    case "map": renderMap(); break;
    case "compact": renderCompactTable(); break;
    case "stacked": renderStacked(); break;
    case "board": renderBoard(); break;
    case "metro": renderMetro(); break;
    case "text": renderTextMode(); break;
  }
}

// ---------- BASE: KANBAN ----------
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

// ---------- ACCORDION ----------
function renderAccordion() {
  container.innerHTML = "";
  currentData.groups.forEach((group) => {
    const wrap = document.createElement("div");
    wrap.style.marginBottom = "1rem";

    const header = document.createElement("div");
    header.textContent = group.title;
    header.style.fontWeight = "600";
    header.style.padding = "0.6rem";
    header.style.cursor = "pointer";
    header.style.border = `1px solid var(--accent)`;
    header.style.borderRadius = "8px";
    header.onclick = () => {
      const open = body.style.display === "block";
      body.style.display = open ? "none" : "block";
    };

    const body = document.createElement("div");
    body.style.display = "none";
    body.style.marginTop = "0.4rem";
    group.items.forEach((item) => {
      const card = document.createElement("div");
      card.className = "card";
      card.style.borderLeft = `4px solid var(--accent)`;
      card.innerHTML = `<h3>${item.title}</h3><p>${item.notes || ""}</p>`;
      card.onclick = () => window.open(item.url, "_blank");
      body.appendChild(card);
    });

    wrap.append(header, body);
    container.appendChild(wrap);
  });
}

// ---------- FIXED SPLIT ----------
function renderSplit() {
  container.innerHTML = "";
  const layout = document.createElement("div");
  layout.style.display = "flex";
  layout.style.height = "85vh";
  layout.style.gap = "1rem";

  const nav = document.createElement("div");
  nav.style.width = "200px";
  nav.style.display = "flex";
  nav.style.flexDirection = "column";
  nav.style.overflowY = "auto";

  currentData.groups.forEach((g, i) => {
    const btn = document.createElement("button");
    btn.textContent = g.title;
    btn.style.margin = "0.2rem 0";
    btn.style.background =
      i === currentGroup ? "var(--accent)" : "rgba(255,255,255,0.05)";
    btn.onclick = () => {
      currentGroup = i;
      renderSplit();
    };
    nav.appendChild(btn);
  });

  const main = document.createElement("div");
  main.style.flex = "1";
  main.style.overflowY = "auto";

  const group = currentData.groups[currentGroup];
  if (group) {
    const head = document.createElement("h2");
    head.textContent = group.title;
    head.style.borderBottom = `2px solid var(--accent)`;
    main.appendChild(head);

    const grid = document.createElement("div");
    grid.style.display = "grid";
    grid.style.gridTemplateColumns = "repeat(auto-fill, minmax(240px, 1fr))";
    grid.style.gap = "1rem";

    group.items.forEach((item) => {
      const card = document.createElement("div");
      card.className = "card";
      card.innerHTML = `<h3>${item.title}</h3><p>${item.notes || ""}</p>`;
      card.onclick = () => window.open(item.url, "_blank");
      grid.appendChild(card);
    });
    main.appendChild(grid);
  }

  layout.append(nav, main);
  container.appendChild(layout);
}

// ---------- 10 EXTRA LAYOUTS ----------

// Masonry
function renderMasonry() {
  container.innerHTML = "";
  currentData.groups.forEach((g) => {
    const s = document.createElement("section");
    const title = document.createElement("h2");
    title.textContent = g.title;
    s.appendChild(title);

    const grid = document.createElement("div");
    grid.style.columnCount = "3";
    grid.style.columnGap = "1rem";

    g.items.forEach((i) => {
      const card = document.createElement("div");
      card.className = "card";
      card.style.display = "inline-block";
      card.style.width = "100%";
      card.innerHTML = `<h3>${i.title}</h3><p>${i.notes || ""}</p>`;
      card.onclick = () => window.open(i.url, "_blank");
      grid.appendChild(card);
    });
    s.appendChild(grid);
    container.appendChild(s);
  });
}

// Timeline
function renderTimeline() {
  container.innerHTML = "";
  currentData.groups.forEach((g) => {
    const section = document.createElement("div");
    const h = document.createElement("h2");
    h.textContent = g.title;
    section.appendChild(h);
    g.items.forEach((i) => {
      const row = document.createElement("div");
      row.style.borderLeft = `3px solid var(--accent)`;
      row.style.paddingLeft = "1rem";
      row.style.margin = "0.6rem 0";
      row.innerHTML = `<strong>${i.title}</strong><p>${i.notes || ""}</p>`;
      row.onclick = () => window.open(i.url, "_blank");
      section.appendChild(row);
    });
    container.appendChild(section);
  });
}

// Carousel
function renderCarousel() {
  container.innerHTML = "";
  currentData.groups.forEach((g) => {
    const title = document.createElement("h2");
    title.textContent = g.title;
    container.appendChild(title);

    const row = document.createElement("div");
    row.style.display = "flex";
    row.style.overflowX = "auto";
    row.style.gap = "1rem";
    g.items.forEach((i) => {
      const card = document.createElement("div");
      card.className = "card";
      card.style.minWidth = "240px";
      card.innerHTML = `<h3>${i.title}</h3><p>${i.notes || ""}</p>`;
      card.onclick = () => window.open(i.url, "_blank");
      row.appendChild(card);
    });
    container.appendChild(row);
  });
}

// Columns
function renderColumns() {
  container.innerHTML = "";
  const layout = document.createElement("div");
  layout.style.display = "flex";
  layout.style.gap = "1rem";
  currentData.groups.forEach((g) => {
    const col = document.createElement("div");
    col.style.flex = "1";
    const head = document.createElement("h2");
    head.textContent = g.title;
    col.appendChild(head);
    g.items.forEach((i) => {
      const c = document.createElement("div");
      c.className = "card";
      c.innerHTML = `<h3>${i.title}</h3>`;
      c.onclick = () => window.open(i.url, "_blank");
      col.appendChild(c);
    });
    layout.appendChild(col);
  });
  container.appendChild(layout);
}

// Focus Deck
function renderFocusDeck() {
  container.innerHTML = "";
  const flat = currentData.groups.flatMap((g) => g.items);
  let idx = 0;

  const card = document.createElement("div");
  card.className = "card";
  card.style.margin = "2rem auto";
  card.style.maxWidth = "400px";

  const update = () => {
    const i = flat[idx];
    card.innerHTML = `<h2>${i.title}</h2><p>${i.notes || ""}</p>`;
    card.onclick = () => window.open(i.url, "_blank");
  };

  const controls = document.createElement("div");
  controls.style.textAlign = "center";
  controls.style.marginTop = "1rem";
  const prev = document.createElement("button");
  prev.textContent = "←";
  const next = document.createElement("button");
  next.textContent = "→";
  prev.onclick = () => {
    idx = (idx - 1 + flat.length) % flat.length;
    update();
  };
  next.onclick = () => {
    idx = (idx + 1) % flat.length;
    update();
  };
  controls.append(prev, next);
  update();
  container.append(card, controls);
}

// Map View (offset grid)
function renderMap() {
  container.innerHTML = "";
  const grid = document.createElement("div");
  grid.style.display = "grid";
  grid.style.gridTemplateColumns = "repeat(auto-fill, minmax(240px, 1fr))";
  grid.style.gap = "1rem";
  let offset = 0;
  currentData.groups.forEach((g) =>
    g.items.forEach((i) => {
      const c = document.createElement("div");
      c.className = "card";
      c.style.transform = `translateY(${offset}px)`;
      offset = offset >= 40 ? 0 : offset + 10;
      c.innerHTML = `<h3>${i.title}</h3>`;
      c.onclick = () => window.open(i.url, "_blank");
      grid.appendChild(c);
    })
  );
  container.appendChild(grid);
}

// Compact Table
function renderCompactTable() {
  container.innerHTML = "";
  const table = document.createElement("table");
  table.style.width = "100%";
  table.style.borderCollapse = "collapse";
  table.innerHTML = "<thead><tr><th>Group</th><th>Title</th></tr></thead>";
  const body = document.createElement("tbody");
  currentData.groups.forEach((g) =>
    g.items.forEach((i) => {
      const tr = document.createElement("tr");
      tr.innerHTML = `<td>${g.title}</td><td><a href="${i.url}" target="_blank">${i.title}</a></td>`;
      body.appendChild(tr);
    })
  );
  table.appendChild(body);
  container.appendChild(table);
}

// Stacked
function renderStacked() {
  container.innerHTML = "";
  const wrap = document.createElement("div");
  wrap.style.position = "relative";
  wrap.style.height = "500px";
  const flat = currentData.groups.flatMap((g) => g.items);
  flat.slice(0, 5).forEach((i, idx) => {
    const c = document.createElement("div");
    c.className = "card";
    c.style.position = "absolute";
    c.style.top = `${idx * 20}px`;
    c.style.left = `${idx * 10}px`;
    c.style.width = "300px";
    c.style.transition = "transform 0.3s";
    c.innerHTML = `<h3>${i.title}</h3>`;
    c.onclick = () => window.open(i.url, "_blank");
    wrap.appendChild(c);
  });
  container.appendChild(wrap);
}

// Board View
function renderBoard() {
  container.innerHTML = "";
  const board = document.createElement("div");
  board.style.display = "flex";
  board.style.gap = "1rem";
  currentData.groups.forEach((g) => {
    const lane = document.createElement("div");
    lane.style.flex = "1";
    const head = document.createElement("h2");
    head.textContent = g.title;
    lane.appendChild(head);
    g.items.forEach((i) => {
      const c = document.createElement("div");
      c.className = "card";
      c.style.marginBottom = "0.6rem";
      c.innerHTML = `<h3>${i.title}</h3>`;
      c.onclick = () => window.open(i.url, "_blank");
      lane.appendChild(c);
    });
    board.appendChild(lane);
  });
  container.appendChild(board);
}

// Metro
function renderMetro() {
  container.innerHTML = "";
  const grid = document.createElement("div");
  grid.style.display = "grid";
  grid.style.gridTemplateColumns = "repeat(auto-fill, minmax(180px, 1fr))";
  grid.style.gap = "1rem";
  currentData.groups.forEach((g) =>
    g.items.forEach((i) => {
      const c = document.createElement("div");
      c.className = "card";
      c.style.height = Math.random() > 0.5 ? "160px" : "90px";
      c.style.textAlign = "center";
      c.style.display = "flex";
      c.style.alignItems = "center";
      c.style.justifyContent = "center";
      c.innerHTML = `<strong>${i.title}</strong>`;
      c.onclick = () => window.open(i.url, "_blank");
      grid.appendChild(c);
    })
  );
  container.appendChild(grid);
}

// Text Mode
function renderTextMode() {
  container.innerHTML = "";
  currentData.groups.forEach((g) => {
    const title = document.createElement("h3");
    title.textContent = g.title;
    container.appendChild(title);
    const list = document.createElement("ul");
    g.items.forEach((i) => {
      const li = document.createElement("li");
      li.innerHTML = `<a href="${i.url}" target="_blank">${i.title}</a> — ${i.notes || ""}`;
      list.appendChild(li);
    });
    container.appendChild(list);
  });
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
