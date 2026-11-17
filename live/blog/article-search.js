const articleSearchStopWords = new Set([
  'a', 'al', 'como', 'con', 'cual', 'cuales', 'cuando', 'cuanto', 'de', 'del', 'donde',
  'el', 'en', 'es', 'esta', 'la', 'las', 'lo', 'los', 'me', 'mi', 'mis',
  'o', 'para', 'pasa', 'por', 'puedo', 'que', 'se', 'si', 'su', 'tengo', 'tu',
  'un', 'una', 'y'
]);

const articleSearchFamilies = [
  /^(?:pag(?:o|os|ar|as|ado|ue|ues|an|amos|ada|ados|adas)|abonos?)$/,
  /^(?:prestamos?|creditos?)$/,
  /^(?:fraudes?|estaf\w*|suplant\w*)$/,
  /^(?:atras\w*|mora|moros\w*)$/
];

function articleSearchText(value) {
  return String(value ?? '').toLocaleLowerCase('es-MX').normalize('NFD')
    .replace(/\p{M}/gu, '').replace(/[^a-z0-9]+/g, ' ').trim();
}

function articleSearchWords(value) {
  const words = articleSearchText(value).split(' ').filter(Boolean);
  const meaningful = words.filter(word => !articleSearchStopWords.has(word));
  return [...new Set(meaningful.length ? meaningful : words)];
}

function articleSearchScore(query, index) {
  const terms = articleSearchWords(query);
  const words = index.split(' ');
  return terms.reduce((score, term) => {
    const family = articleSearchFamilies.find(pattern => pattern.test(term));
    const matches = words.some(word => word === term ||
      (term.length >= 4 && word.startsWith(term)) || family?.test(word));
    return score + Number(matches);
  }, 0);
}

function articleSearchMatches(query, index) {
  const terms = articleSearchWords(query);
  return !terms.length || articleSearchScore(query, index) === terms.length;
}
