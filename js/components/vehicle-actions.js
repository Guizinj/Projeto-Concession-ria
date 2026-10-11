import { config } from "../config.js";
import { vehicleLinks } from "../vehicle-links.js";
import { createIcon } from "./icons.js";

const instances = new WeakMap();
let nextId = 0;

function element(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

function canShare(data) {
  if (!window.isSecureContext || typeof navigator.share !== "function") return false;
  try { return typeof navigator.canShare !== "function" || navigator.canShare(data); }
  catch { return false; }
}

export function createVehicleActions(vehicle) {
  const links = vehicleLinks(vehicle, { phone: config.loja.whatsapp, storeName: config.loja.nome });
  const root = element("div", "vehicle-actions");
  root.setAttribute("role", "group");
  root.setAttribute("aria-label", "Contato e compartilhamento do veículo");
  if (!links) return root;

  if (links.whatsapp) {
    const contact = element("a", "button button-primary vehicle-whatsapp-action");
    contact.href = links.whatsapp; contact.target = "_blank"; contact.rel = "noopener noreferrer";
    contact.append(createIcon("message"), element("span", "", links.contactLabel));
    contact.setAttribute("aria-label", `${links.contactLabel} sobre este veículo (abre o WhatsApp)`);
    root.append(contact);
  }

  const row = element("div", "vehicle-actions-row");
  row.append(...root.children);
  const disclosure = element("div", "vehicle-share-disclosure");
  const toggle = element("button", "vehicle-share-toggle");
  toggle.type = "button";
  toggle.setAttribute("aria-label", "Opções de compartilhamento");
  toggle.title = "Compartilhar veículo";
  toggle.setAttribute("aria-expanded", "false");
  const dots = element("span", "vehicle-share-dots");
  dots.setAttribute("aria-hidden", "true");
  dots.append(element("span"), element("span"), element("span"));
  toggle.append(dots);
  const buttons = element("div", "vehicle-share-actions");
  buttons.id = `vehicle-share-options-${++nextId}`;
  buttons.hidden = true;
  buttons.setAttribute("role", "group");
  buttons.setAttribute("aria-label", "Compartilhar veículo");
  toggle.setAttribute("aria-controls", buttons.id);
  const share = element("button", "button button-outline vehicle-share-action");
  share.type = "button"; share.hidden = !canShare(links.share);
  share.append(createIcon("share"), element("span", "", "Compartilhar"));
  const copy = element("button", "button button-outline vehicle-copy-action");
  copy.type = "button";
  copy.append(createIcon("copy"), element("span", "", "Copiar link"));
  buttons.append(element("p", "vehicle-share-caption", "Compartilhar veículo"), share, copy);
  disclosure.append(toggle, buttons);
  row.append(disclosure);

  const feedback = element("p", "vehicle-action-feedback");
  feedback.setAttribute("role", "status"); feedback.setAttribute("aria-atomic", "true");
  const manual = element("div", "vehicle-copy-fallback");
  manual.hidden = true;
  const label = element("label", "", "Link do veículo");
  const input = element("input", "vehicle-share-link");
  input.id = `vehicle-share-link-${++nextId}`;
  label.htmlFor = input.id;
  input.type = "url"; input.readOnly = true; input.value = links.url;
  manual.append(label, input);
  root.append(row, feedback, manual);

  let busy = false, disposed = false, feedbackTimer;
  const lifecycle = new AbortController();
  function closeOptions(restoreFocus = false) {
    buttons.hidden = true;
    toggle.setAttribute("aria-expanded", "false");
    if (restoreFocus && !disposed && root.isConnected) toggle.focus({ preventScroll: true });
  }
  toggle.addEventListener("click", () => {
    if (!buttons.hidden) { closeOptions(true); return; }
    if (busy) return;
    delete buttons.dataset.above;
    buttons.hidden = false;
    toggle.setAttribute("aria-expanded", "true");
    const panel = buttons.getBoundingClientRect();
    const navigation = document.querySelector(".main-nav");
    const navigationTop = navigation && getComputedStyle(navigation).position === "fixed"
      ? navigation.getBoundingClientRect().top : innerHeight;
    const availableBottom = Math.min(innerHeight, navigationTop) - 12;
    if (panel.bottom > availableBottom && toggle.getBoundingClientRect().top > panel.height + 12) buttons.dataset.above = "";
  }, { signal: lifecycle.signal });
  disclosure.addEventListener("keydown", event => {
    if (buttons.hidden) return;
    if (event.key === "Escape") { event.preventDefault(); event.stopPropagation(); closeOptions(true); }
    if (event.key === "ArrowDown" && event.target === toggle) {
      event.preventDefault(); (share.hidden ? copy : share).focus();
    }
  }, { signal: lifecycle.signal });
  document.addEventListener("pointerdown", event => {
    if (!buttons.hidden && !disclosure.contains(event.target)) closeOptions();
  }, { signal: lifecycle.signal });
  disclosure.addEventListener("focusout", event => {
    if (!disclosure.contains(event.relatedTarget)) closeOptions();
  }, { signal: lifecycle.signal });
  function clearFeedbackTimer() { clearTimeout(feedbackTimer); feedbackTimer = undefined; }
  instances.set(root, () => { disposed = true; clearFeedbackTimer(); lifecycle.abort(); });
  function announce(message, temporary = false) {
    if (disposed || !root.isConnected) return;
    clearFeedbackTimer();
    feedback.textContent = message;
    if (temporary) feedbackTimer = setTimeout(() => {
      if (!disposed && root.isConnected) feedback.textContent = "";
      feedbackTimer = undefined;
    }, 3000);
  }
  function manualCopy() {
    if (disposed || !root.isConnected) return;
    manual.hidden = false;
    announce("Selecione e copie o endereço abaixo para compartilhar.");
    input.focus({ preventScroll: true }); input.select();
  }
  async function run(action) {
    if (busy || disposed) return;
    clearFeedbackTimer();
    closeOptions(true);
    busy = true; share.disabled = copy.disabled = true;
    buttons.setAttribute("aria-busy", "true"); feedback.textContent = "";
    try { await action(); }
    finally {
      busy = false;
      if (!disposed) {
        share.disabled = copy.disabled = false; buttons.removeAttribute("aria-busy");
        if (root.isConnected && document.activeElement === document.body) toggle.focus({ preventScroll: true });
      }
    }
  }
  share.addEventListener("click", () => run(async () => {
    try {
      // A chamada ocorre no clique, antes de qualquer espera, preservando a ativação do usuário.
      await navigator.share(links.share);
      announce("Link compartilhado.", true);
    } catch (error) {
      announce(error?.name === "AbortError" ? "Compartilhamento cancelado." : "Não foi possível compartilhar. Use Copiar link.");
    }
  }), { signal: lifecycle.signal });
  copy.addEventListener("click", () => run(async () => {
    try {
      if (!window.isSecureContext || typeof navigator.clipboard?.writeText !== "function") { manualCopy(); return; }
      await navigator.clipboard.writeText(links.url);
      if (disposed || !root.isConnected) return;
      manual.hidden = true;
      announce("Link copiado!", true);
    } catch { manualCopy(); }
  }), { signal: lifecycle.signal });
  input.addEventListener("focus", () => input.select(), { signal: lifecycle.signal });
  return root;
}

export function disposeVehicleActions(root) {
  const targets = [...root.querySelectorAll(".vehicle-actions")];
  if (root.matches?.(".vehicle-actions")) targets.unshift(root);
  for (const target of targets) { instances.get(target)?.(); instances.delete(target); }
}
