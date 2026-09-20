// Builds the deployable site into dist/.
//   node build.mjs          (GitHub Actions runs this on every deploy)
//
// What it does, in order:
//   1. copies only the files the site actually uses
//   2. turns every PNG/JPG into a resized WebP and rewrites the references
//   3. writes the current Sanity products into index.html (search engines see them without JS)
//   4. fills in {{SITE_URL}}, business info (JSON-LD), sitemap.xml, robots.txt, 404.html
import {readFile, writeFile, mkdir, rm, copyFile, readdir} from 'node:fs/promises'
import {existsSync} from 'node:fs'
import path from 'node:path'
import vm from 'node:vm'
import {fileURLToPath} from 'node:url'
import {createHash} from 'node:crypto'
import sharp from 'sharp'
import {productPage} from './product-page.mjs'

const ROOT = path.dirname(fileURLToPath(import.meta.url))
const OUT = path.join(ROOT, 'dist')
const read = (f) => readFile(path.join(ROOT, f), 'utf8')
const warnings = []

const config = JSON.parse(await read('site.config.json'))
const SITE_URL = (config.customDomain ? `https://${config.customDomain}` : config.siteUrl).replace(/\/$/, '')
const PAGES = config.pages.map((p) => p.file) // every HTML page of the site (see site.config.json)
const TEXT_FILES = [
  ...PAGES, 'styles.css', 'app.js', 'forms.js',
  'grid-template.js', 'products.js', 'sanity-config.js',
]

// Runs one of the site's browser scripts and returns what it put on `window`
async function loadBrowserScript(file, win = {}) {
  vm.runInNewContext(await read(file), {window: win, globalThis: win, encodeURIComponent, console})
  return win
}

await rm(OUT, {recursive: true, force: true})
await mkdir(OUT, {recursive: true})

// ---------- 1. read text files ----------
const files = {}
for (const f of TEXT_FILES) files[f] = await read(f)

// ---------- 1b. fonts: self-host Google Fonts (no extra servers before first paint) ----------
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36'
const KEEP_SUBSETS = new Set(['latin', 'latin-ext'])
const fontCss = new Map() // google css url → local css
let heroFontFile = null
async function localFontCss(href) {
  if (fontCss.has(href)) return fontCss.get(href)
  let css = await (await fetch(href.replace(/&amp;/g, '&'), {headers: {'User-Agent': UA}})).text()
  if (!css.includes('@font-face')) throw new Error('unexpected Google Fonts response')
  // drop subsets for scripts the site never shows (cyrillic, greek, vietnamese…)
  css = css.replace(/\/\* ([\w-]+) \*\/\s*@font-face\s*\{[^}]*\}/g, (block, subset) => (KEEP_SUBSETS.has(subset) ? block : ''))
  for (const [, url] of css.matchAll(/url\((https:\/\/fonts\.gstatic\.com\/[^)]+)\)/g)) {
    const family = (url.match(/\/s\/([a-z0-9]+)\//) || url.match(/\/(icon)\//) || [, 'font'])[1]
    const file = `assets/fonts/${family}-${createHash('sha1').update(url).digest('hex').slice(0, 10)}.woff2`
    if (!existsSync(path.join(OUT, file))) {
      await mkdir(path.join(OUT, 'assets/fonts'), {recursive: true})
      await writeFile(path.join(OUT, file), Buffer.from(await (await fetch(url)).arrayBuffer()))
    }
    css = css.split(url).join(file)
  }
  const hero = css.match(/\/\* latin \*\/\s*@font-face\s*\{[^}]*Big Shoulders Display[^}]*font-weight: 900[^}]*url\(([^)]+)\)/)
  if (hero) heroFontFile = hero[1]
  css = css.replace(/\n\s*\n/g, '\n').trim()
  fontCss.set(href, css)
  return css
}
for (const page of PAGES) {
  let html = files[page]
  for (const m of [...html.matchAll(/<link\b[^>]*href="(https:\/\/fonts\.googleapis\.com\/css2\?[^"]+)"[^>]*>/g)]) {
    try {
      html = html.replace(m[0], `<style>${await localFontCss(m[1])}</style>`)
    } catch (err) {
      warnings.push(`kept Google Fonts link (${err.message})`)
    }
  }
  if (!html.includes('fonts.googleapis.com/css2')) {
    html = html.replace(/[ \t]*<link rel="preconnect" href="https:\/\/fonts\.(googleapis|gstatic)\.com"[^>]*>\r?\n/g, '')
    if (heroFontFile) {
      html = html.replace('<!-- Fonts -->', `<!-- Fonts -->\n    <link rel="preload" as="font" type="font/woff2" href="${heroFontFile}" crossorigin>`)
    }
  }
  files[page] = html
}

