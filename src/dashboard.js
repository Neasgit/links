/* src/dashboard.js */

const state = {
  data: null,
  activeGroup: 'all',
  query: '',
  favsOnly: false,
  visFilter: null, // 'internal' | 'external' | null
};

// 1. Fetch Data
async function init() {
  try {
    // Points to your data folder
    const res = await fetch('./data/links.json');
    const data = await res.json();
    state.data = data;
    renderSidebar();
    renderGrid();
    setupEventListeners();
  } catch (err) {
    console.error('Failed to load links:', err);
    document.getElementById('container').innerHTML =
      '<div style="padding:20px; text-align:center">Error loading links.json</div>';
  }
}

// 2. Render Sidebar Navigation
function renderSidebar() {
  const nav = document.getElementById('sideNav');
  if (!nav || !state.data) return;

  nav.innerHTML = '';

  // "All" button
  const allBtn = document.createElement('button');
  allBtn.textContent = 'All Links';
  allBtn.className = state.activeGroup === 'all' ? 'active' : '';
  allBtn.onclick = () => setActiveGroup('all');
  nav.appendChild(allBtn);

  // Group buttons
  state.data.groups.forEach((g) => {
    const btn = document.createElement('button');
    btn.textContent = g.title;
    btn.className = g.id === state.activeGroup ? 'active' : '';
    btn.onclick = () => setActiveGroup(g.id);
    nav.appendChild(btn);
  });
}

// 3. Render Main Grid
function renderGrid() {
  const container = document.getElementById('container');
  if (!container || !state.data) return;

  container.innerHTML = '';

  // Get Favorites from LocalStorage
  const favs = JSON.parse(localStorage.getItem('favs') || '[]');

  // Filter items
  const groupsToRender = state.data.groups.filter((g) => state.activeGroup === 'all' || g.id === state.activeGroup);

  let hasResults = false;

  groupsToRender.forEach((group) => {
    // Filter items inside the group
    const visibleItems = (group.items || []).filter((item) => {
      // Search Text
      const q = state.query.toLowerCase();
      const textMatch = !q || (item.title + ' ' + (item.notes || '')).toLowerCase().includes(q);

      // Favorites Filter
      const isFav = favs.includes(item.url);
      const favMatch = !state.favsOnly || isFav;

      // Internal/External Chip Filter
      const visMatch = !state.visFilter || item.vis === state.visFilter;

      return textMatch && favMatch && visMatch;
    });

    if (visibleItems.length > 0) {
      hasResults = true;

      // Create Section
      const section = document.createElement('div');
      section.className = 'section';

      const details = document.createElement('details');
      details.className = 'card';
      details.open = true; // Default open

      const summary = document.createElement('summary');
      summary.textContent = group.title;

      const grid = document.createElement('div');
      grid.className = 'cardGrid';

      visibleItems.forEach((item) => {
        const isFav = favs.includes(item.url);

        // Badge HTML
        let badge = '';
        if (item.vis) {
          badge = `<span class="badge ${item.vis}">${item.vis}</span>`;
        }

        const card = document.createElement('div');
        card.className = `linkCard ${item.vis || ''}`;
        card.innerHTML = `
          <a href="${item.url}" target="_blank" class="cardTitle" title="${item.notes || ''}">
            ${item.title}
          </a>
          ${badge}
          <button class="starBtn ${isFav ? 'fav' : ''}" data-url="${item.url}">
            ${isFav ? '★' : '☆'}
          </button>
        `;
        grid.appendChild(card);
      });

      details.appendChild(summary);
      details.appendChild(grid);
      section.appendChild(details);
      container.appendChild(section);
    }
  });

  if (!hasResults) {
    container.innerHTML = '<div style="padding:20px; opacity:0.6;">No links found.</div>';
  }
}

// 4. Interaction Logic
function setActiveGroup(id) {
  state.activeGroup = id;
  renderSidebar();
  renderGrid();
  // Auto-close mobile menu on selection
  if (window.innerWidth <= 900) {
    document.body.classList.remove('nav-open');
  }
}

function toggleFav(url) {
  const favs = JSON.parse(localStorage.getItem('favs') || '[]');
  const idx = favs.indexOf(url);
  if (idx === -1) favs.push(url);
  else favs.splice(idx, 1);

  localStorage.setItem('favs', JSON.stringify(favs));
  renderGrid();
}

function setupEventListeners() {
  // Search
  document.getElementById('q').addEventListener('input', (e) => {
    state.query = e.target.value;
    renderGrid();
  });

  // Favorites Chip
  const btnFav = document.getElementById('chipFavs');
  btnFav.addEventListener('click', () => {
    state.favsOnly = !state.favsOnly;
    btnFav.setAttribute('aria-pressed', state.favsOnly);
    renderGrid();
  });

  // Vis Chips (Internal/External)
  document.querySelectorAll('.chip[data-vis]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const vis = btn.dataset.vis;
      // Toggle
      if (state.visFilter === vis) {
        state.visFilter = null;
        btn.setAttribute('aria-pressed', 'false');
      } else {
        state.visFilter = vis;
        // Unpress others
        document.querySelectorAll('.chip[data-vis]').forEach((b) => b.setAttribute('aria-pressed', 'false'));
        btn.setAttribute('aria-pressed', 'true');
      }
      renderGrid();
    });
  });

  // Star Buttons (Delegation)
  document.getElementById('container').addEventListener('click', (e) => {
    if (e.target.classList.contains('starBtn')) {
      e.preventDefault();
      toggleFav(e.target.dataset.url);
    }
  });

  // Expand/Collapse All
  document.getElementById('expandAll').addEventListener('click', () => {
    document.querySelectorAll('details').forEach((d) => (d.open = true));
  });
  document.getElementById('collapseAll').addEventListener('click', () => {
    document.querySelectorAll('details').forEach((d) => (d.open = false));
  });

  // Theme Toggle
  document.getElementById('themeToggle').addEventListener('click', () => {
    document.body.classList.toggle('dark');
    const isDark = document.body.classList.contains('dark');
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
  });

  // Apply saved theme
  if (localStorage.getItem('theme') === 'dark') {
    document.body.classList.add('dark');
  }

  // --- Mobile Menu Logic ---
  const menuBtn = document.getElementById('menuBtn');
  const closeBtn = document.getElementById('closeSidebarBtn');
  const body = document.body;

  if (menuBtn) {
    menuBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      body.classList.add('nav-open');
    });
  }

  if (closeBtn) {
    closeBtn.addEventListener('click', () => {
      body.classList.remove('nav-open');
    });
  }

  // Close when clicking backdrop
  document.addEventListener('click', (e) => {
    if (body.classList.contains('nav-open') && !e.target.closest('.sidebar') && !e.target.closest('#menuBtn')) {
      body.classList.remove('nav-open');
    }
  });
}

// Start
init();
