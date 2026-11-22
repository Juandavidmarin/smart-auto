const puppeteer=require('puppeteer-core');
const file=process.argv[2];
(async()=>{
 const b=await puppeteer.launch({executablePath:'/tmp/chromium',headless:'shell',args:['--no-sandbox','--disable-dev-shm-usage']});
 for(const mode of ['dark','light']){
  const p=await b.newPage(); await p.setViewport({width:1288,height:900});
  await p.emulateMediaFeatures([{name:'prefers-color-scheme',value:mode}]);
  await p.goto('file://'+file,{waitUntil:'networkidle0',timeout:120000}); await new Promise(r=>setTimeout(r,3500));
  await p.evaluate(()=>{
    addCarSlot();
    [['SUZUKI','FRONX AT'],['BYD','YUAN UP'],['MG','ZS']].forEach(([m,l],i)=>{seleccionarOpcion('marca',i,m);
      seleccionarOpcion('modelo',i,indice[m].find(x=>x.startsWith(l)));
      const s=document.getElementById(`sel-anio-${i}`);s.value='2025';s.dispatchEvent(new Event('change',{bubbles:true}));
      const pr=document.querySelectorAll('.car-slot')[i].querySelector('.sl-precio');pr.value='85.000.000';pr.dispatchEvent(new Event('input',{bubbles:true}));});
    analizarTodo();
  });
  await new Promise(r=>setTimeout(r,3500));
  // abrir paneles plegables para revisarlos también
  await p.evaluate(()=>{document.querySelectorAll('.detail-toggle,[onclick*="toggleDefaults"],[onclick*="Supuestos"]').forEach(e=>{try{e.click()}catch(_){}})});
  await new Promise(r=>setTimeout(r,800));
  const bad=await p.evaluate(()=>{
    const parse=c=>{const m=c.match(/[\d.]+/g);return m?m.map(Number):[0,0,0,0]};
    const lum=([r,g,b])=>{const f=v=>{v/=255;return v<=0.03928?v/12.92:Math.pow((v+0.055)/1.055,2.4)};return 0.2126*f(r)+0.7152*f(g)+0.0722*f(b)};
    const out=[];
    document.querySelectorAll('body *').forEach(e=>{
      if(!e.offsetParent&&getComputedStyle(e).position!=='fixed')return;
      if(![...e.childNodes].some(c=>c.nodeType===3&&c.textContent.trim()))return;
      const cs=getComputedStyle(e); if(cs.visibility==='hidden'||+cs.opacity===0)return;
      let fg=parse(cs.color); let a=e,bg=null,op=1;
      while(a){const s=getComputedStyle(a); op*=+s.opacity; const c=parse(s.backgroundColor);
        if(s.backgroundImage!=='none'&&!bg){bg='img';break;}
        if(c.length===4?c[3]>0.5:c.length===3){bg=c.slice(0,3);break;} a=a.parentElement;}
      if(bg==='img')return; if(!bg)bg=parse(getComputedStyle(document.body).backgroundColor).slice(0,3);
      const fa=fg.length===4?fg[3]*op:op; const f=fg.slice(0,3).map((v,i)=>v*fa+bg[i]*(1-fa));
      const L1=lum(f),L2=lum(bg); const ratio=(Math.max(L1,L2)+0.05)/(Math.min(L1,L2)+0.05);
      if(ratio<3) out.push(ratio.toFixed(1)+' '+(e.className||e.tagName).toString().slice(0,28)+' "'+e.textContent.trim().slice(0,30)+'"');
    });
    return [...new Set(out)];
  });
  console.log(`== ${mode}: ${bad.length} textos con contraste < 3:1`); bad.forEach(x=>console.log('  '+x));
  await p.close();
 }
 await b.close();
})();
