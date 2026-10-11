import { config } from "../config.js";
import { whatsappUrl } from "../vehicle-links.js";
import { initializeSiteMenu } from "./site-menu.js";
import { initializeInstitutionalFooter } from "./institutional-footer.js";
import { initializeNavigation } from "./navigation.js";

const APP_URL = new URL("../../", import.meta.url);

function setText(selector, text) {
  document.querySelectorAll(selector).forEach((element) => {
    element.textContent = text;
  });
}

function configureExternalLink(selector, value) {
  let url = null;
  try {
    const candidate = new URL(value);
    if (candidate.protocol === "https:" && !candidate.username && !candidate.password) url = candidate;
  } catch {
    // Endereços ausentes ou inválidos permanecem ocultos.
  }
  document.querySelectorAll(selector).forEach((link) => {
    link.hidden = !url;
    if (url) link.href = url.href;
    else link.removeAttribute("href");
  });
  return !!url;
}

export function initializeLayout(pageTitle) {
  initializeSiteMenu();
  initializeInstitutionalFooter();
  initializeNavigation();
  document.title = `${pageTitle} | ${config.loja.nome}`;
  setText("[data-brand-name]", config.loja.nome);
  setText("[data-brand-description]", config.loja.descricao);
  setText("[data-store-address]", config.loja.endereco || "Localização em breve.");
  setText("[data-current-year]", String(new Date().getFullYear()));

  document.querySelectorAll("[data-brand-link]").forEach((link) => {
    link.setAttribute("aria-label", `${config.loja.nome} — início`);
  });

  document.querySelectorAll("[data-brand-logo]").forEach((image) => {
    image.src = new URL(config.loja.logo, APP_URL).href;
  });

  const contactReady = configureExternalLink("[data-contact-link]", whatsappUrl(config.loja.whatsapp));
  document.querySelectorAll("[data-contact-placeholder]").forEach((button) => {
    button.hidden = contactReady;
  });

  configureExternalLink("[data-maps-link]", config.loja.localizacaoUrl);
  configureExternalLink("[data-instagram-link]", config.loja.instagramUrl);
}
