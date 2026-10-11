// QA opcional: Live Server :5500 e Chrome isolado em :9338.
// QA_REAL=1 acrescenta apenas GETs reais. Fixtures/falhas são locais ao navegador.
import assert from "node:assert/strict";
import { readFile, mkdir, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

const port = process.env.QA_PORT || "9338";
const tabs = await (await fetch(`http://127.0.0.1:${port}/json/list`)).json();
const ws = new WebSocket(tabs.find(tab => tab.type === "page").webSocketDebuggerUrl);
await new Promise(resolve => ws.addEventListener("open", resolve, { once: true }));
let id = 0;
const pending = new Map(), errors = [], badLocal = [], images = [], requests = [];
const png = (await readFile(new URL("../assets/images/demo/capa.png", import.meta.url))).toString("base64");
ws.addEventListener("message", async event => {
  const msg = JSON.parse(event.data);
  if (msg.id) {
    const pair = pending.get(msg.id); pending.delete(msg.id);
    if (msg.error) pair.reject(new Error(msg.error.message)); else pair.resolve(msg.result);
  }
  if (msg.method === "Runtime.exceptionThrown") errors.push(msg.params.exceptionDetails.text);
  if (msg.method === "Runtime.consoleAPICalled" && msg.params.type === "error") errors.push(msg.params.args.map(arg => arg.value || arg.description).join(" "));
  if (msg.method === "Network.responseReceived" && msg.params.response.url.startsWith("http://127.0.0.1:5500/") && msg.params.response.status >= 400) badLocal.push(msg.params.response.status);
  if (msg.method === "Network.requestWillBeSent") {
    const request = msg.params.request;
    if (request.url.includes('/storage/v1/')) images.push(request);
    if (request.url.includes('/rest/v1/') && request.method !== 'OPTIONS') requests.push(request);
  }
  if (msg.method === "Fetch.requestPaused") await send("Fetch.fulfillRequest", { requestId: msg.params.requestId, responseCode: 200,
    responseHeaders: [{ name: "Content-Type", value: "image/png" }, { name: "Cache-Control", value: "public, max-age=3600" }], body: png });
});
function send(method, params = {}) {
  return new Promise((resolve, reject) => { pending.set(++id, { resolve, reject }); ws.send(JSON.stringify({ id, method, params })); });
}
async function evaluate(expression) {
  const result = await send("Runtime.evaluate", { expression, awaitPromise: true, returnByValue: true });
  if (result.exceptionDetails) throw new Error(result.exceptionDetails.exception?.description || result.exceptionDetails.text);
  return result.result.value;
}
const pause = ms => new Promise(resolve => setTimeout(resolve, ms));
async function wait(expression) {
  for (let i = 0; i < 120; i++) { if (await evaluate(expression)) return; await pause(100); }
  throw new Error(`Timeout: ${expression}`);
}
async function open(query = 'carro=fixture-available') {
  await evaluate('window.__qaOldDocument=true');
  await send('Page.navigate', { url: `http://127.0.0.1:5500/veiculo.html${query ? '?' + query : ''}` });
  await wait("!window.__qaOldDocument && document.readyState==='complete' && document.getElementById('vehicle-content').getAttribute('aria-busy')==='false'");
}
async function ready() {
  await wait("!!document.querySelector('.vehicle-detail') && document.getElementById('similar-results').getAttribute('aria-busy')==='false'");
}
async function swipe(dx) {
  await evaluate("document.querySelector('#vehicle-photos').scrollIntoView({block:'center',behavior:'instant'})");
  const point = await evaluate("(()=>{const r=document.querySelector('#vehicle-photos .photo-gallery').getBoundingClientRect();return {x:r.x+r.width/2,y:r.y+r.height*0.4}})()");
  await send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [point] });
  for (let i = 1; i <= 5; i++) await send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: point.x + dx*i/5, y: point.y }] });
  await send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
}
async function capture(name) {
  const shot = await send('Page.captureScreenshot', { format: 'png' });
  await writeFile(join(captures, `${name}.png`), Buffer.from(shot.data, 'base64'));
}
const captures = join(tmpdir(), 'vertice-captures-etapa6'); await mkdir(captures, { recursive: true });
await send('Page.enable'); await send('Runtime.enable'); await send('Network.enable');

