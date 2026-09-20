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

// "We build for" carousel: arrow buttons, mouse drag, progress bar
(function initLinesCarousel() {
    const track = document.getElementById("lines-carousel");
    if (!track) return;
    const section = track.closest(".product-lines");
    const prev = section.querySelector('.carousel-btn[data-dir="-1"]');
    const next = section.querySelector('.carousel-btn[data-dir="1"]');
    const fill = section.querySelector(".carousel-progress-fill");
    const cards = () => Array.from(track.querySelectorAll(".product-card"));

    // Lenis must not grab wheel/touch inside the track (horizontal trackpad swipes)
    track.setAttribute("data-lenis-prevent-wheel", "");

    const maxScroll = () => track.scrollWidth - track.clientWidth;

    // scrollLeft value that lines each card up with the track's left padding
    function cardStops(pad) {
        const base = track.getBoundingClientRect().left + pad - track.scrollLeft;
        return cards().map((c) => Math.min(maxScroll(), Math.round(c.getBoundingClientRect().left - base)));
    }

    function update() {
        const max = maxScroll();
        const x = track.scrollLeft;
        prev.disabled = x <= 2;
        next.disabled = x >= max - 2;
        const visible = track.clientWidth / track.scrollWidth;
        const progress = max > 0 ? x / max : 1;
        fill.style.transform = `scaleX(${visible + (1 - visible) * progress})`;
    }

    // Scroll to the next/previous card edge
    function step(dir) {
        const pad = parseFloat(getComputedStyle(track).paddingLeft) || 0;
        const x = track.scrollLeft;
        const lefts = cardStops(pad);
        let target;
        if (dir > 0) target = lefts.find((l) => l > x + 5);
        else target = [...lefts].reverse().find((l) => l < x - 5);
        if (target === undefined) target = dir > 0 ? maxScroll() : 0;
        track.scrollTo({ left: target, behavior: "smooth" });
    }

    prev.addEventListener("click", () => step(-1));
    next.addEventListener("click", () => step(1));

    track.addEventListener("keydown", (e) => {
        if (e.key === "ArrowRight") { e.preventDefault(); step(1); }
        if (e.key === "ArrowLeft") { e.preventDefault(); step(-1); }
    });

    // Mouse drag (touch devices scroll natively)
    let down = false, startX = 0, startScroll = 0, moved = false;
    track.addEventListener("pointerdown", (e) => {
        if (e.pointerType !== "mouse" || e.button !== 0) return;
        down = true; moved = false;
        startX = e.clientX; startScroll = track.scrollLeft;
    });
    window.addEventListener("pointermove", (e) => {
        if (!down) return;
        const dx = e.clientX - startX;
        if (!moved && Math.abs(dx) > 4) { moved = true; track.classList.add("is-dragging"); }
        if (moved) track.scrollLeft = startScroll - dx;
    });
    window.addEventListener("pointerup", () => {
        if (!down) return;
        down = false;
        if (!moved) return;
        track.classList.remove("is-dragging");
        // settle on the nearest card
        const pad = parseFloat(getComputedStyle(track).paddingLeft) || 0;
        const x = track.scrollLeft;
        const lefts = cardStops(pad).concat(maxScroll());
        const nearest = lefts.reduce((a, b) => (Math.abs(b - x) < Math.abs(a - x) ? b : a));
        track.scrollTo({ left: nearest, behavior: "smooth" });
    });
    // a drag must not trigger the CTA link
    track.addEventListener("click", (e) => { if (moved) { e.preventDefault(); e.stopPropagation(); moved = false; } }, true);

    track.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    window.addEventListener("load", update);
    update();
})();

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

