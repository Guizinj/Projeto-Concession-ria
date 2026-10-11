import { formatYear } from "./formatters.js";

const APP_URL = new URL("../", import.meta.url);

function text(value) {
  return typeof value === "string" ? value.trim().replace(/\s+/g, " ") : "";
}

export function whatsappUrl(phone, message = "") {
  const number = typeof phone === "string" ? phone.trim() : "";
  if (!/^55\d{10,11}$/.test(number)) return null;
  const url = new URL(`https://wa.me/${number}`);
  if (typeof message === "string" && message) url.searchParams.set("text", message);
  return url.href;
}

export function vehicleUrl(slug, baseUrl = APP_URL) {
  if (typeof slug !== "string" || slug.length > 200 || !/^[a-z0-9]+(-[a-z0-9]+)*$/.test(slug)) return null;
  try {
    const base = new URL(baseUrl);
    if (!["https:", "http:"].includes(base.protocol) || base.username || base.password) return null;
    base.search = ""; base.hash = "";
    const url = new URL("veiculo.html", base);
    url.searchParams.set("carro", slug);
    return url.href;
  } catch {
    return null;
  }
}

export function vehicleLinks(vehicle, { phone, storeName, baseUrl = APP_URL } = {}) {
  const url = vehicleUrl(vehicle?.slug, baseUrl);
  if (!url) return null;
  const name = [text(vehicle.marca), text(vehicle.modelo), text(vehicle.versao)].filter(Boolean).join(" ") || "Veículo";
  const identity = `${name} — ${formatYear(vehicle.ano_fabricacao, vehicle.ano_modelo)}`;
  const code = text(vehicle.codigo);
  const reference = `${identity}${code ? ` (código ${code})` : ""}`;
  const status = vehicle.status;
  const request = status === "disponivel" ? `Olá! Tenho interesse no ${reference}. Ele ainda está disponível?`
    : status === "reservado" ? `Olá! Vi que o ${reference} está reservado. Gostaria de saber sobre a reserva ou outras opções semelhantes.`
    : status === "vendido" ? `Olá! Vi que o ${reference} foi vendido. Gostaria de conhecer outras opções semelhantes.`
    : `Olá! Gostaria de consultar a disponibilidade do ${reference}.`;
  const availability = status === "reservado" ? "Veículo reservado. Consulte a loja."
    : status === "vendido" ? "Veículo vendido. Consulte outras opções na loja."
    : "Consulte a disponibilidade com a loja.";
  return {
    url,
    whatsapp: whatsappUrl(phone, `${request}\n\n${url}`),
    contactLabel: status === "vendido" ? "Consultar outras opções" : status === "reservado" ? "Consultar reserva" : "Falar no WhatsApp",
    share: { title: `${identity}${text(storeName) ? ` | ${text(storeName)}` : ""}`, text: `${identity}. ${availability}`, url },
  };
}
