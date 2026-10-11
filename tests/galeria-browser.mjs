// QA opcional: Live Server :5500 e Chrome isolado com depuração local :9337.
// Fixtures e falhas ficam na memória do navegador. Nenhuma escrita no Supabase.
import assert from "node:assert/strict";
import { readFile, mkdir, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

const port = process.env.QA_PORT || "9337";
const tabs = await (await fetch(`http://127.0.0.1:${port}/json/list`)).json();
const ws = new WebSocket(tabs.find(tab => tab.type === "page").webSocketDebuggerUrl);
await new Promise(resolve => ws.addEventListener("open", resolve, { once: true }));
let id = 0;
const pending = new Map(), exceptions = [], badLocal = [], images = [];
const png = (await readFile(new URL("../assets/images/demo/capa.png", import.meta.url))).toString("base64");
ws.addEventListener("message", async event => {
  const msg = JSON.parse(event.data);
  if (msg.id) {
    const pair = pending.get(msg.id); pending.delete(msg.id);
    if (msg.error) pair.reject(new Error(msg.error.message)); else pair.resolve(msg.result);
  }
  if (msg.method === "Runtime.exceptionThrown") exceptions.push(msg.params.exceptionDetails.text);
  if (msg.method === "Runtime.consoleAPICalled" && msg.params.type === "error") exceptions.push(msg.params.args.map(arg => arg.value || arg.description).join(" "));
  if (msg.method === "Network.responseReceived" && msg.params.response.url.startsWith("http://127.0.0.1:5500/") && msg.params.response.status >= 400) badLocal.push(msg.params.response.status);
  if (msg.method === "Network.requestWillBeSent" && msg.params.request.url.includes("/storage/v1/")) images.push(msg.params.request);
  if (msg.method === "Fetch.requestPaused") await send("Fetch.fulfillRequest", { requestId: msg.params.requestId, responseCode: 200, responseHeaders: [{ name: "Content-Type", value: "image/png" }, { name: "Cache-Control", value: "public, max-age=3600" }], body: png });
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
  for (let i = 0; i < 100; i++) { if (await evaluate(expression)) return; await pause(100); }
  throw new Error(`Timeout: ${expression}`);
}
async function open(path, gallery = true) {
  await evaluate("window.__qaOldDocument=true");
  await send("Page.navigate", { url: `http://127.0.0.1:5500/${path}` });
  await wait(`!window.__qaOldDocument && document.readyState==='complete' && location.pathname.endsWith('${path.split('?')[0]}')`);
  if (gallery) await wait("!!document.querySelector('.photo-gallery')");
}
async function ready(index = 1) {
  await wait(`document.getElementById('explore-position').textContent.startsWith('Veículo ${index} ·') && document.getElementById('explore-stage').dataset.transitioning!=='true'`);
}
async function key(value) {
  await send("Input.dispatchKeyEvent", { type: "keyDown", key: value, code: value });
  await send("Input.dispatchKeyEvent", { type: "keyUp", key: value, code: value });
}
async function swipe(dx, dy = 0) {
  await evaluate("document.querySelector('.photo-gallery').scrollIntoView({block:'center',behavior:'instant'})");
  const point = await evaluate("(()=>{const r=document.querySelector('.photo-gallery').getBoundingClientRect();const image=document.querySelector('.vehicle-card-image').getBoundingClientRect();return {x:r.x+r.width/2,y:image.y+image.height*0.4}})()");
  await send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [point] });
  for (let i = 1; i <= 5; i++) await send("Input.dispatchTouchEvent", { type: "touchMove", touchPoints: [{ x: point.x + dx*i/5, y: point.y + dy*i/5 }] });
  await send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
}
const fixture = `
  window.nativeFetch=window.fetch;window.calls=[];window.galleryDelay=0;window.failGallery=false;window.aborted=0;
  window.fixtureImages=(n)=>n===2?[]:Array.from({length:n===1?1:3},(_,i)=>({id:'photo-'+n+'-'+i,storage_path:'testing/car-'+n+'/'+i+'.jpg',ordem:i,principal:i===0}));
  window.fixtureRows=Array.from({length:6},(_,n)=>({id:'11111111-1111-4111-8111-'+String(n+1).padStart(12,'0'),slug:'fixture-'+n,marca:'Marca',modelo:'Modelo '+n,versao:'Versão',ano_fabricacao:2022,ano_modelo:2023,preco:100000,quilometragem:10000,cambio:'manual',categoria:'sedan',status:n===1?'reservado':'disponivel',capa:n===2?[]:[window.fixtureImages(n)[0]]}));
  window.fetch=async(url,options)=>{
    if(!String(url).includes('/rest/v1/'))return window.nativeFetch(url,options);
    const request=new URL(url),params=request.searchParams;window.calls.push({path:request.pathname,params:Object.fromEntries(params),method:options.method});
    if(request.pathname.endsWith('/veiculo_imagens')){
      if(window.galleryDelay)await new Promise((resolve,reject)=>{const timer=setTimeout(resolve,window.galleryDelay);options.signal.addEventListener('abort',()=>{clearTimeout(timer);window.aborted++;reject(new DOMException('cancelado','AbortError'));},{once:true});});
      if(window.failGallery)throw new TypeError('falha simulada');
      const n=window.fixtureRows.findIndex(row=>'eq.'+row.id===params.get('veiculo_id'));
      return new Response(JSON.stringify(window.fixtureImages(n)),{status:200});
    }
    if(params.has('slug')){
      const row=window.fixtureRows.find(row=>'eq.'+row.slug===params.get('slug'));
      return new Response(JSON.stringify(row?[{...row,imagens:window.fixtureImages(window.fixtureRows.indexOf(row))}]:[]),{status:200});
    }
    const offset=Number(params.get('offset')||0),limit=Number(params.get('limit'));
    const rows=params.has('id')?window.fixtureRows.filter(row=>'neq.'+row.id!==params.get('id')):window.fixtureRows;
    return new Response(JSON.stringify(rows.slice(offset,offset+limit)),{status:200});
  };`;
