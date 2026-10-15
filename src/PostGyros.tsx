import type { FormEvent } from 'react'
import { useEffect, useState } from 'react'

const juicinessLabels = [
  'Száraz, mint a sivatag',
  'Kicsit szomjas',
  'Elmegy',
  'Szaftos',
  'Csöpög a könyöködön',
  'Mentőmellény kötelező',
]

const spinOptions = [
  { value: 'reggel', label: 'Ma reggel óta' },
  { value: 'tegnap', label: 'Tegnap óta' },
  { value: 'hetek', label: 'Pár hete' },
  { value: 'nemtudom', label: 'Nem emlékszem, de még forog' },
]

const features = [
  'Hagymás lehelet garantált',
  'Két kézzel is alig fogható',
  'Instagram-kész',
  'Fokhagymás szósz (holnapig érezni)',
  'Hajnali 3-kor is jól esik',
]

const moderationMs = 2500

function PostGyros() {
  const [juiciness, setJuiciness] = useState(3)
  const [spin, setSpin] = useState('reggel')
  const [photoNote, setPhotoNote] = useState('')
  const [submittedName, setSubmittedName] = useState<string | null>(null)
  const [isModerated, setIsModerated] = useState(false)

  useEffect(() => {
    if (!submittedName) {
      return
    }

    const timeoutId = window.setTimeout(() => setIsModerated(true), moderationMs)
    return () => window.clearTimeout(timeoutId)
  }, [submittedName])

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    // Nothing is saved: the "listing" only exists on this screen.
    const data = new FormData(event.currentTarget)
    setSubmittedName(String(data.get('gyrosName') ?? 'a gyrosod'))
    setIsModerated(false)
    window.scrollTo(0, 0)
  }

  function restart() {
    setSubmittedName(null)
    setIsModerated(false)
    setPhotoNote('')
    setJuiciness(3)
    setSpin('reggel')
  }

  if (submittedName) {
    return (
      <section className="listing post-section">
        <div className="order-done">
          <p className="kicker dark">HIRDETÉS BEKÜLDVE</p>
          {isModerated ? (
            <>
              <span className="post-result-emoji" aria-hidden="true">🥙😋</span>
              <h2>A moderátor megette</h2>
              <p className="order-maybe">Bocs, éhes volt.</p>
              <p>
                „{submittedName}” túl jól nézett ki ahhoz, hogy kikerüljön az oldalra.
                A moderátor szerint 10/10 volt, a hagymát kicsit sokallta.
                Hirdetésed így sajnos nem jelenik meg, de a szíveken (és a gyomrokban) örökké él.
              </p>
              <div className="order-done-actions">
                <button type="button" className="search-button" onClick={restart}>Feladok még egyet</button>
                <a className="consent-decline post-back" href="#fiuk">Vissza a gyros fiúkhoz</a>
              </div>
            </>
          ) : (
            <>
              <span className="post-result-emoji is-checking" aria-hidden="true">🧐</span>
              <h2>Moderálás folyamatban…</h2>
              <p aria-live="polite">A moderátor épp alaposan megvizsgálja a(z) „{submittedName}” hirdetést.</p>
            </>
          )}
        </div>
      </section>
    )
  }

  return (
    <section className="listing post-section">
      <div className="section-heading">
        <div>
          <p className="kicker dark">GYROS FELADÁSA</p>
          <h2>Mutasd meg, mid van</h2>
        </div>
        <p>Ingyenes, gyors, és senki nem kérdezi, mióta forog.</p>
      </div>

      <form className="order-form post-form" onSubmit={onSubmit}>
        <fieldset>
          <legend>A gyros</legend>
          <label>
            <span>A GYROS NEVE *</span>
            <input name="gyrosName" required maxLength={60} placeholder="pl. Szaftos Szilveszter" />
          </label>
          <label>
            <span>MIÓTA FOROG A NYÁRSON?</span>
            <select name="spin" value={spin} onChange={(event) => setSpin(event.target.value)}>
              {spinOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
            </select>
          </label>
          {(spin === 'hetek' || spin === 'nemtudom') && (
            <p className="post-warning">⚠️ Ezt a gyrost inkább ne add el. Esetleg nevezd be egy múzeumba.</p>
          )}
          <label>
            <span>SZAFTOSSÁG: {juicinessLabels[juiciness].toUpperCase()}</span>
            <input
              type="range"
              min={0}
              max={juicinessLabels.length - 1}
              value={juiciness}
              onChange={(event) => setJuiciness(Number(event.target.value))}
            />
          </label>
          <label>
            <span>ÁR (FT)</span>
            <input name="price" type="number" min={0} step={10} placeholder="pl. 1990" />
            <small className="post-hint">Javasolt ár: egy nagy ölelés és két sör.</small>
          </label>
        </fieldset>

        <fieldset>
          <legend>Extrák</legend>
          <div className="order-extras">
            {features.map((feature) => (
              <label className="order-check" key={feature}>
                <input type="checkbox" name="features" value={feature} />
                {feature}
              </label>
            ))}
          </div>
        </fieldset>

        <fieldset>
          <legend>Fotó</legend>
          <button
            type="button"
            className="consent-decline post-photo"
            onClick={() => setPhotoNote('📸 A kamera bepárásodott a gyros gőzétől. Higgyük el, hogy gyönyörű.')}
          >
            Fotó feltöltése
          </button>
          {photoNote && <p className="post-hint" aria-live="polite">{photoNote}</p>}
        </fieldset>

        <button type="submit" className="search-button order-submit">Hirdetés feladása</button>
        <small className="order-note">Semmit nem mentünk el. A hirdetésed sorsa a moderátor gyomrán múlik.</small>
      </form>
    </section>
  )
}

export default PostGyros
