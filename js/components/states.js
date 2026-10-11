import { createIcon } from "./icons.js";

const DEFAULTS = {
  empty: { icon: "search", heading: "Nenhum veículo encontrado", message: "Tente outra busca ou ajuste os filtros para ver mais opções." },
  error: { icon: "alert", heading: "Não conseguimos carregar os veículos", message: "Verifique sua conexão e tente novamente." },
};

function element(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

export function createStatePanel({ type = "empty", heading, message, onRetry, headingLevel = 2 } = {}) {
  if (!Object.hasOwn(DEFAULTS, type)) throw new TypeError("Estado desconhecido.");
  if (![2, 3, 4].includes(headingLevel)) throw new TypeError("Nível de título inválido.");
  const defaults = DEFAULTS[type];
  const panel = element("div", `state-panel state-panel-${type} surface`);
  panel.setAttribute("role", type === "error" ? "alert" : "status");
  const symbol = element("span", "state-symbol");
  symbol.append(createIcon(defaults.icon));
  symbol.setAttribute("aria-hidden", "true");
  panel.append(symbol, element(`h${headingLevel}`, "", heading ?? defaults.heading), element("p", "", message ?? defaults.message));
  if (type === "error" && typeof onRetry === "function") {
    const button = element("button", "button button-outline", "Tentar novamente");
    button.type = "button";
    button.prepend(createIcon("refresh"));
    button.addEventListener("click", onRetry);
    panel.append(button);
  }
  return panel;
}

export function createLoadingGrid({ count = 6 } = {}) {
  if (!Number.isInteger(count) || count < 1 || count > 12) throw new TypeError("Quantidade de placeholders inválida.");
  const wrapper = element("div", "loading-state");
  wrapper.setAttribute("role", "status");
  const label = element("p", "loading-label", "Carregando veículos…");
  const dot = element("span", "loading-dot");
  dot.setAttribute("aria-hidden", "true");
  label.prepend(dot);
  const grid = element("div", "vehicle-grid");
  grid.setAttribute("aria-hidden", "true");
  for (let i = 0; i < count; i++) {
    const card = element("div", "skeleton-card");
    const body = element("div", "skeleton-body");
    body.append(element("div", "skeleton-shape skeleton-line"), element("div", "skeleton-shape skeleton-line skeleton-line-short"), element("div", "skeleton-shape skeleton-line skeleton-line-price"));
    card.append(element("div", "skeleton-shape skeleton-media"), body);
    grid.append(card);
  }
  wrapper.append(label, grid);
  return wrapper;
}
