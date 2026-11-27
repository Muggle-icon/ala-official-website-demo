(() => {
  const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const marquee = document.querySelector('[data-logo-marquee]');
  if (marquee) {
    const links = marquee.querySelector('.home-social-links');
    const viewport = marquee.querySelector('.home-marquee-window');
    const toggle = marquee.querySelector('button');
    const copy = links.cloneNode(true);
    copy.setAttribute('aria-hidden', 'true');
    copy.querySelectorAll('a').forEach(link => { link.tabIndex = -1; });
    links.after(copy);

    const updateMotion = () => {
      marquee.toggleAttribute('data-running', !motion.matches);
      toggle.hidden = motion.matches;
      copy.hidden = motion.matches;
    };
    updateMotion();
    motion.addEventListener('change', updateMotion);
    toggle.addEventListener('click', () => {
      const paused = marquee.toggleAttribute('data-paused');
      toggle.setAttribute('aria-pressed', String(paused));
    });
    viewport.addEventListener('focusout', event => {
      if (!viewport.contains(event.relatedTarget)) viewport.scrollLeft = 0;
    });
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(([entry]) => {
        marquee.toggleAttribute('data-offscreen', !entry.isIntersecting);
      }).observe(marquee);
    }
  }

  if (!('IntersectionObserver' in window) || !Element.prototype.animate) return;

  // Observe individual reading units. Revisiting a section keeps its text visible.
  const observer = new IntersectionObserver(entries => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      const element = entry.target;
      observer.unobserve(element);
      if (motion.matches || element.matches(':focus-within') || entry.boundingClientRect.top < 0) continue;
      const delay = Number(element.dataset.arrival) * 85;
      let from = '0 16px';
      if (element.matches('.home-info-card, .home-review-card')) from = '14px 0';
      if (element.matches('p, .home-more, .home-store-links')) from = '0 8px';
      const animation = element.animate([
        { opacity: 0, translate: from },
        { opacity: 1, translate: '0 0' },
      ], { duration: 440, delay, easing: 'cubic-bezier(.2,.7,.24,1)', fill: 'backwards' });
      element.addEventListener('focusin', () => animation.finish(), { once: true });
    }
  }, { rootMargin: '0px 0px 8px 0px' });

  const observe = (selector, order) => {
    document.querySelectorAll(selector).forEach((element, index) => {
      element.dataset.arrival = typeof order === 'function' ? order(index) : order;
      // A restored scroll position or a deep link should be readable immediately.
      const bounds = element.getBoundingClientRect();
      if (bounds.height && bounds.bottom > 0 && bounds.top < innerHeight) return;
      observer.observe(element);
    });
  };

  observe('main > section > h2, .home-benefit h3, .home-faq h2, .home-download h2', 0);
  observe('.home-trust h2 > span', index => index);
  observe('.home-trust .home-store-links', 3);
  observe('.home-benefit p, .home-safety-intro, .home-more, .home-download h2 + p', 1);
  observe('.home-benefit-image, .home-download .home-store-links, .home-download-code, .home-marquee-window', 2);
  observe('.home-info-card, .home-review-card, .home-safety-panel > article', index => 1 + index % 3);
  observe('.home-guides .tech-guide-frame, .tech-questions .tech-tabs', 1);
  observe('.home-faq details', index => 1 + index % 3);
  observe('.home-download-facts > div, .home-footer-directory > *, .home-footer-disclosures > *', index => index % 3);
  observe('.home-arrows', 2);
})();
