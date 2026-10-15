import { menuItems } from './menuData'

// From "streetfood kínálat.PNG": price in Ft, or a discount for the menus.
const streetfood: { title: string; emoji: string; items: [string, number | string][] }[] = [
  {
    title: 'Gyros',
    emoji: '🥙',
    items: [
      ['Gyros', 1100],
      ['Laktózmentes gyros', 1100],
      ['Gyros menü', '-10%'],
    ],
  },
  {
    title: 'Smash Burger',
    emoji: '🍔',
    items: [
      ['Smash burger', 1600],
      ['Vega burger', 1600],
      ['Whiskey szósz', 100],
      ['Burger menü', '-10%'],
    ],
  },
  {
    title: 'Paquito',
    emoji: '🌮',
    items: [
      ['Paquito', 800],
      ['Mexikói menü', '-10%'],
    ],
  },
]

const categoryInfo: Record<string, { title: string; emoji: string; note: string }> = {
  Sör: { title: 'Sörök', emoji: '🍺', note: 'Hidegebb, mint a gyros fiúk válaszai. A mysterybox tartalmát a pultos sem tudja.' },
  Bor: { title: 'Fröccsök', emoji: '🍷', note: 'Minden arányban, kivéve a rosszban.' },
  Hosszúital: { title: 'Hosszúitalok & koktélok', emoji: '🍹', note: 'A Yamal koktélt Lamine is megkóstolná.' },
  Üdítő: { title: 'Üdítők & kávé', emoji: '🥤', note: 'Annak, aki holnap is dolgozik.' },
  Nasi: { title: 'Nasi', emoji: '🍿', note: 'Igen, a zsebkendő is nasi. Ne kérdezd. Viszont a Bueno fix ice cold 🥶' },
  Egyéb: { title: 'Egyéb', emoji: '♻️', note: 'Repohár: a bolygó is szomjas.' },
}

const priceFormat = new Intl.NumberFormat('hu-HU')

function formatName(name: string) {
  return name.charAt(0).toUpperCase() + name.slice(1)
}

function scrollToCategory(category: string) {
  document.getElementById(`menu-${category}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

function Restaurant() {
  const categories = Object.keys(menuItems)

  return (
    <section className="listing restaurant-section">
      <div className="restaurant-hero">
        <div>
          <p className="kicker">ÉTTEREM · BÜFÉ · G7V'26</p>
          <h2>¿Y Que Bufue?</h2>
          <p>
            A gyros fiúk kedvenc büféje. Van gyros, smash burger, paquito, és minden,
            ami mellé kell.
            <br />
            Nyitva ✅Vagyunk végig ☝😎
          </p>
        </div>
        <div className="restaurant-stamp" aria-hidden="true">
          <span>★★★★★</span>
          <strong>{Object.values(menuItems).flat().length + streetfood.flatMap((group) => group.items).length}</strong>
          <small>TÉTEL AZ ÉTLAPON</small>
        </div>
      </div>

      <nav className="menu-chips" aria-label="Étlap kategóriák">
        <button type="button" onClick={() => scrollToCategory('streetfood')}>🔥 Streetfood</button>
        {categories.map((category) => (
          <button type="button" key={category} onClick={() => scrollToCategory(category)}>
            {categoryInfo[category]?.emoji} {categoryInfo[category]?.title ?? category}
          </button>
        ))}
      </nav>

      <article className="menu-card streetfood-card" id="menu-streetfood">
        <header>
          <h3><span aria-hidden="true">🔥</span> Streetfood</h3>
          <p>Ezt nem kell jobbra húzni, elég megenni. Ez az egyetlen gyros, ami biztosan megérkezik. A menük -10%-kal olcsóbbak.</p>
        </header>
        <div className="streetfood-groups">
          {streetfood.map((group) => (
            <section key={group.title}>
              <h4><span aria-hidden="true">{group.emoji}</span> {group.title}</h4>
              <ul>
                {group.items.map(([name, price]) => (
                  <li key={name} className={typeof price === 'string' ? 'is-deal' : ''}>
                    <span className="menu-name">{name}</span>
                    <span className="menu-dots" aria-hidden="true" />
                    <strong>{typeof price === 'number' ? `${priceFormat.format(price)} Ft` : price}</strong>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      </article>

      <div className="menu-grid">
        {categories.map((category) => {
          const info = categoryInfo[category]

          return (
            <article className="menu-card" id={`menu-${category}`} key={category}>
              <header>
                <h3><span aria-hidden="true">{info?.emoji}</span> {info?.title ?? category}</h3>
                {info && <p>{info.note}</p>}
              </header>
              <ul>
                {menuItems[category].map(([name, price, drs]) => (
                  <li key={name} className={name === 'Mystery box' ? 'is-highlight' : ''}>
                    <span className="menu-name">
                      {formatName(name)}
                      {drs && <abbr className="menu-drs" title="Visszaváltható csomagolás (DRS)">♻</abbr>}
                    </span>
                    <span className="menu-dots" aria-hidden="true" />
                    <strong>{priceFormat.format(price)} Ft</strong>
                  </li>
                ))}
              </ul>
            </article>
          )
        })}
      </div>

      <p className="menu-legend">♻ = visszaváltható csomagolás (DRS). Az árak tájékoztató jellegűek, a hangulat ingyenes.</p>
    </section>
  )
}

export default Restaurant
