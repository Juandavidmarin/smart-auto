const puppeteer=require('puppeteer-core');
const file=process.argv[2], tag=process.argv[3]||'x';
const VP=[[393,852,1],[768,1024,1],[1024,768,0],[1288,800,0],[1440,900,0]];
(async()=>{
 const b=await puppeteer.launch({executablePath:'/tmp/chromium',headless:'shell',args:['--no-sandbox','--disable-dev-shm-usage']});
 for(const n of [2,3]) for(const [W,H,m] of VP){
  const p=await b.newPage();
  await p.setViewport({width:W,height:H,isMobile:!!m,hasTouch:!!m});
  await p.emulateMediaFeatures([{name:'prefers-color-scheme',value:'dark'}]);
  const errs=[]; p.on('pageerror',e=>errs.push(e.message));
  await p.goto('file://'+file,{waitUntil:'networkidle0',timeout:120000});
  await new Promise(r=>setTimeout(r,3500));
  await p.evaluate(async(n)=>{
    if(n===3) addCarSlot();
    const cars=[['SUZUKI','FRONX AT'],['BYD','YUAN UP'],['MG','ZS']];
    for(let i=0;i<n;i++){
      seleccionarOpcion('marca',i,cars[i][0]);
      const lin=indice[cars[i][0]].find(l=>l.startsWith(cars[i][1]))||indice[cars[i][0]][0];
      seleccionarOpcion('modelo',i,lin);
      const s=document.getElementById(`sel-anio-${i}`);const o=[...s.options].find(x=>x.value==='2025')||[...s.options].find(x=>x.value);
      s.value=o.value;s.dispatchEvent(new Event('change',{bubbles:true}));
      const pr=document.querySelectorAll('.car-slot')[i].querySelector('.sl-precio'); pr.value='85.000.000'; pr.dispatchEvent(new Event('input',{bubbles:true}));
    }
    analizarTodo();
  },n);
  await new Promise(r=>setTimeout(r,4000));
  // Detector: textos que se montan o se cortan dentro de la sección de resultados
  const prob=await p.evaluate(()=>{
    const out=[]; const sec=document.getElementById('results-section'); if(!sec) return ['sin resultados'];
    const leaves=[...sec.querySelectorAll('*')].filter(e=>e.offsetParent!==null&&[...e.childNodes].some(c=>c.nodeType===3&&c.textContent.trim()));
    const rects=leaves.map(e=>{const rg=document.createRange();rg.selectNodeContents(e);return [e,rg.getBoundingClientRect()]});
    for(let i=0;i<rects.length;i++)for(let j=i+1;j<rects.length;j++){
      const [a,ra]=rects[i],[c,rc]=rects[j]; if(a.contains(c)||c.contains(a))continue;
      const ox=Math.min(ra.right,rc.right)-Math.max(ra.left,rc.left), oy=Math.min(ra.bottom,rc.bottom)-Math.max(ra.top,rc.top);
      if(ox>2&&oy>2) out.push('SOLAPE: "'+a.textContent.trim().slice(0,25)+'" / "'+c.textContent.trim().slice(0,25)+'"');
    }
    // texto cortado por su celda/caja
    leaves.forEach(e=>{const rg=document.createRange();rg.selectNodeContents(e);const r=rg.getBoundingClientRect();
      let a=e; while(a&&a!==sec){const cs=getComputedStyle(a); if(a.tagName==='TD'||a.tagName==='TH'||/hidden|auto|scroll/.test(cs.overflowX)){const ar=a.getBoundingClientRect(); if(r.right>ar.right+1||r.left<ar.left-1) out.push('CORTADO: "'+e.textContent.trim().slice(0,30)+'"'); break;} a=a.parentElement;}});
    return [...new Set(out)];
  });
  const el=await p.$('#results-section');
  await el.screenshot({path:`/tmp/qa/shots/${tag}_${n}c_${W}.png`});
  console.log(`${n} carros ${W}px: ${prob.length?prob.slice(0,8).join(' | '):'ok'} ${errs.length?'JS:'+errs[0]:''}`);
  await p.close();
 }
 await b.close();
})();
