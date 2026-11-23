(() => {
  const carousel = document.querySelector('#publicaciones');
  const stage = carousel?.querySelector('.press-carousel-stage');
  const controls = carousel?.querySelector('.press-carousel-controls');
  const slides = stage ? Array.from(stage.querySelectorAll('.press-lead')) : [];
  const dots = controls ? Array.from(controls.querySelectorAll('.press-carousel-dot')) : [];
  const progress = controls ? Array.from(controls.querySelectorAll('.press-carousel-progress')) : [];
  const feature = carousel?.querySelector('.press-feature');
  const status = carousel?.querySelector('.press-carousel-status');
  if (!stage || !controls || !feature || slides.length !== 3 || dots.length !== slides.length || progress.length !== slides.length || !status) return;

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const INTERVAL = 7000;
  let current = 0;
  let frame = null;
  let lastFrame = null;
  let elapsed = 0;
  let pointerInside = false;
  let focusInside = false;

  function stopTimer() {
    if (frame !== null) window.cancelAnimationFrame(frame);
    frame = null;
    if (lastFrame !== null) elapsed = Math.min(INTERVAL, elapsed + Math.max(0, performance.now() - lastFrame));
    lastFrame = null;
  }

  function schedule() {
    stopTimer();
    if (reducedMotion.matches || pointerInside || focusInside || document.hidden) return;
    lastFrame = performance.now();
    frame = window.requestAnimationFrame(tick);
  }

  function tick(now) {
    elapsed += Math.max(0, now - lastFrame);
    lastFrame = now;
    if (elapsed >= INTERVAL) {
      elapsed = 0;
      show((current + 1) % slides.length, false);
    }
    updateProgress();
    frame = window.requestAnimationFrame(tick);
  }

  function updateProgress() {
    progress.forEach((bar, index) => {
      const amount = index === current ? Math.min(1, elapsed / INTERVAL) : 0;
      bar.style.transform = `scaleX(${amount})`;
    });
  }

  function positionControls() {
    // Every slide shares the same image box. Measure an inactive slide so the
    // control stays anchored while the active slide is moving into position.
    const reference = slides.find((slide, index) => index !== current) || slides[current];
    const photo = reference.querySelector('.press-photo');
    if (!photo) return;
    const imageBox = photo.getBoundingClientRect();
    const featureBox = feature.getBoundingClientRect();
    if (!imageBox.width || !imageBox.height) return;
    controls.style.left = `${imageBox.left - featureBox.left + 16}px`;
    controls.style.top = `${imageBox.bottom - featureBox.top - 44}px`;
    controls.classList.add('is-positioned');
  }

  function show(index, announce) {
    const previous = current;
    current = index;
    slides.forEach((slide, i) => {
      const selected = i === index;
      slide.classList.toggle('is-active', selected);
      slide.setAttribute('aria-hidden', String(!selected));
      dots[i].setAttribute('aria-pressed', String(selected));
    });
    if (previous !== index) stage.classList.add('has-cycled');
    updateProgress();
    positionControls();
    if (announce) {
      const title = slides[index].querySelector('h3')?.textContent.trim() || '';
      status.textContent = `Noticia ${index + 1} de ${slides.length}: ${title}`;
    }
  }

  stage.classList.add('is-ready');
  slides.forEach(slide => { slide.hidden = false; });
  show(0, false);
  controls.hidden = false;
  dots.forEach((dot, index) => dot.addEventListener('click', () => {
    stopTimer();
    elapsed = 0;
    show(index, true);
    schedule();
  }));
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
  carousel.addEventListener('focusin', event => {
    focusInside = event.target.matches(':focus-visible');
    schedule();
  });
  carousel.addEventListener('focusout', event => {
    if (!carousel.contains(event.relatedTarget)) { focusInside = false; schedule(); }
  });
  document.addEventListener('visibilitychange', schedule);
  window.addEventListener('resize', positionControls);
  if ('ResizeObserver' in window) {
    const observer = new ResizeObserver(positionControls);
    observer.observe(stage);
    slides.forEach(slide => observer.observe(slide.querySelector('.press-photo')));
  }
  if (document.fonts?.ready) document.fonts.ready.then(positionControls);
  const onMotionChange = () => { schedule(); };
  if (reducedMotion.addEventListener) reducedMotion.addEventListener('change', onMotionChange);
  else if (reducedMotion.addListener) reducedMotion.addListener(onMotionChange);
  schedule();
})();
