import { test } from "node:test";
import assert from "node:assert/strict";
import { readCatalogUrl, catalogUrl } from "../js/catalogo-url.js";

test("links externos descartam filtros inválidos e intervalos invertidos", () => {
  const result = readCatalogUrl("?busca=***&precoMin=200&precoMax=100&anoMin=1899&anoMax=2024.5&kmMax=1.5&cambio=qualquer&categoria=toString&ordenacao=toString");
  assert.deepEqual(result, { filtros: {}, ordenacao: "menor_preco", discarded: true });
  assert.deepEqual(readCatalogUrl("?precoMin=Infinity&kmMax=-1&anoMin=2101&precoMax=1e5").filtros, {});
});

test("busca e filtros combinados sobrevivem ao compartilhamento da URL", () => {
  const state = readCatalogUrl("?busca=Toyota%20Corolla&precoMin=0&precoMax=150000.50&anoMin=2020&anoMax=2024&cambio=cvt&categoria=sedan&kmMax=50000&ordenacao=menor_preco");
  assert.equal(state.discarded, false);
  const url = catalogUrl("https://loja.example/estoque.html?origem=home#conteudo", state);
  assert.deepEqual(readCatalogUrl(url.search), state);
  assert.equal(url.searchParams.get("origem"), "home");
  assert.equal(url.hash, "#conteudo");
  const cleared = catalogUrl(url, { filtros: {}, ordenacao: "menor_preco" });
  assert.equal(cleared.search, "?origem=home");
});

test("estoque começa no menor preço e preserva escolhas explícitas em links", () => {
  assert.equal(readCatalogUrl("").ordenacao, "menor_preco");
  for (const ordenacao of ["menor_preco", "maior_preco", "recentes"]) {
    const url = catalogUrl("https://loja.example/estoque.html", { filtros: {}, ordenacao });
    assert.equal(readCatalogUrl(url.search).ordenacao, ordenacao);
    assert.equal(url.searchParams.get("ordenacao"), ordenacao === "menor_preco" ? null : ordenacao);
  }
});
