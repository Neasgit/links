(function(){
'use strict';

/* ---------- Helpers ---------- */
const qs=id=>document.getElementById(id);
const setLS=(k,v)=>{try{localStorage.setItem(k,v);}catch(e){}};
const getLS=(k,f=null)=>{try{const v=localStorage.getItem(k);return v===null?f:v;}catch(e){return f;}};
const safeJSON=(s,f)=>{try{return JSON.parse(s);}catch(e){return f;}};

/* ---------- Globals ---------- */
let groupsData=[], currentGroup=null;
const grid=qs('grid'),
      nav=qs('nav-section'),
      showAllBtn=qs('show-all-toggle'),
      themeBtn=qs('theme-toggle'),
      settingsBtn=qs('settings-btn'),
      overlay=qs('settings-overlay'),
      accentSlider=qs('accent-brightness'),
      compactToggle=qs('compact-mode');

/* ---------- Favourites ---------- */
function getFavs(){return safeJSON(getLS('favourites'),'[]')||[];}
function saveFavs(arr){setLS('favourites',JSON.stringify(arr));}
function toggleFav(title,btn){
  let favs=getFavs();
  if(favs.includes(title)) favs=favs.filter(f=>f!==title);
  else favs.push(title);
  saveFavs(favs);
  btn.textContent=favs.includes(title)?'★':'☆';
  btn.classList.toggle('active',favs.includes(title));
}

/* ---------- Render ---------- */
function createCard(item){
  const c=document.createElement('div');
  c.className='card';

  const header=document.createElement('div');
  header.className='card-header';

  const title=document.createElement('span');
  title.className='card-title';
  title.textContent=item.title;

  const star=document.createElement('button');
  star.textContent=getFavs().includes(item.title)?'★':'☆';
  star.className='star-btn';
  star.addEventListener('click',ev=>{
    ev.stopPropagation();
    toggleFav(item.title,star);
  });

  header.appendChild(title);
  header.appendChild(star);
  c.appendChild(header);

  if(item.notes){
    const note=document.createElement('small');
    note.textContent=item.notes;
    c.appendChild(note);
  }

  c.addEventListener('click',()=>{if(item.url)window.open(item.url,'_blank');});
  return c;
}

function renderGroup(g){
  qs('section-title').textContent=g.title;
  grid.innerHTML='';
  (g.items||[]).forEach(i=>grid.appendChild(createCard(i)));
}

function renderFavs(){
  const favs=getFavs();
  qs('section-title').textContent='⭐ Favourites';
  grid.innerHTML='';
  const allItems=(groupsData||[]).flatMap(g=>g.items||[]);
  const items=allItems.filter(i=>favs.includes(i.title));
  if(!items.length){
    grid.innerHTML='<p style="opacity:.6;">No favourites yet.</p>';
    return;
  }
  items.forEach(i=>grid.appendChild(createCard(i)));
}

/* ---------- Show All (grouped layout) ---------- */
function renderAll(){
  qs('section-title').textContent='All Resources';
  grid.innerHTML='';
  (groupsData||[]).forEach(g=>{
    const group=document.createElement('div');
    group.className='group-block';
    const h=document.createElement('h3');
    h.textContent=g.title;
    const inner=document.createElement('div');
    inner.className='inner-grid';
    (g.items||[]).forEach(i=>inner.appendChild(createCard(i)));
    group.appendChild(h);
    group.appendChild(inner);
    grid.appendChild(group);
  });
}

/* ---------- Navigation ---------- */
function mountNav(groups){
  nav.innerHTML='';
  const favBtn=document.createElement('button');
  favBtn.textContent='⭐ Favourites';
  favBtn.addEventListener('click',()=>{
    renderFavs();
    updateActive(favBtn);
  });
  nav.appendChild(favBtn);

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

/* ---------- Accent Helpers ---------- */
function hexToRgb(hex){
  hex=hex.replace('#','');
  if(hex.length===3)hex=hex.split('').map(h=>h+h).join('');
  const i=parseInt(hex,16);
  return{r:(i>>16)&255,g:(i>>8)&255,b:i&255};
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
  document.documentElement.style.setProperty('--accent',newC);
  document.documentElement.style.setProperty('--accent-strong',newC);
  setLS('accentShift',shift);
}

/* ---------- Data Loader ---------- */
function loadData(){
  fetch('links.json',{cache:'no-store'})
  .then(r=>r.json())
  .then(data=>{
    groupsData=data.groups||[];
    mountNav(groupsData);

    const def=getLS('defaultView','all');
    if(def==='favs'){
      renderFavs();
      updateActive(null);
    } else if(def==='first' && groupsData[0]){
      currentGroup=groupsData[0];
      renderGroup(currentGroup);
    } else {
      renderAll();
    }

    if(showAllBtn) showAllBtn.classList.add('active');
  })
  .catch(err=>{
    console.error('⚠️ Failed to load links.json',err);
    grid.innerHTML='<p style="color:red;">Could not load links.json</p>';
  });
}

/* ---------- Init ---------- */
document.addEventListener('DOMContentLoaded',()=>{

  // Theme toggle
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

  // Theme radios
  document.querySelectorAll('input[name="theme"]').forEach(r=>{
    r.addEventListener('change',()=>{
      const val=r.value;
      setLS('theme',val);
      const prefersDark=window.matchMedia("(prefers-color-scheme: dark)").matches;
      const actual=val==="auto"?(prefersDark?"dark":"light"):val;
      document.body.dataset.theme=actual;
      document.documentElement.dataset.theme=actual;
    });
  });

  // Default view radios
  document.querySelectorAll('input[name="default-view"]').forEach(r=>{
    const saved=getLS('defaultView','all');
    if(r.value===saved)r.checked=true;
    r.addEventListener('change',()=>{
      if(r.checked)setLS('defaultView',r.value);
    });
  });

  // Show all
  if(showAllBtn){
    showAllBtn.addEventListener('click',()=>{
      currentGroup=null;
      renderAll();
      updateActive(null);
      showAllBtn.classList.add('active');
    });
  }

  // Overlay
  if(settingsBtn && overlay){
    settingsBtn.addEventListener('click',()=>overlay.classList.add('visible'));
    overlay.addEventListener('click',e=>{
      if(e.target===overlay)overlay.classList.remove('visible');
    });
  }
  document.addEventListener('keydown',e=>{
    if(e.key==='Escape')overlay?.classList.remove('visible');
  });

  // Accent brightness
  if(accentSlider){
    accentSlider.value=getLS('accentShift','0');
    accentSlider.addEventListener('input',adjustAccent);
    adjustAccent();
  }

  // Colour swatches
  document.querySelectorAll('.swatch').forEach(s=>{
    s.addEventListener('click',()=>{
      const color=s.dataset.color;
      document.documentElement.style.setProperty('--accent',color);
      document.documentElement.style.setProperty('--accent-strong',color);
      setLS('accent',color);
    });
  });

  // Compact Mode
  if(getLS('compactMode')==='true')document.body.classList.add('compact-mode');
  if(compactToggle){
    compactToggle.checked=document.body.classList.contains('compact-mode');
    compactToggle.addEventListener('change',()=>{
      document.body.classList.toggle('compact-mode',compactToggle.checked);
      setLS('compactMode',compactToggle.checked);
    });
  }

  // Sidebar toggle
  const aside=document.querySelector('aside');
  const toggleBtn=qs('sidebar-toggle');
  if(toggleBtn){
    toggleBtn.addEventListener('click',()=>{
      const collapsed=aside.classList.toggle('collapsed');
      setLS('collapsedSidebar',collapsed);
    });
  }

  // Search
  const searchEl=qs('search');
  if(searchEl){
    searchEl.addEventListener('input',()=>{
      const q=(searchEl.value||'').toLowerCase().trim();
      if(!q){
        if(currentGroup)renderGroup(currentGroup);
        else renderAll();
        return;
      }
      const matches=(groupsData||[]).flatMap(g=>(g.items||[])
        .filter(i=>i.title.toLowerCase().includes(q)||(i.notes||'').toLowerCase().includes(q)));
      grid.innerHTML='';
      if(!matches.length){grid.innerHTML='<p style="opacity:.6;">No results.</p>';return;}
      matches.forEach(i=>grid.appendChild(createCard(i)));
    });
  }

  loadData();
});
})();
