import { useEffect, useRef, useState } from 'react'
import { BG, BG_FALLBACK, BG_ORDER, VIDEO } from './config'
import { ensureFrames, frameCount, isMobile, manifestReady, nearestFrame, releaseFrames } from './frames'
import { scroll } from './scrollState'

const clamp = (x: number, a = 0, b = 1) => Math.min(b, Math.max(a, x))
const smooth = (x: number) => { const t = clamp(x); return t * t * (3 - 2 * t) }
const CW = 480
const CH = 600

// Каждая глава = длинная зона скролла: текст «прикреплён» (sticky), а ролик перематывается
// вместе со скроллом. Десктоп — <video>, телефон — кадры на canvas (iOS не умеет надёжно
// перематывать видео, а 8 тяжёлых роликов по мобильной сети не грузятся).
export default function Backgrounds() {
  const [mode, setMode] = useState<'video' | 'frames' | null>(isMobile() ? null : 'video')
  const layers = useRef<(HTMLDivElement | null)[]>([])
  const vids = useRef<(HTMLVideoElement | null)[]>([])
  const cvs = useRef<(HTMLCanvasElement | null)[]>([])
  const cur = useRef<number[]>(BG_ORDER.map(() => 0))
  const drawn = useRef<(HTMLImageElement | null)[]>(BG_ORDER.map(() => null))

  useEffect(() => {
    if (mode !== null) return
    manifestReady.then((m) => setMode(Object.keys(m).length ? 'frames' : 'video'))
  }, [mode])

  useEffect(() => {
    if (!mode) return
    let raf = 0
    const loop = () => {
      const y = window.scrollY
      const vh = window.innerHeight
      const { tops, heights } = scroll
      const n = BG_ORDER.length
      if (tops.length === n) {
        const wIn = (i: number) => (i === 0 ? 1 : smooth((y - (tops[i] - 0.8 * vh)) / (0.55 * vh)))
        layers.current.forEach((el, i) => {
          if (!el) return
          const name = BG_ORDER[i]
          const w = wIn(i)
          const covered = i < n - 1 && wIn(i + 1) >= 0.999
          el.style.opacity = String(w)
          el.style.visibility = w > 0.005 && !covered ? 'visible' : 'hidden'
          el.style.zIndex = String(i)

          const end = tops[i] + heights[i] - vh
          const p = end > tops[i] ? clamp((y - tops[i]) / (end - tops[i])) : 0
          cur.current[i] += (p - cur.current[i]) * 0.25
          const near = y > tops[i] - 1.6 * vh && y < tops[i] + heights[i] + 0.6 * vh
          const far = y < tops[i] - 3 * vh || y > tops[i] + heights[i] + 2 * vh

          if (mode === 'frames') {
            if (near) ensureFrames(name)
            else if (far) { releaseFrames(name); drawn.current[i] = null }
            const c = cvs.current[i]
            const cnt = frameCount(name)
            if (c && cnt && w > 0.005 && !covered) {
              const img = nearestFrame(name, Math.round(cur.current[i] * (cnt - 1)))
              if (img && img !== drawn.current[i]) {
                const ctx = c.getContext('2d')
                if (ctx) { ctx.drawImage(img, 0, 0, CW, CH); drawn.current[i] = img }
              }
            }
          } else {
            const v = vids.current[i]
            if (v) {
              if (near && v.preload !== 'auto') v.preload = 'auto'
              if (v.readyState >= 1 && v.duration) {
                const target = cur.current[i] * (v.duration - 0.05)
                if (Math.abs(target - v.currentTime) > 0.012) v.currentTime = target
              }
            }
          }
        })
      }
      raf = requestAnimationFrame(loop)
    }
    loop()
    return () => cancelAnimationFrame(raf)
  }, [mode])

  return (
    <div className="bgs" aria-hidden="true">
      {BG_ORDER.map((name, i) => (
        <div
          key={name}
          ref={(el) => { layers.current[i] = el }}
          className="bgl"
          style={{
            backgroundColor: BG_FALLBACK[i],
            backgroundImage: BG[name] ? `url(${BG[name]})` : undefined,
            opacity: i === 0 ? 1 : 0,
          }}
        >
          {mode === 'frames' && (
            <canvas ref={(el) => { cvs.current[i] = el }} width={CW} height={CH} className="bgv bgc" />
          )}
          {mode === 'video' && VIDEO[name] && (
            <video
              ref={(el) => { vids.current[i] = el }}
              src={VIDEO[name]}
              muted
              playsInline
              preload={i < 2 ? 'auto' : 'metadata'}
              className="bgv"
            />
          )}
        </div>
      ))}
      <div className="bg-shade" />
    </div>
  )
}
