type FeaturedProfile = {
  id: string
  name: string
  age: number
  city: string
  district: string
  price: string
  image: string
  distanceLabel: string
}

type HallOfFame = {
  badge: string
  // Small status pill on the photo, like "Nyitva" on the home cards.
  pill?: string
  rank: string
  quote: string
  awards: string[]
  stats: { label: string; value: number; note: string }[]
}

const hallOfFame: Record<string, HallOfFame> = {
  adi: {
    badge: '🏆 LEGENDA',
    rank: 'ALAPÍTÓ · CSÍPŐS RÉSZLEG',
    quote: 'A csípős nem opció, hanem életérzés.',
    awards: [
      'Balatonszemes legcsípősebb embere',
      'Éjféli pitakiszállítás bajnoka',
      'Ha műszak közben megzavarják, a feje habanero-pirosra vált, de két tömő után újra szelíd, mint az enyhe szósz',
    ],
    stats: [
      { label: 'Csípősség', value: 100, note: 'a tűzoltók már ismerik' },
      { label: 'Türelem műszak közben', value: 12, note: 'két tömőért visszatölthető' },
      { label: 'Pontosság', value: 23, note: 'valahol a 7-es úton jár' },
    ],
  },
  zalan: {
    badge: '🏆 LEGENDA',
    rank: 'ALAPÍTÓ · SZÓSZ RÉSZLEG · BAK FŐNI',
    quote: 'A házi szósz receptje titok. Még előttem is.',
    awards: [
      'Becenév: Bak Főni (a hűtőben a Bakok vigyázzban állnak, ha belép)',
      'A Balaton-part legnagyobb pitája',
      'Ő pecsételte le Tanbá szerződését',
    ],
    stats: [
      { label: 'Pitaméret', value: 100, note: 'XL, nem alkuképes' },
      { label: 'Szósz mennyiség', value: 97, note: 'két kézzel kell fogni' },
      { label: 'Válaszidő', value: 9, note: 'a kép még mindig tölt' },
    ],
  },
  tanba: {
    badge: '✍️ ÚJ IGAZOLÁS',
    pill: 'Friss tag',
    rank: 'FRISS IGAZOLÁS · KÉS RÉSZLEG',
    quote: 'Kétszer mondom ki, hogy „lock in”, és a gyroskés magától forog.',
    awards: [
      'Ex-étterem boss (nem sokan merték kérdezni)',
      'Mexikóiul is megkérdezi: hagyma, csípős mehet?',
      'Bajusz: 40 év tapasztalat, a többi még fiatal',
    ],
    stats: [
      { label: 'Késtechnika', value: 99, note: 'a hagyma már előre sír' },
      { label: 'Bajusz', value: 100, note: 'pár évtizeddel előrébb jár' },
      { label: 'Büfé-hűség', value: 88, note: 'a kötényt már le sem veszi' },
    ],
  },
}

type FeaturedProps = {
  profiles: FeaturedProfile[]
  onOrder: (profileId: string) => void
}

function Featured({ profiles, onOrder }: FeaturedProps) {
  return (
    <section className="listing featured-section" id="kiemelt">
      <div className="section-heading">
        <div>
          <p className="kicker dark">GYROS HÍRESSÉGEK CSARNOKA</p>
          <h2>Az alapító gyros fiúk</h2>
        </div>
        <p>Akik nélkül ez az oldal csak egy üres pita lenne.</p>
      </div>

      <div className="featured-list">
        {profiles.map((profile) => {
          const fame = hallOfFame[profile.id]

          return (
            <article className="featured-card" key={profile.id}>
              <div className="featured-photo" style={{ backgroundImage: `url(${profile.image})` }}>
                <span className="featured">{fame?.badge ?? '🏆 LEGENDA'}</span>
                {fame?.pill && <span className="online"><i /> {fame.pill}</span>}
                <span className="distance-pill">Tőled {profile.distanceLabel}</span>
              </div>
              <div className="featured-body">
                {fame && <p className="kicker dark">{fame.rank}</p>}
                <h3>{profile.name}, <span>{profile.age}</span></h3>
                <p className="featured-place">⌖ {profile.city}{profile.district ? `, ${profile.district}` : ''}</p>
                {fame && (
                  <>
                    <blockquote>„{fame.quote}”</blockquote>
                    <ul className="featured-awards">
                      {fame.awards.map((award) => <li key={award}>🏅 {award}</li>)}
                    </ul>
                    <div className="featured-stats">
                      {fame.stats.map((stat) => (
                        <div className="featured-stat" key={stat.label}>
                          <div>
                            <strong>{stat.label}</strong>
                            <span>{stat.value}%</span>
                          </div>
                          <div className="vote-bar"><i style={{ width: `${stat.value}%` }} /></div>
                          <small>{stat.note}</small>
                        </div>
                      ))}
                    </div>
                  </>
                )}
                <div className="featured-footer">
                  <strong>{profile.price}</strong>
                  <button type="button" className="search-button" onClick={() => onOrder(profile.id)}>
                    Rendelek tőle →
                  </button>
                </div>
              </div>
            </article>
          )
        })}
      </div>
    </section>
  )
}

export default Featured
