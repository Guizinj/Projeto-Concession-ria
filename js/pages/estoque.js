import { initializeLayout } from "../components/layout.js";
import { createVehicleCard } from "../components/vehicle-card.js";
import { createLoadingGrid, createStatePanel } from "../components/states.js";
import { listarVeiculos, listarImagensDoVeiculo } from "../veiculos.js";
import { disposePhotoGalleries } from "../components/photo-gallery.js";
import { DEFAULT_SORT, FILTER_NAMES, readCatalogUrl, catalogUrl } from "../catalogo-url.js";
import { scrollToElement } from "../components/navigation.js";

initializeLayout("Estoque");

const form = document.getElementById("stock-filters");
const area = document.getElementById("stock-results");
const feedback = document.getElementById("filter-feedback");
const pagination = document.getElementById("pagination-feedback");
const more = document.getElementById("load-more");
const count = document.getElementById("result-count");
const heading = document.getElementById("estoque-titulo");
let state, controller, generation = 0, timer, busy = false, offset = null, total = 0;
form.hidden = false;
function replace(...children) { disposePhotoGalleries(area); area.replaceChildren(...children); }

function cancel() {
  clearTimeout(timer);
  generation++;
  controller?.abort();
  busy = false;
  more.hidden = true;
}

async function load(append = false, { revealResults = false, focusResults = false } = {}) {
  if (busy || (append && offset === null)) return;
  busy = true;
  const version = ++generation;
  controller?.abort();
  controller = new AbortController();
  const signal = controller.signal;
  const moveFocus = area.contains(document.activeElement) || pagination.contains(document.activeElement);
  if (moveFocus) heading.focus({ preventScroll: true });
  pagination.replaceChildren();
  more.disabled = true;
  more.textContent = "Carregando…";
  if (!append) {
    total = 0; offset = null;
    more.hidden = true;
    count.textContent = "";
    replace(createLoadingGrid({ count: 12 }));
  } else count.textContent = "Carregando mais veículos…";
  try {
    const result = await listarVeiculos({ ...state, offset: append ? offset : 0, signal });
    if (version !== generation || signal.aborted) return;
    const cards = result.veiculos.map(vehicle => createVehicleCard(vehicle, { headingLevel: 3, gallery: { loadImages: options => listarImagensDoVeiculo(vehicle.id, options) } }));
    if (append) area.querySelector(".vehicle-grid").append(...cards);
    else if (cards.length) {
      const grid = document.createElement("div");
      grid.className = "vehicle-grid";
      grid.append(...cards);
      replace(grid);
    } else replace(createStatePanel({ headingLevel: 3 }));
    total += cards.length;
    offset = result.proximoOffset;
    more.hidden = !result.temMais;
    count.textContent = `${total} ${total === 1 ? "veículo exibido" : "veículos exibidos"}${result.temMais ? " · Há mais opções" : ""}`;
    if (append) {
      // Ao remover/desativar o botão, preserve a sequência de leitura por teclado.
      if (cards.length) cards[0].querySelector("a")?.focus({ preventScroll: true });
      else heading.focus({ preventScroll: true });
    }
  } catch (error) {
    if (version !== generation || signal.aborted || error.name === "AbortError") return;
    const panel = createStatePanel({ type: "error", headingLevel: 3,
      heading: append ? "Não conseguimos carregar mais veículos" : undefined,
      onRetry: () => load(append, { revealResults, focusResults }) });
    if (append) pagination.replaceChildren(panel);
    else replace(panel);
    more.hidden = true;
    count.textContent = append ? `${total} veículos exibidos` : "";
  } finally {
    if (version === generation) {
      busy = false;
      more.disabled = false;
      more.textContent = "Carregar mais";
      // Só revele o resultado da busca atual, depois de renderizar carros/vazio/erro.
      if (!append && revealResults) scrollToElement(heading, { focus: focusResults });
    }
  }
}

function requireSearchTerm({ focus = false } = {}) {
  if (form.elements.busca.value.trim()) return true;
  cancel();
  if (area.querySelector(".loading-state")) { replace(); count.textContent = ""; }
  else if (area.querySelector(".vehicle-grid")) {
    more.hidden = offset === null;
    more.disabled = false;
    more.textContent = "Carregar mais";
    count.textContent = `${total} ${total === 1 ? "veículo exibido" : "veículos exibidos"}${offset !== null ? " · Há mais opções" : ""}`;
  }
  feedback.textContent = "Digite uma marca, modelo ou versão para buscar. Você também pode usar os filtros ou limpar a seleção.";
  if (focus) form.elements.busca.focus();
  return false;
}

