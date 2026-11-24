import { useCallback, useEffect, useRef, useState } from 'react'
import Lenis from 'lenis'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Backgrounds from './Backgrounds'
import Sections from './Sections'
import Nav from './Nav'
import Loader from './Loader'
import { scroll } from './scrollState'

gsap.registerPlugin(ScrollTrigger)

export default function App() {
  const [active, setActive] = useState(0)
  const [booted, setBooted] = useState(false)
  const lenisRef = useRef<Lenis | null>(null)
  const topsRef = useRef<number[]>([])

  const measure = useCallback(() => {
    const els = Array.from(document.querySelectorAll<HTMLElement>('[data-chapter]'))
    topsRef.current = els.map((el) => el.offsetTop)
    scroll.tops = topsRef.current
    scroll.heights = els.map((el) => el.offsetHeight)
  }, [])

  // Плавный скролл + связь с GSAP + расчёт «номера главы»
  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const lenis = new Lenis({ lerp: reduce ? 1 : 0.09 })
    lenisRef.current = lenis

    const update = () => {
      const tops = topsRef.current
      if (!tops.length) return
      const y = window.scrollY
      let idx = 0
      if (y >= tops[tops.length - 1]) idx = tops.length - 1
      else {
        for (let i = 0; i < tops.length - 1; i++) {
          if (y >= tops[i] && y < tops[i + 1]) {
            idx = i + (y - tops[i]) / (tops[i + 1] - tops[i])
            break
          }
        }
      }
      scroll.idx = idx
      const mid = y + window.innerHeight * 0.5
      let act = 0
      for (let i = 0; i < tops.length; i++) if (tops[i] <= mid) act = i
      setActive((a) => (a === act ? a : act))
    }

    lenis.on('scroll', () => {
      ScrollTrigger.update()
      update()
    })
    const tick = (t: number) => lenis.raf(t * 1000)
    gsap.ticker.add(tick)
    gsap.ticker.lagSmoothing(0)

    measure()
    update()
    const onResize = () => {
      measure()
      update()
      ScrollTrigger.refresh()
    }
    window.addEventListener('resize', onResize)
    // высоты могут меняться после загрузки шрифтов
    const t1 = setTimeout(onResize, 400)
    const t2 = setTimeout(onResize, 1500)

    return () => {
      clearTimeout(t1)
      clearTimeout(t2)
      window.removeEventListener('resize', onResize)
      gsap.ticker.remove(tick)
      lenis.destroy()
    }
  }, [measure])

  // Появление блоков при скролле (после загрузки)
  useEffect(() => {
    if (!booted) return
    const ctx = gsap.context(() => {
      gsap.utils.toArray<HTMLElement>('.reveal').forEach((el, i) => {
        gsap.from(el, {
          y: 40,
          opacity: 0,
          filter: 'blur(8px)',
          duration: 0.9,
          ease: 'power3.out',
          delay: (i % 4) * 0.05,
          scrollTrigger: { trigger: el, start: 'top 88%', toggleActions: 'play none none reverse' },
        })
      })
    })
    return () => ctx.revert()
  }, [booted])

  const go = (i: number) => {
    const el = document.querySelectorAll<HTMLElement>('[data-chapter]')[i]
    if (el && lenisRef.current) lenisRef.current.scrollTo(el, { duration: 1.6 })
  }

  return (
    <>
      <Backgrounds />
      <div className="fx scanlines" aria-hidden="true" />
      <div className="fx vignette" aria-hidden="true" />
      <header className="brand">RETRO<span>/</span>84</header>
      <Nav active={active} onGo={go} />
      <Sections onBuy={() => go(7)} />
      <Loader onDone={useCallback(() => setBooted(true), [])} />
    </>
  )
}
