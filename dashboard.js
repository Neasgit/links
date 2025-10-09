// ===============================
// Resource Hub Dashboard Script
// ===============================

// ====== Load Data from JSON ======
let DATA = { groups: [] };

fetch('links.json')
  .then((res) => res.json())
  .then((json) => {
    DATA = json;
    render();
  })
  .catch((err) => {
    console.error('Failed to load links.json', err);
    document.getElementById('container').innerHTML =
      "<p style='color:red;'>⚠️ Unable to load links.json — please ensure it's in the same folder.</p>";
  });

// ====== State & Elements ======
let FAVS = JSON.parse(localStorage.getItem('agent.favs') || '[]');
let OPEN_SECTIONS = JSON.parse(localStorage.getItem('agent.open') || '[]');
let CLICKS = JSON.parse(localStorage.getItem('agent.clicks') || '{}');
const qEl = document.getElementById('q');

// ====== Utilities ======
const badge = (v) =>
  v === 'internal'
    ? `<span class="pill int">Internal 🔒</span>`
    : `<span class="pill ext">External ✅</span>`;

const favStar = (t) => {
  const on = FAVS.includes(t);
  return `<span class="favstar ${on ? 'active' : ''}" data-title="${t}" aria-pressed="${on}">${
    on ? '★' : '☆'
  }</span>`;
};

const highlight = (t, q) =>
  !q ? t : t.replace(new RegExp(`(${q})`, 'gi'), '<mark>$1</mark>');

const filtered = (items, q) =>
  !q
    ? items
    : items.filter(
        (i) =>
          i.title.toLowerCase().includes(q) ||
          (i.notes || '').toLowerCase().includes(q)
      );

// ====== Render Function ======
function render() {
  // Sidebar
  document.getElementById('sideNav').innerHTML = DATA.groups
    .map((g) => `<a href="#${g.id}">${g.title}</a>`)
    .join('');

  const q = (qEl.value || '').trim().toLowerCase();
  const all = DATA.groups.flatMap((g) => g.items);
  const favItems = all.filter((i) => FAVS.includes(i.title));

  // No results feedback
  const results = all.filter(
    (i) =>
      i.title.toLowerCase().includes(q) ||
      (i.notes || '').toLowerCase().includes(q)
  );
  if (q && results.length === 0) {
    document.getElementById('container').innerHTML = `
      <p style="padding:1rem;background:var(--card);border-radius:8px;">
        No results found for "<strong>${q}</strong>".
        <button class="btn" onclick="qEl.value='';render();">Clear search</button>
      </p>`;
    return;
  }

  const groups = [
    { id: 'favs', title: '⭐ Favourites', items: favItems },
    ...DATA.groups,
  ];

  document.getElementById('container').innerHTML = groups
    .map((g) => {
      const items = filtered(g.items, q);
      if (!items.length) return '';
      const rows = items
        .map(
          (i) => `
        <tr>
          <td>
            <div class="titleCell">
              ${favStar(i.title)}
              <a href="${i.url}" target="_blank" data-title="${i.title}">
                ${highlight(i.title, q)}
              </a>
            </div>
          </td>
          <td>${highlight(i.notes || '', q)}</td>
          <td>${badge(i.vis)}</td>
        </tr>`
        )
        .join('');
      return `
      <section class="section" id="${g.id}">
        <details class="card" ${OPEN_SECTIONS.includes(g.id) ? 'open' : ''}>
          <summary class="head">${g.title}</summary>
          <div class="body">
            <table>
              <thead>
                <tr><th>Title</th><th>Notes</th><th>Visibility</th></tr>
              </thead>
              <tbody>${rows}</tbody>
            </table>
          </div>
        </details>
      </section>`;
    })
    .join('');

  // ====== Favourites toggle ======
  document.querySelectorAll('.favstar').forEach((el) => {
    el.onclick = () => {
      const t = el.dataset.title;
      FAVS = FAVS.includes(t)
        ? FAVS.filter((x) => x !== t)
        : [...FAVS, t];
      localStorage.setItem('agent.favs', JSON.stringify(FAVS));
      render();
    };
  });

  // ====== Track section open/close ======
  document.querySelectorAll('details').forEach((d) => {
    d.addEventListener('toggle', () => {
      const id = d.parentElement.id;
      if (d.open && !OPEN_SECTIONS.includes(id)) OPEN_SECTIONS.push(id);
      else if (!d.open)
        OPEN_SECTIONS = OPEN_SECTIONS.filter((x) => x !== id);
      localStorage.setItem('agent.open', JSON.stringify(OPEN_SECTIONS));
    });
  });

  // ====== Click analytics ======
  document.querySelectorAll('a[data-title]').forEach((link) => {
    link.addEventListener('click', () => {
      const t = link.dataset.title;
      CLICKS[t] = (CLICKS[t] || 0) + 1;
      localStorage.setItem('agent.clicks', JSON.stringify(CLICKS));
      updateTopUsed();
    });
  });

  // ====== Enable favourite reordering ======
  enableFavDrag();

  // Update analytics display
  updateTopUsed();
}

// ====== Update Top Used Display ======
function updateTopUsed() {
  const topUsed = Object.entries(CLICKS)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([title, count]) => `${title} (${count})`)
    .join(', ');
  const status = document.getElementById('themeStatus');
  if (status)
    status.textContent = topUsed ? `Top: ${topUsed}` : 'No usage data yet';
}

// ====== Enable Drag for Favourites ======
function enableFavDrag() {
  const favSection = document.querySelector('#favs tbody');
  if (!favSection || typeof Sortable === 'undefined') return;
  new Sortable(favSection, {
    animation: 150,
    onEnd: () => {
      const titles = Array.from(favSection.querySelectorAll('.titleCell a')).map(
        (a) => a.textContent
      );
      FAVS = titles;
      localStorage.setItem('agent.favs', JSON.stringify(FAVS));
    },
  });
}

// ====== Search (Debounced) ======
let searchTimeout;
qEl.addEventListener('input', () => {
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(render, 160);
});

// ====== Toolbar Buttons ======
document.getElementById('expandAll').onclick = () =>
  document.querySelectorAll('details').forEach((d) => (d.open = true));

document.getElementById('collapseAll').onclick = () =>
  document.querySelectorAll('details').forEach((d) => (d.open = false));

// ====== Theme Toggle ======
const themeBtn = document.getElementById('themeToggle');

if (
  !localStorage.getItem('agent.theme') &&
  window.matchMedia('(prefers-color-scheme: dark)').matches
) {
  document.body.classList.add('dark');
  localStorage.setItem('agent.theme', 'dark');
}
if (localStorage.getItem('agent.theme') === 'dark')
  document.body.classList.add('dark');

themeBtn.onclick = () => {
  document.body.classList.toggle('dark');
  localStorage.setItem(
    'agent.theme',
    document.body.classList.contains('dark') ? 'dark' : 'light'
  );
};

// ====== Keyboard Shortcut ("/" to focus search) ======
document.addEventListener('keydown', (e) => {
  if (e.key === '/' && document.activeElement !== qEl) {
    e.preventDefault();
    qEl.focus();
  }
});
