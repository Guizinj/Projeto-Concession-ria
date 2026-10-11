const NAMESPACE = "http://www.w3.org/2000/svg";
const SPRITE_URL = new URL("../../assets/icons/sprite.svg", import.meta.url);
const ICONS = new Set(["home", "grid", "compass", "pin", "arrow-up-right", "arrow-right", "arrow-left", "car", "search", "alert", "refresh", "check", "moon", "message", "share", "copy"]);

export function createIcon(name) {
  if (!ICONS.has(name)) throw new TypeError("Ícone desconhecido.");
  const svg = document.createElementNS(NAMESPACE, "svg");
  svg.setAttribute("class", "icon");
  svg.setAttribute("viewBox", "0 0 24 24");
  svg.setAttribute("aria-hidden", "true");
  svg.setAttribute("focusable", "false");
  const use = document.createElementNS(NAMESPACE, "use");
  use.setAttribute("href", `${SPRITE_URL.href}#${name}`);
  svg.append(use);
  return svg;
}
