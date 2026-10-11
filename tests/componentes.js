import { initializeLayout } from "../js/components/layout.js";
import { createVehicleCard } from "../js/components/vehicle-card.js";
import { createLoadingGrid, createStatePanel } from "../js/components/states.js";

// Fixtures locais: esta prévia não consulta o banco nem lista estoque real.
const localImage = (filename) => ({ url: new URL(`../assets/images/demo/${filename}`, import.meta.url).href });
const fixtures = [
  { id: "preview-001", slug: "demo-corolla-xei-2022-001", marca: "Toyota", modelo: "Corolla", versao: "XEi 2.0 Flex", ano_fabricacao: 2021, ano_modelo: 2022, quilometragem: 38500, cambio: "cvt", preco: 129900, status: "disponivel", destaque: true, imagem_capa: localImage("capa.png") },
  { id: "preview-002", slug: "demo-civic-touring-2021-002", marca: "Honda", modelo: "Civic", versao: "Touring 1.5 Turbo", ano_fabricacao: 2020, ano_modelo: 2021, quilometragem: 42000, cambio: "cvt", preco: 142900, status: "reservado", destaque: false, imagem_capa: localImage("galeria.png") },
  { id: "preview-003", slug: "demo-renegade-vendido-2021-015", marca: "Jeep", modelo: "Renegade", versao: "Longitude 1.8 Flex", ano_fabricacao: 2020, ano_modelo: 2021, quilometragem: 48000, cambio: "automatico", preco: 99900, status: "vendido", destaque: false, imagem_capa: null },
];

initializeLayout("Componentes");
document.querySelector("#preview-cards").replaceChildren(...fixtures.map((vehicle, index) => createVehicleCard(vehicle, { eager: index === 0 })));
document.querySelector("#preview-loading").replaceChildren(createLoadingGrid({ count: 3 }));
let retries = 0;
document.querySelector("#preview-states").replaceChildren(
  createStatePanel({ type: "empty", headingLevel: 3 }),
  createStatePanel({ type: "error", headingLevel: 3, onRetry: () => {
    retries += 1;
    const feedback = document.querySelector("#preview-retry-feedback");
    feedback.textContent = `Nova tentativa acionada na prévia (${retries}).`;
    feedback.hidden = false;
  } }),
);

document.querySelectorAll("[data-preview-theme]").forEach((button) => {
  button.addEventListener("click", () => {
    const dark = button.dataset.previewTheme === "dark";
    document.body.classList.toggle("theme-dark", dark);
    document.querySelector('meta[name="theme-color"]').content = dark ? "#0e1117" : "#f7f8fb";
    document.querySelectorAll("[data-preview-theme]").forEach((option) => option.setAttribute("aria-pressed", String(option === button)));
  });
});
