import { initializeLayout } from "../components/layout.js";
import { initializeStoreLocation } from "../components/store-location.js";
import { config } from "../config.js";
import { whatsappUrl } from "../vehicle-links.js";
import { buildContactMessage } from "../contact-message.js";
import { contactContextUrl } from "../contact-context.js";
import { scrollToElement } from "../components/navigation.js";

initializeLayout("Localização e contato");
initializeStoreLocation();

const form = document.getElementById("location-contact-form");
const fields = {
  name: document.getElementById("contact-name"),
  subject: document.getElementById("contact-subject"),
  vehicle: document.getElementById("contact-vehicle"),
  date: document.getElementById("contact-date"),
  message: document.getElementById("contact-message"),
};
const prepared = document.getElementById("contact-prepared-message");
const feedback = document.getElementById("contact-form-feedback");
const contact = document.querySelector("[data-location-contact]");
const testDrive = document.querySelector("[data-test-drive-cta]");
const contactUrl = whatsappUrl(config.loja.whatsapp);

function updateDateMinimum() {
  const now = new Date();
  fields.date.min = [now.getFullYear(), String(now.getMonth() + 1).padStart(2, "0"), String(now.getDate()).padStart(2, "0")].join("-");
}

function updateSubject() {
  const appointment = ["test-drive", "visit"].includes(fields.subject.value);
  document.getElementById("contact-date-field").hidden = !appointment;
  fields.date.disabled = !appointment;
  if (!appointment) fields.date.value = "";
  updateDateMinimum();
}

function clearPreparedMessage() {
  prepared.value = "";
  prepared.disabled = true;
  feedback.textContent = "";
  feedback.hidden = true;
}

if (contactUrl) {
  contact.href = contactContextUrl(config.loja.whatsapp, { source: "direct" });
  contact.hidden = false;
  const number = config.loja.whatsapp.trim().slice(2);
  document.querySelector("[data-location-phone]").textContent = `(${number.slice(0, 2)}) ${number.slice(2, -4)}-${number.slice(-4)}`;
  form.action = contactUrl;
  form.hidden = false;
  document.getElementById("contact-form-unavailable").hidden = true;
  updateSubject();

  fields.subject.addEventListener("change", updateSubject);
  form.addEventListener("input", event => {
    event.target.setCustomValidity?.("");
    clearPreparedMessage();
  });
  form.addEventListener("submit", event => {
    updateDateMinimum();
    fields.name.setCustomValidity(fields.name.value.trim().length < 2 ? "Digite seu nome, com pelo menos dois caracteres." : "");
    fields.message.setCustomValidity(fields.message.value.trim().length < 10 ? "Escreva uma mensagem com pelo menos 10 caracteres." : "");
    const message = buildContactMessage(Object.fromEntries(Object.entries(fields).map(([key, input]) => [key, input.value])), { today: fields.date.min });
    if (!form.checkValidity() || !message) {
      event.preventDefault();
      clearPreparedMessage();
      feedback.textContent = "Confira os campos para continuar a conversa.";
      feedback.hidden = false;
      form.reportValidity();
      return;
    }
    // Só o texto preparado segue no GET do WhatsApp; o usuário confirma o envio lá.
    prepared.value = message;
    prepared.disabled = false;
  });
  testDrive.addEventListener("click", () => {
    fields.subject.value = "test-drive";
    updateSubject();
    fields.message.setCustomValidity("");
    if (!fields.message.value.trim()) fields.message.value = "Gostaria de conhecer o veículo e combinar um test drive.";
    clearPreparedMessage();
    // A navegação compartilhada cuida da rolagem suave e do foco no título do formulário.
  });
  window.addEventListener("pageshow", event => {
    clearPreparedMessage(); updateSubject();
    if (!event.persisted && location.hash === "#contato-titulo") scrollToElement(document.getElementById("contato-titulo"), { focus: true });
  });
} else {
  testDrive.hidden = true;
  document.getElementById("contact-form-unavailable").textContent = "O atendimento pelo WhatsApp está indisponível no momento. Consulte o endereço abaixo para visitar a loja.";
}
