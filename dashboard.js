// ===== Load Data =====
let DATA = { groups: [] };

fetch('links.json')
  .then(res => res.json())
  .then(json => {
    DATA = json;
    render();
  })
  .catch(err => {
    console.error("Failed to load links.json", err);
    document.getElementById("container").innerHTML =
      "<p style='color:red;'>⚠️ Unable to load links.json — please ensure it's in the same folder.</p>";
  });

// ===== State =====
let FAVS = JSON.parse(localStorage.getItem("agent.favs") || "[]");
const qEl = document.getElementById("q");

// restore last search
if (localStorage.getItem("agent.query")) {
  qEl.value = localStorage.getItem("agent.query");
}

// ===== Utility =====
const badge = (v) => v === "internal"
  ? `<span class="pill int">Internal 🔒</span>`
  : `<span class="pill ext">Customer ✅</span>`;

const favStar = (t) => {
  const on = FAVS.includes(t);
  return `<span class="favstar ${on ? "active" : ""}" data-title="${t}" aria-pressed="${on}">${on ? "★" : "☆"}</span>`;
};

const highlight = (t, q) =>
  !q ? t : t.replace(new RegExp(`(${q})`, "gi"), "<mark>$1</mark>");

const filtered = (items, q) =>
  !q
    ? items
    : items.filter(
        (i) =>
          i.title.toLowerCase().includes(q) ||
          (i.notes || "").toLowerCase().includes(q)
      );

// ===== Render =====
function render() {
  document.getElementById("sideNav").innerHTML = DATA.groups
    .map((g) => `<a href="#${g.id}">${g.title}</a>`)
    .join("");

  const q = (qEl.value || "").trim().toLowerCase();
  const all = DATA.groups.flatMap((g) => g.items);
  const favItems = all.filter((i) => FAVS.includes(i.title));
  const groups = [
    { id: "favs", title: "⭐ Favourites", items: favItems },
    ...DATA.groups,
  ];

  document.getElementById("container").innerHTML = groups
    .map((g) => {
      const items = filtered(g.items, q);
      if (!items.length) return "";
      const rows = items
        .map(
          (i) => `
        <tr>
          <td><div class="titleCell">${favStar(i.title)}<a href="${i.url}" target="_blank">${highlight(i.title,q)}</a></div></td>
          <td>${highlight(i.notes || "", q)}</td>
          <td>${badge(i.vis)}</td>
        </tr>`
        )
        .join("");
      return `
        <section class="section" id="${g.id}">
          <details class="card" open>
            <summary class="head">${g.title}</summary>
            <div class="body">
              <table>
                <thead><tr><th>Title</th><th>Notes</th><th>Visibility</th></tr></thead>
                <tbody>${rows}</tbody>
              </table>
            </div>
          </details>
        </section>`;
    })
    .join("");

  document.querySelectorAll(".favstar").forEach((el) => {
    el.onclick = () => {
      const t = el.dataset.title;
      FAVS = FAVS.includes(t) ? FAVS.filter((x) => x !== t) : [...FAVS, t];
      localStorage.setItem("agent.favs", JSON.stringify(FAVS));
      render();
    };
  });
}

// ===== Search Debounce + Persist =====
let searchTimeout;
qEl.addEventListener("input", () => {
  clearTimeout(searchTimeout);
  localStorage.setItem("agent.query", qEl.value);
  searchTimeout = setTimeout(render, 160);
});

// ===== Toolbar Buttons =====
document.getElementById("expandAll").onclick = () =>
  document.querySelectorAll("details").forEach((d) => (d.open = true));

document.getElementById("collapseAll").onclick = () =>
  document.querySelectorAll("details").forEach((d) => (d.open = false));

// ===== Theme Toggle + Indicator =====
const themeBtn = document.getElementById("themeToggle");
const themeStatus = document.getElementById("themeStatus");

function updateThemeLabel() {
  themeStatus.textContent = document.body.classList.contains("dark")
    ? "🌙 Dark Mode Active"
    : "🌞 Light Mode Active";
}

themeBtn.onclick = () => {
  document.body.classList.toggle("dark");
  localStorage.setItem(
    "agent.theme",
    document.body.classList.contains("dark") ? "dark" : "light"
  );
  updateThemeLabel();
};

if (localStorage.getItem("agent.theme") === "dark")
  document.body.classList.add("dark");
updateThemeLabel();

// ===== Keyboard Shortcut =====
document.addEventListener("keydown", (e) => {
  if (e.key === "/" && document.activeElement !== qEl) {
    e.preventDefault();
    qEl.focus();
  }
});
 
