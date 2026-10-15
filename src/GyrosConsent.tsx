import type { ReactNode } from 'react'
import { useEffect, useState } from 'react'

type Consent = 'pending' | 'accepted' | 'declined'

const storageKey = 'gyros-consent'

function readConsent(): Consent {
  try {
    const value = window.localStorage.getItem(storageKey)
    return value === 'accepted' || value === 'declined' ? value : 'pending'
  } catch {
    return 'pending'
  }
}

function saveConsent(value: Consent) {
  try {
    window.localStorage.setItem(storageKey, value)
  } catch {
    // Private mode or blocked storage: the choice just won't be remembered.
  }
}

function GyrosConsent({ children }: { children: ReactNode }) {
  const [consent, setConsent] = useState<Consent>(readConsent)

  function choose(value: Consent) {
    saveConsent(value)
    setConsent(value)
    window.scrollTo(0, 0)
  }

  useEffect(() => {
    document.body.style.overflow = consent === 'pending' ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [consent])

  if (consent === 'declined') {
    return (
      <main className="construction-page banned-page">
        <section className="construction-card banned-card" aria-labelledby="banned-title">
          <a className="brand" href="#" aria-label="Gyrosszfiuk főoldal">
            gyrosszfiuk<span>.hu</span>
          </a>
          <p className="kicker">HOZZÁFÉRÉS MEGTAGADVA</p>
          <h1 id="banned-title">Ki vagy tiltva</h1>
          <p>
            Aki nem fogadja el a gyrosokat, annak itt nincs helye. A pita kihűlt,
            a szósz megalvadt, a gyros fiúk csalódottak.
          </p>
          <button type="button" className="add-button banned-retry" onClick={() => choose('accepted')}>
            Meggondoltam magam, elfogadom a gyrosokat
          </button>
        </section>
      </main>
    )
  }

  return (
    <>
      {children}
      {consent === 'pending' && (
        <div className="consent-backdrop">
          <section
            className="consent-dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="consent-title"
          >
            <p className="kicker dark">GYROS BEÁLLÍTÁSOK</p>
            <h2 id="consent-title">Elfogadod a gyrosokat?</h2>
            <p>
              Ez az oldal gyrosokat használ a legszaftosabb élmény érdekében. A
              gyrosok segítenek megjegyezni, mennyi hagymát kérsz, és melyik gyros
              fiútól rendelnél legszívesebben.
            </p>
            <ul className="consent-list">
              <li><strong>Alapvető gyrosok</strong> nélkülük az oldal nem működik</li>
              <li><strong>Csípős szósz</strong> a személyre szabott csípősségért</li>
              <li><strong>Extra hagyma</strong> marketing célú gyrosok</li>
            </ul>
            <div className="consent-actions">
              <button type="button" className="consent-decline" onClick={() => choose('declined')}>
                Elutasítom
              </button>
              <button type="button" className="search-button" onClick={() => choose('accepted')}>
                Elfogadom a gyrosokat
              </button>
            </div>
          </section>
        </div>
      )}
    </>
  )
}

export default GyrosConsent
