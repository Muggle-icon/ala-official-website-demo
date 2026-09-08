/* Shared navigation for the homepage and Ayuda. No framework dependency. */
(() => {
  const desktop = document.querySelector('.desktop-nav');
  const mobile = document.querySelector('.mobile-nav');
  if (!desktop || !mobile) return;

  const isHelp = document.body.classList.contains('help-faq-body');
  const mobileQuery = window.matchMedia('(max-width: 1100px)');
  const hoverQuery = window.matchMedia('(hover: hover) and (pointer: fine)');
  const home = isHelp ? './index.html' : '';
  const faq = isHelp ? '#ayuda' : '#preguntas';
  const moreLinks = [
    ['Sobre ALA', '#sobre-ala'],
    ['Contáctanos', '#contacto'],
    ['Documentos legales', '#documentos-legales'],
  ];
  const supportLinks = [
    ['Centro de ayuda', './help.html'],
    ['Preguntas frecuentes', faq],
    ['Protección regulatoria', `${home}#proteccion`],
  ];
  const list = (items) => `<ul>${items.map(([label, href]) => `<li><a href="${href}">${label}<span aria-hidden="true">↗</span></a></li>`).join('')}</ul>`;
  const moreContent = (suffix) => `
    <section class="nav-link-group" aria-labelledby="nav-about-${suffix}">
      <h2 id="nav-about-${suffix}">Conoce ALA</h2>${list(moreLinks)}
    </section>
    <section class="nav-link-group" aria-labelledby="nav-support-${suffix}">
      <h2 id="nav-support-${suffix}">Ayuda y confianza</h2>${list(supportLinks)}
    </section>`;
  const blogContent = `
    <div class="nav-coming-soon"><span>Blog de ALA</span><p>Próximamente</p>
      <div>Estamos preparando nuevos contenidos para ti.</div>
    </div>`;

  // A fixed header inside the size-contained, clipped hero cannot remain sticky.
  // Reuse the existing markup at body level, preserving its original dimensions.
  const root = document.createElement('div');
  root.className = 'site-navigation';
  root.append(desktop, mobile);
  document.body.prepend(root);
  document.querySelector('.help-mobile-menu')?.remove();
  const status = document.querySelector('.ios-status');
  if (status) {
    if (!isHelp) {
      const spacer = document.createElement('div');
      spacer.className = 'nav-status-space';
      spacer.setAttribute('aria-hidden', 'true');
      status.before(spacer);
    }
    document.body.append(status);
  }

  const backdrop = document.createElement('div');
  backdrop.className = 'navigation-backdrop';
  backdrop.setAttribute('aria-hidden', 'true');
  document.body.append(backdrop);
  root.insertAdjacentHTML('beforeend', `
    <div class="navigation-panel" id="navigation-blog" role="region" aria-label="Blog" hidden>
      <div class="navigation-panel-inner">${blogContent}</div>
    </div>
    <div class="navigation-panel" id="navigation-more" role="region" aria-label="Más información" hidden>
      <div class="navigation-panel-inner">${moreContent('desktop')}</div>
    </div>
    <nav class="navigation-mobile-panel" id="navigation-mobile" aria-label="Navegación móvil" hidden>
      <div class="navigation-mobile-links">
        <a href="${home}#producto">Introducción del producto</a>
        <a href="${home}#proteccion">Protección regulatoria</a>
        <button type="button" data-mobile-section="blog" aria-expanded="false" aria-controls="mobile-blog">Blog<span class="navigation-chevron" aria-hidden="true"></span></button>
        <div class="navigation-mobile-section" id="mobile-blog" hidden>${blogContent}</div>
        <button type="button" data-mobile-section="more" aria-expanded="false" aria-controls="mobile-more">Más información<span class="navigation-chevron" aria-hidden="true"></span></button>
        <div class="navigation-mobile-section" id="mobile-more" hidden>${moreContent('mobile')}</div>
        <a href="${faq}">Preguntas frecuentes</a>
      </div>
      <a class="navigation-help-link" href="./help.html">Centro de ayuda <span aria-hidden="true">↗</span></a>
    </nav>`);

  const triggers = [...root.querySelectorAll('[data-nav-panel]')];
  const menu = mobile.querySelector('.menu-button');
  menu.setAttribute('aria-controls', 'navigation-mobile');
  const panels = [...root.querySelectorAll('.navigation-panel, .navigation-mobile-panel')];
  let active = null;
  let hoverTimer;
  let leaveTimer;
  let unlockPage = null;
  let frame = 0;

  function updatePosition() {
    const statusHeight = status?.offsetHeight || 0;
    const noticeHeight = isHelp ? 0 : document.querySelector('.notice-bar')?.offsetHeight || 0;
    const top = statusHeight + Math.max(0, noticeHeight - window.scrollY);
    const rowHeight = (mobileQuery.matches ? mobile : desktop).getBoundingClientRect().height;
    root.style.setProperty('--navigation-top', `${top}px`);
    document.documentElement.style.setProperty('--navigation-bottom', `${top + rowHeight}px`);
    root.classList.toggle('is-solid', isHelp || window.scrollY >= noticeHeight || active !== null);
    const afterHero = !isHelp && window.scrollY >= (document.querySelector('.faq-section')?.offsetTop || innerHeight) - statusHeight - rowHeight;
    document.body.classList.toggle('is-after-hero', afterHero);
    frame = 0;
  }

  function lockPage() {
    const scrollY = window.scrollY;
    const previous = { overflow: document.body.style.overflow, paddingRight: document.body.style.paddingRight };
    const scrollbar = window.innerWidth - document.documentElement.clientWidth;
    const siblings = [...document.body.children].filter((element) => element !== root && element !== status && element !== backdrop && !['SCRIPT', 'STYLE'].includes(element.tagName));
    const states = siblings.map((element) => [element, element.inert]);
    siblings.forEach((element) => { element.inert = true; });
    document.body.style.overflow = 'hidden';
    if (scrollbar) document.body.style.paddingRight = `${scrollbar}px`;
    // touch-action/overscroll on the panel stop scroll chaining on mobile Safari.
    document.documentElement.classList.add('navigation-locked');
    return () => {
      states.forEach(([element, inert]) => { element.inert = inert; });
      Object.assign(document.body.style, previous);
      document.documentElement.classList.remove('navigation-locked');
      window.scrollTo({ top: scrollY, behavior: 'instant' });
    };
  }

  function setPanel(name, focus = false) {
    clearTimeout(hoverTimer);
    clearTimeout(leaveTimer);
    const previous = active;
    if (previous === name) return;
    active = name;
    if (unlockPage) { unlockPage(); unlockPage = null; }
    panels.forEach((panel) => { panel.hidden = panel.id !== `navigation-${name}`; });
    triggers.forEach((trigger) => trigger.setAttribute('aria-expanded', String(trigger.dataset.navPanel === name)));
    menu.setAttribute('aria-expanded', String(name === 'mobile'));
    menu.setAttribute('aria-label', name === 'mobile' ? 'Cerrar menú' : 'Abrir menú');
    root.classList.toggle('is-open', name !== null);
    backdrop.classList.toggle('is-visible', name !== null);
    if (name === 'mobile') {
      root.setAttribute('role', 'dialog');
      root.setAttribute('aria-modal', 'true');
      root.setAttribute('aria-label', 'Menú de navegación');
      unlockPage = lockPage();
      if (focus) menu.focus({ preventScroll: true });
    } else {
      root.removeAttribute('role');
      root.removeAttribute('aria-modal');
      root.removeAttribute('aria-label');
      if (focus && name) root.querySelector(`#navigation-${name} a`)?.focus({ preventScroll: true });
    }
    if (!name) {
      root.querySelectorAll('[data-mobile-section]').forEach((button) => {
        button.setAttribute('aria-expanded', 'false');
        document.getElementById(button.getAttribute('aria-controls')).hidden = true;
      });
      if (focus) (previous === 'mobile' ? menu : triggers.find((trigger) => trigger.dataset.navPanel === previous))?.focus({ preventScroll: true });
    }
    updatePosition();
  }

  triggers.forEach((trigger) => {
    const name = trigger.dataset.navPanel;
    trigger.addEventListener('click', () => setPanel(active === name ? null : name));
    trigger.addEventListener('pointerenter', () => {
      if (mobileQuery.matches || !hoverQuery.matches) return;
      clearTimeout(leaveTimer);
      hoverTimer = setTimeout(() => setPanel(name), 120);
    });
    trigger.addEventListener('pointerleave', () => clearTimeout(hoverTimer));
    trigger.addEventListener('keydown', (event) => {
      if (event.key === 'ArrowDown') {
        event.preventDefault();
        if (active !== name) setPanel(name, true);
        else root.querySelector(`#navigation-${name} a`)?.focus();
      }
    });
  });
  root.addEventListener('pointerenter', () => clearTimeout(leaveTimer));
  root.addEventListener('pointerleave', () => {
    clearTimeout(hoverTimer);
    if (!mobileQuery.matches && hoverQuery.matches) leaveTimer = setTimeout(() => {
      const focusedPanel = document.activeElement?.closest('.navigation-panel');
      if (!focusedPanel) setPanel(null);
    }, 180);
  });
  root.addEventListener('focusout', () => {
    requestAnimationFrame(() => {
      if (active && active !== 'mobile' && !root.contains(document.activeElement)) setPanel(null);
    });
  });
  menu.addEventListener('click', () => setPanel(active === 'mobile' ? null : 'mobile', true));
  root.querySelectorAll('[data-mobile-section]').forEach((button) => {
    button.addEventListener('click', () => {
      const open = button.getAttribute('aria-expanded') !== 'true';
      button.setAttribute('aria-expanded', String(open));
      document.getElementById(button.getAttribute('aria-controls')).hidden = !open;
    });
  });
  root.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => setPanel(null)));
  backdrop.addEventListener('click', () => setPanel(null, true));
  document.addEventListener('click', (event) => {
    if (event.target.closest('[data-open-notice], [data-toggle-help]')) setPanel(null);
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && active) {
      event.preventDefault();
      setPanel(null, true);
    }
    if (event.key === 'Tab' && active === 'mobile') {
      const focusable = [...root.querySelectorAll('a, button')].filter((element) => !element.disabled && element.getClientRects().length);
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && (document.activeElement === first || !root.contains(document.activeElement))) {
        event.preventDefault(); last?.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault(); first?.focus();
      }
    }
  });
  window.addEventListener('scroll', () => {
    if (active && active !== 'mobile') setPanel(null);
    if (!frame) frame = requestAnimationFrame(updatePosition);
  }, { passive: true });
  window.addEventListener('resize', updatePosition);
  window.addEventListener('hashchange', () => setPanel(null));
  window.addEventListener('pageshow', () => { setPanel(null); updatePosition(); });
  mobileQuery.addEventListener('change', () => { setPanel(null); updatePosition(); });
  document.body.classList.add('navigation-ready');
  updatePosition();
})();
