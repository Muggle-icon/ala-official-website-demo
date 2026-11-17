const dictionaryTopics = {
  'credito-y-costos': [
    'Tasa de interés vs Comisiones vs CAT',
    'Cartera Crediticia',
    'Seguro de Crédito a la Vivienda',
    'Plazo Efectivo o de Vencimiento (V)',
    'Revolvente',
    'Préstamos de Exigibilidad Inmediata',
    'Seguro de crédito',
    'Comisiones',
  ],
  'pagos-y-deudas': [
    'Periodo de Facturación',
    'Quitas, condonaciones, bonificaciones y descuentos sobre la cartera',
    'Terminal Punto de Venta',
    'Doble incumplimiento',
    'Cajero Automático',
  ],
  'dinero-e-inversion': [
    'Ventas Netas vs. Ingresos Netos',
    'Operaciones',
    'Rendimiento sobre los activos (ROA)',
    'Razones Financieras',
    'Rendimiento sobre el Capital (ROE)',
    'UDIs',
    'Remuneración ordinaria',
    'Operación Monetaria',
    'Coeficiente Beta',
    'El Inversionista Calificado',
  ],
  'riesgo-y-regulacion': [
    'Reglas de Capitalización',
    'Pérdidas Esperadas Totales',
    'Operaciones Causantes de Pasivo Contingente',
    'Reservas Admisibles Totales',
    'Unidad Especializada',
    'Pérdida en Caso de Incumplimiento',
    'Préstamos interbancarios y de otros organismos',
    'Operaciones sujetas a riesgo de crédito',
    'Probabilidad de Incumplimiento (PI)',
    'Método del Indicador Básico',
    'Grado de riesgo',
    'Factor de autenticación',
    'Esquema de Cobertura en Paso y Medida (Pari-Passu)',
    'Calificación Aplicable a la Calidad Crediticia del Deudor',
    'Calificaciones',
    'Capital Básico 2',
    'Capital Neto',
    'Capital Básico 1',
    'Coeficiente de liquidez',
    'SOFOM',
  ],
};

document.addEventListener('DOMContentLoaded', async () => {
  const form = document.getElementById('dictionarySearch');
  const query = document.getElementById('dictionaryQuery');
  const clear = document.getElementById('dictionaryClear');
  const featured = document.getElementById('dictionaryFeatured');
  const grid = document.getElementById('dictionaryTerms');
  const heading = document.getElementById('dictionaryTermsTitle');
  const status = document.getElementById('dictionaryStatus');
  const topics = [...document.querySelectorAll('[data-dictionary-topic]')];
  const topicNames = new Map(topics.map(link => [link.dataset.dictionaryTopic, link.textContent]));
  let terms = [];
  let activeTopic = '';

  const topicByTerm = new Map(Object.entries(dictionaryTopics).flatMap(([topic, names]) =>
    names.map(name => [articleSearchText(name), topic])
  ));

  function topicURL(topic) {
    const url = new URL(location.href);
    url.hash = '';
    if (topic) url.searchParams.set('tema', topic);
    else url.searchParams.delete('tema');
    if (query.value.trim()) url.searchParams.set('q', query.value.trim());
    else url.searchParams.delete('q');
    return url;
  }

  function restore() {
    const params = new URLSearchParams(location.search);
    query.value = params.get('q') || '';
    const topic = params.get('tema');
    activeTopic = topicNames.has(topic) ? topic : '';
    featured.hidden = Boolean(query.value.trim() || activeTopic);
    clear.hidden = !featured.hidden;
  }

  function showLegacyLetter() {
    const match = location.hash.match(/^#([A-Z]|%C3%91|%23)$/i);
    if (match) document.getElementById(decodeURIComponent(match[1]).toUpperCase())?.scrollIntoView();
  }

  function render() {
    const phrase = query.value.trim();
    const filtered = Boolean(phrase || activeTopic);
    const matches = terms.filter(term =>
      (!activeTopic || term.topic === activeTopic) &&
      (!phrase || articleSearchMatches(phrase, term.index))
    );
    if (phrase) {
      const exactName = articleSearchText(phrase);
      const rank = term => term.name === exactName ? 2 : Number(articleSearchMatches(phrase, term.name));
      matches.sort((a, b) => rank(b) - rank(a));
    }

    const letters = new Set();
    const cards = matches.map(term => {
      const card = makeEditorialCard(term.card, 'h3');
      // Existing shared links can still scroll to the first term for a letter.
      if (!filtered) {
        const first = term.card.title[0].toUpperCase();
        const letter = /[A-ZÑ]/.test(first) ? first : '#';
        if (!letters.has(letter)) {
          card.id = letter;
          letters.add(letter);
        }
      }
      return card;
    });
    grid.replaceChildren(...cards);
    grid.setAttribute('aria-busy', 'false');
    featured.hidden = filtered;
    clear.hidden = !filtered;
    heading.textContent = phrase ? 'Resultados de búsqueda' : activeTopic ? topicNames.get(activeTopic) : 'Todos los términos';
    status.textContent = matches.length === 0
      ? 'No encontramos términos para esta búsqueda.'
      : matches.length === 1 ? '1 término' : matches.length + ' términos';
    for (const link of topics) {
      link.href = topicURL(link.dataset.dictionaryTopic).href;
      if (link.dataset.dictionaryTopic === activeTopic) link.setAttribute('aria-current', 'page');
      else link.removeAttribute('aria-current');
    }
  }

  async function load() {
    grid.setAttribute('aria-busy', 'true');
    try {
      const { data } = await blogRequest('/article', { params: { channel: 'loan_financiero' } });
      terms = data.flatMap(article => {
        const title = article.customs?.article_item_name?.trim();
        if (!title) return [];
        const name = articleSearchText(title);
        const topic = topicByTerm.get(name);
        const card = { ...article, title, channel: { ...article.channel, name: topicNames.get(topic) || 'Diccionario financiero' } };
        const index = articleSearchText([title, article.title, article.description, article.seoDescription, topicNames.get(topic)].join(' '));
        return [{ card, name, topic, index }];
      });
      render();
      showLegacyLetter();
    } catch {
      grid.setAttribute('aria-busy', 'false');
      status.textContent = 'No se pudieron cargar los términos. Intenta buscar de nuevo.';
    }
  }

  function updateSearch() {
    const url = topicURL(activeTopic);
    if (location.href !== url.href) history.replaceState(null, '', url);
    if (terms.length) render();
  }

  form.addEventListener('submit', event => {
    event.preventDefault();
    updateSearch();
    if (!terms.length) load();
  });
  query.addEventListener('input', updateSearch);
  clear.addEventListener('click', () => {
    activeTopic = '';
    query.value = '';
    updateSearch();
    query.focus();
  });

  for (const link of topics) {
    link.addEventListener('click', event => {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      if (!terms.length) return;
      event.preventDefault();
      activeTopic = link.dataset.dictionaryTopic;
      const url = topicURL(activeTopic);
      if (url.href !== location.href) history.pushState(null, '', url);
      render();
    });
  }

  addEventListener('popstate', () => {
    restore();
    if (terms.length) render();
    showLegacyLetter();
  });
  addEventListener('hashchange', showLegacyLetter);
  restore();
  await load();
});
