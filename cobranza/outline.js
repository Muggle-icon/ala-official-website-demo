document.addEventListener('DOMContentLoaded', () => {
  const outline = document.querySelector('.collection-outline');
  if (!outline || outline.hidden) return;

  const desktop = matchMedia('(min-width: 1101px)');
  const header = document.querySelector('.ala-header-bar');
  const list = outline.querySelector('#anchorDirectory');
  const subsections = [];
  let chapter;
  let children;

  for (const item of Array.from(list.children)) {
    if (!item.classList.contains('toc-subentry') || !chapter) {
      chapter = item;
      chapter.classList.add('index-chapter');
      children = null;
    } else {
      if (!children) {
        children = document.createElement('ol');
        children.className = 'index-subsections';
        children.hidden = true;
        chapter.append(children);
        subsections.push(children);
      }
      children.append(item);
    }
  }

  const headings = Array.from(list.querySelectorAll('a'), link => ({
    link,
    heading: document.getElementById(decodeURIComponent(link.hash.slice(1))),
  }));
  let activeLink;
  let activeChapter;

  function setCurrent(link) {
    if (activeLink === link) return;
    activeLink?.removeAttribute('aria-current');
    link.setAttribute('aria-current', 'location');
    activeLink = link;

    const currentChapter = link.closest('.index-chapter');
    if (activeChapter === currentChapter) return;
    activeChapter = currentChapter;
    for (const section of subsections) section.hidden = section.parentElement !== currentChapter;
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