// ── Product image viewer: click a glove photo to open it big and zoom in ──
(function initImageViewer() {
    const MAX = 5, MIN = 1;
    let box, img, stage, level, zoomIn, zoomOut, nameEl;
    let scale = 1, x = 0, y = 0, lastFocus = null;

    function build() {
        box = document.createElement("div");
        box.className = "gg-lb";
        box.setAttribute("role", "dialog");
        box.setAttribute("aria-modal", "true");
        box.setAttribute("aria-label", "Product photo");
        box.innerHTML = `
            <div class="gg-lb-bar">
                <span class="gg-lb-name"></span>
                <div class="gg-lb-tools">
                    <button type="button" class="gg-lb-btn" data-zoom="out" aria-label="Zoom out"><span class="material-symbols-outlined" aria-hidden="true">zoom_out</span></button>
                    <span class="gg-lb-level">100%</span>
                    <button type="button" class="gg-lb-btn" data-zoom="in" aria-label="Zoom in"><span class="material-symbols-outlined" aria-hidden="true">zoom_in</span></button>
                    <button type="button" class="gg-lb-btn" data-close aria-label="Close"><span class="material-symbols-outlined" aria-hidden="true">close</span></button>
                </div>
            </div>
            <div class="gg-lb-stage"><img class="gg-lb-img" alt=""></div>
            <p class="gg-lb-hint">Scroll or pinch to zoom · drag to move · Esc to close</p>`;
        document.body.appendChild(box);
        img = box.querySelector(".gg-lb-img");
        stage = box.querySelector(".gg-lb-stage");
        level = box.querySelector(".gg-lb-level");
        nameEl = box.querySelector(".gg-lb-name");
        zoomIn = box.querySelector('[data-zoom="in"]');
        zoomOut = box.querySelector('[data-zoom="out"]');

        box.querySelector("[data-close]").addEventListener("click", close);
        zoomIn.addEventListener("click", () => zoomBy(1.5));
        zoomOut.addEventListener("click", () => zoomBy(1 / 1.5));
        stage.addEventListener("click", (e) => { if (e.target === stage) close(); });
        stage.addEventListener("dblclick", (e) => { e.preventDefault(); scale > 1 ? reset() : zoomBy(2.5); });
        stage.addEventListener("wheel", (e) => { e.preventDefault(); zoomBy(e.deltaY < 0 ? 1.15 : 1 / 1.15); }, { passive: false });
        document.addEventListener("keydown", (e) => {
            if (!box.classList.contains("is-open")) return;
            if (e.key === "Escape") close();
            if (e.key === "+" || e.key === "=") zoomBy(1.5);
            if (e.key === "-") zoomBy(1 / 1.5);
        });
        dragAndPinch();
    }

    function apply() {
        const limit = Math.max(0, (scale - 1) * 260);
        x = Math.max(-limit, Math.min(limit, x));
        y = Math.max(-limit, Math.min(limit, y));
        img.style.transform = `translate(${x}px, ${y}px) scale(${scale})`;
        level.textContent = `${Math.round(scale * 100)}%`;
        stage.classList.toggle("is-zoomed", scale > 1);
        zoomIn.disabled = scale >= MAX - 0.01;
        zoomOut.disabled = scale <= MIN + 0.01;
    }

    function zoomBy(factor) {
        scale = Math.min(MAX, Math.max(MIN, scale * factor));
        if (scale === 1) { x = 0; y = 0; }
        apply();
    }

    function reset() { scale = 1; x = 0; y = 0; apply(); }

    // mouse/finger drag to move a zoomed photo, two fingers to pinch
    function dragAndPinch() {
        let dragging = false, startX = 0, startY = 0, ox = 0, oy = 0;
        let pinchStart = 0, pinchScale = 1;
        const dist = (t) => Math.hypot(t[0].clientX - t[1].clientX, t[0].clientY - t[1].clientY);

        stage.addEventListener("pointerdown", (e) => {
            if (scale <= 1 || e.pointerType === "touch") return;
            dragging = true; startX = e.clientX; startY = e.clientY; ox = x; oy = y;
            stage.classList.add("is-panning");
            stage.setPointerCapture(e.pointerId);
        });
        stage.addEventListener("pointermove", (e) => {
            if (!dragging) return;
            x = ox + (e.clientX - startX); y = oy + (e.clientY - startY); apply();
        });
        const endDrag = () => { dragging = false; stage.classList.remove("is-panning"); };
        stage.addEventListener("pointerup", endDrag);
        stage.addEventListener("pointercancel", endDrag);

        stage.addEventListener("touchstart", (e) => {
            if (e.touches.length === 2) { pinchStart = dist(e.touches); pinchScale = scale; }
            else if (e.touches.length === 1 && scale > 1) {
                dragging = true; startX = e.touches[0].clientX; startY = e.touches[0].clientY; ox = x; oy = y;
            }
        }, { passive: true });
        stage.addEventListener("touchmove", (e) => {
            if (e.touches.length === 2 && pinchStart) {
                e.preventDefault();
                scale = Math.min(MAX, Math.max(MIN, pinchScale * (dist(e.touches) / pinchStart)));
                if (scale === 1) { x = 0; y = 0; }
                apply();
            } else if (dragging && e.touches.length === 1) {
                e.preventDefault();
                x = ox + (e.touches[0].clientX - startX);
                y = oy + (e.touches[0].clientY - startY);
                apply();
            }
        }, { passive: false });
        stage.addEventListener("touchend", (e) => { if (e.touches.length === 0) { pinchStart = 0; endDrag(); } }, { passive: true });
    }

    function open(src, alt, name) {
        if (!box) build();
        // Sanity serves the card at 900px wide; ask it for a bigger file to zoom into
        img.src = src.includes("w=900") ? src.replace("w=900", "w=1800") : src;
        img.alt = alt || name || "Product photo";
        nameEl.textContent = name || "";
        reset();
        box.classList.add("is-open");
        document.documentElement.style.overflow = "hidden";
        if (lenis) lenis.stop();
        box.querySelector("[data-close]").focus({ preventScroll: true });
    }

    function close() {
        box.classList.remove("is-open");
        document.documentElement.style.overflow = "";
        if (lenis) lenis.start();
        if (lastFocus) lastFocus.focus({ preventScroll: true });
    }

    // every product card on the site (home grid + category pages)
    document.addEventListener("click", (e) => {
        const media = e.target.closest(".hg-media");
        if (!media) return;
        const card = media.closest(".hg-item");
        const shown = media.querySelector(".hg-img-alt") && getComputedStyle(media.querySelector(".hg-img-alt")).opacity === "1"
            ? media.querySelector(".hg-img-alt")
            : media.querySelector("img");
        if (!shown) return;
        lastFocus = document.activeElement;
        open(shown.currentSrc || shown.src, shown.alt, card ? (card.querySelector(".hg-name") || {}).textContent : "");
    });
})();
