const LANG_SCROLL_KEY = "hummus-lang-scroll";

const restoreLanguageScroll = () => {
  try {
    const savedScroll = sessionStorage.getItem(LANG_SCROLL_KEY);
    if (savedScroll === null) {
      return;
    }

    const y = Number.parseInt(savedScroll, 10);
    if (!Number.isFinite(y)) {
      sessionStorage.removeItem(LANG_SCROLL_KEY);
      return;
    }

    history.scrollRestoration = "manual";
    document.documentElement.classList.add("is-restoring-scroll");
    const maxScroll = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
    window.scrollTo({
      top: Math.min(Math.max(0, y), maxScroll),
      left: 0,
      behavior: "instant",
    });
  } catch (error) {
    // sessionStorage may be unavailable
  }
};

restoreLanguageScroll();
requestAnimationFrame(restoreLanguageScroll);
window.addEventListener(
  "load",
  () => {
    restoreLanguageScroll();
    try {
      sessionStorage.removeItem(LANG_SCROLL_KEY);
    } catch (error) {
      // sessionStorage may be unavailable
    }
    document.documentElement.classList.remove("is-restoring-scroll");
  },
  { once: true }
);

document.querySelectorAll(".lang-toggle a.lang-option:not(.is-active)").forEach((link) => {
  link.addEventListener("click", () => {
    try {
      sessionStorage.setItem(LANG_SCROLL_KEY, String(Math.round(window.scrollY)));
    } catch (error) {
      // sessionStorage may be unavailable
    }
  });
});

const menuToggle = document.querySelector(".menu-toggle");
const mainNav = document.querySelector(".main-nav");
const navbarShell = document.querySelector(".navbar-shell");
const navbarBar = document.querySelector(".navbar-bar");
const yearElement = document.querySelector("#year");

if (yearElement) {
  yearElement.textContent = new Date().getFullYear();
}

const readHeaderMetrics = () => {
  const rowHeight = navbarBar ? navbarBar.getBoundingClientRect().height : 0;
  const navHeight = mainNav ? mainNav.scrollHeight : 0;
  const viewportHeight = window.innerHeight;
  const navIsOpen = Boolean(mainNav?.classList.contains("is-open"));
  return { rowHeight, navHeight, viewportHeight, navIsOpen };
};

const applyHeaderMetrics = (
  { rowHeight, navHeight, viewportHeight, navIsOpen },
  { includeOpenHeight = false } = {}
) => {
  const safeSpacing = 24;
  document.documentElement.style.setProperty(
    "--anchor-scroll-offset",
    `${Math.ceil(rowHeight + safeSpacing)}px`
  );

  if (includeOpenHeight && navbarShell) {
    const openPadding = 28;
    const minOpenNav = Math.max(0, viewportHeight * 0.5 - rowHeight);
    const openNavHeight = navIsOpen
      ? navHeight
      : Math.max(navHeight + openPadding, minOpenNav);
    navbarShell.style.setProperty("--navbar-open-h", `${rowHeight + openNavHeight + 16}px`);
  }
};

if (menuToggle && mainNav) {
  menuToggle.addEventListener("click", () => {
    const isOpen = mainNav.classList.contains("is-open");

    if (!isOpen) {
      const headerMetrics = readHeaderMetrics();
      mainNav.classList.remove("is-closing");
      mainNav.classList.add("is-open");
      applyHeaderMetrics(headerMetrics, { includeOpenHeight: true });
      menuToggle.classList.add("is-active");
      navbarShell?.classList.add("is-open");
      menuToggle.setAttribute("aria-expanded", "true");
      return;
    }

    mainNav.classList.add("is-closing");
    mainNav.classList.remove("is-open");
    menuToggle.classList.remove("is-active");
    navbarShell?.classList.remove("is-open");
    menuToggle.setAttribute("aria-expanded", "false");
  });

  mainNav.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      mainNav.classList.add("is-closing");
      mainNav.classList.remove("is-open");
      menuToggle.classList.remove("is-active");
      navbarShell?.classList.remove("is-open");
      menuToggle.setAttribute("aria-expanded", "false");
    });
  });
}

const readCarouselShifts = () => {
  const shifts = [];

  document.querySelectorAll(".pre-menu-carousel-track").forEach((track) => {
    const firstGroup = track.querySelector(".pre-menu-carousel-group");
    if (!firstGroup) {
      return;
    }

    shifts.push({
      track,
      width: firstGroup.offsetWidth,
    });
  });

  return shifts;
};

const applyCarouselShifts = (shifts) => {
  shifts.forEach(({ track, width }) => {
    track.style.setProperty("--carousel-shift", `${width}px`);
  });
};

