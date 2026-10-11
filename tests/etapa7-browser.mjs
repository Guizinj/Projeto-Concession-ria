// QA opcional: Live Server :5500, Chrome isolado :9340 (QA_PORT permite outra porta).
// WhatsApp é inspecionado sem abrir conversa. Compartilhamento nativo usa doubles;
// não envia mensagens. QA_REAL=1 acrescenta somente GETs dos anúncios reais.
import assert from "node:assert/strict";
import { readFile, mkdir, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

const port = process.env.QA_PORT || "9340";
const tabs = await (await fetch(`http://127.0.0.1:${port}/json/list`)).json();
const ws = new WebSocket(tabs.find(tab => tab.type === "page").webSocketDebuggerUrl);
await new Promise(resolve => ws.addEventListener("open", resolve, { once: true }));
let id = 0;
const pending = new Map(), errors = [], badLocal = [], requests = [];
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
  if (msg.method === "Network.requestWillBeSent") requests.push(msg.params.request);
  if (msg.method === "Fetch.requestPaused") await send("Fetch.fulfillRequest", { requestId: msg.params.requestId, responseCode: 200,
    responseHeaders: [{ name: "Content-Type", value: "image/png" }], body: png });
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
async function open(path = "veiculo.html?carro=fixture-available&tracking=descartar#fotos") {
  await evaluate("window.__qaOldDocument=true");
  const navigation = await send("Page.navigate", { url: `http://127.0.0.1:5500/${path}` });
  if (!navigation.loaderId) await send("Page.reload", { ignoreCache: true });
  await wait("!window.__qaOldDocument && document.readyState==='complete' && document.getElementById('vehicle-content')?.getAttribute('aria-busy')!=='true'");
  if (path.startsWith("veiculo.html")) await wait("document.getElementById('vehicle-content').getAttribute('aria-busy')==='false'");
}
async function click(selector) {
  if ([".vehicle-share-action", ".vehicle-copy-action"].includes(selector)
    && await evaluate("document.querySelector('.vehicle-share-actions').hidden")) await click(".vehicle-share-toggle");
  await evaluate(`document.querySelector(${JSON.stringify(selector)}).scrollIntoView({block:'center',behavior:'instant'})`);
  const point = await evaluate(`(()=>{const r=document.querySelector(${JSON.stringify(selector)}).getBoundingClientRect();return {x:r.x+r.width/2,y:r.y+r.height/2}})()`);
  await send("Input.dispatchMouseEvent", { type: "mousePressed", button: "left", clickCount: 1, ...point });
  await send("Input.dispatchMouseEvent", { type: "mouseReleased", button: "left", clickCount: 1, ...point });
}
async function capture(name) {
  const shot = await send("Page.captureScreenshot", { format: "png" });
  await writeFile(join(captures, `${name}.png`), Buffer.from(shot.data, "base64"));
}
const captures = join(tmpdir(), "vertice-captures-etapa7"); await mkdir(captures, { recursive: true });
await send("Page.enable"); await send("Runtime.enable"); await send("Network.enable");

const fixture = `
 window.calls=[];window.nativeFetch=window.fetch;
 window.shareCalls=[];window.copyCalls=[];window.shareOutcome='success';window.copyOutcome='success';window.actionDelay=0;
 const mode=new URLSearchParams(location.search).get('qa');
 Object.defineProperty(navigator,'share',{configurable:true,value:mode==='no-share'?undefined:async data=>{
   window.shareCalls.push({...data,activated:navigator.userActivation.isActive});
   if(window.actionDelay)await new Promise(resolve=>setTimeout(resolve,window.actionDelay));
   if(window.shareOutcome!=='success')throw new DOMException('simulado',window.shareOutcome==='cancel'?'AbortError':'NotAllowedError');
 }});
 Object.defineProperty(navigator,'canShare',{configurable:true,value:()=>mode!=='cannot-share'});
 Object.defineProperty(navigator,'clipboard',{configurable:true,value:mode==='no-clipboard'?undefined:{writeText:async value=>{
   window.copyCalls.push(value);
   if(window.actionDelay)await new Promise(resolve=>setTimeout(resolve,window.actionDelay));
   if(window.copyOutcome==='failure')throw new DOMException('simulado','NotAllowedError');
 }}});
 window.fetch=async(url,options)=>{
   if(!String(url).includes('/rest/v1/'))return window.nativeFetch(url,options);
   const params=new URL(url).searchParams;window.calls.push({method:options.method,params:Object.fromEntries(params)});
   if(!params.has('slug'))return new Response('[]',{status:200});
   const slug=params.get('slug').slice(3);
   if(['fixture-missing','fixture-hidden'].includes(slug))return new Response('[]',{status:200});
   if(slug==='fixture-failure')throw new TypeError('falha simulada');
   const vehicle={id:'11111111-1111-4111-8111-111111111111',slug,codigo:'001',marca:'Honda',modelo:'Civic',versao:'Touring',ano_fabricacao:2020,ano_modelo:2021,preco:142900,quilometragem:42000,cambio:'cvt',categoria:'sedan',status:slug==='fixture-reserved'?'reservado':slug==='fixture-sold'?'vendido':'disponivel',imagens:[{id:'photo-1',storage_path:'testing/actions/civic.jpg',ordem:0,principal:true}]};
   if(slug==='fixture-hostile'){vehicle.marca='<img src=x onerror="window.injected=true">';vehicle.modelo='CIVIC'.repeat(100);vehicle.codigo='001 & ?text=evil#hash';}
   return new Response(JSON.stringify([vehicle]),{status:200});
 };`;
await send("Fetch.enable", { patterns: [{ urlPattern: "*/storage/v1/object/public/veiculos/testing/*" }] });
const injection = await send("Page.addScriptToEvaluateOnNewDocument", { source: fixture });
try {
  for (const [slug, status, label, message] of [
    ["fixture-available", "disponivel", "Falar no WhatsApp", "Ele ainda está disponível?"],
    ["fixture-reserved", "reservado", "Consultar reserva", "está reservado"],
    ["fixture-sold", "vendido", "Consultar outras opções", "foi vendido"],
  ]) {
    for (const width of [360,390,768,1440]) {
      await send("Emulation.setDeviceMetricsOverride", { width, height: 900, deviceScaleFactor: 1, mobile: width < 768 });
      await open(`veiculo.html?carro=${slug}&tracking=descartar#fotos`);
      assert.equal(await evaluate("document.documentElement.scrollWidth<=innerWidth"), true);
      assert.equal(await evaluate("document.querySelector('.vehicle-whatsapp-action').textContent"), label);
      const link = new URL(await evaluate("document.querySelector('.vehicle-whatsapp-action').href"));
      assert.equal(link.origin, "https://wa.me"); assert.equal(link.pathname, "/5581993369736");
      const text = link.searchParams.get("text");
      assert.ok(text.includes("Honda Civic Touring — 2020/2021 (código 001)")); assert.ok(text.includes(message));
      assert.ok(text.endsWith(`http://127.0.0.1:5500/veiculo.html?carro=${slug}`));
      assert.equal(text.includes("tracking"), false);
      assert.equal(await evaluate("document.querySelector('.vehicle-whatsapp-action').rel"), "noopener noreferrer");
      assert.equal(await evaluate("!!document.querySelector('.vehicle-status-notice')"), status !== "disponivel");
      assert.equal(await evaluate("[...document.querySelectorAll('[data-contact-link],.site-menu-contact')].every(link=>link.href===document.querySelector('.vehicle-whatsapp-action').href)"), true);
      assert.equal(await evaluate("document.querySelector('[data-contact-placeholder]').hidden"), true);
      assert.equal(await evaluate("[...document.querySelectorAll('.vehicle-actions a,.vehicle-actions button')].filter(el=>el.getClientRects().length).every(el=>el.getBoundingClientRect().height>=44)"), true);
      assert.equal(await evaluate("document.querySelector('.vehicle-share-actions').hidden && document.querySelector('.vehicle-share-toggle').getAttribute('aria-expanded')==='false'"), true);
      assert.equal(await evaluate("document.querySelector('.vehicle-action-feedback').getAttribute('role')"), "status");
      await evaluate("document.querySelector('.vehicle-actions').scrollIntoView({block:'center',behavior:'instant'})");
      if (width === 390 || width === 1440) await capture(`${status}-${width}`);
    }
  }
  console.log("PASS: contato oficial, mensagem/status/código/link em quatro larguras, avisos e alvos de toque.");

  await send("Emulation.setDeviceMetricsOverride", { width: 390, height: 900, deviceScaleFactor: 1, mobile: true });
  await open();
  await click(".vehicle-share-action"); await wait("document.querySelector('.vehicle-action-feedback').textContent==='Link compartilhado.'");
  assert.equal(await evaluate("window.shareCalls[0].activated"), true);
  assert.equal(await evaluate("window.shareCalls[0].url"), "http://127.0.0.1:5500/veiculo.html?carro=fixture-available");
  assert.equal(await evaluate("window.copyCalls.length"), 0);
  for (const outcome of ["cancel", "failure"]) {
    await evaluate(`window.shareOutcome=${JSON.stringify(outcome)}`); await click(".vehicle-share-action");
    await wait(`document.querySelector('.vehicle-action-feedback').textContent.includes(${JSON.stringify(outcome === "cancel" ? "cancelado" : "Copiar link")})`);
    assert.equal(await evaluate("window.copyCalls.length"), 0, "compartilhamento não copia sem pedido");
    assert.equal(await evaluate("document.querySelector('.vehicle-copy-fallback').hidden"), true);
  }
  await evaluate("window.shareOutcome='success';window.actionDelay=350;window.before=window.shareCalls.length;const button=document.querySelector('.vehicle-share-action');button.focus();button.click();button.click();document.querySelector('.vehicle-copy-action').click()");
  await wait("!document.querySelector('.vehicle-share-action').disabled");
  assert.equal(await evaluate("window.shareCalls.length-window.before"), 1);
  assert.equal(await evaluate("window.copyCalls.length"), 0);
  assert.equal(await evaluate("document.activeElement.classList.contains('vehicle-share-toggle') && document.querySelector('.vehicle-share-actions').hidden"), true);
  await evaluate("window.actionDelay=0");
  console.log("PASS: compartilhamento por clique, payload correto, cancelamento/erro e proteção contra concorrência.");

  await click(".vehicle-copy-action"); await wait("document.querySelector('.vehicle-action-feedback').textContent==='Link copiado!'");
  await pause(2100); await click(".vehicle-copy-action"); await pause(1100);
  assert.equal(await evaluate("document.querySelector('.vehicle-action-feedback').textContent"), "Link copiado!", "uma nova ação reinicia o prazo");
  await wait("document.querySelector('.vehicle-action-feedback').textContent===''");
  await click(".vehicle-share-action"); await wait("document.querySelector('.vehicle-action-feedback').textContent==='Link compartilhado.'");
  await wait("document.querySelector('.vehicle-action-feedback').textContent===''");
  assert.equal(await evaluate("document.querySelector('.vehicle-action-feedback').getBoundingClientRect().height"), 0);
  await evaluate("window.copyCalls=[]");
  console.log("PASS: confirmações somem após 3 s, nova ação reinicia o prazo e não sobra espaço vazio.");

  await click(".vehicle-copy-action"); await wait("document.querySelector('.vehicle-action-feedback').textContent==='Link copiado!'");
  assert.equal(await evaluate("window.copyCalls[0]"), "http://127.0.0.1:5500/veiculo.html?carro=fixture-available");
  await evaluate("window.copyOutcome='failure'"); await click(".vehicle-copy-action");
  await wait("!document.querySelector('.vehicle-copy-fallback').hidden");
  assert.equal(await evaluate("document.activeElement===document.querySelector('.vehicle-share-link')"), true);
  assert.equal(await evaluate("document.activeElement.selectionEnd-document.activeElement.selectionStart===document.activeElement.value.length"), true);
  await evaluate("window.copyOutcome='success'"); await click(".vehicle-copy-action");
  await wait("document.querySelector('.vehicle-copy-fallback').hidden && document.querySelector('.vehicle-action-feedback').textContent==='Link copiado!'");
  for (const mode of ["no-share", "cannot-share", "no-clipboard"]) {
    await open(`veiculo.html?carro=fixture-available&qa=${mode}`);
    if (mode !== "no-clipboard") assert.equal(await evaluate("document.querySelector('.vehicle-share-action').hidden"), true);
    await click(".vehicle-copy-action");
    await wait(mode === "no-clipboard" ? "!document.querySelector('.vehicle-copy-fallback').hidden" : "document.querySelector('.vehicle-action-feedback').textContent==='Link copiado!'");
  }
  console.log("PASS: copiar link, permissão negada, seleção manual, retomada e navegador sem APIs.");

  await open();
  await evaluate("delete navigator.clipboard");
  await click(".vehicle-copy-action");
  await wait("document.querySelector('.vehicle-action-feedback').textContent==='Link copiado!'");
  console.log("PASS: Clipboard API real do Chrome executada por clique explícito.");

  await open(); await click(".vehicle-share-toggle"); await evaluate("document.querySelector('.vehicle-copy-action').focus()");
  await send("Input.dispatchKeyEvent", { type: "keyDown", key: "Enter", code: "Enter", windowsVirtualKeyCode: 13, nativeVirtualKeyCode: 13, text: "\r" });
  await send("Input.dispatchKeyEvent", { type: "keyUp", key: "Enter", code: "Enter", windowsVirtualKeyCode: 13, nativeVirtualKeyCode: 13 });
  await wait("document.querySelector('.vehicle-action-feedback').textContent==='Link copiado!'");
  await evaluate("window.actionDelay=350;document.querySelector('.vehicle-share-action').click();window.dispatchEvent(new PageTransitionEvent('pagehide',{persisted:true}))");
  await pause(450);
  assert.equal(await evaluate("document.querySelector('.vehicle-action-feedback').textContent"), "");
  await evaluate("window.dispatchEvent(new PageTransitionEvent('pageshow',{persisted:true}))");
  await wait("!document.querySelector('.vehicle-share-action').disabled && document.getElementById('vehicle-content').getAttribute('aria-busy')==='false'");
  await click(".vehicle-copy-action"); await wait("document.querySelector('.vehicle-action-feedback').textContent==='Link copiado!'");
  for (const slug of ["", "../invalido", "fixture-hidden", "fixture-missing", "fixture-failure"]) {
    await open(`veiculo.html?carro=${encodeURIComponent(slug)}`);
    assert.equal(await evaluate("document.querySelector('.vehicle-actions')===null"), true);
  }
  await open("veiculo.html?carro=fixture-hostile");
  assert.equal(await evaluate("document.documentElement.scrollWidth<=innerWidth"), true);
  assert.equal(await evaluate("!!window.injected || !!document.querySelector('.vehicle-summary img')"), false);
  assert.equal(new URL(await evaluate("document.querySelector('.vehicle-whatsapp-action').href")).searchParams.size, 1);
  console.log("PASS: teclado, saída/retorno sem resultado tardio, anúncio ausente/oculto, erro e texto malicioso.");

  for (const path of ["index.html", "estoque.html", "explorar.html"]) {
    await open(path);
    if (path === "explorar.html") assert.equal(await evaluate("document.querySelector('.site-header,.header-contact,[data-contact-link]')===null"), true);
    else assert.equal(await evaluate("[...document.querySelectorAll('[data-contact-link],.site-menu-contact')].every(link=>{const u=new URL(link.href);return !link.hidden&&u.origin==='https://wa.me'&&u.pathname==='/5581993369736'&&!!u.searchParams.get('text')})"), true);
  }
  assert.equal(await evaluate("[...document.querySelectorAll('[data-instagram-link]')].every(link=>link.hidden)"), true);
  assert.equal(await evaluate("window.calls.every(call=>call.method==='GET')"), true);
  console.log("PASS: contato genérico na Home/estoque, Explorar sem header e contatos pendentes ocultos.");
} finally {
  await send("Page.removeScriptToEvaluateOnNewDocument", { identifier: injection.identifier });
  await send("Fetch.disable");
}

if (process.env.QA_REAL === "1") {
  const { supabaseGet } = await import("../js/supabase.js");
  const vehicles = await supabaseGet("veiculos", { select: "slug,status", publicado: "eq.true", order: "created_at.desc,id.asc", limit: "50" });
  for (const status of ["disponivel", "reservado", "vendido"]) {
    const vehicle = vehicles.find(item => item.status === status);
    if (!vehicle) continue;
    await open(`veiculo.html?carro=${vehicle.slug}&tracking=descartar`);
    assert.ok(new URL(await evaluate("document.querySelector('.vehicle-whatsapp-action').href")).searchParams.get("text").endsWith(`http://127.0.0.1:5500/veiculo.html?carro=${vehicle.slug}`));
    assert.equal(await evaluate("!!document.querySelector('.vehicle-status-notice')"), status !== "disponivel");
    await evaluate("document.querySelector('.vehicle-actions').scrollIntoView({block:'center',behavior:'instant'})"); await capture(`real-${status}-390`);
  }
  console.log("PASS real: anúncios e links individuais nos três status; nenhuma escrita ou abertura do WhatsApp.");
}
assert.equal(requests.filter(request => request.url.includes("/rest/v1/") && request.method !== "OPTIONS").every(request => request.method === "GET"), true);
assert.equal(requests.some(request => request.url.startsWith("https://wa.me/")), false);
assert.deepEqual(errors, []); assert.deepEqual(badLocal, []);
console.log("PASS: sem erros de console/imports, sem mensagem enviada; capturas:", captures);
await send("Page.navigate", { url: "http://127.0.0.1:5500/veiculo.html?carro=demo-corolla-xei-2022-001" });
ws.close();
