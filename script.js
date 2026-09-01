const helpPanel = document.querySelector(".help-panel");
const helpBackdrop = document.querySelector(".help-backdrop");
const noticeOverlay = document.querySelector(".notice-overlay");
const noticeModal = document.querySelector(".notice-modal");
const openNoticeButton = document.querySelector("[data-open-notice]");
const menuButton = document.querySelector(".menu-button");
const desktopNav = document.querySelector(".desktop-nav");
const desktopNavLinks = [...document.querySelectorAll(".desktop-nav nav a")];
const faqTabs = [...document.querySelectorAll(".faq-tab")];
const faqItems = [...document.querySelectorAll(".faq-item")];

const faqContent = {
  solicitud: [
    {
      question: "¿Cuánto tiempo tarda la aprobación del préstamo?",
      answer:
        "Una vez aprobada tu solicitud, ALA procesará la transferencia de inmediato. Normalmente, los fondos llegan a tu cuenta bancaria en 5 minutos, aunque en casos excepcionales puede haber retrasos.Nota:<br>Asegúrate de que la información de tu cuenta bancaria sea correcta para evitar errores en la transferencia. Si los datos son incorrectos, nos pondremos en contacto contigo para confirmarlos.",
    },
    {
      question: "¿Cuándo llegará el préstamo a mi cuenta bancaria?",
      answer:
        "Después de la aprobación, la transferencia suele reflejarse en tu cuenta bancaria en aproximadamente 5 minutos. El tiempo final depende de tu banco.",
    },
    {
      question: "¿Puedo solicitar varios préstamos?",
      answer:
        "Puedes solicitar un nuevo préstamo cuando el préstamo actual se haya liquidado y tu cuenta vuelva a mostrar un límite disponible.",
    },
    {
      question: "¿Cómo obtener un límite más alto de préstamo?",
      answer:
        "Mantén tus datos actualizados y realiza tus pagos puntualmente. ALA evaluará periódicamente tu perfil para ofrecerte un límite adecuado.",
    },
  ],
  credito: [
    {
      question: "¿Cómo consulto mi límite de crédito?",
      answer: "Abre la aplicación de ALA. Tu límite aprobado y el monto disponible aparecerán en la pantalla principal de tu cuenta.",
    },
    {
      question: "¿Por qué cambió mi límite disponible?",
      answer: "El límite puede actualizarse de acuerdo con el uso de tu cuenta, tus pagos y la evaluación periódica de tu perfil.",
    },
    {
      question: "¿Cómo puedo aumentar mi límite de crédito?",
      answer: "Usa ALA de forma responsable, paga puntualmente y mantén tu información personal y bancaria actualizada.",
    },
    {
      question: "¿El límite aprobado caduca?",
      answer: "La disponibilidad del límite está sujeta a evaluaciones periódicas. Consulta la aplicación antes de iniciar una nueva solicitud.",
    },
  ],
  problemas: [
    {
      question: "¿Qué hago si no recibí el préstamo?",
      answer: "Verifica que los datos de tu cuenta bancaria sean correctos. Si han pasado más de 24 horas, ponte en contacto con el centro de ayuda.",
    },
    {
      question: "¿Por qué mi solicitud fue rechazada?",
      answer: "Cada solicitud se evalúa automáticamente con la información disponible. Revisa tus datos e intenta nuevamente cuando la aplicación lo indique.",
    },
    {
      question: "¿Cómo corrijo mis datos bancarios?",
      answer: "Entra a tu perfil dentro de la aplicación y actualiza la información bancaria antes de confirmar una nueva transferencia.",
    },
    {
      question: "¿Dónde consulto el estado de mi préstamo?",
      answer: "Puedes revisar el estado y los movimientos de tu préstamo directamente desde la pantalla principal de la aplicación ALA.",
    },
  ],
};

let lastFocusedElement = null;