if (process.env.QA_REAL === '1') {
  const { supabaseGet } = await import('../js/supabase.js');
  const { buscarVeiculoPorSlug, listarSemelhantes } = await import('../js/veiculos.js');
  const { formatPrice } = await import('../js/formatters.js');
  const vehicles = await supabaseGet('veiculos', { select: 'id,slug,status', publicado: 'eq.true', order: 'created_at.desc,id.asc', limit: '50' });
  assert.ok(vehicles.length);
  await send('Emulation.setDeviceMetricsOverride', { width: 390, height: 900, deviceScaleFactor: 1, mobile: true });
  for (const status of ['disponivel', 'reservado', 'vendido']) {
    const summary = vehicles.find(vehicle => vehicle.status === status);
    if (!summary) { console.log(`Sem exemplo real de ${status}; estado coberto pelas fixtures.`); continue; }
    const vehicle = await buscarVeiculoPorSlug(summary.slug);
    const similar = await listarSemelhantes(vehicle);
    assert.ok(similar.length <= 4);
    assert.ok(similar.every(item => item.id !== vehicle.id && item.categoria === vehicle.categoria && ['disponivel', 'reservado'].includes(item.status)));
    await open('carro=' + vehicle.slug); await ready();
    assert.equal(await evaluate("document.querySelector('.vehicle-detail').dataset.vehicleId"), vehicle.id);
    assert.equal(await evaluate("document.querySelector('.vehicle-detail-price').textContent"), formatPrice(vehicle.preco));
    assert.deepEqual(await evaluate("[...document.querySelectorAll('#similar-results .vehicle-card')].map(card=>card.dataset.vehicleId)"), similar.map(item => item.id));
    assert.equal(await evaluate(`!!document.querySelector('.status-${status}')`), true);
    if (status !== 'disponivel') assert.equal(await evaluate("!!document.querySelector('.vehicle-status-notice')"), true);
    if (vehicle.imagens.some(image => image.url)) await wait("document.querySelector('#vehicle-photos .vehicle-card-image').naturalWidth>0");
    await evaluate("scrollTo({top:0,behavior:'instant'})"); await capture(`real-${status}-390`);
  }
  assert.equal(await buscarVeiculoPorSlug('demo-yaris-rascunho-2022-016'), null);
  await open('carro=demo-yaris-rascunho-2022-016');
  assert.equal(await evaluate("document.querySelector('h1').textContent"), 'Veículo não encontrado');
  assert.equal(requests.every(request => request.method === 'GET'), true);
  console.log('PASS real: ficha/preço/fotos, três status, semelhantes limitados e rascunho inacessível; somente GETs.');
}

