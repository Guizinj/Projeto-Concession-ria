import { formatMileage, formatPrice, formatTransmission, formatYear } from "../formatters.js";
import { createIcon } from "./icons.js";
import { imageUrl } from "./image-url.js";
import { createPhotoGallery } from "./photo-gallery.js";

const STATUSES = { disponivel: "Disponível", reservado: "Reservado", vendido: "Vendido" };

function element(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

export function createStatusBadge(status) {
  const known = Object.hasOwn(STATUSES, status);
  return element("span", `status-badge${known ? ` status-${status}` : ""}`, known ? STATUSES[status] : "Consulte disponibilidade");
}

export function createVehicleCard(vehicle, { headingLevel = 3, eager = false, gallery } = {}) {
  if (!vehicle || typeof vehicle !== "object") throw new TypeError("Veículo inválido.");
  if (![2, 3, 4].includes(headingLevel)) throw new TypeError("Nível de título inválido.");
  const name = [vehicle.marca, vehicle.modelo].filter((part) => typeof part === "string" && part.trim()).join(" ") || "Veículo";
  const version = typeof vehicle.versao === "string" ? vehicle.versao : "";
  const status = Object.hasOwn(STATUSES, vehicle.status) ? STATUSES[vehicle.status] : "Consulte disponibilidade";
  const price = formatPrice(vehicle.preco);
  const slug = vehicle.slug;
  const linkable = typeof slug === "string" && slug.length <= 200 && /^[a-z0-9]+(-[a-z0-9]+)*$/.test(slug);
  const card = element("article", "vehicle-card");
  if (typeof vehicle.id === "string") card.dataset.vehicleId = vehicle.id;
  const link = element(linkable ? "a" : "div", "vehicle-card-link");
  if (linkable) {
    const url = new URL("../../veiculo.html", import.meta.url);
    url.searchParams.set("carro", slug);
    link.href = url.href;
    link.setAttribute("aria-label", `Ver detalhes: ${name}${version ? ` ${version}` : ""}. ${formatYear(vehicle.ano_fabricacao, vehicle.ano_modelo)}. ${price}. ${status}.`);
  }

  const media = gallery ? createPhotoGallery({ ...gallery,
    name: `${name}${version ? ` ${version}` : ""}`, cover: vehicle.imagem_capa,
    eager, imageLink: linkable ? link.href : undefined,
  }) : element("div", "vehicle-card-media");
  if (!gallery) {
    const fallback = element("div", "vehicle-card-fallback");
    fallback.append(createIcon("car"));
    const fallbackLabel = element("p", "", "Foto em breve");
    fallback.append(fallbackLabel);
    media.append(fallback);
    const source = imageUrl(vehicle.imagem_capa?.url);
    if (source) {
      const image = element("img", "vehicle-card-image");
      image.alt = `${name}${version ? ` ${version}` : ""}`;
      image.width = 960;
      image.height = 640;
      image.loading = eager ? "eager" : "lazy";
      image.decoding = "async";
      image.classList.add("is-loading");
      fallbackLabel.textContent = "Carregando foto";
      image.addEventListener("load", () => { fallback.hidden = true; image.classList.remove("is-loading"); }, { once: true });
      image.addEventListener("error", () => { image.hidden = true; fallback.hidden = false; fallbackLabel.textContent = "Foto indisponível"; }, { once: true });
      image.src = source;
      media.prepend(image);
    }
  }
  const badge = createStatusBadge(vehicle.status);
  badge.classList.add("vehicle-card-status");
  media.append(badge);
  if (vehicle.destaque === true) media.append(element("span", "vehicle-card-featured", "Destaque"));

  const body = element("div", "vehicle-card-body");
  body.append(element(`h${headingLevel}`, "vehicle-card-title", name));
  body.append(element("p", "vehicle-card-version", version));
  const specs = element("dl", "vehicle-card-specs");
  for (const [label, value] of [
    ["Ano", formatYear(vehicle.ano_fabricacao, vehicle.ano_modelo)],
    ["Quilometragem", formatMileage(vehicle.quilometragem)],
    ["Câmbio", formatTransmission(vehicle.cambio)],
  ]) {
    const row = element("div");
    row.append(element("dt", "", label), element("dd", "", value));
    specs.append(row);
  }
  body.append(specs);
  const footer = element("div", "vehicle-card-footer");
  footer.append(element("p", "vehicle-card-price", price));
  if (linkable) {
    const action = element("span", "vehicle-card-action");
    action.setAttribute("aria-hidden", "true");
    action.append(createIcon("arrow-up-right"));
    footer.append(action);
  }
  body.append(footer);
  if (gallery) {
    card.classList.add("vehicle-card-has-gallery");
    link.append(body);
    card.append(media, link);
  } else {
    link.append(media, body);
    card.append(link);
  }
  return card;
}
