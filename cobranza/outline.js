document.addEventListener('DOMContentLoaded', () => {
  const outline = document.querySelector('.collection-outline');
  if (!outline || outline.hidden) return;

  const desktop = matchMedia('(min-width: 1101px)');
  const header = document.querySelector('.ala-header-bar');
  const list = outline.querySelector('#anchorDirectory');
  const headings = [];
  for (const link of list.querySelectorAll('a')) {
    const heading = document.getElementById(decodeURIComponent(link.hash.slice(1)));
    if (heading?.tagName !== 'H2') {
      link.parentElement.remove();
      continue;
    }

    const shortLabel = heading.dataset.outlineLabel?.trim();
    if (shortLabel) link.textContent = shortLabel;
    headings.push({ link, heading });
  }

  if (!headings.length) {
    outline.hidden = true;
    return;
  }

  let activeLink;

  function setCurrent(link) {
    if (activeLink === link) return;
    activeLink?.removeAttribute('aria-current');
    link.setAttribute('aria-current', 'location');
    activeLink = link;
  }

  function syncDisclosure() {
    outline.open = desktop.matches;
  }

  function syncScroll() {
    const threshold = Math.max(0, header.getBoundingClientRect().bottom) + 32;
    const current = headings.findLast(({ heading }) => heading.getBoundingClientRect().top <= threshold);
    setCurrent((current || headings[0]).link);
  }

  function syncLocation() {
    const current = headings.find(({ link }) => link.hash === location.hash);
    if (current) setCurrent(current.link);
    else syncScroll();
  }

  outline.addEventListener('click', event => {
    if (!desktop.matches && event.target.closest('a') &&
        !event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey) {
      outline.open = false;
    }
  });

  desktop.addEventListener('change', syncDisclosure);
  window.addEventListener('hashchange', syncLocation);
  window.addEventListener('scroll', syncScroll, { passive: true });
  window.addEventListener('resize', syncScroll);
  syncDisclosure();
  syncLocation();
});
