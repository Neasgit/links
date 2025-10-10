// dashboard.js
// Ducksinthepool Resource Hub
// Loads links.json, builds cards, and enables search

const container = document.getElementById("card-container");
const searchInput = document.getElementById("search");

// Fetch links and render them
async function loadLinks() {
  try {
    const res = await fetch("links.json");
    const links = await res.json();
    renderCards(links);
  } catch (err) {
    console.error("Failed to load links.json:", err);
    container.innerHTML = `<p style="opacity:0.6;">⚠️ Unable to load links.json</p>`;
  }
}

// Render all link cards
function renderCards(data) {
  container.innerHTML = "";
  data.forEach((item) => {
    const card = document.createElement("div");
    card.className = "card";
    card.style.borderLeft = `4px solid var(--accent)`;
    card.innerHTML = `
      <h3>${item.title}</h3>
      <p>${item.description || ""}</p>
    `;
    card.onclick = () => window.open(item.url, "_blank");
    container.appendChild(card);
  });
}

// Search filter
searchInput.addEventListener("input", async (e) => {
  const term = e.target.value.toLowerCase();
  try {
    const res = await fetch("links.json");
    const data = await res.json();
    const filtered = data.filter(
      (item) =>
        item.title.toLowerCase().includes(term) ||
        (item.description && item.description.toLowerCase().includes(term))
    );
    renderCards(filtered);
  } catch (err) {
    console.error(err);
  }
});

// Initialize
loadLinks();
