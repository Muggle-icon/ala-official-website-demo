// Blog page JavaScript
// This file contains all the JavaScript extracted from channel_blog.html

// Global variables
let swiper4;
let currentPage = 1;
let isLoading = false;
let pageSize = 6;
let currentTagData = null;

// Initialize mobile swiper
function initMobileSwiper() {
  swiper4 = new Swiper("#blog-swiper1-mobile", {
    autoplay: { delay: 1000000, disableOnInteraction: false },
    loop: true,
    slidesPerView: 'auto',
    centeredSlides: true,
    observer: true,
    observeParents: true,
    navigation: {
      nextEl: ".mobile-blog-swiper1-navigtion-right",
      prevEl: ".mobile-blog-swiper1-navigtion-left",
      disabledClass: "mobile-blog-swiper1-navigtion-isabled",
    }
  });
}

// Initialize Swiper instances on document ready
$(document).ready(function () {
  window.swiper2 = new Swiper(".swiper-menu-wrap", {
    centeredSlides: false,
    slidesPerView: "auto",
    loop: false,
    freeMode: {
      momentum: true,
      sticky: true,
    },
    observer: true,
    observeParents: true,
    on: {
      init: function () {
        this.update();
      },
      resize: function () {
        this.update();
      },
    },
  });

  var swiper3 = new Swiper(".blog-tag-wrap", {
    slidesPerView: "auto",
    spaceBetween: 24,
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
        this.update();
      },
      resize: function () {
        this.update();
      },
    },
  });

  new Swiper("#mobileBlogMenuSwiper", {
    slidesPerView: 'auto',
    centeredSlides: true,
  });
});

