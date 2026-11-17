document.addEventListener('DOMContentLoaded', () => {
  const cityRoutes = {
  "86186727625662465": "prestamos-en-Puebla",
  "86197296555996674": "prestamos-en-merida",
  "86241068144548865": "Prestamo-personal-en-Ciudad-de-Mexico",
  "86241311587195905": "prestamo-en-Queretaro",
  "86241345061631489": "prestamos-en-aguascalientes",
  "86241409170824194": "prestamos-en-san-luis-potosi",
  "86863132132976130": "Prestamos-en-Guadalajara",
  "87051639683161601": "prestamo-personal-en-monterrey",
  "87094011468523009": "prestamos-personal-en-tijuana",
  "87141216189773826": "prestamo-personal-en-mexicali",
  "87185736275687425": "Prestamos-en-Ecatepec",
  "87233366281887746": "prestamos-en-Leon",
  "87275102897534977": "Prestamos-en-ciudad-juarez",
  "87549607608784386": "prestamos-en-zapopan",
  "87773689110893569": "prestamos-en-Cd-Neza",
  "88033862037463554": "Prestamos-Personales-en-Cancun",
  "88229359352257537": "Prestamos-en-Hermosillo",
  "88542607031194113": "prestamos-en-toluca",
  "88773163944809474": "prestamos-en-saltillo",
  "88773271979547137": "prestamos-en-torreon"
};
  document.querySelectorAll('.same-site-jump').forEach(item => {
    const route = cityRoutes[item.dataset.channel];
    if (!route) return;
    if (item.tagName === 'A') {
      item.href = '../' + route + '/';
      return;
    }
    const link = document.createElement('a');
    link.className = item.className;
    link.style.color = 'inherit';
    link.style.textDecoration = 'none';
    link.href = '../' + route + '/';
    link.append(...item.childNodes);
    item.replaceWith(link);
  });
});
