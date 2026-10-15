import type { CSSProperties } from 'react'
import { useEffect, useMemo, useState } from 'react'
import Featured from './Featured'
import GyrosConsent from './GyrosConsent'
import Order from './Order'
import SwipeDeck from './SwipeDeck'
import Voting from './Voting'

type Coordinates = {
  lat: number
  lon: number
}

type GyrosProfile = {
  id: string
  name: string
  city: string
  district: string
  age: number
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
    price: '1100 Ft',
    tags: ['marha', 'extra spicy'],
    attributes: ['extra meaty', 'extra fatty', 'home delivery', 'late night', 'csípős csomag'],
    image: '/1d1b7c24-ff5e-4087-bafd-34abe34d0116.jpg',
    fresh: 'most',
    coordinates: { lat: 46.8102, lon: 17.7707 },
  },
  {
    id: 'zalan',
    name: 'Zalán',
    city: 'Budapest',
    district: 'XI. kerület',
    age: 29,
    price: '2 290 Ft',
    tags: ['csirke', 'házi szósz'],
    attributes: ['extra szaftos', 'home delivery', 'XL pita', 'dupla hús', 'képet küld'],
    image: '/5eb7e080-08cd-4829-8577-faf0753e8c84.jpg',
    fresh: '3 perce',
    coordinates: { lat: 47.4661, lon: 19.0408 },
  },
]

const viralPopups = [
  { title: 'Ádi üzenetet küldött', text: '“jössz ma gyrosra?”', tone: 'hot' },
  { title: 'Zalán képet küldött', text: '1 új szaftos melléklet', tone: 'photo' },
  { title: 'Ádi aktív', text: 'most nézte meg a profilod', tone: 'online' },
  { title: 'Gyros riasztás', text: '2 fiú van a közeledben', tone: 'warning' },
  { title: 'Nem vírus', text: 'kattints ide egy extra szószért', tone: 'danger' },
  { title: 'Zalán rád nézett', text: 'a kép még mindig tölt...', tone: 'photo' },
  { title: 'Ádi gépel...', text: 'nagyon szaftos választ ír', tone: 'online' },
  { title: 'Akció lejár', text: '00:13 másodperc és kihűl', tone: 'hot' },
  { title: 'Engedélyezd a helyzeted', text: 'hogy a gyros találjon meg téged', tone: 'warning' },
]

const maxVisiblePopups = 3
const centerPopupCheckMs = 9000
const centerPopupChance = 0.5

function getPopupWindow(startIndex: number) {
  return Array.from(
    { length: maxVisiblePopups },
    (_, offset) => (startIndex + offset) % viralPopups.length,
  )
}
const isUnderConstruction = import.meta.env.VITE_UNDER_CONSTRUCTION === 'true'

type Tab = 'home' | 'swipe' | 'vote' | 'featured' | 'order'

const orderHashPrefix = '#rendeles/'

