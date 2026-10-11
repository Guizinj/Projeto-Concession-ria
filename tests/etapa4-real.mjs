// Somente leitura: node tests/etapa4-real.mjs
import assert from "node:assert/strict";
import { listarDestaques, listarVeiculos, buscarVeiculoPorSlug } from "../js/veiculos.js";
import { supabaseGet } from "../js/supabase.js";

const first = await listarVeiculos();
const last = await listarVeiculos({ offset: first.proximoOffset });
assert.equal(first.veiculos.length, 12);
assert.equal(first.temMais, true);
assert.equal(last.veiculos.length, 2);
assert.equal(last.temMais, false);
const all = [...first.veiculos, ...last.veiculos];
assert.equal(new Set(all.map(v => v.id)).size, 14);
assert.ok(all.every(v => ["disponivel", "reservado"].includes(v.status)));
assert.equal(all.filter(v => v.status === "reservado").length, 1);
assert.equal((await listarDestaques()).length, 6);
const filtered = await listarVeiculos({ filtros: { busca: "Toyota Corolla XEi", precoMin: 100000, precoMax: 150000, anoMin: 2020, anoMax: 2024, kmMax: 50000, cambio: "cvt", categoria: "sedan" } });
assert.equal(filtered.veiculos.length, 1);
for (const ordenacao of ["menor_preco", "maior_preco"]) {
  const page = await listarVeiculos({ ordenacao });
  const tail = await listarVeiculos({ ordenacao, offset: page.proximoOffset });
  const prices = [...page.veiculos, ...tail.veiculos].map(v => Number(v.preco));
  assert.ok(prices.every((p, i) => !i || (ordenacao === "menor_preco" ? p >= prices[i-1] : p <= prices[i-1])));
}
assert.equal((await listarVeiculos({ filtros: { busca: "VeiculoInexistenteXYZ" } })).veiculos.length, 0);
assert.equal((await buscarVeiculoPorSlug("demo-renegade-vendido-2021-015")).status, "vendido");
assert.equal(await buscarVeiculoPorSlug("demo-yaris-rascunho-2022-016"), null);
assert.equal((await supabaseGet("veiculos", { select: "id", slug: "eq.demo-yaris-rascunho-2022-016" })).length, 0);
assert.equal((await supabaseGet("veiculo_imagens", { select: "id", storage_path: "eq.demo/rascunho.png" })).length, 0);
const image = await fetch(first.veiculos[0].imagem_capa.url);
assert.equal(image.status, 200);
assert.match(image.headers.get("content-type"), /image\/png/);
await image.arrayBuffer();
console.log("Etapa 4: leitura real passou — Home 6 destaques; estoque 12 + 2; filtros; ordenação; vazio; status; RLS; foto HTTP 200.");
