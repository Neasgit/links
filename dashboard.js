(function(){
'use strict';

/* ---------- Helpers ---------- */
const qs = id => document.getElementById(id);
const setLS = (k,v)=>{try{localStorage.setItem(k,v);}catch(e){}};
const getLS = (k,f=null)=>{try{const v=localStorage.getItem(k);return v===null?f:v;}catch(e){return f;}};
const safeJSON = (s,f)=>{try{return JSON.parse(s);}catch(e){return f;}};

let groupsData=[], currentGroup=null;

/* ---------- DOM ---------- */
const grid=qs('grid'),
      nav=qs('nav-section'),
      showAllBtn=qs('show-all-toggle'),
      themeBtn=qs('theme-toggle'),
      settingsBtn=qs('settings-btn'),
      overlay=qs('settings-overlay'),
      accentSlider=qs('accent-brightness'),
      compactToggle=qs('compact-mode');

/* ---------- Core Rendering ---------- */
function createCard(item){
  const c=document.createElement('div');
  c.className='card';
  const title=document.createElement('strong');
  title.textContent=item.title;
  const note=document.createElement('small');
  note.textContent=item.notes||'';
  c.appendChild(title);
  c.appendChild(note);
  c.addEventListener('click',()=>{if(item.url)window.open(item.url,'_blank');});
  return c;
}

function renderGroup(g){
  qs('section-title').textContent=g.title;
  grid.innerHTML='';
  (g.items||[]).forEach(i=>grid.appendChild(createCard(i)));
}

function renderAll(){
  qs('section-title').textContent='All Resources';
  grid.innerHTML='';
  (groupsData||[]).forEach(g=>{
    const h=document.createElement('h3');
    h.textContent=g.title;
    grid.appendChild(h);
    (g.items||[]).forEach(i=>grid.appendChild(createCard(i)));
  });
}

function mountNav(groups){
  nav.innerHTML='';
  groups.forEach(g=>{
    const b=document.createElement('button');
    b.textContent=g.title;
    b.addEventListener('click',()=>{
      currentGroup=g;
      renderGroup(g);
      updateActive(b);
    });
    nav.appendChild(b);
  });
}

function updateActive(activeBtn){
  nav.querySelectorAll('button').forEach(b=>b.classList.remove('active'));
  if(activeBtn) activeBtn.classList.add('active');
  if(showAllBtn) showAllBtn.classList.toggle('active',!activeBtn);
}

/* ---------- Accent Utilities ---------- */
function hexToRgb(hex){
  hex=hex.replace('#','');
  if(hex.length===3)hex=hex.split('').map(h=>h+h).join('');
  const i=parseInt(hex,16);
  return {r:(i>>16)&255,g:(i>>8)&255,b:i&255};
}
function rgbToHex(r,g,b){
  const h=n=>Math.max(0,Math.min(255,Math.round(n))).toString(16).padStart(2,'0');
  return`#${h(r)}${h(g)}${h(b)}`;
}
function adjustAccent(){
  const base=getLS('accent')||'#0a84ff';
  const shift=parseInt(accentSlider?.value||'0',10);
  const c=hexToRgb(base);
  const mod=v=>Math.min(255,Math.max(0,v+shift*2));
  const newC=rgbToHex(mod(c.r),mod(c.g),mod(c.b));
  document.documentElement.style.setProperty('--accent-strong',newC);
  setLS('accentShift',shift);
}

/* ---------- Fetch Data ---------- */
function loadData(){
  fetch('links.json',{cache:'no-store'})
  .then(r=>r.json())
  .then(data=>{
    groupsData=data.groups||[];
    mountNav(groupsData);
    const def=getLS('defaultView','all');
    if(def==='first' && groupsData[0]){
      currentGroup=groupsData[0];
      renderGroup(currentGroup);
    } else renderAll();
    if(showAllBtn) showAllBtn.classList.add('active');
  })
  .catch(err=>{
    console.error('⚠️ Failed to load links.json',err);
    grid.innerHTML='<p style="color:red;">Could not load links.json</p>';
  });
}

/* ---------- Event Listeners ---------- */
document.addEventListener('DOMContentLoaded',()=>{

  /* Theme toggle */
  if(themeBtn){
    const icons={moon:'🌙',sun:'☀️'};
    function updateIcon(){
      const dark=document.body.dataset.theme==='dark';
      themeBtn.textContent=dark?icons.sun:icons.moon;
    }
    themeBtn.addEventListener('click',()=>{
      const newTheme=document.body.dataset.theme==='dark'?'light':'dark';
      document.body.dataset.theme=newTheme;
      document.documentElement.dataset.theme=newTheme;
      setLS('theme',newTheme);
      updateIcon();
    });
    updateIcon();
  }

  /* Show All */
  if(showAllBtn){
    showAllBtn.addEventListener('click',()=>{
      currentGroup=null;
      renderAll();
      updateActive(null);
      showAllBtn.classList.add('active');
    });
  }

  /* Overlay open/close */
  if(settingsBtn && overlay){
    settingsBtn.addEventListener('click',()=>overlay.classList.add('visible'));
    overlay.addEventListener('click',e=>{
      if(e.target===overlay)overlay.classList.remove('visible');
    });
  }
  document.addEventListener('keydown',e=>{
    if(e.key==='Escape')overlay?.classList.remove('visible');
  });

  /* Accent brightness */
  if(accentSlider){
    accentSlider.value=getLS('accentShift','0');
    accentSlider.addEventListener('input',adjustAccent);
    adjustAccent();
  }

  /* Compact Mode */
  if(getLS('compactMode')==='true')document.body.classList.add('compact-mode');
  if(compactToggle){
    compactToggle.checked=document.body.classList.contains('compact-mode');
    compactToggle.addEventListener('change',()=>{
      document.body.classList.toggle('compact-mode',compactToggle.checked);
      setLS('compactMode',compactToggle.checked);
    });
  }

  /* Search */
  const searchEl=qs('search');
  if(searchEl){
    searchEl.addEventListener('input',()=>{
      const q=(searchEl.value||'').toLowerCase().trim();
      if(!q){
        if(currentGroup) renderGroup(currentGroup);
        else renderAll();
        return;
      }
      const matches=(groupsData||[]).flatMap(g=>(g.items||[])
        .filter(i=>i.title.toLowerCase().includes(q) || (i.notes||'').toLowerCase().includes(q)));
      grid.innerHTML='';
      if(!matches.length){grid.innerHTML='<p style="opacity:.6;">No results.</p>';return;}
      matches.forEach(i=>grid.appendChild(createCard(i)));
    });
  }

  /* Initial data load */
  loadData();
});

})();
