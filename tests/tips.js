const puppeteer=require('puppeteer-core');
const file=process.argv[2];
(async()=>{
 const b=await puppeteer.launch({executablePath:'/tmp/chromium',headless:'shell',args:['--no-sandbox','--disable-dev-shm-usage']});
 for(const [W,H,m] of [[1288,800,0],[393,852,1]]){
  const p=await b.newPage(); await p.setViewport({width:W,height:H,isMobile:!!m,hasTouch:!!m});
  const errs=[]; p.on('pageerror',e=>errs.push(e.message));
  await p.goto('file://'+file,{waitUntil:'networkidle0',timeout:120000}); await new Promise(r=>setTimeout(r,3500));
  await p.evaluate(()=>{
    [['SUZUKI','FRONX AT','45.000'],['BYD','YUAN UP','10.000']].forEach(([mm,l,k],i)=>{seleccionarOpcion('marca',i,mm);
      seleccionarOpcion('modelo',i,indice[mm].find(x=>x.startsWith(l)));
      const s=document.getElementById(`sel-anio-${i}`);s.value='2024';s.dispatchEvent(new Event('change',{bubbles:true}));
      const sl=document.querySelectorAll('.car-slot')[i];
      const pr=sl.querySelector('.sl-precio');pr.value='85.000.000';pr.dispatchEvent(new Event('input',{bubbles:true}));
      const km=sl.querySelector('.sl-km'); if(km){km.value=k;}});
    analizarTodo();
  });
  await new Promise(r=>setTimeout(r,3500));
  if(W===1288){ const info=await p.evaluate(()=>({tags:[...document.querySelectorAll('.cst-type-tag')].map(e=>e.textContent),
     fila:[...document.querySelectorAll('.comp-summary-table td:first-child')].map(e=>e.textContent.trim()).find(t=>/Gasolina|Electric/.test(t)),
     ins:[...document.querySelectorAll('.pc-card li, .pc-card div')].map(e=>e.textContent.trim()).filter(t=>/energía|gasolina|Kilometraje/i.test(t)).slice(0,4),
     rev:window._ultimosResultados.map(r=>[r.km,r.kmEsperado,r.ajusteKm,r.reventa])}));
     console.log(JSON.stringify(info,null,1)); }
  const n=await p.evaluate(()=>[...document.querySelectorAll('#results-section [data-tip]')].filter(e=>e.offsetParent).length);
  const fallas=[];
  for(let i=0;i<n;i++){
    const h=await p.evaluateHandle(i=>{const el=[...document.querySelectorAll('#results-section [data-tip]')].filter(e=>e.offsetParent)[i]; el.scrollIntoView({block:'center',behavior:'instant'}); return el;},i);
    await new Promise(r=>setTimeout(r,80));
    if(m) await h.tap(); else await h.hover();
    await new Promise(r=>setTimeout(r,200));
    const res=await p.evaluate(i=>{const el=[...document.querySelectorAll('#results-section [data-tip]')].filter(e=>e.offsetParent)[i];const t=document.getElementById('sa-tip');
      if(!t||!t.classList.contains('on'))return 'no aparece';
      const a=t.getBoundingClientRect(), r=el.getBoundingClientRect(), vw=document.documentElement.clientWidth;
      const errs=[];
      if(a.left<0||a.right>vw||a.top<0||a.bottom>innerHeight)errs.push('se sale');
      const dist=Math.min(Math.abs(a.bottom-r.top),Math.abs(a.top-r.bottom)); if(dist>20)errs.push('lejos '+Math.round(dist));
      if(a.right<r.left-5||a.left>r.right+5)errs.push('no alineado');
      if(getComputedStyle(el).cursor!=='pointer')errs.push('cursor '+getComputedStyle(el).cursor);
      return errs.join(',')||'ok';},i);
    if(res!=='ok') fallas.push(i+':'+res);
    if(m){ await p.mouse.click(5,5); }
  }
  console.log(`${W}px: ${n} tooltips, fallas: ${fallas.length?fallas.join(' | '):'ninguna'} ${errs.length?'JS:'+errs[0]:''}`);
  if(W===1288){ // captura de un tooltip de la parte baja de la tabla
    const h=await p.evaluateHandle(()=>{const els=[...[...document.querySelectorAll('#results-section [data-tip]')].filter(e=>e.offsetParent)];const el=els[els.length-1];el.scrollIntoView({block:'end',behavior:'instant'});return el;});
    await new Promise(r=>setTimeout(r,100)); await h.hover(); await new Promise(r=>setTimeout(r,250));
    await p.screenshot({path:'/tmp/qa/shots/tip_bajo.png'});
  }
  await p.close();
 }
 await b.close();
})();
