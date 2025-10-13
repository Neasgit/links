(function(){
'use strict';
const qs=id=>document.getElementById(id);
const setLS=(k,v)=>{try{localStorage.setItem(k,v);}catch(e){}};
const getLS=(k,f=null)=>{try{const v=localStorage.getItem(k);return v===null?f:v;}catch(e){return f;}};
const safeJSON=(s,f)=>{try{return JSON.parse(s);}catch(e){return f;}};

let groupsData=[],currentGroup=null;
const grid=qs('grid'),nav=qs('nav-section'),showAllBtn=qs('show-all-toggle');
const settingsBtn=qs('settings-btn'),overlay=qs('settings-overlay');

document.addEventListener('DOMContentLoaded',()=>{
  // ---- DATA LOADER ----
  fetch('links.json').then(r=>r.ok?r.json():Promise.reject('load fail'))
  .then(data=>{
    groupsData=data.groups||[];
    mountNav(groupsData);
    const defaultView=getLS('defaultView','all');
    if(defaultView==='first'&&groupsData[0]){currentGroup=groupsData[0];renderGroup(currentGroup);}
    else{renderAll();}
  }).catch(err=>{
    grid.innerHTML=`<p style="color:red;">⚠️ Failed to load links.json</p>`;
    console.error(err);
  });
});

// ---- RENDERERS ----
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
    const h=document.createElement('h3');h.textContent=g.title;grid.appendChild(h);
    (g.items||[]).forEach(i=>grid.appendChild(createCard(i)));
  });
}
function createCard(item){
  const c=document.createElement('div');
  c.className='card';
  c.innerHTML=`<strong>${item.title}</strong><small>${item.notes||''}</small>`;
  c.onclick=()=>{if(item.url)window.open(item.url,'_blank');};
  return c;
}

// ---- SETTINGS OVERLAY ----
settingsBtn.addEventListener('click',()=>overlay.classList.add('visible'));
overlay.addEventListener('click',e=>{if(e.target===overlay)overlay.classList.remove('visible');});
document.addEventListener('keydown',e=>{if(e.key==='Escape')overlay.classList.remove('visible');});

// same settings logic as previous (truncated for brevity)
})();
