import { vehicleLinks, whatsappUrl } from "./vehicle-links.js";

const messages = Object.freeze({
  "index.html": {
    header: "Olá! Conheci a loja pelo site e gostaria de saber mais sobre os veículos.",
    menu: "Olá! Estou conhecendo o showroom e gostaria de uma orientação.",
    footer: "Olá! Vi o site da loja e gostaria de conversar com a equipe.",
  },
  "estoque.html": {
    header: "Olá! Estou vendo o estoque e gostaria de saber mais sobre os veículos.",
    menu: "Olá! Estou vendo o estoque e gostaria de ajuda para escolher um veículo.",
    footer: "Olá! Consultei o estoque no site e gostaria de conversar com a equipe.",
  },
  "explorar.html": {
    menu: "Olá! Vi os veículos no Explorar e gostaria de saber mais.",
  },
  "veiculo.html": {
    header: "Olá! Estou na página de um veículo e gostaria de tirar uma dúvida.",
    menu: "Olá! Estou consultando um anúncio e gostaria de ajuda da equipe.",
    footer: "Olá! Vi um anúncio no site e gostaria de conversar com a equipe.",
  },
  "localizacao.html": {
    header: "Olá! Gostaria de falar com a equipe e conhecer melhor a loja.",
    menu: "Olá! Estou na página de contato e gostaria de uma orientação.",
    footer: "Olá! Consultei a localização da loja e gostaria de combinar uma visita.",
  },
});

export function contactContextUrl(phone, { page = "", source = "header", vehicle, baseUrl } = {}) {
  if (source === "direct") return whatsappUrl(phone, "Olá! Gostaria de tirar uma dúvida com a equipe da loja.");
  if (source === "visit") return whatsappUrl(phone, "Olá! Gostaria de agendar uma visita e saber sobre um test drive.");
  const filename = typeof page === "string" ? page.split("/").pop() || "index.html" : "index.html";
  if (filename === "veiculo.html" && vehicle) {
    const link = vehicleLinks(vehicle, { phone, baseUrl });
    if (link?.whatsapp) return link.whatsapp;
  }
  const contexts = Object.hasOwn(messages, filename) ? messages[filename] : null;
  const message = contexts && Object.hasOwn(contexts, source) ? contexts[source] : "Olá! Vim pelo site e gostaria de conversar com a equipe da loja.";
  return whatsappUrl(phone, message);
}
