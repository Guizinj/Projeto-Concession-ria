import test from "node:test";
import assert from "node:assert/strict";
import { whatsappUrl, vehicleUrl, vehicleLinks } from "../js/vehicle-links.js";

const baseUrl = "https://showroom.example/loja/";
const vehicle = { slug: "honda-civic-touring-001", marca: "Honda", modelo: "Civic", versao: "Touring", codigo: "001",
  ano_fabricacao: 2020, ano_modelo: 2021, status: "disponivel" };
const options = { baseUrl, phone: "5581993369736", storeName: "Vértice Motors" };

test("WhatsApp usa somente o telefone brasileiro validado e codifica a mensagem inteira", () => {
  const message = 'Olá! Código 001 & reservado?\nhttps://showroom.example/?carro=civic#fotos <script>alert(1)</script>';
  const url = new URL(whatsappUrl(options.phone, message));
  assert.equal(url.origin, "https://wa.me");
  assert.equal(url.pathname, "/5581993369736");
  assert.deepEqual([...url.searchParams], [["text", message]]);
  for (const phone of [null, 5581993369736, "81993369736", "+5581993369736", "55/81993369736", "5581993369736?text=x", "55", "5581993369736000"]) {
    assert.equal(whatsappUrl(phone, message), null);
  }
});

test("link individual mantém a subpasta e o slug, descartando query e fragmento anteriores", () => {
  const expected = "https://showroom.example/loja/veiculo.html?carro=honda-civic-touring-001";
  assert.equal(vehicleUrl(vehicle.slug, baseUrl), expected);
  assert.equal(vehicleUrl(vehicle.slug, "https://showroom.example/loja/veiculo.html?token=privado&carro=outro#fotos"), expected);
  for (const slug of [null, "", "../civic", "https://evil.example", "civic&token=x", "Civic", "civic--1", "civic#fotos", "a".repeat(201)]) assert.equal(vehicleUrl(slug, baseUrl), null);
  for (const base of ["javascript:alert(1)", "file:///private/", "https://usuario:senha@showroom.example/", "invalido"]) assert.equal(vehicleUrl(vehicle.slug, base), null);
});

test("contato e compartilhamento identificam o anúncio e preservam os avisos de cada status", () => {
  for (const [status, message, label, shareNotice] of [
    ["disponivel", "Ele ainda está disponível?", "Falar no WhatsApp", "Consulte a disponibilidade"],
    ["reservado", "está reservado", "Consultar reserva", "Veículo reservado"],
    ["vendido", "foi vendido", "Consultar outras opções", "Veículo vendido"],
  ]) {
    const links = vehicleLinks({ ...vehicle, status }, options);
    const text = new URL(links.whatsapp).searchParams.get("text");
    assert.ok(text.includes("Honda Civic Touring — 2020/2021 (código 001)"));
    assert.ok(text.includes(message));
    assert.ok(text.endsWith(links.url));
    assert.equal(links.contactLabel, label);
    assert.equal(links.share.url, links.url);
    assert.ok(links.share.title.includes("Vértice Motors"));
    assert.ok(links.share.text.includes(shareNotice));
    assert.equal(new URL(links.url).searchParams.size, 1);
  }
});

test("campos ausentes e contato pendente têm fallback sem criar um destino externo", () => {
  assert.equal(vehicleLinks({ ...vehicle, slug: "../invalido" }, options), null);
  const links = vehicleLinks({ slug: "veiculo-001", marca: " Honda\n", modelo: " Civic\t", status: "desconhecido" }, { baseUrl });
  assert.equal(links.whatsapp, null);
  assert.ok(links.share.title.startsWith("Honda Civic"));
  assert.ok(links.share.text.includes("Consulte a disponibilidade"));
});
