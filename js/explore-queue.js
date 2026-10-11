import { listarExplorar } from "./veiculos.js";

// Guarda metadados já visitados, sem criar cards ou baixar fotografias.
export function createExploreQueue(query = listarExplorar) {
  let vehicles = [], index = -1, offset = 0, hasMore = true, ended = false;
  let controller, version = 0, pending = false;
  const snapshot = () => ({ current: vehicles[index] ?? null, next: vehicles[index + 1] ?? null,
    index, loaded: vehicles.length, hasMore, ended, pending });

  function stop() {
    version++;
    controller?.abort();
    pending = false;
  }

  async function next() {
    if (pending || ended) return false;
    const target = index + 1;
    if (target < vehicles.length) { index = target; return true; }
    if (!hasMore) { ended = true; return true; }
    pending = true;
    const requestVersion = ++version;
    controller = new AbortController();
    const signal = controller.signal;
    try {
      const result = await query({ offset, signal });
      if (requestVersion !== version || signal.aborted) return false;
      vehicles.push(...result.veiculos);
      hasMore = result.temMais;
      offset = result.proximoOffset;
      if (target < vehicles.length) index = target;
      else ended = true;
      return true;
    } catch (error) {
      if (requestVersion !== version || signal.aborted || error.name === "AbortError") return false;
      throw error;
    } finally {
      if (requestVersion === version) pending = false;
    }
  }

  function previous() {
    if (pending) return false;
    if (ended && vehicles.length) { ended = false; index = vehicles.length - 1; return true; }
    if (index <= 0) return false;
    index--;
    return true;
  }

  async function restart() {
    stop();
    vehicles = []; index = -1; offset = 0; hasMore = true; ended = false;
    return next();
  }

  return { snapshot, next, previous, restart, stop };
}
