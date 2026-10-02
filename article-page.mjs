// Blog pages, built by build.mjs from the Sanity "article" documents:
//   articlePage()   → /blog/<slug>/
//   blogIndexPage() → /blog/
// Same shell as the glove pages (nav, footer, preloader and head assets come from connect.html).

const esc = (s) => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

const CATEGORY = {
  mtb: ['MTB gloves', '/mtb-gloves/'],
  bmx: ['BMX gloves', '/bmx-gloves/'],
  mx: ['MX gloves', '/mx-gloves/'],
  gym: ['Gym gloves', '/gym-gloves/'],
  ski: ['Ski gloves', '/ski-gloves/'],
}

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
// '2026-10-06' → '6 October 2026' (cut from the string, so no timezone can shift the day)
const longDate = (iso) => (iso ? `${Number(iso.slice(8, 10))} ${MONTHS[Number(iso.slice(5, 7)) - 1]} ${iso.slice(0, 4)}` : '')

const sanityImg = (url, w) => (url ? `${url}?w=${w}&fit=max&auto=format` : '')

// ---------- Portable Text (Sanity rich text) → HTML ----------
function spans(block) {
  const links = Object.fromEntries((block.markDefs || []).filter((d) => d._type === 'link').map((d) => [d._key, d.href]))
  return (block.children || []).map((child) => {
    let html = esc(child.text).replace(/\n/g, '<br>')
    for (const mark of child.marks || []) {
      if (mark === 'strong') html = `<strong>${html}</strong>`
      else if (mark === 'em') html = `<em>${html}</em>`
      else if (mark === 'code') html = `<code>${html}</code>`
      else if (links[mark]) {
        const href = links[mark]
        const external = /^https?:\/\//.test(href) && !href.includes('glovesgalore.net')
        html = `<a href="${esc(href)}"${external ? ' target="_blank" rel="noopener"' : ''}>${html}</a>`
      }
    }
    return html
  }).join('')
}

export function portableTextToHTML(body = []) {
  const out = []
  let list = null // the list we are inside: 'ul' | 'ol'
  const closeList = () => { if (list) { out.push(`</${list}>`); list = null } }
  for (const block of body) {
    if (block._type === 'image') {
      closeList()
      if (!block.url) continue
      out.push(`<figure class="article-figure"><img src="${esc(sanityImg(block.url, 1400))}" alt="${esc(block.alt || '')}" loading="lazy" decoding="async">${block.alt ? `<figcaption>${esc(block.alt)}</figcaption>` : ''}</figure>`)
      continue
    }
    if (block._type !== 'block') continue
    if (block.listItem) {
      const tag = block.listItem === 'number' ? 'ol' : 'ul'
      if (list !== tag) { closeList(); out.push(`<${tag}>`); list = tag }
      out.push(`<li>${spans(block)}</li>`)
      continue
    }
    closeList()
    const inner = spans(block)
    if (!inner.trim()) continue
    const tag = {h2: 'h2', h3: 'h3', blockquote: 'blockquote'}[block.style] || 'p'
    out.push(`<${tag}>${inner}</${tag}>`)
  }
  closeList()
  return out.join('\n')
}

const plainText = (body = []) => body.filter((b) => b._type === 'block').map((b) => (b.children || []).map((c) => c.text).join('')).join(' ')

