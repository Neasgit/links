(function(){
'use strict';

// ---------- helpers ----------
const qs=id=>document.getElementById(id);
const setLS=(k,v)=>{try{localStorage.setItem(k,v);}catch(e){}};
const getLS=(k,f=null)=>{try{const v=localStorage.getItem(k);return v===null?f:v;}catch(e){return f;}};
const safeJSON=(s,f)=>{try{return JSON.parse(s);}catch(e){return f;}};

// ---------- global state ----------
let groupsData=[], currentGroup=null;
const grid=qs('grid'), nav=qs('nav-section'),
      showAllBtn=qs('show-all-toggle'),
      settingsBtn=qs('settings-btn'),
      overlay=qs('settings-overlay');

// ---------- SETTINGS PANEL ----------
settingsBtn.addEventListener('click',()=>overlay.classList.add('visible'));
overlay.addEventListener('click',e=>{if(e.target===overlay)overlay.classList.remove('visible');});
document.addEventListener('keydown',e=>{if(e.key==='Escape')overlay.classList.remove('visible');});

// ---------- DATA + RENDER ----------
document.addEventListener('DOMContentLoaded',()=>{
  fetch('links.json',{cache:'no-store'})
  .then(r=>r.json())
  .then(data=>{
    groupsData=data.groups||[];
    mountNav(groupsData);
    const defView=getLS('defaultView','all');
    if(defView==='first' && groupsData[0]) {
      currentGroup=groupsData[0];
      renderGroup(currentGroup);
    } else {
      renderAll();
    }
  })
  .catch(err=>{
    console.error('JSON load error:',err);
    grid.innerHTML='<p style="color:red;">⚠️ Failed to load links.json</p>';
  });
});

// ---------- rendering ----------
function mountNav(groups){
  nav.innerHTML='';
  groups.forEach(g=>{
    const b=document.createElement('button');
    b.textContent=g.title;
    b.onclick=()=>{currentGroup=g;renderGroup(g);};
    nav.appendChild(b);
  });
}
function renderGroup(g){
  qs('section-title').textContent=g.title;
  grid.innerHTML='';
  (g.items||[]).forEach(i=>grid.appendChild(createCard(i)));
}
function renderAll(){
  qs('section-title').textContent='All Resources';
  grid.innerHTML='';
  groupsData.forEach(g=>{
    const h=document.createElement('h3');
    h.textContent=g.title;
    grid.appendChild(h);
    (g.items||[]).forEach(i=>grid.appendChild(createCard(i)));
  });
}
function createCard(item){
  const c=document.createElement('div');
  c.className='card';
  const title=document.createElement('strong');
  title.textContent=item.title;
  const note=document.createElement('small');
  note.textContent=item.notes||'';
  c.appendChild(title);
  c.appendChild(note);
  c.onclick=()=>{if(item.url)window.open(item.url,'_blank');};
  return c;
}

// ---------- compact mode toggle ----------
if(getLS('compactMode')==='true')document.body.classList.add('compact-mode');
qs('compact-mode')?.addEventListener('change',e=>{
  document.body.classList.toggle('compact-mode',e.target.checked);
  setLS('compactMode',e.target.checked);
});

// ---------- accent brightness ----------
const bright=qs('accent-brightness');
if(bright){
  bright.value=getLS('accentShift','0');
  bright.addEventListener('input',()=>{
    const base=getLS('accent')||'#0a84ff';
    const shift=parseInt(bright.value,10);
    const c=hexToRgb(base);
    const mod=v=>Math.min(255,Math.max(0,v+shift*2));
    const newC=rgbToHex(mod(c.r),mod(c.g),mod(c.b));
    document.documentElement.style.setProperty('--accent-strong',newC);
    setLS('accentShift',bright.value);
  });
}

// ---------- utility ----------
function hexToRgb(hex){hex=hex.replace('#','');if(hex.length===3)hex=hex.split('').map(h=>h+h).join('');const i=parseInt(hex,16);return{r:(i>>16)&255,g:(i>>8)&255,b:i&255};}
function rgbToHex(r,g,b){const h=n=>Math.max(0,Math.min(255,Math.round(n))).toString(16).padStart(2,'0');return`#${h(r)}${h(g)}${h(b)}`;}
})();
