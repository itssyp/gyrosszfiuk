import { useState } from 'react'

type Post =
  | {
      id: string
      kind: 'text'
      tag: string
      time: string
      title: string
      body: string
      image?: string
      imagePosition?: string
      link?: { href: string; label: string }
      reactions: number
    }
  | {
      id: string
      kind: 'tweet'
      tag: string
      time: string
      title: string
      lines: string[]
      // document: show the whole image with the caption below it instead of over it.
      images: { src: string; alt: string; document?: boolean }[]
      link?: { href: string; label: string }
      reactions: number
    }
  | { id: string; kind: 'poll'; tag: string; time: string; title: string; reactions: number }
  | { id: string; kind: 'stats'; tag: string; time: string; title: string; reactions: number }

const pollCandidates = ['Bözsi', 'Csőke', 'Rabó', 'Széwald', 'Soltész', 'Mr. Amerika']

const weeklyStats = [
  { value: '1 284', label: 'pita feltekerve' },
  { value: '42 kg', label: 'hagyma (42 liter sírás)' },
  { value: '17', label: 'rendelés még „úton van”' },
  { value: '0', label: 'csípős nélküli rendelés (mind kitiltva)' },
]

const tickerItems = [
  'BREAKING: Tanbá aláírt',
  'A Bueno továbbra is ice cold 🥶',
  'Mr. Amerika piaci értéke 95M €',
  'Holnap 90% eséllyel gyros',
  'MEGAMENÜ: tele a tank ⛽',
  'A mysterybox tartalma még mindig titok',
]

