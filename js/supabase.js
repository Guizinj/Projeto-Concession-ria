import { config } from "./config.js";

const READABLE_TABLES = new Set(["veiculos", "veiculo_imagens"]);

export class SupabaseError extends Error {
  constructor(message, { code = "REDE", status = null } = {}) {
    super(message);
    this.name = "SupabaseError";
    this.code = code;
    this.status = status;
  }
}

function projectUrl() {
  try {
    const url = new URL(config.supabase.url);
    if (url.protocol !== "https:" || url.username || url.password ||
        url.pathname !== "/" || url.search || url.hash) throw new Error();
    return url;
  } catch {
    throw new SupabaseError("Preencha a URL base HTTPS do projeto em js/config.js.", { code: "CONFIG" });
  }
}

export function validateSupabaseConfig() {
  const url = projectUrl();
  const key = config.supabase.publishableKey;
  if (typeof key !== "string" || !/^sb_publishable_[A-Za-z0-9_-]+$/.test(key)) {
    throw new SupabaseError("Configure uma chave pública sb_publishable_… em js/config.js.", { code: "CONFIG" });
  }
  if (typeof config.supabase.bucket !== "string" || !/^[a-z0-9][a-z0-9_-]*$/.test(config.supabase.bucket)) {
    throw new SupabaseError("Configure o nome do bucket de fotografias.", { code: "CONFIG" });
  }
  return { url, key, bucket: config.supabase.bucket };
}

function httpMessage(status, code) {
  if (code === "PGRST205") return "As tabelas do showroom ainda não estão disponíveis na API.";
  if (status === 401 || status === 403) return "A consulta foi recusada. Verifique a chave pública e as permissões de leitura.";
  return "Não foi possível consultar os veículos. Tente novamente.";
}

// Somente GET: o site não oferece escrita, RPC, login ou upload.
export async function supabaseGet(table, params = new URLSearchParams(), { signal, timeoutMs = 12000 } = {}) {
  if (!READABLE_TABLES.has(table)) throw new TypeError("Tabela de leitura não permitida.");
  if (!Number.isFinite(timeoutMs) || timeoutMs <= 0) throw new TypeError("Prazo de consulta inválido.");
  const { url, key } = validateSupabaseConfig();
  const endpoint = new URL(`/rest/v1/${table}`, url);
  endpoint.search = new URLSearchParams(params).toString();
  signal?.throwIfAborted();

  const controller = new AbortController();
  let timedOut = false;
  const cancel = () => controller.abort();
  signal?.addEventListener("abort", cancel, { once: true });
  const timer = setTimeout(() => {
    timedOut = true;
    controller.abort();
  }, timeoutMs);

  try {
    const response = await fetch(endpoint, {
      method: "GET",
      headers: { apikey: key, Accept: "application/json", "Accept-Profile": "public" },
      credentials: "omit",
      cache: "no-store",
      signal: controller.signal,
    });
    const data = await response.json().catch(() => null);
    if (!response.ok) {
      throw new SupabaseError(httpMessage(response.status, data?.code), {
        status: response.status,
        code: typeof data?.code === "string" ? data.code : "HTTP",
      });
    }
    if (!Array.isArray(data)) {
      throw new SupabaseError("A API retornou uma resposta inesperada.", { code: "RESPOSTA" });
    }
    return data;
  } catch (error) {
    // Cancelar a busca anterior não é um estado de erro para a interface.
    if (signal?.aborted) throw new DOMException("Consulta cancelada.", "AbortError");
    if (timedOut) throw new SupabaseError("A consulta demorou demais. Tente novamente.", { code: "TIMEOUT" });
    if (error instanceof SupabaseError) throw error;
    throw new SupabaseError("Não foi possível conectar ao catálogo. Verifique sua conexão e tente novamente.");
  } finally {
    clearTimeout(timer);
    signal?.removeEventListener("abort", cancel);
  }
}

export function getPublicImageUrl(path) {
  if (typeof path !== "string" || !path || path !== path.trim() || /[\\:?#\x00-\x1f\x7f]/.test(path)) return null;
  const segments = path.split("/");
  if (segments.some((segment) => !segment || segment === "." || segment === "..")) return null;
  try {
    const bucket = config.supabase.bucket;
    if (typeof bucket !== "string" || !/^[a-z0-9][a-z0-9_-]*$/.test(bucket)) return null;
    return new URL(`/storage/v1/object/public/${encodeURIComponent(bucket)}/${segments.map(encodeURIComponent).join("/")}`, projectUrl()).href;
  } catch {
    return null;
  }
}
