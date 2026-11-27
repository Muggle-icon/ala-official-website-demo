(() => {
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const scrollBehavior = () => reducedMotion.matches ? 'instant' : 'smooth';

  const legacySections = new Map(Object.entries({
    'ala-content': 'tech-content',
    contenido: 'tech-content',
    credito: 'tech-content',
    requisitos: 'tech-producto',
    'como-solicitar': 'tech-producto',
    'como-funciona': 'tech-producto',
    costos: 'tech-costos',
    pagos: 'tech-pagos',
    ayuda: 'tech-ayuda',
    seguridad: 'tech-seguridad',
    educacion: 'tech-educacion',
    'more-articles': 'tech-educacion',
    descargar: 'tech-descargar',
    'documentos-legales': 'tech-legal',
    'informacion-legal': 'tech-legal',
    'finance-main': 'tech-content',
    'finance-beneficios': 'tech-producto',
    'finance-requisitos': 'tech-producto',
    'finance-costos': 'tech-costos',
    'finance-articulos': 'tech-educacion',
    'finance-seguridad': 'tech-seguridad',
    'finance-pagos': 'tech-pagos',
    'finance-ayuda': 'tech-ayuda',
    'finance-descarga': 'tech-descargar',
    'finance-legal': 'tech-legal',
  }));
  const scrollToLegacySection = behavior => {
    const target = legacySections.get(window.location.hash.slice(1));
    if (target) document.getElementById(target)?.scrollIntoView({ behavior });
  };
  window.addEventListener('load', () => scrollToLegacySection('instant'), { once: true });
  window.addEventListener('hashchange', () => scrollToLegacySection(scrollBehavior()));

  const header = document.querySelector('[data-restore-header]');
  const masthead = document.querySelector('[data-hero-masthead]');
  const stage = masthead?.querySelector('[data-hero-stage]');
  const visual = stage?.querySelector('[data-hero-visual]');
  if (header && stage && visual) {
    const home = masthead.closest('#tech');
    const motion = window.matchMedia('(prefers-reduced-motion: no-preference) and (min-height: 520px)');
    const narrow = window.matchMedia('(max-width: 670px)');
    const photo = visual.querySelector('img');
    const clamp = (value, upper = 1) => Math.min(upper, Math.max(0, value));
    const ease = (value, start, end) => {
      const t = clamp((value - start) / (end - start));
      return t * t * (3 - 2 * t);
    };

    let geometry;
    let lastOffset;
    let frame;

    const paint = () => {
      if (!geometry) return;
      const { runway, lead, top, viewport, mobile } = geometry;
      const offset = clamp(window.scrollY - top, lead + runway);
      if (lastOffset === offset) return;

      const progress = clamp((offset - lead) / runway);
      // A quick initial opening eases into a full-bleed hold on desktop.
      const expand = 1 - (1 - clamp(progress / (mobile ? 1 : .92))) ** 3;
      const copyExit = mobile ? 0 : ease(progress, .76, .885);

      stage.style.setProperty('--hero-expand', expand);
      stage.style.setProperty('--hero-copy-exit', copyExit);
      stage.toggleAttribute('data-hero-quiet', copyExit >= .96);
      if (mobile || offset <= 8 || offset < lastOffset) {
        header.removeAttribute('data-hero-nav-hidden');
      } else if (offset > viewport * .12 && (lastOffset === undefined || offset > lastOffset)) {
        header.setAttribute('data-hero-nav-hidden', '');
      }
      header.style.setProperty('--hero-nav-offset', `${mobile ? 0 : offset}px`);
      header.style.setProperty('--hero-nav-surface', mobile ? 0 : ease(expand, .6, .92));
      lastOffset = offset;

      if (offset > 8) home.removeAttribute('data-hero-enter');
    };

    const measure = () => {
      home.toggleAttribute('data-hero-motion', motion.matches);
      if (!motion.matches) {
        geometry = undefined;
        home.removeAttribute('data-hero-enter');
        return;
      }

      const viewport = document.documentElement.clientHeight;
      const mobile = narrow.matches;
      const runway = Math.round(viewport * (mobile ? .24 : 2));
      const bounds = stage.getBoundingClientRect();
      const slot = visual.getBoundingClientRect();
      const lead = mobile ? 0 : Math.max(0, bounds.height - viewport);

      // Keep the photo's grid slot as the stable origin while the frame expands.
      stage.style.setProperty('--hero-photo-top', `${slot.top - bounds.top}px`);
      stage.style.setProperty('--hero-photo-right', `${bounds.right - slot.right}px`);
      stage.style.setProperty('--hero-photo-bottom', `${bounds.bottom - slot.bottom}px`);
      stage.style.setProperty('--hero-photo-left', `${slot.left - bounds.left}px`);
      stage.style.setProperty('--hero-pin-top', `${-lead}px`);
      masthead.style.setProperty('--hero-runway', `${mobile ? 0 : runway}px`);
      geometry = { runway, lead, viewport, mobile, top: masthead.getBoundingClientRect().top + window.scrollY };
      lastOffset = undefined;
      paint();
    };

    window.addEventListener('scroll', () => {
      if (!geometry || frame !== undefined) return;
      frame = requestAnimationFrame(() => {
        frame = undefined;
        paint();
      });
    }, { passive: true });
    window.addEventListener('resize', measure, { passive: true });
    window.addEventListener('pageshow', measure);
    motion.addEventListener('change', measure);
    if ('ResizeObserver' in window) {
      const observer = new ResizeObserver(measure);
      observer.observe(stage);
      observer.observe(visual);
    }
    photo?.addEventListener('animationend', () => home.removeAttribute('data-hero-enter'), { once: true });
    if (motion.matches && window.scrollY < 2 && !window.location.hash) {
      home.setAttribute('data-hero-enter', '');
    }
    measure();
  }

  const nav = header?.querySelector('[data-restore-nav]');
  const menuToggle = header?.querySelector('[data-mobile-menu]');
  if (nav && menuToggle) {
    const disclosures = [...nav.querySelectorAll('.tech-nav-disclosure')];
    let mobile = false;

    const closeDisclosures = except => {
      for (const disclosure of disclosures) {
        if (disclosure !== except) disclosure.open = false;
      }
    };

    const setMobileMenu = open => {
      header.toggleAttribute('data-mobile-open', open);
      nav.inert = mobile && !open;
      menuToggle.setAttribute('aria-expanded', String(open));
      menuToggle.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú');
      if (!open) closeDisclosures();
    };

    const syncBreakpoint = () => {
      const nextMobile = getComputedStyle(menuToggle).display !== 'none';
      if (mobile === nextMobile) return;
      mobile = nextMobile;
      setMobileMenu(false);
    };

    menuToggle.addEventListener('click', () => {
      setMobileMenu(!header.hasAttribute('data-mobile-open'));
    });

    for (const disclosure of disclosures) {
      disclosure.addEventListener('toggle', () => {
        if (disclosure.open) closeDisclosures(disclosure);
      });
    }

    nav.addEventListener('click', event => {
      if (event.target.closest('a')) setMobileMenu(false);
    });

    document.addEventListener('pointerdown', event => {
      for (const disclosure of disclosures) {
        if (!disclosure.contains(event.target)) disclosure.open = false;
      }
      if (!header.contains(event.target) && header.hasAttribute('data-mobile-open')) {
        setMobileMenu(false);
      }
    });

    nav.addEventListener('focusout', event => {
      const disclosure = event.target.closest('details');
      if (disclosure && event.relatedTarget && !disclosure.contains(event.relatedTarget)) {
        disclosure.open = false;
      }
    });

    document.addEventListener('keydown', event => {
      if (event.key !== 'Escape' || document.querySelector('dialog[open]')) return;
      const openDisclosure = disclosures.find(disclosure => disclosure.open);
      if (openDisclosure) {
        event.preventDefault();
        openDisclosure.open = false;
        openDisclosure.querySelector('summary')?.focus();
      } else if (header.hasAttribute('data-mobile-open')) {
        event.preventDefault();
        setMobileMenu(false);
        menuToggle.focus();
      }
    });

    header.setAttribute('data-nav-ready', '');
    window.addEventListener('resize', syncBreakpoint, { passive: true });
    syncBreakpoint();
  }

  const initializeCarousel = carousel => {
    const track = carousel.querySelector('[data-track]');
    if (!track?.children.length) return;

    const previous = carousel.querySelector('[data-carousel-prev]');
    const next = carousel.querySelector('[data-carousel-next]');
    const indicators = [...carousel.querySelectorAll('[data-slide-to]')];
    const slides = [...track.children];
    let positions = [];
    let settledTarget = null;
    let drag = null;
    let settleTimer;
    let updateFrame;

    const measure = () => {
      const snapshot = track.scrollLeft;
      // The first card starts at the shared page inset. Treat it as scroll zero.
      const origin = slides[0].getBoundingClientRect().left + snapshot;
      const max = Math.max(0, track.scrollWidth - track.clientWidth);
      positions = slides.map(slide => Math.max(0, Math.min(max, slide.getBoundingClientRect().left - origin + snapshot)));
    };

    const nearestSlide = scroll => positions.reduce((nearest, position, index) => {
      return Math.abs(position - scroll) < Math.abs(positions[nearest] - scroll) ? index : nearest;
    }, 0);

    const paintControls = () => {
      const current = settledTarget ?? track.scrollLeft;
      previous?.setAttribute('aria-disabled', String(current <= 2));
      next?.setAttribute('aria-disabled', String(current >= positions.at(-1) - 2));

      const activeSlide = nearestSlide(current);
      for (const indicator of indicators) {
        indicator.setAttribute('aria-current', String(Number(indicator.dataset.slideTo) === activeSlide));
      }
    };

    const updateControls = () => {
      if (updateFrame !== undefined) return;
      updateFrame = requestAnimationFrame(() => {
        updateFrame = undefined;
        paintControls();
      });
    };

    const clearTarget = () => {
      settledTarget = null;
      window.clearTimeout(settleTimer);
      updateControls();
    };

    const scrollTo = position => {
      settledTarget = position;
      track.scrollTo({ left: position, behavior: scrollBehavior() });
      window.clearTimeout(settleTimer);
      settleTimer = window.setTimeout(clearTarget, 480);
      updateControls();
    };

    const step = direction => {
      const current = settledTarget ?? track.scrollLeft;
      const destination = direction > 0
        ? positions.find(position => position > current + 2)
        : positions.findLast(position => position < current - 2);
      if (destination !== undefined) scrollTo(destination);
    };

    previous?.addEventListener('click', () => step(-1));
    next?.addEventListener('click', () => step(1));
    for (const indicator of indicators) {
      indicator.addEventListener('click', () => {
        const destination = positions[Number(indicator.dataset.slideTo)];
        if (destination !== undefined) scrollTo(destination);
      });
    }

    track.addEventListener('keydown', event => {
      if (event.target !== track) return;
      if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
        event.preventDefault();
        step(event.key === 'ArrowRight' ? 1 : -1);
      }
      if (event.key === 'Home' || event.key === 'End') {
        event.preventDefault();
        scrollTo(event.key === 'Home' ? positions[0] : positions.at(-1));
      }
    });

    track.addEventListener('scroll', updateControls, { passive: true });
    track.addEventListener('scrollend', () => {
      if (settledTarget === null || Math.abs(settledTarget - track.scrollLeft) < 4) clearTarget();
    }, { passive: true });
    track.addEventListener('wheel', clearTarget, { passive: true });

    track.addEventListener('pointerdown', event => {
      clearTarget();
      if (event.pointerType !== 'mouse' || event.button !== 0) return;
      const control = event.target.closest('a, button, input, select, textarea');
      if (control && !control.closest('.tech-story')) return;
      drag = { id: event.pointerId, start: event.clientX, left: track.scrollLeft };
    });

    track.addEventListener('pointermove', event => {
      if (drag?.id !== event.pointerId) return;
      if (!(event.buttons & 1)) {
        finishDrag(event);
        return;
      }
      const offset = event.clientX - drag.start;
      if (!track.hasAttribute('data-dragging')) {
        if (Math.abs(offset) < 8) return;
        track.setAttribute('data-dragging', '');
        track.setPointerCapture(event.pointerId);
        window.getSelection()?.removeAllRanges();
      }
      event.preventDefault();
      track.scrollLeft = drag.left - offset;
    });

    function finishDrag(event) {
      if (drag?.id !== event.pointerId) return;
      drag = null;
      if (!track.hasAttribute('data-dragging')) return;
      const target = positions[nearestSlide(track.scrollLeft)];
      track.removeAttribute('data-dragging');
      if (track.hasPointerCapture(event.pointerId)) track.releasePointerCapture(event.pointerId);
      scrollTo(target);
    }

    track.addEventListener('pointerup', finishDrag);
    track.addEventListener('pointercancel', finishDrag);
    track.addEventListener('lostpointercapture', finishDrag);
    track.addEventListener('pointerleave', event => {
      if (!track.hasAttribute('data-dragging')) finishDrag(event);
    });
    track.addEventListener('dragstart', event => {
      if (drag) event.preventDefault();
    });

    const resize = () => {
      measure();
      clearTarget();
    };
    if ('ResizeObserver' in window) new ResizeObserver(resize).observe(track);
    else window.addEventListener('resize', resize, { passive: true });

    measure();
    paintControls();
  };

  document.querySelectorAll('[data-carousel]').forEach(initializeCarousel);

  document.querySelectorAll('[data-faq-tabs]').forEach((group, groupIndex) => {
    const pairs = Array.from(group.querySelectorAll('[data-faq-tab]'))
      .map(button => ({ button, panel: document.getElementById(button.getAttribute('aria-controls')) }))
      .filter(({ panel }) => panel);
    if (!pairs.length) return;

    group.setAttribute('role', 'tablist');
    for (const [index, { button, panel }] of pairs.entries()) {
      button.id ||= `restore-faq-tab-${groupIndex + 1}-${index + 1}`;
      button.setAttribute('role', 'tab');
      panel.setAttribute('role', 'tabpanel');
      panel.setAttribute('aria-labelledby', button.id);
    }

    const select = current => {
      for (const { button, panel } of pairs) {
        const isSelected = button === current;
        button.setAttribute('aria-selected', String(isSelected));
        button.tabIndex = isSelected ? 0 : -1;
        panel.hidden = !isSelected;
      }
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
  let backdropPointerDown = false;

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

  const onBackdrop = event => {
    if (event.target !== downloadDialog) return false;
    const { left, top, right, bottom } = downloadDialog.getBoundingClientRect();
    return event.clientX < left || event.clientX > right || event.clientY < top || event.clientY > bottom;
  };

  downloadDialog.addEventListener('pointerdown', event => {
    backdropPointerDown = onBackdrop(event);
  });

  downloadDialog.addEventListener('click', event => {
    if (backdropPointerDown && onBackdrop(event)) downloadDialog.close();
    backdropPointerDown = false;
  });

  downloadDialog.addEventListener('close', () => {
    backdropPointerDown = false;
    downloadTrigger?.focus({ preventScroll: true });
  });
})();
