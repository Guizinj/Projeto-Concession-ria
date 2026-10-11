import { initializeLayout } from "../components/layout.js";
import { createVehicleCard } from "../components/vehicle-card.js";
import { createLoadingGrid, createStatePanel } from "../components/states.js";
import { listarDestaques, listarImagensDoVeiculo } from "../veiculos.js";
import { disposePhotoGalleries } from "../components/photo-gallery.js";

initializeLayout("Início");

const searchForm = document.querySelector(".home-search");
const searchInput = document.getElementById("home-search");
searchInput.addEventListener("input", () => searchInput.setCustomValidity(""));
searchForm.addEventListener("submit", event => {
  if (/[\p{L}\p{N}]/u.test(searchInput.value)) return;
  event.preventDefault();
  searchInput.setCustomValidity("Digite uma marca, modelo ou versão.");
  searchInput.reportValidity();
});

function selection(id, query) {
  const area = document.getElementById(id);
  let controller;
  function replace(...children) { disposePhotoGalleries(area); area.replaceChildren(...children); }
  async function load() {
    controller?.abort();
    const current = controller = new AbortController();
    if (area.contains(document.activeElement)) document.getElementById(`${id}-titulo`).focus();
    replace(createLoadingGrid({ count: 6 }));
    try {
      const vehicles = await query({ signal: current.signal });
      if (current.signal.aborted) return;
      if (!vehicles.length) {
        replace(createStatePanel({ headingLevel: 3, heading: "Novas opções em breve", message: "Ainda não há veículos nesta seleção. Consulte também o estoque completo." }));
        return;
      }
      const grid = document.createElement("div");
      grid.className = "vehicle-grid";
      grid.append(...vehicles.map(vehicle => createVehicleCard(vehicle, { headingLevel: 3, gallery: { loadImages: options => listarImagensDoVeiculo(vehicle.id, options) } })));
      replace(grid);
    } catch (error) {
      if (current.signal.aborted || error.name === "AbortError") return;
      replace(createStatePanel({ type: "error", headingLevel: 3, onRetry: load }));
    }
  }
  window.addEventListener("pagehide", () => controller?.abort());
  window.addEventListener("pageshow", event => { if (event.persisted) load(); });
  load();
}
selection("destaques", listarDestaques);
