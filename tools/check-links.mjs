// node tools/check-links.mjs  — every href/src in dist/ must resolve to a real file
import {readdir, readFile, stat} from 'node:fs/promises'
import path from 'node:path'
const OUT = path.join(path.dirname(new URL(import.meta.url).pathname.slice(1)), '..', 'dist')
const pages = []
const walk = async (dir) => {
  for (const e of await readdir(dir, {withFileTypes: true})) {
    const p = path.join(dir, e.name)
    if (e.isDirectory()) await walk(p)
    else if (e.name.endsWith('.html')) pages.push(p)
  }
}
await walk(OUT)
const exists = async (f) => { try { const s = await stat(f); return s.isFile() || s.isDirectory() } catch { return false } }
let bad = 0
for (const page of pages) {
  const html = await readFile(page, 'utf8')
  const refs = [...html.matchAll(/(?:href|src)="([^"]+)"/g)].map((m) => m[1])
    .concat([...html.matchAll(/url\(([^)]+)\)/g)].map((m) => m[1].replace(/['"]/g, '')))
  for (const ref of refs) {
    if (/^(https?:|mailto:|tel:|data:|#|\/\/)/.test(ref)) continue
    const clean = ref.split('#')[0].split('?')[0]
    if (!clean) continue
    const target = clean.startsWith('/') ? path.join(OUT, clean) : path.join(path.dirname(page), clean)
    const ok = await exists(target) || await exists(path.join(target, 'index.html'))
    if (!ok) { console.log(`MISSING ${path.relative(OUT, page)} → ${ref}`); bad++ }
  }
}
console.log(bad ? `${bad} broken references` : `all references OK (${pages.length} pages)`)
