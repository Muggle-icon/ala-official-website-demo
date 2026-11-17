const editorialCoverNames = {
  'como-elegir-un-prestamo-personal-en-mexico-segun-tu-capacidad-de-pago': 'budget',
  'que-hacer-ante-la-presunta-suplantacion-de-ala-o-dudas-sobre-el-proceso-de-cobranza': 'impersonation',
  'que-pasa-si-tengo-un-atraso-en-mi-prestamo-ala': 'late-payment',
  'como-identificar-prestamos-en-linea-seguros-en-mexico-guia-para-evitar-fraudes-y-elegir-con-confianza': 'safe-loan',
  'solicitar-un-prestamo-3-errores-que-debes-evitar': 'application-checklist',
  'como-funciona-el-proceso-de-control-de-riesgos-en-creditos-en-linea-y-por-que-recopilamos-sus-datos': 'data-privacy',
};

function makeEditorialCard(article, heading = 'h2') {
  const item = document.createElement('li');
  item.className = 'ala-editorial-card';

  const link = document.createElement('a');
  link.className = 'ala-editorial-link';
  link.href = article.url;
  link.setAttribute('aria-label', article.title);

  const media = document.createElement('div');
  media.className = 'ala-editorial-media';
  const cover = editorialCover(article);
  if (cover) {
    const image = document.createElement('img');
    image.src = cover;
    image.alt = '';
    image.loading = 'lazy';
    image.decoding = 'async';
    media.append(image);
  }

  const copy = document.createElement('div');
  copy.className = 'ala-editorial-copy';

  const category = document.createElement('p');
  category.className = 'ala-editorial-category';
  category.textContent = article.channel.name;

  const title = document.createElement(heading);
  title.className = 'ala-editorial-title';
  title.textContent = article.title;
  copy.append(category, title);

  const summary = article.seoDescription || article.description;
  if (summary) {
    const description = document.createElement('p');
    description.className = 'ala-editorial-description';
    description.textContent = summary;
    copy.append(description);
  }

  if (article.modified) {
    const time = document.createElement('time');
    const date = article.modified.slice(0, 10);
    time.className = 'ala-editorial-date';
    time.dateTime = date;
    time.textContent = date.split('-').reverse().join('/');
    copy.append(time);
  }

  link.append(media, copy);
  item.append(link);
  return item;
}

function editorialCover(article) {
  const slug = new URL(article.url).pathname.split('/').filter(Boolean).pop();
  const name = editorialCoverNames[slug];
  return name
    ? new URL('public/assets/editorial/' + name + '.webp', blogRoot).href
    : article.compressedImage || article.image;
}

document.addEventListener('DOMContentLoaded', async () => {
  const related = document.getElementById('articleRecommendations');
  if (!related) return;

  const list = related.querySelector('.ala-editorial-grid');
  const { currentArticle, relatedChannel } = related.dataset;
  try {
    const { data } = await blogRequest('/article/page', {
      params: { pageSize: 10, channelId: relatedChannel }
    });
    const articles = data.content.filter(article => article.id !== currentArticle).slice(0, 6);
    if (!articles.length) return;
    list.replaceChildren(...articles.map(article => makeEditorialCard(article, 'h3')));
    related.hidden = false;
  } catch {
    // Keep the reading experience available if the recommendations cannot load.
  }
});
