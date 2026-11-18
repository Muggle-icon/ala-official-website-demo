document.addEventListener('DOMContentLoaded', () => {
  const outline = document.querySelector('.collection-outline');
  if (!outline || outline.hidden) return;

  const desktop = matchMedia('(min-width: 1101px)');
  const links = outline.querySelectorAll('a');

  function syncDisclosure() {
    outline.open = desktop.matches;
  }

  function syncLocation() {
    for (const link of links) {
      if (link.hash === location.hash) {
        link.setAttribute('aria-current', 'location');
      } else {
        link.removeAttribute('aria-current');
      }
    }
  }

  outline.addEventListener('click', event => {
    if (!desktop.matches && event.target.closest('a') &&
        !event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey) {
      outline.open = false;
    }
  });

  desktop.addEventListener('change', syncDisclosure);
  window.addEventListener('hashchange', syncLocation);
  syncDisclosure();
  syncLocation();
});
