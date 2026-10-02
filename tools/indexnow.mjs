// Tells Bing/Yandex (IndexNow) that the site changed: reads the live sitemap and sends every URL.
// Run by the deploy workflow after a push; the key file is written by build.mjs.
import {readFile} from 'node:fs/promises'

const config = JSON.parse(await readFile(new URL('../site.config.json', import.meta.url), 'utf8'))
const host = config.customDomain
const key = config.indexNowKey
if (!host || !key) process.exit(0)

const sitemap = await (await fetch(`https://${host}/sitemap.xml`)).text()
const urlList = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1])
const res = await fetch('https://api.indexnow.org/indexnow', {
  method: 'POST',
  headers: {'Content-Type': 'application/json; charset=utf-8'},
  body: JSON.stringify({host, key, keyLocation: `https://${host}/${key}.txt`, urlList}),
})
console.log(`IndexNow: sent ${urlList.length} URLs, status ${res.status}`)
