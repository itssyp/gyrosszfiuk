import type { CSSProperties } from 'react'
import { useEffect, useMemo, useState } from 'react'
import Featured from './Featured'
import GyrosConsent from './GyrosConsent'
import News from './News'
import Order from './Order'
import PostGyros from './PostGyros'
import Restaurant from './Restaurant'
import SwipeDeck from './SwipeDeck'
import Voting from './Voting'

type Coordinates = {
  lat: number
  lon: number
}

type GyrosProfile = {
  id: string
  name: string
  // Newly signed gyros boy: gets a "Friss tag" pill on the home cards.
  isNew?: boolean
  city: string
  district: string
  // A menu of several boys can show e.g. "átlag 20,5".
  age: number | string
  price: string
  tags: string[]
  attributes: string[]
  image: string
  fresh: string
  coordinates: Coordinates
}

const fallbackLocation: Coordinates = {
  lat: 46.8102,
  lon: 17.7707,
}

const profiles: GyrosProfile[] = [
  {
    id: 'adi',
    name: 'Ádi',
    city: 'Balatonszemes',
    district: '',
    age: 22,
    price: '1 990 Ft',
    tags: ['marha', 'extra spicy'],
    attributes: ['extra meaty', 'extra fatty', 'home delivery', 'late night', 'csípős csomag'],
    image: '/1d1b7c24-ff5e-4087-bafd-34abe34d0116.jpg',
    fresh: 'most',
    coordinates: { lat: 46.8102, lon: 17.7707 },
  },
  {
    id: 'zalan',
    name: 'Zalán',
    city: 'Balatonszemes',
    district: '',
    age: 29,
    price: '1 990 Ft',
    tags: ['csirke', 'házi szósz'],
    attributes: ['extra szaftos', 'home delivery', 'XL pita', 'dupla hús', 'képet küld'],
    image: '/5eb7e080-08cd-4829-8577-faf0753e8c84.jpg',
    fresh: '3 perce',
    coordinates: { lat: 46.8125, lon: 17.7660 },
  },
  {
    id: 'tanba',
    name: 'Tanbá',
    isNew: true,
    city: 'Velence',
    district: '',
    age: 40,
    price: '1 100 Ft',
    tags: ['késművész', 'bajusz-garancia'],
    attributes: ['2x lock in', 'ex-étterem boss', 'mexikói hagymás', 'büfés kötény'],
    image: '/jeloltek/tanba.jpg',
    fresh: 'friss igazolás',
    coordinates: { lat: 47.2386, lon: 18.6514 },
  },
  {
    id: 'balazs',
    name: 'Balázs menü',
    isNew: true,
    city: 'Velence',
    district: '',
    age: 'átlag 20,5',
    price: '1 500 Ft',
    tags: ['2 db Balázs', 'választható szósz'],
    attributes: ['csak együtt kapható', 'kórusban kérdez', 'megkülönböztethetetlen', '-10%, de mihez képest?'],
    image: '/jeloltek/balazs-menu.jpg',
    fresh: 'friss igazolás',
    coordinates: { lat: 47.2415, lon: 18.6420 },
  },
]

// On the Swipe tab the Balázs menü shows up as two cards that must be decided together.
const swipeSplits: Record<string, { name: string; age: number; image: string }[]> = {
  balazs: [
    { name: 'Baloldali Balázs', age: 21, image: '/jeloltek/balazs-bal.jpg' },
    { name: 'Jobboldali Balázs', age: 20, image: '/jeloltek/balazs-jobb.jpg' },
  ],
}

// {name} in a popup title is swapped for a random gyros boy every time the popup appears.
const popupNames = ['Ádi', 'Zalán', 'Tanbá', 'Balázs', 'Rabó', 'Széwald', 'Soltész', 'Mr. Amerika']

