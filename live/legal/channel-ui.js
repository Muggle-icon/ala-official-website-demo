(() => {
  const supportDialog = document.getElementById('helpFloat');
  const closeButton = document.getElementById('helpFloatClose');
  const downloadDock = document.getElementById('mobile-entry');
  const supportTriggers = document.querySelectorAll('.chat-btn, #helpFloatTrigger');
  let supportOpener;

  function setSupportDialog(open) {
    if (!supportDialog) return;
    supportDialog.classList.toggle('open', open);
    supportDialog.setAttribute('aria-hidden', String(!open));
    if (open) closeButton?.focus();
    else supportOpener?.focus();
  }

  function activateOnKeyboard(event) {
    if (event.key !== 'Enter' && event.key !== ' ') return;
    event.preventDefault();
    event.currentTarget.click();
  }

  if (supportDialog) {
    supportDialog.setAttribute('aria-hidden', 'true');
    const card = supportDialog.querySelector('.help-float-card');
    card.setAttribute('role', 'dialog');
    card.setAttribute('aria-label', 'Centro de ayuda');

    for (const trigger of supportTriggers) {
      trigger.style.cursor = 'pointer';
      trigger.tabIndex = 0;
      trigger.setAttribute('role', 'button');
      trigger.setAttribute('aria-haspopup', 'dialog');
      trigger.setAttribute('aria-controls', 'helpFloat');
      trigger.addEventListener('click', () => {
        supportOpener = trigger;
        const dockHeight = downloadDock?.getBoundingClientRect().height ?? 0;
        card.style.marginBottom = dockHeight ? dockHeight + 'px' : '';
        setSupportDialog(true);
      });
      trigger.addEventListener('keydown', activateOnKeyboard);
    }

    closeButton?.addEventListener('click', () => setSupportDialog(false));
    supportDialog.addEventListener('click', event => {
      if (event.target === supportDialog) setSupportDialog(false);
    });
    document.addEventListener('keydown', event => {
      if (event.key === 'Escape' && supportDialog.classList.contains('open')) setSupportDialog(false);
    });
  }

  const appUrls = {
    '.android-down, .m-android-button': 'https://sofom-ala.onelink.me/uTdM/taq3lvd3',
    '.apple-down, .m-apple-button': 'https://sofom-ala.onelink.me/ndX5/mbzy0s0s'
  };
  for (const [selector, url] of Object.entries(appUrls)) {
    for (const action of document.querySelectorAll(selector)) {
      if (action.tagName === 'A') continue;
      action.removeAttribute('onclick');
      action.setAttribute('role', 'link');
      action.tabIndex = 0;
      action.style.cursor = 'pointer';
      action.addEventListener('click', () => window.open(url, '_blank', 'noopener'));
      action.addEventListener('keydown', activateOnKeyboard);
    }
  }

  if (downloadDock) {
    const topDownload = document.querySelector('.google-btn-phone');
    const compactViewport = matchMedia('(max-width: 991px)');
    function updateDock() {
      const headerHeight = document.querySelector('.ala-site-chrome')?.offsetHeight ?? 60;
      const revealPoint = topDownload
        ? topDownload.getBoundingClientRect().bottom < headerHeight
        : window.scrollY >= 320;
      downloadDock.hidden = !compactViewport.matches || !revealPoint;
    }
    updateDock();
    addEventListener('scroll', updateDock, { passive: true });
    addEventListener('resize', updateDock);
  }

  const questions = document.querySelectorAll('.faq-question[onclick]');
  if (questions.length) {
    function reflectFaqState() {
      for (const question of questions) {
        question.setAttribute('aria-expanded', String(question.closest('.faq-item').classList.contains('active')));
      }
    }

    questions.forEach((question, index) => {
      const answer = question.closest('.faq-item').querySelector('.faq-answer');
      answer.id = `ala-about-answer-${index + 1}`;
      question.setAttribute('role', 'button');
      question.setAttribute('aria-controls', answer.id);
      question.tabIndex = 0;
      question.addEventListener('keydown', activateOnKeyboard);
      question.addEventListener('click', reflectFaqState);
    });
    reflectFaqState();
  }

  const legalFrame = document.querySelector('.ala-legal-document iframe');
  if (legalFrame) {
    function fitDocument() {
      const body = legalFrame.contentDocument?.body;
      if (!body) return;
      const style = legalFrame.contentWindow.getComputedStyle(body);
      const margins = parseFloat(style.marginTop) + parseFloat(style.marginBottom);
      legalFrame.style.height = Math.ceil(body.scrollHeight + margins) + 'px';
    }
    legalFrame.addEventListener('load', fitDocument);
    addEventListener('resize', fitDocument);
    if (legalFrame.contentDocument?.readyState === 'complete') fitDocument();
  }
})();