const fixture = `
 window.calls=[];window.aborted=0;window.nativeFetch=window.fetch;
 window.detailFail=location.search.includes('fixture-failure');window.similarFail=location.search.includes('similar-failure');window.emptySimilar=location.search.includes('similar-empty');
 window.detailDelay=0;window.similarDelay=0;
 window.fixtureImages=(n)=>Array.from({length:3},(_,i)=>({id:'image-'+n+'-'+i,storage_path:'testing/details/vehicle-'+n+'/'+i+'.jpg',ordem:i,principal:i===1}));
 window.baseVehicle={id:'11111111-1111-4111-8111-111111111111',codigo:'VR-001',slug:'fixture-available',marca:'Jeep',modelo:'Compass',versao:'Longitude 1.3 Turbo',ano_fabricacao:2022,ano_modelo:2023,preco:129990,quilometragem:35500,cambio:'automatico',combustivel:'flex',categoria:'suv',cor:'Branco',motorizacao:'1.3 Turbo',status:'disponivel',descricao:'Conforto para cada caminho.\\n\\nVeículo com histórico de manutenção informado pela loja.',opcionais:['Ar-condicionado','Câmera de ré','Direção elétrica'],destaques:['Único dono','Revisões em dia'],imagens:window.fixtureImages(0)};
 window.fixtureRows=Array.from({length:8},(_,n)=>({...window.baseVehicle,id:'11111111-1111-4111-8111-'+String(n+1).padStart(12,'0'),slug:'similar-'+n,modelo:'Modelo '+n,status:n===2?'vendido':n===1?'reservado':'disponivel',categoria:n===3?'sedan':'suv',capa:[window.fixtureImages(n+1)[1]]}));
 window.fixtureRows[0].id=window.baseVehicle.id;
 window.waitQa=(delay,signal)=>new Promise((resolve,reject)=>{const timer=setTimeout(resolve,delay);signal.addEventListener('abort',()=>{clearTimeout(timer);window.aborted++;reject(new DOMException('cancelado','AbortError'));},{once:true});});
 window.fetch=async(url,options)=>{
   if(!String(url).includes('/rest/v1/'))return window.nativeFetch(url,options);
   const params=new URL(url).searchParams;window.calls.push({params:Object.fromEntries(params),method:options.method,path:new URL(url).pathname});
   if(String(url).includes('/veiculo_imagens'))return new Response(JSON.stringify(window.fixtureImages(5)),{status:200});
   if(params.has('slug')){
     if(window.detailDelay)await window.waitQa(window.detailDelay,options.signal);
     if(window.detailFail)throw new TypeError('falha simulada');
     const slug=params.get('slug').slice(3);
     if(['fixture-missing','fixture-hidden'].includes(slug))return new Response('[]',{status:200});
     const vehicle={...window.baseVehicle,slug};
     if(slug==='fixture-reserved')vehicle.status='reservado';
     if(slug==='fixture-sold')vehicle.status='vendido';
     if(slug==='fixture-no-photos'){vehicle.imagens=[];vehicle.descricao='';vehicle.opcionais=[];vehicle.destaques=[];vehicle.motorizacao=null;vehicle.versao='';}
     if(slug==='fixture-hostile'){
       vehicle.marca='<img src=x onerror="window.injected=true">';vehicle.modelo='<script>window.injected=true</script>';vehicle.versao='VERSAO'.repeat(80);
       vehicle.descricao='<script>window.injected=true</script>\\nhttps://example.invalid';vehicle.opcionais=['<img src=x onerror="window.injected=true">','  Item  ','Item',null,42];vehicle.destaques=['<svg onload="window.injected=true">'];
       vehicle.cor='COR'.repeat(120);vehicle.motorizacao='MOTOR'.repeat(80);vehicle.combustivel='constructor';vehicle.preco=-1;vehicle.imagens=[{id:'hostile',storage_path:'javascript:window.injected=true',ordem:0,principal:true}];
     }
     return new Response(JSON.stringify([vehicle]),{status:200});
   }
   if(window.similarDelay)await window.waitQa(window.similarDelay,options.signal);
   if(window.similarFail)throw new TypeError('falha simulada');
   const rows=window.emptySimilar?[]:window.fixtureRows.filter(row=>row.id!==params.get('id').slice(4)&&row.categoria===params.get('categoria').slice(3)&&['disponivel','reservado'].includes(row.status)).slice(0,Number(params.get('limit')));
   return new Response(JSON.stringify(rows),{status:200});
 };`;
