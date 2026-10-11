import { initializeLayout } from "../components/layout.js";
import { disposePhotoGalleries } from "../components/photo-gallery.js";
import { createVehicleDetails, vehicleName } from "../components/vehicle-details.js";
import { disposeVehicleActions } from "../components/vehicle-actions.js";
import { createVehicleCard } from "../components/vehicle-card.js";
import { createLoadingGrid, createStatePanel } from "../components/states.js";
import { buscarVeiculoPorSlug, listarSemelhantes, listarImagensDoVeiculo } from "../veiculos.js";

initializeLayout("Detalhes do veículo");

const area = document.getElementById("vehicle-content");
const title = document.getElementById("veiculo-titulo");
const version = document.getElementById("vehicle-version");
const similarSection = document.getElementById("vehicle-similar");
const similarArea = document.getElementById("similar-results");
const similarTitle = document.getElementById("vehicle-similar-title");
const slug = new URLSearchParams(location.search).get("carro");
let controller, similarController;
function replace(root, ...children) { disposePhotoGalleries(root); disposeVehicleActions(root); root.replaceChildren(...children); }
function resetHeading(heading = "Detalhes do veículo") {
  title.textContent = heading;
  version.hidden = true; version.textContent = "";
  initializeLayout(heading);
}

async function loadSimilar(vehicle, page) {
  if (page.signal.aborted || page !== controller) return;
  if (similarArea.getAttribute("aria-busy") === "true" && similarController && !similarController.signal.aborted) return;
  similarController?.abort();
  const current = similarController = new AbortController();
  if (similarArea.contains(document.activeElement)) similarTitle.focus({ preventScroll: true });
  replace(similarArea, createLoadingGrid({ count: 4 }));
  similarArea.setAttribute("aria-busy", "true");
  try {
    const vehicles = await listarSemelhantes(vehicle, { signal: current.signal });
    if (page.signal.aborted || page !== controller || current.signal.aborted) return;
    if (!vehicles.length) {
      replace(similarArea, createStatePanel({ headingLevel: 3, heading: "Mais opções no estoque", message: "Ainda não há outros veículos desta categoria. Consulte o estoque completo para ver outras opções." }));
      return;
    }
    const grid = document.createElement("div");
    grid.className = "vehicle-grid";
    grid.append(...vehicles.map(item => createVehicleCard(item, { headingLevel: 3,
      gallery: { loadImages: options => listarImagensDoVeiculo(item.id, options) } })));
    replace(similarArea, grid);
  } catch (error) {
    if (page.signal.aborted || page !== controller || current.signal.aborted || error.name === "AbortError") return;
    replace(similarArea, createStatePanel({ type: "error", headingLevel: 3, heading: "Não conseguimos carregar as outras opções",
      message: "As informações deste veículo continuam disponíveis. Tente carregar as outras opções novamente.", onRetry: () => loadSimilar(vehicle, page) }));
  } finally {
    if (similarController === current) similarArea.setAttribute("aria-busy", "false");
  }
}

async function load() {
  if (area.getAttribute("aria-busy") === "true" && controller && !controller.signal.aborted) return;
  controller?.abort(); similarController?.abort();
  const current = controller = new AbortController();
  if (area.contains(document.activeElement) || similarArea.contains(document.activeElement)) title.focus({ preventScroll: true });
  resetHeading();
  similarSection.hidden = true;
  replace(similarArea);
  replace(area, createLoadingGrid({ count: 1 }));
  area.setAttribute("aria-busy", "true");
  try {
    const vehicle = await buscarVeiculoPorSlug(slug, { signal: current.signal });
    if (current.signal.aborted || current !== controller) return;
    if (!vehicle) {
      resetHeading("Veículo não encontrado");
      const panel = createStatePanel({ heading: "Confira outras opções", message: "Este anúncio não existe ou não está disponível para consulta. Encontre seu próximo veículo no estoque atual." });
      const link = document.createElement("a");
      link.className = "button button-primary"; link.href = new URL("../../estoque.html", import.meta.url).href; link.textContent = "Visitar o estoque";
      panel.append(link);
      replace(area, panel);
      return;
    }
    const name = vehicleName(vehicle);
    title.textContent = name;
    version.textContent = typeof vehicle.versao === "string" ? vehicle.versao.trim() : "";
    version.hidden = !version.textContent;
    initializeLayout(`${name}${version.textContent ? ` ${version.textContent}` : ""}`, { vehicle });
    replace(area, createVehicleDetails(vehicle));
    similarSection.hidden = false;
    loadSimilar(vehicle, current);
  } catch (error) {
    if (current.signal.aborted || error.name === "AbortError") return;
    replace(area, createStatePanel({ type: "error", heading: "Não conseguimos carregar o veículo",
      message: "Verifique sua conexão e tente novamente para consultar as fotos e informações do anúncio.", onRetry: load }));
  } finally {
    if (controller === current) area.setAttribute("aria-busy", "false");
  }
}
window.addEventListener("pagehide", () => { controller?.abort(); similarController?.abort(); disposeVehicleActions(area); });
window.addEventListener("pageshow", event => { if (event.persisted) load(); });
load();
