import { examples } from './archive-examples.js?v=33e4e03228';

const topics = new Map([
  ['all', 'Todas'],
  ['medios', 'En medios'],
  ['comunicados', 'Comunicados'],
  ['empresa', 'Empresa'],
  ['producto', 'Producto'],
  ['guias', 'Guías'],
]);
const pageSize = 6;
const formatDate = new Intl.DateTimeFormat('es-MX', {
  day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC',
});

const originals = [...document.querySelectorAll('[data-archive-topic]')].map(article => {
  const topic = article.dataset.archiveTopic;
  const image = article.querySelector('img');
  return {
    topic,
    date: article.querySelector('time').dateTime,
    title: article.querySelector('h3').textContent,
    source: article.querySelector('.press-meta span').textContent,
    summary: article.querySelector('.press-summary')?.textContent
      ?? (topic === 'comunicados' ? 'Comunicado de ALA distribuido por GetNews.' : ''),
    href: article.querySelector('a').href,
    image: { src: image.src, width: image.getAttribute('width'), height: image.getAttribute('height') },
  };
});
const publications = [...originals, ...examples].sort((a, b) => b.date.localeCompare(a.date));
const drafts = new Map(examples.map(article => [article.id, article]));

const ui = document.querySelector('#press-archive-ui');
const filters = document.querySelector('#press-archive-filters');
const form = document.querySelector('#press-archive-search');
const search = document.querySelector('#press-archive-query');
const resultList = document.querySelector('#press-archive-list');
const card = document.querySelector('#press-archive-card');
const count = document.querySelector('#press-archive-count');
const empty = document.querySelector('#press-archive-empty');
const more = document.querySelector('#press-archive-more');
const detail = document.querySelector('#press-detail');
const closeDetail = document.querySelector('#press-detail-close');

let activeTopic = 'all';
let query = '';
let limit = pageSize;
let displayedDraft = '';
let returnDraft = '';
let pendingFocus = '';

