import { useEffect, useRef } from 'react'
import { BG, BG_FALLBACK, BG_ORDER, VIDEO } from './config'
import { scroll } from './scrollState'

const clamp = (x: number, a = 0, b = 1) => Math.min(b, Math.max(a, x))
const smooth = (x: number) => { const t = clamp(x); return t * t * (3 - 2 * t) }

// Каждая глава = длинная зона скролла, внутри которой текст «прикреплён» (sticky),
// а ролик перематывается от первого кадра до последнего. Смена глав (текст + ролик)
// происходит в одном и том же окне скролла — длиной в один экран.
export default function Backgrounds() {
  const layers = useRef<(HTMLDivElement | null)[]>([])
  const vids = useRef<(HTMLVideoElement | null)[]>([])
  const cur = useRef<number[]>(BG_ORDER.map(() => 0))

  useEffect(() => {
    let raf = 0
    const loop = () => {
      const y = window.scrollY
      const vh = window.innerHeight
      const { tops, heights } = scroll
      const n = BG_ORDER.length
      if (tops.length === n) {
        // вход слоя i: плавно проявляется, пока текст главы i въезжает снизу
        const wIn = (i: number) => (i === 0 ? 1 : smooth((y - (tops[i] - 0.8 * vh)) / (0.55 * vh)))
        layers.current.forEach((el, i) => {
          if (!el) return
          const w = wIn(i)
          const covered = i < n - 1 && wIn(i + 1) >= 0.999
          el.style.opacity = String(w)
          el.style.visibility = w > 0.005 && !covered ? 'visible' : 'hidden'
          el.style.zIndex = String(i)

          const v = vids.current[i]
          if (v && v.readyState >= 1 && v.duration) {
            const end = tops[i] + heights[i] - vh // конец «прикрепления»
            const p = end > tops[i] ? clamp((y - tops[i]) / (end - tops[i])) : 0
            const target = p * (v.duration - 0.05)
            cur.current[i] += (target - cur.current[i]) * 0.25
            if (Math.abs(cur.current[i] - v.currentTime) > 0.012) v.currentTime = cur.current[i]
          }
        })
      }
      raf = requestAnimationFrame(loop)
    }
    loop()
    return () => cancelAnimationFrame(raf)
  }, [])

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
          {VIDEO[name] && (
            <video
              ref={(el) => { vids.current[i] = el }}
              src={VIDEO[name]}
              muted
              playsInline
              preload="auto"
              className="bgv"
            />
          )}
        </div>
      ))}
      <div className="bg-shade" />
    </div>
  )
}
