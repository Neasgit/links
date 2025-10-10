// dashboard.js
// Ducksinthepool Resource Hub
// Supports grouped link sections from links.json

const container = document.getElementById("card-container");
const searchInput = document.getElementById("search");

async function loadLinks() {
  try {
    const res = await fetch("links.json", { cache: "no-store" });
    const data = await res.json();
    renderGroups(data.groups);
  } catch (err) {
    console.error("Failed to load links.json:", err);
    container.innerHTML = `<p style="opacity:0.6;">⚠️ Unable to load links.json</p>`;
  }
}

// Renders all groups and cards
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
    grid.style.display = "grid";
    grid.style.gridTemplateColumns = "repeat(auto-fill, minmax(250px, 1fr))";
    grid.style.gap = "1rem";

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

// Search filter across all groups/items
searchInput.addEventListener("input", async (e) => {
  const term = e.target.value.toLowerCase();
  try {
    const res = await fetch("links.json", { cache: "no-store" });
    const data = await res.json();

    // Filter groups → only keep those with matching items
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

    renderGroups(filteredGroups);
  } catch (err) {
    console.error(err);
  }
});

// Initialize
loadLinks();
