(() => {
  const siteHeader = document.querySelector('.ala-site-chrome');
  if (!siteHeader) return;

  const bar = siteHeader.querySelector('.ala-header-bar');
  const nav = siteHeader.querySelector('.ala-header-nav');
  const menu = siteHeader.querySelector('.ala-header-menu');
  const notice = siteHeader.querySelector('.ala-site-notice');
  const hero = siteHeader.hasAttribute('data-home') ? document.querySelector('.ala-home-hero') : null;
  const desktop = matchMedia('(min-width: 1101px)');
  const finePointer = matchMedia('(hover: hover) and (pointer: fine)');
  const disclosures = [...nav.querySelectorAll('[data-ala-menu]')].map(trigger => ({
    trigger,
    panel: document.getElementById(trigger.getAttribute('aria-controls')),
  }));
  let active = null;
  let openTimer;
  let closeTimer;
  let scrollFrame = 0;
  let releasePage = null;

  function positionHeader() {
    const barBounds = bar.getBoundingClientRect();
    if (hero) siteHeader.toggleAttribute('data-solid', hero.getBoundingClientRect().bottom <= barBounds.bottom);
    siteHeader.style.setProperty('--ala-header-top', Math.max(0, barBounds.top) + 'px');
    document.documentElement.style.setProperty('--ala-scroll-offset', (barBounds.bottom + 16) + 'px');

    if (desktop.matches && active) {
      const { trigger, panel } = active;
      const bounds = trigger.getBoundingClientRect();
      const panelWidth = panel.offsetWidth;
      const left = Math.max(16, Math.min(
        bounds.left + (bounds.width - panelWidth) / 2,
        document.documentElement.clientWidth - panelWidth - 16,
      ));
      panel.style.setProperty('--ala-dropdown-left', (left - trigger.parentElement.getBoundingClientRect().left) + 'px');
    }
  }

  function showDisclosure(item, moveFocus = false) {
    clearTimeout(openTimer);
    clearTimeout(closeTimer);
    active = item;
    for (const disclosure of disclosures) {
      const expanded = disclosure === active;
      disclosure.trigger.setAttribute('aria-expanded', String(expanded));
      disclosure.panel.hidden = !expanded;
    }
    positionHeader();
    if (moveFocus) active?.panel.querySelector('a')?.focus({ preventScroll: true });
  }

  function lockPage() {
    const siblings = [...document.body.children].filter(element =>
      element !== siteHeader && !['SCRIPT', 'STYLE', 'LINK'].includes(element.tagName)
    );
    const inertStates = [...siblings, notice, siteHeader.querySelector('.ala-header-skip')]
      .filter(Boolean).map(element => [element, element.inert]);
    for (const [element] of inertStates) element.inert = true;
    const scrollY = window.scrollY;
    const overflow = document.documentElement.style.overflow;
    document.documentElement.style.overflow = 'hidden';
    return () => {
      document.documentElement.style.overflow = overflow;
      for (const [element, inert] of inertStates) element.inert = inert;
      if (window.scrollY !== scrollY) window.scrollTo({ top: scrollY, behavior: 'instant' });
    };
  }

  function setMobile(open, restoreFocus = false) {
    if (siteHeader.hasAttribute('data-mobile-open') === open) return;
    siteHeader.toggleAttribute('data-mobile-open', open);
    menu.setAttribute('aria-expanded', String(open));
    menu.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú');

    if (open) {
      bar.setAttribute('role', 'dialog');
      bar.setAttribute('aria-modal', 'true');
      bar.setAttribute('aria-label', 'Menú de navegación');
      releasePage = lockPage();
      menu.focus({ preventScroll: true });
    } else {
      bar.removeAttribute('role');
      bar.removeAttribute('aria-modal');
      bar.removeAttribute('aria-label');
      releasePage?.();
      releasePage = null;
      showDisclosure(null);
      if (restoreFocus && !desktop.matches) menu.focus({ preventScroll: true });
    }
  }

  menu.addEventListener('click', () => setMobile(!siteHeader.hasAttribute('data-mobile-open'), true));

  for (const item of disclosures) {
    item.trigger.addEventListener('click', () => showDisclosure(active === item ? null : item));
    item.trigger.addEventListener('keydown', event => {
      if (event.key !== 'ArrowDown') return;
      event.preventDefault();
      showDisclosure(item, true);
    });
  }

  for (const control of nav.querySelectorAll('.ala-header-item > :is(a, button)')) {
    control.addEventListener('pointerenter', () => {
      if (!desktop.matches || !finePointer.matches) return;
      const item = disclosures.find(disclosure => disclosure.trigger === control) ?? null;
      if (!item || active) showDisclosure(item);
      else openTimer = setTimeout(() => showDisclosure(item), 120);
    });
    control.addEventListener('pointerleave', () => clearTimeout(openTimer));
  }

  bar.addEventListener('pointerenter', () => clearTimeout(closeTimer));
  bar.addEventListener('pointerleave', () => {
    clearTimeout(openTimer);
    if (!desktop.matches || !finePointer.matches) return;
    closeTimer = setTimeout(() => {
      if (!active?.panel.contains(document.activeElement)) showDisclosure(null);
    }, 180);
  });

  nav.addEventListener('focusout', event => {
    if (desktop.matches && !nav.contains(event.relatedTarget)) showDisclosure(null);
  });

  nav.addEventListener('click', event => {
    if (!event.target.closest('a')) return;
    setMobile(false);
    showDisclosure(null);
  });

  document.addEventListener('pointerdown', event => {
    if (desktop.matches && !bar.contains(event.target)) showDisclosure(null);
  });

  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && !document.querySelector('.ala-security-dialog[open]')) {
      if (active) {
        const { trigger } = active;
        showDisclosure(null);
        trigger.focus({ preventScroll: true });
      } else setMobile(false, true);
    }

    if (event.key === 'Tab' && releasePage) {
      const visible = [...bar.querySelectorAll('button, a')].filter(element => element.getClientRects().length);
      const first = visible[0];
      const last = visible.at(-1);
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }
  });

  window.addEventListener('scroll', () => {
    if (desktop.matches && active) showDisclosure(null);
    if (scrollFrame) return;
    scrollFrame = requestAnimationFrame(() => {
      scrollFrame = 0;
      positionHeader();
    });
  }, { passive: true });
  window.addEventListener('resize', positionHeader);
  window.addEventListener('hashchange', () => showDisclosure(null));
  window.addEventListener('pageshow', positionHeader);
  desktop.addEventListener('change', () => {
    setMobile(false);
    showDisclosure(null);
  });

  function measureHeader() {
    if (notice) {
      document.documentElement.style.setProperty('--ala-notice-size', notice.getBoundingClientRect().height + 'px');
    }
    positionHeader();
  }

  const sizes = new ResizeObserver(measureHeader);
  sizes.observe(bar);
  if (notice) sizes.observe(notice);
  measureHeader();

  const dialog = document.querySelector('.ala-security-dialog');
  if (notice && dialog) {
    notice.addEventListener('click', () => dialog.showModal());
    dialog.addEventListener('click', event => {
      if (event.target !== dialog) return;
      const { left, right, top, bottom } = dialog.getBoundingClientRect();
      if (event.clientX < left || event.clientX > right || event.clientY < top || event.clientY > bottom) dialog.close();
    });
    dialog.addEventListener('close', () => notice.focus({ preventScroll: true }));
  }
})();
