const puppeteer=require('puppeteer-core');
(async()=>{const b=await puppeteer.launch({executablePath:'/tmp/chromium',headless:'shell',args:['--no-sandbox']});
for (const [W,m] of [[1288,0],[393,1]]){
const p=await b.newPage(); await p.setViewport({width:W,height:900,isMobile:!!m,hasTouch:!!m});
p.on('pageerror',e=>console.log('ERR',e.message));
await p.goto('file:///tmp/sa/v2.html',{waitUntil:'networkidle0'}); await new Promise(r=>setTimeout(r,4000));
await p.evaluate(()=>seleccionarOpcion('marca',0,'CHEVROLET'));
const inp=await p.$('#inp-modelo-0'); await inp.click(); await inp.type('tracker'); await new Promise(r=>setTimeout(r,400));
console.log(W, await p.evaluate(()=>[...document.querySelectorAll('#dd-modelo-0 li')].slice(0,40).map(l=>l.innerText.replace(/\n/g,' | ')).join('\n')));
await inp.click({clickCount:3}); await inp.type('1.2'); await new Promise(r=>setTimeout(r,300));
console.log('busca 1.2:', await p.evaluate(()=>document.querySelectorAll('#dd-modelo-0 li').length));
await p.screenshot({path:`/tmp/qa/shots/motor_${W}.png`});
await p.evaluate(()=>{seleccionarOpcion('modelo',0,'TRACKER RS · Camioneta' in (indice.CHEVROLET||[]) ? 'TRACKER RS · Camioneta':'TRACKER RS')});
await new Promise(r=>setTimeout(r,300));
console.log('años RS:', await p.evaluate(()=>[...document.getElementById('sel-anio-0').options].map(o=>o.value).filter(Boolean).join(',')), '| bajo campo:', await p.evaluate(()=>document.getElementById('cnt-modelo-0').textContent));
await p.close();}
await b.close();})();