// ---------- 2. images ----------
const ASSET_RE = /["'(]((?:\.\/)?assets\/[^"'()<>]+?\.(?:png|jpe?g|webp|gif|svg|ico))["')]/gi
const used = new Set(config.images.keepOriginal.filter((f) => existsSync(path.join(ROOT, f))))
for (const text of Object.values(files)) for (const m of text.matchAll(ASSET_RE)) used.add(m[1].replace(/^\.\//, ''))

const maxWidthFor = (file) => {
  const rules = config.images.maxWidth
  if (rules[file]) return rules[file]
  const dir = Object.keys(rules).find((k) => k.endsWith('/') && file.startsWith(k))
  return dir ? rules[dir] : config.images.defaultMaxWidth
}

const renamed = {}
let before = 0, after = 0
for (const file of [...used].sort()) {
  const src = path.join(ROOT, file)
  if (!existsSync(src)) { warnings.push(`missing image referenced by the site: ${file}`); continue }
  const keep = config.images.keepOriginal.includes(file) || /\.(svg|gif|ico)$/i.test(file)
  const outFile = keep ? file : file.replace(/\.(png|jpe?g|webp)$/i, '.webp')
  await mkdir(path.dirname(path.join(OUT, outFile)), {recursive: true})
  const input = await readFile(src)
  before += input.length
  if (keep) {
    await copyFile(src, path.join(OUT, outFile))
    after += input.length
  } else {
    const out = await sharp(input)
      .resize({width: maxWidthFor(file), withoutEnlargement: true})
      .webp({quality: config.images.quality, alphaQuality: 90, effort: 5})
      .toBuffer()
    await writeFile(path.join(OUT, outFile), out)
    after += out.length
  }
  if (outFile !== file) renamed[file] = outFile
}
for (const [from, to] of Object.entries(renamed)) {
  for (const f of TEXT_FILES) files[f] = files[f].split(from).join(to)
}

// ---------- 3. products → static HTML ----------
const win = {}
await loadBrowserScript('grid-template.js', win)
await loadBrowserScript('sanity-config.js', win)
await loadBrowserScript('products.js', win)
let products = null
try {
  const res = await fetch(win.GG_productsQueryURL(win.GG_SANITY))
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  const {result} = await res.json()
  if (Array.isArray(result) && result.length) products = win.GG_sizeSanityImages(result)
} catch (err) {
  warnings.push(`Sanity unreachable (${err.message}); used products.js for the static grid`)
}
if (!products) {
  // products.js paths were already rewritten to .webp above; re-read them from the rewritten text
  const fallbackWin = {}
  vm.runInNewContext(files['products.js'], {window: fallbackWin})
  products = fallbackWin.GG_PRODUCTS
}
const EMPTY_GRID = '<div class="helmet-grid" id="work-grid" aria-live="polite"></div>'
if (!files['index.html'].includes(EMPTY_GRID)) warnings.push('could not find the empty #work-grid in index.html')
files['index.html'] = files['index.html'].replace(
  EMPTY_GRID,
  `<div class="helmet-grid" id="work-grid" aria-live="polite">${win.GG_workCardsHTML(products, {reveal: false})}\n        </div>`,
)

// category pages carry an empty grid too: <div class="helmet-grid" data-products="4" data-offset="2">
for (const page of PAGES) {
  files[page] = files[page].replace(/<div class="helmet-grid" data-products="(\d+)" data-offset="(\d+)"><\/div>/g, (_, n, off) => {
    const picked = Array.from({length: Math.min(Number(n), products.length)}, (_, i) => products[(Number(off) + i) % products.length])
    return `<div class="helmet-grid">${win.GG_workCardsHTML(picked, {reveal: false})}
            </div>`
  })
}

// ---------- 3b. one page per glove, straight from Sanity ----------
const connectSrc = files['connect.html']
const grab = (re, what) => {
  const m = connectSrc.match(re)
  if (!m) throw new Error(`could not find the ${what} in connect.html`)
  return m[0]
}
const navBlock = grab(/    <!-- Navbar -->[\s\S]*?    <!-- \/Navbar -->\r?\n/, 'navbar')
const footerBlock = grab(/    <!-- Contact Footer -->[\s\S]*?<\/footer>\r?\n/, 'footer')
const headBlock = grab(/    <!-- Fonts -->[\s\S]*?<link rel="stylesheet" href="styles\.css">\r?\n/, 'head assets')
const preloaderBlock = grab(/    <!-- Page Preloader -->[\s\S]*?\r?\n    <\/div>\r?\n/, 'preloader')

const withSlugs = products.map((p) => ({...p, slug: win.GG_slug(p.name)})).filter((p) => p.slug && p.img)
const productPaths = []
for (const [i, product] of withSlugs.entries()) {
  const others = [1, 2, 3, 4].map((n) => withSlugs[(i + n) % withSlugs.length]).filter((o) => o.slug !== product.slug)
  const file = `gloves/${product.slug}.html`
  files[file] = productPage({
    product, others, slug: product.slug, siteUrl: SITE_URL,
    nav: navBlock, footer: footerBlock, headAssets: headBlock, preloader: preloaderBlock,
  })
  PAGES.push(file)
  productPaths.push(`/gloves/${product.slug}/`)
}

// ---------- 4. SEO ----------
const b = config.business
const org = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: b.name,
  alternateName: b.alternateName?.length ? b.alternateName : undefined,
  url: `${SITE_URL}/`,
  logo: `${SITE_URL}/assets/logo.png`,
  description: b.description,
  email: b.email || undefined,
  telephone: b.phone || undefined,
  address: b.city || b.country
    ? {'@type': 'PostalAddress', addressLocality: b.city || undefined, addressRegion: b.region || undefined, addressCountry: b.country || undefined}
    : undefined,
  sameAs: b.socials?.length ? b.socials : undefined,
}
// WebSite = the name Google shows above the link in search results
const website = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: b.name,
  alternateName: b.alternateName?.length ? b.alternateName : undefined,
  url: `${SITE_URL}/`,
}
const jsonLd = [website, org].map((o) => `<script type="application/ld+json">${JSON.stringify(o)}</script>`).join('\n    ')
files['index.html'] = files['index.html'].replace('<!-- SEO:JSONLD -->', jsonLd)
for (const f of TEXT_FILES) files[f] = files[f].split('{{SITE_URL}}').join(SITE_URL)

