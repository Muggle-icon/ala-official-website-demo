const helpPanel = document.querySelector(".help-panel");
const helpBackdrop = document.querySelector(".help-backdrop");
const noticeOverlay = document.querySelector(".notice-overlay");
const noticeModal = document.querySelector(".notice-modal");
const openNoticeButton = document.querySelector("[data-open-notice]");
const menuButton = document.querySelector(".menu-button");
const desktopNavLinks = [...document.querySelectorAll(".desktop-nav nav a")];

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
