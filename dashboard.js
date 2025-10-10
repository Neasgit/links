let currentView = "split";
let currentData = {};
let currentGroup = 0;
const container = document.getElementById("card-container");

async function loadData() {
  try {
    const res = await fetch("links.json");
    const data = await res.json();
    currentData = data;
    renderSplit();
  } catch (err) {
    container.innerHTML = "<p>⚠️ Unable to load links.json</p>";
    console.error(err);
  }
}

// Split View
function renderSplit() {
  container.innerHTML = "";
  const layout = document.createElement("div");
  layout.className = "split-layout";

  const nav = document.createElement("div");
  nav.className = "split-sidebar";

  currentData.groups.forEach((g, i) => {
    const btn = document.createElement("button");
    btn.textContent = g.title;
    btn.className = i === currentGroup ? "active" : "";
    btn.onclick = () => {
      currentGroup = i;
      renderSplit();
    };
    nav.appendChild(btn);
  });

  const main = document.createElement("div");
  main.className = "split-main";

  const group = currentData.groups[currentGroup];
  if (group) {
    const head = document.createElement("h2");
    head.textContent = group.title;
    main.appendChild(head);

    const grid = document.createElement("div");
    grid.className = "split-grid";
    group.items.forEach((item) => {
      const card = document.createElement("div");
      card.className = "card split-card";
      card.innerHTML = `<h3>${item.title}</h3><p>${item.notes || ""}</p>`;
      card.onclick = () => window.open(item.url, "_blank");
      grid.appendChild(card);
    });

    main.appendChild(grid);
  }

  layout.append(nav, main);
  container.appendChild(layout);
}

loadData();
