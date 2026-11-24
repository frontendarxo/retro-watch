import { useEffect, useState } from 'react'

export default function LcdClock() {
  const [now, setNow] = useState(() => new Date())
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(id)
  }, [])
  const hh = String(now.getHours()).padStart(2, '0')
  const mm = String(now.getMinutes()).padStart(2, '0')
  const ss = String(now.getSeconds()).padStart(2, '0')
  return (
    <div className="lcd" role="timer" aria-label="Текущее время">
      <span>{hh}</span>
      <span className={now.getSeconds() % 2 ? 'dim' : ''}>:</span>
      <span>{mm}</span>
      <small>{ss}</small>
    </div>
  )
}
