import { examples } from './archive-examples.js?v=bf9c400307';

const archive = document.querySelector('#archivo');
const resultList = document.querySelector('#press-archive-list');
const cardTemplate = document.querySelector('#press-archive-card');
const topics = new Map([
  ['medios', 'En los medios'],
  ['comunicados', 'Comunicados'],
  ['empresa', 'Empresa'],
  ['producto', 'Producto'],
  ['guias', 'Guías'],
]);
const dateFormat = new Intl.DateTimeFormat('es-MX', {
  day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC',
});

const archiveOriginals = document.querySelector('#press-archive-originals');
// The featured story already appears above the archive; do not repeat it here.
const originals = [...(archiveOriginals ? archiveOriginals.content.querySelectorAll('[data-archive-topic]') : [])].map(article => {
  const headline = article.querySelector('h3');
  return {
    topic: article.dataset.archiveTopic,
    date: article.querySelector('time').dateTime,
    title: headline.textContent,
    fullTitle: headline.title,
    summary: article.dataset.summary || '',
    source: article.querySelector('.press-meta span').textContent,
    href: article.querySelector('a').href,
    photo: article.querySelector('.press-photo img').getAttribute('src'),
  };
});
const newestFirst = (a, b) => b.date.localeCompare(a.date);
// Show the three real reports first, followed by dated demo examples.
const publications = [...originals.sort(newestFirst), ...examples.slice().sort(newestFirst)];

function articleURL(id) {
  const url = new URL('./nota/', location.href);
  url.searchParams.set('id', id);
  return url;
}

function createCard(publication) {
  const fragment = cardTemplate.content.cloneNode(true);
  const row = fragment.querySelector('li');
  row.classList.add('press-timeline-item');
  const label = fragment.querySelector('[data-card-topic]');
  const date = fragment.querySelector('time');
  const link = fragment.querySelector('a');
  const source = fragment.querySelector('[data-card-source]');
  const photo = fragment.querySelector('.press-archive-photo');

  label.textContent = topics.get(publication.topic);
  label.hidden = true;
  date.dateTime = publication.date;
  const dateParts = dateFormat.formatToParts(new Date(publication.date));
  const day = document.createElement('span');
  const monthYear = document.createElement('span');
  day.className = 'press-date-day';
  monthYear.className = 'press-date-month-year';
  day.textContent = dateParts.find(part => part.type === 'day').value;
  monthYear.textContent = dateParts.filter(part => part.type === 'month' || part.type === 'year').map(part => part.value).join(' ');
  date.replaceChildren(day, ' ', monthYear);
  date.classList.add('press-timeline-date');
  label.before(date);
  const heading = fragment.querySelector('h3');
  heading.textContent = publication.title;
  heading.title = publication.fullTitle || publication.title;
  const summary = fragment.querySelector('.press-archive-summary');
  if (publication.summary) {
    summary.textContent = publication.summary;
    summary.hidden = false;
  }
  photo.hidden = false;

  if (publication.href) {
    link.href = publication.href;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    source.textContent = publication.topic === 'comunicados'
      ? publication.source + ' · En inglés'
      : publication.source;
    source.hidden = false;
    photo.querySelector('img').src = publication.photo;
  } else {
    link.id = 'nota-' + publication.id;
    fragment.querySelector('.press-demo-label').hidden = false;
    if (publication.image) {
      photo.querySelector('img').src = '../public/assets/news/' + publication.image;
    } else {
      photo.classList.add('press-placeholder');
      photo.querySelector('img').src = '../public/assets/ala-logo.png';
    }
    link.href = articleURL(publication.id);
    link.dataset.demoArticle = publication.id;
  }

  return fragment;
}

function restoreList() {
  const url = new URL(location.href);
  const legacyId = url.searchParams.get('articulo');
  if (examples.some(item => item.id === legacyId)) {
    location.replace(articleURL(legacyId));
    return;
  }

  for (const param of ['vista', 'tema', 'q', 'pagina']) url.searchParams.delete(param);
  if (url.href !== location.href) history.replaceState(history.state, '', url);

  resultList.replaceChildren(...publications.map(createCard));
  const anchorId = location.hash.slice(1);
  if (anchorId.startsWith('nota-')) {
    const destination = document.getElementById(anchorId) ?? archive;
    requestAnimationFrame(() => {
      destination.scrollIntoView({ block: 'start' });
      destination.focus({ preventScroll: true });
    });
  }
}

restoreList();
window.addEventListener('popstate', restoreList);