// Append top articles function
function appendArticles() {
  const params = {
    pageSize: 50,
    channel: 'loan_blog,loan_guide,loan_financiero,financial_news,loan_city',
    page: 1,
    orderBy: 'modified_desc',
  };

  blogRequest('/article/page', { params }).then(function (response) {
    if (response.data.content && response.data.content.length > 0) {
      let topArticles = response.data.content.filter(item =>
        item.customs &&
        item.customs.article_recommend_typeKey === 'main_recommend_article'
      );
      let secArticles = response.data.content.filter(item =>
        item.customs &&
        item.customs.article_recommend_typeKey === 'secondary_recommend_article'
      );

      if (topArticles.length > 0) {
        const topArticleContainer = document.getElementById('top-article-container');
        const mobileTopArticleContainer = document.getElementById('mobile-top-article-container');

        const topArticle = topArticles[0];

        const wrap = document.createElement('div');
        const mobileWrap = document.createElement('div');
        wrap.className = 'ala-width ala-padding ala-radius ala-mt ala-gap ala-ml ala-mr top-article-wrap';

        const left = document.createElement('div');
        left.classList.add('top-article-left');
        left.classList.add('ala-width');

        const tag = document.createElement('a');
        tag.classList.add('top-article-tag');
        tag.textContent = topArticle.channel.paths[1].name || '';
        tag.href = topArticle.channel.paths[1].url;

        const mobileTag = document.createElement('a');
        mobileTag.classList.add('mobile-top-article-tag');
        mobileTag.textContent = topArticle.channel.paths[1].name || '';
        mobileTag.href = topArticle.channel.paths[1].url;

        const title = document.createElement('a');
        title.classList.add('top-article-title');
        title.textContent = topArticle.title;
        title.href = topArticle.url;

        const mobileTitle = document.createElement('a');
        mobileTitle.classList.add('mobile-top-article-title');
        mobileTitle.textContent = topArticle.title;
        mobileTitle.href = topArticle.url;

        const desc = document.createElement('div');
        desc.classList.add('top-articles-desc');
        desc.textContent = topArticle.description;
        desc.addEventListener('click', function () {
          window.location.href = topArticle.url;
        });

        const mobileDesc = document.createElement('div');
        mobileDesc.classList.add('mobile-top-article-desc');
        mobileDesc.textContent = topArticle.description;
        mobileDesc.addEventListener('click', function () {
          window.location.href = topArticle.url;
        });

        const time = document.createElement('div');
        time.classList.add('top-article-time');
        time.textContent = alaUtils.convertDateFormat(topArticle.modified);
        time.addEventListener('click', function () {
          window.location.href = topArticle.url;
        });

        const authorContainer = document.createElement('div');
        authorContainer.className = 'top-article-author';
        authorContainer.addEventListener('click', function () {
          window.location.href = topArticle.url;
        });

        const authorLeft = document.createElement('div');
        authorLeft.className = 'top-article-author-left';

        if (topArticle.authorInfo?.image) {
          const authorAvatar = document.createElement('img');
          authorAvatar.className = 'top-article-author-avatar';
          authorAvatar.src = topArticle.authorInfo.image;
          authorAvatar.alt = topArticle.authorInfo.title || 'Autor';
          authorLeft.appendChild(authorAvatar);
        }

        const authorName = document.createElement('span');
        authorName.className = 'top-article-author-name';
        authorName.textContent = topArticle.authorInfo?.title || topArticle.customs?.check_autor || '';
        authorLeft.appendChild(authorName);

        authorContainer.appendChild(authorLeft);
        authorContainer.appendChild(time);

        const mobileTime = document.createElement('div');
        mobileTime.classList.add('mobile-top-article-time');
        mobileTime.textContent = alaUtils.convertDateFormat(topArticle.modified);
        mobileTime.addEventListener('click', function () {
          window.location.href = topArticle.url;
        });

        left.appendChild(tag);
        left.appendChild(title);
        left.appendChild(desc);
        left.appendChild(authorContainer);

        const right = document.createElement('div');
        right.className = 'ala-width ala-height top-article-right';

        const mobileImgContainer = document.createElement('div');
        mobileImgContainer.className = "mobile-top-article-img";

        const img = document.createElement('img');
        img.loading = 'lazy';
        img.src = topArticle.compressedImage || topArticle.image;
        img.alt = topArticle.title;

        const mobileImg = document.createElement('img');
        mobileImg.src = topArticle.compressedImage || topArticle.image;
        mobileImg.alt = topArticle.title;

        right.appendChild(img);
        wrap.appendChild(left);
        wrap.appendChild(right);
        mobileImgContainer.appendChild(mobileImg);
        mobileWrap.appendChild(mobileImgContainer);
        mobileWrap.appendChild(mobileTag);
        mobileWrap.appendChild(mobileTitle);
        mobileWrap.appendChild(mobileDesc);

        const mobileAuthorContainer = document.createElement('div');
        mobileAuthorContainer.className = 'top-article-author';
        mobileAuthorContainer.addEventListener('click', function () {
          window.location.href = topArticle.url;
        });

        const mobileAuthorLeft = document.createElement('div');
        mobileAuthorLeft.className = 'top-article-author-left';

        if (topArticle.authorInfo?.image) {
          const mobileAuthorAvatar = document.createElement('img');
          mobileAuthorAvatar.className = 'top-article-author-avatar';
          mobileAuthorAvatar.src = topArticle.authorInfo.image;
          mobileAuthorAvatar.alt = topArticle.authorInfo.title || 'Autor';
          mobileAuthorLeft.appendChild(mobileAuthorAvatar);
        }

        const mobileAuthorName = document.createElement('span');
        mobileAuthorName.className = 'top-article-author-name';
        mobileAuthorName.textContent = topArticle.authorInfo?.title || topArticle.customs?.check_autor || '';
        mobileAuthorLeft.appendChild(mobileAuthorName);

        mobileAuthorContainer.appendChild(mobileAuthorLeft);
        mobileAuthorContainer.appendChild(mobileTime);
        mobileWrap.appendChild(mobileAuthorContainer);

        document.getElementById('top-article-container').appendChild(wrap);
        document.getElementById('mobile-top-article-container').appendChild(mobileWrap);
      }

      const swiperWrapper = document.querySelector('.swiper-article.swiper-wrapper');

      if (swiperWrapper && secArticles.length > 0) {
        const displayArticles = secArticles.slice(0, 4);

        displayArticles.forEach(article => {
          const slide = document.createElement('div');
          slide.className = 'swiper-article-item swiper-slide';

          const left = document.createElement('div');
          left.className = 'swiper-article-left';

          const tag = document.createElement('a');
          tag.className = 'swiper-article-tag';
          tag.textContent = article.channel.paths[1].name || '';
          tag.href = article.channel.paths[1].url;

          const title = document.createElement('a');
          title.className = 'swiper-article-title';
          title.textContent = article.title;
          title.href = article.url;

          const desc = document.createElement('div');
          desc.classList.add('swiper-articles-desc');
          desc.textContent = article.description;
          desc.addEventListener('click', function () {
            window.location.href = article.url;
          });

          const time = document.createElement('div');
          time.className = 'swiper-article-time';
          time.textContent = alaUtils.convertDateFormat(article.modified);
          time.addEventListener('click', function () {
            window.location.href = article.url;
          });

          const authorContainer = document.createElement('div');
          authorContainer.className = 'swiper-article-author';
          authorContainer.addEventListener('click', function () {
            window.location.href = article.url;
          });

          if (article.authorInfo?.image) {
            const authorAvatar = document.createElement('img');
            authorAvatar.className = 'swiper-article-author-avatar';
            authorAvatar.src = article.authorInfo.image;
            authorAvatar.alt = article.authorInfo.title || 'Autor';
            authorContainer.appendChild(authorAvatar);
          }

          const authorRight = document.createElement('div');
          authorRight.className = 'swiper-article-author-right';

          const authorName = document.createElement('span');
          authorName.className = 'swiper-article-author-name';
          authorName.textContent = article.authorInfo?.title || article.customs?.check_autor || '';
          authorRight.appendChild(authorName);
          authorRight.appendChild(time);

          authorContainer.appendChild(authorRight);

          left.appendChild(tag);
          left.appendChild(title);
          left.appendChild(desc);
          left.appendChild(authorContainer);

          const right = document.createElement('div');
          right.className = 'swiper-article-right';
          const img = document.createElement('img');
        img.loading = 'lazy';
          img.src = article?.compressedImage || article?.image || '';
          img.alt = article.title;
          img.className = 'ala-radius';
          right.appendChild(img);

          slide.appendChild(left);
          slide.appendChild(right);

          swiperWrapper.appendChild(slide);
        });

        // Initialize swiper after all slides are added
        window.swiper1blogpc = new Swiper(".swiper-article-wrap", {
          centeredSlides: true,
          initialSlide: 0,
          spaceBetween: 32,
          loop: true,
          autoplay: {
            delay: 5000,
            disableOnInteraction: false,
            waitForTransition: false
          },
          width: window.innerWidth * 0.4526,
          observer: true,
          observeParents: true,
          navigation: {
            nextEl: ".swiper-article-navigtion-right",
            prevEl: ".swiper-article-navigtion-left",
            disabledClass: "swiper-article-navigtion-isabled",
          },
          roundLengths: false,
          slidesPerGroup: 2,
          on: {
            init: function () {
              this.updateSize();
            },
            resize: function () {
              this.params.width = window.innerWidth * 0.4526;
              this.updateSize();
              this.update();
            },
          },
        });
      }

      const swipermobileWrapper = document.querySelector('#blog-swiper1-mobile .swiper-wrapper');

      if (swipermobileWrapper && secArticles.length > 0) {
        const displayArticles = secArticles.slice(0, 4);

        displayArticles.forEach(article => {
          const slide = document.createElement('div');
          slide.className = 'swiper-slide';

          const left = document.createElement('div');
          left.className = 'item-left';

          const tag = document.createElement('a');
          tag.className = 'sec-text-tag-mobile';
          tag.textContent = article.channel.paths[1].name || '';
          tag.href = article.channel.paths[1].url;

          const title = document.createElement('a');
          title.className = 'sec-text-title-mobile';
          title.textContent = article.title;
          title.href = article.url;

          const desc = document.createElement('div');
          desc.classList.add('sec-text-desc-mobile');
          desc.textContent = article.description;
          desc.addEventListener('click', function () {
            window.location.href = article.url;
          });

          const time = document.createElement('div');
          time.className = 'sec-text-time-mobile';
          time.textContent = alaUtils.convertDateFormat(article.modified);
          time.addEventListener('click', function () {
            window.location.href = article.url;
          });

          const authorContainer = document.createElement('div');
          authorContainer.className = 'swiper-article-author';
          authorContainer.addEventListener('click', function () {
            window.location.href = article.url;
          });

          if (article.authorInfo?.image) {
            const authorAvatar = document.createElement('img');
            authorAvatar.className = 'swiper-article-author-avatar';
            authorAvatar.src = article.authorInfo.image;
            authorAvatar.alt = article.authorInfo.title || 'Autor';
            authorContainer.appendChild(authorAvatar);
          }

          const authorRight = document.createElement('div');
          authorRight.className = 'swiper-article-author-right';

          const authorName = document.createElement('span');
          authorName.className = 'swiper-article-author-name';
          authorName.textContent = article.authorInfo?.title || article.customs?.check_autor || '';
          authorRight.appendChild(authorName);
          authorRight.appendChild(time);

          authorContainer.appendChild(authorRight);

          left.appendChild(tag);
          left.appendChild(title);
          left.appendChild(desc);
          left.appendChild(authorContainer);

          const right = document.createElement('div');
          right.className = 'item-right';
          const img = document.createElement('img');
        img.loading = 'lazy';
          img.src = article?.compressedImage || article?.image || '';
          img.alt = article.title;
          right.appendChild(img);

          slide.appendChild(left);
          slide.appendChild(right);

          swipermobileWrapper.appendChild(slide);
        });

        // Update mobile swiper after all slides are added
        if (swiper4) {
          setTimeout(() => {
            swiper4.update();
            swiper4.autoplay.start();
          }, 100);
        }
      }
    }
  }).catch(function (error) {
  });
}

