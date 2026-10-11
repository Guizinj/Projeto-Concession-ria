const currency = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });
const integer = new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 0 });
const TRANSMISSIONS = { manual: "Manual", automatico: "Automático", automatizado: "Automatizado", cvt: "CVT" };
const FUELS = { gasolina: "Gasolina", etanol: "Etanol", flex: "Flex", diesel: "Diesel", eletrico: "Elétrico", hibrido: "Híbrido" };
const CATEGORIES = { hatch: "Hatch", sedan: "Sedã", suv: "SUV", picape: "Picape", coupe: "Cupê", conversivel: "Conversível", perua: "Perua", minivan: "Minivan", van: "Van" };

function numeric(value) {
  if (typeof value !== "number" && typeof value !== "string") return null;
  if (typeof value === "string" && !/^\d+(\.\d+)?$/.test(value)) return null;
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

export function formatPrice(value) {
  const number = numeric(value);
  return number !== null && number > 0 ? currency.format(number) : "Preço a consultar";
}

export function formatMileage(value) {
  const number = numeric(value);
  return number !== null && Number.isSafeInteger(number) && number >= 0 ? `${integer.format(number)} km` : "Não informado";
}

export function formatYear(manufacture, model) {
  const modelYear = numeric(model);
  const manufactureYear = numeric(manufacture);
  const valid = (year) => Number.isInteger(year) && year >= 1900 && year <= 2100;
  if (!valid(modelYear)) return "Não informado";
  return valid(manufactureYear) && manufactureYear !== modelYear ? `${manufactureYear}/${modelYear}` : String(modelYear);
}

export function formatTransmission(value) {
  return Object.hasOwn(TRANSMISSIONS, value) ? TRANSMISSIONS[value] : "Não informado";
}

export function formatFuel(value) {
  return Object.hasOwn(FUELS, value) ? FUELS[value] : "Não informado";
}

export function formatCategory(value) {
  return Object.hasOwn(CATEGORIES, value) ? CATEGORIES[value] : "Não informado";
}