const viralPopups = [
  { title: '{name} elhívott egy mysteryboxra', text: 'hogy mi van benne? csak a pita tudja', tone: 'mystery' },
  { title: '{name} üzenetet küldött', text: '“jössz ma gyrosra?”', tone: 'hot' },
  { title: '{name} videóhívást indított', text: 'Össznépi chat: megint csörög 📞', tone: 'online' },
  { title: '{name} képet küldött', text: '1 új szaftos melléklet', tone: 'photo' },
  { title: '{name} aktív', text: 'most nézte meg a profilod', tone: 'online' },
  { title: 'Gyros riasztás', text: '2 fiú van a közeledben', tone: 'warning' },
  { title: 'Nem vírus', text: 'kattints ide egy extra szószért', tone: 'danger' },
  { title: '{name} rád nézett', text: 'a kép még mindig tölt...', tone: 'photo' },
  { title: '{name} gépel...', text: 'nagyon szaftos választ ír', tone: 'online' },
  { title: 'Akció lejár', text: '00:13 másodperc és kihűl', tone: 'hot' },
  { title: 'Engedélyezd a helyzeted', text: 'hogy a gyros találjon meg téged', tone: 'warning' },
  { title: '{name} gólt lőtt', text: 'egyenesen a pitába, a VAR szerint is szabályos', tone: 'online' },
  { title: 'Piros lap!', text: 'valaki csípős nélkül kérte a gyrost', tone: 'danger' },
  { title: '¡Olé! {name} megérkezett', text: 'sombreróban hozza a dupla húst', tone: 'hot' },
  { title: 'Les!', text: 'a hagyma túl korán futott be a pitába', tone: 'warning' },
  { title: '{name} tizenegyest kért', text: 'tizenegy extra jalapeñót a gyrosba', tone: 'hot' },
  { title: '{name} átigazolt', text: 'a tortilláktól a pitákhoz, 73 teve volt a vételár', tone: 'photo' },
  { title: 'Hosszabbítás', text: '+5 perc, mire a szósz eléri a könyököd', tone: 'warning' },
]

const maxVisiblePopups = 3
const centerPopupCheckMs = 9000
const centerPopupChance = 0.5
// Chance that a centre popup shows up three times bigger than usual.
const hugePopupChance = 0.15
// Clicking a popup anywhere but its X spawns another one somewhere random,
// a bit bigger than the one clicked, up to this many extra popups at once.
const maxSpawnedPopups = 15
const spawnScaleStep = 0.12
const maxSpawnScale = 1.6

type SpawnedPopup = { id: number; index: number; name: string; x: number; y: number; scale: number }

let nextSpawnedPopupId = 1

function randomPopupName() {
  return popupNames[Math.floor(Math.random() * popupNames.length)]
}

// Each corner popup appearance gets a random name once and keeps it while
// it is on screen; the next round of the rotation draws a new one.
const appearanceNames = new Map<number, string>()

function popupNameFor(appearance: number) {
  let name = appearanceNames.get(appearance)

  if (!name) {
    name = randomPopupName()
    appearanceNames.set(appearance, name)
  }

  return name
}

function fillPopupName(title: string, name: string) {
  return title.replace('{name}', name)
}

// Each corner popup appearance has its own number: tick + its slot.
function getPopupWindow(tick: number) {
  return Array.from({ length: maxVisiblePopups }, (_, offset) => tick + offset)
}
const isUnderConstruction = import.meta.env.VITE_UNDER_CONSTRUCTION === 'true'

type Tab = 'home' | 'swipe' | 'vote' | 'featured' | 'order' | 'post' | 'restaurant' | 'news'

const orderHashPrefix = '#rendeles/'

function getTabFromHash(hash: string): Tab {
  if (hash.startsWith(orderHashPrefix)) {
    return 'order'
  }

  const tabs: Record<string, Tab> = {
    '#swipe': 'swipe',
    '#szavazas': 'vote',
    '#kiemelt': 'featured',
    '#feladas': 'post',
    '#etterem': 'restaurant',
    '#hirek': 'news',
  }

  return tabs[hash] ?? 'home'
}

const navLinks: { tab: Tab; href: string; label: string }[] = [
  { tab: 'home', href: '#fiuk', label: 'Gyros fiúk' },
  { tab: 'featured', href: '#kiemelt', label: 'Kiemeltek' },
  { tab: 'swipe', href: '#swipe', label: 'Swipe 🔥' },
  { tab: 'vote', href: '#szavazas', label: 'Szavazás 🗳️' },
  { tab: 'news', href: '#hirek', label: 'Gyros hírek 📰' },
  { tab: 'restaurant', href: '#etterem', label: 'Éttermek' },
]

function openPostPage() {
  window.location.hash = 'feladas'
}

function openOrder(profileId: string) {
  window.location.hash = `${orderHashPrefix}${profileId}`
}

function toRadians(value: number) {
  return (value * Math.PI) / 180
}