const posts: Post[] = [
  {
    id: 'tanba',
    kind: 'tweet',
    tag: 'ÁTIGAZOLÁS',
    time: 'ma, 14:20',
    title: '🚨🥙 BREAKING: Tanbá a gyrosszfiuk.hu Kiemeltjeihez igazol!',
    lines: [
      '✍️ A „Hivatalos és Sorsdöntő Munkaszerződés” aláírva, Bak Főni személyesen hagyta jóvá.',
      '🔪 Pozíció: főállású gyros-lovag és a „hagyma mehet bele?” kérdés hivatalos feltevője.',
      '💰 Juttatás: korlátlan tzatziki-illat és napi egy óriás gyros tál (ha Főni jókedvében van).',
      '🩺 Orvosi vizsgálat letudva: a bajusz 100%-ban fit.',
      '❌ Záradék: elégtelent a vendégeknek többé nem adhat.',
    ],
    images: [
      { src: '/jeloltek/tanba.jpg', alt: 'Tanbá büfés kötényben, hüvelykujjal felfelé' },
      { src: '/jeloltek/tanba-szerzodes.jpg', alt: 'Tanbá aláírt munkaszerződése', document: true },
    ],
    link: { href: '#kiemelt', label: 'Tanbá a Kiemeltek között' },
    reactions: 312,
  },
  {
    id: 'megamenu',
    kind: 'text',
    tag: 'ÜZEMANYAG',
    time: 'ma, 13:10',
    title: '⛽ Hivatalos: a gyros fiúk benzinje a MEGAMENÜ',
    body: 'Mérnökeink kimérték: a gyros fiúk nem kalóriából, hanem MEGAMENÜből működnek. A receptet a csapat ügyvédei széfbe zárták, annyit elárulhatunk, hogy az egyik összetevő kőkemény, mint egy bánya, a másik átlátszó, de egészen biztosan nem víz. Hivatalos fogyasztás: 2,5 liter / 100 pita. Soltész már a GT 2025-ön is ezzel tankolt, a forrásaink szerint cumisüvegből.',
    reactions: 421,
  },
  {
    id: 'poll',
    kind: 'poll',
    tag: 'KÖZVÉLEMÉNY-KUTATÁS',
    time: 'ma, 12:05',
    title: 'Ki legyen a jövő gyros fiúja? Friss felmérés (az adatok csalhatnak, a szavazatokat még nem volt kedvünk megszámolni)',
    reactions: 158,
  },
  {
    id: 'amerika',
    kind: 'text',
    tag: 'ÚJ JELENTKEZŐ',
    time: 'tegnap, 21:47',
    title: 'Unikornis a láthatáron: Mr. Amerika jelentkezett',
    body: 'Piaci értéke 95 millió euró, példaképe Gyrosos Zalán, kedvenc színe a türkiz. A sört nem szereti, de a scoutok szerint ezt bőven kompenzálja egy XXL pitával.',
    image: '/jeloltek/mr-amerika.jpg',
    imagePosition: 'left center',
    link: { href: '#szavazas', label: 'Szavazz rá' },
    reactions: 204,
  },
  {
    id: 'bueno',
    kind: 'text',
    tag: 'BÜFÉ',
    time: 'tegnap, 18:30',
    title: 'Megerősítve: a Bueno fix ice cold 🥶',
    body: 'A ¿Y Que Bufue? hűtőjéből jelentjük: független mérések szerint a Bueno hőmérséklete alacsonyabb, mint a gyros fiúk válaszadási hajlandósága. A mysterybox tartalma továbbra is titok, még a pultos előtt is.',
    link: { href: '#etterem', label: 'Az étlaphoz' },
    reactions: 97,
  },
  {
    id: 'stats',
    kind: 'stats',
    tag: 'STATISZTIKA',
    time: 'hétfő, 09:00',
    title: 'Heti gyros-mérleg',
    reactions: 76,
  },
  {
    id: 'red-card',
    kind: 'text',
    tag: 'SZABÁLYZAT',
    time: 'vasárnap, 16:12',
    title: 'Piros lap a csípős nélküli rendelésekre',
    body: 'A Gyros Szövetség megerősítette: aki csípős nélkül vagy enyhén kéri, azonnali kitiltásban részesül. Fellebbezni kizárólag csípős szósszal lehet, írásban, a pita hátoldalán.',
    reactions: 143,
  },
  {
    id: 'rabo',
    kind: 'text',
    tag: 'PLETYKA',
    time: 'szombat, 23:58',
    title: 'Rabó referenciamunkája még mindig tölt',
    body: 'A 180 MB-os anyag jelenleg 63%-nál jár. A bohóc addig is helyettesíti a profilképen, és értesüléseink szerint egyre jobban élvezi.',
    reactions: 61,
  },
  {
    id: 'weather',
    kind: 'text',
    tag: 'IDŐJÁRÁS',
    time: 'szombat, 07:30',
    title: 'Gyros-előrejelzés a hétvégére',
    body: 'Holnap 90% eséllyel gyros. Délután helyenként szósz-zápor, estére nyugat felől hagymás front érkezik. Az esernyő helyett szalvéta ajánlott.',
    reactions: 48,
  },
]

const pollNotes = [
  'Megkérdezett: 3 ember és egy galamb. Hibahatár: ±2 hagymakarika.',
  'A szavazatok egy cipősdobozban várják, hogy valaki megszámolja őket. Addig ez a becslés.',
  'Az eredményt a pultos hasraütésre állapította meg, két gyros között.',
  'A számlálást a MEGAMENÜ miatt elhalasztottuk. Ezek a számok nagyjából stimmelnek. Talán.',
  'Módszertan: a szavazólapokat a ventilátor elé dobtuk, és megnéztük, melyik szállt a legmesszebb.',
]

// A brand new "survey" on every page load: the numbers are made up anyway.
function makePollResults() {
  const raw = pollCandidates.map(() => 5 + Math.random() * 30)
  const total = raw.reduce((sum, value) => sum + value, 0)
  const results = pollCandidates.map((name, index) => ({ name, share: Math.round((raw[index] / total) * 100) }))
  return results.sort((a, b) => b.share - a.share)
}

