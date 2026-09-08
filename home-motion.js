(() => {
  const motionPreference = window.matchMedia("(prefers-reduced-motion: reduce)");
  const heroImage = document.querySelector(".hero-photo img");

  if (heroImage) {
    let settled = false;
    const finishImage = () => {
      if (settled) return;
      settled = true;
      heroImage.classList.remove("is-image-loading");
      if (!motionPreference.matches && heroImage.naturalWidth > 0) {
        heroImage.classList.add("is-image-ready");
      }
    };
    const revealDecodedImage = () => {
      if (heroImage.decode) heroImage.decode().catch(() => {}).then(finishImage);
      else finishImage();
    };

    // Cached images may already be on screen when this deferred script arrives.
    if (!heroImage.complete) {
      heroImage.classList.add("is-image-loading");
      heroImage.addEventListener("load", revealDecodedImage, { once: true });
      heroImage.addEventListener("error", finishImage, { once: true });
      // A stalled image must never hold the content or navigation behind a loader.
      window.setTimeout(() => {
        settled = true;
        heroImage.classList.remove("is-image-loading");
      }, 2500);
    }
  }

  if (motionPreference.matches || !("IntersectionObserver" in window)) return;

  const targets = [...document.querySelectorAll(
    ".faq-header h2, .faq-tabs, .faq-item, .faq-help-prompt"
  )];
  const pending = new Set();
  let observer;

  const reveal = (target, delay = 0) => {
    if (!pending.delete(target)) return;
    observer.unobserve(target);
    target.style.setProperty("--entry-delay", `${delay}ms`);
    target.classList.replace("is-reveal-pending", "is-reveal-visible");
    // Drop animation layers after each one-time reveal.
    window.setTimeout(() => {
      target.classList.remove("is-reveal-visible");
      target.style.removeProperty("--entry-delay");
    }, 700 + delay);
  };

  try {
    observer = new IntersectionObserver((entries) => {
      entries.filter((entry) => entry.isIntersecting)
        .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)
        .forEach((entry, index) => reveal(entry.target, Math.min(index, 2) * 80));
    }, { rootMargin: "0px 0px -24px 0px", threshold: 0 });

    targets.forEach((target) => {
      // Deep links, scroll restoration and late scripts must not hide visible content.
      if (target.getBoundingClientRect().top <= window.innerHeight) return;
      pending.add(target);
      target.classList.add("is-reveal-pending");
      observer.observe(target);
    });
  } catch {
    observer?.disconnect();
    targets.forEach((target) => target.classList.remove("is-reveal-pending"));
    return;
  }

  document.addEventListener("focusin", (event) => {
    const target = event.target.closest(".is-reveal-pending");
    if (target) reveal(target);
  });

  motionPreference.addEventListener("change", (event) => {
    if (event.matches) [...pending].forEach((target) => reveal(target));
  });

  window.addEventListener("pageshow", (event) => {
    if (event.persisted) [...pending].forEach((target) => reveal(target));
  });
})();
