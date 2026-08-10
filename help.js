const helpMenuButton = document.querySelector(".help-menu");
const helpNavigation = document.querySelector("#help-navigation");

function setHelpMenu(open) {
  helpNavigation.classList.toggle("is-open", open);
  helpMenuButton.setAttribute("aria-expanded", String(open));
}

helpMenuButton.addEventListener("click", () => {
  setHelpMenu(helpMenuButton.getAttribute("aria-expanded") !== "true");
});

helpNavigation.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", () => setHelpMenu(false));
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") setHelpMenu(false);
});
