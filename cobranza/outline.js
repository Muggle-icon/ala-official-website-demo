document.addEventListener('DOMContentLoaded', () => {
  const list = document.getElementById('anchorDirectory');
  if (!list) return;

  const header = document.querySelector('.ala-header-bar');
  const headings = Array.from(list.querySelectorAll('a'), link => ({
    link,
    heading: document.getElementById(decodeURIComponent(link.hash.slice(1))),
  }));

  let activeLink;

  function setCurrent(link) {
    if (activeLink === link) return;
    activeLink?.removeAttribute('aria-current');
    link.setAttribute('aria-current', 'location');
    activeLink = link;
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

  window.addEventListener('hashchange', syncLocation);
  window.addEventListener('scroll', syncScroll, { passive: true });
  window.addEventListener('resize', syncScroll);
  syncLocation();
});
