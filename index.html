<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>Resource Hub | Ducks in the Pool</title>

  <!-- PRE-PAINT THEME & ACCENT (runs before paint) -->
  <script>
    (function() {
      const savedTheme = localStorage.getItem("theme");
      const prefersDark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
      const theme = savedTheme || (prefersDark ? "dark" : "light");
      document.documentElement.dataset.theme = theme;
      document.addEventListener("DOMContentLoaded", () => {
        document.body.dataset.theme = theme;
      });
      const accent = localStorage.getItem("accent") || "#0a84ff";
      document.documentElement.style.setProperty("--accent", accent);
      const meta = document.createElement("meta");
      meta.name = "theme-color";
      meta.content = theme === "dark" ? "#1c1c1e" : "#f7f8fa";
      document.head.appendChild(meta);
    })();
  </script>

  <!-- STYLES -->
  <style>
    :root {
      --radius: 10px;
      --blur: 18px;
      --accent: #0a84ff;
      --bg-light: #f7f8fa;
      --bg-dark: #1c1c1e;
      --text-light: #111;
      --text-dark: #f5f5f7;
    }

    [data-theme="light"] {
      --bg: var(--bg-light);
      --text: var(--text-light);
      --sidebar-bg: rgba(255,255,255,0.85);
      --sidebar-border: rgba(0,0,0,0.08);
      --card-bg: rgba(255,255,255,0.6);
      --card-border: rgba(0,0,0,0.05);
    }

    [data-theme="dark"] {
      --bg: var(--bg-dark);
      --text: var(--text-dark);
      --sidebar-bg: rgba(30,30,32,0.6);
      --sidebar-border: rgba(255,255,255,0.08);
      --card-bg: rgba(255,255,255,0.06);
      --card-border: rgba(255,255,255,0.06);
    }

    html,body{height:100%}
    body {
      margin: 0;
      display: flex;
      height: 100vh;
      font-family: -apple-system, BlinkMacSystemFont, "SF Pro Display", "Segoe UI", Roboto, sans-serif;
      background: var(--bg);
      color: var(--text);
      transition: background .3s ease, color .3s ease;
    }

    /* Sidebar */
    aside {
      width: 260px;
      padding: 1.2rem;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      border-right: 1px solid var(--sidebar-border);
      background: linear-gradient(180deg, color-mix(in srgb,var(--accent)15%,var(--sidebar-bg)) 0%, var(--sidebar-bg) 100%);
      backdrop-filter: blur(var(--blur)) saturate(180%);
    }

    header { font-size:1.3rem; font-weight:600; margin-bottom:1rem; }

    input[type="search"] {
      width: 100%;
      padding: .5rem .8rem;
      border-radius: 8px;
      border: 1px solid rgba(0,0,0,.1);
      background: rgba(255,255,255,.3);
      color: inherit;
      transition: all .2s ease;
    }
    [data-theme="dark"] input[type="search"] {
      border-color: rgba(255,255,255,.15);
      background: rgba(255,255,255,.08);
    }

    .nav-section { display:flex; flex-direction:column; gap:.4rem; margin-top:1rem; }
    .nav-section button {
      text-align:left; padding:.55rem .9rem; border-radius:var(--radius); border:none;
      background:transparent; color:inherit; font-weight:500; transition:all .25s ease;
    }
    .nav-section button:hover { transform:translateX(2px); background: color-mix(in srgb,var(--accent)10%,transparent); }
    .nav-section button.active { background:var(--accent); color:#fff; font-weight:600; box-shadow:0 0 8px color-mix(in srgb,var(--accent)40%,transparent); }

    .inline-toggles { display:flex; align-items:center; justify-content:space-between; gap:10px; margin-top:1rem; flex-wrap:wrap; }
    .icon-btn {
      width:38px; height:38px; border-radius:50%; border:none; background:var(--accent); color:#fff;
      cursor:pointer; display:flex; align-items:center; justify-content:center; transition:transform .2s ease, box-shadow .3s;
    }
    .icon-btn:hover { transform:scale(1.05); box-shadow:0 0 10px color-mix(in srgb,var(--accent)30%,transparent); }

    .color-palette { display:flex; gap:5px; }
    .color-dot { width:14px; height:14px; border-radius:50%; cursor:pointer; border:2px solid transparent; }
    .color-dot.active { border-color:var(--text); }

    main { flex:1; overflow-y:auto; padding:0 2rem 1.4rem; }
    h2 {
      position:sticky; top:0; z-index:10; background:var(--bg); backdrop-filter: blur(10px);
      display:flex; justify-content:space-between; align-items:center; padding:.4rem 0; margin:0 0 .4rem 0; color:var(--accent);
    }
    #show-all-toggle { font-size:.85rem; padding:.35rem .7rem; border-radius:8px; border:1px solid var(--card-border); background:var(--card-bg); color:var(--text); cursor:pointer; transition:all .2s ease; }
    #show-all-toggle.active { background:var(--accent); color:#fff; }

    .card {
      background:var(--card-bg); border-left:3px solid var(--accent); border-radius:var(--radius);
      padding:.5rem .9rem; border:1px solid var(--card-border); margin-bottom:.45rem; min-height:52px;
      display:flex; flex-direction:column; justify-content:center; position:relative;
      backdrop-filter: blur(12px) saturate(160%); transition: background .3s, transform .2s, box-shadow .3s;
    }
    .card:hover { background: color-mix(in srgb,var(--accent)12%,var(--card-bg)); box-shadow:0 4px 12px color-mix(in srgb,var(--accent)15%,transparent); transform: translateY(-2px); }
    .card small { display:block; opacity:.75; margin-top:.25rem; }
    .star { position:absolute; right:10px; top:8px; font-size:1rem; cursor:pointer; color:#888; }
    .star.active { color:var(--accent); }

    .section-group { margin-bottom:1rem; }
    .section-group h3 { margin:.8rem 0 .4rem 0; color:var(--accent); font-size:1rem; }

    #to-top { position:fixed; bottom:25px; right:25px; width:42px; height:42px; border-radius:50%; background:var(--accent); color:#fff; border:none; font-size:1.3rem; display:none; cursor:pointer; box-shadow:0 2px 10px rgba(0,0,0,.2); transition:opacity .3s, transform .3s; }
    #to-top.visible { display:block; opacity:.9; } #to-top:hover { transform:scale(1.1); }

    /* Default grid/list layout */
    body.vertical-layout main #grid { display:flex; flex-direction:column; }
    body:not(.vertical-layout) main #grid { display:grid; grid-template-columns: repeat(auto-fill,minmax(280px,1fr)); gap:.7rem; }

    /* Compact mode */
    body.compact .card { padding:.35rem .6rem; font-size:.9rem; min-height:38px; }
    body.compact .card strong { font-weight:500; }
    body.compact .card small { display:none; }

    /* Additional toggles CSS */
    body.hide-sidebar aside { display:none; } body.hide-sidebar main { padding-left:2rem; }
    body.grid-1 main #grid { grid-template-columns: repeat(1,1fr); }
    body.grid-2 main #grid { grid-template-columns: repeat(2,1fr); }
    body.grid-3 main #grid { grid-template-columns: repeat(3,1fr); }
    body.card-small .card { padding:.25rem .5rem; font-size:.88rem; min-height:40px; }
    body.card-medium .card { padding:.5rem .9rem; font-size:1rem; min-height:52px; }
    body.card-large .card { padding:.9rem 1.2rem; font-size:1.05rem; min-height:72px; }
    body.images-hidden .card img { display:none; }
    body.high-contrast { --card-bg:#fff; --bg:#000; --text:#fff; --accent:#00ff6a; }
    body.high-contrast .icon-btn { box-shadow:0 0 8px var(--accent); }

    @media (max-width:800px) {
      body { flex-direction:column; }
      aside { flex-direction:row; width:100%; overflow-x:auto; }
      body.hide-sidebar aside { display:none; }
    }
  </style>
</head>

<body>
  <!-- ASIDE / LEFT SIDEBAR -->
  <aside>
    <div>
      <header>Resource Hub</header>

      <!-- Search -->
      <input id="search" type="search" placeholder="Search…" />

      <!-- Nav container (buttons created by dashboard.js) -->
      <div class="nav-section" id="nav-section"></div>
    </div>

    <!-- TOGGLES -->
    <div class="inline-toggles">
      <!-- Core toggles -->
      <button id="theme-toggle"      type="button" class="icon-btn" title="Toggle Light/Dark">🌙</button>
      <button id="layout-toggle"     type="button" class="icon-btn" title="Toggle Layout">⇆</button>
      <button id="compact-toggle"    type="button" class="icon-btn" title="Toggle Compact">📏</button>

      <!-- Extra toggles -->
      <button id="sidebar-toggle"    type="button" class="icon-btn" title="Toggle Sidebar">⫷</button>
      <button id="grid-size-toggle"  type="button" class="icon-btn" title="Cycle Grid Size">▦</button>
      <button id="card-size-toggle"  type="button" class="icon-btn" title="Cycle Card Size">🞆</button>
      <button id="images-toggle"     type="button" class="icon-btn" title="Toggle Images">🖼️</button>
      <button id="contrast-toggle"   type="button" class="icon-btn" title="High Contrast">⚫</button>

      <!-- Accent color dots (JS fills this) -->
      <div class="color-palette" id="color-palette" aria-hidden="true"></div>
    </div>
  </aside>

  <!-- MAIN CONTENT -->
  <main id="content">
    <h2>
      <span id="section-title"></span>
      <button id="show-all-toggle" type="button">Show All</button>
    </h2>

    <!-- Grid container -->
    <div id="grid"></div>
  </main>

  <!-- FLOATING UI -->
  <button id="to-top" type="button" aria-label="Scroll to top">↑</button>

  <!-- SCRIPTS -->
  <script src="dashboard.js" defer></script>

  <!-- helper: to-top button behavior -->
  <script>
    (function(){
      const topBtn = document.getElementById('to-top');
      if (!topBtn) return;
      function update() { topBtn.classList.toggle('visible', window.scrollY > 400); }
      window.addEventListener('scroll', update, { passive: true });
      topBtn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
      update();
    })();
  </script>
</body>
</html>
