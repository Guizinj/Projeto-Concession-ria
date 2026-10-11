// Testes opcionais de desenvolvimento: node --test tests/dados.test.mjs
// Sem dependências e sem conexão com o projeto real.
import { afterEach, beforeEach, mock, test } from "node:test";
import assert from "node:assert/strict";
import { config } from "../js/config.js";
import { getPublicImageUrl, supabaseGet, validateSupabaseConfig } from "../js/supabase.js";
import {
  buscarVeiculoPorSlug, listarDestaques, listarExplorar, listarRecentes,
  listarSemelhantes, listarVeiculos,
  listarImagensDoVeiculo, buscarGaleriaPorSlug,
} from "../js/veiculos.js";

const originalConfig = config.supabase;
let requests;
let reply;

beforeEach(() => {
  config.supabase = { url: "https://showroom-test.invalid", publishableKey: "sb_publishable_teste", bucket: "veiculos" };
  requests = [];
  reply = [];
  mock.method(globalThis, "fetch", async (url, options) => {
    requests.push({ url: new URL(url), options });
    return new Response(JSON.stringify(reply), { status: 200 });
  });
});

afterEach(() => {
  config.supabase = originalConfig;
  mock.restoreAll();
});

test("configuração inválida e chaves secretas nunca chegam ao fetch", async () => {
  for (const key of [null, "sb_secret_teste", "eyJtoken", "sb_publishable_", "sb_publishable_teste\n"]) {
    config.supabase.publishableKey = key;
    await assert.rejects(supabaseGet("veiculos"), { code: "CONFIG" });
  }
  config.supabase.publishableKey = "sb_publishable_teste";
  for (const url of [null, "http://teste.invalid", "https://teste.invalid/rest/v1/", "https://user:pass@teste.invalid", "https://teste.invalid?x=1"]) {
    config.supabase.url = url;
    assert.throws(validateSupabaseConfig, { code: "CONFIG" });
  }
  assert.equal(requests.length, 0);
});

test("leitura usa GET/apikey e distingue vazio, erro HTTP e resposta inválida", async () => {
  assert.deepEqual(await supabaseGet("veiculos", { select: "id", limit: "1" }), []);
  const { url, options } = requests[0];
  assert.equal(url.pathname, "/rest/v1/veiculos");
  assert.equal(url.searchParams.get("limit"), "1");
  assert.equal(options.method, "GET");
  assert.equal(options.headers.apikey, "sb_publishable_teste");
  assert.equal(options.headers.Authorization, undefined);
  assert.equal(options.credentials, "omit");
  await assert.rejects(supabaseGet("rpc/qualquer"), TypeError);
  mock.method(globalThis, "fetch", async () => new Response(JSON.stringify({ code: "42501", message: "texto privado do servidor" }), { status: 403 }));
  await assert.rejects(supabaseGet("veiculos"), (error) => error.status === 403 && error.code === "42501" && !error.message.includes("texto privado"));
  mock.method(globalThis, "fetch", async () => new Response(JSON.stringify({ code: "PGRST205" }), { status: 404 }));
  await assert.rejects(supabaseGet("veiculos"), { code: "PGRST205" });
  mock.method(globalThis, "fetch", async () => new Response("não é JSON", { status: 200 }));
  await assert.rejects(supabaseGet("veiculos"), { code: "RESPOSTA" });
  mock.method(globalThis, "fetch", async () => { throw new TypeError("falha de rede"); });
  await assert.rejects(supabaseGet("veiculos"), { code: "REDE" });
});

test("cancelamento de busca é distinto de timeout", async () => {
  mock.method(globalThis, "fetch", (_url, { signal }) => new Promise((_resolve, reject) => {
    signal.addEventListener("abort", () => reject(new DOMException("abort", "AbortError")), { once: true });
  }));
  await assert.rejects(supabaseGet("veiculos", {}, { timeoutMs: 5 }), { code: "TIMEOUT" });
  const controller = new AbortController();
  const pending = listarVeiculos({ signal: controller.signal });
  controller.abort();
  await assert.rejects(pending, { name: "AbortError" });
  await assert.rejects(supabaseGet("veiculos", {}, { signal: controller.signal }), { name: "AbortError" });
});

