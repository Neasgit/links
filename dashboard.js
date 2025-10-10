<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>Resource Hub | Ducks in the Pool</title>
<meta name="theme-color" content="#0a84ff" />

<style>
:root {
  --radius: 10px;
  --blur: 18px;
  --accent: #0a84ff;
  --bg-light: #f7f8fa;
  --bg-dark: #1c1c1e;
  --text-light: #111;
  --text-dark: #f5f5f7;
  --fade-up: fadeUp .5s ease both;
}

/* === Theme palettes === */
[data-theme="light"] {
  --bg: var(--bg-light);
  --text: var(--text-light);
  --sidebar-bg: rgba(255, 255, 255, 0.85);
  --sidebar-border: rgba(0, 0, 0, 0.08);
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

/* === Base layout === */
body {
  margin: 0;
  display: flex;
  height: 100vh;
  font-family: -apple-system, BlinkMacSystemFont,"SF Pro Display","Segoe UI",Roboto,sans-serif;
  background: var(--bg);
  color: var(--text);
  transition: background .3s ease,color .3s ease;
}

aside {
  width: 260px;
  padding: 1.2rem;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  border-right: 1px solid var(--sidebar-border);
  background: linear-gradient(180deg,
    color-mix(in srgb,var(--accent)15%,var(--sidebar-bg))0%,
    var(--sidebar-bg)100%);
  backdrop-filter: blur(var(--blur)) saturate(180%);
  animation: var(--fade-up);
}

header {
  font-size:1.3rem;font-weight:600;margin-bottom:1rem;
}
input[type="search"] {
  width:100%;padding:.5rem .8rem;border-radius:8px;
  border:1px solid rgba(0,0,0,.1);background:rgba(255,255,255,.3);
  color:inherit;transition:all .25s ease;
}
input[type="search"]:focus {
  outline:none;transform:scale(1.02);
}
[data-theme="dark"] input[type="search"] {
  border-color:rgba(255,255,255,.15);
  background:rgba(255,255,255,.08);
}

/* === Navigation === */
.nav-section {
  display:flex;flex-direction:column;gap:.4rem;margin-top:1rem;
}
.nav-section button {
  text-align:left;padding:.55rem .9rem;border-radius:var(--radius);
  border:none;background:transparent;color:inherit;font-weight:500;
  transition:all .25s ease;
}
.nav-section button:hover {
  transform:translateX(2px);
  background:color-mix(in srgb,var(--accent)10%,transparent);
}
.nav-section button.active {
  background:var(--accent);color:#fff;font-weight:600;
  box-shadow:0 0 8px color-mix(in srgb,var(--accent)40%,transparent);
}

/* === Buttons === */
.inline-toggles {
  display:flex;align-items:center;justify-content:space-between;gap:10px;margin-top:1rem;
}
.icon-btn {
  width:38px;height:38px;border-radius:50%;border:none;background:var(--accent);
  color:#fff;cursor:pointer;display:flex;align-items:center;justify-content:center;
  transition:transform .2s ease, box-shadow .3s;
}
.icon-btn:hover {
  transform:scale(1.1);
  box-shadow:0 0 10px color-mix(in srgb,var(--accent)30%,transparent);
}
.color-palette{display:flex;gap:5px;}
.color-dot{width:14px;height:14px;border-radius:50%;cursor:pointer;border:2px solid transparent;transition:border-color .25s;}
.color-dot.active{border-color:var(--text);}

/* === Content area === */
main {
  flex:1;overflow-y:auto;padding:1.4rem 2rem;
  scroll-behavior:smooth;
}
h2 {
  position:sticky;top:0;z-index:5;background:var(--bg);
  backdrop-filter:blur(10px);
  display:flex;justify-content:space-between;
  align-items:center;padding:.5rem 0;color:var(--accent);
  animation: var(--fade-up);
}
.section-group h3 {
  margin:.8rem 0 .4rem 0;color:var(--accent);
  font-size:1rem;opacity:0;
  transform:translateY(10px);
  animation:fadeUp .6s ease forwards;
}

/* === Cards === */
.card {
  background:var(--card-bg);border-left:3px solid var(--accent);
  border-radius:var(--radius);padding:.5rem .9rem;border:1px solid var(--card-border);
  margin-bottom:.45rem;min-height:52px;
  display:flex;flex-direction:column;justify-content:center;position:relative;
  backdrop-filter:blur(12px)saturate(160%);
  transition:background .3s,transform .25s,box-shadow .3s,opacity .4s;
  opacity:0;transform:translateY(10px);
  animation:fadeUp .5s ease forwards;
}
.card:hover {
  background:color-mix(in srgb,var(--accent)12%,var(--card-bg));
  box-shadow:0 4px 12px color-mix(in srgb,var(--accent)20%,transparent);
  transform:translateY(-3px);
}
.star {
  position:absolute;right:10px;top:8px;font-size:1rem;cursor:pointer;color:#888;
  transition:transform .25s ease, color .3s;
}
.star:hover {transform:scale(1.2);}
.star.active {color:var(--accent);}

/* === Scroll button === */
#to-top {
  position:fixed;bottom:25px;right:25px;width:42px;height:42px;
  border-radius:50%;background:var(--accent);color:#fff;border:none;
  font-size:1.3rem;display:none;cursor:pointer;
  box-shadow:0 2px 10px rgba(0,0,0,.2);transition:opacity .4s,transform .3s;
}
#to-top.visible {display:block;opacity:.95;}
#to-top:hover {transform:scale(1.15);}

/* === Animations === */
@keyframes fadeUp {
  from {opacity:0;transform:translateY(12px);}
  to {opacity:1;transform:translateY(0);}
}

@media(max-width:800px){
  body{flex-direction:column;}
  aside{flex-direction:row;width:100%;overflow-x:auto;}
}
</style>
</head>

<body>
<aside>
  <div>
    <header>Resource Hub</header>
    <input id="search" type="search" placeholder="Search…" />
    <div class="nav-section" id="nav-section"></div>
  </div>
  <div class="inline-toggles">
    <button id="theme-toggle" class="icon-btn" title="Toggle Light/Dark">🌙</button>
    <button id="layout-toggle" class="icon-btn" title="Toggle Layout">⇆</button>
    <div class="color-palette" id="color-palette"></div>
  </div>
</aside>

<main id="content">
  <h2><span id="section-title"></span> <button id="show-all-toggle">Show All</button></h2>
  <div id="grid"></div>
</main>

<button id="to-top">↑</button>

<script src="dashboard.js"></script>
<script>
// scroll-to-top behaviour
const topBtn=document.getElementById("to-top");
window.addEventListener("scroll",()=>{topBtn.classList.toggle("visible",window.scrollY>400);});
topBtn.onclick=()=>window.scrollTo({top:0,behavior:"smooth"});
</script>
</body>
</html>
