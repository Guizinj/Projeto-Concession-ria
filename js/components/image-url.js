export function imageUrl(value) {
  if (typeof value !== "string" || !value.trim()) return null;
  try {
    const url = new URL(value, document.baseURI);
    if (url.username || url.password) return null;
    return url.protocol === "https:" || (url.protocol === "http:" && url.origin === location.origin) ? url.href : null;
  } catch { return null; }
}
