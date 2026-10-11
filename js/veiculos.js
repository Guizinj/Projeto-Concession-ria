import { getPublicImageUrl, supabaseGet } from "./supabase.js";

export const CAMBIOS = Object.freeze(["manual", "automatico", "automatizado", "cvt"]);
export const CATEGORIAS = Object.freeze(["hatch", "sedan", "suv", "picape", "coupe", "conversivel", "perua", "minivan", "van"]);
const ORDERS = {
  recentes: "created_at.desc,id.asc",
  menor_preco: "preco.asc,id.asc",
  maior_preco: "preco.desc,id.asc",
};
const SUMMARY_SELECT = "id,codigo,slug,marca,modelo,versao,ano_fabricacao,ano_modelo,preco,quilometragem,cambio,combustivel,categoria,cor,motorizacao,status,destaques,destaque,created_at,capa:veiculo_imagens(id,storage_path,ordem,principal)";
const DETAIL_SELECT = "id,codigo,slug,marca,modelo,versao,ano_fabricacao,ano_modelo,preco,quilometragem,cambio,combustivel,categoria,cor,motorizacao,status,descricao,opcionais,destaques,destaque,created_at,updated_at,imagens:veiculo_imagens(id,storage_path,ordem,principal)";

function summaryParams() {
  return new URLSearchParams({
    select: SUMMARY_SELECT,
    publicado: "eq.true",
    status: "in.(disponivel,reservado)",
    "capa.order": "principal.desc,ordem.asc,id.asc",
    "capa.limit": "1",
  });
}

function imageWithUrl(image) {
  return { ...image, url: getPublicImageUrl(image.storage_path) };
}

function summary(row) {
  const { capa, ...vehicle } = row;
  return { ...vehicle, imagem_capa: capa?.length ? imageWithUrl(capa[0]) : null };
}

function numberFilter(value, name, { integer = false, min = 0, max = Number.MAX_SAFE_INTEGER } = {}) {
  if (value === undefined || value === null || value === "") return null;
  if (typeof value !== "number" && typeof value !== "string") throw new TypeError(`${name} inválido.`);
  if (typeof value === "string" && !/^\d+(\.\d+)?$/.test(value)) throw new TypeError(`${name} inválido.`);
  const number = Number(value);
  if (!Number.isFinite(number) || number < min || number > max || (integer && !Number.isInteger(number))) {
    throw new TypeError(`${name} inválido.`);
  }
  return number;
}

function enumFilter(value, allowed, name) {
  if (value === undefined || value === null || value === "") return null;
  if (!allowed.includes(value)) throw new TypeError(`${name} inválido.`);
  return value;
}

function applyFilters(params, filters) {
  const priceMin = numberFilter(filters.precoMin, "Preço mínimo");
  const priceMax = numberFilter(filters.precoMax, "Preço máximo");
  const yearMin = numberFilter(filters.anoMin, "Ano mínimo", { integer: true, min: 1900, max: 2100 });
  const yearMax = numberFilter(filters.anoMax, "Ano máximo", { integer: true, min: 1900, max: 2100 });
  const kmMax = numberFilter(filters.kmMax, "Quilometragem máxima", { integer: true });
  if (priceMin !== null && priceMax !== null && priceMin > priceMax) throw new TypeError("Faixa de preços inválida.");
  if (yearMin !== null && yearMax !== null && yearMin > yearMax) throw new TypeError("Faixa de anos inválida.");
  if (priceMin !== null) params.append("preco", `gte.${priceMin}`);
  if (priceMax !== null) params.append("preco", `lte.${priceMax}`);
  if (yearMin !== null) params.append("ano_modelo", `gte.${yearMin}`);
  if (yearMax !== null) params.append("ano_modelo", `lte.${yearMax}`);
  if (kmMax !== null) params.set("quilometragem", `lte.${kmMax}`);
  const transmission = enumFilter(filters.cambio, CAMBIOS, "Câmbio");
  const category = enumFilter(filters.categoria, CATEGORIAS, "Categoria");
  if (transmission) params.set("cambio", `eq.${transmission}`);
  if (category) params.set("categoria", `eq.${category}`);

  if (filters.busca !== undefined && filters.busca !== null && filters.busca !== "") {
    if (typeof filters.busca !== "string" || filters.busca.length > 100) throw new TypeError("Busca inválida (máximo de 100 caracteres).");
    // Cada palavra deve ocorrer em marca, modelo OU versão. O alfabeto permitido
    // impede que caracteres da gramática PostgREST alterem a lógica dos filtros.
    const words = filters.busca.match(/[\p{L}\p{N}]+/gu) || [];
    if (!words.length) throw new TypeError("Digite uma marca, modelo ou versão.");
    params.set("and", `(${words.map((word) => `or(marca.ilike.*${word}*,modelo.ilike.*${word}*,versao.ilike.*${word}*)`).join(",")})`);
  }
}

