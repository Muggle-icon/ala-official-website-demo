/* City detail page JavaScript */
let swiper2;

window.onload = function () {
  swiper2 = new Swiper(".swiper-container2", {
    centeredSlides: false,
    loop: true,
    speed: 0,
    width: window.innerWidth,
    roundLengths: true,
    autoplay: {
      delay: 3000,
      disableOnInteraction: false,
      waitForTransition: false,
    },
    allowTouchMove: false,
    pagination: {
      el: ".swiper2-pagination",
    },
    navigation: {
      nextEl: ".swiper2-navigtion-right",
      prevEl: ".swiper2-navigtion-left",
    },
    on: {
      init: function () {
        this.updateSize();
      },
      resize: function () {
        this.params.width = window.innerWidth;
        this.updateSize();
        this.update();
      },
    },
  });
};

function initCityArticles() {
  const section = document.getElementById('cityDetailArticles');
  const list = document.getElementById('cityDetailList');
  const status = document.getElementById('cityDetailStatus');
  const pagination = document.getElementById('cityDetailPagination');
  const more = document.getElementById('cityDetailMore');
  const moreLabel = more.querySelector('[data-more-label]');
  let nextPage = 1;

  async function loadPage() {
    list.setAttribute('aria-busy', 'true');
    more.disabled = true;
    status.hidden = true;

    try {
      const { data } = await blogRequest('/article/page', {
        params: { pageSize: 9, page: nextPage, channel: window.channelAlias }
      });
      list.append(...data.content.map(article => makeEditorialCard(article, 'h3')));
      section.hidden = !list.childElementCount;

      moreLabel.textContent = 'Cargar más artículos';
      pagination.hidden = data.last;
      nextPage++;
    } catch {
      section.hidden = false;
      status.textContent = 'No se pudieron cargar los artículos.';
      status.hidden = false;
      pagination.hidden = false;
      moreLabel.textContent = 'Volver a intentar';
    } finally {
      more.disabled = false;
      list.setAttribute('aria-busy', 'false');
    }
  }

  more.addEventListener('click', loadPage);
  loadPage();
}

async function renderNearbyCities() {
  const [cityResponse, dictionaryResponse] = await Promise.all([
    blogRequest('/channel?parent=loan_city'),
    blogRequest('/dict')
  ]);
  const keyFor = label => label.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase().trim();
  const cities = cityResponse.data;
  const dictionary = [...new Set(dictionaryResponse.data.map(entry => keyFor(entry.value)))];
  const availableCities = [...cities].sort(
    (a, b) => dictionary.indexOf(keyFor(a.name)) - dictionary.indexOf(keyFor(b.name))
  );
  const position = availableCities.findIndex(city => city.alias === window.channelAlias);
  const start = Math.max(0, Math.min(position - 5, availableCities.length - 11));
  const nearby = availableCities.slice(start, start + 11).filter(city => city.alias !== window.channelAlias);

  const list = document.createElement('div');
  list.className = 'ala-gap ala-padding ala-mt ala-ml ala-mr ala-mb ala-radius city-list motion-element animated';
  nearby.forEach(city => {
    const link = document.createElement('a');
    link.className = 'ala-padding ala-size ala-radius ala-lh city-item';
    link.href = city.url;
    link.textContent = city.name;
    list.append(link);
  });
  document.querySelector('#nearbyCities')?.append(list);
}

document.addEventListener('DOMContentLoaded', () => {
  initCityArticles();
  document.querySelectorAll('.cityNameContainer').forEach(container => {
    container.textContent = window.channelName;
  });
  renderNearbyCities().catch(() => {
    document.querySelector('#nearbyCities')?.remove();
  });
});
