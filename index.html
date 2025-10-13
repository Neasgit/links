<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>Resource Hub | Ducks in the Pool</title>

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
      meta.content = theme === "dark" ? "#111216" : "#f7f8fa";
      document.head.appendChild(meta);
    })();
  </script>

  <style>
    :root{
      --sidebar-width:240px;
      --radius:10px;
      --gap:10px;
      --blur:12px;
      --accent:#0a84ff;
      --accent-strong:#0066d6;
      --bg-light:#f7f8fa;
      --bg-dark:#0f1113;
      --text-light:#0b1220;
      --text-dark:#f5f5f7;
      --palette-size:14px;
    }

    [data-theme="light"]{
      --bg: var(--bg-light);
      --text: var(--text-light);
      --muted: rgba(11,18,32,0.55);
      --sidebar-bg: rgba(255,255,255,0.92);
      --sidebar-border: rgba(0,0,0,0.06);
      --card-bg: #ffffff;
      --card-border: rgba(0,0,0,0.06);
      --btn-bg-surface: rgba(255,255,255,0.6);
      --btn-border: rgba(0,0,0,0.06);
      --btn-text: var(--text-light);
    }

    [data-theme="dark"]{
      --bg: var(--bg-dark);
      --text: var(--text-dark);
      --muted: rgba(255,255,255,0.62);
      --sidebar-bg: rgba(16,16,18,0.72);
      --sidebar-border: rgba(255,255,255,0.06);
      --card-bg: rgba(255,255,255,0.03);
      --card-border: rgba(255,255,255,0.06);
      --btn-bg-surface: rgba(255,255,255,0.03);
      --btn-border: rgba(255,255,255,0.06);
      --btn-text: var(--text-dark);
    }

    html,body{height:100%}
    body{
      margin:0; display:flex; height:100vh;
      font-family:-apple-system,BlinkMacSystemFont,"SF Pro Display","Segoe UI",Roboto,Arial,sans-serif;
      background:var(--bg); color:var(--text);
      transition: background .2s ease, color .2s ease;
    }

    aside{
      width:var(--sidebar-width);
      min-width:180px;
      padding:12px;
      box-sizing:border-box;
      display:flex; flex-direction:column; gap:var(--gap);
      border-right:1px solid var(--sidebar-border);
      background: linear-gradient(180deg, color-mix(in srgb,var(--accent)10%,var(--sidebar-bg)) 0%, var(--sidebar-bg) 100%);
      backdrop-filter: blur(var(--blur)) saturate(140%);
    }

    header{ font-size:1.15rem; font-weight:700; margin-bottom:4px; }

    input[type="search"]{
      width:100%; padding:.5rem .8rem; border-radius:10px;
      border:1px solid var(--btn-border); background:var(--btn-bg-surface);
      color:var(--text); box-sizing:border-box;
    }

    .nav-section button.active{ background:var(--accent-strong); color:#fff; }

    .icon-btn{
      width:40px; height:40px; border-radius:10px; border:1px solid var(--btn-border);
      display:inline-flex; align-items:center; justify-content:center; background:var(--btn-bg-surface);
      color:var(--btn-text); cursor:pointer; font-size:16px;
      transition: transform .12s ease, background .12s ease;
    }
    .icon-btn:hover{ transform: translateY(-3px); }
    .icon-btn.primary{ background:var(--accent); color:#fff; border-color:transparent; }

    /* Show All button fix */
    #show-all-toggle{padding:.4rem .7rem;border-radius:9px;border:1px solid var(--card-border);
      background:var(--btn-bg-surface);color:var(--text);transition:background .15s ease,color .15s ease;}
    #show-all-toggle.active{background:var(--accent-strong);color:#fff;}

    /* SETTINGS OVERLAY */
    #settings-overlay{
      position:fixed;inset:0;background:rgba(0,0,0,0.35);backdrop-filter:blur(6px);
      display:none;align-items:center;justify-content:flex-end;z-index:1000;
      opacity:0;transition:opacity .2s ease;
    }
    #settings-overlay.visible{display:flex;opacity:1;}
    #settings-panel{
      width:320px;max-width:90vw;height:100%;background:var(--bg);color:var(--text);
      border-left:1px solid var(--sidebar-border);padding:20px;box-sizing:border-box;
      overflow-y:auto;transform:translateX(100%);transition:transform .25s ease;
    }
    #settings-overlay.visible #settings-panel{transform:translateX(0);}
    #settings-panel h3{margin-top:0;border-bottom:1px solid var(--sidebar-border);padding-bottom:4px;}
    .settings-row{margin:10px 0;}
    .settings-row label{display:block;font-weight:600;margin-bottom:4px;}
    .settings-row input[type="range"]{width:100%;}
    .settings-row button{margin-top:6px;padding:6px 10px;border-radius:8px;cursor:pointer;}

    @media(max-width:600px){#settings-panel{width:100%;}}

  </style>
</head>

<body>
  <aside>
    <div style="flex:1;">
      <header>Resource Hub</header>
      <input id="search" type="search" placeholder="Search…"/>
      <div class="nav-section" id="nav-section"></div>
    </div>

    <div class="toggles-row">
      <div class="toggles-left">
        <button id="theme-toggle" class="icon-btn primary"></button>
        <button id="settings-btn" class="icon-btn" title="Settings">⚙️</button>
      </div>
    </div>
  </aside>

  <main id="content">
    <h2><span id="section-title"></span><button id="show-all-toggle">Show All</button></h2>
    <div id="grid"></div>
  </main>

  <div id="settings-overlay">
    <div id="settings-panel">
      <h3>Appearance</h3>
      <div class="settings-row">
        <label>Theme</label>
        <label><input type="radio" name="theme" value="light"> Light</label>
        <label><input type="radio" name="theme" value="dark"> Dark</label>
        <label><input type="radio" name="theme" value="auto"> Auto</label>
      </div>
      <div class="settings-row">
        <label>Accent Brightness</label>
        <input type="range" id="accent-brightness" min="-30" max="30" step="1" value="0">
      </div>
      <div class="settings-row">
        <label><input type="checkbox" id="compact-mode"> Compact Mode</label>
      </div>
      <div class="settings-row">
        <label><input type="checkbox" id="scroll-btn-toggle" checked> Show Scroll to Top Button</label>
      </div>

      <h3>Layout</h3>
      <div class="settings-row">
        <label>Default View</label>
        <label><input type="radio" name="default-view" value="all" checked> All Resources</label>
        <label><input type="radio" name="default-view" value="first"> First Group</label>
      </div>
      <div class="settings-row">
        <label><input type="checkbox" id="start-collapsed"> Start Collapsed Sidebar</label>
      </div>

      <h3>Data</h3>
      <div class="settings-row">
        <button id="export-settings">Export Settings</button>
        <button id="import-settings">Import Settings</button>
      </div>
      <div class="settings-row">
        <label><input type="checkbox" id="confirm-reset" checked> Confirm before clearing</label>
        <button id="reset-settings">Reset All</button>
      </div>
    </div>
  </div>

  <script src="dashboard.js" defer></script>
</body>
</html>