const captures = join(tmpdir(), "vertice-captures-galerias");
await mkdir(captures, { recursive: true });
await send("Page.enable"); await send("Runtime.enable"); await send("Network.enable");
await send("Fetch.enable", { patterns: [{ urlPattern: "*/storage/v1/object/public/veiculos/testing/*" }] });
// Opcional: leituras reais da API e das fotos já cadastradas; nunca modifica dados.
if (process.env.QA_REAL === "1") {
  const { listarVeiculos, listarImagensDoVeiculo, buscarGaleriaPorSlug } = await import("../js/veiculos.js");
  const { supabaseGet, getPublicImageUrl } = await import("../js/supabase.js");
  const { veiculos } = await listarVeiculos();
  assert.ok(veiculos.length);
  const first = veiculos[0];
  const direct = await listarImagensDoVeiculo(first.id);
  const gallery = await buscarGaleriaPorSlug(first.slug);
  assert.deepEqual(direct.map(image => image.storage_path), gallery.imagens.map(image => image.storage_path));
  const metadata = await supabaseGet("veiculo_imagens", { select: "id,veiculo_id,storage_path,ordem,principal", order: "veiculo_id.asc,ordem.asc,id.asc" });
  const jpg = metadata.find(image => /\.jpe?g$/i.test(image.storage_path));
  if (jpg) {
    const response = await fetch(getPublicImageUrl(jpg.storage_path), { method: "GET", credentials: "omit" });
    assert.equal(response.status, 200);
    assert.equal(response.headers.get("content-type").split(';')[0], "image/jpeg");
    const bytes = new Uint8Array(await response.arrayBuffer());
    assert.deepEqual([...bytes.slice(0, 3)], [255, 216, 255]);
    console.log("PASS real: JPG cadastrado acessível no Storage público e conteúdo JPEG confirmado.");
  }
  await send("Emulation.setDeviceMetricsOverride", { width: 390, height: 900, deviceScaleFactor: 1, mobile: true });
  for (const path of ["index.html", "estoque.html", "explorar.html", `veiculo.html?carro=${first.slug}`]) {
    await open(path);
    if (path === "explorar.html") await ready();
    await evaluate("document.querySelector('.photo-gallery').scrollIntoView({block:'center',behavior:'instant'})");
    await wait("document.querySelector('.vehicle-card-image')?.naturalWidth>0 || document.querySelector('.vehicle-card-fallback').textContent.includes('Foto em breve')");
    if (path.startsWith('veiculo.html')) {
      assert.equal(await evaluate("document.querySelector('.photo-count').textContent"), `${direct.length ? direct.findIndex(image => image.principal) + 1 || 1 : 0} / ${direct.length}`);
    } else {
      const vehicleId = await evaluate("document.querySelector('.vehicle-card').dataset.vehicleId");
      const length = metadata.filter(image => image.veiculo_id === vehicleId).length;
      await evaluate("document.querySelector('.photo-next').click()");
      await wait("document.querySelector('.photo-count').textContent!=='Fotos' && document.querySelector('.photo-gallery').getAttribute('aria-busy')==='false'");
      assert.equal(await evaluate("Number(document.querySelector('.photo-count').textContent.split('/')[1])"), length);
    }
  }
  console.log(`PASS real: quatro páginas conectadas; consultas de galeria concordam com ${metadata.length} fotos públicas cadastradas.`);
}
const injection = await send("Page.addScriptToEvaluateOnNewDocument", { source: fixture });
try {
  for (const path of ["index.html", "estoque.html", "explorar.html", "veiculo.html?carro=fixture-0"]) {
    for (const width of [360, 390, 768, 1440]) {
      await send("Emulation.setDeviceMetricsOverride", { width, height: 900, deviceScaleFactor: 1, mobile: width < 768 });
      await open(path);
      if (path === "explorar.html") await ready();
      assert.equal(await evaluate("document.documentElement.scrollWidth<=innerWidth"), true, `${path} ${width}: largura`);
      assert.equal(await evaluate("document.querySelectorAll('h1').length"), 1);
      if (path === "explorar.html") {
        assert.equal(await evaluate("document.querySelector('.site-header, .brand, .header-contact, [data-contact-placeholder]')===null"), true, "Explorar sem header/logo/contato");
        assert.equal(await evaluate("getComputedStyle(document.querySelector('.main-nav')).position"), "fixed");
        assert.equal(await evaluate("(()=>{const feed=document.getElementById('explore-stage').getBoundingClientRect();const nav=document.querySelector('.main-nav').getBoundingClientRect();return feed.top===0 && feed.width===innerWidth && feed.bottom<=nav.top && nav.left>=16 && nav.right<=innerWidth-16 && nav.bottom<innerHeight && document.documentElement.scrollHeight<=innerHeight+1})()"), true, "feed preserva os controles acima da navegação flutuante");
        assert.equal(await evaluate("(()=>{const arrow=document.getElementById('explore-next').getBoundingClientRect();const icon=document.querySelector('#explore-next .icon').getBoundingClientRect();return arrow.width>=44 && arrow.height>=44 && icon.width<=16 && icon.height<=16})()"), true, "ícone discreto com alvo confortável");
      } else assert.equal(await evaluate("document.querySelector('[data-contact-placeholder]').disabled"), true);
      assert.equal(await evaluate("window.calls.every(call=>call.method==='GET')"), true);
      assert.equal(await evaluate("window.calls.filter(call=>call.path.endsWith('/veiculo_imagens')).length"), 0, "não consulta fotos de todos os cards");
      assert.equal(await evaluate("(()=>{const r=document.querySelector('.photo-next').getBoundingClientRect();return r.width>=44 && r.height>=44})()"), true);
      await evaluate("document.querySelector('.photo-gallery').scrollIntoView({block:'center',behavior:'instant'})");
      await wait("document.querySelector('.vehicle-card-image').naturalWidth>0");
      if (width === 390 || width === 1440) {
        const shot = await send("Page.captureScreenshot", { format: "png" });
        await writeFile(join(captures, `${path.split('.')[0]}-${width}.png`), Buffer.from(shot.data, "base64"));
      }
    }
  }
  console.log("PASS: quatro páginas em 360, 390, 768 e 1440 px; controles 44 px e consultas só GET.");

  await open("index.html");
  await evaluate("document.querySelector('.photo-gallery').focus();document.querySelector('.photo-gallery').scrollIntoView({block:'center',behavior:'instant'})");
  await key("ArrowRight"); await wait("document.querySelector('.photo-count').textContent==='2 / 3'");
  assert.equal(await evaluate("window.calls.filter(call=>call.path.endsWith('/veiculo_imagens')).length"), 1);
  await key("ArrowLeft"); await wait("document.querySelector('.photo-count').textContent==='1 / 3'");
  await key("ArrowLeft"); await wait("document.querySelector('.photo-count').textContent==='3 / 3'");
  assert.equal(await evaluate("window.calls.filter(call=>call.path.endsWith('/veiculo_imagens')).length"), 1);
  await evaluate("document.querySelector('.photo-next').click()"); await wait("document.querySelector('.photo-count').textContent==='1 / 3'");
  assert.equal(await evaluate("!!document.querySelector('a button')"), false, "sem botões dentro de links");
  console.log("PASS: Home com teclado, botões, contador, ciclo de fotos e uma única consulta por galeria.");

  await send("Emulation.setDeviceMetricsOverride", { width: 390, height: 900, deviceScaleFactor: 1, mobile: true });
  await send("Emulation.setTouchEmulationEnabled", { enabled: true });
  await open("estoque.html");
  await swipe(-110, 2); await wait("document.querySelector('.photo-count').textContent==='2 / 3'");
  assert.equal(await evaluate("location.pathname.endsWith('estoque.html')"), true);
  await swipe(110, 0); await wait("document.querySelector('.photo-count').textContent==='1 / 3'");
  await swipe(-15, 0); await pause(120);
  assert.equal(await evaluate("document.querySelector('.photo-count').textContent"), "1 / 3", "gesto curto não troca foto");
  const scrollBefore = await evaluate("scrollY");
  await swipe(0, -140); await pause(200);
  assert.ok(await evaluate("scrollY") > scrollBefore, "estoque mantém rolagem vertical nativa");
  await evaluate("document.querySelectorAll('.photo-next')[1].click()");
  await wait("document.querySelectorAll('.photo-count')[1].textContent==='1 / 1'");
  assert.equal(await evaluate("document.querySelectorAll('.photo-controls')[1].hidden"), true);
  await evaluate("document.querySelectorAll('.photo-next')[2].click()");
  await wait("document.querySelectorAll('.photo-count')[2].hidden");
  assert.equal(await evaluate("document.querySelectorAll('.vehicle-card-fallback')[2].textContent.includes('Foto em breve')"), true);
  console.log("PASS: estoque com swipe real nos dois sentidos, rolagem vertical, foto única e sem fotos.");

  await open("explorar.html"); await ready();
  const firstId = await evaluate("document.querySelector('.vehicle-card').dataset.vehicleId");
  images.length = 0;
  await swipe(-110, 3); await wait("document.querySelector('.photo-count').textContent==='2 / 3'"); await ready();
  assert.equal(await evaluate("document.querySelector('.vehicle-card').dataset.vehicleId"), firstId);
  assert.equal(await evaluate("document.documentElement.scrollHeight<=innerHeight+1"), true);
  await swipe(110, 0); await wait("document.querySelector('.photo-count').textContent==='1 / 3'");
  await swipe(0, -150); await ready(2);
  assert.notEqual(await evaluate("document.querySelector('.vehicle-card').dataset.vehicleId"), firstId);
  await swipe(0, 150); await ready();
  await evaluate("document.querySelector('.photo-gallery').focus()"); await key("ArrowRight");
  await wait("document.querySelector('.photo-count').textContent==='2 / 3'"); await ready();
  await key("ArrowDown"); await ready(2); await key("ArrowUp"); await ready();
  assert.equal(await evaluate("getComputedStyle(document.querySelector('.photo-gallery')).touchAction"), "pinch-zoom");
  const positionBefore = await evaluate("document.getElementById('explore-position').textContent");
  await evaluate("document.querySelector('.vehicle-card-link').click()");
  await wait("location.pathname.endsWith('veiculo.html') && !!document.querySelector('.photo-gallery')");
  await evaluate("history.back()"); await wait("location.pathname.endsWith('explorar.html')"); await ready();
  assert.equal(await evaluate("document.getElementById('explore-position').textContent"), positionBefore);
  const tapPoint = await evaluate("(()=>{const r=document.querySelector('.vehicle-card-image').getBoundingClientRect();return {x:r.x+r.width*0.25,y:r.y+r.height*0.4}})()");
  await send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [tapPoint] });
  await send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
  await wait("location.pathname.endsWith('veiculo.html') && !!document.querySelector('.photo-gallery')");
  await evaluate("history.back()"); await wait("location.pathname.endsWith('explorar.html')"); await ready();
  console.log("PASS: Explorar distingue foto horizontal de veículo vertical; teclado e zoom preservados.");

  await send("Emulation.setDeviceMetricsOverride", { width: 390, height: 600, deviceScaleFactor: 1, mobile: true });
  await evaluate("document.querySelector('.vehicle-card-version').textContent='Versão extensa '.repeat(150)");
  await pause(200);
  assert.equal(await evaluate("document.documentElement.scrollWidth<=innerWidth && document.documentElement.scrollHeight<=innerHeight+1"), true);
  assert.equal(await evaluate("(()=>{const body=document.querySelector('.vehicle-card-body');return body.scrollHeight>body.clientHeight && getComputedStyle(body).touchAction==='pan-y pinch-zoom'})()"), true);
  await send("Emulation.setDeviceMetricsOverride", { width: 390, height: 900, deviceScaleFactor: 1, mobile: true });

  await open("veiculo.html?carro=fixture-0");
  assert.equal(await evaluate("document.getElementById('veiculo-titulo').textContent"), "Marca Modelo 0");
  await wait("document.getElementById('similar-results').getAttribute('aria-busy')==='false'");
  assert.equal(await evaluate("window.calls.filter(call=>call.params.slug).length"), 1);
  assert.equal(await evaluate("window.calls[0].params.select.includes('descricao') && window.calls[0].params.select.includes('imagens:veiculo_imagens')"), true);
  await swipe(-110, 0); await wait("document.querySelector('.photo-count').textContent==='2 / 3'");
  await swipe(110, 0); await wait("document.querySelector('.photo-count').textContent==='1 / 3'");
  assert.equal(await evaluate("window.calls.filter(call=>call.params.slug).length"), 1);
  console.log("PASS: detalhes com swipe e uma consulta da ficha/galeria, além dos semelhantes da Etapa 6.");
  await open("veiculo.html?carro=../invalido", false);
  await wait("!!document.querySelector('#vehicle-content .state-panel-empty')");
  assert.equal(await evaluate("window.calls.length"), 0);

  await open("estoque.html");
  await evaluate("window.failGallery=true;document.querySelector('.photo-next').click()");
  await wait("!!document.querySelector('.photo-retry')");
  assert.equal(await evaluate("document.querySelector('.vehicle-card-image').src.endsWith('/0.jpg')"), true);
  await evaluate("window.failGallery=false;window.galleryDelay=400;document.querySelector('.photo-retry').click();document.querySelector('.photo-next').click();document.querySelector('.photo-next').click()");
  await wait("document.querySelector('.photo-count').textContent==='2 / 3'");
  assert.equal(await evaluate("window.calls.filter(call=>call.path.endsWith('/veiculo_imagens')).length"), 2, "concorrência não duplica retry");
  await evaluate("document.querySelector('.vehicle-card-image').dispatchEvent(new Event('error'))");
  assert.equal(await evaluate("document.querySelector('.vehicle-card-fallback').textContent.includes('Foto indisponível')"), true);
  await evaluate("document.querySelector('.photo-next').click()");
  await wait("document.querySelector('.vehicle-card-image').naturalWidth>0 && !document.querySelector('.vehicle-card-image').hidden");
  await open("estoque.html");
  await evaluate("window.galleryDelay=1000;document.querySelector('.photo-next').click();document.getElementById('stock-filters').elements.busca.value='Marca';document.getElementById('stock-filters').elements.busca.dispatchEvent(new Event('input',{bubbles:true}))");
  await wait("window.aborted===1 && !!document.querySelector('.photo-gallery')");
  assert.equal(await evaluate("!!document.querySelector('.photo-retry')"), false);
  await open("explorar.html"); await ready();
  await evaluate("window.galleryDelay=1000;document.querySelector('.photo-next').click();document.getElementById('explore-next').click()"); await ready(2);
  assert.equal(await evaluate("window.aborted"), 1, "trocar veículo cancela metadados das fotos anteriores");
  console.log("PASS: erro recuperável, capa preservada, foto quebrada, concorrência e cancelamento ao filtrar/trocar veículo.");

  const saveData = await send("Page.addScriptToEvaluateOnNewDocument", { source: "Object.defineProperty(navigator,'connection',{value:{saveData:true},configurable:true})" });
  images.length = 0;
  await open("veiculo.html?carro=fixture-0"); await wait("document.querySelector('.vehicle-card-image').naturalWidth>0"); await pause(150);
  assert.deepEqual([...new Set(images.filter(request=>request.url.includes('/car-0/')).map(request => new URL(request.url).pathname.split('/').pop()))], ["0.jpg"]);
  await evaluate("document.querySelector('.photo-next').click()"); await wait("document.querySelector('.vehicle-card-image').naturalWidth>0"); await pause(150);
  assert.equal(images.some(request => request.url.includes('/car-0/') && request.url.endsWith('/2.jpg')), false);
  await send("Page.removeScriptToEvaluateOnNewDocument", { identifier: saveData.identifier });
  images.length = 0;
  await open("veiculo.html?carro=fixture-0"); await wait("document.querySelector('.vehicle-card-image').naturalWidth>0"); await pause(150);
  assert.deepEqual([...new Set(images.filter(request=>request.url.includes('/car-0/')).map(request => new URL(request.url).pathname.split('/').pop()))].sort(), ["0.jpg", "1.jpg"]);
  assert.equal(images.some(request => Object.keys(request.headers).some(name => ["apikey", "authorization"].includes(name.toLowerCase()))), false);
  console.log("PASS: só foto atual e próxima; economia de dados carrega só atual; imagens sem credenciais.");

  await evaluate(`(async()=>{
    const {createPhotoGallery,disposePhotoGalleries}=await import('./js/components/photo-gallery.js');
    const area=document.getElementById('vehicle-photos');disposePhotoGalleries(area);
    area.replaceChildren(createPhotoGallery({name:'<img onerror="window.injected=true">',imageLink:'javascript:window.injected=true',images:[{id:'1',url:'javascript:window.injected=true'}]}));
  })()`);
  assert.equal(await evaluate("window.injected===true || !!document.querySelector('#vehicle-photos img')"), false);
  assert.equal(await evaluate("document.querySelector('.photo-gallery').getAttribute('aria-label').includes('<img')"), true);
  assert.equal(await evaluate("!!document.querySelector('#vehicle-photos a')"), false);
  await send("Emulation.setEmulatedMedia", { features: [{ name: "prefers-reduced-motion", value: "reduce" }] });
  await open("veiculo.html?carro=fixture-0"); await evaluate("document.querySelector('.photo-next').click()");
  await wait("document.querySelector('.photo-count').textContent==='2 / 3'");
  assert.ok(parseFloat(await evaluate("getComputedStyle(document.querySelector('.vehicle-card-image')).animationDuration")) <= 0.01);
  await send("Emulation.setEmulatedMedia", { features: [] });
  assert.deepEqual(exceptions, []); assert.deepEqual(badLocal, []);
  console.log("PASS: texto seguro, URL executável rejeitada, movimento reduzido e console/imports sem erros.");
  console.log(`Capturas: ${captures}`);
} finally {
  await send("Page.removeScriptToEvaluateOnNewDocument", { identifier: injection.identifier });
  await send("Fetch.disable");
  ws.close();
}
