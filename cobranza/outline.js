document.addEventListener('DOMContentLoaded', () => {
  const list = document.getElementById('anchorDirectory');
  if (!list) return;

  const links = Array.from(list.querySelectorAll('a'));
  let activeLink;

  function markLocation() {
    activeLink?.removeAttribute('aria-current');
    activeLink = links.find(link => link.hash === location.hash);
    activeLink?.setAttribute('aria-current', 'location');
  }

  window.addEventListener('hashchange', markLocation);
  markLocation();
});
