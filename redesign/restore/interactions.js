(() => {
  const versions = {
    finance: document.getElementById('finance'),
    tech: document.getElementById('tech'),
  };
  const query = new URLSearchParams(window.location.search);
  const activeVersion = query.get('design') === 'tecnologia' ? 'tech' : 'finance';

  for (const [name, panel] of Object.entries(versions)) {
    if (!panel) continue;
    const isCurrent = name === activeVersion;
    panel.hidden = !isCurrent;
    const link = document.querySelector(`[data-version-link="${name}"]`);
    if (isCurrent) link?.setAttribute('aria-current', 'page');
    else link?.removeAttribute('aria-current');
  }

  // Keep bookmarks to sections from the previous homepage working.
  const legacySections = {
    'ala-content': ['finance-main', 'tech-content'],
    contenido: ['finance-main', 'tech-content'],
    credito: ['finance-main', 'tech-content'],
    requisitos: ['finance-requisitos', 'tech-producto'],
    'como-solicitar': ['finance-beneficios', 'tech-producto'],
    'como-funciona': ['finance-beneficios', 'tech-producto'],
    costos: ['finance-costos', 'tech-costos'],
    pagos: ['finance-pagos', 'tech-costos'],
    ayuda: ['finance-ayuda', 'tech-ayuda'],
    seguridad: ['finance-seguridad', 'tech-seguridad'],
    educacion: ['finance-articulos', 'tech-educacion'],
    'more-articles': ['finance-articulos', 'tech-educacion'],
    'ala-en-los-medios': ['finance-pagos', 'tech-educacion'],
    descargar: ['finance-descarga', 'tech-descargar'],
    'documentos-legales': ['finance-legal', 'tech-legal'],
    'informacion-legal': ['finance-legal', 'tech-legal'],
  };
  const legacyTarget = legacySections[window.location.hash.slice(1)]?.[activeVersion === 'tech' ? 1 : 0];
  if (legacyTarget) {
    window.addEventListener('load', () => document.getElementById(legacyTarget)?.scrollIntoView(), { once: true });
  }

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  for (const carousel of document.querySelectorAll('[data-carousel]')) {
    const track = carousel.querySelector('[data-track]');
    const previous = carousel.querySelector('[data-carousel-prev]');
    const next = carousel.querySelector('[data-carousel-next]');
    if (!track || !previous || !next) continue;

    const slides = Array.from(track.children);
    const updateButtons = () => {
      previous.disabled = track.scrollLeft <= 1;
      next.disabled = track.scrollWidth - track.clientWidth - track.scrollLeft <= 1;
    };

    const move = direction => {
      const position = track.scrollLeft;
      const origin = track.getBoundingClientRect().left + track.clientLeft;
      const starts = slides.map(slide => slide.getBoundingClientRect().left - origin + position);
      const destination = direction > 0
        ? starts.find(start => start > position + 2) ?? track.scrollWidth
        : starts.findLast(start => start < position - 2) ?? 0;

      track.scrollTo({ left: destination, behavior: reduceMotion.matches ? 'instant' : 'smooth' });
      updateButtons();
    };

    previous.addEventListener('click', () => move(-1));
    next.addEventListener('click', () => move(1));
    track.addEventListener('scroll', updateButtons, { passive: true });
    new ResizeObserver(updateButtons).observe(track);
    updateButtons();
  }

  document.querySelectorAll('[data-faq-tabs]').forEach((group, groupIndex) => {
    const pairs = Array.from(group.querySelectorAll('[data-faq-tab]'))
      .map(button => ({ button, panel: document.getElementById(button.getAttribute('aria-controls')) }))
      .filter(({ panel }) => panel);
    if (!pairs.length) return;

    group.setAttribute('role', 'tablist');
    const select = current => {
      pairs.forEach(({ button, panel }, index) => {
        const isSelected = button === current;
        button.id ||= `restore-faq-tab-${groupIndex + 1}-${index + 1}`;
        button.setAttribute('role', 'tab');
        button.setAttribute('aria-selected', String(isSelected));
        button.tabIndex = isSelected ? 0 : -1;
        panel.setAttribute('role', 'tabpanel');
        panel.setAttribute('aria-labelledby', button.id);
        panel.hidden = !isSelected;
      });
    };

    pairs.forEach(({ button }, index) => {
      button.addEventListener('click', () => select(button));
      button.addEventListener('keydown', event => {
        let target;
        if (event.key === 'ArrowLeft') target = (index + pairs.length - 1) % pairs.length;
        if (event.key === 'ArrowRight') target = (index + 1) % pairs.length;
        if (event.key === 'Home') target = 0;
        if (event.key === 'End') target = pairs.length - 1;
        if (target === undefined) return;
        event.preventDefault();
        const nextTab = pairs[target].button;
        select(nextTab);
        nextTab.focus();
      });
    });

    const initial = pairs.find(({ button }) => button.getAttribute('aria-selected') === 'true');
    select(initial?.button ?? pairs[0].button);
  });

  const downloadDialog = document.getElementById('download-dialog');
  if (typeof downloadDialog?.showModal !== 'function') return;
  let downloadTrigger;

  for (const trigger of document.querySelectorAll('[data-download]')) {
    trigger.addEventListener('click', event => {
      if (event.defaultPrevented || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
      event.preventDefault();
      if (downloadDialog.open) return;
      downloadTrigger = trigger;
      downloadDialog.showModal();
    });
  }

  for (const closeButton of downloadDialog.querySelectorAll('[data-close-dialog], .dialog-close')) {
    closeButton.addEventListener('click', () => downloadDialog.close());
  }

  downloadDialog.addEventListener('click', event => {
    if (event.target !== downloadDialog) return;
    const { left, top, right, bottom } = downloadDialog.getBoundingClientRect();
    if (event.clientX < left || event.clientX > right || event.clientY < top || event.clientY > bottom) {
      downloadDialog.close();
    }
  });

  downloadDialog.addEventListener('close', () => downloadTrigger?.focus());
})();