function setActiveNav(hash = window.location.hash) {
  const currentHash = hash || "#producto";
  desktopNavLinks.forEach((link) => {
    const active = link.hash === currentHash;
    link.classList.toggle("is-active", active);
    if (active) link.setAttribute("aria-current", "location");
    else link.removeAttribute("aria-current");
  });
}

desktopNavLinks.forEach((link) => {
  link.addEventListener("click", () => setActiveNav(link.hash));
});

window.addEventListener("hashchange", () => setActiveNav());
setActiveNav();

function setDesktopNavSurface() {
  const afterHero = window.scrollY >= window.innerHeight - 1;
  desktopNav.classList.toggle("is-after-hero", afterHero);
  document.body.classList.toggle("is-after-hero", afterHero);
}

window.addEventListener("scroll", setDesktopNavSurface, { passive: true });
window.addEventListener("resize", setDesktopNavSurface);
setDesktopNavSurface();

function setOpenFaqItem(openIndex) {
  faqItems.forEach((item, index) => {
    const open = index === openIndex;
    const button = item.querySelector(".faq-question");
    const answer = item.querySelector(".faq-answer");
    item.classList.toggle("is-open", open);
    button.setAttribute("aria-expanded", String(open));
    answer.setAttribute("aria-hidden", String(!open));
  });
}

function setFaqCategory(category) {
  const items = faqContent[category];
  if (!items) return;

  faqTabs.forEach((tab) => {
    const active = tab.dataset.faqCategory === category;
    tab.classList.toggle("is-active", active);
    tab.setAttribute("aria-selected", String(active));
  });

  faqItems.forEach((item, index) => {
    item.querySelector("[data-faq-question]").textContent = items[index].question;
    item.querySelector("[data-faq-answer]").innerHTML = items[index].answer;
  });

  setOpenFaqItem(0);
}

faqTabs.forEach((tab) => {
  tab.addEventListener("click", () => setFaqCategory(tab.dataset.faqCategory));
});

faqItems.forEach((item, index) => {
  item.querySelector(".faq-question").addEventListener("click", () => {
    const isOpen = item.classList.contains("is-open");
    setOpenFaqItem(isOpen ? -1 : index);
  });
});

function setHelp(open) {
  helpPanel.classList.toggle("is-open", open);
  helpBackdrop.classList.toggle("is-open", open);
  document.body.classList.toggle("help-open", open);
  helpPanel.setAttribute("aria-hidden", String(!open));
  document.querySelectorAll("[data-toggle-help]").forEach((button) => {
    button.setAttribute("aria-expanded", String(open));
  });
  if (open) helpPanel.querySelector("[data-close-help]").focus();
}

function setNotice(open) {
  noticeOverlay.classList.toggle("is-open", open);
  document.body.classList.toggle("notice-open", open);
  noticeOverlay.setAttribute("aria-hidden", String(!open));
  if (open) {
    lastFocusedElement = document.activeElement;
    noticeModal.querySelector("[data-close-notice]").focus();
  } else if (lastFocusedElement) {
    lastFocusedElement.focus();
  }
}

document.querySelectorAll("[data-toggle-help]").forEach((button) => {
  button.addEventListener("click", () => setHelp(!helpPanel.classList.contains("is-open")));
});

document.querySelectorAll("[data-close-help]").forEach((button) => {
  button.addEventListener("click", () => setHelp(false));
});

openNoticeButton.addEventListener("click", () => setNotice(true));
document.querySelectorAll("[data-close-notice]").forEach((button) => {
  button.addEventListener("click", () => setNotice(false));
});

noticeOverlay.addEventListener("click", (event) => {
  if (event.target === noticeOverlay) setNotice(false);
});

menuButton.addEventListener("click", () => {
  const expanded = menuButton.getAttribute("aria-expanded") === "true";
  menuButton.setAttribute("aria-expanded", String(!expanded));
});

document.addEventListener("keydown", (event) => {
  if (event.key !== "Escape") return;
  if (noticeOverlay.classList.contains("is-open")) setNotice(false);
  else if (helpPanel.classList.contains("is-open")) setHelp(false);
});
