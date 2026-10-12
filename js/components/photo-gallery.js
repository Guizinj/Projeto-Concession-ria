import { createIcon } from "./icons.js";
import { imageUrl } from "./image-url.js";
import { imageKey, orderedImages } from "../gallery-images.js";

const disposers = new WeakMap();
function node(tag, className, text) {
  const element = document.createElement(tag);
  element.className = className;
  if (text !== undefined) element.textContent = text;
  return element;
}
export function disposePhotoGalleries(root) {
  if (root.matches?.(".photo-gallery")) disposers.get(root)?.();
  for (const gallery of root.querySelectorAll(".photo-gallery")) disposers.get(gallery)?.();
}

export function createPhotoGallery({ name = "Veículo", cover = null, images, loadImages, eager = false, imageLink, feed = false, onInteraction } = {}) {
  const root = node("div", "vehicle-card-media photo-gallery");
  root.tabIndex = 0;
  root.setAttribute("role", "group");
  root.setAttribute("aria-roledescription", "carrossel");
  root.setAttribute("aria-label", `Fotos: ${name}. Use as setas esquerda e direita.`);
  const destination = imageUrl(imageLink);
  const viewport = node(destination ? "a" : "div", "photo-viewport");
  if (destination) { viewport.href = destination; viewport.tabIndex = -1; viewport.setAttribute("aria-hidden", "true"); }
  const fallback = node("div", "vehicle-card-fallback");
  const fallbackLabel = node("p", "", "Foto em breve");
  fallback.append(createIcon("car"), fallbackLabel);
  viewport.append(fallback);
  const controls = node("div", "photo-controls");
  const previous = node("button", "photo-arrow photo-previous");
  const next = node("button", "photo-arrow photo-next");
  for (const [button, label, icon] of [[previous, "Foto anterior", "arrow-left"], [next, "Próxima foto", "arrow-right"]]) {
    button.type = "button"; button.setAttribute("aria-label", label); button.append(createIcon(icon));
  }
  controls.append(previous, next);
  const count = node("span", "photo-count", "Fotos");
  count.setAttribute("role", "status");
  count.setAttribute("aria-live", "off");
  const feedback = node("div", "photo-feedback");
  feedback.setAttribute("role", "status");
  root.append(viewport, controls, count, feedback);
  let photos = orderedImages(images ?? (cover ? [cover] : []));
  let index = Math.max(0, photos.findIndex(photo => imageKey(photo) === imageKey(cover)));
  let loaded = Array.isArray(images) || typeof loadImages !== "function";
  let controller, disposed = false, busy = false, activeImage, preload, pointer, suppressClick = false;

  function clearPreload() { preload?.removeAttribute("src"); preload = null; }
  function update() {
    if (loaded && photos.length <= 1 && controls.contains(document.activeElement)) root.focus({ preventScroll: true });
    controls.hidden = loaded && photos.length <= 1;
    count.hidden = loaded && !photos.length;
    count.textContent = loaded ? `${photos.length ? index + 1 : 0} / ${photos.length}` : "Fotos";
    count.setAttribute("aria-label", loaded ? `Foto ${photos.length ? index + 1 : 0} de ${photos.length}` : "Mais fotos ao deslizar ou usar as setas");
    previous.disabled = next.disabled = busy;
    root.setAttribute("aria-busy", String(busy));
  }
  function render(direction = 0) {
    activeImage?.remove();
    root.querySelector(".feed-image-backdrop")?.remove();
    clearPreload();
    fallback.hidden = false;
    const source = imageUrl(photos[index]?.url);
    fallbackLabel.textContent = photos.length ? "Foto indisponível" : "Foto em breve";
    if (source) {
      const image = node("img", "vehicle-card-image is-loading");
      if (direction) image.dataset.direction = direction > 0 ? "next" : "previous";
      activeImage = image;
      image.alt = `${name} — foto ${index + 1}`;
      image.width = 960; image.height = 640;
      image.loading = eager ? "eager" : "lazy"; image.decoding = "async";
      image.referrerPolicy = "no-referrer";
      fallbackLabel.textContent = "Carregando foto";
      image.addEventListener("load", () => { if (activeImage === image && !disposed) { fallback.hidden = true; image.classList.remove("is-loading"); } }, { once: true });
      image.addEventListener("error", () => { if (activeImage === image && !disposed) { image.hidden = true; fallback.hidden = false; fallbackLabel.textContent = "Foto indisponível"; root.querySelector(".feed-image-backdrop")?.remove(); } }, { once: true });
      image.src = source;
      viewport.prepend(image);
      if (feed) {
        const backdrop = image.cloneNode(false);
        backdrop.className = "feed-image-backdrop"; backdrop.alt = ""; backdrop.setAttribute("aria-hidden", "true");
        viewport.prepend(backdrop);
      }
    } else activeImage = null;
    if (loaded && photos.length > 1 && !navigator.connection?.saveData) {
      const nextSource = imageUrl(photos[(index + 1) % photos.length]?.url);
      if (nextSource) { preload = new Image(); preload.decoding = "async"; preload.referrerPolicy = "no-referrer"; preload.src = nextSource; }
    }
    update();
  }

  async function move(direction) {
    if (disposed || busy) return;
    onInteraction?.();
    count.setAttribute("aria-live", "polite");
    feedback.replaceChildren();
    if (!loaded) {
      busy = true; update();
      feedback.textContent = "Carregando fotos…";
      controller = new AbortController();
      try {
        const result = await loadImages({ signal: controller.signal });
        if (disposed || controller.signal.aborted) return;
        photos = orderedImages(result);
        index = Math.max(0, photos.findIndex(photo => imageKey(photo) === imageKey(cover)));
        loaded = true;
      } catch (error) {
        if (disposed || error.name === "AbortError") return;
        feedback.append(node("span", "", "Não foi possível carregar as fotos. "));
        const retry = node("button", "photo-retry", "Tentar novamente");
        retry.type = "button";
        retry.addEventListener("click", () => move(direction));
        feedback.append(retry);
        return;
      } finally { busy = false; if (!disposed) update(); }
    }
    feedback.replaceChildren();
    if (photos.length > 1) index = (index + direction + photos.length) % photos.length;
    render(direction);
  }

  previous.addEventListener("click", event => { event.stopPropagation(); move(-1); });
  next.addEventListener("click", event => { event.stopPropagation(); move(1); });
  root.addEventListener("keydown", event => {
    if (!["ArrowLeft", "ArrowRight"].includes(event.key) || event.altKey || event.ctrlKey || event.metaKey || event.shiftKey || event.repeat) return;
    event.preventDefault(); event.stopPropagation(); move(event.key === "ArrowRight" ? 1 : -1);
  });
  if (!feed) {
    // Decidir no primeiro movimento evita que um swipe diagonal vire scroll.
    // Touch Events continuam disponíveis quando o navegador cancela o pointer.
    let touchGesture = null;
    root.addEventListener("touchstart", event => {
      suppressClick = false;
      touchGesture = null;
      if (event.touches.length !== 1 || event.target.closest("button") || busy || disposed || (loaded && photos.length < 2)) return;
      const touch = event.touches[0];
      touchGesture = { id: touch.identifier, x: touch.clientX, y: touch.clientY, axis: null };
    }, { passive: true });
    root.addEventListener("touchmove", event => {
      if (!touchGesture) return;
      if (event.touches.length !== 1 || disposed) { touchGesture = null; return; }
      const touch = Array.from(event.touches).find(item => item.identifier === touchGesture.id);
      if (!touch) return;
      const dx = touch.clientX - touchGesture.x, dy = touch.clientY - touchGesture.y;
      if (!touchGesture.axis) {
        if (Math.max(Math.abs(dx), Math.abs(dy)) < 6) return;
        touchGesture.axis = Math.abs(dx) > Math.abs(dy) ? "horizontal" : "vertical";
      }
      if (touchGesture.axis !== "horizontal") return;
      // Uma rolagem já iniciada não pode ser tomada de volta pela galeria.
      if (!event.cancelable) { touchGesture = null; return; }
      suppressClick = true;
      event.preventDefault(); event.stopPropagation();
    }, { passive: false });
    root.addEventListener("touchend", event => {
      if (!touchGesture) return;
      const touch = Array.from(event.changedTouches).find(item => item.identifier === touchGesture.id);
      if (!touch) return;
      const gesture = touchGesture;
      touchGesture = null;
      if (gesture.axis !== "horizontal" || disposed) return;
      suppressClick = true;
      event.stopPropagation();
      const dx = touch.clientX - gesture.x;
      if (Math.abs(dx) >= Math.min(48, Math.max(32, root.clientWidth * 0.1))) move(dx < 0 ? 1 : -1);
    }, { passive: true });
    root.addEventListener("touchcancel", () => { touchGesture = null; }, { passive: true });
  }
  root.addEventListener("pointerdown", event => {
    suppressClick = false;
    if (!event.isPrimary || event.button !== 0 || event.target.closest("button") || busy || disposed) { pointer = null; return; }
    pointer = { id: event.pointerId, x: event.clientX, y: event.clientY, time: performance.now(), horizontal: false };
  });
  root.addEventListener("pointermove", event => {
    if (!pointer || pointer.id !== event.pointerId) return;
    const dx = event.clientX - pointer.x, dy = event.clientY - pointer.y;
    // Pointer Events detectam pequenos arrastos antes do primeiro touchmove.
    // A troca de foto e a decisão de scroll ficam com os Touch Events acima.
    if (!feed && event.pointerType === "touch") {
      if (Math.max(Math.abs(dx), Math.abs(dy)) >= 8) suppressClick = true;
      return;
    }
    if (!pointer.horizontal && Math.abs(dy) > 12 && Math.abs(dy) >= Math.abs(dx)) { pointer = null; return; }
    if (Math.abs(dx) > 12 && Math.abs(dx) > Math.abs(dy) * 1.5) {
      if (!pointer.horizontal) { pointer.horizontal = true; root.dispatchEvent(new CustomEvent("photo-swipe", { bubbles: true })); }
      root.setPointerCapture(event.pointerId);
      event.preventDefault(); event.stopPropagation();
    }
  });
  root.addEventListener("pointerup", event => {
    if (!pointer || pointer.id !== event.pointerId) return;
    if (!feed && event.pointerType === "touch") { pointer = null; return; }
    const dx = event.clientX - pointer.x, dy = event.clientY - pointer.y;
    const horizontal = pointer.horizontal;
    const swipe = horizontal && Math.abs(dx) >= Math.min(90, Math.max(45, root.clientWidth * 0.12)) && Math.abs(dx) > Math.abs(dy) * 1.5 && performance.now() - pointer.time <= 1200;
    pointer = null;
    if (!horizontal) return;
    suppressClick = true;
    event.preventDefault(); event.stopPropagation();
    if (swipe) move(dx < 0 ? 1 : -1);
  });
  root.addEventListener("pointercancel", () => { pointer = null; });
  root.addEventListener("lostpointercapture", event => { if (event.target === root) pointer = null; });
  root.addEventListener("click", event => { if (suppressClick && event.detail > 0 && !event.target.closest("button")) { event.preventDefault(); event.stopPropagation(); } }, true);
  root.addEventListener("dragstart", event => event.preventDefault());
  function dispose() {
    disposed = true; controller?.abort(); clearPreload(); pointer = null;
    window.removeEventListener("pagehide", dispose);
  }
  window.addEventListener("pagehide", dispose, { once: true });
  disposers.set(root, dispose);
  render();
  return root;
}