await send('Fetch.enable', { patterns: [{ urlPattern: '*/storage/v1/object/public/veiculos/testing/*' }] });
const injection = await send('Page.addScriptToEvaluateOnNewDocument', { source: fixture });
try {
  for (const [slug, status] of [['fixture-available','disponivel'], ['fixture-reserved','reservado'], ['fixture-sold','vendido']]) {
    for (const width of [360,390,768,1440]) {
      await send('Emulation.setDeviceMetricsOverride', { width, height: 900, deviceScaleFactor: 1, mobile: width < 768 });
      await open('carro=' + slug); await ready();
      assert.equal(await evaluate('document.documentElement.scrollWidth<=innerWidth'), true, `${slug} ${width}`);
      assert.equal(await evaluate("document.querySelectorAll('h1').length"), 1);
      assert.equal(await evaluate("document.querySelector('h1').textContent"), 'Jeep Compass');
      assert.equal(await evaluate("document.querySelector('.vehicle-detail-price').textContent"), 'R$ 129.990,00');
      assert.equal(await evaluate("document.querySelectorAll('.vehicle-detail-specs > div').length"), 10);
      assert.equal(await evaluate("document.querySelector('.vehicle-detail-specs').textContent.includes('Automático') && document.querySelector('.vehicle-detail-specs').textContent.includes('Flex')"), true);
      assert.equal(await evaluate("document.querySelectorAll('.vehicle-equipment-list li').length"), 3);
      assert.equal(await evaluate("document.querySelector('.vehicle-description-text').textContent.includes('\\n\\n')"), true);
      assert.equal(await evaluate(`!!document.querySelector('.vehicle-summary .status-${status}')`), true);
      assert.equal(await evaluate("!!document.querySelector('.vehicle-status-notice')"), status !== 'disponivel');
      assert.equal(await evaluate("document.querySelectorAll('#similar-results .vehicle-card').length"), 4);
      assert.equal(await evaluate("document.querySelector('#similar-results [data-vehicle-id=\"11111111-1111-4111-8111-111111111111\"]')===null"), true);
      assert.equal(await evaluate("window.calls.length"), 2);
      assert.equal(await evaluate("window.calls[1].params.limit==='4' && window.calls[1].params.status==='in.(disponivel,reservado)' && window.calls[1].params.categoria==='eq.suv'"), true);
      assert.equal(await evaluate("document.querySelector('a button')===null"), true);
      assert.equal(await evaluate("document.querySelector('[data-contact-placeholder]').disabled"), true);
      if (status === 'vendido') assert.equal(await evaluate("document.querySelector('.vehicle-stock-action').textContent"), 'Ver estoque atual');
      await wait("document.querySelector('#vehicle-photos .vehicle-card-image').naturalWidth>0");
      if (width === 390 || width === 1440) await capture(`${slug}-${width}`);
    }
  }
  console.log('PASS: disponível/reservado/vendido em quatro larguras, ficha completa, opcionais, descrição e quatro semelhantes corretos.');

  await send('Emulation.setDeviceMetricsOverride', { width: 390, height: 900, deviceScaleFactor: 1, mobile: true });
  await send('Emulation.setTouchEmulationEnabled', { enabled: true });
  await open(); await ready();
  assert.equal(await evaluate("document.querySelector('#vehicle-photos .photo-count').textContent"), '2 / 3');
  await swipe(-110); await wait("document.querySelector('#vehicle-photos .photo-count').textContent==='3 / 3'");
  await swipe(110); await wait("document.querySelector('#vehicle-photos .photo-count').textContent==='2 / 3'");
  await evaluate("document.querySelector('#vehicle-photos .photo-gallery').focus()");
  await send('Input.dispatchKeyEvent', { type: 'keyDown', key: 'ArrowLeft', code: 'ArrowLeft' });
  await send('Input.dispatchKeyEvent', { type: 'keyUp', key: 'ArrowLeft', code: 'ArrowLeft' });
  await wait("document.querySelector('#vehicle-photos .photo-count').textContent==='1 / 3'");
  await evaluate("document.querySelector('#similar-results .photo-next').click()");
  await wait("document.querySelector('#similar-results .photo-count').textContent!=='Fotos'");
  assert.equal(await evaluate("window.calls.filter(call=>call.path.endsWith('/veiculo_imagens')).length"), 1);
  console.log('PASS: galeria mantém capa/ordem, swipe, teclado e swipe nos cards de semelhantes.');

  for (const query of ['', 'carro=../invalido', 'carro=fixture-missing', 'carro=fixture-hidden']) {
    await open(query);
    assert.equal(await evaluate("document.querySelector('h1').textContent"), 'Veículo não encontrado');
    assert.equal(await evaluate("!!document.querySelector('.vehicle-detail') || !document.getElementById('vehicle-similar').hidden"), false);
    assert.equal(await evaluate("document.querySelector('#vehicle-content a').href.endsWith('/estoque.html')"), true);
    assert.equal(await evaluate('window.calls.length'), query.includes('fixture-') ? 1 : 0);
  }
  await open('carro=fixture-failure');
  assert.equal(await evaluate("!!document.querySelector('#vehicle-content .state-panel-error')"), true);
  await evaluate("window.detailFail=false;window.detailDelay=400;const button=document.querySelector('#vehicle-content button');button.focus();button.click();button.click()"); await ready();
  assert.equal(await evaluate('window.calls.filter(call=>call.params.slug).length'), 2);
  assert.equal(await evaluate("document.activeElement.id"), 'veiculo-titulo');
  await open('carro=fixture-available&qa=similar-failure'); await ready();
  assert.equal(await evaluate("!!document.querySelector('#similar-results .state-panel-error') && !!document.querySelector('.vehicle-detail')"), true);
  await evaluate("window.savedGallery=document.querySelector('#vehicle-photos .photo-gallery');window.similarFail=false;window.similarDelay=400;const button=document.querySelector('#similar-results button');button.focus();button.click();button.click()"); await ready();
  assert.equal(await evaluate('window.calls.filter(call=>call.params.slug).length'), 1);
  assert.equal(await evaluate('window.calls.filter(call=>!call.params.slug).length'), 2);
  assert.equal(await evaluate("window.savedGallery===document.querySelector('#vehicle-photos .photo-gallery')"), true);
  assert.equal(await evaluate('document.activeElement.id'), 'vehicle-similar-title');
  await open('carro=fixture-available&qa=similar-empty'); await ready();
  assert.equal(await evaluate("!!document.querySelector('#similar-results .state-panel-empty') && !document.querySelector('#similar-results .state-panel-error')"), true);
  console.log('PASS: ausente/inválido/oculto, falhas distintas, retry sem duplicação e preservação/foco da ficha na falha de semelhantes.');

  await open('carro=fixture-no-photos'); await ready();
  assert.equal(await evaluate("document.querySelector('#vehicle-photos .vehicle-card-fallback').textContent.includes('Foto em breve')"), true);
  assert.equal(await evaluate("document.querySelector('.vehicle-description-text').textContent"), 'Descrição não informada.');
  assert.equal(await evaluate("document.querySelector('.vehicle-empty-field').textContent"), 'Equipamentos não informados.');
  assert.equal(await evaluate("document.querySelector('.vehicle-detail-specs').textContent.includes('Não informado')"), true);
  await open('carro=fixture-hostile'); await ready();
  assert.equal(await evaluate('document.documentElement.scrollWidth<=innerWidth'), true);
  assert.equal(await evaluate("!!window.injected || !!document.querySelector('#vehicle-content script') || !!document.querySelector('#vehicle-content img[onerror]')"), false);
  assert.equal(await evaluate("document.querySelector('h1').textContent.includes('<img') && document.querySelector('.vehicle-description-text').textContent.includes('<script>')"), true);
  assert.equal(await evaluate("document.querySelectorAll('.vehicle-equipment-list li').length"), 2);
  assert.equal(await evaluate("document.querySelector('#vehicle-photos img')===null"), true);
  assert.equal(await evaluate("document.querySelector('.vehicle-detail-price').textContent"), 'Preço a consultar');
  console.log('PASS: dados opcionais ausentes, fotos vazias, texto longo/HTML seguro, duplicatas e URL executável rejeitada.');

  await open('carro=fixture-available&qa=similar-failure'); await ready();
  await evaluate("window.similarDelay=1500;window.similarFail=false;document.querySelector('#similar-results button').click();window.dispatchEvent(new PageTransitionEvent('pagehide',{persisted:true}))");
  await wait('window.aborted===1');
  assert.equal(await evaluate("!!document.querySelector('.vehicle-detail')"), true);
  await evaluate("window.similarDelay=0;window.dispatchEvent(new PageTransitionEvent('pageshow',{persisted:true}))"); await ready();
  assert.equal(await evaluate("!!document.querySelector('#similar-results .state-panel-error')"), false);
  console.log('PASS: sair cancela consulta pendente; retorno atualiza ficha e semelhantes.');

  const saving = await send('Page.addScriptToEvaluateOnNewDocument', { source: "Object.defineProperty(navigator,'connection',{value:{saveData:true},configurable:true})" });
  images.length = 0; await open(); await ready(); await wait("document.querySelector('#vehicle-photos .vehicle-card-image').naturalWidth>0"); await pause(150);
  assert.deepEqual([...new Set(images.filter(request=>request.url.includes('/vehicle-0/')).map(request=>new URL(request.url).pathname.split('/').pop()))], ['1.jpg']);
  await send('Page.removeScriptToEvaluateOnNewDocument', { identifier: saving.identifier });
  images.length = 0; await open(); await ready(); await pause(150);
  assert.deepEqual([...new Set(images.filter(request=>request.url.includes('/vehicle-0/')).map(request=>new URL(request.url).pathname.split('/').pop()))].sort(), ['1.jpg','2.jpg']);
  assert.equal(images.some(request=>Object.keys(request.headers).some(header=>['apikey','authorization'].includes(header.toLowerCase()))), false);
  await send('Emulation.setEmulatedMedia', { features: [{name:'prefers-reduced-motion',value:'reduce'}] });
  await evaluate("document.querySelector('#vehicle-photos .photo-next').click()");
  assert.equal(await evaluate("getComputedStyle(document.querySelector('#vehicle-photos .vehicle-card-image')).animationName"), 'none');
  await send('Emulation.setEmulatedMedia', { features: [] });
  await send('Emulation.setScriptExecutionDisabled', { value: true });
  await send('Page.navigate', { url: 'http://127.0.0.1:5500/veiculo.html' });
  await pause(300);
  assert.equal(await evaluate("!!document.querySelector('noscript p') && document.querySelector('.main-nav a').getAttribute('href')==='./index.html'"), true);
  await send('Emulation.setScriptExecutionDisabled', { value: false });
  assert.deepEqual(errors, []); assert.deepEqual(badLocal, []);
  console.log('PASS: economia de dados, só foto atual/próxima, imagens sem credenciais, movimento reduzido, navegação sem JS e console/imports sem erros.');
  console.log(`Capturas: ${captures}`);
} finally {
  await send('Page.removeScriptToEvaluateOnNewDocument', { identifier: injection.identifier });
  await send('Fetch.disable'); ws.close();
}
