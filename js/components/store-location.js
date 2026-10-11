import { config } from "../config.js";
import { contactContextUrl } from "../contact-context.js";

export function mapEmbedUrl(value) {
  if (typeof value !== "string" || value.length > 5000) return null;
  try {
    const url = new URL(value);
    if (url.origin !== "https://www.google.com" || url.username || url.password || url.pathname !== "/maps/embed") return null;
    if (url.searchParams.size !== 1 || !url.searchParams.get("pb") || url.hash) return null;
    return url.href;
  } catch { return null; }
}

export function initializeStoreLocation(root = document, store = config.loja) {
  const map = root.querySelector("[data-store-map]");
  const placeholder = root.querySelector("[data-store-map-placeholder]");
  const url = mapEmbedUrl(store.mapaEmbedUrl);
  if (map) {
    map.hidden = !url;
    if (url) map.src = url;
    else map.removeAttribute("src");
  }
  if (placeholder) placeholder.hidden = !!url;

  const visitUrl = contactContextUrl(store.whatsapp, { source: "visit" });
  root.querySelectorAll("[data-visit-link]").forEach(link => {
    link.hidden = !visitUrl;
    if (visitUrl) link.href = visitUrl;
    else link.removeAttribute("href");
  });
}
