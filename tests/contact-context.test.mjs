import test from "node:test";
import assert from "node:assert/strict";
import { contactContextUrl } from "../js/contact-context.js";

const phone = "5581993369736";
test("acessos ao WhatsApp têm mensagem breve conforme página/origem e preservam o destino", () => {
  for (const page of ["index.html", "estoque.html", "explorar.html", "veiculo.html", "localizacao.html"]) {
    for (const source of ["header", "menu", "footer", "direct", "visit"]) {
      const url = new URL(contactContextUrl(phone, { page, source }));
      assert.equal(url.origin, "https://wa.me"); assert.equal(url.pathname, `/${phone}`);
      assert.equal(url.searchParams.size, 1);
      assert.match(url.searchParams.get("text"), /^Olá!/);
      assert.ok(url.searchParams.get("text").length < 140);
    }
  }
  const message = (page, source) => new URL(contactContextUrl(phone, { page, source })).searchParams.get("text");
  assert.notEqual(message("index.html", "header"), message("estoque.html", "header"));
  assert.notEqual(message("estoque.html", "header"), message("estoque.html", "footer"));
  assert.match(message("explorar.html", "menu"), /Explorar/);
  assert.match(message("localizacao.html", "visit"), /visita.*test drive/);
});

test("contexto de anúncio mantém identidade, status e URL; origem desconhecida/telefone inválido não criam destinos arbitrários", () => {
  const vehicle = { slug: "onix-ltz", marca: "Chevrolet", modelo: "Onix", versao: "LTZ", codigo: "001", ano_fabricacao: 2022, ano_modelo: 2023 };
  for (const [status, expected] of [["disponivel", "ainda está disponível"], ["reservado", "está reservado"], ["vendido", "foi vendido"]]) {
    for (const source of ["header", "menu", "footer"]) {
      const url = new URL(contactContextUrl(phone, { page: "/subpasta/veiculo.html", source, vehicle: { ...vehicle, status }, baseUrl: "https://showroom.example/subpasta/" }));
      const text = url.searchParams.get("text");
      assert.ok(text.includes("Chevrolet Onix LTZ")); assert.ok(text.includes(expected));
      assert.ok(text.endsWith("veiculo.html?carro=onix-ltz"));
    }
  }
  assert.match(new URL(contactContextUrl(phone, { page: "constructor", source: "__proto__" })).searchParams.get("text"), /Vim pelo site/);
  for (const invalid of ["", null, "javascript:alert(1)", "5581993369736?text=evil"])
    assert.equal(contactContextUrl(invalid, { page: "estoque.html" }), null);
});
