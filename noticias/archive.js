import { examples } from './archive-examples.js?v=bf9c400307';

const archive = document.querySelector('#archivo');
const form = document.querySelector('#press-archive-search');
const search = document.querySelector('#press-archive-query');
const filters = [...document.querySelectorAll('[data-press-topic]')];
const resultList = document.querySelector('#press-archive-list');
const cardTemplate = document.querySelector('#press-archive-card');
const count = document.querySelector('#press-archive-count');
const empty = document.querySelector('#press-archive-empty');
const paging = document.querySelector('#press-archive-paging');
const previous = document.querySelector('#press-page-prev');
const next = document.querySelector('#press-page-next');
const pageIndex = document.querySelector('#press-page-index');
const topics = new Map(filters.map(button => [button.dataset.pressTopic, button.textContent]));
const pageSize = 6;
const dateFormat = new Intl.DateTimeFormat('es-MX', {
  day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC',
});

const originals = [...document.querySelectorAll('[data-archive-topic]')].map(article => ({
  topic: article.dataset.archiveTopic,
  date: article.querySelector('time').dateTime,
  title: article.querySelector('h3').textContent,
  source: article.querySelector('.press-meta span').textContent,
  summary: article.querySelector('.press-summary')?.textContent ?? 'Comunicado de ALA distribuido por GetNews.',
  href: article.querySelector('a').href,
  image: article.querySelector('img').getAttribute('src'),
}));
const publications = [...originals, ...examples].sort((a, b) => b.date.localeCompare(a.date));
const slugPrefix = 'nota-';

