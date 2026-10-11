// QA opcional: Live Server :5500 e Chrome isolado com depuração local :9336.
// Registro da revisão vertical anterior à galeria. QA atual: galeria-browser.mjs.
// Somente leitura; fixtures e falhas são simuladas na memória do navegador.
import assert from "node:assert/strict";
import { readFile, mkdir, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

const tabs = await (await fetch("http://127.0.0.1:9336/json/list")).json();
const ws = new WebSocket(tabs.find(t => t.type === "page").webSocketDebuggerUrl);
await new Promise(resolve => ws.addEventListener("open", resolve, { once: true }));
let id = 0;
const pending = new Map(), exceptions = [], consoleErrors = [], badLocal = [], imageRequests = [], dataRequests = [];
const fixturePng = (await readFile(new URL("../assets/images/demo/capa.png", import.meta.url))).toString("base64");
ws.addEventListener("message", async event => {
  const msg = JSON.parse(event.data);
  if (msg.id) {
    const pair = pending.get(msg.id); pending.delete(msg.id);
    if (msg.error) pair.reject(new Error(msg.error.message)); else pair.resolve(msg.result);
  }
  if (msg.method === "Runtime.exceptionThrown") exceptions.push(msg.params.exceptionDetails.text);
  if (msg.method === "Runtime.consoleAPICalled" && msg.params.type === "error") consoleErrors.push(msg.params.args.map(a => a.value || a.description).join(" "));
  if (msg.method === "Network.responseReceived" && msg.params.response.url.startsWith("http://127.0.0.1:5500/") && msg.params.response.status >= 400) badLocal.push(msg.params.response.status);
  if (msg.method === "Network.requestWillBeSent") {
    const request = msg.params.request;
    if (request.url.includes("/rest/v1/") && request.method !== "OPTIONS") dataRequests.push({ url: new URL(request.url), method: request.method });
    if (request.url.includes("/storage/v1/")) imageRequests.push({ url: new URL(request.url), headers: request.headers });
  }
  if (msg.method === "Fetch.requestPaused") {
    await send("Fetch.fulfillRequest", { requestId: msg.params.requestId, responseCode: 200, responseHeaders: [{ name: "Content-Type", value: "image/png" }, { name: "Cache-Control", value: "public, max-age=3600" }], body: fixturePng });
  }
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
  for (let i = 0; i < 100; i++) { if (await evaluate(expression)) return; await pause(120); }
  throw new Error(`Timeout: ${expression}`);
}
async function open(path = "explorar.html") {
  await evaluate("window.__qaOldDocument=true");
  await send("Page.navigate", { url: `http://127.0.0.1:5500/${path}` });
  await wait(`!window.__qaOldDocument && document.readyState==='complete' && location.pathname.endsWith('${path.split('?')[0]}')`);
}
async function ready(index = 1) {
  await wait(`document.getElementById('explore-position').textContent.startsWith('Veículo ${index} ·') && document.getElementById('explore-stage').getAttribute('aria-busy')==='false' && document.getElementById('explore-stage').dataset.transitioning!=='true'`);
}
async function clickNext() { await evaluate("document.getElementById('explore-next').click()"); }
async function key(value) {
  await send("Input.dispatchKeyEvent", { type: "keyDown", key: value, code: value });
  await send("Input.dispatchKeyEvent", { type: "keyUp", key: value, code: value });
}
async function swipe(dx, dy = 0) {
  const rect = await evaluate("(()=>{const r=document.querySelector('.vehicle-card-media').getBoundingClientRect();return {x:r.x+r.width/2,y:r.y+r.height*0.4}})()");
  await send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [{ x: rect.x, y: rect.y }] });
  for (let i = 1; i <= 5; i++) await send("Input.dispatchTouchEvent", { type: "touchMove", touchPoints: [{ x: rect.x+dx*i/5, y: rect.y+dy*i/5 }] });
  await send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
}
await send("Page.enable"); await send("Runtime.enable"); await send("Network.enable");
const captures = join(tmpdir(), "vertice-captures-explorar-feed"); await mkdir(captures, { recursive: true });
const injections = [];
try {
  await open(); await ready();
  assert.equal(await evaluate("document.querySelectorAll('.vehicle-card').length"), 1);
  assert.equal(dataRequests.length, 1, JSON.stringify(dataRequests.map(r => r.url.searchParams.get("offset"))));
  assert.equal(dataRequests[0].url.searchParams.get("limit"), "5");
  assert.equal(dataRequests[0].method, "GET");
  assert.equal(dataRequests[0].url.searchParams.get("capa.limit"), "1");
  for (const width of [360, 390, 768, 1440]) {
    await send("Emulation.setDeviceMetricsOverride", { width, height: 900, deviceScaleFactor: 1, mobile: width < 768 });
    assert.equal(await evaluate("document.documentElement.scrollWidth <= innerWidth"), true);
    assert.equal(await evaluate("document.querySelectorAll('h1').length"), 1);
    assert.equal(await evaluate("document.querySelector('[data-contact-placeholder]').disabled"), true);
    assert.equal(await evaluate("getComputedStyle(document.querySelector('.main-nav')).position"), width < 768 ? "fixed" : "static");
    assert.equal(await evaluate("document.documentElement.scrollHeight<=innerHeight+1"), true, "feed cabe na altura disponível");
    assert.equal(await evaluate("(()=>{const r=document.getElementById('explore-next').getBoundingClientRect();return r.height>=44 && r.top>=0 && r.bottom<=innerHeight})()"), true);
    await wait("document.querySelector('.vehicle-card-image').naturalWidth===1200");
    const shot = await send("Page.captureScreenshot", { format: "png" });
    await writeFile(join(captures, `explorar-${width}.png`), Buffer.from(shot.data, "base64"));
  }
  console.log("PASS: consultas reais limitadas, card único e quatro larguras.");
  const seen = [await evaluate("document.querySelector('.vehicle-card').dataset.vehicleId")];
  for (let index = 2; index <= 14; index++) {
    await clickNext(); await ready(index);
    seen.push(await evaluate("document.querySelector('.vehicle-card').dataset.vehicleId"));
    if (index === 2) assert.equal(await evaluate("!!document.querySelector('.status-reservado')"), true);
  }
  assert.equal(new Set(seen).size, 14);
  assert.deepEqual(dataRequests.map(r => r.url.searchParams.get("offset")), ["0", "4", "8", "12"]);
  assert.equal(await evaluate("document.getElementById('explore-next').textContent.trim()"), "Concluir seleção");
  await clickNext(); await wait("document.getElementById('explore-position').textContent.includes('14 veículos apresentados')");
  assert.equal(await evaluate("document.querySelector('.vehicle-card')===null"), true);
  await evaluate("document.getElementById('explore-previous').click()"); await ready(14);
  assert.equal(dataRequests.length, 4);
  await clickNext(); await evaluate("document.querySelector('#explore-vehicle button').click()"); await ready();
  console.log("PASS: 14 veículos reais sem vendido/rascunho; lotes 4/4/4/2; fim, anterior e reinício.");

  await send("Emulation.setDeviceMetricsOverride", { width: 390, height: 900, deviceScaleFactor: 1, mobile: true });
  await send("Emulation.setTouchEmulationEnabled", { enabled: true });
  await evaluate("window.scrollTo(0,0)"); await swipe(0,-120); await ready(2);
  assert.equal(await evaluate("location.pathname.endsWith('explorar.html')"), true);
  await swipe(0,120); await ready();
  await swipe(-100,3); await pause(200);
  await ready();
  assert.equal(await evaluate("window.scrollY"), 0, "feed ocupa a tela sem rolar o documento");
  await evaluate("document.getElementById('explore-stage').focus()"); await key("ArrowDown"); await ready(2);
  await key("ArrowUp"); await ready();
  assert.equal(await evaluate("getComputedStyle(document.querySelector('.vehicle-card-media')).touchAction"), "pan-x pinch-zoom");
  // Toque simples continua abrindo o detalhe.
  await evaluate("window.scrollTo(0,0)");
  const rect = await evaluate("(()=>{const r=document.querySelector('.vehicle-card-media').getBoundingClientRect();return {x:r.x+50,y:r.y+50}})()");
  await send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [rect] });
  await send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
  await wait("location.pathname.endsWith('veiculo.html')");
  await evaluate("history.back()"); await wait("location.pathname.endsWith('explorar.html')"); await ready();
  await evaluate("document.getElementById('explore-stage').focus()"); await key("ArrowDown"); await ready(2);
  await evaluate("document.querySelector('.vehicle-card-link').click()");
  await wait("location.pathname.endsWith('veiculo.html')");
  await evaluate("history.back()"); await wait("location.pathname.endsWith('explorar.html')"); await ready(2);
  console.log("PASS: swipe vertical real, gesto horizontal ignorado, teclado, toque no detalhe e retorno.");

  await evaluate("document.getElementById('explore-stage').focus()"); await key("ArrowUp"); await ready();
  const wheelPoint = await evaluate("(()=>{const r=document.querySelector('.vehicle-card-media').getBoundingClientRect();return {x:r.x+50,y:r.y+150}})()");
  await send("Input.dispatchMouseEvent", { type: "mouseWheel", ...wheelPoint, deltaY: 120, deltaX: 0 });
  await ready(2);
  await pause(200);
  await send("Input.dispatchMouseEvent", { type: "mouseWheel", ...wheelPoint, deltaY: -120, deltaX: 0 });
  await ready();
  console.log("PASS: roda do mouse avança/volta no feed e controles cabem na tela.");

  // Fixtures com fotos distintas permitem observar exatamente quais fotos são pedidas.
  await send("Fetch.enable", { patterns: [{ urlPattern: "*/storage/v1/object/public/veiculos/testing/*" }] });
  const fixture = await send("Page.addScriptToEvaluateOnNewDocument", { source: `
    window.nativeFetch=window.fetch;window.calls=[];window.failOffset=null;window.delay=0;window.empty=false;
    window.fetch=async(url,options)=>{
      if(!String(url).includes('/rest/v1/'))return window.nativeFetch(url,options);
      const params=new URL(url).searchParams;const offset=Number(params.get('offset'));window.calls.push(offset);
      if(window.delay)await new Promise((resolve,reject)=>{const timer=setTimeout(resolve,window.delay);options.signal.addEventListener('abort',()=>{clearTimeout(timer);reject(new DOMException('cancelado','AbortError'));},{once:true});});
      if(window.failOffset===offset)throw new TypeError('falha simulada');
      const rows=window.empty?[]:Array.from({length:Math.min(5,6-offset)},(_,i)=>({id:String(offset+i),slug:'fixture-'+(offset+i),marca:'Marca',modelo:'Modelo '+(offset+i),versao:'Versão',ano_fabricacao:2022,ano_modelo:2023,preco:100000,quilometragem:10000,cambio:'manual',status:offset+i===1?'reservado':'disponivel',capa:[{storage_path:'testing/'+(offset+i)+'.png'}]}));
      return new Response(JSON.stringify(rows),{status:200});
    };` }); injections.push(fixture.identifier);
  imageRequests.length = 0;
  await open(); await ready(); await pause(250);
  assert.deepEqual([...new Set(imageRequests.map(r => r.url.pathname.split('/').pop()))].sort(), ["0.png", "1.png"]);
  assert.equal(imageRequests.some(r => Object.keys(r.headers).some(h => h.toLowerCase() === "apikey" || h.toLowerCase() === "authorization")), false);
  await clickNext(); await ready(2); await pause(150);
  assert.equal(imageRequests.some(r => r.url.pathname.endsWith("/2.png")), true);
  assert.equal(imageRequests.some(r => r.url.pathname.endsWith("/3.png")), false);
  await clickNext(); await ready(3); await clickNext(); await ready(4);
  await evaluate("window.failOffset=4;document.getElementById('explore-next').click()");
  await wait("!!document.querySelector('#explore-feedback .state-panel-error')");
  assert.equal(await evaluate("document.getElementById('explore-position').textContent.startsWith('Veículo 4')"), true);
  await evaluate("window.failOffset=null;window.delay=500;document.querySelector('#explore-feedback button').click();document.getElementById('explore-next').click();document.getElementById('explore-next').click()");
  await wait("document.getElementById('explore-next').disabled"); await ready(5);
  assert.deepEqual(await evaluate("window.calls"), [0, 4, 4]);
  assert.equal(await evaluate("document.querySelectorAll('.vehicle-card').length"), 1);
  console.log("PASS: só foto atual/próxima, nenhum header de credencial nas fotos, retry e cliques concorrentes.");

  await open(); await ready();
  await evaluate("window.failOffset=0");
  for (let index = 2; index <= 6; index++) { await clickNext(); await ready(index); }
  await clickNext();
  await wait("document.getElementById('explore-position').textContent.includes('6 veículos apresentados')");
  await evaluate("document.querySelector('#explore-vehicle button').click()");
  await wait("!!document.querySelector('#explore-vehicle .state-panel-error')");
  await evaluate("window.failOffset=null;document.querySelector('#explore-vehicle button').click()"); await ready();
  await evaluate("window.empty=true");
  for (let index = 2; index <= 4; index++) { await clickNext(); await ready(index); }
  await clickNext();
  await wait("!!document.querySelector('#explore-vehicle .state-panel-empty')");
  await evaluate("document.querySelector('#explore-vehicle button').click()");
  await wait("document.querySelector('#explore-vehicle .state-panel-empty h2').textContent==='Novas opções em breve'");
  await evaluate("window.empty=false;document.querySelector('#explore-vehicle button').click()"); await ready();
  await evaluate("document.querySelector('.vehicle-card-image').dispatchEvent(new Event('error'))");
  assert.match(await evaluate("document.querySelector('.vehicle-card-media').textContent"), /Foto indisponível/);
  console.log("PASS: erro inicial, vazio, atualizar seleção e fallback de imagem.");

  await open(); await ready();
  for (let index = 2; index <= 4; index++) { await clickNext(); await ready(index); }
  await evaluate("window.delay=3000;document.getElementById('explore-next').click()");
  await wait("document.getElementById('explore-stage').getAttribute('aria-busy')==='true'");
  await evaluate("window.dispatchEvent(new PageTransitionEvent('pagehide'));window.delay=0;window.dispatchEvent(new PageTransitionEvent('pageshow',{persisted:true}))");
  await ready(4);
  await clickNext(); await ready(5);
  assert.equal(await evaluate("!!document.querySelector('.state-panel-error')"), false);
  assert.deepEqual(await evaluate("window.calls"), [0, 4, 4]);
  console.log("PASS: consulta cancelada ao sair, retorno sem erro e nova consulta no mesmo offset.");

  const saveData = await send("Page.addScriptToEvaluateOnNewDocument", { source: "Object.defineProperty(navigator,'connection',{value:{saveData:true},configurable:true});" }); injections.push(saveData.identifier);
  await send("Network.setCacheDisabled", { cacheDisabled: true });
  imageRequests.length = 0;
  await open(); await ready(); await pause(200);
  assert.deepEqual([...new Set(imageRequests.map(r => r.url.pathname.split('/').pop()))], ["0.png"]);
  await send("Page.removeScriptToEvaluateOnNewDocument", { identifier: saveData.identifier }); injections.pop();
  await send("Network.setCacheDisabled", { cacheDisabled: false });
  console.log("PASS: economia de dados desativa a antecipação de fotos.");
  await send("Page.removeScriptToEvaluateOnNewDocument", { identifier: fixture.identifier }); injections.pop();

  const hostile = await send("Page.addScriptToEvaluateOnNewDocument", { source: `window.fetch=async()=>new Response(JSON.stringify([{id:'x',slug:'javascript:alert(1)',marca:'<img src=x onerror=alert(1)>',modelo:'Seguro',versao:'<script>alert(1)</script>',status:'reservado',capa:[{storage_path:'javascript:alert(1)'}]}]),{status:200});` }); injections.push(hostile.identifier);
  await open(); await ready();
  assert.equal(await evaluate("document.querySelectorAll('.vehicle-card img, .vehicle-card script, .vehicle-card a').length"), 0);
  assert.match(await evaluate("document.querySelector('.vehicle-card-title').textContent"), /<img/);
  assert.equal(await evaluate("document.querySelector('.vehicle-card-fallback p').textContent"), "Foto em breve");
  await send("Page.removeScriptToEvaluateOnNewDocument", { identifier: hostile.identifier }); injections.pop();
  const longText = await send("Page.addScriptToEvaluateOnNewDocument", { source: `window.fetch=async()=>new Response(JSON.stringify([{id:'longo',slug:'teste-longo',marca:'Marca',modelo:'Modelo com nome extenso '.repeat(20),versao:'Uma versão detalhada '.repeat(30),status:'reservado',capa:[]}]),{status:200});` }); injections.push(longText.identifier);
  await send("Emulation.setDeviceMetricsOverride", { width: 390, height: 600, deviceScaleFactor: 1, mobile: true });
  await open(); await ready();
  await wait("document.querySelector('.vehicle-card-body').style.touchAction==='pan-y pinch-zoom'");
  assert.equal(await evaluate("document.documentElement.scrollWidth<=innerWidth"), true);
  const longBody = await evaluate("(()=>{const r=document.querySelector('.vehicle-card-body').getBoundingClientRect();return {x:r.x+60,y:r.y+80}})()");
  await send("Input.dispatchMouseEvent", { type: "mouseWheel", ...longBody, deltaY: 150, deltaX: 0 });
  await wait("document.querySelector('.vehicle-card-body').scrollTop>0");
  assert.equal(await evaluate("document.querySelectorAll('.vehicle-card').length"), 1);
  await send("Page.removeScriptToEvaluateOnNewDocument", { identifier: longText.identifier }); injections.pop();
  console.log("PASS: textos extensos em tela baixa permanecem legíveis com rolagem própria.");
  await send("Emulation.setEmulatedMedia", { features: [{ name: "prefers-reduced-motion", value: "reduce" }] });
  await open(); await ready();
  assert.equal(await evaluate("getComputedStyle(document.querySelector('.vehicle-card')).transitionDuration"), "0s");
  await send("Emulation.setScriptExecutionDisabled", { value: true });
  await open();
  assert.equal(await evaluate("getComputedStyle(document.querySelector('noscript')).display!=='none'"), true);
  assert.equal(await evaluate("document.querySelectorAll('.main-nav a[href]').length"), 3);
  await send("Emulation.setScriptExecutionDisabled", { value: false });
  assert.deepEqual(exceptions, []); assert.deepEqual(consoleErrors, []); assert.deepEqual(badLocal, []);
  console.log("PASS: dados hostis como texto, URLs inválidas bloqueadas, movimento reduzido, sem JS e sem erros de console/import.");
} finally {
  for (const identifier of injections) await send("Page.removeScriptToEvaluateOnNewDocument", { identifier });
  ws.close();
}
