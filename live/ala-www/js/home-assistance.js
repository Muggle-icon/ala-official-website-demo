const assistanceDock = document.querySelector('.ala-assistance');
const assistanceActions = assistanceDock.querySelector('.ala-assistance-actions');
let openPanel = null;
let opener = null;

function closeAssistance(restoreFocus) {
  if (!openPanel) return;
  openPanel.hidden = true;
  opener.setAttribute('aria-expanded', 'false');
  if (restoreFocus) opener.focus();
  openPanel = null;
  opener = null;
}

assistanceActions.addEventListener('click', (event) => {
  const button = event.target.closest('button');
  if (!button) return;
  const panel = document.getElementById(button.getAttribute('aria-controls'));
  if (openPanel === panel) {
    closeAssistance(true);
    return;
  }
  closeAssistance(false);
  openPanel = panel;
  opener = button;
  panel.hidden = false;
  button.setAttribute('aria-expanded', 'true');
  panel.querySelector('[data-assistance-close]').focus();
});

assistanceDock.addEventListener('click', (event) => {
  if (event.target.closest('[data-assistance-close]')) closeAssistance(true);
});

assistanceDock.addEventListener('focusout', (event) => {
  if (event.relatedTarget && !assistanceDock.contains(event.relatedTarget)) {
    closeAssistance(false);
  }
});

document.addEventListener('click', (event) => {
  if (openPanel && !assistanceDock.contains(event.target)) {
    closeAssistance(openPanel.contains(document.activeElement));
  }
});

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && openPanel) {
    event.preventDefault();
    closeAssistance(true);
  }
});

const hero = document.querySelector('.ala-home-hero');
function placeDock() {
  const pastHero = hero.getBoundingClientRect().bottom <= 0;
  document.body.toggleAttribute('data-hero-passed', pastHero);
  if (!pastHero && window.matchMedia('(max-width: 600px)').matches) closeAssistance(false);
}

const dockObserver = new IntersectionObserver(placeDock);
dockObserver.observe(hero);
window.addEventListener('pageshow', placeDock);
