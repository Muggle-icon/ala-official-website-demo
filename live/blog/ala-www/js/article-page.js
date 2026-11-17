function initArticleOutline() {
  const outline = document.querySelector('.ala-article-outline');
  if (!outline) return;

  const headings = document.querySelectorAll('#richTextContent :is(h1, h2, h3, h4, h5, h6)');
  const items = [];
  headings.forEach(heading => {
    const text = heading.textContent.trim();
    if (!text) return;

    if (!heading.id) {
      const base = heading.tagName + '-' + items.length;
      let id = base;
      let suffix = 2;
      while (document.getElementById(id)) id = base + '-' + suffix++;
      heading.id = id;
    }

    const item = document.createElement('li');
    if (Number(heading.tagName.slice(1)) > 2) item.className = 'toc-subentry';

    const link = document.createElement('a');
    link.textContent = text;
    link.href = '#' + encodeURIComponent(heading.id);
    item.append(link);
    items.push(item);
  });

  if (items.length) {
    outline.querySelector('ol').replaceChildren(...items);
    outline.hidden = false;
  }
}

function fallbackCopyArticleText(text) {
  const field = document.createElement('textarea');
  field.value = text;
  field.setAttribute('readonly', '');
  field.style.position = 'fixed';
  field.style.opacity = '0';
  document.body.append(field);
  field.select();
  try {
    return document.execCommand('copy');
  } catch {
    return false;
  } finally {
    field.remove();
  }
}

function initArticleShare() {
  const share = document.querySelector('.ala-article-share');
  if (!share) return;
  const button = share.querySelector('button');
  const status = share.querySelector('[role="status"]');

  share.hidden = false;
  button.addEventListener('click', async () => {
    const url = new URL(window.location.href);
    url.hash = '';
    status.textContent = '';
    let copied = false;

    if (navigator.clipboard?.writeText) {
      try {
        await navigator.clipboard.writeText(url.href);
        copied = true;
      } catch {
        copied = fallbackCopyArticleText(url.href);
      }
    } else {
      copied = fallbackCopyArticleText(url.href);
    }

    status.textContent = copied ? 'Enlace copiado' : 'No se pudo copiar el enlace';
    button.focus({ preventScroll: true });
  });
}

async function initArticleRecommendations() {
  const related = document.getElementById('articleRecommendations');
  const articleId = related?.dataset.articleId;
  if (!articleId) return;

  const { channelId, parentChannel } = related.dataset;
  const cards = new Map();
  const count = 6;

  async function addArticles(filters) {
    const { data } = await blogRequest('/article/page', {
      params: { pageSize: count + 1, ...filters }
    });
    for (const article of data.content) {
      if (article.id !== articleId) cards.set(article.id, article);
    }
  }

  try {
    await addArticles({ channelId });
    if (cards.size < count && parentChannel) await addArticles({ channel: parentChannel });
    if (cards.size < count) await addArticles({});
  } catch {
    // The article and its category link remain available if the catalog fails to load.
  }

  if (!cards.size) return;
  const list = related.querySelector('.ala-editorial-grid');
  list.replaceChildren(...Array.from(cards.values()).slice(0, count).map(article => makeEditorialCard(article, 'h3')));
  list.hidden = false;
  related.querySelector('.ala-editorial-heading').hidden = false;
}

document.addEventListener('DOMContentLoaded', () => {
  initArticleOutline();
  initArticleShare();
  initArticleRecommendations();
});
