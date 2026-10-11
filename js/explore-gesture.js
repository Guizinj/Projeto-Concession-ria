// Só reconhece deslocamentos horizontais intencionais; rolagem vertical é nativa.
export function swipeDirection({ dx, dy, duration, width }) {
  const threshold = Math.min(100, Math.max(48, width * 0.15));
  if (duration < 0 || duration > 1200 || Math.abs(dx) < threshold || Math.abs(dx) <= Math.abs(dy) * 1.5) return 0;
  return dx < 0 ? 1 : -1;
}
