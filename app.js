// Preloader lifecycle. It starts immediately from a small head script to avoid a flash of page content.
// It stays only until the hero image + fonts are ready (min 0.8s so the bar can finish, max 3s).
const preloader = document.querySelector(".preloader");
let preloaderReleased = false;

const releasePreloader = () => {
    if (!preloader || preloaderReleased) return;
    preloaderReleased = true;

    const minimumDisplayTime = window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 150 : 800;
    const remainingTime = Math.max(0, minimumDisplayTime - performance.now()); // ms since the page started loading

    window.setTimeout(() => {
        preloader.classList.add("is-leaving");
        document.documentElement.classList.remove("preloader-active");

        window.setTimeout(() => {
            preloader.classList.add("is-hidden");
            preloader.setAttribute("aria-hidden", "true");

            // Build layout-sensitive Flip animations only after scroll locking is removed.
            initializeBentoGallery();
            window.requestAnimationFrame(() => {
                if (typeof ScrollTrigger !== "undefined") ScrollTrigger.refresh();
            });
        }, window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 220 : 620);
    }, remainingTime);
};

if (preloader) {
    const heroImg = document.querySelector(".hero-model");
    const heroReady = heroImg && !heroImg.complete
        ? new Promise((resolve) => {
            heroImg.addEventListener("load", resolve, { once: true });
            heroImg.addEventListener("error", resolve, { once: true });
        })
        : Promise.resolve();
    Promise.all([heroReady, document.fonts ? document.fonts.ready : null]).then(releasePreloader);
    window.addEventListener("load", releasePreloader, { once: true });
    window.setTimeout(releasePreloader, 3000);
} else {
    document.documentElement.classList.remove("preloader-active");
}

// Register ScrollTrigger. Do not pause GSAP globally: Flip needs an active timeline
// while it captures and restores the bento gallery's grid states.
gsap.registerPlugin(ScrollTrigger);

// Initialize Lenis Smooth Scroll (Studio Freight Lenis)
let lenis;
if (typeof Lenis !== "undefined") {
    lenis = new Lenis({
        duration: 1.2,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        smoothWheel: true,
        touchMultiplier: 1.5,
    });

    // Synchronize Lenis scroll position with GSAP ScrollTrigger
    lenis.on("scroll", ScrollTrigger.update);

    gsap.ticker.add((time) => {
        lenis.raf(time * 1000);
    });

    gsap.ticker.lagSmoothing(0);
}

// Navbar Load Animation
gsap.from(".navbar", {
    y: -100,
    opacity: 0,
    duration: 1,
    ease: "power3.out",
    delay: 0.2
});

// Hero Section Timeline ("GRIP THE WORLD")
const heroTl = gsap.timeline({ defaults: { ease: "power3.out" } });

heroTl.from(".hero-model", {
    y: 90,
    opacity: 0,
    duration: 1.15,
    delay: 0.3
})
.from(".hero-title", {
    y: -40,
    opacity: 0,
    duration: 1
}, "-=0.75")
.from(".hero .btn-explore", {
    opacity: 0,
    duration: 0.7
}, "-=0.5");

// Statement Section Scroll Animation
gsap.from(".statement-text", {
    scrollTrigger: {
        trigger: ".brand-statement",
        start: "top 80%",
    },
    x: -50,
    opacity: 0,
    duration: 1,
    ease: "power3.out"
});

gsap.from(".statement-visual", {
    scrollTrigger: {
        trigger: ".brand-statement",
        start: "top 80%",
    },
    x: 50,
    opacity: 0,
    duration: 1,
    ease: "power3.out",
    delay: 0.2
});

// Product Cards Stagger Animation
gsap.from(".product-card", {
    scrollTrigger: {
        trigger: ".product-lines",
        start: "top 75%",
    },
    y: 50,
    opacity: 0,
    duration: 0.8,
    stagger: 0.2,
    ease: "power2.out"
});

// Tech Cards Scroll Animation (If present)
if (document.querySelector(".tech-section")) {
    gsap.from(".tech-card", {
        scrollTrigger: {
            trigger: ".tech-section",
            start: "top 70%",
        },
        scale: 0.9,
        opacity: 0,
        duration: 0.8,
        stagger: 0.15,
        ease: "power2.out"
    });
}

// Rider Wall Scroll Animation (If present)
if (document.querySelector(".rider-wall")) {
    gsap.from(".rider-card", {
        scrollTrigger: {
            trigger: ".rider-wall",
            start: "top 80%",
        },
        y: 40,
        opacity: 0,
        duration: 0.8,
        stagger: 0.1,
        ease: "power2.out"
    });
}

// Gallery Bento Section Animation (Flip is only loaded on pages that use the gallery)
const hasFlipPlugin = typeof Flip !== "undefined";
if (hasFlipPlugin) gsap.registerPlugin(Flip);

let flipCtx;
let lastWidth = window.innerWidth;

