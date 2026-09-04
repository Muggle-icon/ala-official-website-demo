const siteLegalDocuments = [...document.querySelectorAll(".legal-document")];

function setSiteLegalDocument(documentItem, open) {
  const trigger = documentItem.querySelector(".legal-document-trigger");
  const submenu = documentItem.querySelector(".legal-submenu");
  documentItem.classList.toggle("is-open", open);
  trigger.setAttribute("aria-expanded", String(open));
  submenu.hidden = !open;
}

function closeOtherSiteLegalDocuments(currentItem) {
  siteLegalDocuments.forEach((documentItem) => {
    if (documentItem !== currentItem) setSiteLegalDocument(documentItem, false);
  });
}

siteLegalDocuments.forEach((documentItem) => {
  const trigger = documentItem.querySelector(".legal-document-trigger");
  setSiteLegalDocument(documentItem, false);

  documentItem.addEventListener("pointerenter", (event) => {
    if (event.pointerType === "touch") return;
    closeOtherSiteLegalDocuments(documentItem);
    setSiteLegalDocument(documentItem, true);
  });

  documentItem.addEventListener("pointerleave", (event) => {
    if (event.pointerType === "touch") return;
    setSiteLegalDocument(documentItem, false);
  });

  trigger.addEventListener("click", (event) => {
    const keyboardActivation = event.detail === 0;
    const canHover = window.matchMedia("(hover: hover)").matches;
    closeOtherSiteLegalDocuments(documentItem);
    setSiteLegalDocument(documentItem, keyboardActivation || !canHover ? !documentItem.classList.contains("is-open") : true);
  });

  documentItem.addEventListener("focusout", () => {
    window.setTimeout(() => {
      if (!documentItem.contains(document.activeElement)) setSiteLegalDocument(documentItem, false);
    }, 0);
  });
});

document.addEventListener("keydown", (event) => {
  if (event.key !== "Escape") return;
  siteLegalDocuments.forEach((documentItem) => setSiteLegalDocument(documentItem, false));
});
