const helpMenuButton = document.querySelector(".help-mobile-nav .menu-button");
const helpDesktopNav = document.querySelector(".help-desktop-nav");
const helpHero = document.querySelector(".help-hero");

function setHelpDesktopNavSurface() {
  if (!helpDesktopNav || !helpHero) return;
  helpDesktopNav.classList.toggle("is-after-hero", window.scrollY >= helpHero.offsetHeight - 1);
}

window.addEventListener("scroll", setHelpDesktopNavSurface, { passive: true });
window.addEventListener("resize", setHelpDesktopNavSurface);
setHelpDesktopNavSurface();

helpMenuButton?.addEventListener("click", () => {
  const open = helpMenuButton.getAttribute("aria-expanded") !== "true";
  helpMenuButton.setAttribute("aria-expanded", String(open));
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") helpMenuButton?.setAttribute("aria-expanded", "false");
});