const syncLayoutMetrics = () => {
  const headerMetrics = navbarBar ? readHeaderMetrics() : null;
  const carouselShifts = readCarouselShifts();

  if (headerMetrics) {
    applyHeaderMetrics(headerMetrics, {
      includeOpenHeight: Boolean(mainNav?.classList.contains("is-open")),
    });
  }

  applyCarouselShifts(carouselShifts);
};

syncLayoutMetrics();
window.addEventListener("resize", syncLayoutMetrics);

const menuCategories = document.querySelectorAll(".menu-category");

const animateOpen = (category) => {
  if (category.dataset.animating === "true") {
    return;
  }

  category.dataset.animating = "true";
  category.dataset.closing = "false";
  category.style.overflow = "hidden";

  const startHeight = category.offsetHeight;
  category.open = true;
  const endHeight = category.offsetHeight;

  category.animate(
    {
      height: [`${startHeight}px`, `${endHeight}px`],
    },
    {
      duration: 640,
      easing: "cubic-bezier(0.22, 1, 0.36, 1)",
    }
  ).onfinish = () => {
    category.style.height = "";
    category.style.overflow = "";
    category.dataset.animating = "false";
    category.dataset.closing = "false";
  };
};

const animateClose = (category) => {
  if (category.dataset.animating === "true" || !category.open) {
    return;
  }

  category.dataset.animating = "true";
  category.dataset.closing = "true";
  category.style.overflow = "hidden";

  const startHeight = category.offsetHeight;
  const endHeight = category.querySelector("summary").offsetHeight;

  category.animate(
    {
      height: [`${startHeight}px`, `${endHeight}px`],
    },
    {
      duration: 520,
      easing: "cubic-bezier(0.4, 0, 0.2, 1)",
    }
  ).onfinish = () => {
    category.open = false;
    category.style.height = "";
    category.style.overflow = "";
    category.dataset.animating = "false";
    category.dataset.closing = "false";
  };
};

menuCategories.forEach((category) => {
  const summary = category.querySelector("summary");
  if (!summary) {
    return;
  }

  summary.addEventListener("click", (event) => {
    event.preventDefault();

    if (category.open) {
      animateClose(category);
      return;
    }

    menuCategories.forEach((otherCategory) => {
      if (otherCategory !== category) {
        animateClose(otherCategory);
      }
    });

    animateOpen(category);
  });
});

const lightboxSources = document.querySelectorAll(".pre-menu-carousel-track img, .about-visual img, .catering-visual img");

if (lightboxSources.length) {
  const isEnglish = document.documentElement.lang === "en";
  const lightbox = document.createElement("div");
  lightbox.className = "lightbox";
  lightbox.setAttribute("role", "dialog");
  lightbox.setAttribute("aria-modal", "true");
  lightbox.setAttribute("aria-label", isEnglish ? "Photo preview" : "Podgląd zdjęcia");
  lightbox.hidden = true;
  lightbox.innerHTML = `
    <button type="button" class="lightbox-close" aria-label="${isEnglish ? "Close" : "Zamknij"}">&times;</button>
    <img alt="" />
  `;
  document.body.appendChild(lightbox);

  const lightboxImage = lightbox.querySelector("img");
  const lightboxClose = lightbox.querySelector(".lightbox-close");

  const openLightbox = (image) => {
    lightboxImage.alt = image.alt || (isEnglish ? "Dish photo" : "Zdjęcie dania");
    lightboxImage.sizes = "min(100vw, 1200px)";
    lightboxImage.srcset = image.getAttribute("srcset") || "";
    lightboxImage.src = image.getAttribute("src") || image.currentSrc || image.src;
    lightbox.hidden = false;
    lightbox.classList.add("is-open");
    document.body.classList.add("lightbox-open");
    lightboxClose.focus();
  };

  const closeLightbox = () => {
    lightbox.classList.remove("is-open");
    lightbox.hidden = true;
    document.body.classList.remove("lightbox-open");
    lightboxImage.removeAttribute("src");
    lightboxImage.removeAttribute("srcset");
    lightboxImage.removeAttribute("sizes");
  };

  lightboxSources.forEach((image) => {
    const isDecorative = Boolean(image.closest("[aria-hidden='true']"));
    if (!isDecorative) {
      image.setAttribute("tabindex", "0");
      image.setAttribute("role", "button");
      image.addEventListener("keydown", (event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          openLightbox(image);
        }
      });
    }

    image.addEventListener("click", () => openLightbox(image));
  });

  lightboxClose.addEventListener("click", closeLightbox);
  lightbox.addEventListener("click", (event) => {
    if (event.target === lightbox) {
      closeLightbox();
    }
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && lightbox.classList.contains("is-open")) {
      closeLightbox();
    }
  });
}
