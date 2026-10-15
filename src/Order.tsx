import type { FormEvent } from 'react'
import { useEffect, useState } from 'react'
import { useBan } from './GyrosConsent'
import OrderTracker from './OrderTracker'

type OrderProfile = {
  name: string
  city: string
  district: string
  price: string
  tags: string[]
  attributes: string[]
  image: string
  distanceLabel: string
}

const spiceLabels = ['Csípős nélkül', 'Enyhe', 'Közepes', 'Csípős', 'Nagyon csípős', 'Tűzoltót hívok']
// "Csípős nélkül" and "Enyhe" get the order rejected and the visitor banned.
const minAllowedSpice = 2
const banDelaySeconds = 3

type OrderSummary = {
  customer: string
  form: string
  spice: string
  onion: boolean
}

function Order({ profile }: { profile?: OrderProfile }) {
  const [spice, setSpice] = useState(2)
  const [summary, setSummary] = useState<OrderSummary | null>(null)
  const [isReady, setIsReady] = useState(false)
  const [banCountdown, setBanCountdown] = useState<number | null>(null)
  const ban = useBan()

  useEffect(() => {
    if (banCountdown === null) {
      return
    }

    if (banCountdown <= 0) {
      ban('spice')
      return
    }

    const timeoutId = window.setTimeout(() => setBanCountdown(banCountdown - 1), 1000)
    return () => window.clearTimeout(timeoutId)
  }, [ban, banCountdown])

  if (!profile) {
    return (
      <section className="listing order-section">
        <div className="empty">
          <strong>Ez a gyros fiú nem létezik.</strong>
          <span>Lehet, hogy épp szünetet tart. <a href="#fiuk">Vissza a gyros fiúkhoz</a></span>
        </div>
      </section>
    )
  }

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (spice < minAllowedSpice) {
      setBanCountdown(banDelaySeconds)
      return
    }

    // Nothing is saved or sent anywhere: the order only exists on this screen.
    const data = new FormData(event.currentTarget)
    setSummary({
      customer: String(data.get('customer') ?? ''),
      form: String(data.get('form') ?? ''),
      spice: spiceLabels[spice],
      onion: data.get('onion') === 'on',
    })
    setIsReady(false)
    window.scrollTo(0, 0)
  }

  if (summary) {
    return (
      <section className="listing order-section">
        <div className="order-done">
          <p className="kicker dark">RENDELÉS LEADVA</p>
          <h2>{isReady ? 'A gyros már úton van…' : `${profile.name} készíti a gyrosod`}</h2>
          <OrderTracker onReady={() => setIsReady(true)} />
          {isReady && (
            <>
              <p className="order-maybe">…de lehet, hogy nem.</p>
              <p>
                Kedves {summary.customer}! {profile.name} elkészítette a rendelésed
                ({summary.form}, {summary.spice.toLowerCase()}, {summary.onion ? 'hagymával' : 'hagyma nélkül'}).
                A gyros fiúk elfoglalt lurkók, úgyhogy ha nem érkezik meg, az sem a te hibád.
              </p>
              <div className="order-done-actions">
                <a className="search-button" href="#fiuk">Vissza a gyros fiúkhoz</a>
                <button type="button" className="consent-decline" onClick={() => setSummary(null)}>Még egyet kérek</button>
              </div>
            </>
          )}
        </div>
      </section>
    )
  }

  return (
    <section className="listing order-section">
      <a className="order-back" href="#fiuk">← Vissza a gyros fiúkhoz</a>
      <div className="section-heading">
        <div>
          <p className="kicker dark">GYROS RENDELÉS</p>
          <h2>Rendelés tőle: {profile.name}</h2>
        </div>
        <p>Tőled {profile.distanceLabel} · <strong>{profile.price}</strong></p>
      </div>

      <div className="order-layout">
        <aside className="order-profile">
          <div className="order-photo" style={{ backgroundImage: `url(${profile.image})` }} />
          <div className="order-profile-body">
            <h3>{profile.name}</h3>
            <p>⌖ {profile.city}{profile.district ? `, ${profile.district}` : ''}</p>
            <div className="tags">
              {profile.tags.map((tag) => <span key={tag}>{tag}</span>)}
            </div>
          </div>
        </aside>

        <form className="order-form" onSubmit={onSubmit}>
          <fieldset>
            <legend>Ki vagy?</legend>
            <label>
              <span>NÉV *</span>
              <input name="customer" required autoComplete="name" placeholder="pl. Gyros Gizi" />
            </label>
            <label>
              <span>SZÁLLÍTÁSI CÍM *</span>
              <input name="address" required autoComplete="street-address" placeholder="utca, házszám, emelet" />
            </label>
            <label>
              <span>TELEFONSZÁM *</span>
              <input name="phone" type="tel" required autoComplete="tel" placeholder="+36 ..." />
            </label>
          </fieldset>

          <fieldset>
            <legend>Milyen gyrost?</legend>
            <label>
              <span>FORMA</span>
              <select name="form" defaultValue="pitában">
                <option>pitában</option>
                <option>tálon</option>
                <option>XL pitában</option>
                <option>tortillában</option>
              </select>
            </label>
            <label>
              <span>CSÍPŐSSÉG: {spiceLabels[spice].toUpperCase()}</span>
              <input
                type="range"
                min={0}
                max={spiceLabels.length - 1}
                value={spice}
                onChange={(event) => setSpice(Number(event.target.value))}
              />
            </label>
            <label className="order-check">
              <input type="checkbox" name="onion" defaultChecked />
              Hagyma mehet
            </label>
            <div className="order-extras">
              <span>EXTRÁK</span>
              {profile.attributes.map((attribute) => (
                <label className="order-check" key={attribute}>
                  <input type="checkbox" name="extras" value={attribute} />
                  {attribute}
                </label>
              ))}
            </div>
            <label>
              <span>ÜZENET A GYROS FIÚNAK</span>
              <textarea name="note" rows={3} placeholder="pl. kérlek, most az egyszer érj ide" />
            </label>
          </fieldset>

          <fieldset>
            <legend>Fizetés</legend>
            <div className="order-pay">
              <label className="order-check"><input type="radio" name="pay" value="cash" defaultChecked /> Készpénz</label>
              <label className="order-check"><input type="radio" name="pay" value="card" /> Kártya a futárnál</label>
              <label className="order-check"><input type="radio" name="pay" value="hug" /> Egy nagy ölelés</label>
            </div>
          </fieldset>

          <button type="submit" className="search-button order-submit">Rendelés leadása · {profile.price}</button>
          <small className="order-note">Semmit nem mentünk el, a rendelés csak ezen a képernyőn létezik.</small>
        </form>
      </div>

      {banCountdown !== null && (
        <div className="consent-backdrop">
          <section className="consent-dialog reject-dialog" role="alertdialog" aria-modal="true" aria-labelledby="reject-title">
            <span className="reject-emoji" aria-hidden="true">🙅‍♂️</span>
            <h2 id="reject-title">Rendelés elutasítva</h2>
            <p>{spiceLabels[spice]}? Ez itt nem gyros, ez sértés.</p>
            <p className="reject-countdown">Kitiltás {Math.max(banCountdown, 0)} másodperc múlva…</p>
          </section>
        </div>
      )}
    </section>
  )
}

export default Order
