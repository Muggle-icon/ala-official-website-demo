const blogTopics = {
  todos: 'Todos',
  prestamos: 'Préstamos',
  pagos: 'Pagos y cobranza',
  seguridad: 'Seguridad y fraudes',
  finanzas: 'Finanzas personales',
  conceptos: 'Conceptos financieros',
  noticias: 'Noticias financieras'
};

const blogSafety = /\b(?:fraudes?|estaf\w*|suplant\w*|amenazas?|acos\w*|datos|reconocimiento facial|sitio web oficial|sitio oficial|sipres|condusef|numeros telefonicos|riesgos reales|riesgos que conviene|quien esta detras|es confiable|publicidad de creditos)\b/;
const blogPayments = /\b(?:atras\w*|cobranza|deudas?|recuperar tu prestamo|no te pagan la tanda|buro de credito|pago sin intereses|no puedes pagar tu prestamo)\b/;
const blogLoans = /\b(?:prestamos?|pedir dinero|solicitar un credito|solicitud de credito|limite de credito|credito educativo|credito cash|tipos de credito)\b/;

function articleBlogTopic(article, title) {
  const sections = article.channel.paths.map(channel => channel.alias);
  if (sections.includes('loan_financiero')) return 'conceptos';
  if (sections.includes('noticias-financieras')) return 'noticias';
  if (blogSafety.test(title)) return 'seguridad';
  if (blogPayments.test(title)) return 'pagos';
  if (blogLoans.test(title)) return 'prestamos';
  return 'finanzas';
}

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('blogSearch');
  const input = document.getElementById('blogSearchInput');
  const clear = document.getElementById('clearBlogSearch');
  const topicLinks = [...document.querySelectorAll('[data-blog-topic]')];
  const header = document.getElementById('blogResultsTitle');
  const count = document.getElementById('blogResultsCount');
  const list = document.getElementById('blogList');
  const status = document.getElementById('blogStatus');
  const more = document.getElementById('loadMoreArticles');
  const moreLabel = more.querySelector('[data-more-label]');
  const pageSize = 9;

  let catalog = null;
  let matches = [];
  let shown = 0;

  function locationFilters() {
    const params = new URLSearchParams(location.search);
    const topic = params.get('tema');
    return {
      query: (params.get('q') || '').trim().slice(0, 120),
      topic: topicLinks.some(link => link.dataset.blogTopic === topic) ? topic : 'todos'
    };
  }

  function filterUrl(query, topic) {
    const url = new URL('.', location.href);
    if (query) url.searchParams.set('q', query);
    if (topic !== 'todos') url.searchParams.set('tema', topic);
    return url;
  }

  function setFilters(query, topic) {
    const url = filterUrl(query, topic);
    if (url.href !== location.href) history.pushState(null, '', url);
    render();
  }

  function showMore() {
    const batch = matches.slice(shown, shown + pageSize);
    list.append(...batch.map(entry => makeEditorialCard({
      ...entry.article,
      channel: { ...entry.article.channel, name: blogTopics[entry.topic] }
    }, 'h3')));
    shown += batch.length;
    more.hidden = shown === matches.length;
    moreLabel.textContent = 'Cargar más artículos';
  }

  function render() {
    const { query, topic } = locationFilters();
    input.value = query;
    clear.hidden = !query && topic === 'todos';
    for (const link of topicLinks) {
      const slug = link.dataset.blogTopic;
      link.href = filterUrl(query, slug);
      if (slug === topic) link.setAttribute('aria-current', 'page');
      else link.removeAttribute('aria-current');
    }

    header.textContent = query ? 'Resultados de búsqueda' :
      topic === 'todos' ? 'Artículos recientes' : blogTopics[topic];

    if (!catalog) return;
    const terms = articleSearchWords(query);
    const normalized = articleSearchText(query);
    const targetTopic = blogSafety.test(normalized) ? 'seguridad' :
      /\b(?:pag(?:o|os|ar|ue|ado)|atras\w*|cobr\w*|mora)\b/.test(normalized) ? 'pagos' : '';
    const relevance = entry => {
      const fullPhrase = terms.length > 1 && (' '+entry.title+' ').includes(' '+normalized+' ');
      return 16 * Number(fullPhrase) + 6 * Number(entry.topic === targetTopic) +
        2 * articleSearchScore(query, entry.title);
    };
    matches = catalog.filter(entry => (topic === 'todos' || entry.topic === topic) &&
      articleSearchMatches(query, entry.index));
    if (terms.length) matches.sort((a, b) => relevance(b) - relevance(a));

    shown = 0;
    list.replaceChildren();
    const total = matches.length;
    count.textContent = total === 1 ? '1 artículo' : `${total} artículos`;
    status.hidden = total > 0;
    if (!total) status.textContent = 'No encontramos artículos. Prueba con otras palabras o cambia de tema.';
    showMore();
  }

  async function loadCatalog() {
    list.setAttribute('aria-busy', 'true');
    more.hidden = true;
    more.disabled = true;
    status.hidden = false;
    status.textContent = 'Cargando artículos…';
    try {
      const { data } = await blogRequest('/article');
      catalog = data.map(article => {
        const title = articleSearchText(article.title);
        const topic = articleBlogTopic(article, title);
        const index = articleSearchText([
          article.title, article.seoDescription, article.description, article.channel.name,
          article.customs?.article_item_name, blogTopics[topic]
        ].filter(Boolean).join(' '));
        return { article, title, topic, index };
      });
      render();
    } catch {
      status.textContent = 'No se pudieron cargar los artículos.';
      more.hidden = false;
      moreLabel.textContent = 'Volver a intentar';
    } finally {
      list.setAttribute('aria-busy', 'false');
      more.disabled = false;
    }
  }

  form.addEventListener('submit', event => {
    event.preventDefault();
    setFilters(input.value.trim().slice(0, 120), locationFilters().topic);
  });

  input.addEventListener('input', () => {
    if (!input.value && locationFilters().query) setFilters('', locationFilters().topic);
  });

  clear.addEventListener('click', () => {
    setFilters('', 'todos');
    input.focus();
  });

  for (const link of topicLinks) {
    link.addEventListener('click', event => {
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      event.preventDefault();
      setFilters(input.value.trim().slice(0, 120), link.dataset.blogTopic);
    });
  }

  more.addEventListener('click', () => {
    if (!catalog) {
      loadCatalog();
      return;
    }
    const firstNew = shown;
    showMore();
    list.children[firstNew]?.querySelector('a')?.focus({ preventScroll: true });
  });

  addEventListener('popstate', render);
  render();
  loadCatalog();
});