function apply({ revealResults = true, focusResults = false, requireSearch = false, requireCriteria = false } = {}) {
  if (requireSearch && !requireSearchTerm({ focus: focusResults })) return;
  cancel();
  for (const name of FILTER_NAMES) form.elements[name].setCustomValidity("");
  const raw = Object.fromEntries(new FormData(form));
  const hasCriteria = FILTER_NAMES.some(name => raw[name]?.trim()) || raw.ordenacao !== DEFAULT_SORT;
  if (requireCriteria && !hasCriteria) { requireSearchTerm({ focus: true }); return; }
  for (const [min, max, label] of [["precoMin", "precoMax", "preço"], ["anoMin", "anoMax", "ano-modelo"]]) {
    if (raw[min] && raw[max] && Number(raw[min]) > Number(raw[max])) {
      form.elements[max].setCustomValidity(`O ${label} máximo deve ser maior ou igual ao mínimo.`);
    }
  }
  if (raw.busca.trim() && !/[\p{L}\p{N}]/u.test(raw.busca)) form.elements.busca.setCustomValidity("Digite uma marca, modelo ou versão.");
  if (!form.checkValidity()) {
    feedback.textContent = "Confira os campos: use valores válidos e mantenha o mínimo menor ou igual ao máximo.";
    replace(); pagination.replaceChildren(); count.textContent = "";
    return;
  }
  // O input numérico aceita notação exponencial; a URL usa decimais comuns.
  for (const name of ["precoMin", "precoMax", "anoMin", "anoMax", "kmMax"]) {
    if (raw[name]) raw[name] = String(Number(raw[name]));
  }
  state = readCatalogUrl(new URLSearchParams(raw));
  const url = catalogUrl(location.href, state);
  if (url.href !== location.href) history.pushState(null, "", url);
  feedback.textContent = "";
  load(false, { revealResults, focusResults });
}

function restore({ revealResults = false } = {}) {
  cancel();
  state = readCatalogUrl(location.search);
  const searchRequested = !!state.filtros.busca;
  for (const name of FILTER_NAMES) {
    form.elements[name].value = state.filtros[name] ?? "";
    form.elements[name].setCustomValidity("");
  }
  form.elements.ordenacao.value = state.ordenacao;
  document.getElementById("filter-details").open = FILTER_NAMES.some(name => name !== "busca" && state.filtros[name]);
  feedback.textContent = state.discarded ? "Alguns parâmetros do endereço eram inválidos e foram ignorados." : "";
  history.replaceState(history.state, "", catalogUrl(location.href, state));
  load(false, { revealResults: revealResults && searchRequested && !location.hash, focusResults: true });
}

form.addEventListener("input", event => {
  if (event.isComposing || event.target.tagName === "SELECT") return;
  const requireSearch = event.target === form.elements.busca;
  if (requireSearch && !requireSearchTerm()) return;
  cancel();
  count.textContent = "Atualizando busca…";
  replace(createLoadingGrid({ count: 3 }));
  pagination.replaceChildren();
  timer = setTimeout(() => apply({ requireSearch }), 300);
});
form.addEventListener("compositionend", event => {
  const requireSearch = event.target === form.elements.busca;
  if (requireSearch && !requireSearchTerm()) return;
  cancel(); timer = setTimeout(() => apply({ requireSearch }), 300);
});
form.addEventListener("change", event => { if (event.target.tagName === "SELECT") apply(); });
form.elements.busca.addEventListener("keydown", event => {
  if (event.key !== "Enter" || event.isComposing) return;
  event.preventDefault();
  apply({ focusResults: true, requireSearch: true });
});
form.addEventListener("submit", event => { event.preventDefault(); apply({ focusResults: true, requireCriteria: true }); });
// Permite corrigir uma validade customizada antes da próxima tentativa de submit.
form.addEventListener("input", event => event.target.setCustomValidity(""));
document.getElementById("clear-filters").addEventListener("click", () => {
  form.reset(); apply({ revealResults: false }); form.elements.busca.focus({ preventScroll: true });
});
more.addEventListener("click", () => load(true));
window.addEventListener("popstate", () => restore());
window.addEventListener("pagehide", cancel);
window.addEventListener("pageshow", event => { if (event.persisted) restore(); });
restore({ revealResults: true });