function getTabFromHash(hash: string): Tab {
  if (hash.startsWith(orderHashPrefix)) {
    return 'order'
  }

  const tabs: Record<string, Tab> = {
    '#swipe': 'swipe',
    '#szavazas': 'vote',
    '#kiemelt': 'featured',
  }

  return tabs[hash] ?? 'home'
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

function getCloseness(profile: GyrosProfile, distance: number) {
  if (distance < 1) {
    return `${profile.name} gyalog is veszélyesen közel van.`
  }

  if (distance < 10) {
    return `${profile.name} még bőven a forró zónában van.`
  }

  return `${profile.name} messzebb van, de a szósz már úton van.`
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
  const [popupStartIndex, setPopupStartIndex] = useState(0)
  const [dismissedPopups, setDismissedPopups] = useState<number[]>([])
  const [centerPopupIndex, setCenterPopupIndex] = useState<number | null>(null)
  const [hash, setHash] = useState(() => window.location.hash)
  const activeTab = getTabFromHash(hash)

  useEffect(() => {
    function onHashChange() {
      setHash(window.location.hash)

      if (getTabFromHash(window.location.hash) !== 'home') {
        window.scrollTo(0, 0)
      }
    }

    window.addEventListener('hashchange', onHashChange)
    return () => window.removeEventListener('hashchange', onHashChange)
  }, [])

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
      setPopupStartIndex((index) => (index + 1) % viralPopups.length)
    }, 4200)

    return () => window.clearInterval(intervalId)
  }, [])

  // A closed corner popup stays closed while it would still be on screen,
  // and comes back on the next round of the rotation.
  useEffect(() => {
    const popupWindow = getPopupWindow(popupStartIndex)
    setDismissedPopups((indexes) => indexes.filter((index) => popupWindow.includes(index)))
  }, [popupStartIndex])

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      if (Math.random() < centerPopupChance) {
        setCenterPopupIndex(
          (current) => current ?? Math.floor(Math.random() * viralPopups.length),
        )
      }
    }, centerPopupCheckMs)

    return () => window.clearInterval(intervalId)
  }, [])

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
      getPopupWindow(popupStartIndex)
        .filter((popupIndex) => !dismissedPopups.includes(popupIndex))
        .map((popupIndex) => ({
          ...viralPopups[popupIndex],
          popupIndex,
        })),
    [dismissedPopups, popupStartIndex],
  )

  return (
    <div className="site">
      <header className="topbar">
        <div className="topbar-inner">
          <a className="brand" href="#" aria-label="Gyrosszfiuk főoldal">
            gyrosszfiuk<span>.hu</span>
          </a>
          <nav aria-label="Fő navigáció">
            <a className={activeTab === 'home' ? 'active' : ''} href="#fiuk">Gyros fiúk</a>
            <a className={activeTab === 'featured' ? 'active' : ''} href="#kiemelt">Kiemeltek</a>
            <a className={`nav-swipe ${activeTab === 'swipe' ? 'active' : ''}`} href="#swipe">Swipe 🔥</a>
            <a className={`nav-swipe ${activeTab === 'vote' ? 'active' : ''}`} href="#szavazas">Szavazás 🗳️</a>
            <a href="#etterem">Éttermek</a>
          </nav>
          <div className="account">
            <button className="ghost-button">Belépés</button>
            <button className="add-button"><span>+</span> Gyros feladása</button>
          </div>
        </div>
      </header>

      {activeTab === 'swipe' ? (
        <main>
          <SwipeDeck profiles={enrichedProfiles} />
        </main>
      ) : activeTab === 'vote' ? (
        <main>
          <Voting />
        </main>
      ) : activeTab === 'featured' ? (
        <main>
          <Featured profiles={enrichedProfiles} onOrder={openOrder} />
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
                <option>Budapest</option>
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
              <h2>Csak a két gyros fiú</h2>
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
                    <button type="button" onClick={() => openOrder(profile.id)}>Megnézem <span>→</span></button>
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
          <button>Ingyenes hirdetés feladása <span>→</span></button>
        </section>
      </main>
      )}

      <aside className="virus-popups" aria-label="Felugró értesítések">
        {visiblePopups.map((popup, index) => (
          <div
            className={`virus-popup ${popup.tone}`}
            style={{ '--delay': `${index * 0.18}s`, '--shift': `${index * 18}px` } as CSSProperties}
            key={`${popup.title}-${popup.popupIndex}`}
          >
            <button
              type="button"
              aria-label="Bezárás"
              onClick={() => setDismissedPopups((indexes) => [...indexes, popup.popupIndex])}
            >
              ×
            </button>
            <strong>{popup.title}</strong>
            <span>{popup.text}</span>
          </div>
        ))}
      </aside>

      {centerPopupIndex !== null && (
        <div className="virus-center" key={centerPopupIndex}>
          <div className={`virus-popup is-center ${viralPopups[centerPopupIndex].tone}`} role="alert">
            <button type="button" aria-label="Bezárás" onClick={() => setCenterPopupIndex(null)}>×</button>
            <strong>{viralPopups[centerPopupIndex].title}</strong>
            <span>{viralPopups[centerPopupIndex].text}</span>
          </div>
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
