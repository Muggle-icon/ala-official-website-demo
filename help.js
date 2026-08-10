const helpMenuButton = document.querySelector(".help-mobile-nav .menu-button");

helpMenuButton?.addEventListener("click", () => {
  const open = helpMenuButton.getAttribute("aria-expanded") !== "true";
  helpMenuButton.setAttribute("aria-expanded", String(open));
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") helpMenuButton?.setAttribute("aria-expanded", "false");
});
