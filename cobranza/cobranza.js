const mobile = window.matchMedia("(max-width: 820px)");
const header = document.querySelector(".site-header");
const disclosure = document.querySelector(".index-disclosure");
const links = Array.from(disclosure.querySelectorAll('a[href^="#"]'));
const sections = links.map((link) => document.querySelector(link.hash));
let activeLink = links.find((link) => link.hasAttribute("aria-current"));

function syncDisclosure() {
  disclosure.open = !mobile.matches;
}

function syncIndex() {
  const threshold = header.offsetHeight + 60;
  const sectionIndex = sections.findLastIndex((section) => section.getBoundingClientRect().top <= threshold);
  const reachedEnd = window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 1;
  const lastLink = links.at(-1);
  const currentLink = reachedEnd && window.location.hash === lastLink.hash ? lastLink : links[Math.max(0, sectionIndex)];

  if (activeLink === currentLink) return;

  activeLink?.removeAttribute("aria-current");
  currentLink.setAttribute("aria-current", "location");
  activeLink = currentLink;
}

disclosure.addEventListener("click", (event) => {
  if (event.target.closest("a") && mobile.matches) {
    disclosure.open = false;
  }
});

mobile.addEventListener("change", syncDisclosure);
window.addEventListener("scroll", syncIndex, { passive: true });
window.addEventListener("resize", syncIndex);
window.addEventListener("hashchange", syncIndex);
window.addEventListener("load", syncIndex);
syncDisclosure();
syncIndex();
