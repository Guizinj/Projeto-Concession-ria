import { config } from "../config.js";
import { whatsappUrl } from "../vehicle-links.js";
import { createIcon } from "./icons.js";
import { scrollToSection } from "./navigation.js";

const APP_URL = new URL("../../", import.meta.url);
const initialized = new WeakSet();
const destinations = [
  ["Início", "index.html", "home", "Conheça o nosso showroom"],
  ["Estoque", "estoque.html", "grid", "Encontre o seu próximo carro"],
  ["Explorar", "explorar.html", "compass", "Veja os veículos no seu ritmo"],
  ["Localização", "localizacao.html", "pin", "Venha conhecer a loja"],
];

function element(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

export function initializeSiteMenu() {
  if (initialized.has(document)) return;
  const toggles = [...document.querySelectorAll("[data-menu-toggle]")];
  if (!toggles.length) return;
  const dialog = element("dialog", "site-menu");
  if (typeof dialog.showModal !== "function") return;
  initialized.add(document);
  dialog.id = "site-menu";
  dialog.setAttribute("aria-labelledby", "site-menu-title");

  const header = element("div", "site-menu-header");
  const intro = element("div");
  intro.append(element("p", "site-menu-identity", config.loja.nome));
  const heading = element("h2", "site-menu-title", "Para onde vamos?");
  heading.id = "site-menu-title";
  intro.append(heading);
  const close = element("button", "site-menu-close");
  close.type = "button"; close.autofocus = true;
  close.setAttribute("aria-label", "Fechar menu");
  const closeShape = element("span", "site-menu-close-shape");
  closeShape.setAttribute("aria-hidden", "true");
  close.append(closeShape); header.append(intro, close);

  const body = element("div", "site-menu-body");
  const nav = element("nav", "site-menu-nav");
  nav.setAttribute("aria-label", "Páginas do showroom");
  for (const [label, path, icon, description] of destinations) {
    const link = element("a", "site-menu-link");
    link.href = new URL(path, APP_URL).href;
    const symbol = element("span", "site-menu-symbol");
    symbol.append(createIcon(icon));
    const copy = element("span", "site-menu-copy");
    copy.append(element("span", "site-menu-link-label", label), element("span", "site-menu-description", description));
    link.append(symbol, copy, createIcon("arrow-right"));
    nav.append(link);
  }
  body.append(nav);
  const shortcuts = element("nav", "site-menu-shortcuts");
  shortcuts.setAttribute("aria-label", "Seleções da Home");
  for (const [label, path] of [["Destaques", "index.html#destaques-titulo"]]) {
    const link = element("a", "site-menu-shortcut", label);
    link.href = new URL(path, APP_URL).href;
    link.append(createIcon("arrow-up-right"));
    shortcuts.append(link);
  }
  body.append(shortcuts);
  const contactUrl = whatsappUrl(config.loja.whatsapp);
  if (contactUrl) {
    const contact = element("a", "site-menu-contact");
    contact.href = contactUrl; contact.target = "_blank"; contact.rel = "noopener noreferrer";
    contact.append(createIcon("message"), element("span", "", "Converse com a gente"), createIcon("arrow-up-right"));
    body.append(contact);
  }
  dialog.append(header, body); document.body.append(dialog);

  function updateCurrent() {
    let current = new URL(location.href);
    if (current.pathname === APP_URL.pathname) current = new URL(`index.html${current.hash}`, APP_URL);
    const links = [...dialog.querySelectorAll("nav a")];
    let active = links.find(link => link.href === current.origin + current.pathname + current.hash);
    if (!active) active = links.find(link => !new URL(link.href).hash && new URL(link.href).pathname === current.pathname);
    if (!active && current.pathname.endsWith("/veiculo.html")) active = links[1];
    links.forEach(link => {
      if (link === active) link.setAttribute("aria-current", new URL(link.href).hash ? "location" : "page");
      else link.removeAttribute("aria-current");
    });
  }
  let closingTask, closingTimer, resolveClose, suspended = false;
  function closed() {
    // Um evento close tardio não deve desfazer uma nova abertura.
    if (dialog.open) return;
    document.documentElement.classList.remove("site-menu-open");
    toggles.forEach(toggle => toggle.setAttribute("aria-expanded", "false"));
  }
  function finishClose() {
    clearTimeout(closingTimer);
    if (dialog.open) dialog.close();
    dialog.removeAttribute("data-closing");
    closed();
    const resolve = resolveClose;
    closingTask = resolveClose = undefined;
    resolve?.();
  }
  function dismiss(immediate = false) {
    if (immediate || matchMedia("(prefers-reduced-motion: reduce)").matches) {
      finishClose(); return Promise.resolve();
    }
    if (closingTask) return closingTask;
    if (!dialog.open) return Promise.resolve();
    dialog.setAttribute("data-closing", "");
    closingTask = new Promise(resolve => { resolveClose = resolve; });
    const duration = parseFloat(getComputedStyle(dialog).animationDuration) * 1000;
    closingTimer = setTimeout(finishClose, (Number.isFinite(duration) ? duration : 240) + 40);
    return closingTask;
  }
  toggles.forEach(toggle => {
    toggle.hidden = false;
    toggle.setAttribute("aria-controls", dialog.id);
    toggle.setAttribute("aria-haspopup", "dialog");
    toggle.setAttribute("aria-expanded", "false");
    toggle.addEventListener("click", () => {
      if (closingTask) return;
      if (dialog.open) { dismiss(); return; }
      updateCurrent(); dialog.showModal();
      document.documentElement.classList.add("site-menu-open");
      toggles.forEach(button => button.setAttribute("aria-expanded", "true"));
    });
  });
  close.addEventListener("click", () => dismiss());
  dialog.addEventListener("cancel", event => { event.preventDefault(); dismiss(); });
  dialog.addEventListener("close", closed);
  dialog.addEventListener("animationend", event => {
    if (event.target === dialog && event.animationName === "menu-leave" && closingTask) finishClose();
  });
  let backdropPress = false;
  function outside(event) {
    if (event.target !== dialog) return false;
    const bounds = dialog.getBoundingClientRect();
    return event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom;
  }
  dialog.addEventListener("pointerdown", event => { backdropPress = outside(event); });
  dialog.addEventListener("pointerup", event => { if (backdropPress && outside(event)) dismiss(); backdropPress = false; });
  dialog.addEventListener("pointercancel", () => { backdropPress = false; });
  dialog.addEventListener("click", event => {
    const link = event.target.closest("a");
    if (!link || event.defaultPrevented || event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
    if (link.target === "_blank") { dismiss(); return; }
    event.preventDefault();
    if (closingTask) return;
    const destination = new URL(link.href);
    dismiss().then(() => {
      if (suspended) return;
      if (!scrollToSection(destination)) location.assign(destination.href);
    });
  });
  window.addEventListener("pagehide", () => { suspended = true; dismiss(true); });
  window.addEventListener("pageshow", () => { suspended = false; });
}
