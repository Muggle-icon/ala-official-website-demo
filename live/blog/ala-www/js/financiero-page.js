document.addEventListener('DOMContentLoaded', async () => {
  const letters = document.getElementById('dictionaryLetters');
  const groups = document.getElementById('dictionaryGroups');
  const status = document.getElementById('dictionaryStatus');
  const alphabet = '#ABCDEFGHIJKLMNÑOPQRSTUVWXYZ';

  function updateSelection() {
    const hash = location.hash.slice(1);
    for (const link of letters.querySelectorAll('a')) {
      if (link.hash.slice(1) === hash) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    }
  }

  try {
    const { data } = await blogRequest('/article', { params: { channel: 'loan_financiero' } });
    const termsByLetter = new Map();
    for (const article of data) {
      const term = article.customs?.article_item_name?.trim();
      if (!term) continue;

      const initial = term[0].toUpperCase();
      const letter = alphabet.includes(initial) ? initial : '#';
      if (!termsByLetter.has(letter)) termsByLetter.set(letter, []);
      termsByLetter.get(letter).push({ ...article, title: term });
    }

    for (const letter of alphabet) {
      const terms = termsByLetter.get(letter);
      if (!terms?.length) continue;

      const item = document.createElement('li');
      const link = document.createElement('a');
      link.textContent = letter;
      link.href = '#' + encodeURIComponent(letter);
      item.append(link);
      letters.append(item);

      const group = document.createElement('section');
      group.className = 'ala-editorial-index-group';
      group.id = letter;

      const heading = document.createElement('h2');
      heading.className = 'ala-editorial-index-group-title';
      heading.textContent = letter;

      const grid = document.createElement('ul');
      grid.className = 'ala-editorial-grid';
      grid.append(...terms.map(term => makeEditorialCard(term, 'h3')));
      group.append(heading, grid);
      groups.append(group);
    }

    letters.closest('nav').hidden = !termsByLetter.size;
    if (!termsByLetter.size) {
      status.textContent = 'Aún no hay artículos disponibles.';
      status.hidden = false;
    }

    addEventListener('hashchange', updateSelection);
    updateSelection();
    if (location.hash.length > 1) {
      document.getElementById(decodeURIComponent(location.hash.slice(1)))?.scrollIntoView();
    }
  } catch {
    status.textContent = 'No se pudieron cargar los artículos.';
    status.hidden = false;
  } finally {
    groups.setAttribute('aria-busy', 'false');
  }
});
