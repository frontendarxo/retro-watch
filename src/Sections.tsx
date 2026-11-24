import LcdClock from './LcdClock'

const SPECS: [string, string][] = [
  ['Дисплей', 'LCD, 4 разряда, подсветка EL'],
  ['Корпус', 'Нержавеющая сталь 316L'],
  ['Стекло', 'Минеральное, устойчивое к царапинам'],
  ['Водозащита', '50 метров (WR50)'],
  ['Питание', 'Батарея CR2016, до 7 лет'],
  ['Функции', 'Будильник, секундомер, 2 часовых пояса'],
  ['Браслет', 'Сталь, складная застёжка, обхват 14–21 см'],
  ['Вес', '38 грамм'],
]

const BOX = [
  'Часы RETRO-84 в стальном корпусе',
  'Подарочная коробка с бархатной вставкой',
  'Инструмент и запасные звенья для регулировки',
  'Гарантийный талон на 12 месяцев',
]

function Head({ n, tag, title, sub }: { n: string; tag: string; title: string; sub: string }) {
  return (
    <>
      <span className="ghost reveal" aria-hidden="true">{n}</span>
      <p className="eyebrow reveal">{tag}</p>
      <h2 className="reveal">{title}</h2>
      <p className="sub reveal">{sub}</p>
    </>
  )
}

function Feats({ items }: { items: string[] }) {
  return (
    <ul className="feats">
      {items.map((t) => (
        <li key={t} className="reveal">{t}</li>
      ))}
    </ul>
  )
}