// Get active tag data
function getActiveTagData() {
  const activeTag = document.querySelector(".blog-tag-slide.tagActive");
  if (activeTag) {
    const nameEl = activeTag.querySelector(".blog-tag-name");
    const tagName = nameEl ? nameEl.textContent.trim() : "";
    const tagId = nameEl ? nameEl.getAttribute("data-tagId") : null;
    return { tagName, tagId };
  }
  return { tagName: "Todo", tagId: "Todo" };
}

// Render articles
function renderArticles(articles) {
  const container = $('#blogList');

  if (currentPage === 1) {
    container.empty();
  }

  if (!articles || articles.length === 0) {
    if (currentPage === 1) {
      container.append('<p class="text-center">No hay artículos.</p>');
    }

    $('.more-articles-container').hide();
    $('#noMoreTips').show();
    return;
  }

  let articleList = $('<ul>').addClass('row list-unstyled');

  articles.forEach((article, index) => {

    let listItem = $('<li>')
      .addClass('col-lg-4 col-12 ala-mb row-gap-10')
      .css('cursor', 'pointer');

    let cardDiv = $('<div>')
      .addClass('ala-padding ala-radius innerDiv');

    let name = $('<a>')
      .addClass('ala-mb ala-height ala-lh ala-pl ala-pr ala-mt ala-size card-title')
      .text(article.channel && article.channel.paths ? article.channel.paths[1].name : '')
      .attr('href', article.channel.paths[1].url);

    let seoDescription = $('<a>')
      .addClass('ala-mb ala-height ala-lh ala-size card-headline')
      .text(article.title || '')
      .attr('href', article.url);

    let desc = $('<div>')
      .addClass('ala-mb ala-height ala-lh ala-size ala-mt article-desc')
      .text(article.seoDescription || '')
      .data('url', article.url);

    let imgContainer = $('<div>').addClass('ala-height blog-article-img ala-radius');
    if (article.customs && (article.compressedImage || article.image)) {
      let img = $('<img loading="lazy" decoding="async">')
        .attr('src', article.compressedImage || article.image)
        .attr('alt', article.title);
      imgContainer.append(img);
      imgContainer.data('url', article.url);
    }

    let authorContainer = $('<div>')
      .addClass('list-article-author')
      .data('url', article.url);

    if (article.authorInfo?.image) {
      let authorAvatar = $('<img>')
        .addClass('list-article-author-avatar')
        .attr('src', article.authorInfo.image)
        .attr('alt', article.authorInfo.title || 'Autor');
      authorContainer.append(authorAvatar);
    }

    let authorRight = $('<div>')
      .addClass('list-article-author-right');

    let authorName = $('<span>')
      .addClass('list-article-author-name')
      .text(article.authorInfo?.title || article.customs?.check_autor || '');
    authorRight.append(authorName);

    let formattedDate = alaUtils.convertDateFormat(article.modified);
    let dateSpan = $('<div>')
      .addClass('ala-size ala-lh card-date')
      .text(formattedDate);
    authorRight.append(dateSpan);
    authorContainer.append(authorRight);

    authorContainer.on('click', function () {
      window.location.href = $(this).data('url');
    });

    cardDiv.append(imgContainer)
      .append(name)
      .append(seoDescription)
      .append(desc)
      .append(authorContainer);

    listItem.append(cardDiv);

    desc.on('click', function () {
      window.location.href = $(this).data('url');
    });

    dateSpan.on('click', function () {
      window.location.href = $(this).data('url');
    });

    imgContainer.on('click', function () {
      window.location.href = $(this).data('url');
    });

    articleList.append(listItem);
  });

  container.append(articleList);

  const hasLessThanPageSize = articles.length < pageSize;

//  if (hasLessThanPageSize) {
//    $('.more-articles-container').hide();
//    $('#noMoreTips').show();
//  } else {
//    $('.appendArticlesButton').show();
//    $('#noMoreTips').hide();
//  }
}

