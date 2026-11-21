// Prueba de regresión de SmartAuto v2 con casos reales de SUV (nov 2026).
// Uso:  node tests/casos_suv.js ruta/a/v2.html   (requiere: npm i puppeteer-core @sparticuz/chromium)
// Abre la página en un navegador real, llama calcular() y compara contra valores esperados.
const puppeteer = require('puppeteer-core');
const chromium = require('@sparticuz/chromium').default || require('@sparticuz/chromium');
const path = require('path');
const file = path.resolve(process.argv[2] || 'v2.html');

// [tipo, marca, referencia, año, precio, km, manual, esperado: {motor, mesMin, mesMax}]
const CASOS = [
  ['nuevo','SUZUKI','FRONX AT',2026,94.5e6,0,null,{motor:'Híbrido ligero',mesMin:1150,mesMax:1350}],
  ['nuevo','KIA','EV2 AIR',2026,90e6,0,{carroceria:'suv',combustible:'electrico'},{motor:'Eléctrico',mesMin:1100,mesMax:1250}],
  ['nuevo','MG','ZS',2026,110e6,0,null,{motor:'Híbrido completo',mesMin:1550,mesMax:1850}],
  ['nuevo','RENAULT','DUSTER ICONIC',2026,101.9e6,0,null,{motor:'Gasolina',mesMin:1500,mesMax:1800}],
  ['usado','BYD','YUAN UP',2025,85.9e6,16500,null,{motor:'Eléctrico',mesMin:1000,mesMax:1200}],
  ['usado','TOYOTA','COROLLA CROSS XE-I · Híbrido',2022,111.9e6,55500,null,{motor:'Híbrido completo'}],
  ['usado','TOYOTA','YARIS CROSS XS',2024,95e6,20000,null,{motor:'Híbrido completo'}],
  ['nuevo','JEEP','AVENGER',2026,104e6,0,null,{motor:'Híbrido 48V'}],
  ['usado','MG','MG ZS 1.5L 4AT COM',2023,60e6,30000,null,{motor:'Gasolina'}],
];

(async () => {
  const b = await puppeteer.launch({ executablePath: await chromium.executablePath(), headless: 'shell', args: ['--no-sandbox','--disable-dev-shm-usage'] });
  const p = await b.newPage(); const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.goto('file://' + file, { waitUntil: 'networkidle0', timeout: 120000 });
  await new Promise(r => setTimeout(r, 6000));
  const res = await p.evaluate(casos => {
    leerDefaults(); defaults.ciudad = 'otra'; defaults.anos = 5; defaults.kmAnio = 12000;
    return casos.map(([tipo, marca, linea, anio, precio, km, manual]) => {
      const r = calcular({ marca, linea, anio: String(anio), precio, km, tipo, manual });
      return { motor: r.motor, mes: Math.round(r.costoNeto / 60 / 1000), label: r.tipoLabel };
    });
  }, CASOS);
  let fallos = errs.length;
  res.forEach((r, i) => {
    const e = CASOS[i][7]; const ok = r.motor === e.motor && (e.mesMin == null || (r.mes >= e.mesMin && r.mes <= e.mesMax));
    if (!ok) fallos++;
    console.log(`${ok ? '✓' : '✗'} ${CASOS[i][1]} ${CASOS[i][2]} ${CASOS[i][3]} → ${r.motor}, ${r.mes} mil/mes (${r.label})`);
  });
  if (errs.length) console.log('Errores JS:', errs);
  console.log(fallos ? `\n${fallos} fallo(s)` : '\nTODO OK');
  await b.close(); process.exit(fallos ? 1 : 0);
})();