export async function listarVeiculos({ filtros = {}, ordenacao = "recentes", offset = 0, limite = 12, signal } = {}) {
  if (!Object.hasOwn(ORDERS, ordenacao)) throw new TypeError("Ordenação inválida.");
  if (!Number.isSafeInteger(offset) || offset < 0) throw new TypeError("Posição de página inválida.");
  if (!Number.isInteger(limite) || limite < 1 || limite > 12) throw new TypeError("Limite inválido (1 a 12).");
  const params = summaryParams();
  applyFilters(params, filtros);
  params.set("order", ORDERS[ordenacao]);
  params.set("offset", String(offset));
  params.set("limit", String(limite + 1));
  const rows = await supabaseGet("veiculos", params, { signal });
  const temMais = rows.length > limite;
  return {
    veiculos: rows.slice(0, limite).map(summary),
    temMais,
    proximoOffset: temMais ? offset + limite : null,
  };
}

async function homeList(featured, signal) {
  const params = summaryParams();
  params.set("order", ORDERS.recentes);
  params.set("limit", "6");
  if (featured) params.set("destaque", "eq.true");
  return (await supabaseGet("veiculos", params, { signal })).map(summary);
}

export function listarDestaques({ signal } = {}) {
  return homeList(true, signal);
}

export function listarRecentes({ signal } = {}) {
  return homeList(false, signal);
}

export function listarExplorar({ offset = 0, signal } = {}) {
  return listarVeiculos({ offset, limite: 4, signal });
}

export async function listarImagensDoVeiculo(id, { signal } = {}) {
  if (typeof id !== "string" || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) throw new TypeError("Veículo inválido.");
  const params = new URLSearchParams({ select: "id,storage_path,ordem,principal", veiculo_id: `eq.${id}`, order: "ordem.asc,id.asc" });
  return (await supabaseGet("veiculo_imagens", params, { signal })).map(imageWithUrl);
}

// Consulta exclusiva da galeria: não carrega ficha, descrição ou semelhantes.
export async function buscarGaleriaPorSlug(slug, { signal } = {}) {
  if (typeof slug !== "string" || slug.length > 200 || !/^[a-z0-9]+(-[a-z0-9]+)*$/.test(slug)) return null;
  const params = new URLSearchParams({ select: "id,slug,marca,modelo,imagens:veiculo_imagens(id,storage_path,ordem,principal)", slug: `eq.${slug}`, publicado: "eq.true", limit: "1", "imagens.order": "ordem.asc,id.asc" });
  const [row] = await supabaseGet("veiculos", params, { signal });
  return row ? { ...row, imagens: (row.imagens || []).map(imageWithUrl) } : null;
}

export async function buscarVeiculoPorSlug(slug, { signal } = {}) {
  // Ausência ou slug inválido têm o mesmo resultado de um anúncio inexistente.
  if (typeof slug !== "string" || slug.length > 200 || !/^[a-z0-9]+(-[a-z0-9]+)*$/.test(slug)) return null;
  const params = new URLSearchParams({
    select: DETAIL_SELECT,
    slug: `eq.${slug}`,
    publicado: "eq.true",
    limit: "1",
    "imagens.order": "ordem.asc,id.asc",
  });
  const [row] = await supabaseGet("veiculos", params, { signal });
  return row ? { ...row, imagens: (row.imagens || []).map(imageWithUrl) } : null;
}

export async function listarSemelhantes(vehicle, { signal } = {}) {
  if (!vehicle || !CATEGORIAS.includes(vehicle.categoria) ||
      !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(vehicle.id)) {
    throw new TypeError("Veículo de referência inválido.");
  }
  const params = summaryParams();
  params.set("categoria", `eq.${vehicle.categoria}`);
  params.set("id", `neq.${vehicle.id}`);
  params.set("order", ORDERS.recentes);
  params.set("limit", "4");
  return (await supabaseGet("veiculos", params, { signal })).map(summary);
}