function News() {
  const [pollResults] = useState(makePollResults)
  const [pollNote] = useState(() => pollNotes[Math.floor(Math.random() * pollNotes.length)])
  const [reacted, setReacted] = useState<string[]>([])

  function toggleReaction(postId: string) {
    setReacted((ids) => (ids.includes(postId) ? ids.filter((id) => id !== postId) : [...ids, postId]))
  }

  return (
    <section className="listing news-section">
      <div className="section-heading">
        <div>
          <p className="kicker dark">GYROS HÍREK</p>
          <h2>Friss a pitából</h2>
        </div>
        <p>Igazolások, pletykák és teljesen hiteles statisztikák.</p>
      </div>

      <div className="news-ticker" aria-label="Friss hírek">
        <span className="news-ticker-label">ÉLŐ</span>
        <div className="news-ticker-track">
          <div className="news-ticker-items">
            {[...tickerItems, ...tickerItems].map((item, index) => (
              <span key={index} aria-hidden={index >= tickerItems.length}>{item}</span>
            ))}
          </div>
        </div>
      </div>

      <div className="news-feed">
        {posts.map((post) => {
          const hasReacted = reacted.includes(post.id)

          return (
            <article className={`news-card ${post.kind === 'tweet' ? 'is-tweet' : ''}`} key={post.id}>
              <header className="news-meta">
                <span className="news-tag">{post.tag}</span>
                <time>{post.time}</time>
              </header>
              {post.kind === 'tweet' && (
                <div className="news-tweet-author">
                  <span className="news-tweet-avatar" aria-hidden="true">🥙</span>
                  <div>
                    <strong>Gyrosio Romano <span className="news-tweet-check" aria-label="hitelesített">✔</span></strong>
                    <small>@GyrosHereWeGo</small>
                  </div>
                </div>
              )}
              <h3>{post.title}</h3>

              {post.kind === 'text' && (
                <>
                  {post.image && (
                    <div
                      className="news-image"
                      style={{ backgroundImage: `url(${post.image})`, backgroundPosition: post.imagePosition }}
                    />
                  )}
                  <p>{post.body}</p>
                </>
              )}

              {post.kind === 'tweet' && (
                <div className="news-tweet">
                  <ul>
                    {post.lines.map((line) => <li key={line}>{line}</li>)}
                  </ul>
                  <div className="news-tweet-media">
                    {post.images.map((image) => (
                      <figure key={image.src} className={image.document ? 'is-document' : ''}>
                        <img src={image.src} alt={image.alt} loading="lazy" />
                        {!image.document && <figcaption>HERE WE GO! ✅</figcaption>}
                      </figure>
                    ))}
                  </div>
                </div>
              )}

              {post.kind === 'poll' && (
                <div className="news-poll">
                  {pollResults.map((result, index) => (
                    <div className="news-poll-row" key={result.name}>
                      <div>
                        <strong>{index === 0 ? '👑 ' : ''}{result.name}</strong>
                        <span>{result.share}%</span>
                      </div>
                      <div className="vote-bar"><i style={{ width: `${result.share}%` }} /></div>
                    </div>
                  ))}
                  <small>{pollNote} Minden frissítéskor új felmérés készül.</small>
                </div>
              )}

              {post.kind === 'stats' && (
                <div className="news-stats">
                  {weeklyStats.map((stat) => (
                    <div key={stat.label}>
                      <strong>{stat.value}</strong>
                      <span>{stat.label}</span>
                    </div>
                  ))}
                </div>
              )}

              <div className="news-footer">
                <button
                  type="button"
                  className={`news-react ${hasReacted ? 'is-active' : ''}`}
                  aria-pressed={hasReacted}
                  onClick={() => toggleReaction(post.id)}
                >
                  🥙 {post.reactions + (hasReacted ? 1 : 0)}
                </button>
                {(post.kind === 'text' || post.kind === 'tweet') && post.link && (
                  <a href={post.link.href}>{post.link.label} →</a>
                )}
                {post.kind === 'poll' && <a href="#szavazas">Szavazz te is →</a>}
              </div>
            </article>
          )
        })}
      </div>
    </section>
  )
}

export default News
