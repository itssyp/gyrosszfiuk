import type { ReactNode } from 'react'
import { createContext, useContext, useEffect, useState } from 'react'

type Consent = 'pending' | 'accepted' | 'declined'
type BanReason = 'consent' | 'spice'

const BanContext = createContext<(reason: BanReason) => void>(() => {})

// Lets any page send the visitor to the ban page.
export function useBan() {
  return useContext(BanContext)
}

const banCopy: Record<BanReason, { kicker: string; text: string; retry: string }> = {
  consent: {
    kicker: 'HOZZÁFÉRÉS MEGTAGADVA',
    text: 'Aki nem fogadja el a gyrosokat, annak itt nincs helye. A pita kihűlt, a szósz megalvadt, a gyros fiúk csalódottak.',
    retry: 'Meggondoltam magam, elfogadom a gyrosokat',
  },
  spice: {
    kicker: 'CSÍPŐSSÉGI SZABÁLYSÉRTÉS',
    text: 'Csípős nélkül vagy enyhén? Itt nem. A szakács sírva fakadt, a pita összecsuklott, a gyros fiúk szégyenükben elbújtak a hűtőben.',
    retry: 'Meggondoltam magam, kérek csípőset',
  },
}

const storageKey = 'gyros-consent'

function readConsent(): Consent {
  try {
    // The popup shows on every visit; only a ban is remembered between visits.
    return window.localStorage.getItem(storageKey) === 'declined' ? 'declined' : 'pending'
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
  const [banReason, setBanReason] = useState<BanReason>('consent')

  function choose(value: Consent) {
    saveConsent(value)
    setConsent(value)
    window.scrollTo(0, 0)
  }

  function ban(reason: BanReason) {
    setBanReason(reason)
    choose('declined')
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
          <p className="kicker">{banCopy[banReason].kicker}</p>
          <h1 id="banned-title">Ki vagy tiltva</h1>
          <p>{banCopy[banReason].text}</p>
          <button type="button" className="add-button banned-retry" onClick={() => choose('accepted')}>
            {banCopy[banReason].retry}
          </button>
        </section>
      </main>
    )
  }

  return (
    <BanContext.Provider value={ban}>
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
    </BanContext.Provider>
  )
}

export default GyrosConsent
