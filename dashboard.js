(function(){
'use strict';
const qs=id=>document.getElementById(id);
const setLS=(k,v)=>{try{localStorage.setItem(k,v);}catch(e){}};
const getLS=(k,f=null)=>{try{const v=localStorage.getItem(k);return v===null?f:v;}catch(e){return f;}};
const safeJSON=(s,f)=>{try{return JSON.parse(s);}catch(e){return f;}};

const showAllBtn=qs('show-all-toggle');
const settingsBtn=qs('settings-btn');
const overlay=qs('settings-overlay');
const panel=qs('settings-panel');
const themeRadios=document.querySelectorAll('input[name="theme"]');
const defViewRadios=document.querySelectorAll('input[name="default-view"]');
const compactToggle=qs('compact-mode');
const scrollToggle=qs('scroll-btn-toggle');
const collapseToggle=qs('start-collapsed');
const brightness=qs('accent-brightness');
const exportBtn=qs('export-settings');
const importBtn=qs('import-settings');
const resetBtn=qs('reset-settings');
const confirmReset=qs('confirm-reset');

function openSettings(){overlay.classList.add('visible');}
function closeSettings(){overlay.classList.remove('visible');}
settingsBtn.addEventListener('click',openSettings);
overlay.addEventListener('click',e=>{if(e.target===overlay)closeSettings();});
document.addEventListener('keydown',e=>{if(e.key==='Escape')closeSettings();});

// THEME
themeRadios.forEach(r=>{
  if(r.value===getLS('theme','auto'))r.checked=true;
  r.addEventListener('change',()=>{
    if(r.value==='auto'){localStorage.removeItem('theme');location.reload();}
    else{setLS('theme',r.value);document.body.dataset.theme=r.value;document.documentElement.dataset.theme=r.value;}
  });
});

// DEFAULT VIEW
defViewRadios.forEach(r=>{
  if(r.value===getLS('defaultView','all'))r.checked=true;
  r.addEventListener('change',()=>setLS('defaultView',r.value));
});

// COMPACT MODE
if(getLS('compactMode')==='true')document.body.classList.add('compact-mode');
compactToggle.checked=document.body.classList.contains('compact-mode');
compactToggle.addEventListener('change',()=>{
  document.body.classList.toggle('compact-mode',compactToggle.checked);
  setLS('compactMode',compactToggle.checked);
});

// SCROLL BUTTON
if(getLS('scrollBtn')==='false')document.getElementById('to-top')?.remove();
scrollToggle.checked=getLS('scrollBtn','true')==='true';
scrollToggle.addEventListener('change',()=>setLS('scrollBtn',scrollToggle.checked));

// COLLAPSED SIDEBAR
collapseToggle.checked=getLS('startCollapsed','false')==='true';
collapseToggle.addEventListener('change',()=>setLS('startCollapsed',collapseToggle.checked));

// ACCENT BRIGHTNESS
brightness.value=getLS('accentShift','0');
function adjustAccent(){
  const base=getLS('accent')||'#0a84ff';
  const shift=parseInt(brightness.value,10);
  const c=hexToRgb(base);
  const mod=v=>Math.min(255,Math.max(0,v+shift*2));
  const newC=rgbToHex(mod(c.r),mod(c.g),mod(c.b));
  document.documentElement.style.setProperty('--accent-strong',newC);
  setLS('accentShift',brightness.value);
}
brightness.addEventListener('input',adjustAccent);

// EXPORT/IMPORT
exportBtn.addEventListener('click',()=>{
  const all={};
  for(let i=0;i<localStorage.length;i++){
    const k=localStorage.key(i);
    all[k]=localStorage.getItem(k);
  }
  navigator.clipboard.writeText(JSON.stringify(all,null,2));
  alert('Settings copied to clipboard.');
});
importBtn.addEventListener('click',()=>{
  const data=prompt('Paste settings JSON here:');
  try{
    const parsed=JSON.parse(data);
    for(const [k,v] of Object.entries(parsed))localStorage.setItem(k,v);
    alert('Settings imported. Reloading...');
    location.reload();
  }catch{alert('Invalid JSON');}
});

// RESET
resetBtn.addEventListener('click',()=>{
  if(confirmReset.checked){
    if(!confirm('Clear all settings and favourites?'))return;
  }
  localStorage.clear();
  alert('Settings cleared.');
  location.reload();
});

// small color helpers
function hexToRgb(hex){hex=hex.replace('#','');if(hex.length===3)hex=hex.split('').map(h=>h+h).join('');const bigint=parseInt(hex,16);return{r:(bigint>>16)&255,g:(bigint>>8)&255,b:bigint&255};}
function rgbToHex(r,g,b){const h=n=>Math.max(0,Math.min(255,Math.round(n))).toString(16).padStart(2,'0');return`#${h(r)}${h(g)}${h(b)}`;}
})();
