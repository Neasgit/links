<!DOCTYPE html>
<html lang="en">
<head>
  <!-- ===========================
       SECTION: META + PRE-PAINT THEME (prevents FOUC)
       =========================== -->
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>Resource Hub | Ducks in the Pool</title>
  <script>
    (function() {
      const savedTheme = localStorage.getItem("theme");
      const prefersDark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
      const theme = savedTheme || (prefersDark ? "dark" : "light");
      // set on both html and body early
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

  <!-- ===========================
       SECTION: STYLES (theme-aware & responsive)
       =========================== -->
  <style>
    :root{
      --radius:10px; --gap:10px; --blur:14px;
      --accent:#0a84ff; --accent-strong:#0066d6;
      --bg-light:#f7f8fa; --bg-dark:#0f1113;
      --text-light:#0b1220; --text-dark:#f5f5f7;
      --sidebar-width:280px;
      --palette-size:14px;
    }

    /* Theme variables for light */
    [data-theme="light"]{
      --bg: var(--bg-light);
      --text: var(--text-light);
      --sidebar-bg: rgba(255,255,255,0.92);
      --sidebar-border: rgba(0,0,0,0.06);
      --card-bg: rgba(255,255,255,0.9);
      --card-border: rgba(0,0,0,0.06);
      --btn-border: rgba(0,0,0,0.08);
      --btn-bg-surface: rgba(255,255,255,0.6);
      --btn-text: var(--text-light);
      --meta-theme: #f7f8fa;
    }

    /* Theme variables for dark */
    [data-theme="dark"]{
      --bg: var(--bg-dark);
      --text: var(--text-dark);
      --sidebar-bg: rgba(16,16,18,0.7);
      --sidebar-border: rgba(255,255,255,0.06);
      --card-bg: rgba(255,255,255,0.03);
      --card-border: rgba(255,255,255,0.06);
      --btn-border: rgba(255,255,255,0.06);
      --btn-bg-surface: rgba(255,255,255,0.03);
      --btn-text: var(--text-dark);
      --meta-theme: #0f1113;
    }

    /* base */
    html,body{height:100%}
    body{
      margin:0; display:flex; height:100vh;
      font-family: -apple-system,BlinkMacSystemFont,"SF Pro Display","Segoe UI",Roboto,Arial,sans-serif;
      background:var(--bg); color:var(--text);
      transition: background .2s ease, color .2s ease;
    }

    /* sidebar */
    aside{
      width:var(--sidebar-width); min-width:200px;
      padding:1rem; box-sizing:border-box;
      display:flex; flex-direction:column; gap:var(--gap);
      border-right:1px solid var(--sidebar-border);
      background: linear-gradient(180deg, color-mix(in srgb,var(--accent)10%,var(--sidebar-bg)) 0%, var(--sidebar-bg) 100%);
      backdrop-filter: blur(var(--blur)) saturate(140%);
    }
    header{ font-size:1.15rem; font-weight:700; margin-bottom:2px; }

    /* search */
    input[type="search"]{
      width:100%; padding:.5rem .8rem; border-radius:10px;
      border:1px solid rgba(0,0,0,.06); background:var(--btn-bg-surface);
      color:inherit; outline:none; box-sizing:border-box;
    }

    /* nav */
    .nav-section{ display:flex; flex-direction:column; gap:.45rem; margin-top:6px; overflow:auto; padding-right:6px;}
    .nav-section button{
      text-align:left; padding:.55rem .9rem; border-radius:9px; border:none;
      background:transparent; color:inherit; font-weight:600; font-size:0.95rem;
      transition: transform .12s ease, background .12s ease;
    }
    .nav-section button:hover{ transform: translateX(6px); background: color-mix(in srgb,var(--accent)10%,transparent); }
    .nav-section button.active{ background:var(--accent-strong); color:#fff; box-shadow: 0 8px 24px color-mix(in srgb,var(--accent)18%, transparent); }

    /* toggles container */
    .toggles-wrap{ display:flex; align-items:center; justify-content:space-between; gap:8px; margin-top:6px; }
    .toggles-left{ display:flex; gap:8px; align-items:center; flex-wrap:wrap; }
    .toggles-right{ display:flex; gap:8px; align-items:center; }

    /* icon buttons - theme aware */
    .icon-btn{
      width:40px; height:40px; border-radius:10px; border:1px solid var(--btn-border);
      display:inline-flex; align-items:center; justify-content:center; background:var(--btn-bg-surface);
      color:var(--btn-text); cursor:pointer; font-size:16px; padding:0; box-sizing:border-box;
      transition: transform .12s ease, background .12s ease, box-shadow .12s ease;
    }
    .icon-btn.primary{
      background: var(--accent); color:#fff; border-color: transparent;
      box-shadow: 0 8px 20px color-mix(in srgb,var(--accent)20%, transparent);
    }
    .icon-btn:hover{ transform: translateY(-3px); box-shadow: 0 10px 28px rgba(0,0,0,0.08); }

    /* color palette dots */
    .color-palette{ display:flex; gap:8px; align-items:center; }
    .color-dot{
      width:var(--palette-size); height:var(--palette-size); border-radius:50%; cursor:pointer;
      border:2px solid rgba(255,255,255,0.06); box-sizing:border-box;
      display:inline-block;
    }
    .color-dot.active{
      outline: 2px solid color-mix(in srgb, var(--accent)40%, transparent); transform: scale(1.08);
    }

    /* select fallback on small screens */
    #color-select{ display:none; padding:.45rem; border-radius:8px; border:1px solid var(--btn-border); background:transparent; color:inherit; }

    /* main area */
    main{ flex:1; overflow-y:auto; padding:14px 22px; box-sizing:border-box; min-width:0; }
    h2{ display:flex; align-items:center; justify-content:space-between; gap:12px;
         position:sticky; top:0; z-index:10; background: linear-gradient(180deg, rgba(0,0,0,0.02), transparent);
         padding:10px 0; margin:0 0 12px 0; }
    #show-all-toggle{ padding:.4rem .7rem; border-radius:9px; border:1px solid var(--card-border); background:transparent; cursor:pointer; }

    /* grid */
    main #grid{
      display:grid;
      grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
      gap:14px;
      align-items:start;
    }
    .card{
      background:var(--card-bg); border-radius:12px; padding:12px; border:1px solid var(--card-border);
      display:flex; flex-direction:column; gap:8px; min-height:56px; box-sizing:border-box; transition: transform .12s ease, box-shadow .12s ease;
    }
    .card:hover{ transform: translateY(-6px); box-shadow: 0 10px 30px rgba(0,0,0,0.06); }
    .card-header{ display:flex; align-items:center; justify-content:space-between; gap:8px; }
    .card-header strong{ font-size:1rem; margin:0; word-break:break-word; }
    .card small{ color:rgba(0,0,0,0.55); }

    .star{ cursor:pointer; font-size:1.05rem; background:transparent; border:none; color:rgba(0,0,0,0.45); }
    .star.active{ color:var(--accent-strong); }

    /* floating controls */
    #to-top{ position:fixed; bottom:22px; right:22px; width:44px; height:44px; border-radius:9px; border:none; background:var(--accent); color:#fff; display:none; cursor:pointer; }
    #to-top.visible{ display:block; }
    .unhide-sidebar-btn{ display:none; position:fixed; left:12px; bottom:80px; z-index:9999; width:44px; height:44px; border-radius:9px; border:none; display:flex; align-items:center; justify-content:center; font-size:18px; cursor:pointer; background:var(--accent); color:#fff; box-shadow:0 6px 18px rgba(0,0,0,0.18); }
    body.hide-sidebar .unhide-sidebar-btn{ display:flex; }

    /* responsive: collapse sidebar to top strip */
    @media (max-width:900px){
      aside{ width:100%; min-width:0; flex-direction:row; align-items:center; gap:12px; padding:10px; border-right:none; border-bottom:1px solid var(--sidebar-border); }
      .nav-section{ flex-direction:row; gap:8px; margin:0; overflow:auto; padding:6px 0; white-space:nowrap; }
      .nav-section button{ white-space:nowrap; padding:.45rem .65rem; font-size:0.9rem; border-radius:8px; }
      .toggles-wrap{ order:2; flex:1; justify-content:flex-end; }
      main{ padding:12px; }
    }

    /* small: use select instead of dots */
    @media (max-width:560px){
      main #grid{ grid-template-columns: repeat(1, 1fr); gap:10px; }
      .icon-btn{ width:36px; height:36px; font-size:14px; border-radius:8px; }
      .color-palette{ display:none; }
      #color-select{ display:block; }
      .card{ padding:10px; }
    }
  </style>
</head>

<body>
  <!-- ===========================
       SECTION: ASIDE / SIDEBAR
       =========================== -->
  <aside>
    <div style="display:flex; flex-direction:column; gap:8px; flex:1; min-width:0;">
      <header>Resource Hub</header>

      <!-- Search -->
      <input id="search" type="search" placeholder="Search…" aria-label="Search resources" />

      <!-- Nav container -->
      <div class="nav-section" id="nav-section" role="navigation" aria-label="Resource groups"></div>
    </div>

    <!-- ===========================
         SECTION: TOGGLES
         =========================== -->
    <div class="toggles-wrap" aria-hidden="false">
      <div class="toggles-left">
        <button id="theme-toggle"   type="button" class="icon-btn primary" title="Toggle theme">🌙</button>
        <button id="compact-toggle" type="button" class="icon-btn" title="Toggle compact view">📏</button>
        <button id="sidebar-toggle" type="button" class="icon-btn" title="Hide sidebar">⫷</button>
        <button id="grid-size-toggle" type="button" class="icon-btn" title="Cycle grid columns">▦</button>
      </div>

      <div class="toggles-right">
        <div class="color-palette" id="color-palette" aria-hidden="true"></div>
        <select id="color-select" aria-label="Choose accent color"></select>
      </div>
    </div>
  </aside>

  <!-- ===========================
       SECTION: MAIN
       =========================== -->
  <main id="content">
    <h2>
      <span id="section-title"></span>
      <div><button id="show-all-toggle" type="button">Show All</button></div>
    </h2>

    <div id="grid" aria-live="polite"></div>
  </main>

  <!-- FLOATING -->
  <button id="to-top" type="button" aria-label="Scroll to top">↑</button>
  <button id="unhide-sidebar-btn" class="unhide-sidebar-btn" type="button" aria-label="Show sidebar">⫸</button>

  <!-- ===========================
       SECTION: SCRIPTS
       =========================== -->
  <script src="dashboard.js" defer></script>

  <script>
    (function(){
      const topBtn = document.getElementById('to-top');
      if (topBtn) {
        function updateTop(){ topBtn.classList.toggle('visible', window.scrollY > 400); }
        window.addEventListener('scroll', updateTop, { passive: true });
        topBtn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
        updateTop();
      }

      const unhideBtn = document.getElementById('unhide-sidebar-btn');
      if (unhideBtn) {
        unhideBtn.addEventListener('click', (e) => {
          e.preventDefault();
          document.body.classList.remove('hide-sidebar');
          try { localStorage.removeItem('hide-sidebar'); } catch(e){}
        });
        const obs = new MutationObserver(() => {
          unhideBtn.style.display = document.body.classList.contains('hide-sidebar') ? 'flex' : 'none';
        });
        obs.observe(document.body, { attributes: true, attributeFilter: ['class'] });
        unhideBtn.style.display = document.body.classList.contains('hide-sidebar') ? 'flex' : 'none';
      }
    })();
  </script>
</body>
</html>
