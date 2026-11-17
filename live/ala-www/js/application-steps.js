document.querySelectorAll('.application-steps').forEach(section => {
  const list = section.querySelector('.application-steps__list');
  const cards = Array.from(list.children);
  const controls = section.querySelector('.application-steps__controls');
  const status = controls.querySelector('.application-steps__status');
  const previous = controls.querySelector('[data-step-previous]');
  const next = controls.querySelector('[data-step-next]');
  const motion = matchMedia('(prefers-reduced-motion: reduce)');

  function view() {
    const stride = cards[1].offsetLeft - cards[0].offsetLeft;
    const visible = Math.round(list.clientWidth / stride);
    const last = cards.length - visible;
    const first = Math.min(last, Math.round(list.scrollLeft / stride));
    return { first, last, visible, stride };
  }

  function updateControls() {
    const { first, last, visible } = view();
    const range = visible > 1 ? `${first + 1}–${first + visible}` : `${first + 1}`;
    const label = `${range} de ${cards.length}`;
    previous.setAttribute('aria-disabled', String(first === 0));
    next.setAttribute('aria-disabled', String(first === last));
    if (status.textContent !== label) status.textContent = label;
  }

  function move(direction) {
    const { first, last, stride } = view();
    const target = Math.max(0, Math.min(first + direction, last));
    if (target === first) return;
    list.scrollTo({ left: target * stride, behavior: motion.matches ? 'auto' : 'smooth' });
  }

  previous.addEventListener('click', () => move(-1));
  next.addEventListener('click', () => move(1));
  list.addEventListener('keydown', event => {
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
    event.preventDefault();
    move(event.key === 'ArrowLeft' ? -1 : 1);
  });
  list.addEventListener('scroll', updateControls, { passive: true });
  new ResizeObserver(updateControls).observe(list);
  updateControls();
  controls.hidden = false;
});