test("paginação consulta 13, devolve 12 e usa capa única sem carregar galeria", async () => {
  reply = Array.from({ length: 13 }, (_, index) => ({ id: String(index), capa: index ? [] : [{ storage_path: "demo/capa.png", principal: true }] }));
  const result = await listarVeiculos();
  assert.equal(result.veiculos.length, 12);
  assert.equal(result.temMais, true);
  assert.equal(result.proximoOffset, 12);
  assert.equal(result.veiculos[1].imagem_capa, null);
  assert.match(result.veiculos[0].imagem_capa.url, /\/storage\/v1\/object\/public\/veiculos\/demo\/capa.png$/);
  const params = requests[0].url.searchParams;
  assert.equal(params.get("limit"), "13");
  assert.equal(params.get("capa.limit"), "1");
  assert.equal(params.get("capa.order"), "principal.desc,ordem.asc,id.asc");
  assert.equal(params.get("order"), "created_at.desc,id.asc");
  assert.equal(params.get("status"), "in.(disponivel,reservado)");
  assert.equal(params.get("publicado"), "eq.true");
  assert.equal(params.get("select").includes("descricao"), false);
  assert.equal(params.get("select").includes("opcionais"), false);
  reply = [{ id: "12" }, { id: "13" }];
  const last = await listarVeiculos({ offset: 12 });
  assert.equal(last.temMais, false);
  assert.equal(last.proximoOffset, null);
  assert.equal(requests[1].url.searchParams.get("offset"), "12");
});

test("busca e filtros são enviados ao banco, com ordenação estável", async () => {
  await listarVeiculos({ ordenacao: "menor_preco", filtros: {
    busca: "Toyota Corolla XEi", precoMin: "100000", precoMax: 150000,
    anoMin: 2020, anoMax: 2024, kmMax: 50000, cambio: "cvt", categoria: "sedan",
  } });
  const params = requests[0].url.searchParams;
  assert.deepEqual(params.getAll("preco"), ["gte.100000", "lte.150000"]);
  assert.deepEqual(params.getAll("ano_modelo"), ["gte.2020", "lte.2024"]);
  assert.equal(params.get("quilometragem"), "lte.50000");
  assert.equal(params.get("cambio"), "eq.cvt");
  assert.equal(params.get("categoria"), "eq.sedan");
  assert.equal(params.get("order"), "preco.asc,id.asc");
  assert.equal(params.get("and"), "(or(marca.ilike.*Toyota*,modelo.ilike.*Toyota*,versao.ilike.*Toyota*),or(marca.ilike.*Corolla*,modelo.ilike.*Corolla*,versao.ilike.*Corolla*),or(marca.ilike.*XEi*,modelo.ilike.*XEi*,versao.ilike.*XEi*))");
  await listarVeiculos({ ordenacao: "maior_preco", filtros: { busca: 'Citroën),publicado.eq.false,("*' } });
  assert.equal(requests[1].url.searchParams.get("publicado"), "eq.true");
  assert.equal(requests[1].url.searchParams.get("order"), "preco.desc,id.asc");
  assert.equal(requests[1].url.searchParams.get("and").includes("publicado.eq.false"), false);
});

test("filtros, paginação e identificadores inválidos não consultam a API", async () => {
  for (const options of [
    { ordenacao: "toString" }, { offset: -1 }, { limite: 13 },
    { filtros: { precoMin: "-1" } }, { filtros: { precoMin: 100, precoMax: 99 } },
    { filtros: { anoMin: 2024, anoMax: 2023 } }, { filtros: { kmMax: 1.5 } },
    { filtros: { cambio: "eq.cvt,publicado.eq.false" } }, { filtros: { categoria: "teste" } },
    { filtros: { busca: "x".repeat(101) } }, { filtros: { busca: "***" } },
  ]) await assert.rejects(listarVeiculos(options), TypeError);
  await assert.rejects(listarSemelhantes({ id: "qualquer", categoria: "suv" }), TypeError);
  assert.equal(requests.length, 0);
});

test("Home, Explorar e semelhantes têm consultas limitadas", async () => {
  await listarDestaques();
  await listarRecentes();
  await listarExplorar();
  await listarSemelhantes({ id: "11111111-1111-4111-8111-111111111111", categoria: "sedan" });
  assert.deepEqual(requests.map(({ url }) => url.searchParams.get("limit")), ["6", "6", "5", "4"]);
  assert.equal(requests[0].url.searchParams.get("destaque"), "eq.true");
  assert.equal(requests[1].url.searchParams.has("destaque"), false);
  assert.equal(requests[3].url.searchParams.get("categoria"), "eq.sedan");
  assert.equal(requests[3].url.searchParams.get("id"), "neq.11111111-1111-4111-8111-111111111111");
  assert.equal(requests[3].url.searchParams.get("publicado"), "eq.true");
  assert.equal(requests[3].url.searchParams.get("status"), "in.(disponivel,reservado)");
  assert.equal(requests[3].url.searchParams.get("capa.limit"), "1");
  assert.equal(requests[3].url.searchParams.get("order"), "created_at.desc,id.asc");
});