// Load articles
function loadArticles() {
  if (isLoading) {
    return;
  }
  isLoading = true;

  currentTagData = getActiveTagData();

  let params = {
    pageSize: pageSize,
    page: currentPage,
    channel: 'loan_blog,loan_guide,loan_financiero,financial_news,loan_city',
    orderBy: 'modified_desc'
  };

  if (currentTagData.tagId !== "Todo") {
    params.tagId = currentTagData.tagId;
  }

  blogRequest('/article/page', { params })
    .then(function (response) {
      isLoading = false;
      const data = response.data;
      const articles = data.content || [];
      $('.more-articles-container').toggle(!data.last);
      renderArticles(articles);
    })
    .catch(function (error) {
      isLoading = false;
      if (currentPage === 1) {
        $('#blogList').html('<p class="text-center"></p>');
      }
      $('.more-articles-container').hide();
      $('#noMoreTips').show();
    });
}

// Make loadMoreArticles available globally for "load more" button
window.loadMoreArticles = function () {
  if (isLoading) return;

  currentPage++;
  loadArticles();
};

// Render PC menu
function renderPcMenu(channels) {
  const container = document.querySelector('.blog-menu-wrap');
  if (!container) {
    return;
  }

  container.innerHTML = '';

  [...channels].forEach((channel, ind) => {
    const slide = document.createElement('a');
    slide.className = 'ala-padding blog-menu-item swiper-slide ala-radius';
    if (channel.nav) {
      slide.href = channel.dynamicUrl;
    }

    const imgIndex = (ind % channels.length) + 1;
    const logoNormal = document.createElement('div');
    logoNormal.className = 'ala-height blog-menu-channel-logo';
    const imgNormal = document.createElement('img');
    imgNormal.src = blogFiles + '/img/blog-channel-' + imgIndex + '.webp';

    logoNormal.appendChild(imgNormal);

    const logoHover = document.createElement('div');
    logoHover.className = 'ala-height blog-menu-channel-logo channel-logo-hover';
    const imgHover = document.createElement('img');
    imgHover.src = blogFiles + '/img/blog-channel-active-' + imgIndex + '.webp';

    logoHover.appendChild(imgHover);

    const title = document.createElement('div');
    title.className = 'ala-size ala-lh ala-mt blog-menu-channel-title';
    title.textContent = channel.title;

    const desc = document.createElement('div');
    desc.className = 'ala-size ala-lh ala-mt blog-menu-channel-des';
    desc.textContent = channel.customs?.channel_desc || '';

    slide.appendChild(logoNormal);
    slide.appendChild(logoHover);
    slide.appendChild(title);
    slide.appendChild(desc);

    container.appendChild(slide);
  });

  if (window.swiper2) {
    window.swiper2.destroy(true, true);
  }
  window.swiper2 = new Swiper(".swiper-menu-wrap", {
    centeredSlides: false,
    slidesPerView: "auto",
    loop: false,
    freeMode: {
      momentum: true,
      sticky: true,
    },
    observer: true,
    observeParents: true,
  });
}

