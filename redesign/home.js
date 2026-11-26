const toggle = document.querySelector('.menu-toggle');
const mobileNav = document.querySelector('#mobile-nav');
const companyMenu = document.querySelector('.nav-disclosure');
const downloadDialog = document.querySelector('#download-dialog');
let lastDownloadTrigger;

function closeMenu(returnFocus = false) {
  mobileNav.hidden = true;
  toggle.setAttribute('aria-expanded', 'false');
  toggle.setAttribute('aria-label', 'Abrir menú');
  if (returnFocus) toggle.focus();
}
toggle.addEventListener('click', () => {
  const open = toggle.getAttribute('aria-expanded') === 'true';
  mobileNav.hidden = open;
  toggle.setAttribute('aria-expanded', String(!open));
  toggle.setAttribute('aria-label', open ? 'Abrir menú' : 'Cerrar menú');
});
mobileNav.addEventListener('click', event => { if (event.target.closest('a')) closeMenu(); });
document.addEventListener('keydown', event => {
  if (event.key !== 'Escape') return;
  if (!mobileNav.hidden) closeMenu(true);
  if (companyMenu.open) { companyMenu.open = false; companyMenu.querySelector('summary').focus(); }
});
document.addEventListener('click', event => {
  if (!companyMenu.contains(event.target)) companyMenu.open = false;
  if (!event.target.closest('.site-header')) closeMenu();
});
window.matchMedia('(min-width: 1051px)').addEventListener('change', event => { if (event.matches) closeMenu(); });

document.querySelectorAll('[data-download]').forEach(link => link.addEventListener('click', event => {
  if (typeof downloadDialog.showModal !== 'function') return;
  event.preventDefault();
  lastDownloadTrigger = link;
  closeMenu();
  downloadDialog.showModal();
}));
downloadDialog.querySelector('.dialog-close').addEventListener('click', () => downloadDialog.close());
downloadDialog.addEventListener('click', event => {
  const bounds = downloadDialog.getBoundingClientRect();
  if (event.target === downloadDialog && (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom)) downloadDialog.close();
});
downloadDialog.addEventListener('close', () => lastDownloadTrigger?.focus());
