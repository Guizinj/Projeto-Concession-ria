import { initializeLayout } from "../components/layout.js";
import { createVehicleCard } from "../components/vehicle-card.js";
import { createLoadingGrid, createStatePanel } from "../components/states.js";
import { createIcon } from "../components/icons.js";
import { createExploreQueue } from "../explore-queue.js";
import { verticalSwipeDirection } from "../explore-vertical-gesture.js";
import { getPublicImageUrl } from "../supabase.js";
import { listarImagensDoVeiculo } from "../veiculos.js";
import { disposePhotoGalleries } from "../components/photo-gallery.js";

initializeLayout("Explorar");

const queue = createExploreQueue();
const stage = document.getElementById("explore-stage");
const area = document.getElementById("explore-vehicle");
const feedback = document.getElementById("explore-feedback");
const controls = document.getElementById("explore-controls");
const previous = document.getElementById("explore-previous");
const next = document.getElementById("explore-next");
const position = document.getElementById("explore-position");
const counter = document.getElementById("feed-counter");
const hint = document.getElementById("feed-hint");
let preload, preloadUrl, pointer, suppressClickUntil = 0, suspended = false;
let running = false, moving = false, transitionTimer, lastRenderedIndex = -1;
let wheelDelta = 0, lastWheelAt = 0, wheelCommitted = false;
function replace(...children) { disposePhotoGalleries(area); area.replaceChildren(...children); }

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
  previous.disabled = running || moving || state.pending || (!state.ended && state.index <= 0);
  next.disabled = running || moving || state.pending || state.ended;
  const label = document.createElement("span");
  label.className = "sr-only";
  label.textContent = state.pending ? "Carregando…" : !state.hasMore && state.index === state.loaded - 1 ? "Concluir seleção" : "Próximo";
  next.replaceChildren(label, createIcon("arrow-right"));
  stage.setAttribute("aria-busy", String(state.pending));
  stage.dataset.transitioning = String(moving);
}

function render(direction = 1) {
  const state = queue.snapshot();
  // Se o elemento focado será removido, ofereça um destino estável.
  if (area.contains(document.activeElement) || feedback.contains(document.activeElement)) stage.focus({ preventScroll: true });
  feedback.replaceChildren();
  if (state.ended) {
    clearPreload();
    position.textContent = state.loaded ? `${state.loaded} veículos apresentados.` : "";
    counter.textContent = state.loaded ? "· Fim" : "";
    hint.hidden = true;
    const panel = createStatePanel({ heading: state.loaded ? "Você viu toda a seleção" : "Novas opções em breve",
      message: state.loaded ? "Volte para rever um veículo ou consulte o estoque para comparar as opções." : "Ainda não há veículos publicados nesta seleção. Volte em breve para descobrir novidades." });
    const restart = document.createElement("button");
    restart.type = "button"; restart.className = "button button-outline";
    restart.textContent = state.loaded ? "Explorar novamente" : "Atualizar seleção";
    restart.addEventListener("click", () => run(() => queue.restart()));
    panel.append(restart);
    replace(panel);
  } else if (state.current) {
    const card = createVehicleCard(state.current, { headingLevel: 2, eager: true, gallery: { feed: true,
      loadImages: options => listarImagensDoVeiculo(state.current.id, options), onInteraction: clearPreload } });
    card.classList.add("explore-card");
    const changedPosition = state.index !== lastRenderedIndex;
    if (changedPosition) card.dataset.direction = direction > 0 ? "next" : "previous";
    lastRenderedIndex = state.index;
    if (changedPosition && !matchMedia("(prefers-reduced-motion: reduce)").matches) {
      moving = true;
      clearTimeout(transitionTimer);
      transitionTimer = setTimeout(() => { moving = false; updateControls(); }, 280);
    }
    // Diferencia a navegação do card do gesto de descoberta.
    const action = card.querySelector(".vehicle-card-action");
    if (action) { action.classList.add("explore-details-action"); action.prepend(document.createTextNode("Ver detalhes")); }
    replace(card);
    sizeObserver.disconnect();
    sizeObserver.observe(card.querySelector(".vehicle-card-body"));
    sizeObserver.observe(stage);
    position.textContent = `Veículo ${state.index + 1} · ${state.current.marca} ${state.current.modelo}`;
    counter.textContent = `· ${String(state.index + 1).padStart(2, "0")}`;
    hint.hidden = false;
    anticipate(state.next);
  }
  updateControls();
  // Um botão desativado após a navegação não deve reter o foco.
  if (document.activeElement === previous && state.index <= 0 || document.activeElement === next && state.ended) stage.focus({ preventScroll: true });
}

async function run(action) {
  if (queue.snapshot().pending || suspended || running || moving) return;
  running = true;
  if (feedback.contains(document.activeElement) || area.contains(document.activeElement)) stage.focus({ preventScroll: true });
  feedback.replaceChildren();
  const task = action();
  const state = queue.snapshot();
  updateControls();
  if (state.pending) {
    if (!state.current) replace(createLoadingGrid({ count: 1 }));
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
    else replace(panel);
  } finally {
    running = false;
    if (!suspended) updateControls();
  }
}

