import { createIcon } from "./icons.js";

const APP_URL = new URL("../../", import.meta.url);
const initialized = new WeakSet();

function element(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}
function link(label, path) {
  const node = element("a", "institutional-link", label);
  node.href = new URL(path, APP_URL).href;
  return node;
}
function external(label, attribute) {
  const node = element("a", "institutional-link");
  node.setAttribute(attribute, ""); node.hidden = true;
  node.target = "_blank"; node.rel = "noopener noreferrer";
  node.append(element("span", "", label), createIcon("arrow-up-right"));
  return node;
}

export function initializeInstitutionalFooter() {
  document.querySelectorAll("[data-institutional-footer]").forEach(root => {
    if (initialized.has(root)) return;
    initialized.add(root);
    const content = element("div", "container institutional-footer-content");
    const identity = element("div", "institutional-identity");
    const brand = link("", "index.html"); brand.className = "institutional-brand";
    brand.setAttribute("data-brand-link", "");
    const logo = element("img"); logo.setAttribute("data-brand-logo", "");
    logo.alt = ""; logo.width = logo.height = 44;
    const name = element("span"); name.setAttribute("data-brand-name", "");
    brand.append(logo, name);
    const description = element("p", "institutional-description");
    description.setAttribute("data-brand-description", "");
    identity.append(brand, description, element("p", "institutional-caption", "Conheça online. Escolha de perto."));

    const navigation = element("nav", "institutional-navigation");
    navigation.setAttribute("aria-label", "Navegação institucional");
    navigation.append(element("h2", "institutional-title", "Explore"));
    const links = element("div", "institutional-links");
    for (const [label, path] of [["Início", "index.html"], ["Estoque", "estoque.html"], ["Explorar", "explorar.html"],
      ["Destaques", "index.html#destaques-titulo"]]) links.append(link(label, path));
    navigation.append(links);

    const visit = element("div", "institutional-visit");
    visit.append(element("h2", "institutional-title", "Visite a loja"));
    const address = element("address", "institutional-address"); address.setAttribute("data-store-address", "");
    const contacts = element("div", "institutional-links");
    contacts.append(link("Nossa localização", "localizacao.html"), external("Como chegar", "data-maps-link"),
      external("Converse no WhatsApp", "data-contact-link"), external("Instagram", "data-instagram-link"));
    visit.append(address, contacts);
    content.append(identity, navigation, visit);

    const bottom = element("div", "container institutional-footer-bottom");
    const copyright = element("p");
    const year = element("span"); year.setAttribute("data-current-year", "");
    const copyrightName = element("span"); copyrightName.setAttribute("data-brand-name", "");
    copyright.append("© ", year, " ", copyrightName, ". Todos os direitos reservados.");
    bottom.append(copyright, element("p", "", "Showroom automotivo"));
    root.className = "institutional-footer";
    root.replaceChildren(content, bottom);
  });
}
