const compactIndex = matchMedia('(max-width: 900px)');
const disclosure = document.querySelector('.index-disclosure');
const header = document.querySelector('.ala-header-bar');
const links = Array.from(disclosure.querySelectorAll('a[href^="#"]'));
const sections = links.map(link => document.querySelector(link.hash));
let activeLink = links.find(link => link.hasAttribute('aria-current'));

function syncDisclosure() {
  disclosure.open = !compactIndex.matches;
}

function setCurrent(link) {
  if (activeLink === link) return;
  activeLink?.removeAttribute('aria-current');
  link.setAttribute('aria-current', 'location');
  activeLink = link;
}

function syncIndex() {
  const threshold = Math.max(0, header.getBoundingClientRect().bottom) + 32;
  const visible = sections.findLastIndex(section => section.getBoundingClientRect().top <= threshold);
  const reachedEnd = scrollY + innerHeight >= document.documentElement.scrollHeight - 1;
  setCurrent(reachedEnd ? links.at(-1) : links[Math.max(0, visible)]);
}

disclosure.addEventListener('click', event => {
  const link = event.target.closest('a');
  if (!link || event.defaultPrevented || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

  if (compactIndex.matches) disclosure.open = false;
  setCurrent(link);
});

compactIndex.addEventListener('change', syncDisclosure);
addEventListener('scroll', syncIndex, { passive: true });
addEventListener('resize', syncIndex);
addEventListener('hashchange', syncIndex);
addEventListener('load', syncIndex);
if (!compactIndex.matches) disclosure.open = true;
syncIndex();
