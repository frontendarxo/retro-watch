const ITEMS = [
  { n: 'I', label: 'Старт' },
  { n: 'II', label: 'Дисплей' },
  { n: 'III', label: 'Корпус' },
  { n: 'IV', label: 'Вода' },
  { n: 'V', label: 'Горы' },
  { n: 'VI', label: 'Рука' },
  { n: 'VII', label: 'Параметры' },
  { n: 'VIII', label: 'Купить' },
]

export default function Nav({ active, onGo }: { active: number; onGo: (i: number) => void }) {
  return (
    <nav className="nav" aria-label="Главы">
      {ITEMS.map((it, i) => (
        <button key={it.n} className={i === active ? 'on' : ''} onClick={() => onGo(i)}>
          <span className="num">{it.n}</span>
          <span className="lbl">{it.label}</span>
        </button>
      ))}
    </nav>
  )
}
