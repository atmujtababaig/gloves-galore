/* ============================================================
   SELECTED WORK — card markup + Sanity query (shared)
   Used by app.js in the browser AND by build.mjs, which writes
   the cards straight into index.html so search engines see them.
   ============================================================ */
(function (root) {
    // Bottom-right notch outline (same shape used by landonorris.com).
    // NOTCH_WIDE is the same cut moved left, used on small cards so the label fits.
    const NOTCH = "M8 1h390.89a7 7 0 0 1 7 7v356.983a7 7 0 0 1-7 7H263.329a23.999 23.999 0 0 0-18.766 9.038l-16.499 20.694A21.999 21.999 0 0 1 210.862 410H8a7 7 0 0 1-7-7V8a7 7 0 0 1 7-7Z";
    const NOTCH_WIDE = "M8 1h390.89a7 7 0 0 1 7 7v356.983a7 7 0 0 1-7 7H150a23.999 23.999 0 0 0-18.766 9.038l-16.499 20.694A21.999 21.999 0 0 1 97.533 410H8a7 7 0 0 1-7-7V8a7 7 0 0 1 7-7Z";

    const frame = (mod) => `<svg class="hg-border hg-border--${mod}" viewBox="0 0 407 411" preserveAspectRatio="none" aria-hidden="true"><path class="n-desk" d="${NOTCH}"/><path class="n-wide" d="${NOTCH_WIDE}"/></svg>`;

    // "Stealth Arrow" → "stealth-arrow": the folder each glove's own page lives in
    root.GG_slug = (name) => String(name || "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

    const esc = (s) => String(s == null ? "" : s).replace(/[&<>"]/g,
        (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

    // reveal = true adds the hidden start state that GSAP animates in
    root.GG_workCardsHTML = (items, { reveal = true } = {}) => items.map((p) => `
        <article class="hg-item${reveal ? " hg-reveal" : ""}">
            ${frame("base")}
            ${frame("lime")}
            <div class="hg-media${p.hoverImg ? " has-alt" : ""}">
                <img src="${esc(p.img)}" alt="${esc(p.name)} gloves by Gloves Galore" loading="lazy" decoding="async" width="900" height="900">
                ${p.hoverImg ? `<img class="hg-img-alt" src="${esc(p.hoverImg)}" alt="" aria-hidden="true" loading="lazy" decoding="async" width="900" height="900">` : ""}
            </div>
            <a class="hg-label" href="/gloves/${root.GG_slug(p.name)}/"><span class="hg-name">${esc(p.name)}</span><span class="hg-year">${esc(p.year)}</span></a>
        </article>`).join("");

    root.GG_productsQueryURL = (cfg) => {
        const query = `*[_type == "product" && defined(image.asset)] | order(order asc, _createdAt asc){
            name, year, "img": image.asset->url, "hoverImg": hoverImage.asset->url
        }`;
        return `https://${cfg.projectId}.apicdn.sanity.io/v${cfg.apiVersion}/data/query/${cfg.dataset}` +
            `?query=${encodeURIComponent(query)}`;
    };

    // Ask Sanity's image CDN for a web-sized, auto-format (WebP/AVIF) version
    root.GG_sizeSanityImages = (items) => {
        const sized = (u) => (u ? `${u}?w=900&auto=format` : null);
        return items.map((p) => ({ ...p, img: sized(p.img), hoverImg: sized(p.hoverImg) }));
    };
})(typeof window !== "undefined" ? window : globalThis);
