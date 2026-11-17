(() => {
  const siteHeader = document.querySelector('.ala-site-chrome');

  if (siteHeader) {
    const menu = siteHeader.querySelector('.ala-header-menu');
    const nav = siteHeader.querySelector('.ala-header-nav');
    const blog = siteHeader.querySelector('.ala-header-item--blog');
    const trigger = blog.querySelector('.ala-header-trigger');
    const submenu = blog.querySelector('.ala-header-drop');
    const desktop = matchMedia('(min-width: 992px)');
    const finePointer = matchMedia('(hover: hover) and (pointer: fine)');
    let openTimer;
    let closeTimer;
    let pointerInNav = false;

    function updateTone() {
      siteHeader.toggleAttribute('data-solid', window.scrollY > 16 || !submenu.hidden || pointerInNav);
    }

    function setSubmenu(open) {
      clearTimeout(openTimer);
      clearTimeout(closeTimer);
      submenu.hidden = !open;
      trigger.setAttribute('aria-expanded', String(open));
      updateTone();
    }

    function setMobile(open) {
      siteHeader.toggleAttribute('data-mobile-open', open);
      menu.setAttribute('aria-expanded', String(open));
      menu.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú');
      if (!open) setSubmenu(false);
    }

    menu.addEventListener('click', () => setMobile(!siteHeader.hasAttribute('data-mobile-open')));
    trigger.addEventListener('click', () => setSubmenu(submenu.hidden));
    nav.addEventListener('pointerenter', () => {
      pointerInNav = desktop.matches && finePointer.matches;
      updateTone();
    });
    nav.addEventListener('pointerleave', () => {
      pointerInNav = false;
      updateTone();
    });


    blog.addEventListener('pointerenter', () => {
      if (!desktop.matches || !finePointer.matches) return;
      clearTimeout(closeTimer);
      if (submenu.hidden) openTimer = setTimeout(() => setSubmenu(true), 100);
    });

    blog.addEventListener('pointerleave', () => {
      if (!desktop.matches || !finePointer.matches) return;
      clearTimeout(openTimer);
      if (!submenu.contains(document.activeElement)) closeTimer = setTimeout(() => setSubmenu(false), 150);
    });

    nav.querySelectorAll('.ala-header-list > .ala-header-item:not(.ala-header-item--blog)').forEach(item => {
      item.addEventListener('pointerenter', () => {
        if (desktop.matches && !submenu.contains(document.activeElement)) setSubmenu(false);
      });
    });

    blog.addEventListener('focusout', event => {
      if (!blog.contains(event.relatedTarget)) setSubmenu(false);
    });

    blog.addEventListener('keydown', event => {
      if (event.key !== 'ArrowDown' || submenu.contains(event.target)) return;
      event.preventDefault();
      setSubmenu(true);
      submenu.querySelector('a').focus();
    });

    document.addEventListener('pointerdown', event => {
      if (!siteHeader.contains(event.target)) setMobile(false);
    });

    document.addEventListener('keydown', event => {
      if (event.key !== 'Escape' || document.querySelector('.ala-security-dialog[open]')) return;
      if (!submenu.hidden) {
        setSubmenu(false);
        if (blog.contains(document.activeElement)) trigger.focus();
      } else if (siteHeader.hasAttribute('data-mobile-open')) {
        setMobile(false);
        menu.focus();
      }
    });

    desktop.addEventListener('change', () => {
      pointerInNav = false;
      setMobile(false);
    });
    window.addEventListener('scroll', updateTone, { passive: true });
    window.addEventListener('pageshow', updateTone);
    updateTone();

    const observer = new ResizeObserver(() => {
      document.documentElement.style.setProperty('--ala-scroll-offset', `${siteHeader.offsetHeight + 12}px`);
    });
    observer.observe(siteHeader);

    const homeHero = document.querySelector('.ala-home .main-top-bg');
    if (homeHero) {
      const dockVisibility = new IntersectionObserver(([entry]) => {
        document.body.toggleAttribute('data-after-home-hero', !entry.isIntersecting && entry.boundingClientRect.bottom <= 0);
      });
      dockVisibility.observe(homeHero);
    }


    const dialog = document.querySelector('.ala-security-dialog');
    if (dialog) {
      const opener = siteHeader.querySelector('.ala-notice-more');
      opener.addEventListener('click', () => dialog.showModal());
      dialog.addEventListener('click', event => {
        if (event.target !== dialog) return;
        const { left, right, top, bottom } = dialog.getBoundingClientRect();
        if (event.clientX < left || event.clientX > right || event.clientY < top || event.clientY > bottom) dialog.close();
      });
      dialog.addEventListener('close', () => opener.focus());
    }
  }
})();
