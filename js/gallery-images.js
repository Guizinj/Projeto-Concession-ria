export function imageKey(image) {
  return image?.storage_path || image?.url || image?.id || null;
}

export function orderedImages(images) {
  const seen = new Set();
  return (Array.isArray(images) ? images : []).filter(image => {
    const key = imageKey(image);
    if (typeof key !== "string" || !key || seen.has(key)) return false;
    seen.add(key); return true;
  }).sort((a, b) => (a.ordem ?? 0) - (b.ordem ?? 0) || String(a.id ?? "").localeCompare(String(b.id ?? "")));
}