const createTween = () => {
  if (!hasFlipPlugin) return;
  let galleryElement = document.querySelector("#gallery-8");
  if (!galleryElement) return;
  let galleryItems = galleryElement.querySelectorAll(".gallery__item");

  flipCtx && flipCtx.revert();
  galleryElement.classList.remove("gallery--final");

  flipCtx = gsap.context(() => {
    // Temporarily add the final class to capture the final state
    galleryElement.classList.add("gallery--final");
    const flipState = Flip.getState(galleryItems);
    galleryElement.classList.remove("gallery--final");

    const flip = Flip.to(flipState, {
      simple: true,
      ease: "expoScale(1, 5)"
    });

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: galleryElement,
        start: "center center",
        end: "+=100%",
        scrub: true,
        pin: galleryElement.parentNode
      }
    });
    tl.add(flip);
    return () => gsap.set(galleryItems, { clearProps: "all" });
  });
};

let bentoGalleryInitialized = false;

function initializeBentoGallery() {
  if (bentoGalleryInitialized || !hasFlipPlugin || !document.querySelector("#gallery-8")) return;
  bentoGalleryInitialized = true;
  lastWidth = window.innerWidth;
  createTween();
}

// Without a preloader, preserve the normal page-load initialization path.
// With one, releasePreloader() initializes the gallery after overflow is restored.
if (!preloader) {
  if (document.readyState === "complete") {
    initializeBentoGallery();
  } else {
    window.addEventListener("load", initializeBentoGallery, { once: true });
  }
}

// Debounced resize event listener to prevent layout thrashing
let resizeTimer;
window.addEventListener("resize", () => {
  if (!bentoGalleryInitialized) return;
  if (window.innerWidth === lastWidth) return;
  lastWidth = window.innerWidth;
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(() => {
    createTween();
    ScrollTrigger.refresh();
  }, 150);
});

// Navbar Scroll Logic: Sticky at top, transparent over hero, turns black when scrolling down
const navbar = document.querySelector(".navbar");

if (lenis) {
    lenis.on("scroll", (e) => {
        if (navbar) {
            if (e.scroll > 50) {
                navbar.classList.add("scrolled");
            } else {
                navbar.classList.remove("scrolled");
            }
        }
    });
} else if (navbar) {
    window.addEventListener("scroll", () => {
        if (window.scrollY > 50) {
            navbar.classList.add("scrolled");
        } else {
            navbar.classList.remove("scrolled");
        }
    });
}

// ============================================================
// SELECTED WORK — render helmet-style notch grid
// Source: Sanity CMS (sanity-config.js) → falls back to products.js
// ============================================================
async function loadWorkProducts() {
    if (!document.getElementById("work-grid")) return null; // pages without the grid
    const cfg = window.GG_SANITY;
    if (!cfg || !cfg.projectId || cfg.projectId === "PASTE_PROJECT_ID") return null;
    try {
        const res = await fetch(window.GG_productsQueryURL(cfg), { cache: "no-cache" }); // always check for fresh CMS edits
        if (!res.ok) throw new Error(`Sanity responded ${res.status}`);
        const { result } = await res.json();
        if (!Array.isArray(result) || result.length === 0) return null;
        return window.GG_sizeSanityImages(result);
    } catch (err) {
        console.warn("Sanity products unavailable:", err);
        return null;
    }
}

loadWorkProducts().then(renderWorkGrid);

// items = fresh products from Sanity, or null if Sanity could not be reached.
// On null we keep the cards the build already wrote into the page (if any),
// otherwise fall back to products.js.
function renderWorkGrid(items) {
    const grid = document.getElementById("work-grid");
    if (!grid) return;

    if (items) {
        grid.innerHTML = window.GG_workCardsHTML(items);
    } else if (!grid.querySelector(".hg-item")) {
        const fallback = Array.isArray(window.GG_PRODUCTS) ? window.GG_PRODUCTS : [];
        grid.innerHTML = window.GG_workCardsHTML(fallback);
    }

    const cards = grid.querySelectorAll(".hg-item");

    if (typeof gsap !== "undefined" && typeof ScrollTrigger !== "undefined") {
        cards.forEach((el) => {
            el.classList.remove("hg-reveal");           // GSAP now controls the reveal
            gsap.set(el, { opacity: 0, y: 48 });
            gsap.to(el, {
                opacity: 1,
                y: 0,
                duration: 0.7,
                ease: "power3.out",
                scrollTrigger: { trigger: el, start: "top 90%" },
                onComplete: () => gsap.set(el, { clearProps: "transform" }), // let CSS :hover lift work
            });
        });
        if (typeof ScrollTrigger !== "undefined") ScrollTrigger.refresh();
    } else {
        cards.forEach((el) => el.classList.remove("hg-reveal")); // no GSAP: just show them
    }
}

// Back to Top Button
const footerToTop = document.querySelector(".footer-to-top");
if (footerToTop) {
    footerToTop.addEventListener("click", () => {
        if (lenis) {
            lenis.scrollTo(0, { duration: 1.2 });
        } else {
            window.scrollTo({ top: 0, behavior: "smooth" });
        }
    });
}
