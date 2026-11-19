import { examples } from './archive-examples.js?v=bf9c400307';

const archive = document.querySelector('#archivo');
const form = document.querySelector('#press-archive-search');
const search = document.querySelector('#press-archive-query');
const clearSearch = document.querySelector('#press-search-clear');
const topicField = document.querySelector('#press-archive-topic');
const resultList = document.querySelector('#press-archive-list');
const cardTemplate = document.querySelector('#press-archive-card');
const count = document.querySelector('#press-archive-count');
const viewButton = document.querySelector('#press-archive-view');
const archiveTitle = document.querySelector('#press-archive-title');
const demoNote = document.querySelector('#press-archive-demo-note');
const empty = document.querySelector('#press-archive-empty');
const paging = document.querySelector('#press-archive-paging');
const previous = document.querySelector('#press-page-prev');
const next = document.querySelector('#press-page-next');
const pageIndex = document.querySelector('#press-page-index');
const topics = new Map([...topicField.options].map(option => [option.value, option.textContent]));
const topicGroups = {
  published: ['all', 'medios', 'comunicados'],
  demo: ['all', 'empresa', 'producto', 'guias'],
};
const pageSize = 6;
const dateFormat = new Intl.DateTimeFormat('es-MX', {
  day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC',
});

const originals = [...document.querySelectorAll('[data-archive-topic]')].map(article => {
  const headline = article.querySelector('h3');
  return {
    topic: article.dataset.archiveTopic,
    date: article.querySelector('time').dateTime,
    title: headline.title || headline.textContent,
    source: article.querySelector('.press-meta span').textContent,
    summary: article.querySelector('.press-summary')?.textContent ?? 'Comunicado de ALA distribuido por GetNews.',
    href: article.querySelector('a').href,
    photo: article.querySelector('.press-photo img').getAttribute('src'),
  };
});
const newestFirst = (a, b) => b.date.localeCompare(a.date);
const lists = {
  published: originals.sort(newestFirst),
  demo: [...examples].sort(newestFirst),
};
const exampleIds = new Set(examples.map(item => item.id));
const slugPrefix = 'nota-';

function normalize(text) {
  return text.toLocaleLowerCase('es-MX').normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

function readState() {
  const url = new URL(location.href);
  const topic = url.searchParams.get('tema');
  const rawPage = url.searchParams.get('pagina') ?? '';
  const view = url.searchParams.get('vista') === 'demo' ||
    (!url.searchParams.has('vista') && (
      (topic !== 'all' && topicGroups.demo.includes(topic)) ||
      exampleIds.has(anchorArticle()) ||
      exampleIds.has(url.searchParams.get('articulo'))
    )) ? 'demo' : 'published';
  return {
    view,
    topic: topicGroups[view].includes(topic) ? topic : 'all',
    term: (url.searchParams.get('q') ?? '').trim().slice(0, 100),
    page: /^\d+$/.test(rawPage) ? Math.max(1, Number(rawPage)) : 1,
  };
}

function keepListContext(url, { view, topic, term, page }) {
  if (view === 'demo') url.searchParams.set('vista', 'demo');
  if (topic !== 'all') url.searchParams.set('tema', topic);
  if (term) url.searchParams.set('q', term);
  if (page > 1) url.searchParams.set('pagina', String(page));
  return url;
}

function archiveURL(state) {
  const url = new URL(location.href);
  for (const param of ['vista', 'tema', 'q', 'pagina', 'articulo']) url.searchParams.delete(param);
  url.hash = 'archivo';
  return keepListContext(url, state);
}

function articleURL(id, state) {
  const url = new URL('./nota/', location.href);
  url.searchParams.set('id', id);
  return keepListContext(url, state);
}

function matchesFor({ view, topic, term }) {
  const words = normalize(term).split(/\s+/).filter(Boolean);
  return lists[view].filter(publication => {
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
  const source = fragment.querySelector('[data-card-source]');

  label.textContent = topics.get(publication.topic);
  date.dateTime = publication.date;
  date.textContent = dateFormat.format(new Date(publication.date));
  const heading = fragment.querySelector('h3');
  heading.textContent = publication.title;
  heading.title = publication.title;
  fragment.querySelector('.press-archive-summary').textContent = publication.summary;

  if (publication.href) {
    link.href = publication.href;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    source.textContent = publication.topic === 'comunicados'
      ? publication.source + ' · En inglés'
      : publication.source;
    source.hidden = false;
    const photo = fragment.querySelector('.press-archive-photo');
    photo.querySelector('img').src = publication.photo;
    photo.hidden = false;
  } else {
    link.id = slugPrefix + publication.id;
    fragment.querySelector('.press-demo-label').hidden = false;
    link.href = articleURL(publication.id, state);
    link.dataset.demoArticle = publication.id;
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

  const demo = state.view === 'demo';
  archiveTitle.textContent = demo ? 'Ejemplos del demo' : 'Archivo de noticias';
  viewButton.textContent = demo ? 'Volver a publicaciones' : 'Ver ejemplos del demo';
  demoNote.hidden = !demo;
  archive.dataset.view = state.view;
  if (topicField.dataset.view !== state.view) {
    topicField.replaceChildren(...topicGroups[state.view].map(topic => new Option(topics.get(topic), topic)));
    topicField.dataset.view = state.view;
  }

  resultList.replaceChildren(...visible.map(publication => createCard(publication, { ...state, page })));
  count.textContent = totalPages > 1
    ? 'Mostrando ' + (start + 1) + '–' + (start + visible.length) + ' de ' + matches.length + ' publicaciones'
    : matches.length + (matches.length === 1 ? ' publicación' : ' publicaciones');
  empty.hidden = matches.length > 0;
  clearSearch.hidden = search.value.length === 0;
  paging.hidden = totalPages <= 1;
  pageIndex.textContent = 'Página ' + page + ' de ' + totalPages;
  updatePageLink(previous, state, page - 1, page > 1);
  updatePageLink(next, state, page + 1, page < totalPages);
  topicField.value = state.topic;
}

function applyFilters(topic, term, replace = false, view = readState().view) {
  const state = { view, topic, term, page: 1 };
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
      const destination = item ?? archive;
      destination.scrollIntoView({ block: 'start' });
      destination.focus({ preventScroll: true });
    });
  }
}

function setupArchive() {
  const legacyId = new URL(location.href).searchParams.get('articulo');
  if (exampleIds.has(legacyId)) {
    location.replace(articleURL(legacyId, readState()));
    return;
  }

  viewButton.addEventListener('click', () => {
    const view = readState().view === 'demo' ? 'published' : 'demo';
    applyFilters('all', search.value.trim(), false, view);
  });
  topicField.addEventListener('change', () => applyFilters(topicField.value, search.value.trim()));
  form.addEventListener('submit', event => {
    event.preventDefault();
    applyFilters(readState().topic, search.value.trim());
  });
  const updateSearch = () => applyFilters(readState().topic, search.value.trim(), true);
  search.addEventListener('input', event => {
    if (!event.isComposing) updateSearch();
  });
  search.addEventListener('compositionend', updateSearch);
  clearSearch.addEventListener('click', () => {
    search.value = '';
    search.focus();
    applyFilters(readState().topic, '');
  });
  document.querySelector('#press-archive-reset').addEventListener('click', () => {
    search.value = '';
    applyFilters('all', '');
    search.focus();
  });

  viewButton.hidden = false;
  document.querySelector('#press-archive-tools').hidden = false;
  restoreList();
  window.addEventListener('popstate', restoreList);
}

setupArchive();
