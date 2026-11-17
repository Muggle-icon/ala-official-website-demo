document.addEventListener('DOMContentLoaded', () => {
  const list = document.getElementById('blogList');
  const topic = document.getElementById('blogTopic');
  const status = document.getElementById('blogStatus');
  const more = document.getElementById('loadMoreArticles');
  const moreLabel = more.querySelector('[data-more-label]');
  const pageSize = 9;

  let page = 0;
  let requestId = 0;

  async function loadPage(nextPage) {
    const request = ++requestId;
    const tag = topic.value;
    const params = {
      page: nextPage,
      pageSize,
      channel: 'loan_blog,loan_guide,loan_financiero,financial_news,loan_city'
    };
    if (tag !== 'Todo') params.tagId = tag;

    list.setAttribute('aria-busy', 'true');
    more.disabled = true;
    status.hidden = true;

    try {
      const { data } = await blogRequest('/article/page', { params });
      if (request !== requestId) return;

      const cards = data.content.map(article => makeEditorialCard(article));
      if (nextPage === 1) list.replaceChildren();
      list.append(...cards);
      page = nextPage;

      more.hidden = data.last;
      moreLabel.textContent = 'Cargar más artículos';

      if (!list.childElementCount) {
        status.textContent = 'No hay artículos para este tema.';
        status.hidden = false;
      }
    } catch {
      if (request !== requestId) return;

      status.textContent = 'No se pudieron cargar los artículos.';
      status.hidden = false;
      more.hidden = false;
      moreLabel.textContent = 'Volver a intentar';
    } finally {
      if (request === requestId) {
        list.setAttribute('aria-busy', 'false');
        more.disabled = false;
      }
    }
  }

  topic.addEventListener('change', () => {
    page = 0;
    list.replaceChildren();
    loadPage(1);
  });

  more.addEventListener('click', () => loadPage(page + 1));

  loadPage(1);
});
