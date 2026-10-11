import { initializeLayout } from "../components/layout.js";
import { createVehicleCard } from "../components/vehicle-card.js";
import { createLoadingGrid, createStatePanel } from "../components/states.js";
import { createIcon } from "../components/icons.js";
import { createExploreQueue } from "../explore-queue.js";
import { swipeDirection } from "../explore-gesture.js";
import { getPublicImageUrl } from "../supabase.js";

initializeLayout("Explorar");

const queue = createExploreQueue();
const stage = document.getElementById("explore-stage");
const area = document.getElementById("explore-vehicle");
const feedback = document.getElementById("explore-feedback");
const controls = document.getElementById("explore-controls");
const previous = document.getElementById("explore-previous");
const next = document.getElementById("explore-next");
const position = document.getElementById("explore-position");
let preload, preloadUrl, pointer, suppressClickUntil = 0, suspended = false;

function clearPreload() {
  preload?.removeAttribute("src");
  preload = null; preloadUrl = null;
}

function anticipate(vehicle) {
  // A URL é reconstruída de um caminho de Storage validado, sem credenciais.
  const url = getPublicImageUrl(vehicle?.imagem_capa?.storage_path);
  if (url === preloadUrl) return;
  clearPreload();
  if (!url || navigator.connection?.saveData) return;
  preload = new Image();
  preload.decoding = "async";
  preload.referrerPolicy = "no-referrer";
  preloadUrl = url;
  preload.src = url;
}

function updateControls() {
  const state = queue.snapshot();
  controls.hidden = !state.loaded;
  previous.disabled = state.pending || (!state.ended && state.index <= 0);
  next.disabled = state.pending || state.ended;
  next.replaceChildren(document.createTextNode(state.pending ? "Carregando…" : !state.hasMore && state.index === state.loaded - 1 ? "Concluir seleção" : "Próximo"), createIcon("arrow-right"));
  stage.setAttribute("aria-busy", String(state.pending));
}

function render() {
  const state = queue.snapshot();
  // Se o elemento focado será removido, ofereça um destino estável.
  if (area.contains(document.activeElement) || feedback.contains(document.activeElement)) stage.focus({ preventScroll: true });
  feedback.replaceChildren();
  if (state.ended) {
    clearPreload();
    position.textContent = state.loaded ? `${state.loaded} veículos apresentados.` : "";
    const panel = createStatePanel({ heading: state.loaded ? "Você viu toda a seleção" : "Novas opções em breve",
      message: state.loaded ? "Volte para rever um veículo ou consulte o estoque para comparar as opções." : "Ainda não há veículos publicados nesta seleção. Volte em breve para descobrir novidades." });
    const restart = document.createElement("button");
    restart.type = "button"; restart.className = "button button-outline";
    restart.textContent = state.loaded ? "Explorar novamente" : "Atualizar seleção";
    restart.addEventListener("click", () => run(() => queue.restart()));
    panel.append(restart);
    area.replaceChildren(panel);
  } else if (state.current) {
    const card = createVehicleCard(state.current, { headingLevel: 2, eager: true });
    card.classList.add("explore-card");
    // Diferencia a navegação do card do gesto de descoberta.
    const action = card.querySelector(".vehicle-card-action");
    if (action) { action.classList.add("explore-details-action"); action.prepend(document.createTextNode("Ver detalhes")); }
    area.replaceChildren(card);
    position.textContent = `Veículo ${state.index + 1} · ${state.current.marca} ${state.current.modelo}`;
    anticipate(state.next);
  }
  updateControls();
  // Um botão desativado após a navegação não deve reter o foco.
  if (document.activeElement === previous && previous.disabled || document.activeElement === next && next.disabled) stage.focus({ preventScroll: true });
}

async function run(action) {
  if (queue.snapshot().pending || suspended) return;
  if (feedback.contains(document.activeElement) || area.contains(document.activeElement)) stage.focus({ preventScroll: true });
  feedback.replaceChildren();
  const task = action();
  const state = queue.snapshot();
  updateControls();
  if (state.pending) {
    if (!state.current) area.replaceChildren(createLoadingGrid({ count: 1 }));
    else feedback.textContent = "Carregando os próximos veículos…";
  }
  try {
    const changed = await task;
    if (!suspended && changed) render();
  } catch (error) {
    if (suspended || error.name === "AbortError") return;
    const panel = createStatePanel({ type: "error", heading: state.current ? "Não conseguimos carregar os próximos veículos" : undefined,
      message: "Verifique sua conexão e tente novamente. Você também pode consultar o estoque.", onRetry: () => run(action) });
    if (state.current) feedback.replaceChildren(panel);
    else area.replaceChildren(panel);
  } finally {
    if (!suspended) updateControls();
  }
}

previous.addEventListener("click", () => { if (queue.previous()) render(); });
next.addEventListener("click", () => run(() => queue.next()));
stage.addEventListener("keydown", event => {
  if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey || event.repeat || event.target.closest("input, select, textarea, [contenteditable]")) return;
  if (event.key !== "ArrowRight" && event.key !== "ArrowLeft") return;
  event.preventDefault();
  if (event.key === "ArrowRight") run(() => queue.next());
  else if (queue.previous()) render();
});

stage.addEventListener("pointerdown", event => {
  // Um toque novo é intencional e pode abrir detalhes logo após um swipe.
  suppressClickUntil = 0;
  if (!event.isPrimary || event.button !== 0 || queue.snapshot().pending || queue.snapshot().ended || !event.target.closest(".explore-card")) { pointer = null; return; }
  pointer = { id: event.pointerId, x: event.clientX, y: event.clientY, time: performance.now() };
});
stage.addEventListener("pointermove", event => {
  if (!pointer || pointer.id !== event.pointerId) return;
  const dx = event.clientX - pointer.x, dy = event.clientY - pointer.y;
  if (Math.abs(dy) > 12 && Math.abs(dy) >= Math.abs(dx)) { pointer = null; return; }
  if (Math.abs(dx) > 12 && Math.abs(dx) > Math.abs(dy) * 1.5) {
    stage.setPointerCapture(event.pointerId);
    event.preventDefault();
  }
});
stage.addEventListener("pointerup", event => {
  if (!pointer || pointer.id !== event.pointerId) return;
  const direction = swipeDirection({ dx: event.clientX - pointer.x, dy: event.clientY - pointer.y,
    duration: performance.now() - pointer.time, width: stage.clientWidth });
  pointer = null;
  if (!direction) return;
  event.preventDefault();
  suppressClickUntil = performance.now() + 500;
  if (direction > 0) run(() => queue.next());
  else if (queue.previous()) render();
});
stage.addEventListener("pointercancel", () => { pointer = null; });
stage.addEventListener("lostpointercapture", event => { if (event.target === stage) pointer = null; });
stage.addEventListener("dragstart", event => { if (event.target.closest(".explore-card")) event.preventDefault(); });
stage.addEventListener("click", event => {
  if (event.detail > 0 && performance.now() < suppressClickUntil && event.target.closest(".vehicle-card-link")) { event.preventDefault(); event.stopPropagation(); }
}, true);
window.addEventListener("pagehide", () => { suspended = true; queue.stop(); clearPreload(); pointer = null; });
window.addEventListener("pageshow", event => {
  if (!event.persisted) return;
  suspended = false;
  if (queue.snapshot().current || queue.snapshot().ended) render();
  else run(() => queue.next());
});
run(() => queue.next());
