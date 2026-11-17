const blogRoot = new URL('../../', document.currentScript.src);
const blogFiles = new URL('live/blog/ala-www/', blogRoot).href.replace(/\/$/, '');
const blogAsset = (path) => new URL(path, blogFiles + '/').href;
let blogCatalog;

async function blogRequest(path, { params = {} } = {}) {
  blogCatalog ??= fetch(new URL('live/blog/catalog.json', blogRoot)).then(response => {
    if (!response.ok) throw new Error('No se pudo cargar el catálogo.');
    return response.json();
  }).catch(error => {
    blogCatalog = null;
    throw error;
  });

  const catalog = await blogCatalog;
  if (path.startsWith('/channel')) {
    const menu = path.includes('parent=loan_city') ? catalog.cities : catalog.blogMenu;
    return { data: menu.map(entry => ({
      ...entry,
      url: new URL(entry.url || entry.dynamicUrl, blogRoot).href,
      dynamicUrl: new URL(entry.dynamicUrl || entry.url, blogRoot).href
    })) };
  }
  if (path === '/dict') return { data: catalog.cityDict };
  const channels = (params.channel || '').split(',').filter(Boolean);
  const articles = catalog.articles.filter(article => {
    const paths = article.channel.paths.map(channel => channel.alias);
    const matchesChannel = !channels.length || channels.some(alias => paths.includes(alias) ||
      (alias === 'loan_guide' && paths.includes('guia-de-prestamos')) ||
      (alias === 'financial_news' && paths.includes('noticias-financieras')));
    return matchesChannel && (!params.channelId || params.channelId === article.channelId) &&
      (!params.tagId || article.tags.includes(params.tagId));
  });
  const page = Number(params.page || 1);
  const size = Number(params.pageSize || articles.length);
  const parseChannel = (channel) => ({
    ...channel,
    url: new URL(channel.url, blogRoot).href
  });
  const src = path === '/article' ? articles : articles.slice((page - 1) * size, page * size);
  const data = src.map(article => ({
    ...article,
    url: new URL(article.url, blogRoot).href,
    dynamicUrl: new URL(article.url, blogRoot).href,
    image: article.image ? new URL(article.image, blogRoot).href : '',
    compressedImage: article.compressedImage ? new URL(article.compressedImage, blogRoot).href : '',
    authorInfo: article.authorInfo ? {
      ...article.authorInfo,
      image: article.authorInfo.image ? new URL(article.authorInfo.image, blogRoot).href : ''
    } : undefined,
    channel: {
      ...parseChannel(article.channel),
      paths: article.channel.paths.map(parseChannel)
    }
  }));
  return { data: path === '/article' ? data : {
    content: data,
    last: page * size >= articles.length
  } };
}

function androidMobileButton() {
  window.open('https://sofom-ala.onelink.me/uTdM/taq3lvd3', '_blank', 'noopener');
}

function appleMobileButton() {
  window.open('https://sofom-ala.onelink.me/ndX5/mbzy0s0s', '_blank', 'noopener');
}

document.addEventListener('DOMContentLoaded', () => {
  const support = document.querySelector('#helpFloat');
  const openSupport = () => support?.classList.add('open');
  const closeSupport = () => support?.classList.remove('open');

  document.querySelectorAll('.chat-btn, #helpFloatTrigger').forEach(element => {
    element.setAttribute('role', 'button');
    element.setAttribute('tabindex', '0');
    element.setAttribute('aria-label', 'Atención en línea');
    element.addEventListener('click', openSupport);
    element.addEventListener('keydown', event => {
      if (!['Enter', ' '].includes(event.key)) return;
      event.preventDefault();
      openSupport();
    });
  });
  document.querySelector('#helpFloatClose')?.addEventListener('click', closeSupport);
  support?.addEventListener('click', event => {
    if (event.target === support) closeSupport();
  });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape') closeSupport();
    if (!['Enter', ' '].includes(event.key) || !event.target.matches('.blog-tag-slide')) return;
    event.preventDefault();
    event.target.click();
  });
});
