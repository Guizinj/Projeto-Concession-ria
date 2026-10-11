// QA opcional: Chrome isolado com --remote-debugging-port=9334 e Live Server :5500.
// Somente navegação/leitura; simulações de falha ficam na memória da página.
import assert from "node:assert/strict";
import { mkdir, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

const tabs = await (await fetch("http://127.0.0.1:9334/json/list")).json();
const ws = new WebSocket(tabs.find(t => t.type === "page").webSocketDebuggerUrl);
await new Promise(resolve => ws.addEventListener("open", resolve, { once: true }));
let id = 0;
const pending = new Map();
const exceptions = [], badLocalResponses = [], consoleErrors = [];
ws.addEventListener("message", event => {
  const msg = JSON.parse(event.data);
  if (msg.id) {
    const pair = pending.get(msg.id); pending.delete(msg.id);
    if (msg.error) pair.reject(new Error(msg.error.message)); else pair.resolve(msg.result);
  }
  if (msg.method === "Runtime.exceptionThrown") exceptions.push(msg.params.exceptionDetails.text);
  if (msg.method === "Runtime.consoleAPICalled" && msg.params.type === "error") consoleErrors.push(msg.params.args.map(a => a.value || a.description).join(" "));
  if (msg.method === "Network.responseReceived" && msg.params.response.url.startsWith("http://127.0.0.1:5500/") && msg.params.response.status >= 400) badLocalResponses.push(msg.params.response.url);
});
function send(method, params = {}) {
  return new Promise((resolve, reject) => {
    pending.set(++id, { resolve, reject }); ws.send(JSON.stringify({ id, method, params }));
  });
}
async function evaluate(expression) {
  const result = await send("Runtime.evaluate", { expression, awaitPromise: true, returnByValue: true });
  if (result.exceptionDetails) throw new Error(result.exceptionDetails.exception?.description || result.exceptionDetails.text);
  return result.result.value;
}
const pause = ms => new Promise(resolve => setTimeout(resolve, ms));
async function wait(expression, label = expression) {
  for (let i = 0; i < 100; i++) {
    if (await evaluate(expression)) return;
    await pause(150);
  }
  throw new Error(`Timeout: ${label}`);
}
async function open(path) {
  await send("Page.navigate", { url: `http://127.0.0.1:5500/${path}` });
  await wait(`document.readyState === 'complete' && location.pathname.endsWith('${path.split('?')[0]}')`);
}
async function input(name, value, type = "input") {
  await evaluate(`document.getElementById(${JSON.stringify(name)}).value=${JSON.stringify(value)};document.getElementById(${JSON.stringify(name)}).dispatchEvent(new Event('${type}',{bubbles:true}));`);
}
async function stockReady(n) { await wait(`document.querySelectorAll('#stock-results .vehicle-card').length===${n} && !document.querySelector('#stock-results .loading-state')`); }
await send("Page.enable"); await send("Runtime.enable"); await send("Network.enable");
const captures = join(tmpdir(), "vertice-captures-etapa4");
await mkdir(captures, { recursive: true });
try {
  for (const page of ["index.html", "estoque.html"]) {
    await open(page);
    await wait(`document.querySelectorAll('.vehicle-card').length===${page === "index.html" ? 6 : 12}`);
    for (const width of [360, 390, 768, 1440]) {
      await send("Emulation.setDeviceMetricsOverride", { width, height: 900, deviceScaleFactor: 1, mobile: width < 768 });
      if (page === "estoque.html") await evaluate("document.getElementById('filter-details').open=true");
      assert.equal(await evaluate("document.documentElement.scrollWidth <= innerWidth"), true, `${page} ${width} overflow`);
      assert.equal(await evaluate("document.querySelectorAll('h1').length"), 1);
      assert.equal(await evaluate("document.querySelector('[data-contact-placeholder]').disabled"), true);
      assert.equal(await evaluate("getComputedStyle(document.querySelector('.main-nav')).position"), width < 768 ? "fixed" : "static");
      const shot = await send("Page.captureScreenshot", { format: "png" });
      await writeFile(join(captures, `${page.split('.')[0]}-${width}.png`), Buffer.from(shot.data, "base64"));
    }
  }
  console.log("PASS: oito combinações de página/largura, navegação e contatos.");
  assert.equal(await evaluate("document.querySelectorAll('#stock-results .status-reservado').length"), 1);
  await evaluate("document.getElementById('load-more').click();document.getElementById('load-more').click()");
  await stockReady(14);
  assert.equal(await evaluate("document.getElementById('load-more').hidden"), true);
  assert.equal(await evaluate("new Set([...document.querySelectorAll('.vehicle-card-link')].map(a=>a.href)).size"), 14);
  assert.equal(await evaluate("document.activeElement === document.querySelectorAll('.vehicle-card-link')[12]"), true);
  console.log("PASS: paginação 12 + 2, clique duplicado e foco no primeiro card novo.");

  await input("busca", "Toyota Corolla XEi");
  await stockReady(1);
  for (const [name, value] of Object.entries({ precoMin: "100000", precoMax: "150000", anoMin: "2020", anoMax: "2024", kmMax: "50000" })) await input(name, value);
  await input("cambio", "cvt", "change"); await input("categoria", "sedan", "change");
  await stockReady(1);
  await wait("location.search.includes('categoria=sedan')");
  const shared = await evaluate("location.pathname.slice(1)+location.search");
  await open(shared); await stockReady(1);
  assert.equal(await evaluate("document.getElementById('busca').value"), "Toyota Corolla XEi");
  await evaluate("document.querySelector('.vehicle-card-link').click()");
  await wait("location.pathname.endsWith('veiculo.html')");
  await evaluate("history.back()");
  await wait("location.pathname.endsWith('estoque.html')"); await stockReady(1);
  assert.equal(await evaluate("document.getElementById('categoria').value"), "sedan");
  await evaluate("document.getElementById('clear-filters').click()"); await stockReady(12);
  await evaluate("history.back()"); await stockReady(1);
  await evaluate("history.forward()"); await stockReady(12);
  await input("precoMin", "1e5"); await stockReady(10);
  assert.equal(await evaluate("new URLSearchParams(location.search).get('precoMin')"), "100000");
  await evaluate("document.getElementById('clear-filters').click()"); await stockReady(12);
  console.log("PASS: filtros combinados, URL compartilhada, limpar, voltar e avançar.");

  for (const [sort, expected] of [["menor_preco", "HB20"], ["maior_preco", "Hilux"]]) {
    await input("ordenacao", sort, "change"); await stockReady(12);
    await wait(`document.querySelector('.vehicle-card-title').textContent.includes('${expected}')`);
  }
  await input("busca", "VeiculoInexistenteXYZ");
  await wait("!!document.querySelector('#stock-results .state-panel-empty')");
  await input("busca", "***");
  await wait("document.getElementById('filter-feedback').textContent.length>0");
  assert.equal(await evaluate("document.querySelectorAll('#stock-results .vehicle-card').length"), 0);
  await evaluate("document.getElementById('clear-filters').click()"); await stockReady(12);
  await input("precoMin", "200000"); await input("precoMax", "100000");
  await wait("document.getElementById('filter-feedback').textContent.length>0");
  await evaluate("document.getElementById('clear-filters').click()"); await stockReady(12);
  console.log("PASS: ordenações reais, vazio e validação de busca/intervalo.");

  // Resposta antiga propositalmente ignora AbortSignal: deve ser descartada.
  await evaluate(`window.originalFetch=window.fetch;window.startedOld=false;window.finishedOld=false;
    window.fetch=async (url,options)=>{const old=String(url).includes('Corolla');if(old){window.startedOld=true;const reply=await originalFetch(url,{...options,signal:undefined});await new Promise(r=>setTimeout(r,1800));window.finishedOld=true;return reply;}return originalFetch(url,options);}`);
  await input("busca", "Corolla"); await wait("window.startedOld");
  await input("busca", "Hilux"); await stockReady(1);
  await wait("window.finishedOld"); await pause(200);
  assert.match(await evaluate("document.querySelector('.vehicle-card-title').textContent"), /Hilux/);
  await input("busca", "C"); await input("busca", "Ci"); await input("busca", "Civic");
  await stockReady(1); await wait("document.querySelector('.vehicle-card-title').textContent.includes('Civic')");
  assert.equal(await evaluate("!!document.querySelector('.state-panel-error')"), false);
  await evaluate("window.fetch=window.originalFetch;document.getElementById('clear-filters').click()"); await stockReady(12);
  console.log("PASS: digitação rápida e resposta antiga descartada mesmo ignorando cancelamento.");

  await evaluate("window.fetch=async()=>{throw new TypeError('falha simulada')};document.getElementById('load-more').click()");
  await wait("!!document.querySelector('#pagination-feedback .state-panel-error')");
  assert.equal(await evaluate("document.querySelectorAll('#stock-results .vehicle-card').length"), 12);
  await evaluate("window.fetch=window.originalFetch;document.querySelector('#pagination-feedback button').click()");
  await stockReady(14);
  await evaluate("window.fetch=async()=>{throw new TypeError('falha simulada')};document.getElementById('clear-filters').click()");
  await wait("!!document.querySelector('#stock-results .state-panel-error')");
  await evaluate("window.fetch=window.originalFetch;document.querySelector('#stock-results button').click()"); await stockReady(12);
  console.log("PASS: erro inicial e no lote adicional, nova tentativa sem perder/duplicar cards.");

  await open("estoque.html?busca=***&precoMin=300&precoMax=2&anoMin=1&cambio=invalid&ordenacao=invalid");
  await stockReady(12);
  assert.equal(await evaluate("location.search"), "");
  assert.match(await evaluate("document.getElementById('filter-feedback').textContent"), /inválidos/);
  await evaluate("document.querySelector('.vehicle-card-image').dispatchEvent(new Event('error'))");
  assert.match(await evaluate("document.querySelector('.vehicle-card-media').textContent"), /Foto indisponível/);
  await send("Input.dispatchKeyEvent", { type: "keyDown", key: "Tab", code: "Tab", windowsVirtualKeyCode: 9 });
  await send("Input.dispatchKeyEvent", { type: "keyUp", key: "Tab", code: "Tab", windowsVirtualKeyCode: 9 });
  assert.equal(await evaluate("document.activeElement.classList.contains('skip-link')"), true);
  console.log("PASS: parâmetros externos inválidos, fallback de foto e teclado.");

  await open("index.html"); await wait("document.querySelectorAll('.vehicle-card').length===6");
  assert.equal(await evaluate("document.querySelectorAll('#destaques .vehicle-card').length"), 6);
  assert.equal(await evaluate("document.querySelector('#recentes')"), null);
  const real = await evaluate(`(async()=>{const d=await import('./js/veiculos.js');const sold=await d.buscarVeiculoPorSlug('demo-renegade-vendido-2021-015');const draft=await d.buscarVeiculoPorSlug('demo-yaris-rascunho-2022-016');const images=[...document.querySelectorAll('img.vehicle-card-image')];images.forEach(img=>img.loading='eager');await Promise.all(images.map(img=>img.decode()));return {sold:sold.status,draft,images:images.length};})()`);
  assert.deepEqual(real, { sold: "vendido", draft: null, images: 6 });
  const injection = await send("Page.addScriptToEvaluateOnNewDocument", { source: `window.originalFetch=window.fetch;window.fetch=(url,options)=>String(url).includes('destaque=eq.true')?Promise.reject(new TypeError('falha simulada')):window.originalFetch(url,options);` });
  await open("index.html");
  await wait("!!document.querySelector('#destaques .state-panel-error')");
  await evaluate("window.fetch=window.originalFetch;document.querySelector('#destaques button').click()");
  await wait("document.querySelectorAll('#destaques .vehicle-card').length===6");
  await send("Page.removeScriptToEvaluateOnNewDocument", { identifier: injection.identifier });
  const emptyInjection = await send("Page.addScriptToEvaluateOnNewDocument", { source: `window.fetch=async()=>new Response('[]',{status:200});` });
  await open("index.html");
  await wait("document.querySelectorAll('.state-panel-empty').length===2");
  await send("Page.removeScriptToEvaluateOnNewDocument", { identifier: emptyInjection.identifier });
  await send("Emulation.setScriptExecutionDisabled", { value: true });
  for (const path of ["index.html", "estoque.html"]) {
    await open(path);
    assert.equal(await evaluate("getComputedStyle(document.querySelector('noscript')).display !== 'none'"), true);
    assert.equal(await evaluate("document.querySelectorAll('.main-nav a[href]').length"), 3);
  }
  await send("Emulation.setScriptExecutionDisabled", { value: false });
  assert.equal(exceptions.length, 0, JSON.stringify(exceptions));
  assert.equal(badLocalResponses.length, 0, JSON.stringify(badLocalResponses));
  assert.equal(consoleErrors.length, 0, JSON.stringify(consoleErrors));
  console.log("PASS: Home independente, retry, fotos decodificadas e status reais; nenhum erro JS/import HTTP.");
} finally {
  ws.close();
}
