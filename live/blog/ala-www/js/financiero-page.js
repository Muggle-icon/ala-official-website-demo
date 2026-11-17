/* Financiero page JavaScript */
const spanishLetters = [
  'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'Ñ',
  'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'
];

async function appendArticles() {
  try {
    const response = await blogRequest('/article', {
      params: {
        channel: 'loan_financiero',
        isIncludeSubChannel: true
      }
    });

    return Array.isArray(response.data) ? response.data : [];
  } catch (error) {
    console.error(error);
    return [];
  }
}

function formatToNewArr(resList) {
  const tempGroup = {};

  resList.forEach(item => {
    const articleName = (item?.customs?.article_item_name || '').trim();
    const articleUrl = item?.dynamicUrl || '#';

    if (!articleName) return;

    const firstChar = articleName.charAt(0).toUpperCase();
    const groupKey = spanishLetters.includes(firstChar) ? firstChar : '#';

    if (!tempGroup[groupKey]) {
      tempGroup[groupKey] = [];
    }

    const isDuplicate = tempGroup[groupKey].some(
      article => article.name === articleName && article.address === articleUrl
    );
    if (!isDuplicate) {
      tempGroup[groupKey].push({ name: articleName, address: articleUrl });
    }
  });

  const newArr = Object.keys(tempGroup).map(key => {
    const groupObj = {};
    groupObj[key] = tempGroup[key];
    return groupObj;
  });

  return newArr;
}

function sortResWithSpanishOrder(resList) {
  const hashGroup = resList.find(item => Object.keys(item)[0] === '#');
  const otherGroups = resList.filter(item => Object.keys(item)[0] !== '#');

  otherGroups.sort((a, b) => {
    const keyA = Object.keys(a)[0];
    const keyB = Object.keys(b)[0];
    const indexA = spanishLetters.indexOf(keyA);
    const indexB = spanishLetters.indexOf(keyB);

    if (indexA === -1 && indexB === -1) return 0;
    if (indexA === -1) return 1;
    if (indexB === -1) return -1;
    return indexA - indexB;
  });

  return hashGroup ? [hashGroup, ...otherGroups] : otherGroups;
}

function renderArticleGroups(resList) {
  const container = document.querySelector('.blog-tag-nav-wrap');
  if (!container) return;

  container.innerHTML = '';

  if (!resList || resList.length === 0) {
    container.innerHTML = '<div class="text-muted text-center py-3">Aún no hay artículos disponibles.</div>';
    return;
  }

  const ul = document.createElement('ul');
  ul.className = 'article-group-ul list-unstyled';

  resList.forEach(groupObj => {
    const entries = Object.entries(groupObj);
    const [firstLetter, articleList] = entries[0];

    const li = document.createElement('li');
    li.className = 'ala-mb ala-pb row';

    const nameDiv = document.createElement('div');
    nameDiv.className = 'ala-width ala-height ala-radius ala-size name';
    nameDiv.id = firstLetter;
    nameDiv.textContent = firstLetter;
    li.appendChild(nameDiv);

    const valDiv = document.createElement('div');
    valDiv.className = 'val col-lg-10';

    const sectionRow = document.createElement('div');
    sectionRow.className = 'row';

    if (Array.isArray(articleList) && articleList.length > 0) {
      articleList.forEach(article => {
        const section = document.createElement('section');
        section.className = 'col-6 col-lg-3 px-3';

        const inner = document.createElement('div');
        inner.className = 'd-flex align-items-center innderDivWrap';

        const a = document.createElement('a');
        a.className = 'ala-size section-val';
        a.textContent = article.name;
        a.href = article.address;
        a.style.display = 'flex';
        a.style.alignItems = 'center';
        a.style.textDecoration = 'none';

        const img = document.createElement('img');
        img.className = 'ala-width ala-height';
        img.src = blogAsset('img/common/blog-right-black.png');
        img.style.marginLeft = '8px';
        img.alt = '';
        img.style.cursor = 'pointer';

        a.appendChild(img);
        inner.appendChild(a);
        section.appendChild(inner);
        sectionRow.appendChild(section);
      });
    } else {
      const empty = document.createElement('section');
      empty.className = 'col-12 text-muted';
      empty.textContent = 'none';
      sectionRow.appendChild(empty);
    }

    valDiv.appendChild(sectionRow);
    li.appendChild(valDiv);
    ul.appendChild(li);
  });

  container.appendChild(ul);
}

function createLetterNav(keys) {
  const container = document.querySelector('.blog-swiper-contailer');
  if (!container) return;

  container.innerHTML = '';

  keys.forEach(letter => {
    const a = document.createElement('a');
    a.className = 'ala-size ala-pr ala-pl ala-width ala-height ala-radius blog-tag-slide swiper-slide';
    a.href = '#' + letter;
    a.textContent = letter;
    a.title = letter;
    a.style.cssText = `
      display: flex;
      align-items: center;
      justify-content: center;
      text-decoration: none;
    `;
    a.addEventListener('click', function (e) {
      document.querySelectorAll('.blog-swiper-contailer a').forEach(el => {
        el.classList.remove('active');
      });
      this.classList.add('active');
    });
    container.appendChild(a);
  });

  if (window.swiper3) {
    swiper3.destroy(true, true);
  }
  window.swiper3 = new Swiper(".blog-tag-wrap", {
    slidesPerView: 'auto',
    spaceBetween: 16,
    loop: false,
    observer: true,
    observeParents: true,
    navigation: {
      nextEl: ".blog-tag-navigtion-right",
      prevEl: ".blog-tag-navigtion-left",
      disabledClass: "blog-tag-navigtion-disabled",
    },
    on: {
      init: function () {

      },
      resize: function () {
        this.update();
      }
    }
  });
}

async function initArticleData() {
  const res = await appendArticles();
  const newArr = formatToNewArr(res);
  const sortedRes = sortResWithSpanishOrder(newArr);
  const keys = sortedRes.map(item => Object.keys(item)[0]);

  createLetterNav(keys);
  renderArticleGroups(sortedRes);

  setTimeout(() => {
    const hash = location.hash.substring(1);
    if (hash) {
      const target = document.getElementById(hash);
      if (target) {
        target.scrollIntoView({ behavior: 'smooth' });
      }
    }
  }, 500);
}

document.addEventListener('DOMContentLoaded', function () {
  initArticleData();
});