function getDistanceKm(from: Coordinates, to: Coordinates) {
  const earthRadiusKm = 6371
  const deltaLat = toRadians(to.lat - from.lat)
  const deltaLon = toRadians(to.lon - from.lon)
  const lat1 = toRadians(from.lat)
  const lat2 = toRadians(to.lat)

  const a =
    Math.sin(deltaLat / 2) ** 2 +
    Math.sin(deltaLon / 2) ** 2 * Math.cos(lat1) * Math.cos(lat2)

  return earthRadiusKm * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

function formatDistance(distance: number) {
  if (distance < 1) {
    return `${Math.max(50, Math.round(distance * 1000))} m`
  }

  return `${distance.toFixed(distance < 10 ? 1 : 0)} km`
}

// Each gyros boy's own line for: under 1 km, under 10 km, further away.
const closenessLines: Record<string, [string, string, string]> = {
  adi: [
    'Ádi gyalog is veszélyesen közel van.',
    'Ádi már bemelegítette a csípős szószt, pár perc és ott van.',
    'Ádi messze van, de a csípős illata már megelőzte.',
  ],
  zalan: [
    'Zalán olyan közel van, hogy hallod, ahogy kinyit egy Bakot.',
    'Zalán már úton van, a képet előre elküldte.',
    'Zalán messzebb van, de egy XL pitáért a Balatont is átússza.',
  ],
  tanba: [
    'Tanbá a sarkon van, a bajusza már be is fordult.',
    'Tanbá kétszer mondta, hogy lock in, és már úton is van.',
    'Tanbá messzebb van, de a szósz már úton van.',
  ],
  balazs: [
    'A Balázsok olyan közel vannak, hogy már azon vitatkoznak, melyikük csöngessen.',
    'A Balázsok úton vannak, kéz a kézben, mert külön nem közlekedhetnek.',
    'A Balázsok messze vannak, de kettesével kétszer olyan gyorsan érnek oda.',
  ],
}

function getCloseness(profile: GyrosProfile, distance: number) {
  const band = distance < 1 ? 0 : distance < 10 ? 1 : 2
  const lines = closenessLines[profile.id]

  if (lines) {
    return lines[band]
  }

  return [
    `${profile.name} gyalog is veszélyesen közel van.`,
    `${profile.name} még bőven a forró zónában van.`,
    `${profile.name} messzebb van, de a szósz már úton van.`,
  ][band]
}

function UnderConstruction() {
  return (
    <main className="construction-page">
      <section className="construction-card" aria-labelledby="construction-title">
        <a className="brand" href="#" aria-label="Gyrosszfiuk főoldal">
          gyrosszfiuk<span>.hu</span>
        </a>
        <p className="kicker">HAMAROSAN NYITUNK</p>
        <h1 id="construction-title">Under construction</h1>
        <p>Az oldal jelenleg fejlesztés alatt áll.</p>
      </section>
    </main>
  )
}

function App() {
  if (isUnderConstruction) {
    return <UnderConstruction />
  }

  return (
    <GyrosConsent>
      <Site />
    </GyrosConsent>
  )
}

function Site() {
  const [city, setCity] = useState('Minden város')
  const [query, setQuery] = useState('')
  const [onlyOpen, setOnlyOpen] = useState(false)
  const [viewerLocation, setViewerLocation] = useState<Coordinates>(fallbackLocation)
  const [locationLabel, setLocationLabel] = useState('Balatonszemes')
  const [locationStatus, setLocationStatus] = useState('alapértelmezett hely')
  const [popupTick, setPopupTick] = useState(0)
  const [dismissedPopups, setDismissedPopups] = useState<number[]>([])
  const [spawnedPopups, setSpawnedPopups] = useState<SpawnedPopup[]>([])
  const [centerPopup, setCenterPopup] = useState<{
    index: number
    name: string
    x: number
    y: number
    huge: boolean
  } | null>(null)
  const [hash, setHash] = useState(() => window.location.hash)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const activeTab = getTabFromHash(hash)

  useEffect(() => {
    function onHashChange() {
      setHash(window.location.hash)
      setIsMenuOpen(false)

      if (getTabFromHash(window.location.hash) !== 'home') {
        window.scrollTo(0, 0)
      }
    }

    window.addEventListener('hashchange', onHashChange)
    return () => window.removeEventListener('hashchange', onHashChange)
  }, [])

  useEffect(() => {
    if (!isMenuOpen) {
      return
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsMenuOpen(false)
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [isMenuOpen])

  useEffect(() => {
    if (!navigator.geolocation) {
      return
    }

    setLocationStatus('helyzet lekérése...')

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const nextLocation = {
          lat: position.coords.latitude,
          lon: position.coords.longitude,
        }

        setViewerLocation(nextLocation)
        setLocationLabel('aktuális helyzeted')
        setLocationStatus('valós hely alapján')
      },
      () => {
        setViewerLocation(fallbackLocation)
        setLocationLabel('Balatonszemes')
        setLocationStatus('Balatonszemes fallback')
      },
      {
        enableHighAccuracy: true,
        maximumAge: 60000,
        timeout: 7000,
      },
    )
  }, [])

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setPopupTick((tick) => tick + 1)
    }, 4200)

    return () => window.clearInterval(intervalId)
  }, [])

  // A closed corner popup stays closed while it would still be on screen,
  // and comes back (with a new name) on the next round of the rotation.
  useEffect(() => {
    setDismissedPopups((appearances) => appearances.filter((appearance) => appearance >= popupTick))
  }, [popupTick])

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      if (Math.random() < centerPopupChance) {
        setCenterPopup(
          (current) =>
            current ?? {
              index: Math.floor(Math.random() * viralPopups.length),
              name: randomPopupName(),
              x: Math.random() * 100,
              y: Math.random() * 100,
              huge: Math.random() < hugePopupChance,
            },
        )
      }
    }, centerPopupCheckMs)

    return () => window.clearInterval(intervalId)
  }, [])

  function spawnPopup(fromScale = 1) {
    setSpawnedPopups((current) => {
      if (current.length >= maxSpawnedPopups) {
        return current
      }

      return [
        ...current,
        {
          id: nextSpawnedPopupId++,
          index: Math.floor(Math.random() * viralPopups.length),
          name: randomPopupName(),
          x: Math.random() * 100,
          y: Math.random() * 100,
          scale: Math.min(maxSpawnScale, fromScale + spawnScaleStep),
        },
      ]
    })
  }

  const enrichedProfiles = useMemo(
    () =>
      profiles.map((profile) => {
        const distance = getDistanceKm(viewerLocation, profile.coordinates)

        return {
          ...profile,
          distance,
          distanceLabel: formatDistance(distance),
          closeness: getCloseness(profile, distance),
        }
      }),
    [viewerLocation],
  )

  const visibleProfiles = useMemo(
    () =>
      enrichedProfiles.filter((profile) => {
        const cityMatches = city === 'Minden város' || profile.city === city
        const text = `${profile.name} ${profile.city} ${profile.tags.join(' ')}`.toLowerCase()
        return cityMatches && text.includes(query.toLowerCase())
      }),
    [city, enrichedProfiles, query],
  )

  const visiblePopups = useMemo(
    () =>
      getPopupWindow(popupTick)
        .filter((appearance) => !dismissedPopups.includes(appearance))
        .map((appearance) => {
          const popup = viralPopups[appearance % viralPopups.length]

          return {
            ...popup,
            title: fillPopupName(popup.title, popupNameFor(appearance)),
            appearance,
          }
        }),
    [dismissedPopups, popupTick],
  )

  return (
    <div className="site">
      <header className="topbar">
        <div className="topbar-inner">
          <a className="brand" href="#" aria-label="Gyrosszfiuk főoldal">
            gyrosszfiuk<span>.hu</span>
          </a>
          <nav aria-label="Fő navigáció">
            {navLinks.map((link) => (
              <a className={activeTab === link.tab ? 'active' : ''} href={link.href} key={link.href}>{link.label}</a>
            ))}
          </nav>
          <div className="account">
            <button className="ghost-button">Belépés</button>
            <button type="button" className="add-button" onClick={openPostPage}><span>+</span> Gyros feladása</button>
          </div>
          <button
            type="button"
            className={`menu-toggle ${isMenuOpen ? 'is-open' : ''}`}
            aria-expanded={isMenuOpen}
            aria-controls="mobile-menu"
            onClick={() => setIsMenuOpen((open) => !open)}
          >
            <span aria-hidden="true">{isMenuOpen ? '✕' : '☰'}</span> Menü
          </button>
        </div>
        {isMenuOpen && (
          <nav className="mobile-menu" id="mobile-menu" aria-label="Mobil menü">
            {navLinks.map((link) => (
              <a
                className={activeTab === link.tab ? 'active' : ''}
                href={link.href}
                key={link.href}
                onClick={() => setIsMenuOpen(false)}
              >
                {link.label}
              </a>
            ))}
            <button
              type="button"
              className="add-button"
              onClick={() => {
                setIsMenuOpen(false)
                openPostPage()
              }}
            >
              <span>+</span> Gyros feladása
            </button>
          </nav>
        )}
      </header>

      {activeTab === 'swipe' ? (
        <main>
          <SwipeDeck
            profiles={enrichedProfiles.flatMap((profile) =>
              swipeSplits[profile.id]
                ? swipeSplits[profile.id].map((part) => ({ ...profile, ...part, group: profile.id }))
                : [profile],
            )}
          />
        </main>
      ) : activeTab === 'vote' ? (
        <main>
          <Voting />
        </main>
      ) : activeTab === 'featured' ? (
        <main>
          <Featured profiles={enrichedProfiles} onOrder={openOrder} />
        </main>
      ) : activeTab === 'news' ? (
        <main>
          <News />
        </main>
      ) : activeTab === 'restaurant' ? (
        <main>
          <Restaurant />
        </main>
      ) : activeTab === 'post' ? (
        <main>
          <PostGyros />
        </main>
      ) : activeTab === 'order' ? (
        <main>
          <Order
            key={hash}
            profile={enrichedProfiles.find((profile) => `${orderHashPrefix}${profile.id}` === hash)}
          />
        </main>
      ) : (
      <main>
        <section className="hero">
          <div className="hero-inner">
            <div>
              <p className="kicker">MAGYARORSZÁG LEGSZAFTOSABB OLDALA</p>
              <h1>Találd meg az<br /><em>igazi nagy Ő-t.</em></h1>
              <p className="intro">
                Friss, forró és pont rád vár. Válogass a környék legjobb gyros fiúk
                közül — komoly kapcsolat pitában vagy tálon.
              </p>
            </div>
            <div className="hero-stamp" aria-hidden="true">
              <span>100%</span>
              <strong>FRISS</strong>
              <small>MINDEN NAP</small>
            </div>
          </div>
        </section>

        <section className="search-panel" aria-label="Gyros kereső">
          <div className="search-grid">
            <label>
              <span>HOL KERESEL?</span>
              <select value={city} onChange={(event) => setCity(event.target.value)}>
                <option>Minden város</option>
                <option>Balatonszemes</option>
                <option>Velence</option>
              </select>
            </label>
            <label>
              <span>MIRE VÁGYSZ?</span>
              <div className="query-wrap">
                <input
                  type="search"
                  placeholder="pl. Ádi, Zalán, csípős, kép..."
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                />
                <b>⌕</b>
              </div>
            </label>
            <label className="toggle-label">
              <span>ELÉRHETŐSÉG</span>
              <button
                className={`toggle ${onlyOpen ? 'on' : ''}`}
                type="button"
                aria-pressed={onlyOpen}
                onClick={() => setOnlyOpen((value) => !value)}
              >
                <i />
                Most nyitva
              </button>
            </label>
            <button className="search-button" type="button">Keresés</button>
          </div>
        </section>

        <section className="listing" id="fiuk">
          <div className="section-heading">
            <div>
              <p className="kicker dark">VÍRUSOSAN KIEMELT KÍNÁLAT</p>
              <h2>Csak a három gyros fiú és egy Balázs menü</h2>
            </div>
            <p><strong>{visibleProfiles.length}</strong> szaftos találat innen: {locationLabel}</p>
          </div>

          <div className="profile-grid highlight-grid">
            {visibleProfiles.map((profile) => (
              <article className="profile-card highlight-card" key={profile.name}>
                <div
                  className="profile-image"
                  style={{
                    backgroundImage: `url(${profile.image})`,
                  }}
                >
                  <span className="featured">KIEMELT</span>
                  <span className="online"><i /> Nyitva</span>
                  {profile.isNew && <span className="online fresh-pill"><i /> Friss tag</span>}
                  <span className="distance-pill">Tőled {profile.distanceLabel}</span>
                  <button className="heart" aria-label={`${profile.name} mentése`}>♡</button>
                </div>
                <div className="profile-body">
                  <div className="location-context">
                    <span>Te: {locationLabel}</span>
                    <strong>{profile.distanceLabel}</strong>
                  </div>
                  <p className="location-status">{locationStatus}</p>
                  <div className="profile-title">
                    <div>
                      <h3>{profile.name}, <span>{profile.age}</span></h3>
                      <p>⌖ {profile.city}{profile.district ? `, ${profile.district}` : ''}</p>
                    </div>
                    <strong>{profile.price}</strong>
                  </div>
                  <div className="tags">
                    {profile.tags.map((tag) => <span key={tag}>{tag}</span>)}
                  </div>
                  <div className="attribute-list" aria-label={`${profile.name} extra tulajdonságai`}>
                    {profile.attributes.map((attribute) => <span key={attribute}>{attribute}</span>)}
                  </div>
                  <p className="closeness-copy">{profile.closeness}</p>
                  <div className="card-footer">
                    <small>Frissítve: {profile.fresh}</small>
                    <button type="button" className="view-button" onClick={() => openOrder(profile.id)}>Megnézem <span>→</span></button>
                  </div>
                </div>
              </article>
            ))}
          </div>

          {visibleProfiles.length === 0 && (
            <div className="empty">
              <strong>Itt most nincs senki.</strong>
              <span>Próbálj másik várost vagy kevésbé válogatós keresést.</span>
            </div>
          )}
        </section>

        <section className="cta">
          <div>
            <p className="kicker">VAN EGY JÓ GYROSOD?</p>
            <h2>Mutasd meg, mid van.</h2>
            <p>A hirdetés feladása gyorsabb, mint elfogyasztani egy pitát.</p>
          </div>
          <button type="button" onClick={openPostPage}>Ingyenes hirdetés feladása <span>→</span></button>
        </section>
      </main>
      )}

      <aside className="virus-popups" aria-label="Felugró értesítések">
        {visiblePopups.map((popup, index) => (
          <div
            className={`virus-popup ${popup.tone}`}
            style={{ '--delay': `${index * 0.18}s`, '--shift': `${index * 18}px` } as CSSProperties}
            key={popup.appearance}
            onClick={() => spawnPopup()}
          >
            <button
              type="button"
              aria-label="Bezárás"
              onClick={(event) => {
                event.stopPropagation()
                setDismissedPopups((appearances) => [...appearances, popup.appearance])
              }}
            >
              ×
            </button>
            <strong>{popup.title}</strong>
            <span>{popup.text}</span>
          </div>
        ))}
      </aside>

      {(centerPopup || spawnedPopups.length > 0) && (
        <div className="virus-center">
          {/* x/y are percentages; the matching translate keeps each popup fully on screen. */}
          {centerPopup && (
            <div
              className={`virus-center-spot ${centerPopup.huge ? 'is-huge' : ''}`}
              style={{
                left: `${centerPopup.x}%`,
                top: `${centerPopup.y}%`,
                transform: `translate(-${centerPopup.x}%, -${centerPopup.y}%)`,
              }}
            >
              <div
                className={`virus-popup is-center ${viralPopups[centerPopup.index].tone}`}
                role="alert"
                onClick={() => spawnPopup()}
              >
                <button
                  type="button"
                  aria-label="Bezárás"
                  onClick={(event) => {
                    event.stopPropagation()
                    setCenterPopup(null)
                  }}
                >
                  ×
                </button>
                <strong>{fillPopupName(viralPopups[centerPopup.index].title, centerPopup.name)}</strong>
                <span>{viralPopups[centerPopup.index].text}</span>
              </div>
            </div>
          )}
          {spawnedPopups.map((popup) => (
            <div
              className="virus-center-spot"
              key={popup.id}
              style={{
                left: `${popup.x}%`,
                top: `${popup.y}%`,
                width: `min(${Math.round(460 * popup.scale)}px, 100%)`,
                transform: `translate(-${popup.x}%, -${popup.y}%)`,
                '--popup-scale': popup.scale,
              } as CSSProperties}
            >
              <div
                className={`virus-popup is-center ${viralPopups[popup.index].tone}`}
                role="alert"
                onClick={() => spawnPopup(popup.scale)}
              >
                <button
                  type="button"
                  aria-label="Bezárás"
                  onClick={(event) => {
                    event.stopPropagation()
                    setSpawnedPopups((current) => current.filter((item) => item.id !== popup.id))
                  }}
                >
                  ×
                </button>
                <strong>{fillPopupName(viralPopups[popup.index].title, popup.name)}</strong>
                <span>{viralPopups[popup.index].text}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      <footer>
        <a className="brand" href="#">gyrosszfiuk<span>.hu</span></a>
        <p>Csak gyros. Semmi mellébeszélés. © 2026</p>
        <div><a href="#">Kapcsolat</a><a href="#">ÁSZF</a><a href="#">Adatvédelem</a></div>
      </footer>
    </div>
  )
}

export default App