// Cache-busting: styles.css → styles.css?v=<content hash>, so visitors get new CSS/JS right after a deploy
for (const f of TEXT_FILES.filter((f) => /\.(css|js)$/.test(f))) {
  const v = createHash('sha1').update(files[f]).digest('hex').slice(0, 8)
  for (const page of PAGES) {
    files[page] = files[page].split(`"${f}"`).join(`"${f}?v=${v}"`)
  }
}

// ---------- 4b. clean URLs: /connect/ instead of /connect.html ----------
// Pages move into their own folder. Every link (and every asset path, because the pages
// now sit one level deep) becomes root-relative, and the old .html address redirects.
const slugOf = (page) => page.replace(/\.html$/, '')
for (const page of PAGES) {
  let html = files[page]
  for (const other of PAGES) {
    if (other === 'index.html') continue
    const to = `/${slugOf(other)}/`
    html = html.split(`"${other}"`).join(`"${to}"`).split(`"${other}#`).join(`"${to}#`).split(`/${other}"`).join(`${to}"`)
  }
  html = html.split('"index.html"').join('"/"').split('"index.html#').join('"/#')
  html = html.replace(/(["'(])(assets\/)/g, '$1/$2').replace(/(["'])((?:styles\.css|app\.js|forms\.js)(?:\?v=[a-f0-9]+)?)\1/g, '$1/$2$1')
  files[page] = html
}

for (const [f, text] of Object.entries(files)) {
  if (!PAGES.includes(f) || f === 'index.html') {
    await writeFile(path.join(OUT, f), text)
    continue
  }
  const slug = slugOf(f)
  await mkdir(path.join(OUT, slug), {recursive: true})
  await writeFile(path.join(OUT, slug, 'index.html'), text)
  // the old address keeps working and points search engines at the new one
  await writeFile(path.join(OUT, f), `<!DOCTYPE html>
<html lang="en"><head><meta charset="utf-8"><title>Redirecting…</title>
<link rel="canonical" href="${SITE_URL}/${slug}/">
<meta name="robots" content="noindex">
<meta http-equiv="refresh" content="0; url=/${slug}/">
<script>location.replace("/${slug}/" + location.search + location.hash)</script>
</head><body><a href="/${slug}/">Continue to ${slug}</a></body></html>
`)
}

const today = new Date().toISOString().slice(0, 10)
await writeFile(path.join(OUT, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${config.pages.map((p) => `  <url><loc>${SITE_URL}${p.path === '/' ? '/' : '/' + p.file.replace(/\.html$/, '') + '/'}</loc><lastmod>${today}</lastmod><priority>${p.priority}</priority></url>`).join('\n')}
${productPaths.map((p) => `  <url><loc>${SITE_URL}${p}</loc><lastmod>${today}</lastmod><priority>0.6</priority></url>`).join('\n')}
</urlset>
`)
await writeFile(path.join(OUT, 'robots.txt'), `User-agent: *\nAllow: /\n\nSitemap: ${SITE_URL}/sitemap.xml\n`)
await writeFile(path.join(OUT, '404.html'), `<!DOCTYPE html>
<html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Page not found | Gloves Galore</title><meta name="robots" content="noindex">
<link rel="icon" href="${SITE_URL}/favicon.ico" sizes="48x48">
<link href="https://fonts.googleapis.com/css2?family=Big+Shoulders+Display:wght@900&family=Montserrat:wght@500&display=swap" rel="stylesheet">
<style>
  body{margin:0;min-height:100vh;display:grid;place-items:center;background:#0D0D0D;color:#f4f4ed;font-family:Montserrat,sans-serif;text-align:center;padding:1rem}
  h1{font-family:'Big Shoulders Display',sans-serif;font-weight:900;font-size:clamp(4rem,18vw,10rem);line-height:.9;margin:0;text-transform:uppercase}
  span{color:transparent;-webkit-text-stroke:1px #C8FF00}
  a{display:inline-block;margin-top:2rem;background:#C8FF00;color:#000;padding:.8rem 1.5rem;border-radius:5px;font-family:'Big Shoulders Display',sans-serif;font-weight:900;font-size:1.2rem;text-decoration:none;text-transform:uppercase}
</style></head>
<body><main><h1>Lost <span>grip?</span></h1><p>This page doesn't exist.</p><a href="${SITE_URL}/">Back to home</a></main></body></html>
`)
if (config.customDomain) await writeFile(path.join(OUT, 'CNAME'), `${config.customDomain}\n`)

// files that must sit at the site root (browsers and Google look for them there)
for (const f of await readdir(path.join(ROOT, 'favicon'))) {
  await copyFile(path.join(ROOT, 'favicon', f), path.join(OUT, f))
}

// ---------- report ----------
if (SITE_URL.includes('GITHUB_USERNAME')) warnings.push('siteUrl still has GITHUB_USERNAME in site.config.json')
if (files['forms.js'].includes('PASTE_APPS_SCRIPT_URL')) warnings.push('forms are not connected: Google Apps Script URL missing in forms.js')
if (/1234567/.test(PAGES.map((p) => files[p]).join(''))) warnings.push('placeholder phone number (1234567) still on the site')

console.log(`Built ${SITE_URL}`)
console.log(`  ${products.length} products written into index.html, ${productPaths.length} glove pages built`)
console.log(`  images: ${used.size} files, ${(before / 1048576).toFixed(1)} MB → ${(after / 1048576).toFixed(1)} MB`)
for (const w of warnings) console.log(`  ⚠ ${w}`)