function normalize(text) {
  return text.toLocaleLowerCase('es-MX').normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

function readState() {
  const url = new URL(location.href);
  const topic = url.searchParams.get('tema');
  const rawPage = url.searchParams.get('pagina') ?? '';
  return {
    topic: topics.has(topic) ? topic : 'all',
    term: (url.searchParams.get('q') ?? '').trim().slice(0, 100),
    page: /^\d+$/.test(rawPage) ? Math.max(1, Number(rawPage)) : 1,
  };
}

function keepListContext(url, { topic, term, page }) {
  if (topic !== 'all') url.searchParams.set('tema', topic);
  if (term) url.searchParams.set('q', term);
  if (page > 1) url.searchParams.set('pagina', String(page));
  return url;
}

function archiveURL(state) {
  const url = new URL(location.href);
  for (const param of ['tema', 'q', 'pagina', 'articulo']) url.searchParams.delete(param);
  url.hash = 'archivo';
  return keepListContext(url, state);
}

function articleURL(id, state) {
  const url = new URL('./nota/', location.href);
  url.searchParams.set('id', id);
  return keepListContext(url, state);
}

function matchesFor({ topic, term }) {
  const words = normalize(term).split(/\s+/).filter(Boolean);
  return publications.filter(publication => {
    if (topic !== 'all' && topic !== publication.topic) return false;
    const text = normalize([publication.title, publication.summary, publication.source, topics.get(publication.topic)].join(' '));
    return words.every(word => text.includes(word));
  });
}

function createCard(publication, state) {
  const fragment = cardTemplate.content.cloneNode(true);
  const label = fragment.querySelector('[data-card-topic]');
  const date = fragment.querySelector('time');
  const link = fragment.querySelector('a');
  const photo = fragment.querySelector('.press-photo');

  label.textContent = publication.source ?? topics.get(publication.topic);
  date.dateTime = publication.date;
  date.textContent = dateFormat.format(new Date(publication.date));
  fragment.querySelector('h3').textContent = publication.title;
  fragment.querySelector('.press-archive-summary').textContent = publication.summary;

  if (publication.href) {
    link.href = publication.href;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    if (publication.topic === 'comunicados') {
      const source = fragment.querySelector('.press-archive-source');
      source.textContent = 'Publicación original en inglés';
      source.hidden = false;
    }
  } else {
    fragment.querySelector('li').id = slugPrefix + publication.id;
    fragment.querySelector('.press-demo-label').hidden = false;
    link.href = articleURL(publication.id, state);
    link.dataset.demoArticle = publication.id;
  }

  if (publication.image) {
    photo.querySelector('img').src = publication.href
      ? publication.image
      : '../public/assets/news/' + publication.image;
    photo.hidden = false;
  }
  return fragment;
}

function updatePageLink(link, state, page, enabled) {
  if (enabled) {
    link.href = archiveURL({ ...state, page });
    link.removeAttribute('aria-disabled');
  } else {
    link.removeAttribute('href');
    link.setAttribute('aria-disabled', 'true');
  }
}

function anchorArticle() {
  const hash = location.hash.slice(1);
  return hash.startsWith(slugPrefix) ? hash.slice(slugPrefix.length) : '';
}

function render(state, anchorId = '') {
  const matches = matchesFor(state);
  const anchorIndex = anchorId ? matches.findIndex(item => item.id === anchorId) : -1;
  const totalPages = Math.max(1, Math.ceil(matches.length / pageSize));
  const page = anchorIndex < 0 ? Math.min(state.page, totalPages) : Math.floor(anchorIndex / pageSize) + 1;
  const start = (page - 1) * pageSize;
  const visible = matches.slice(start, start + pageSize);

  resultList.replaceChildren(...visible.map(publication => createCard(publication, { ...state, page })));
  count.textContent = matches.length
    ? 'Mostrando ' + (start + 1) + '–' + (start + visible.length) + ' de ' + matches.length + ' publicaciones'
    : '0 publicaciones';
  empty.hidden = matches.length > 0;
  paging.hidden = totalPages <= 1;
  pageIndex.textContent = 'Página ' + page + ' de ' + totalPages;
  updatePageLink(previous, state, page - 1, page > 1);
  updatePageLink(next, state, page + 1, page < totalPages);
  for (const button of filters) {
    button.setAttribute('aria-pressed', String(button.dataset.pressTopic === state.topic));
  }
}

function applyFilters(topic, term, replace = false) {
  const state = { topic, term, page: 1 };
  const url = archiveURL(state);
  if (url.href !== location.href) {
    history[replace ? 'replaceState' : 'pushState'](history.state, '', url);
  }
  render(state);
}

function restoreList() {
  const state = readState();
  search.value = state.term;
  const anchorId = anchorArticle();
  render(state, anchorId);

  // The list row only exists after the archive renders.
  if (anchorId) {
    const item = document.getElementById(slugPrefix + anchorId);
    if (!item) {
      const url = new URL(location.href);
      url.hash = 'archivo';
      history.replaceState(history.state, '', url);
    }
    requestAnimationFrame(() => {
      (item ?? archive).scrollIntoView({ block: 'start' });
      (item?.querySelector('a') ?? archive).focus({ preventScroll: true });
    });
  }
}

function setupArchive() {
  const legacyId = new URL(location.href).searchParams.get('articulo');
  if (examples.some(item => item.id === legacyId)) {
    location.replace(articleURL(legacyId, readState()));
    return;
  }

  for (const button of filters) {
    button.addEventListener('click', () => applyFilters(button.dataset.pressTopic, search.value.trim()));
  }
  form.addEventListener('submit', event => {
    event.preventDefault();
    applyFilters(readState().topic, search.value.trim());
  });
  const updateSearch = () => applyFilters(readState().topic, search.value.trim(), true);
  search.addEventListener('input', event => {
    if (!event.isComposing) updateSearch();
  });
  search.addEventListener('compositionend', updateSearch);
  document.querySelector('#press-archive-reset').addEventListener('click', () => {
    search.value = '';
    applyFilters('all', '');
    search.focus();
  });

  form.hidden = false;
  document.querySelector('#press-archive-tools').hidden = false;
  restoreList();
  window.addEventListener('popstate', restoreList);
}

setupArchive();
