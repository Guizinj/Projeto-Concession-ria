const subjects = Object.freeze({
  vehicle: "Tenho interesse em um veículo",
  "test-drive": "Quero agendar um test drive",
  visit: "Quero visitar a loja",
  other: "Tenho outra dúvida",
});

function singleLine(value) {
  return typeof value === "string" ? value.trim().replace(/\s+/g, " ").replace(/[\u0000-\u001f\u007f]/g, "") : "";
}

function formattedDate(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const date = new Date(`${value}T12:00:00Z`);
  if (!Number.isFinite(date.getTime()) || date.toISOString().slice(0, 10) !== value) return null;
  return value.split("-").reverse().join("/");
}

export function buildContactMessage(fields, { today = "" } = {}) {
  const name = singleLine(fields?.name), vehicle = singleLine(fields?.vehicle);
  const subject = fields?.subject;
  const message = typeof fields?.message === "string"
    ? fields.message.trim().replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/g, "") : "";
  if (name.length < 2 || name.length > 80 || vehicle.length > 100 || message.length < 10 || message.length > 1000
    || !Object.hasOwn(subjects, subject)) return null;
  const lines = [`Olá! Meu nome é ${name}.`, `Assunto: ${subjects[subject]}.`];
  if (vehicle) lines.push(`Veículo de interesse: ${vehicle}`);
  if (["test-drive", "visit"].includes(subject) && fields.date) {
    const date = formattedDate(fields.date);
    if (!date || (today && fields.date < today)) return null;
    lines.push(`Dia de preferência: ${date} (a confirmar com a equipe)`);
  }
  return `${lines.join("\n")}\n\n${message}`;
}