// Render mobile menu
function renderMobileMenu(channels) {
  const container = document.querySelector('#mobileBlogMenuSwiper .swiper-wrapper');
  if (!container) {
    return;
  }

  container.innerHTML = '';

  channels.forEach((channel, ind) => {
    const slide = document.createElement('a');
    slide.className = 'mobile-blog-menu-item swiper-slide';
    if (channel.nav) {
      slide.href = channel.dynamicUrl;
    }

    const logoNormal = document.createElement('div');
    logoNormal.className = 'mobile-blog-menu-channel-logo blog-menu-channel-logo';
    const imgNormal = document.createElement('img');
    imgNormal.src = blogFiles + '/img/blog-channel-' + (ind + 1) + '.webp';
    logoNormal.appendChild(imgNormal);

    const logoHover = document.createElement('div');
    logoHover.className = 'mobile-blog-menu-channel-logo channel-logo-hover blog-menu-channel-logo';
    const imgHover = document.createElement('img');
    imgHover.src = blogFiles + '/img/blog-channel-active-' + (ind + 1) + '.webp';
    logoHover.appendChild(imgHover);

    const title = document.createElement('div');
    title.className = 'mobile-blog-menu-channel-title';
    title.textContent = channel.title;

    const desc = document.createElement('div');
    desc.className = 'mobile-blog-menu-channel-des';
    desc.textContent = channel.customs?.channel_desc || '';

    slide.appendChild(logoNormal);
    slide.appendChild(logoHover);
    slide.appendChild(title);
    slide.appendChild(desc);

    container.appendChild(slide);
  });

  if (window.mobileBlogSwiper) {
    window.mobileBlogSwiper.destroy(true, true);
  }
  window.mobileBlogSwiper = new Swiper("#mobileBlogMenuSwiper", {
    slidesPerView: 'auto',
    centeredSlides: true,
    observer: true,
    observeParents: true,
  });
}

// Get blog menu list
function getBlogMenuList() {
  const params = {
    limit: 50,
    parent: 'loan_blog'
  };

  blogRequest('/channel', { params })
    .then(function (response) {
      const channels = response.data;

      renderPcMenu(channels);
      renderMobileMenu(channels);
    })
    .catch(function (error) {
    });
}

// Initialize on DOM content loaded
document.addEventListener('DOMContentLoaded', function () {
  initMobileSwiper();

  appendArticles();

  const tags = document.querySelectorAll(".blog-tag-slide");
  if (tags.length > 0) {
    tags[0].classList.add("tagActive");
    tags.forEach((tag, index) => tag.setAttribute("aria-pressed", String(index === 0)));
  }

  tags.forEach(function (tag) {
    tag.addEventListener("click", function () {
      tags.forEach(t => t.classList.remove("tagActive"));
      this.classList.add("tagActive");
      tags.forEach(t => t.setAttribute("aria-pressed", String(t === this)));

      currentPage = 1;

      $('.appendArticlesButton').show();
      $('#noMoreTips').hide();

      loadArticles();
    });
  });

  loadArticles();

  getBlogMenuList();
});