export default function Sections({ onBuy }: { onBuy: () => void }) {
  return (
    <main className="content">
      <section data-chapter className="sec sec-hero">
<div className="pin">
        <div className="col">
          <p className="eyebrow reveal">СЕРИЯ 84 // ЦИФРОВЫЕ ЧАСЫ</p>
          <h1 className="reveal">
            <span className="glow-m">ВРЕМЯ</span>
            <span className="glow-c">ПЕРЕЗАГРУЖЕНО</span>
          </h1>
          <p className="sub reveal">Часы из будущего, которое мы помним.</p>
          <p className="body reveal">
            Классика цифровых часов 80-х в стальном корпусе: чёткий дисплей, лёгкий браслет и характер, который не выходит из моды. Прокрутите вниз — покажем, из чего они сделаны и где живут.
          </p>
          <div className="chips reveal">
            <span>LCD</span>
            <span>316L</span>
            <span>WR50</span>
            <span>7 ЛЕТ</span>
          </div>
          <p className="scroll-hint reveal">▼ ЛИСТАЙ</p>
        </div>
</div>
      </section>

      <section data-chapter className="sec">
<div className="pin">
        <div className="col">
          <Head n="02" tag="II // ДИСПЛЕЙ" title="Свет, переживший эпоху" sub="Один взгляд — и время перед глазами." />
          <p className="body reveal">
            Монохромный LCD читается на солнце и светится в темноте одним нажатием. Никаких уведомлений и лишних экранов: только время, дата и день недели.
          </p>
          <Feats items={['Контрастные цифры видно с вытянутой руки', 'Подсветка EL включается кнопкой и не слепит', 'Будильник и секундомер — без приложений']} />
          <div className="reveal">
            <LcdClock />
          </div>
        </div>
</div>
      </section>

      <section data-chapter className="sec">
<div className="pin">
        <div className="col">
          <Head n="03" tag="III // КОРПУС" title="Сталь с памятью" sub="Грани, которые ловят неон." />
          <p className="body reveal">
            Корпус из нержавеющей стали 316L с матовой и полированной фаской. Выдерживает душ, бассейн и десятилетия носки, а браслет собран на цельных звеньях без люфта.
          </p>
          <Feats items={['Сталь 316L — не темнеет и не аллергенна', 'Минеральное стекло устойчиво к царапинам', 'Складная застёжка с запасом по длине']} />
          <div className="stat reveal">
            <strong>316L</strong>
            <span>хирургическая сталь</span>
          </div>
        </div>
</div>
      </section>

      <section data-chapter className="sec">
<div className="pin">
        <div className="col">
          <Head n="04" tag="IV // ВОДА" title="Глубина — не помеха" sub="Душ, бассейн, дождь, море." />
          <p className="body reveal">
            Кнопки и крышка сидят на уплотнителях, поэтому часы живут там, где живёте вы. После солёной воды достаточно сполоснуть под краном.
          </p>
          <Feats items={['Защита до 50 метров (WR50)', 'Подходит для плавания и душа', 'Подсветка и кнопки работают в мокрых руках']} />
          <div className="stat reveal">
            <strong>50 м</strong>
            <span>водозащита WR</span>
          </div>
        </div>
</div>
      </section>

      <section data-chapter className="sec">
<div className="pin">
        <div className="col">
          <Head n="05" tag="V // ГОРЫ" title="Любой рельеф" sub="Холод, жара, тряска в рюкзаке." />
          <p className="body reveal">
            Сталь и минеральное стекло держат удар, а подсветка включается в темноте одним касанием. Батарея рассчитана на годы, так что в поход можно не брать запасную.
          </p>
          <Feats items={['Рабочий диапазон от −10 до +50 °C', 'Ударопрочная конструкция', 'Батарея на 7 лет без замены']} />
          <div className="stat reveal">
            <strong>−10…+50°</strong>
            <span>рабочий диапазон</span>
          </div>
        </div>
</div>
      </section>

      <section data-chapter className="sec">
<div className="pin">
        <div className="col">
          <Head n="06" tag="VI // НА РУКЕ" title="Под ваше запястье" sub="Через час вы о них забываете." />
          <p className="body reveal">
            Регулируемый браслет подходит под обхват от 14 до 21 см. Часы весят всего 38 грамм: не тянут руку и не цепляются за рукав.
          </p>
          <Feats items={['Звенья снимаются без мастерской', 'Тонкий корпус проходит под манжету', 'Одинаково смотрится с рубашкой и худи']} />
          <div className="stat reveal">
            <strong>14–21 см</strong>
            <span>обхват запястья</span>
          </div>
        </div>
</div>
      </section>

      <section data-chapter className="sec sec-spec">
<div className="pin">
        <div className="col wide">
          <Head n="07" tag="VII // ПАРАМЕТРЫ" title="Всё по делу" sub="Коротко и без маркетинга." />
          <p className="body reveal">
            Всё, что важно знать перед покупкой, на одном экране.
          </p>
          <dl className="specs">
            {SPECS.map(([k, v]) => (
              <div key={k} className="spec reveal">
                <dt>{k}</dt>
                <dd>{v}</dd>
              </div>
            ))}
          </dl>
        </div>
</div>
      </section>

      <section data-chapter className="sec sec-buy">
<div className="pin">
        <div className="col">
          <Head n="08" tag="VIII // ВСЁ ГОТОВО" title="Ваши в коробке" sub="Осталось только забрать." />
          <div className="order reveal">
            <div className="order-top">
              <div>
                <p className="order-name">RETRO-84</p>
                <p className="order-sub">Серебро · стальной браслет</p>
              </div>
              <p className="price">$89</p>
            </div>
            <ul className="box-list">
              {BOX.map((t) => (
                <li key={t}>{t}</li>
              ))}
            </ul>
            <button className="cta" onClick={onBuy}>
              КУПИТЬ СЕЙЧАС
            </button>
            <p className="order-note">Бесплатная доставка · 30 дней на возврат</p>
          </div>
          <footer className="credit reveal">
            Демо-сайт · Разработка: <a href="https://t.me/salamov5dev">@salamov5dev</a>
          </footer>
        </div>
</div>
      </section>
    </main>
  )
}
