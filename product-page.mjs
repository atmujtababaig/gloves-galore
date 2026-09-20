// One page per glove, built from whatever is in Sanity (build.mjs calls this).
// The copy stays true to what we know: these are our own builds, and every part of
// them can be changed for a client. Nothing here invents specs for a specific glove.
const esc = (s) => String(s == null ? '' : s).replace(/[&<>"]/g, (c) => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;'}[c]))

const CHANGEABLE = [
  ['Colours', 'Any colourway you want, including matching your kit or team palette. Sublimation prints full colour with no extra cost per colour.'],
  ['Your branding', 'Your logo on the back of the hand, the cuff or the palm — printed, silicone-raised or embroidered. Ours never goes on.'],
  ['Palm material', 'Synthetic leather, microfibre or a lighter single-layer palm, with reinforcement where your riders wear gloves out.'],
  ['Grip and print', 'Silicone grip on the fingertips or across the palm, in any pattern, plus touchscreen thread on the index and thumb.'],
  ['Cut and cuff', 'Full-finger or half-finger, slip-on or a hook-and-loop cuff, and sizing graded to your own size chart.'],
  ['Packaging', 'Hang tags, polybags, boxes and barcode labels with your artwork, ready for a shelf.'],
]

const STEPS = [
  ['Tell us what to change', 'Point at this glove and tell us what should be different: colours, palm, print, cuff, sizes.'],
  ['We sample it', 'You get one pair built to that spec, free — the courier is the only thing you pay for.'],
  ['You approve it', 'Wear it, break it if you can, and tell us what to fix. We re-sample until it is right.'],
  ['Production', 'Every pair is checked against your approved sample, then packed in your branded packaging.'],
]

const abs = (src, siteUrl) => (src.startsWith('http') ? src : siteUrl + '/' + src.replace(/^\//, ''))

export function productPage({product, others, nav, footer, headAssets, preloader, siteUrl, slug}) {
  const name = product.name
  const title = name + ' Gloves | Custom Made by Gloves Galore'
  const description = name + ' — one of our own glove builds. Rebuilt in your colours, your materials and your branding, with free samples and no minimum order. Made in Sialkot, Pakistan.'
  const shots = [product.img, product.hoverImg].filter(Boolean)

  const gallery = shots.map((src, i) => `
                    <div class="product-shot${i === 0 ? ' is-first' : ''}">
                        <img src="${esc(src)}" alt="${esc(name)} gloves by Gloves Galore${i ? ', second angle' : ''}" width="900" height="900" ${i ? 'loading="lazy"' : 'fetchpriority="high"'} decoding="async">
                    </div>`).join('')

  const changeable = CHANGEABLE.map(([t, d]) => `
                    <li class="cat-spec">
                        <h3>${esc(t)}</h3>
                        <p>${esc(d)}</p>
                    </li>`).join('')

  const steps = STEPS.map(([t, d], i) => `
                    <li class="cat-step">
                        <span class="cat-step-num" aria-hidden="true">${String(i + 1).padStart(2, '0')}</span>
                        <h3>${esc(t)}</h3>
                        <p>${esc(d)}</p>
                    </li>`).join('')

  const more = others.map((o) => `
                    <a class="product-more-item" href="/gloves/${o.slug}/">
                        <img src="${esc(o.img)}" alt="${esc(o.name)} gloves by Gloves Galore" loading="lazy" decoding="async" width="900" height="900">
                        <span>${esc(o.name)}</span>
                    </a>`).join('')

  const jsonLd = JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: name + ' gloves',
    image: shots.map((s) => abs(s, siteUrl)),
    description,
    category: 'Sports gloves',
    url: siteUrl + '/gloves/' + slug + '/',
    brand: {'@type': 'Brand', name: 'Gloves Galore'},
    manufacturer: {
      '@type': 'Organization',
      name: 'Gloves Galore',
      url: siteUrl + '/',
      address: {'@type': 'PostalAddress', addressLocality: 'Sialkot', addressRegion: 'Punjab', addressCountry: 'PK'},
    },
  })

  const breadcrumb = JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {'@type': 'ListItem', position: 1, name: 'Home', item: siteUrl + '/'},
      {'@type': 'ListItem', position: 2, name: 'Gloves', item: siteUrl + '/#work'},
      {'@type': 'ListItem', position: 3, name: name + ' gloves', item: siteUrl + '/gloves/' + slug + '/'},
    ],
  })

  return `<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${esc(title)}</title>
    <meta name="description" content="${esc(description)}">
    <meta name="theme-color" content="#0D0D0D">
    <link rel="canonical" href="${siteUrl}/gloves/${slug}/">
    <meta property="og:type" content="website">
    <meta property="og:site_name" content="Gloves Galore">
    <meta property="og:title" content="${esc(title)}">
    <meta property="og:description" content="${esc(description)}">
    <meta property="og:url" content="${siteUrl}/gloves/${slug}/">
    <meta property="og:image" content="${esc(abs(shots[0], siteUrl))}">
    <meta name="twitter:card" content="summary_large_image">
    <script type="application/ld+json">${jsonLd}</script>
    <script type="application/ld+json">${breadcrumb}</script>
    <!-- favicon package from RealFaviconGenerator (files live in favicon/, build copies them to the site root) -->
    <link rel="icon" type="image/png" href="/favicon-96x96.png" sizes="96x96" />
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    <link rel="shortcut icon" href="/favicon.ico" />
    <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
    <link rel="manifest" href="/site.webmanifest" />
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
${headAssets}    <script>document.documentElement.classList.add('preloader-active');</script>
</head>

<body>
${preloader}
${nav}
    <main class="cat-page">
        <section class="product-hero">
            <div class="product-hero-inner">
                <div class="product-gallery">${gallery}
                </div>
                <div class="product-intro">
                    <p class="product-breadcrumb"><a href="/">Home</a> <span aria-hidden="true">/</span> <a href="/#work">Gloves</a></p>
                    <h1 class="product-title">${esc(name)}</h1>
                    <p class="product-tag">Our own build${product.year ? ' · ' + esc(product.year) : ''}</p>
                    <p class="product-lead">This is a glove we build ourselves. Every part of it — colour, palm, print, cuff, sizing, packaging — can be changed for your brand, and your logo is the only one that goes on the finished pair.</p>
                    <p class="product-lead">No minimum order: a team's worth of gloves is a real order here, and so is a full season's stock. Samples are free, you only pay the courier.</p>
                    <div class="cat-hero-actions product-actions">
                        <a class="btn-explore" href="/connect/">Get this in your colours <span class="material-symbols-outlined" aria-hidden="true">arrow_forward</span></a>
                        <a class="btn-primary" href="https://wa.me/923141632509" target="_blank" rel="noopener noreferrer">WhatsApp us</a>
                    </div>
                    <p class="product-hint">Click the photo to open it big and zoom in.</p>
                </div>
            </div>
        </section>

        <section class="cat-section cat-section--alt">
            <div class="cat-shell">
                <h2 class="cat-h2">WHAT YOU CAN CHANGE ON <span class="outline-text">THIS GLOVE</span></h2>
                <ul class="cat-specs">${changeable}
                </ul>
            </div>
        </section>

        <section class="cat-section">
            <div class="cat-shell">
                <h2 class="cat-h2">HOW ORDERING <span class="outline-text">WORKS</span></h2>
                <ol class="cat-steps">${steps}
                </ol>
            </div>
        </section>

        <section class="cat-section cat-section--alt">
            <div class="cat-shell">
                <h2 class="cat-h2">MORE FROM OUR <span class="outline-text">RANGE</span></h2>
                <div class="product-more">${more}
                </div>
                <div class="cat-links">
                    <a class="cat-link" href="/mtb-gloves/">MTB gloves</a>
                    <a class="cat-link" href="/bmx-gloves/">BMX gloves</a>
                    <a class="cat-link" href="/mx-gloves/">MX gloves</a>
                    <a class="cat-link" href="/gym-gloves/">Gym gloves</a>
                    <a class="cat-link" href="/ski-gloves/">Ski gloves</a>
                </div>
                <div class="cat-cta">
                    <div>
                        <h3>Want this pair with your logo?</h3>
                        <p>Tell us the colours and the quantity. A real person replies, and the first sample is on us.</p>
                    </div>
                    <div class="cat-cta-actions">
                        <a class="btn-explore" href="/connect/">Start your order <span class="material-symbols-outlined" aria-hidden="true">arrow_forward</span></a>
                        <a class="btn-primary" href="mailto:mujtababaig598@gmail.com">Email us</a>
                    </div>
                </div>
            </div>
        </section>
    </main>

${footer}
    <!-- GSAP Core & ScrollTrigger -->
    <script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/ScrollTrigger.min.js"></script>
    <!-- Lenis Smooth Scroll -->
    <script src="https://unpkg.com/lenis@1.1.18/dist/lenis.min.js"></script>
    <!-- Custom Scripts -->
    <script src="app.js"></script>
</body>

</html>
`
}