function normalize(text) {
  return text.toLocaleLowerCase('es-MX').normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

function setOptionalParam(url, name, value) {
  if (value) url.searchParams.set(name, value);
  else url.searchParams.delete(name);
}

function detailURL(id) {
  const url = new URL(location.href);
  setOptionalParam(url, 'articulo', id);
  url.hash = 'archivo';
  return url;
}

function createCard(publication) {
  const fragment = card.content.cloneNode(true);
  const topicLabel = topics.get(publication.topic);
  const tag = fragment.querySelector('[data-card-topic]');
  const label = fragment.querySelector('.press-demo-label');
  const date = fragment.querySelector('time');
  const summary = fragment.querySelector('.press-archive-summary');
  const link = fragment.querySelector('a');

  tag.textContent = publication.source ? topicLabel + ' · ' + publication.source : topicLabel;
  date.dateTime = publication.date;
  date.textContent = formatDate.format(new Date(publication.date));
  fragment.querySelector('h3').textContent = publication.title;
  summary.textContent = publication.summary;
  summary.hidden = !publication.summary;
  label.hidden = Boolean(publication.href);

  if (publication.href) {
    const photo = fragment.querySelector('.press-archive-image');
    const image = photo.querySelector('img');
    image.src = publication.image.src;
    image.width = publication.image.width;
    image.height = publication.image.height;
    photo.hidden = false;
    link.href = publication.href;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    link.textContent = publication.topic === 'comunicados' ? 'Leer original (en inglés) ↗' : 'Leer en ' + publication.source + ' ↗';
  } else {
    link.href = detailURL(publication.id);
    link.dataset.demoArticle = publication.id;
    link.textContent = 'Leer ejemplo';
  }
  link.setAttribute('aria-label', link.textContent + ' · ' + publication.title);
  return fragment;
}

function render() {
  const words = normalize(query).split(/\s+/).filter(Boolean);
  const matches = publications.filter(publication => {
    if (activeTopic !== 'all' && activeTopic !== publication.topic) return false;
    const text = normalize([publication.title, publication.summary, publication.source, topics.get(publication.topic)].join(' '));
    return words.every(word => text.includes(word));
  });
  const visible = matches.slice(0, limit);
  resultList.replaceChildren(...visible.map(createCard));
  count.textContent = matches.length ? 'Mostrando ' + visible.length + ' de ' + matches.length + ' publicaciones' : '0 publicaciones';
  empty.hidden = matches.length > 0;
  more.hidden = matches.length <= limit;
  for (const button of filters.children) {
    button.setAttribute('aria-pressed', String(button.dataset.topic === activeTopic));
  }
}

function applyFilters(topic, term) {
  activeTopic = topic;
  query = term;
  limit = pageSize;
  const url = detailURL(null);
  setOptionalParam(url, 'tema', topic === 'all' ? '' : topic);
  setOptionalParam(url, 'q', term);
  history.replaceState(history.state, '', url);
  render();
}

function showDetail(publication) {
  displayedDraft = publication.id;
  detail.querySelector('#press-detail-meta').textContent =
    topics.get(publication.topic) + ' · Fecha de ejemplo: ' + formatDate.format(new Date(publication.date));
  detail.querySelector('#press-detail-title').textContent = publication.title;
  detail.querySelector('#press-detail-summary').textContent = publication.summary;
  const paragraphs = publication.body.map(text => {
    const paragraph = document.createElement('p');
    paragraph.textContent = text;
    return paragraph;
  });
  detail.querySelector('#press-detail-body').replaceChildren(...paragraphs);
  if (!detail.open) detail.showModal();
  detail.scrollTop = 0;
  requestAnimationFrame(() => {
    if (detail.open) closeDetail.focus({ preventScroll: true });
  });
}

function restoreArchiveFocus(id) {
  if (!id) return;
  requestAnimationFrame(() => {
    const link = [...resultList.querySelectorAll('[data-demo-article]')].find(item => item.dataset.demoArticle === id);
    (link ?? document.querySelector('#archivo')).focus({ preventScroll: true });
  });
}

function syncURL() {
  const url = new URL(location.href);
  const param = url.searchParams.get('tema');
  const topic = topics.has(param) ? param : url.hash === '#comunicados' ? 'comunicados' : 'all';
  const term = (url.searchParams.get('q') ?? '').trim().slice(0, 100);
  if (topic !== activeTopic || term !== query) {
    activeTopic = topic;
    query = term;
    search.value = term;
    limit = pageSize;
    render();
  }

  const draft = drafts.get(url.searchParams.get('articulo'));
  if (draft && draft.id !== displayedDraft) showDetail(draft);
  else if (!draft && detail.open) detail.close();

  if (pendingFocus && !detail.open) {
    restoreArchiveFocus(pendingFocus);
    pendingFocus = '';
  }
}

for (const [slug, title] of topics) {
  const button = document.createElement('button');
  button.type = 'button';
  button.dataset.topic = slug;
  button.textContent = title;
  filters.append(button);
}
filters.addEventListener('click', event => {
  const button = event.target.closest('button[data-topic]');
  if (button) applyFilters(button.dataset.topic, query);
});
form.addEventListener('submit', event => event.preventDefault());
search.addEventListener('input', () => applyFilters(activeTopic, search.value.trim()));
document.querySelector('#press-archive-reset').addEventListener('click', () => {
  search.value = '';
  applyFilters('all', '');
  search.focus();
});
more.addEventListener('click', () => {
  const firstNew = resultList.children.length;
  limit += pageSize;
  render();
  resultList.children[firstNew]?.querySelector('a').focus();
});

resultList.addEventListener('click', event => {
  const link = event.target.closest('a[data-demo-article]');
  if (!link || event.button !== 0 || event.metaKey || event.ctrlKey || event.altKey || event.shiftKey) return;
  const draft = drafts.get(link.dataset.demoArticle);
  if (!draft) return;
  event.preventDefault();
  returnDraft = draft.id;
  history.pushState({ ...history.state, alaPressDetail: true }, '', link.href);
  showDetail(draft);
});
closeDetail.addEventListener('click', () => detail.close());
detail.addEventListener('close', () => {
  const url = new URL(location.href);
  const shouldRemoveDraft = url.searchParams.get('articulo') === displayedDraft;
  if (shouldRemoveDraft && history.state?.alaPressDetail) {
    pendingFocus = returnDraft;
    history.back();
  } else {
    if (shouldRemoveDraft) history.replaceState(history.state, '', detailURL(null));
    restoreArchiveFocus(returnDraft);
  }
  displayedDraft = '';
  returnDraft = '';
});
window.addEventListener('popstate', syncURL);
window.addEventListener('hashchange', syncURL);

render();
ui.hidden = false;
document.querySelector('#press-archive-fallback').hidden = true;
syncURL();
