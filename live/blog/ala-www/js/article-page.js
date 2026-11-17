document.addEventListener('DOMContentLoaded', function() {
  // 目录功能
  initDirectory();

  // 分享功能
  initShare();
});

function initDirectory() {
  const content = document.querySelector('#richTextContent');
  const anchorDirectory = document.querySelector('#anchorDirectory');

  if (!content || !anchorDirectory) return;

  const headingTags = ["h1", "h2", "h3", "h4", "h5", "h6"];
  const headings = content.querySelectorAll(headingTags.join(','));

  if (!headings || headings.length === 0) {
    const indexName = document.querySelector('.index-name');
    if (indexName) {
      indexName.style.display = 'none';
    }
    return;
  }

  let index = 0;
  const items = [];
  const fragment = document.createDocumentFragment();

  Array.from(headings).forEach(function (heading) {
    const tagName = heading.tagName.toUpperCase();
    const text = heading.textContent.trim();
    if (!text) return;

    const id = tagName + "-" + index;
    if (!heading.id) {
      heading.id = id;
    }

    const li = document.createElement('li');
    li.className = 'ala-size ala-padding link-' + tagName;

    let displayText = text;
    if (tagName === 'H4') {
      const maxChars = 15;
      displayText = text.length > maxChars
        ? text.substring(0, maxChars) + '...'
        : text;
    }

    li.innerHTML = '<a href="#' + id + '" data-index="' + index + '" class="toc-link">' + displayText + '</a>';

    fragment.appendChild(li);
    items.push(li);
    index++;
  });

  anchorDirectory.appendChild(fragment);
  const directoryItems = anchorDirectory.querySelectorAll('li');

  let isClickScroll = false;
  let clickTimeout;

  anchorDirectory.addEventListener('click', function(e) {
    const link = e.target.closest('a.toc-link');
    if (!link) return;

    e.preventDefault();

    const targetId = link.getAttribute('href');
    const target = document.querySelector(targetId);
    if (!target) return;

    isClickScroll = true;
    clearTimeout(clickTimeout);

    clickTimeout = setTimeout(() => {
      isClickScroll = false;
    }, 800);

    target.scrollIntoView({
      behavior: 'smooth',
      block: 'start'
    });

    directoryItems.forEach(el => el.classList.remove('active'));
    link.parentElement.classList.add('active');
  });

  window.addEventListener('scroll', function() {
    if (isClickScroll) return;

    const scrollTop = window.scrollY;
    const viewportTop = scrollTop + 400;
    let currentActiveIndex = -1;

    Array.from(headings).forEach((heading, idx) => {
      if (heading.offsetTop <= viewportTop) {
        currentActiveIndex = idx;
      }
    });

    directoryItems.forEach(el => el.classList.remove('active'));
    if (currentActiveIndex !== -1 && directoryItems[currentActiveIndex]) {
      directoryItems[currentActiveIndex].classList.add('active');
    }
  });

  window.dispatchEvent(new Event('scroll'));
}

function initShare() {
  const articleUrl = window.location.href;
  const articleTitleElement = document.querySelector('.article-main-title');
  const articleTitle = articleTitleElement ? articleTitleElement.textContent : '';

  const shareImages = document.querySelectorAll('.img-share-wrap img');
  shareImages.forEach(img => {
    img.style.cursor = 'pointer';
    img.addEventListener('click', function(e) {
      e.preventDefault();
      const shareText = articleTitle + "\n" + articleUrl;
      fallbackCopyText(shareText);
    });

    const backBtn = document.querySelector('.article-back-btn');
    if (backBtn) {
      backBtn.addEventListener('click', function() {
        window.history.back();
      });
    }
  });
}

function fallbackCopyText(text) {
  const textarea = document.createElement('textarea');
  textarea.value = text;
  textarea.style.position = 'fixed';
  textarea.style.opacity = '0';
  textarea.style.pointerEvents = 'none';
  document.body.appendChild(textarea);
  textarea.focus();
  textarea.select();

  try {
    const successful = document.execCommand('copy');
    if (successful && typeof message === 'function') {
      message('Copiado', 3000);
    }
  } catch (err) {
    console.error('Error en fallback copy:', err);
  }

  document.body.removeChild(textarea);
}
