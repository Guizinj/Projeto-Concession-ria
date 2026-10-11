// QA opcional: Live Server :5500 e Chrome isolado :9340 (QA_PORT substitui a porta).
// O submit é capturado antes da navegação: nenhuma conversa/mensagem é enviada.
import assert from "node:assert/strict";
import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";

const port = process.env.QA_PORT || "9340";
const tabs = await (await fetch(`http://127.0.0.1:${port}/json/list`)).json();
const ws = new WebSocket(tabs.find(tab => tab.type === "page").webSocketDebuggerUrl);
await new Promise(resolve => ws.addEventListener("open", resolve, { once: true }));
let id = 0;
const pending = new Map(), errors = [], badLocal = [], requests = [];
ws.addEventListener("message", event => {
  const message = JSON.parse(event.data);
  if (message.id) {
    const pair = pending.get(message.id); pending.delete(message.id);
    if (message.error) pair.reject(new Error(message.error.message)); else pair.resolve(message.result);
  }
  if (message.method === "Runtime.exceptionThrown") errors.push(message.params.exceptionDetails.text);
  if (message.method === "Runtime.consoleAPICalled" && message.params.type === "error")
    errors.push(message.params.args.map(argument => argument.value || argument.description).join(" "));
  if (message.method === "Network.requestWillBeSent") requests.push(message.params.request);
  if (message.method === "Network.responseReceived" && message.params.response.url.startsWith("http://127.0.0.1:5500/") && message.params.response.status >= 400)
    badLocal.push(message.params.response.url);
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
async function open() {
  await evaluate("window.__qaOldDocument=true");
  const result = await send("Page.navigate", { url: "http://127.0.0.1:5500/localizacao.html" });
  if (!result.loaderId) await send("Page.reload", { ignoreCache: true });
  await wait("!window.__qaOldDocument && document.readyState==='complete' && !document.getElementById('location-contact-form').hidden");
}
async function click(selector) {
  await evaluate(`document.querySelector(${JSON.stringify(selector)}).scrollIntoView({block:'center',behavior:'instant'})`);
  const point = await evaluate(`(()=>{const r=document.querySelector(${JSON.stringify(selector)}).getBoundingClientRect();return {x:r.x+r.width/2,y:r.y+r.height/2}})()`);
  await send("Input.dispatchMouseEvent", { type: "mousePressed", button: "left", clickCount: 1, ...point });
  await send("Input.dispatchMouseEvent", { type: "mouseReleased", button: "left", clickCount: 1, ...point });
}
async function fill(values) {
  await evaluate(`(()=>{for(const [key,value] of Object.entries(${JSON.stringify(values)})){const field=document.getElementById('contact-'+key);field.value=value;field.dispatchEvent(new Event('input',{bubbles:true}));field.dispatchEvent(new Event('change',{bubbles:true}));}})()`);
}
async function key(key) {
  const keyCode = { Enter: 13, Tab: 9, Escape: 27 }[key];
  const params = { key, code: key, windowsVirtualKeyCode: keyCode, nativeVirtualKeyCode: keyCode };
  await send("Input.dispatchKeyEvent", { type: "keyDown", ...params }); await send("Input.dispatchKeyEvent", { type: "keyUp", ...params });
}
const captures = join(tmpdir(), "vertice-captures-localizacao-contato-11-10"); await mkdir(captures, { recursive: true });
async function capture(name) {
  const shot = await send("Page.captureScreenshot", { format: "png" });
  await writeFile(join(captures, `${name}.png`), Buffer.from(shot.data, "base64"));
}
await send("Page.enable"); await send("Runtime.enable"); await send("Network.enable");
const injection = await send("Page.addScriptToEvaluateOnNewDocument", { source: `
  window.qaSubmissions=[];window.qaScrolls=[];
  document.addEventListener('submit',event=>{if(event.target.id!=='location-contact-form')return;
    window.qaSubmissions.push({action:event.target.action,target:event.target.target,rel:event.target.rel,blocked:event.defaultPrevented,entries:[...new FormData(event.target)]});event.preventDefault();});
  const originalScroll=Element.prototype.scrollIntoView;
  Element.prototype.scrollIntoView=function(options){window.qaScrolls.push({id:this.id,options});return originalScroll.call(this,options)};
` });
try {
  for (const width of [360, 390, 768, 1440]) {
    await send("Emulation.setDeviceMetricsOverride", { width, height: 1000, deviceScaleFactor: 1, mobile: width < 768 });
    await open();
    assert.equal(await evaluate("document.documentElement.scrollWidth<=innerWidth"), true);
    assert.equal(await evaluate("document.querySelectorAll('h1').length===1 && document.querySelector('h1').id==='localizacao-titulo' && !!document.querySelector('h1').textContent.trim()"), true);
    assert.equal(await evaluate("document.title"), "Localização e contato | Vértice Motors");
    assert.equal(await evaluate("(()=>{const u=new URL(document.querySelector('[data-location-contact]').href);return u.origin==='https://wa.me'&&u.pathname==='/5581993369736'&&u.searchParams.get('text').includes('tirar uma dúvida')})()"), true);
    assert.equal(await evaluate("document.querySelector('[data-location-phone]').textContent"), "(81) 99336-9736");
    assert.equal(await evaluate("document.querySelector('[data-store-map]').getAttribute('loading')"), "lazy");
    assert.equal(await evaluate("new URL(document.querySelector('[data-store-map]').src).origin"), "https://www.google.com");
    assert.equal(await evaluate("document.querySelector('.location-address').textContent.includes('Visconde de Inhaúma, 451')"), true);
    assert.equal(await evaluate("[...document.querySelectorAll('.location-contact-form label')].every(l=>document.getElementById(l.htmlFor))"), true);
    assert.equal(await evaluate("[...document.querySelectorAll('main a,main button,main input:not([type=hidden]),main select')].filter(el=>el.getClientRects().length).every(el=>el.getBoundingClientRect().height>=44)"), true);
    await evaluate("window.scrollTo({top:0,behavior:'instant'})"); await pause(200); await capture(`contato-${width}`);
    await click("[data-test-drive-cta]"); await pause(700);
    assert.equal(await evaluate("document.getElementById('contact-subject').value"), "test-drive");
    assert.equal(await evaluate("document.activeElement.id"), "contato-titulo");
    assert.equal(await evaluate("window.qaScrolls.at(-1).options.behavior"), "smooth");
    assert.equal(await evaluate("!document.getElementById('contact-date-field').hidden && !document.getElementById('contact-date').disabled"), true);
    assert.equal(await evaluate("document.getElementById('contato-titulo').getBoundingClientRect().top>=document.querySelector('.site-header').getBoundingClientRect().bottom"), true);
    await key("Tab"); assert.equal(await evaluate("document.activeElement.id"), "contact-name");
    await fill({ name: "  Ana Maria  ", vehicle: 'Onix & ?phone=outro#teste', date: "2099-11-20" });
    await click(".location-form-submit");
    const submit = await evaluate("window.qaSubmissions.at(-1)");
    assert.equal(submit.blocked, false); assert.equal(submit.action, "https://wa.me/5581993369736");
    assert.equal(submit.target, "_blank"); assert.equal(submit.rel, "noopener noreferrer");
    assert.equal(submit.entries.length, 1); assert.equal(submit.entries[0][0], "text");
    assert.ok(submit.entries[0][1].includes("Meu nome é Ana Maria."));
    assert.ok(submit.entries[0][1].includes("Quero agendar um test drive"));
    assert.ok(submit.entries[0][1].includes("20/11/2099 (a confirmar com a equipe)"));
    assert.ok(submit.entries[0][1].includes("Veículo de interesse: Onix & ?phone=outro#teste"));
    assert.equal(await evaluate("!!document.querySelector('main img[src=x]')"), false);
    await fill({ subject: "other", message: "Tenho uma dúvida sobre como chegar à loja." });
    assert.equal(await evaluate("document.getElementById('contact-date-field').hidden && document.getElementById('contact-date').disabled && document.getElementById('contact-date').value===''"), true);
    await click(".location-form-submit");
    assert.equal(await evaluate("window.qaSubmissions.at(-1).entries[0][1].includes('Dia de preferência')"), false);
    await click(".location-map-shortcut"); await pause(750);
    assert.equal(await evaluate("document.activeElement.id"), "endereco-titulo");
    await evaluate("document.querySelector('.location-grid').scrollIntoView({block:'center',behavior:'instant'})"); await pause(800); await capture(`localizacao-${width}`);
  }
  console.log("PASS: quatro larguras, layout/contatos/mapa, rótulos/toque, CTA test drive com rolagem/foco, teclado e submit nativo preparado com um único parâmetro.");
  await open(); await click(".location-form-submit");
  assert.equal(await evaluate("window.qaSubmissions.length"), 0);
  await fill({ name: "   ", message: "                     " }); await click(".location-form-submit");
  assert.equal(await evaluate("window.qaSubmissions.at(-1).blocked"), true);
  assert.equal(await evaluate("document.getElementById('contact-prepared-message').disabled"), true);
  await fill({ name: "Ana", message: "Gostaria de visitar a loja." });
  assert.equal(await evaluate("document.getElementById('location-contact-form').checkValidity()"), true);
  await click("[data-test-drive-cta]");
  assert.equal(await evaluate("document.getElementById('contact-message').value"), "Gostaria de visitar a loja.");
  await fill({ date: "2000-01-01" }); await click(".location-form-submit");
  assert.equal(await evaluate("document.getElementById('contact-date').validity.rangeUnderflow"), true);
  await fill({ date: "" }); await click(".location-form-submit");
  assert.equal(await evaluate("window.qaSubmissions.at(-1).blocked"), false);
  await evaluate("window.dispatchEvent(new PageTransitionEvent('pagehide',{persisted:true}));window.dispatchEvent(new PageTransitionEvent('pageshow',{persisted:true}))");
  assert.equal(await evaluate("document.getElementById('contact-prepared-message').disabled && document.getElementById('contact-name').value==='Ana'"), true);
  await send("Emulation.setEmulatedMedia", { features: [{ name: "prefers-reduced-motion", value: "reduce" }] });
  await click(".location-map-shortcut"); assert.equal(await evaluate("window.qaScrolls.at(-1).options.behavior"), "instant");
  await send("Emulation.setEmulatedMedia", { features: [] });
  await evaluate("(async()=>{const{initializeStoreLocation}=await import('./js/components/store-location.js');const{config}=await import('./js/config.js');initializeStoreLocation(document,{...config.loja,mapaEmbedUrl:'javascript:alert(1)'})})()");
  assert.equal(await evaluate("document.querySelector('[data-store-map]').hidden && !document.querySelector('[data-store-map]').hasAttribute('src') && !document.querySelector('[data-store-map-placeholder]').hidden"), true);
  console.log("PASS: campos vazios/espaços, recuperação, data passada/opcional, preservação do rascunho, retorno, movimento reduzido e fallback seguro do mapa.");
  await send("Emulation.setDeviceMetricsOverride", { width: 390, height: 640, deviceScaleFactor: 1, mobile: true }); await open();
  await click("[data-menu-toggle]"); await pause(350);
  assert.equal(await evaluate("document.querySelector('.site-menu [aria-current=page]').href.endsWith('/localizacao.html')"), true);
  await key("Escape"); await pause(300); assert.equal(await evaluate("document.querySelector('.site-menu').open"), false);
  await click(".location-map-shortcut"); await pause(500); await evaluate("window.scrollTo({top:document.documentElement.scrollHeight,behavior:'instant'})");
  assert.equal(await evaluate("document.querySelector('.institutional-footer-bottom').getBoundingClientRect().bottom<=document.querySelector('.main-nav').getBoundingClientRect().top"), true);
  await send("Emulation.setScriptExecutionDisabled", { value: true });
  await send("Page.navigate", { url: "http://127.0.0.1:5500/localizacao.html?qa=nojs" }); await pause(1000);
  assert.equal(await evaluate("document.getElementById('location-contact-form').hidden && new URL(document.querySelector('main noscript a').href).searchParams.get('text').includes('tirar uma dúvida') && !!document.querySelector('[data-store-map-placeholder] a[href]')"), true);
  assert.equal(await evaluate("document.documentElement.scrollWidth<=innerWidth"), true);
  console.log("PASS: menu atual, tela curta, rodapé acima da navegação e alternativas de contato/mapa sem JavaScript.");
  assert.equal(requests.some(request => request.url.includes('/rest/v1/')), false);
  assert.equal(requests.some(request => request.url.startsWith('https://wa.me/')), false);
  assert.deepEqual(errors, []); assert.deepEqual(badLocal, []);
  console.log("PASS: nenhuma consulta ao estoque ou mensagem enviada; sem erros/imports ausentes. Capturas:", captures);
} finally {
  await send("Emulation.setScriptExecutionDisabled", { value: false });
  await send("Page.removeScriptToEvaluateOnNewDocument", { identifier: injection.identifier });
  await send("Emulation.setEmulatedMedia", { features: [] }); ws.close();
}
