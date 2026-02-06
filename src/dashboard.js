/**
 * CONFIGURATION
 */
const SHEET_URL =
  'https://docs.google.com/spreadsheets/d/e/2PACX-1vQO55ZUTCB2Jy1syouDZJ2b9a4L68vgRtWTQ8zpubQLUuwJW-c9ebZBUupyvxrHYO7obumuPy3L0vHO/pub?gid=0&single=true&output=csv';

// State Management
let GLOBAL_DATA = [];
let FAVORITES = JSON.parse(localStorage.getItem('dash_favorites')) || [];
let CURRENT_FILTER = 'all';

document.addEventListener('DOMContentLoaded', () => {
  initDashboard();
  setupEventListeners();
  loadSavedTheme(); // Restore saved theme on load
});

// --- THEME LOGIC ---
function loadSavedTheme() {
  const savedTheme = localStorage.getItem('dash_theme') || 'slate';
  document.body.setAttribute('data-theme', savedTheme);
  const selector = document.getElementById('theme-selector');
  if (selector) selector.value = savedTheme;
}

async function initDashboard() {
  const container = document.getElementById('dashboard-container');
  container.innerHTML = '<div class="loading-state">Syncing with Google Sheets...</div>';

  try {
    const response = await fetch(SHEET_URL);
    if (!response.ok) throw new Error('Failed to fetch data');
    const text = await response.text();

    GLOBAL_DATA = parseCSV(text);

    renderSidebar();
    applyFiltersAndRender();
  } catch (error) {
    console.error(error);
    container.innerHTML = `<div class="loading-state" style="color:#ef4444">Error loading data.</div>`;
  }
}

