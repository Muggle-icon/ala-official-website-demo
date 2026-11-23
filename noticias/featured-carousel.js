(() => {
  const carousel = document.querySelector('#publicaciones');
  const stage = carousel?.querySelector('.press-carousel-stage');
  const controls = carousel?.querySelector('.press-carousel-controls');
  const slides = stage ? Array.from(stage.querySelectorAll('.press-lead')) : [];
  const dots = controls ? Array.from(controls.querySelectorAll('.press-carousel-dot')) : [];
  const pause = controls?.querySelector('.press-carousel-pause');
  const pauseIcon = pause?.querySelector('.press-carousel-pause-icon');
  const playIcon = pause?.querySelector('.press-carousel-play-icon');
  const status = carousel?.querySelector('.press-carousel-status');
  if (!stage || !controls || slides.length !== 3 || dots.length !== slides.length || !pause || !status) return;

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const INTERVAL = 7000;
  let current = 0;
  let timer = null;
  let pausedByUser = false;
  let pointerInside = false;
  let focusInside = false;

  function stopTimer() {
    if (timer !== null) window.clearTimeout(timer);
    timer = null;
  }

  function schedule() {
    stopTimer();
    if (pausedByUser || reducedMotion.matches || pointerInside || focusInside || document.hidden) return;
    timer = window.setTimeout(() => {
      show((current + 1) % slides.length, false);
      schedule();
    }, INTERVAL);
  }

  function show(index, announce) {
    current = index;
    slides.forEach((slide, i) => {
      const selected = i === index;
      slide.classList.toggle('is-active', selected);
      slide.setAttribute('aria-hidden', String(!selected));
      dots[i].setAttribute('aria-pressed', String(selected));
    });
    if (announce) {
      const title = slides[index].querySelector('h3')?.textContent.trim() || '';
      status.textContent = `Noticia ${index + 1} de ${slides.length}: ${title}`;
    }
  }

  function updatePauseButton() {
    pause.hidden = reducedMotion.matches;
    pause.setAttribute('aria-pressed', String(pausedByUser));
    pause.setAttribute('aria-label', pausedByUser ? 'Reanudar rotación automática' : 'Pausar rotación automática');
    if (pauseIcon) pauseIcon.hidden = pausedByUser;
    if (playIcon) playIcon.hidden = !pausedByUser;
  }

  stage.classList.add('is-ready');
  slides.forEach(slide => { slide.hidden = false; });
  show(0, false);
  controls.hidden = false;
  updatePauseButton();

  dots.forEach((dot, index) => dot.addEventListener('click', () => {
    show(index, true);
    schedule();
  }));
  pause.addEventListener('click', () => {
    pausedByUser = !pausedByUser;
    updatePauseButton();
    schedule();
  });
  carousel.addEventListener('pointerenter', event => {
    if (event.pointerType === 'mouse' || event.pointerType === 'pen') {
      pointerInside = true;
      schedule();
    }
  });
  carousel.addEventListener('pointerleave', event => {
    if (event.pointerType === 'mouse' || event.pointerType === 'pen') {
      pointerInside = false;
      schedule();
    }
  });
  carousel.addEventListener('focusin', () => { focusInside = true; schedule(); });
  carousel.addEventListener('focusout', event => {
    if (!carousel.contains(event.relatedTarget)) { focusInside = false; schedule(); }
  });
  document.addEventListener('visibilitychange', schedule);
  const onMotionChange = () => { updatePauseButton(); schedule(); };
  if (reducedMotion.addEventListener) reducedMotion.addEventListener('change', onMotionChange);
  else if (reducedMotion.addListener) reducedMotion.addListener(onMotionChange);
  schedule();
})();
