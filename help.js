const helpFaqContent = {
  solicitud: [
    {
      question: "¿Cuánto tiempo tarda la aprobación del préstamo?",
      answer:
        "Una vez aprobada tu solicitud, ALA procesará la transferencia de inmediato. Normalmente, los fondos llegan a tu cuenta bancaria en 5 minutos, aunque en casos excepcionales puede haber retrasos.Nota: Asegúrate de que la información de tu cuenta bancaria sea correcta para evitar errores en la transferencia. Si los datos son incorrectos, nos pondremos en contacto contigo para confirmarlos.",
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
    {
      question: "¿Qué necesito para solicitar un préstamo?",
      answer:
        "Completa tu registro en la aplicación de ALA y proporciona la información solicitada para que podamos evaluar tu solicitud.",
    },
    {
      question: "¿Puedo cancelar una solicitud de préstamo?",
      answer:
        "Si la transferencia aún no ha sido procesada, revisa las opciones disponibles en la aplicación o contacta a nuestros canales oficiales.",
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
    {
      question: "¿Cuándo se restablece mi límite disponible?",
      answer: "Tu límite disponible se actualizará cuando se procese el pago y finalice la evaluación correspondiente de tu cuenta.",
    },
    {
      question: "¿Por qué mi límite es diferente al de otra persona?",
      answer: "Cada límite se determina individualmente con base en la información y evaluación de cada cuenta.",
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
    {
      question: "¿Qué hago si el pago no aparece?",
      answer: "Conserva tu comprobante y espera el tiempo de procesamiento indicado. Si el estado no cambia, contacta a nuestros canales oficiales.",
    },
    {
      question: "¿Cómo reporto un cargo que no reconozco?",
      answer: "Comunícate de inmediato mediante nuestros canales oficiales para que podamos revisar contigo los movimientos de tu cuenta.",
    },
  ],
  otros: [
    {
      question: "¿Cómo contacto al centro de ayuda?",
      answer: "Utiliza únicamente los datos de contacto y canales oficiales publicados en este sitio web de ALA.",
    },
    {
      question: "¿Cómo actualizo mis datos personales?",
      answer: "Entra a tu perfil dentro de la aplicación de ALA y revisa las opciones disponibles para mantener tu información actualizada.",
    },
    {
      question: "¿Dónde descargo la aplicación oficial de ALA?",
      answer: "Utiliza únicamente los enlaces oficiales de Google Play y App Store publicados en este sitio web.",
    },
    {
      question: "¿Cómo puedo proteger mi cuenta?",
      answer: "No compartas contraseñas ni códigos de verificación y utiliza únicamente los canales oficiales de ALA para realizar consultas.",
    },
    {
      question: "¿ALA solicita pagos por adelantado?",
      answer: "ALA no solicita anticipos ni utiliza agentes externos para realizar el proceso de solicitud.",
    },
    {
      question: "¿Cómo identifico los canales oficiales?",
      answer: "Consulta siempre este sitio web y las cuentas verificadas de ALA antes de compartir información o realizar cualquier gestión.",
    },
  ],
};

const helpTabs = [...document.querySelectorAll(".help-faq-tab")];
const helpItems = [...document.querySelectorAll(".help-faq-item")];
const helpMenuButton = document.querySelector(".help-page-mobile-nav .menu-button");
const helpMobileMenu = document.querySelector(".help-mobile-menu");

function setOpenHelpItem(openIndex) {
  helpItems.forEach((item, index) => {
    const open = index === openIndex;
    const button = item.querySelector(".help-faq-question");
    const answer = item.querySelector(".help-faq-answer");
    item.classList.toggle("is-open", open);
    button.setAttribute("aria-expanded", String(open));
    answer.setAttribute("aria-hidden", String(!open));
  });
}

function setHelpCategory(category) {
  const content = helpFaqContent[category];
  if (!content) return;

  helpTabs.forEach((tab) => {
    const active = tab.dataset.helpCategory === category;
    tab.classList.toggle("is-active", active);
    tab.setAttribute("aria-selected", String(active));
  });

  helpItems.forEach((item, index) => {
    item.querySelector("[data-help-question]").textContent = content[index].question;
    item.querySelector("[data-help-answer]").textContent = content[index].answer;
  });

  setOpenHelpItem(0);
}

helpTabs.forEach((tab) => {
  tab.addEventListener("click", () => setHelpCategory(tab.dataset.helpCategory));
});

helpItems.forEach((item, index) => {
  item.querySelector(".help-faq-question").addEventListener("click", () => {
    setOpenHelpItem(item.classList.contains("is-open") ? -1 : index);
  });
});

function setHelpMenu(open) {
  if (!helpMenuButton || !helpMobileMenu) return;
  helpMenuButton.setAttribute("aria-expanded", String(open));
  helpMobileMenu.setAttribute("aria-hidden", String(!open));
  helpMobileMenu.classList.toggle("is-open", open);
}

helpMenuButton?.addEventListener("click", () => {
  setHelpMenu(helpMenuButton.getAttribute("aria-expanded") !== "true");
});

helpMobileMenu?.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", () => setHelpMenu(false));
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") setHelpMenu(false);
});
