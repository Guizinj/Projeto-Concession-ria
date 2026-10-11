import test from "node:test";
import assert from "node:assert/strict";
import { buildContactMessage } from "../js/contact-message.js";
import { whatsappUrl } from "../js/vehicle-links.js";

const input = { name: "  Ana   Maria  ", subject: "vehicle", vehicle: "  Onix LTZ  ", message: "Gostaria de saber mais sobre esse veículo." };

test("contato prepara texto legível e codifica dados como mensagem, sem mudar o destino do WhatsApp", () => {
  const message = buildContactMessage({ ...input, vehicle: 'Onix & ?phone=outro#carro', message: '<img src=x onerror=alert(1)> Quero conhecer o carro.\nPodemos conversar?' });
  assert.match(message, /Meu nome é Ana Maria\./);
  assert.ok(message.includes('Veículo de interesse: Onix & ?phone=outro#carro'));
  const url = new URL(whatsappUrl("5581993369736", message));
  assert.equal(url.origin, "https://wa.me");
  assert.equal(url.pathname, "/5581993369736");
  assert.equal(url.searchParams.size, 1);
  assert.equal(url.searchParams.get("text"), message);
  assert.equal(url.hash, "");
});

test("contato recusa nome/mensagem vazios, tamanho excessivo e assuntos que não pertencem ao formulário", () => {
  for (const changes of [{ name: "  " }, { name: "A" }, { name: "A".repeat(81) },
    { message: "\n    \t" }, { message: "curta" }, { message: "a".repeat(1001) },
    { vehicle: "x".repeat(101) }, { subject: "__proto__" }, { subject: "constructor" }, { subject: "qualquer" }]) {
    assert.equal(buildContactMessage({ ...input, ...changes }), null);
  }
  assert.equal(buildContactMessage(null), null);
  assert.ok(buildContactMessage({ ...input, vehicle: "" }));
});

test("test drive/visita tratam a data como preferência, rejeitam calendário inválido/passado e dispensam data", () => {
  const appointment = { ...input, subject: "test-drive", date: "2026-10-20" };
  assert.match(buildContactMessage(appointment, { today: "2026-10-11" }), /20\/10\/2026 \(a confirmar com a equipe\)/);
  for (const date of ["2026-02-30", "2026-10-10", "20/10/2026", "javascript:alert(1)"])
    assert.equal(buildContactMessage({ ...appointment, date }, { today: "2026-10-11" }), null);
  assert.ok(buildContactMessage({ ...appointment, date: "" }));
  assert.match(buildContactMessage({ ...appointment, subject: "visit" }), /Quero visitar a loja/);
  assert.equal(buildContactMessage({ ...input, date: "2026-10-20" }).includes("Dia de preferência"), false);
});
