export function verticalSwipeDirection({ dx, dy, duration, height }) {
  const threshold = Math.min(90, Math.max(50, height * 0.08));
  if (![dx, dy, duration, height].every(Number.isFinite) || height <= 0 || duration < 0 || duration > 1200 || Math.abs(dy) < threshold || Math.abs(dy) <= Math.abs(dx) * 1.5) return 0;
  return dy < 0 ? 1 : -1;
}