function goPrevious() {
  if (running || moving || suspended) return;
  if (queue.previous()) render(-1);
}
previous.addEventListener("click", goPrevious);
next.addEventListener("click", () => run(() => queue.next()));
stage.addEventListener("keydown", event => {
  if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey || event.repeat || event.target.closest("input, select, textarea, [contenteditable]")) return;
  if (!["ArrowDown", "ArrowUp", "PageDown", "PageUp"].includes(event.key)) return;
  event.preventDefault();
  if (["ArrowDown", "PageDown"].includes(event.key)) run(() => queue.next());
  else goPrevious();
});

stage.addEventListener("pointerdown", event => {
  // Um toque novo é intencional e pode abrir detalhes logo após um swipe.
  suppressClickUntil = 0;
  if (!event.isPrimary || event.button !== 0 || event.target.closest("button") || running || moving || queue.snapshot().pending || queue.snapshot().ended || !event.target.closest(".explore-card") || event.target.closest(".vehicle-card-body")?.scrollHeight > event.target.closest(".vehicle-card-body")?.clientHeight) { pointer = null; return; }
  pointer = { id: event.pointerId, x: event.clientX, y: event.clientY, time: performance.now() };
});
stage.addEventListener("pointermove", event => {
  if (!pointer || pointer.id !== event.pointerId) return;
  const dx = event.clientX - pointer.x, dy = event.clientY - pointer.y;
  if (Math.abs(dx) > 12 && Math.abs(dx) >= Math.abs(dy)) { pointer = null; return; }
  if (Math.abs(dy) > 12 && Math.abs(dy) > Math.abs(dx) * 1.5) {
    stage.setPointerCapture(event.pointerId);
    event.preventDefault();
    if (!matchMedia("(prefers-reduced-motion: reduce)").matches) {
      const card = area.querySelector(".explore-card");
      card.style.transition = "none";
      card.style.transform = `translateY(${Math.max(-60, Math.min(60, dy * 0.3))}px)`;
    }
  }
});
stage.addEventListener("pointerup", event => {
  if (!pointer || pointer.id !== event.pointerId) return;
  const direction = verticalSwipeDirection({ dx: event.clientX - pointer.x, dy: event.clientY - pointer.y,
    duration: performance.now() - pointer.time, height: stage.clientHeight });
  pointer = null;
  resetDrag();
  if (!direction) return;
  event.preventDefault();
  suppressClickUntil = performance.now() + 500;
  if (direction > 0) run(() => queue.next());
  else goPrevious();
});
function resetDrag() {
  const card = area.querySelector(".explore-card");
  if (card) { card.style.removeProperty("transform"); card.style.removeProperty("transition"); }
}
stage.addEventListener("photo-swipe", () => { pointer = null; resetDrag(); });
stage.addEventListener("pointercancel", () => { pointer = null; resetDrag(); });
stage.addEventListener("lostpointercapture", event => { if (event.target === stage) { pointer = null; resetDrag(); } });
stage.addEventListener("dragstart", event => { if (event.target.closest(".explore-card")) event.preventDefault(); });
stage.addEventListener("click", event => {
  if (event.detail > 0 && performance.now() < suppressClickUntil && event.target.closest(".vehicle-card-link, .photo-viewport")) { event.preventDefault(); event.stopPropagation(); }
}, true);
stage.addEventListener("wheel", event => {
  if (event.ctrlKey || event.altKey || Math.abs(event.deltaX) > Math.abs(event.deltaY)) return;
  const scrollable = event.target.closest(".vehicle-card-body, .state-panel");
  if (scrollable && scrollable.scrollHeight > scrollable.clientHeight) return;
  event.preventDefault();
  const now = performance.now();
  if (now - lastWheelAt > 180) { wheelDelta = 0; wheelCommitted = false; }
  lastWheelAt = now;
  if (wheelCommitted || running || moving || queue.snapshot().pending) return;
  const delta = event.deltaY * (event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? stage.clientHeight : 1);
  if (Math.sign(delta) !== Math.sign(wheelDelta)) wheelDelta = 0;
  wheelDelta += delta;
  if (Math.abs(wheelDelta) < 70) return;
  wheelCommitted = true;
  if (wheelDelta > 0) run(() => queue.next()); else goPrevious();
}, { passive: false });

const sizeObserver = new ResizeObserver(() => {
  const body = area.querySelector(".vehicle-card-body");
  if (body) {
    body.style.touchAction = body.scrollHeight > body.clientHeight ? "pan-y pinch-zoom" : "pan-x pinch-zoom";
    body.closest(".explore-card").style.setProperty("--feed-stage-height", `${stage.clientHeight}px`);
    body.closest(".explore-card").style.setProperty("--feed-info-height", `${body.clientHeight}px`);
  }
});
sizeObserver.observe(area);
window.addEventListener("pagehide", () => {
  suspended = true; queue.stop(); clearPreload(); pointer = null;
  clearTimeout(transitionTimer); moving = false; running = false; wheelCommitted = false;
});
window.addEventListener("pageshow", event => {
  if (!event.persisted) return;
  suspended = false;
  if (queue.snapshot().current || queue.snapshot().ended) render();
  else run(() => queue.next());
});
run(() => queue.next());