// ---------- shared shell ----------
function shell({title, description, canonical, ogImage, ogType, jsonLd, headAssets, preloader, nav, footer, main}) {
  return `<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${esc(title)}</title>
    <meta name="description" content="${esc(description)}">
    <meta name="theme-color" content="#0D0D0D">
    <link rel="canonical" href="${canonical}">
    <meta property="og:type" content="${ogType}">
    <meta property="og:site_name" content="Gloves Galore">
    <meta property="og:title" content="${esc(title)}">
    <meta property="og:description" content="${esc(description)}">
    <meta property="og:url" content="${canonical}">
    ${ogImage ? `<meta property="og:image" content="${esc(ogImage)}">\n    ` : ''}<meta name="twitter:card" content="summary_large_image">
${jsonLd.map((o) => `    <script type="application/ld+json">${JSON.stringify(o)}</script>`).join('\n')}
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
${main}
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

const ctaBlock = (heading, text) => `
                <div class="cat-cta">
                    <div>
                        <h3>${esc(heading)}</h3>
                        <p>${esc(text)}</p>
                    </div>
                    <div class="cat-cta-actions">
                        <a class="btn-explore" href="/connect/">Get a free sample <span class="material-symbols-outlined" aria-hidden="true">arrow_forward</span></a>
                        <a class="btn-primary" href="mailto:connect@glovesgalore.net">Email us</a>
                    </div>
                </div>`

const publisher = (siteUrl) => ({
  '@type': 'Organization',
  name: 'Gloves Galore',
  url: siteUrl + '/',
  logo: {'@type': 'ImageObject', url: siteUrl + '/assets/logo.png'},
})

// ---------- one article ----------
export function articlePage({article, others, siteUrl, nav, footer, headAssets, preloader}) {
  const url = `${siteUrl}/blog/${article.slug}/`
  const author = article.author || 'Gloves Galore'
  const words = plainText(article.body).split(/\s+/).filter(Boolean).length
  const minutes = Math.max(1, Math.round(words / 220))
  const cover = sanityImg(article.cover, 1600)
  const updated = article.updatedAt && article.updatedAt > article.publishedAt ? article.updatedAt : ''
  const cat = CATEGORY[article.category]
  const faq = (article.faq || []).filter((x) => x.q && x.a)

  const jsonLd = [
    {
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: article.title,
      description: article.description,
      image: cover ? [sanityImg(article.cover, 1200)] : undefined,
      datePublished: article.publishedAt,
      dateModified: updated || article.publishedAt,
      author: article.author ? {'@type': 'Person', name: article.author.split(',')[0].trim(), worksFor: {'@type': 'Organization', name: 'Gloves Galore'}} : publisher(siteUrl),
      publisher: publisher(siteUrl),
      mainEntityOfPage: url,
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        {'@type': 'ListItem', position: 1, name: 'Home', item: siteUrl + '/'},
        {'@type': 'ListItem', position: 2, name: 'Blog', item: siteUrl + '/blog/'},
        {'@type': 'ListItem', position: 3, name: article.title, item: url},
      ],
    },
  ]
  if (faq.length) {
    jsonLd.push({
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: faq.map((x) => ({'@type': 'Question', name: x.q, acceptedAnswer: {'@type': 'Answer', text: x.a}})),
    })
  }

  const faqHTML = faq.length ? `
        <section class="cat-section cat-section--alt">
            <div class="cat-shell cat-shell--narrow">
                <h2 class="cat-h2">QUICK <span class="outline-text">ANSWERS</span></h2>
                <div class="cat-faq">${faq.map((x) => `
                    <details class="cat-faq-item">
                        <summary><h3>${esc(x.q)}</h3><span class="cat-faq-icon" aria-hidden="true"></span></summary>
                        <p>${esc(x.a)}</p>
                    </details>`).join('')}
                </div>
            </div>
        </section>` : ''

  const moreHTML = others.length ? `
                <h2 class="cat-h2">MORE FROM THE <span class="outline-text">BLOG</span></h2>
                <div class="blog-list">${others.map((a) => card(a)).join('')}
                </div>` : ''

  const main = `        <article>
            <section class="article-hero">
                <div class="cat-shell cat-shell--narrow">
                    <p class="product-breadcrumb"><a href="/">Home</a> <span aria-hidden="true">/</span> <a href="/blog/">Blog</a></p>
                    <h1 class="article-title">${esc(article.title)}</h1>
                    <p class="article-meta">By ${esc(author)} <span aria-hidden="true">·</span> <time datetime="${esc(article.publishedAt)}">${longDate(article.publishedAt)}</time>${updated ? ` <span aria-hidden="true">·</span> Updated <time datetime="${esc(updated)}">${longDate(updated)}</time>` : ''} <span aria-hidden="true">·</span> ${minutes} min read</p>
                </div>
                ${cover ? `<figure class="article-cover"><img src="${esc(cover)}" alt="${esc(article.coverAlt || '')}" fetchpriority="high" decoding="async"></figure>` : ''}
            </section>

            <section class="cat-section">
                <div class="cat-shell cat-shell--narrow article-body">
${portableTextToHTML(article.body)}
                </div>
            </section>
${faqHTML}
        </article>

        <section class="cat-section">
            <div class="cat-shell">
${moreHTML}
                <div class="cat-links">
                    ${cat ? `<a class="cat-link" href="${cat[1]}">${cat[0]}</a>` : ''}
                    <a class="cat-link" href="/blog/">All articles</a>
                    <a class="cat-link" href="/about/">About us</a>
                </div>${ctaBlock('Want to see your glove as a sample?', 'Send us the idea and the quantity. No minimum order, no design fee, and the first sample is on us.')}
            </div>
        </section>`

  return shell({
    title: `${article.title} | Gloves Galore`,
    description: article.description,
    canonical: url,
    ogImage: cover ? sanityImg(article.cover, 1200) : `${siteUrl}/assets/og-image.jpg`,
    ogType: 'article',
    jsonLd, headAssets, preloader, nav, footer, main,
  })
}

// the first cards on /blog/ sit in view on load, so they skip lazy loading
function card(a, i = 99) {
  return `
                    <a class="blog-card" href="/blog/${a.slug}/">
                        ${a.cover ? `<img src="${esc(sanityImg(a.cover, 800))}" alt="${esc(a.coverAlt || '')}"${i < 3 ? '' : ' loading="lazy"'} decoding="async">` : ''}
                        <span class="blog-card-date">${longDate(a.publishedAt)}</span>
                        <h3>${esc(a.title)}</h3>
                        <p>${esc(a.description)}</p>
                    </a>`
}

// ---------- /blog/ ----------
export function blogIndexPage({articles, siteUrl, nav, footer, headAssets, preloader}) {
  const url = `${siteUrl}/blog/`
  const description = 'Guides for brands, teams and shops making their own gloves: prices, materials, samples, sizing and how production works, from our workshop in Sialkot.'
  const jsonLd = [
    {
      '@context': 'https://schema.org',
      '@type': 'Blog',
      name: 'Gloves Galore Blog',
      url,
      description,
      publisher: publisher(siteUrl),
      blogPost: articles.map((a) => ({'@type': 'BlogPosting', headline: a.title, url: `${siteUrl}/blog/${a.slug}/`, datePublished: a.publishedAt})),
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        {'@type': 'ListItem', position: 1, name: 'Home', item: siteUrl + '/'},
        {'@type': 'ListItem', position: 2, name: 'Blog', item: url},
      ],
    },
  ]
  const main = `        <section class="article-hero">
            <div class="cat-shell">
                <p class="product-breadcrumb"><a href="/">Home</a> <span aria-hidden="true">/</span> Blog</p>
                <h1 class="article-title">THE GLOVE <span class="outline-text">BLOG</span></h1>
                <p class="article-lead">${esc(description)}</p>
            </div>
        </section>

        <section class="cat-section">
            <div class="cat-shell">
                <div class="blog-list">${articles.map((a, i) => card(a, i)).join('')}
                </div>${ctaBlock('Have a glove in mind?', 'Tell us what you ride, what you sell and how many you need. A real person replies.')}
            </div>
        </section>`
  return shell({
    title: 'Blog: Guides to Making Custom Gloves | Gloves Galore',
    description,
    canonical: url,
    ogImage: `${siteUrl}/assets/og-image.jpg`,
    ogType: 'website',
    jsonLd, headAssets, preloader, nav, footer, main,
  })
}
