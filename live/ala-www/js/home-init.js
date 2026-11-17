window.onload = function () {
  new Swiper(".swiper-container", {
    centeredSlides: true,
    initialSlide: 0,
    loop: false,
    width: 456,
    observer: true,
    observeParents: true,
    roundLengths: true,
    navigation: {
      nextEl: ".swiper1-navigtion-left",
      prevEl: ".swiper1-navigtion-right",
      disabledClass: "swiper1-navigtion-isabled",
    },
    on: {
      init: function () {
        this.updateSize();
      },
      resize: function () {
        this.params.width = ((window.innerWidth - 100) * 0.8) / 3.4;
        this.updateSize();
        this.update();
      },
    },
  });
};

document.addEventListener("DOMContentLoaded", function () {
  const blogUrl = 'https://www.alaprestamo.com/channel/loan_blog';
  const googlePlayUrl = 'https://sofom-ala.onelink.me/uTdM/taq3lvd3';
  const appStoreUrl = 'https://sofom-ala.onelink.me/ndX5/mbzy0s0s';

  document.querySelectorAll('.gotoBlog').forEach(button => {
    button.addEventListener('click', () => window.location.assign(blogUrl));
  });
  document.querySelectorAll('.android-down').forEach(button => {
    button.addEventListener('click', () => window.open(googlePlayUrl, '_blank', 'noopener'));
  });
  document.querySelectorAll('.apple-down').forEach(button => {
    button.addEventListener('click', () => window.open(appStoreUrl, '_blank', 'noopener'));
  });

  const mobileEntry = $('#mobile-entry');
  const download = document.getElementById('mobile-download');
  const updateDownloadDock = () => {
    const bounds = download.getBoundingClientRect();
    const isVisible = bounds.bottom >= 56 && bounds.top <= window.innerHeight;
    const show = window.innerWidth < 992 && !isVisible;
    if (show !== mobileEntry.is(':visible')) {
      if (show) mobileEntry.stop(true, true).fadeIn();
      else mobileEntry.stop(true, true).fadeOut();
    }
  };
  mobileEntry.hide();
  window.addEventListener('scroll', updateDownloadDock, { passive: true });
  window.addEventListener('resize', updateDownloadDock);
});