function parseCSV(csvText) {
  const lines = csvText.split(/\r?\n/);
  return lines
    .slice(1)
    .map((line) => {
      const regex = /,(?=(?:(?:[^"]*"){2})*[^"]*$)/;
      const cols = line.split(regex).map((col) => col.trim().replace(/^"|"$/g, '').replace(/""/g, '"'));

      if (cols.length < 3) return null;

      return {
        section: cols[0],
        title: cols[1],
        url: cols[2],
        notes: cols[3] || '',
        vis: cols[4] ? cols[4].toLowerCase() : 'internal',
        id: cols[2],
      };
    })
    .filter((item) => item && item.title);
}

function renderSidebar() {
  const listEl = document.getElementById('sidebar-list');
  listEl.innerHTML = '';

  const sections = [...new Set(GLOBAL_DATA.map((item) => item.section))];

  const allLi = document.createElement('li');
  allLi.textContent = 'All Links';
  allLi.className = 'active';
  allLi.onclick = () => {
    CURRENT_FILTER = 'all';
    updateActiveSidebar(allLi);
    applyFiltersAndRender();
    closeMobileMenu();
  };
  listEl.appendChild(allLi);

  sections.forEach((sec) => {
    const li = document.createElement('li');
    li.textContent = sec;
    li.onclick = () => {
      CURRENT_FILTER = 'section:' + sec;
      updateActiveSidebar(li);
      applyFiltersAndRender();
      closeMobileMenu();
    };
    listEl.appendChild(li);
  });
}

function updateActiveSidebar(clickedLi) {
  document.querySelectorAll('.sidebar-nav li').forEach((li) => li.classList.remove('active'));
  clickedLi.classList.add('active');
  resetVisualButtons();
}

function applyFiltersAndRender() {
  let filtered = [];

  if (CURRENT_FILTER === 'fav') {
    filtered = GLOBAL_DATA.filter((item) => FAVORITES.includes(item.id));
    document.getElementById('page-title').textContent = 'Favourites';
  } else if (CURRENT_FILTER === 'internal') {
    filtered = GLOBAL_DATA.filter((item) => item.vis === 'internal');
    document.getElementById('page-title').textContent = 'Internal Resources';
  } else if (CURRENT_FILTER === 'external') {
    filtered = GLOBAL_DATA.filter((item) => item.vis === 'external');
    document.getElementById('page-title').textContent = 'External Resources';
  } else if (CURRENT_FILTER.startsWith('section:')) {
    const secName = CURRENT_FILTER.split('section:')[1];
    filtered = GLOBAL_DATA.filter((item) => item.section === secName);
    document.getElementById('page-title').textContent = secName;
  } else {
    filtered = GLOBAL_DATA;
    document.getElementById('page-title').textContent = 'All Links';
  }

  const query = document.getElementById('search-input').value.toLowerCase();
  if (query) {
    filtered = filtered.filter(
      (item) => item.title.toLowerCase().includes(query) || item.notes.toLowerCase().includes(query),
    );
  }

  renderGrid(filtered);

  const btnToggle = document.getElementById('btn-toggle-all');
  if (btnToggle) btnToggle.textContent = 'Collapse All';
}

function renderGrid(data) {
  const container = document.getElementById('dashboard-container');
  container.innerHTML = '';

  if (data.length === 0) {
    container.innerHTML = '<div class="loading-state">No links found.</div>';
    return;
  }

  const groups = {};
  data.forEach((item) => {
    if (!groups[item.section]) groups[item.section] = [];
    groups[item.section].push(item);
  });

  Object.keys(groups).forEach((sectionName) => {
    const groupDiv = document.createElement('div');
    groupDiv.className = 'dashboard-group';

    const h2 = document.createElement('h2');
    h2.textContent = sectionName;
    h2.onclick = () => {
      groupDiv.classList.toggle('collapsed');
    };
    groupDiv.appendChild(h2);

    const grid = document.createElement('div');
    grid.className = 'dashboard-grid';

    groups[sectionName].forEach((item) => {
      const isFav = FAVORITES.includes(item.id);

      const card = document.createElement('div');
      card.className = 'dashboard-card';

      const linkContent = `
                <a href="${item.url}" target="_blank" class="card-left" style="text-decoration:none;">
                    <span class="badge ${item.vis}">${item.vis}</span>
                    <span class="card-title">${item.title}</span>
                </a>
            `;

      const starSpan = document.createElement('span');
      starSpan.className = `star-icon ${isFav ? 'active' : ''}`;
      starSpan.innerHTML = '★';
      starSpan.onclick = (e) => {
        e.stopPropagation();
        toggleFavorite(item.id);
      };

      card.innerHTML = linkContent;
      card.appendChild(starSpan);
      grid.appendChild(card);
    });

    groupDiv.appendChild(grid);
    container.appendChild(groupDiv);
  });
}

function toggleFavorite(id) {
  if (FAVORITES.includes(id)) {
    FAVORITES = FAVORITES.filter((fId) => fId !== id);
  } else {
    FAVORITES.push(id);
  }
  localStorage.setItem('dash_favorites', JSON.stringify(FAVORITES));
  applyFiltersAndRender();
}

function toggleMobileMenu() {
  const sidebar = document.getElementById('app-sidebar');
  const overlay = document.getElementById('sidebar-overlay');
  sidebar.classList.toggle('active');
  overlay.classList.toggle('active');
}

function closeMobileMenu() {
  const sidebar = document.getElementById('app-sidebar');
  const overlay = document.getElementById('sidebar-overlay');
  sidebar.classList.remove('active');
  overlay.classList.remove('active');
}

function setupEventListeners() {
  document.getElementById('search-input').addEventListener('input', applyFiltersAndRender);

  document.getElementById('theme-toggle').addEventListener('click', () => {
    document.body.classList.toggle('light-mode');
  });

  document.getElementById('btn-refresh').addEventListener('click', () => {
    window.location.reload();
  });

  document.getElementById('mobile-menu-btn').addEventListener('click', toggleMobileMenu);
  document.getElementById('sidebar-overlay').addEventListener('click', closeMobileMenu);

  // --- NEW: Theme Selector ---
  const themeSelect = document.getElementById('theme-selector');
  if (themeSelect) {
    themeSelect.addEventListener('change', (e) => {
      const newTheme = e.target.value;
      document.body.setAttribute('data-theme', newTheme);
      localStorage.setItem('dash_theme', newTheme);
    });
  }

  const btnToggle = document.getElementById('btn-toggle-all');
  btnToggle.addEventListener('click', () => {
    const groups = document.querySelectorAll('.dashboard-group');
    const isCurrentlyCollapsed = btnToggle.textContent === 'Expand All';

    groups.forEach((group) => {
      if (isCurrentlyCollapsed) {
        group.classList.remove('collapsed');
      } else {
        group.classList.add('collapsed');
      }
    });
    btnToggle.textContent = isCurrentlyCollapsed ? 'Collapse All' : 'Expand All';
  });

  const favBtn = document.getElementById('btn-fav-filter');
  favBtn.addEventListener('click', function () {
    if (CURRENT_FILTER === 'fav') {
      resetToAll();
    } else {
      CURRENT_FILTER = 'fav';
      resetVisualButtons();
      this.classList.add('active');
      updateSidebarSelection();
      applyFiltersAndRender();
      closeMobileMenu();
    }
  });

  const internalBtn = document.getElementById('btn-filter-internal');
  internalBtn.addEventListener('click', function () {
    if (CURRENT_FILTER === 'internal') {
      resetToAll();
    } else {
      CURRENT_FILTER = 'internal';
      resetVisualButtons();
      this.classList.add('active');
      updateSidebarSelection();
      applyFiltersAndRender();
      closeMobileMenu();
    }
  });

  const externalBtn = document.getElementById('btn-filter-external');
  externalBtn.addEventListener('click', function () {
    if (CURRENT_FILTER === 'external') {
      resetToAll();
    } else {
      CURRENT_FILTER = 'external';
      resetVisualButtons();
      this.classList.add('active');
      updateSidebarSelection();
      applyFiltersAndRender();
      closeMobileMenu();
    }
  });
}

function updateSidebarSelection() {
  document.querySelectorAll('.sidebar-nav li').forEach((li) => li.classList.remove('active'));
}

function resetVisualButtons() {
  document.getElementById('btn-fav-filter').classList.remove('active');
  document.getElementById('btn-filter-internal').classList.remove('active');
  document.getElementById('btn-filter-external').classList.remove('active');
}

function resetToAll() {
  CURRENT_FILTER = 'all';
  resetVisualButtons();
  const allLinksItem = document.querySelector('#sidebar-list li:first-child');
  if (allLinksItem) updateActiveSidebar(allLinksItem);
  applyFiltersAndRender();
}
