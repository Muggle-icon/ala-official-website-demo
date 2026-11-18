const footerHover = matchMedia('(hover: hover) and (min-width: 1025px)');

document.querySelectorAll('#footer .footer-dropdown').forEach(disclosure => {
  let openedWithPointer = false;

  disclosure.addEventListener('pointerenter', () => {
    if (!footerHover.matches || disclosure.open) return;

    disclosure.open = true;
    openedWithPointer = true;
  });

  disclosure.addEventListener('pointerleave', () => {
    if (openedWithPointer && !disclosure.contains(document.activeElement)) {
      disclosure.open = false;
    }
    openedWithPointer = false;
  });
});
