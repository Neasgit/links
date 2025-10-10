const content = document.getElementById("content");
const searchBar = document.querySelector(".search-bar");
const nav = document.getElementById("nav");
const themeToggle = document.getElementById("themeToggle");
const layoutToggle = document.getElementById("layoutToggle");
const compactToggle = document.getElementById("compactToggle");

let groups = [];
let darkMode = true;
let compactMode = false;
let verticalLayout = false;
let favourites = new Set();

const raccoonMessages = [
  "No results — the raccoon might’ve stolen them 🦝",
  "Hmm, the raccoon swears it was here a second ago.",
  "Zero matches. The raccoon is shrugging.",
  "You scared the raccoon away 😱",
  "404: Raccoon took it and ran.",
  "Nothing here — maybe check under the dumpster?",
  "Nada. Zilch. Raccoon’s hoarding again.",
  "Empty paws! Try another word.",
  "The raccoon hissed at me. Try again politely.",
  "You’re searching too clean. Try a little dirtier?",
];

async function loadLinks() {
  try {
    const res = await fetch("links.json");
    if (!res.ok) throw new Error("Network error");
    const json = await res.json();
    groups = json.groups || [];
    renderSidebar();
    renderAllSections();
    observeSections();
  } catch (err) {
    console.error("Failed to load links:", err);
    content.innerHTML = `<div class="no-results">⚠️ Could not load links.json</div>`;
  }
}

function renderSidebar() {
  nav.innerHTML = "";

  const favBtn = document.createElement("button");
  favBtn.textContent = "⭐ Favourites";
  favBtn.onclick = () => renderFavourites();
  nav.appendChild(favBtn);

  groups.forEach(g => {
    const btn = document.createElement("button");
    btn.textContent = g.title;
    btn.onclick = () => renderSection(g);
    nav.appendChild(btn);
  });

  const showAll = document.createElement("button");
  showAll.textContent = "📚 Show All";
  showAll.onclick = () => renderAllSections();
  nav.appendChild(showAll);
}

function renderAllSections() {
  content.innerHTML = "";
  groups.forEach(g => {
    const sectionDiv = document.createElement("div");
    sectionDiv.className = "section";
    sectionDiv.innerHTML = `<h2>${g.title}</h2>`;

    const grid = document.createElement("div");
    grid.className = "card-grid";
    g.items.forEach(item => grid.appendChild(createCard(item)));

    sectionDiv.appendChild(grid);
    content.appendChild(sectionDiv);
  });
}

function renderSection(group) {
  content.innerHTML = "";
  const sectionDiv = document.createElement("div");
  sectionDiv.className = "section visible";
  sectionDiv.innerHTML = `<h2>${group.title}</h2>`;

  const grid = document.createElement("div");
  grid.className = "card-grid";
  group.items.forEach(item => grid.appendChild(createCard(item)));

  sectionDiv.appendChild(grid);
  content.appendChild(sectionDiv);
}

function createCard(item) {
  const card = document.createElement("div");
  card.className = "card";
  card.innerHTML = `<strong>${item.title}</strong><span>${item.notes}</span>`;

  const fav = document.createElement("div");
  fav.className = "fav";
  fav.textContent = favourites.has(item.title) ? "⭐" : "☆";
  fav.onclick = e => {
    e.stopPropagation();
    toggleFavourite(item.title);
    fav.textContent = favourites.has(item.title) ? "⭐" : "☆";
  };

  card.appendChild(fav);
  card.onclick = () => window.open(item.url, "_blank");
  return card;
}

function toggleFavourite(title) {
  if (favourites.has(title)) favourites.delete(title);
  else favourites.add(title);
}

function renderFavourites() {
  content.innerHTML = "";
  const favList = Array.from(favourites);
  if (!favList.length) {
    content.innerHTML = `<div class="no-results">No favourites yet 🦝</div>`;
    return;
  }

  const sectionDiv = document.createElement("div");
  sectionDiv.className = "section visible";
  sectionDiv.innerHTML = `<h2>⭐ Favourites</h2>`;

  const grid = document.createElement("div");
  grid.className = "card-grid";
  groups.forEach(g =>
    g.items.forEach(item => {
      if (favourites.has(item.title)) grid.appendChild(createCard(item));
    })
  );

  sectionDiv.appendChild(grid);
  content.appendChild(sectionDiv);
}

searchBar.addEventListener("input", () => {
  const query = searchBar.value.toLowerCase().trim();
  if (query === "raccoon") {
    activateRaccoonMode();
    return;
  } else {
    deactivateRaccoonMode();
  }

  if (!query) {
    renderAllSections();
    return;
  }

  const results = [];
  groups.forEach(g =>
    g.items.forEach(item => {
      if (
        item.title.toLowerCase().includes(query) ||
        item.notes.toLowerCase().includes(query)
      ) {
        results.push(item);
      }
    })
  );

  content.innerHTML = "";
  if (!results.length) {
    const msg = raccoonMessages[Math.floor(Math.random() * raccoonMessages.length)];
    content.innerHTML = `<div class="no-results">${msg}</div>`;
  } else {
    const sectionDiv = document.createElement("div");
    sectionDiv.className = "section visible";
    sectionDiv.innerHTML = `<h2>Search Results</h2>`;

    const grid = document.createElement("div");
    grid.className = "card-grid";
    results.forEach(item => grid.appendChild(createCard(item)));
    sectionDiv.appendChild(grid);
    content.appendChild(sectionDiv);
  }
});

function activateRaccoonMode() {
  document.body.classList.add("raccoon-mode");
  if (!document.querySelector(".raccoon-float")) {
    const raccoon = document.createElement("div");
    raccoon.className = "raccoon-float";
    raccoon.textContent = "🦝";
    document.body.appendChild(raccoon);
  }
}

function deactivateRaccoonMode() {
  document.body.classList.remove("raccoon-mode");
  const float = document.querySelector(".raccoon-float");
  if (float) float.remove();
}

themeToggle.onclick = () => {
  darkMode = !darkMode;
  document.body.style.background = darkMode ? "var(--bg-dark)" : "var(--bg-light)";
  document.body.style.color = darkMode ? "var(--text-dark)" : "var(--text-light)";
  themeToggle.textContent = darkMode ? "🌙" : "☀️";
};

layoutToggle.onclick = () => {
  verticalLayout = !verticalLayout;
  document.querySelectorAll(".card-grid").forEach(g => {
    g.style.flexDirection = verticalLayout ? "column" : "row";
  });
};

compactToggle.onclick = () => {
  compactMode = !compactMode;
  document.body.classList.toggle("compact", compactMode);
};

function observeSections() {
  const observer = new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) entry.target.classList.add("visible");
      });
    },
    { threshold: 0.1 }
  );

  document.querySelectorAll(".section").forEach(sec => observer.observe(sec));
}

loadLinks();
