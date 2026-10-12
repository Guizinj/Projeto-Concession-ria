// QA de toque real: Live Server :5500 e Chrome isolado :9341 (QA_PORT substitui).
// Dados e fotos simulados; não consulta o Supabase nem abre WhatsApp.
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const port = process.env.QA_PORT || "9341";
const tabs = await (await fetch(`http://127.0.0.1:${port}/json/list`)).json();
const ws = new WebSocket(tabs.find(tab => tab.type === "page").webSocketDebuggerUrl);
await new Promise(resolve => ws.addEventListener("open", resolve, { once: true }));
let sequence = 0;
const pending = new Map(), errors = [];
const png = (await readFile(new URL("../assets/images/demo/capa.png", import.meta.url))).toString("base64");
function send(method, params = {}) {
  return new Promise((resolve, reject) => {
    pending.set(++sequence, { resolve, reject });
    ws.send(JSON.stringify({ id: sequence, method, params }));
  });
}
ws.addEventListener("message", async event => {
  const message = JSON.parse(event.data);
  if (message.id) {
    const promise = pending.get(message.id); pending.delete(message.id);
    if (message.error) promise.reject(new Error(message.error.message));
    else promise.resolve(message.result);
  }
  if (message.method === "Runtime.exceptionThrown") errors.push(message.params.exceptionDetails.text);
  if (message.method === "Runtime.consoleAPICalled" && message.params.type === "error") errors.push(message.params.args.map(arg => arg.value || arg.description).join(" "));
  if (message.method === "Fetch.requestPaused") await send("Fetch.fulfillRequest", {
    requestId: message.params.requestId, responseCode: 200,
    responseHeaders: [{ name: "Content-Type", value: "image/png" }], body: png,
  });
});
async function evaluate(expression) {
  const response = await send("Runtime.evaluate", { expression, awaitPromise: true, returnByValue: true });
  if (response.exceptionDetails) throw new Error(response.exceptionDetails.exception?.description || response.exceptionDetails.text);
  return response.result.value;
}
const pause = ms => new Promise(resolve => setTimeout(resolve, ms));
async function wait(expression) {
  for (let attempt = 0; attempt < 80; attempt++) {
    if (await evaluate(expression)) return;
    await pause(50);
  }
  throw new Error(`Timeout: ${expression}`);
}
const fixture = `
  const nativeFetch = window.fetch;
  const photos = Array.from({length:3}, (_,i)=>({id:'photo-'+i,storage_path:'testing/swipe/'+i+'.jpg',ordem:i,principal:i===0}));
  const rows = Array.from({length:6},(_,i)=>({id:'11111111-1111-4111-8111-'+String(i+1).padStart(12,'0'),slug:'swipe-'+i,marca:'Marca',modelo:'Modelo '+i,versao:'Versão',ano_fabricacao:2022,ano_modelo:2023,preco:100000,quilometragem:10000,cambio:'manual',categoria:'sedan',status:'disponivel',capa:[photos[0]]}));
  window.fetch=async (url,options)=>{
    if(!String(url).includes('/rest/v1/'))return nativeFetch(url,options);
    const query=new URL(url);
    if(query.pathname.endsWith('/veiculo_imagens'))return new Response(JSON.stringify(photos));
    const params=query.searchParams;
    if(params.has('slug'))return new Response(JSON.stringify([{...rows[0],imagens:photos}]));
    const selected=params.has('id')?rows.slice(1):rows;
    return new Response(JSON.stringify(selected.slice(0,Number(params.get('limit')))));
  };
`;
async function open(path) {
  await evaluate("window.oldSwipeDocument=true");
  await send("Page.navigate", { url: `http://127.0.0.1:5500/${path}` });
  await wait("!window.oldSwipeDocument && document.readyState==='complete' && !!document.querySelector('.photo-gallery .vehicle-card-image')?.naturalWidth");
}
async function point() {
  await evaluate("document.querySelector('.photo-gallery').scrollIntoView({block:'center',behavior:'instant'})");
  await pause(150);
  return evaluate("(()=>{const r=document.querySelector('.photo-gallery').getBoundingClientRect();return {x:r.x+r.width/2,y:r.y+r.height*.35}})()");
}
async function gesture(offsets, { cancel = false } = {}) {
  const start = await point();
  const before = await evaluate("({scroll:scrollY,path:location.pathname,count:document.querySelector('.photo-count').textContent})");
  await send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [start] });
  for (const [x,y] of offsets) {
    await send("Input.dispatchTouchEvent", { type: "touchMove", touchPoints: [{ x: start.x+x, y: start.y+y }] });
    await pause(25);
  }
  await send("Input.dispatchTouchEvent", { type: cancel ? "touchCancel" : "touchEnd", touchPoints: [] });
  await pause(250);
  return { before, after: await evaluate("({scroll:scrollY,path:location.pathname,count:document.querySelector('.photo-count')?.textContent})") };
}
function line(x,y) { return Array.from({length:8},(_,i)=>[x*(i+1)/8,y*(i+1)/8]); }
function unchanged(result, context) {
  assert.equal(result.after.path, result.before.path, `${context}: não abre a ficha`);
  assert.ok(Math.abs(result.after.scroll-result.before.scroll)<=2, `${context}: scroll ${result.before.scroll} → ${result.after.scroll}`);
}
await send("Runtime.enable"); await send("Page.enable");
await send("Emulation.setTouchEmulationEnabled", { enabled: true, maxTouchPoints: 2 });
await send("Fetch.enable", { patterns: [{ urlPattern: "*/storage/v1/*" }] });
const injection = await send("Page.addScriptToEvaluateOnNewDocument", { source: fixture });
try {
  for (const width of [390,360,768,1440]) {
    await send("Emulation.setDeviceMetricsOverride", { width, height: 900, deviceScaleFactor: 1, mobile: width<768 });
    for (const path of ["index.html", "estoque.html", "veiculo.html?carro=swipe-0"]) {
      await open(path);
      let result = await gesture(line(-96,-70));
      unchanged(result, `${path} ${width}: lateral com diagonal`);
      assert.equal(result.after.count,"2 / 3",`${path} ${width}: passa foto mesmo com desvio vertical`);
      result = await gesture(line(96,70)); unchanged(result, "voltar com diagonal");
      assert.equal(result.after.count,"1 / 3");
      result = await gesture([[-12,-2],[-30,-10],[-50,-35],[-70,-65],[-96,-105]]);
      unchanged(result,"gesto começa lateral e curva"); assert.equal(result.after.count,"2 / 3");
      result = await gesture(line(48,25)); unchanged(result,"gesto lateral curto intencional");
      assert.equal(result.after.count,"1 / 3");
      result = await gesture(line(-14,-3)); unchanged(result,"toque com pequena movimentação");
      assert.equal(result.after.count,"1 / 3");
      result = await gesture(line(-90,-10),{cancel:true}); unchanged(result,"toque cancelado");
      assert.equal(result.after.count,"1 / 3");
      result = await gesture(line(-30,-120));
      assert.equal(result.after.count,"1 / 3","vertical não muda foto");
      assert.equal(result.after.path,result.before.path,"vertical não abre a ficha");
      assert.ok(result.after.scroll>result.before.scroll+25,"vertical mantém rolagem nativa");
      assert.equal(await evaluate("document.documentElement.scrollWidth<=innerWidth"),true,"sem overflow");
      await evaluate("document.querySelector('.photo-gallery').focus({preventScroll:true})");
      await send("Input.dispatchKeyEvent",{type:"keyDown",key:"ArrowRight",code:"ArrowRight"});
      await send("Input.dispatchKeyEvent",{type:"keyUp",key:"ArrowRight",code:"ArrowRight"});
      await wait("document.querySelector('.photo-count').textContent==='2 / 3'");
      await evaluate("document.querySelector('.photo-previous').click()");
      await wait("document.querySelector('.photo-count').textContent==='1 / 3'");
      if(!path.startsWith('veiculo')) {
        const tap = await point();
        await send("Input.dispatchTouchEvent",{type:"touchStart",touchPoints:[tap]});
        await send("Input.dispatchTouchEvent",{type:"touchEnd",touchPoints:[]});
        await wait("location.pathname.endsWith('veiculo.html') && document.readyState==='complete' && !!document.querySelector('.photo-gallery .vehicle-card-image')?.naturalWidth");
      }
      console.log(`PASS ${path} ${width}: diagonal, curva, limiar, cancelamento, scroll vertical, teclado/botões e toque no link.`);
    }
  }
  assert.deepEqual(errors,[],"console sem erros");
} finally {
  await send("Page.removeScriptToEvaluateOnNewDocument",{identifier:injection.identifier});
  await send("Fetch.disable"); ws.close();
}
