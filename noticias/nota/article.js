import { examples } from '../archive-examples.js?v=bf9c400307';

const categories = new Map([
  ['medios', 'En medios'],
  ['comunicados', 'Comunicados'],
  ['empresa', 'Empresa'],
  ['producto', 'Producto'],
  ['guias', 'Guías'],
]);
const dateFormat = new Intl.DateTimeFormat('es-MX', { dateStyle: 'long', timeZone: 'UTC' });
const params = new URLSearchParams(location.search);
const article = examples.find(example => example.id === params.get('id'));
const archive = new URL('../', location.href);
archive.hash = article ? 'nota-' + article.id : 'archivo';
document.querySelector('#press-article-return').href = archive.href;

function renderRelated(example) {
  const others = examples.filter(candidate => candidate.id !== example.id);
  const sameTopic = others.filter(candidate => candidate.topic === example.topic);
  const otherTopics = others.filter(candidate => candidate.topic !== example.topic);
  const related = [...sameTopic, ...otherTopics].slice(0, 3);
  const template = document.querySelector('#press-article-related-card');
  const list = document.querySelector('#press-article-related-list');

  for (const item of related) {
    const fragment = template.content.cloneNode(true);
    const link = fragment.querySelector('a');
    const url = new URL('./', location.href);
    url.searchParams.set('id', item.id);
    link.href = url.href;
    link.textContent = item.title;
    list.append(fragment);
  }

  document.querySelector('#press-article-related').hidden = related.length === 0;
}

if (article) {
  document.title = article.title + ' | ALA Préstamos México';
  document.querySelector('meta[name="description"]').content = article.summary;
  document.querySelector('#press-article-topic').textContent = categories.get(article.topic);
  const time = document.querySelector('#press-article-date');
  time.dateTime = article.date;
  time.textContent = dateFormat.format(new Date(article.date));
  document.querySelector('#press-article-title').textContent = article.title;
  document.querySelector('#press-article-deck').textContent = article.summary;
  const copy = document.querySelector('#press-article-copy');
  if (!article.image) {
    const placeholder = document.createElement('div');
    placeholder.className = 'press-article-placeholder';
    const logo = new Image();
    logo.src = '../../public/assets/ala-logo.png';
    logo.alt = '';
    placeholder.append(logo);
    copy.before(placeholder);
  }
  if (article.image) {
    const photo = new Image(720, 360);
    photo.className = 'press-article-image';
    photo.alt = '';
    photo.decoding = 'async';
    photo.addEventListener('error', () => photo.remove(), { once: true });
    photo.src = '../../public/assets/news/' + article.image;
    copy.before(photo);
  }
  for (const text of article.body) {
    const paragraph = document.createElement('p');
    paragraph.textContent = text;
    copy.append(paragraph);
  }
  document.querySelector('#press-article').hidden = false;
  renderRelated(article);
} else {
  document.title = 'Publicación no encontrada | ALA Préstamos México';
  document.querySelector('#press-article-empty').hidden = false;
}