test("detalhes consultam slug publicado, permitem vendido e retornam galeria ordenada", async () => {
  assert.equal(await buscarVeiculoPorSlug(null), null);
  assert.equal(await buscarVeiculoPorSlug("../inválido"), null);
  assert.equal(requests.length, 0);
  reply = [{ slug: "demo-vendido", status: "vendido", imagens: [{ storage_path: "demo/galeria.png", ordem: 0 }, { storage_path: "demo/capa.png", ordem: 1 }] }];
  const vehicle = await buscarVeiculoPorSlug("demo-vendido");
  assert.equal(vehicle.status, "vendido");
  assert.equal(vehicle.imagens.length, 2);
  assert.ok(vehicle.imagens.every((image) => image.url));
  const params = requests[0].url.searchParams;
  assert.equal(params.get("slug"), "eq.demo-vendido");
  assert.equal(params.get("publicado"), "eq.true");
  assert.equal(params.get("limit"), "1");
  assert.ok(["descricao", "opcionais", "destaques"].every(field => params.get("select").split(",").includes(field)));
  assert.equal(params.has("status"), false);
  assert.equal(params.get("imagens.order"), "ordem.asc,id.asc");
  assert.equal(params.has("imagens.limit"), false);
  reply = [];
  assert.equal(await buscarVeiculoPorSlug("demo-inexistente"), null);
  mock.method(globalThis, "fetch", async () => { throw new TypeError(); });
  await assert.rejects(buscarVeiculoPorSlug("demo-inexistente"), { code: "REDE" });
});

test("URLs de imagens aceitam apenas caminhos relativos e codificam os segmentos", () => {
  for (const path of [null, "", "/capa.png", "a//b.png", "a/../b.png", "./b.png", "a/", "https://site/foto.jpg", "a\\foto.jpg", "a?b.jpg", "a#b.jpg", "a\n.jpg", " foto.jpg"]) {
    assert.equal(getPublicImageUrl(path), null);
  }
  assert.equal(getPublicImageUrl("carros/foto azul ação.png"), "https://showroom-test.invalid/storage/v1/object/public/veiculos/carros/foto%20azul%20a%C3%A7%C3%A3o.png");
});

test("galeria por UUID valida o filtro e consulta somente os metadados ordenados", async () => {
  for (const id of [null, "", "qualquer", "11111111-1111-4111-8111-111111111111,publicado.eq.false"]) await assert.rejects(listarImagensDoVeiculo(id), TypeError);
  assert.equal(requests.length, 0);
  reply = [{ id: "foto-1", storage_path: "carros/frente.jpg", ordem: 0, principal: true }, { id: "foto-2", storage_path: "https://externo/foto.jpg", ordem: 1 }];
  const images = await listarImagensDoVeiculo("11111111-1111-4111-8111-111111111111");
  assert.match(images[0].url, /carros\/frente.jpg$/);
  assert.equal(images[1].url, null);
  const { url, options } = requests[0];
  assert.equal(url.pathname, "/rest/v1/veiculo_imagens");
  assert.equal(url.searchParams.get("veiculo_id"), "eq.11111111-1111-4111-8111-111111111111");
  assert.equal(url.searchParams.get("select"), "id,storage_path,ordem,principal");
  assert.equal(url.searchParams.get("order"), "ordem.asc,id.asc");
  assert.equal(options.method, "GET");
});

test("base do veículo consulta só identidade e galeria de um slug publicado", async () => {
  for (const slug of [null, "", "../teste", "teste,publicado.eq.false", "x".repeat(201)]) assert.equal(await buscarGaleriaPorSlug(slug), null);
  assert.equal(requests.length, 0);
  reply = [{ id: "1", marca: "Marca", modelo: "Modelo", imagens: [{ storage_path: "carros/dentro.jpg", ordem: 1 }] }];
  const gallery = await buscarGaleriaPorSlug("marca-modelo");
  assert.match(gallery.imagens[0].url, /carros\/dentro.jpg$/);
  const params = requests[0].url.searchParams;
  assert.equal(params.get("slug"), "eq.marca-modelo");
  assert.equal(params.get("publicado"), "eq.true");
  assert.equal(params.get("limit"), "1");
  assert.equal(params.get("imagens.order"), "ordem.asc,id.asc");
  assert.equal(params.get("select"), "id,slug,marca,modelo,imagens:veiculo_imagens(id,storage_path,ordem,principal)");
  reply = [];
  assert.equal(await buscarGaleriaPorSlug("marca-modelo"), null);
});
