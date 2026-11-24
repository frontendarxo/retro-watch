// Мобильный режим: вместо <video> — последовательность кадров на canvas.
// Кадры лежат в public/frames/<глава>/001.webp… (делает scripts/make-frames.sh),
// грузятся по главам «от грубого к точному» и выгружаются, когда глава далеко.
export const isMobile = () => typeof window !== 'undefined' && window.matchMedia('(max-width: 767px)').matches

type Entry = { n: number; imgs: (HTMLImageElement | null)[]; order: number[]; next: number; active: boolean; running: number }
const store: Record<string, Entry> = {}
let manifest: Record<string, number> = {}

export const manifestReady: Promise<Record<string, number>> = fetch('/frames/manifest.json')
  .then((r) => (r.ok ? r.json() : {}))
  .then((m) => { manifest = m; return m })
  .catch(() => ({}))

const pad = (i: number) => String(i + 1).padStart(3, '0')

function makeOrder(n: number) {
  const seen = new Set<number>()
  const out: number[] = []
  const add = (i: number) => { if (i >= 0 && i < n && !seen.has(i)) { seen.add(i); out.push(i) } }
  add(0); add(n - 1)
  for (const step of [16, 8, 4, 2, 1]) for (let i = 0; i < n; i += step) add(i)
  return out
}

export const frameCount = (name: string) => manifest[name] ?? 0

function pump(name: string, e: Entry) {
  while (e.active && e.running < 4 && e.next < e.order.length) {
    const i = e.order[e.next++]
    if (e.imgs[i]) continue
    e.running++
    const img = new Image()
    img.decoding = 'async'
    const done = (ok: boolean) => {
      e.running--
      if (ok && e.active) e.imgs[i] = img
      pump(name, e)
    }
    img.onload = () => done(true)
    img.onerror = () => done(false)
    img.src = `/frames/${name}/${pad(i)}.webp`
  }
}

export function ensureFrames(name: string) {
  const n = manifest[name]
  if (!n) return
  let e = store[name]
  if (!e) e = store[name] = { n, imgs: new Array(n).fill(null), order: makeOrder(n), next: 0, active: false, running: 0 }
  if (e.active) return
  e.active = true
  e.next = 0
  pump(name, e)
}

export function releaseFrames(name: string) {
  const e = store[name]
  if (!e || !e.active) return
  e.active = false
  e.imgs.fill(null)
}

export function loadedCount(name: string) {
  const e = store[name]
  return e ? e.imgs.filter(Boolean).length : 0
}

// ближайший уже загруженный кадр к позиции idx
export function nearestFrame(name: string, idx: number): HTMLImageElement | null {
  const e = store[name]
  if (!e) return null
  for (let d = 0; d < e.n; d++) {
    const a = e.imgs[idx - d]
    if (a) return a
    const b = e.imgs[idx + d]
    if (b) return b
  }
  return null
}
