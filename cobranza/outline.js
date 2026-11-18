document.addEventListener('DOMContentLoaded', () => {
  const list = document.getElementById('anchorDirectory');
  if (!list) return;

  const entries = new Map();
  let chapter;
  for (const link of list.querySelectorAll('li > a')) {
    const item = link.parentElement;
    if (item.classList.contains('link-H2')) chapter = item;
    entries.set(link.hash, { link, chapter });
  }

  let currentEntry;

  function markLocation() {
    const nextEntry = entries.get(location.hash);
    if (currentEntry === nextEntry) return;

    currentEntry?.link.removeAttribute('aria-current');
    nextEntry?.link.setAttribute('aria-current', 'location');

    if (currentEntry?.chapter !== nextEntry?.chapter) {
      currentEntry?.chapter?.removeAttribute('data-current-chapter');
      nextEntry?.chapter?.setAttribute('data-current-chapter', '');
    }

    currentEntry = nextEntry;
  }

  window.addEventListener('hashchange', markLocation);
  markLocation();
});
