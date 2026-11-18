document.querySelectorAll('.ala-news-grid').forEach(rail => {
  const threshold = 7;
  let gesture = null;
  let suppressClick = false;

  rail.addEventListener('pointerdown', event => {
    suppressClick = false;
    if (event.pointerType !== 'mouse' || !event.isPrimary || event.button !== 0) return;
    if (rail.scrollWidth <= rail.clientWidth) return;

    gesture = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      startScroll: rail.scrollLeft,
      dragging: false
    };
  });

  rail.addEventListener('pointermove', event => {
    if (event.pointerId !== gesture?.pointerId) return;

    const distanceX = event.clientX - gesture.startX;
    const distanceY = event.clientY - gesture.startY;
    if (!gesture.dragging) {
      const horizontal = Math.abs(distanceX);
      const vertical = Math.abs(distanceY);
      if (vertical >= threshold && vertical > horizontal) {
        gesture = null;
        return;
      }
      if (horizontal < threshold) return;

      gesture.dragging = true;
      suppressClick = true;
      rail.classList.add('is-dragging');
      rail.setPointerCapture(event.pointerId);
    }

    event.preventDefault();
    rail.scrollLeft = gesture.startScroll - distanceX;
  });

  function endGesture(event) {
    if (event.pointerId !== gesture?.pointerId) return;
    const { dragging } = gesture;
    gesture = null;
    if (!dragging) return;

    const current = rail.scrollLeft;
    const limit = rail.scrollWidth - rail.clientWidth;
    const start = rail.firstElementChild.offsetLeft;
    let nearest = 0;
    for (const card of rail.children) {
      const target = Math.min(limit, card.offsetLeft - start);
      if (Math.abs(current - target) < Math.abs(current - nearest)) nearest = target;
    }

    rail.classList.remove('is-dragging');
    rail.scrollLeft = nearest;
  }

  rail.addEventListener('pointerup', endGesture);
  rail.addEventListener('pointercancel', endGesture);
  rail.addEventListener('lostpointercapture', endGesture);
  rail.addEventListener('pointerleave', event => {
    if (!gesture?.dragging) endGesture(event);
  });

  rail.addEventListener('dragstart', event => {
    if (gesture) event.preventDefault();
  });
  rail.addEventListener('click', event => {
    if (!suppressClick || event.detail === 0) return;
    suppressClick = false;
    event.preventDefault();
    event.stopPropagation();
  }, true);
});
