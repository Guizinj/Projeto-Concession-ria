import { formatCategory, formatFuel, formatMileage, formatPrice, formatTransmission, formatYear } from "../formatters.js";
import { createPhotoGallery } from "./photo-gallery.js";
import { createStatusBadge } from "./vehicle-card.js";
import { orderedImages } from "../gallery-images.js";
import { createVehicleActions } from "./vehicle-actions.js";

function element(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}
function text(value, fallback = "Não informado") {
  return typeof value === "string" && value.trim() ? value.trim() : fallback;
}
function items(values) {
  return [...new Set((Array.isArray(values) ? values : []).filter(value => typeof value === "string" && value.trim()).map(value => value.trim()))];
}
function section(className, title, id) {
  const node = element("section", `${className} surface`);
  const heading = element("h2", "", title);
  heading.id = id;
  node.setAttribute("aria-labelledby", id);
  node.append(heading);
  return node;
}

export function vehicleName(vehicle) {
  return [text(vehicle?.marca, ""), text(vehicle?.modelo, "")].filter(Boolean).join(" ") || "Veículo";
}

export function createVehicleDetails(vehicle) {
  const name = vehicleName(vehicle);
  const article = element("article", "vehicle-detail");
  if (typeof vehicle.id === "string") article.dataset.vehicleId = vehicle.id;
  const overview = element("div", "vehicle-overview");
  const photos = element("section", "vehicle-photo-section");
  photos.setAttribute("aria-labelledby", "vehicle-gallery-title");
  const galleryTitle = element("h2", "sr-only", "Fotos do veículo");
  galleryTitle.id = "vehicle-gallery-title";
  const images = orderedImages(vehicle.imagens);
  const galleryArea = element("div");
  galleryArea.id = "vehicle-photos";
  galleryArea.append(createPhotoGallery({ name, images, cover: images.find(image => image.principal === true) || images[0], eager: true }));
  photos.append(galleryTitle, galleryArea);
  if (images.length > 1) photos.append(element("p", "vehicle-photo-hint", "Deslize para ver mais fotos"));

  const summary = section("vehicle-summary", "Preço e disponibilidade", "vehicle-summary-title");
  summary.querySelector("h2").className = "sr-only";
  summary.append(createStatusBadge(vehicle.status), element("p", "vehicle-price-label", "Valor do anúncio"), element("p", "vehicle-detail-price", formatPrice(vehicle.preco)));
  const summarySpecs = element("dl", "vehicle-summary-specs");
  for (const [label, value] of [
    ["Ano", formatYear(vehicle.ano_fabricacao, vehicle.ano_modelo)],
    ["Quilometragem", formatMileage(vehicle.quilometragem)],
    ["Câmbio", formatTransmission(vehicle.cambio)],
  ]) {
    const row = element("div");
    row.append(element("dt", "", label), element("dd", "", value));
    summarySpecs.append(row);
  }
  summary.append(summarySpecs);
  if (text(vehicle.codigo, "")) summary.append(element("p", "vehicle-code", `Código: ${text(vehicle.codigo)}`));
  if (vehicle.status !== "disponivel") {
    const notice = element("div", `vehicle-status-notice${vehicle.status === "reservado" ? " is-reserved" : ""}`);
    notice.setAttribute("role", "status");
    const sold = vehicle.status === "vendido", reserved = vehicle.status === "reservado";
    notice.append(element("h2", "", sold ? "Este veículo foi vendido" : reserved ? "Veículo reservado" : "Consulte a disponibilidade"));
    notice.append(element("p", "", sold ? "Este anúncio permanece disponível para consulta. Encontre outras opções no estoque atual." : reserved ? "Este veículo está reservado. Você pode consultar outras opções no estoque." : "A disponibilidade deste veículo precisa ser confirmada com a loja."));
    summary.append(notice);
  }
  const highlights = items(vehicle.destaques);
  if (highlights.length) {
    const list = element("ul", "vehicle-highlights");
    list.setAttribute("aria-label", "Destaques do veículo");
    list.append(...highlights.map(value => element("li", "", value)));
    summary.append(list);
  }
  summary.append(createVehicleActions(vehicle));
  const stock = element("a", "text-link vehicle-stock-action", vehicle.status === "vendido" ? "Ver estoque atual" : "Ver estoque completo");
  stock.href = new URL("../../estoque.html", import.meta.url).href;
  summary.append(stock);
  overview.append(photos, summary);

  const specifications = section("vehicle-specifications", "Ficha técnica", "vehicle-specifications-title");
  const specs = element("dl", "vehicle-detail-specs");
  for (const [label, value] of [
    ["Marca", text(vehicle.marca)], ["Modelo", text(vehicle.modelo)], ["Versão", text(vehicle.versao)],
    ["Ano fabricação / modelo", formatYear(vehicle.ano_fabricacao, vehicle.ano_modelo)],
    ["Quilometragem", formatMileage(vehicle.quilometragem)], ["Câmbio", formatTransmission(vehicle.cambio)],
    ["Combustível", formatFuel(vehicle.combustivel)], ["Categoria", formatCategory(vehicle.categoria)],
    ["Cor", text(vehicle.cor)], ["Motorização", text(vehicle.motorizacao)],
  ]) {
    const row = element("div");
    row.append(element("dt", "", label), element("dd", "", value));
    specs.append(row);
  }
  specifications.append(specs);
  const description = section("vehicle-description", "Sobre o veículo", "vehicle-description-title");
  description.append(element("p", "vehicle-description-text", text(vehicle.descricao, "Descrição não informada.")));
  const equipment = section("vehicle-equipment", "Equipamentos e opcionais", "vehicle-equipment-title");
  const options = items(vehicle.opcionais);
  if (options.length) {
    const list = element("ul", "vehicle-equipment-list");
    list.append(...options.map(value => element("li", "", value)));
    equipment.append(list);
  } else equipment.append(element("p", "vehicle-empty-field", "Equipamentos não informados."));
  const information = element("div", "vehicle-information");
  const narrative = element("div", "vehicle-narrative");
  narrative.append(description, equipment);
  information.append(specifications, narrative);
  article.append(overview, information);
  return article;
}
