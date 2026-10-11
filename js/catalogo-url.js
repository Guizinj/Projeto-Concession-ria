import { CAMBIOS, CATEGORIAS } from "./veiculos.js";

export const FILTER_NAMES = ["busca", "precoMin", "precoMax", "anoMin", "anoMax", "cambio", "categoria", "kmMax"];
export const SORTS = ["menor_preco", "maior_preco", "recentes"];
export const DEFAULT_SORT = SORTS[0];

export function readCatalogUrl(search) {
  const params = new URLSearchParams(search);
  const filtros = {};
  let discarded = false;
  for (const name of FILTER_NAMES) {
    const value = params.get(name);
    if (!value) continue;
    let valid;
    if (name === "busca") valid = value.trim().length <= 100 && /[\p{L}\p{N}]/u.test(value);
    else if (name === "cambio") valid = CAMBIOS.includes(value);
    else if (name === "categoria") valid = CATEGORIAS.includes(value);
    else {
      const number = Number(value);
      valid = /^\d+(\.\d+)?$/.test(value) && Number.isFinite(number) && number <= Number.MAX_SAFE_INTEGER;
      if (name.startsWith("ano")) valid &&= Number.isInteger(number) && number >= 1900 && number <= 2100;
      if (name === "kmMax") valid &&= Number.isInteger(number);
    }
    if (valid) filtros[name] = name === "busca" ? value.trim() : value;
    else discarded = true;
  }
  for (const [min, max] of [["precoMin", "precoMax"], ["anoMin", "anoMax"]]) {
    if (filtros[min] !== undefined && filtros[max] !== undefined && Number(filtros[min]) > Number(filtros[max])) {
      delete filtros[min]; delete filtros[max]; discarded = true;
    }
  }
  const sort = params.get("ordenacao");
  if (sort && !SORTS.includes(sort)) discarded = true;
  return { filtros, ordenacao: SORTS.includes(sort) ? sort : DEFAULT_SORT, discarded };
}

export function catalogUrl(url, { filtros, ordenacao }) {
  const next = new URL(url);
  for (const name of [...FILTER_NAMES, "ordenacao"]) next.searchParams.delete(name);
  for (const name of FILTER_NAMES) if (filtros[name]) next.searchParams.set(name, filtros[name]);
  if (ordenacao !== DEFAULT_SORT) next.searchParams.set("ordenacao", ordenacao);
  return next;
}
