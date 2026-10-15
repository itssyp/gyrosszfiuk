import { menuItems } from './menuData'

const categoryInfo: Record<string, { title: string; emoji: string; note: string }> = {
  Sör: { title: 'Sörök', emoji: '🍺', note: 'Hidegebb, mint a gyros fiúk válaszai.' },
  Bor: { title: 'Fröccsök', emoji: '🍷', note: 'Minden arányban, kivéve a rosszban.' },
  Hosszúital: { title: 'Hosszúitalok & koktélok', emoji: '🍹', note: 'A Yamal koktélt Lamine is megkóstolná.' },
  Üdítő: { title: 'Üdítők & kávé', emoji: '🥤', note: 'Annak, aki holnap is dolgozik.' },
  Nasi: { title: 'Nasi', emoji: '🍿', note: 'Igen, a zsebkendő is nasi. Ne kérdezd.' },
  Egyéb: { title: 'Egyéb', emoji: '🎁', note: 'A mysterybox tartalmát még a pultos sem tudja.' },
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
            A gyros fiúk kedvenc büféje. Gyros nincs, de minden más, ami mellé kell.
            Nyitva, amíg van jég.
          </p>
        </div>
        <div className="restaurant-stamp" aria-hidden="true">
          <span>★★★★★</span>
          <strong>{Object.values(menuItems).flat().length}</strong>
          <small>TÉTEL AZ ÉTLAPON</small>
        </div>
      </div>

      <nav className="menu-chips" aria-label="Étlap kategóriák">
        {categories.map((category) => (
          <button type="button" key={category} onClick={() => scrollToCategory(category)}>
            {categoryInfo[category]?.emoji} {categoryInfo[category]?.title ?? category}
          </button>
        ))}
      </nav>

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
