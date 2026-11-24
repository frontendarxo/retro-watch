import { useEffect, useState } from 'react'
import { VIDEO } from './config'
import { ensureFrames, isMobile, loadedCount, manifestReady } from './frames'

const LINES = ['BOOT SEQUENCE 1984', 'LOADING DISPLAY ........ OK', 'SYNC TIME ............... OK']

// Ждём первый ролик (hero), но не дольше 6 секунд.
export default function Loader({ onDone }: { onDone: () => void }) {
  const [progress, setProgress] = useState(0)
  const [minTime, setMinTime] = useState(false)
  const [hidden, setHidden] = useState(false)

  useEffect(() => {
    const id = setTimeout(() => setMinTime(true), 1600)
    return () => clearTimeout(id)
  }, [])

  useEffect(() => {
    let stop = false
    const guard = setTimeout(() => !stop && setProgress(100), 6000)
    let guardClear = () => {}
    if (isMobile()) {
      // телефон: ждём первые кадры первой главы
      manifestReady.then((m) => {
        if (stop) return
        if (!Object.keys(m).length) return setProgress(100)
        ensureFrames('hero')
        const t = setInterval(() => {
          const p = Math.min(100, (loadedCount('hero') / 10) * 100)
          setProgress(p)
          if (p >= 100) clearInterval(t)
        }, 120)
        guardClear = () => clearInterval(t)
      })
      return () => { stop = true; clearTimeout(guard); guardClear() }
    }
    const src = VIDEO.hero
    if (!src) { setProgress(100); return () => clearTimeout(guard) }
    const v = document.createElement('video')
    v.muted = true
    v.preload = 'auto'
    const upd = () => {
      if (v.duration && v.buffered.length) setProgress(Math.min(100, (v.buffered.end(v.buffered.length - 1) / v.duration) * 100))
    }
    const done = () => setProgress(100)
    v.addEventListener('progress', upd)
    v.addEventListener('canplaythrough', done)
    v.addEventListener('error', done)
    v.src = src
    return () => {
      stop = true
      clearTimeout(guard)
      v.removeEventListener('progress', upd)
      v.removeEventListener('canplaythrough', done)
      v.removeEventListener('error', done)
    }
  }, [])

  const ready = minTime && progress >= 100

  useEffect(() => {
    if (!ready) return
    onDone()
    const id = setTimeout(() => setHidden(true), 700)
    return () => clearTimeout(id)
  }, [ready, onDone])

  if (hidden) return null
  const shown = Math.round(progress)
  return (
    <div className={'loader' + (ready ? ' out' : '')}>
      <div className="loader-box">
        {LINES.map((l) => (
          <p key={l}>{l}</p>
        ))}
        <p className="loader-bar">
          [{'#'.repeat(Math.round(shown / 5)).padEnd(20, '.')}] {shown}%
        </p>
      </div>
    </div>
  )
}
