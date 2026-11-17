/* City detail page JavaScript */
let swiper2;
let currentPage = 1;
let isLoading = false;

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

function appendArticles() {
  if (isLoading) return;
  isLoading = true;

  const params = {
    pageSize: 9,
    page: currentPage,
    channel: window.channelAlias,
    orderBy: "modified_desc",
  };

  blogRequest("/article/page", { params })
    .then(function (response) {
      isLoading = false;
      $('.more-articles-container .appendArticlesButton').toggle(!response.data.last);
      if (response.data.content && response.data.content.length > 0) {
        let articleList = $("<ul>").addClass("list-unstyled ala-mr ala-ml ala-mt blog-article-wrap");

        response.data.content.forEach((article) => {
          let listItem = $("<li class='ala-radius ala-mb row-gap-10 blog-article-section'>").addClass("col-lg-4 col-12").css("cursor", "pointer").data("url", article.url);

          let cardDiv = $("<div>").addClass("ala-padding ala-radius ala-radius innerDiv");

          let name = $("<h4>").addClass("ala-height ala-lh ala-pr ala-pl ala-mb ala-mt ala-size card-tag").text(article.channel.paths[1].name);

          let title = $("<a>")
            .addClass("card-title")
            .attr("href", article.url)
            .text(article.title);

          let desc = $("<div>").addClass("ala-height ala-lh ala-pr ala-pl ala-mb ala-mt ala-size card-desc").text(article.seoDescription);

          let formattedDate = alaUtils.convertDateFormat(article.modified);
          let dateSpan = $("<div>").addClass("ala-height ala-lh ala-pr ala-pl ala-mb ala-mt ala-size card-date").text(formattedDate);

          let imgContainer = $("<div>").addClass("ala-height ala-radius blog-article-img");
          if (article.customs && (article.compressedImage || article.image)) {
            let img = $("<img loading='lazy' decoding='async'>").attr("src", article.compressedImage || article.image).attr("alt", article.title);
            imgContainer.append(img);
          }

          cardDiv
            .append(imgContainer)
            .append(name)
            .append(title)
            .append(desc)
            .append(dateSpan);

          listItem.append(cardDiv);

          name.click(function () {
            window.location.href = article.channel.paths[1].url;
          });

          imgContainer.click(function () {
            window.location.href = article.url;
          });

          desc.click(function () {
            window.location.href = article.url;
          });

          dateSpan.click(function () {
            window.location.href = article.url;
          });

          articleList.append(listItem);
        });

        $("#cityDetailList").append(articleList);
        currentPage++;
      } else {
        $(".more-articles-container").hide();
        $("#noMoreTips").show();
      }
    })
    .catch(function (error) {
      isLoading = false;
    });
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
  appendArticles();
  document.querySelectorAll('.cityNameContainer').forEach(container => {
    container.textContent = window.channelName;
  });
  renderNearbyCities().catch(() => {
    document.querySelector('#nearbyCities')?.remove();
  });
});
