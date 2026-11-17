const categoryTabs = [...document.querySelectorAll('.ayuda-tab')];

function selectCategory(tab) {
  for (const category of categoryTabs) {
    const selected = category === tab;
    category.setAttribute('aria-selected', String(selected));
    category.tabIndex = selected ? 0 : -1;
    document.getElementById(category.getAttribute('aria-controls')).hidden = !selected;
  }
}

for (const [index, tab] of categoryTabs.entries()) {
  tab.addEventListener('click', () => selectCategory(tab));
  tab.addEventListener('keydown', event => {
    const total = categoryTabs.length;
    const targets = {ArrowLeft: (index + total - 1) % total, ArrowRight: (index + 1) % total, Home: 0, End: total - 1};
    if (!Object.hasOwn(targets, event.key)) return;
    event.preventDefault();
    const next = categoryTabs[targets[event.key]];
    selectCategory(next);
    next.focus();
  });
}

for (const trigger of document.querySelectorAll('.footer-dropdown-trigger')) {
  trigger.addEventListener('click', () => {
    const expanded = trigger.closest('.footer-dropdown').classList.toggle('is-open');
    trigger.setAttribute('aria-expanded', String(expanded));
  });
}

const chat = document.querySelector('.chat-btn');
const help = document.querySelector('#helpFloat');

if (chat && help) {
  function toggleHelp(open) {
    help.classList.toggle('open', open);
    chat.setAttribute('aria-expanded', String(open));
    (open ? help.querySelector('#helpFloatClose') : chat).focus();
  }

  chat.addEventListener('click', () => toggleHelp(!help.classList.contains('open')));
  help.querySelector('#helpFloatClose').addEventListener('click', () => toggleHelp(false));
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && help.classList.contains('open')) toggleHelp(false);
  });
}
