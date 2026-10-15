import type { CSSProperties, PointerEvent, ReactNode } from 'react'
import { useEffect, useRef, useState } from 'react'

export type SwipeProfile = {
  name: string
  age: number
  city: string
  district: string
  price: string
  tags: string[]
  image: string
  distanceLabel: string
}

type Decision = 'like' | 'nope'

const swipeThreshold = 110
const flyOutMs = 320

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value))
}

function SwipeDeck({ profiles }: { profiles: SwipeProfile[] }) {
  const [index, setIndex] = useState(0)
  const [drag, setDrag] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [leaving, setLeaving] = useState<Decision | null>(null)
  const [liked, setLiked] = useState<string[]>([])
  const dragStart = useRef<{ x: number; y: number } | null>(null)

  const current = profiles[index]
  const next = profiles[index + 1]

  function decide(decision: Decision) {
    if (!current || leaving) {
      return
    }

    setLeaving(decision)

    if (decision === 'like') {
      setLiked((names) => [...names, current.name])
    }

    window.setTimeout(() => {
      setIndex((value) => value + 1)
      setLeaving(null)
      setDrag({ x: 0, y: 0 })
    }, flyOutMs)
  }

  function restart() {
    setIndex(0)
    setLiked([])
    setDrag({ x: 0, y: 0 })
  }

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'ArrowLeft') {
        decide('nope')
      } else if (event.key === 'ArrowRight') {
        decide('like')
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  })

  function onPointerDown(event: PointerEvent<HTMLDivElement>) {
    if (leaving) {
      return
    }

    event.currentTarget.setPointerCapture(event.pointerId)
    dragStart.current = { x: event.clientX, y: event.clientY }
    setIsDragging(true)
  }

  function onPointerMove(event: PointerEvent<HTMLDivElement>) {
    if (!dragStart.current) {
      return
    }

    setDrag({
      x: event.clientX - dragStart.current.x,
      y: event.clientY - dragStart.current.y,
    })
  }

  function onPointerUp() {
    if (!dragStart.current) {
      return
    }

    dragStart.current = null
    setIsDragging(false)

    if (drag.x > swipeThreshold) {
      decide('like')
    } else if (drag.x < -swipeThreshold) {
      decide('nope')
    } else {
      setDrag({ x: 0, y: 0 })
    }
  }

  function onPointerCancel() {
    dragStart.current = null
    setIsDragging(false)
    setDrag({ x: 0, y: 0 })
  }

  const flyOutX = window.innerWidth + 200
  const cardX = leaving ? (leaving === 'like' ? flyOutX : -flyOutX) : drag.x
  const cardY = leaving ? drag.y + 60 : drag.y
  const likeOpacity = leaving === 'like' ? 1 : clamp(drag.x / swipeThreshold, 0, 1)
  const nopeOpacity = leaving === 'nope' ? 1 : clamp(-drag.x / swipeThreshold, 0, 1)
  const lastLiked = liked[liked.length - 1]

  return (
    <section className="listing swipe-section" id="swipe">
      <div className="section-heading">
        <div>
          <p className="kicker dark">GYROS FIÚ KERESŐ</p>
          <h2>Húzd jobbra, ha tőle kérnéd a gyroszt</h2>
        </div>
        <p><strong>{liked.length}</strong> gyros kiválasztva eddig</p>
      </div>

      <div className="swipe-stage">
        {current ? (
          <div className="swipe-deck">
            {next && (
              <SwipeCard profile={next} className="swipe-card is-next" />
            )}
            <SwipeCard
              key={current.name}
              profile={current}
              className={`swipe-card ${isDragging ? 'is-dragging' : ''}`}
              style={{
                transform: `translate(${cardX}px, ${cardY}px) rotate(${cardX / 14}deg)`,
                transitionDuration: `${flyOutMs}ms`,
              }}
              onPointerDown={onPointerDown}
              onPointerMove={onPointerMove}
              onPointerUp={onPointerUp}
              onPointerCancel={onPointerCancel}
            >
              <span className="swipe-stamp like" style={{ opacity: likeOpacity }}>KÉREM</span>
              <span className="swipe-stamp nope" style={{ opacity: nopeOpacity }}>NEM KÉREM</span>
            </SwipeCard>
          </div>
        ) : (
          <div className="swipe-done">
            <strong>Elfogytak a gyros fiúk.</strong>
            <span>
              {liked.length > 0
                ? `Akiktől kérnéd a gyrost: ${liked.join(', ')}`
                : 'Senkitől nem kérnél gyrost? Ennyire válogatós vagy?'}
            </span>
            <button type="button" className="search-button" onClick={restart}>Újrakezdem</button>
          </div>
        )}

        {lastLiked && (
          <div className="swipe-match" key={liked.length} aria-live="polite">
            Gyros rendelve! <span>{lastLiked} már tekeri a pitát</span>
          </div>
        )}
      </div>

      {current && (
        <div className="swipe-actions">
          <button type="button" className="swipe-button nope" aria-label="Nem kérek tőle gyrost" onClick={() => decide('nope')}>✕</button>
          <button type="button" className="swipe-button like" aria-label="Tőle kérem a gyrost" onClick={() => decide('like')}>♥</button>
        </div>
      )}
      <p className="swipe-hint">Húzd a kártyát, vagy használd a ← → nyilakat.</p>
    </section>
  )
}

type SwipeCardProps = {
  profile: SwipeProfile
  className: string
  style?: CSSProperties
  children?: ReactNode
  onPointerDown?: (event: PointerEvent<HTMLDivElement>) => void
  onPointerMove?: (event: PointerEvent<HTMLDivElement>) => void
  onPointerUp?: () => void
  onPointerCancel?: () => void
}

function SwipeCard({ profile, children, ...cardProps }: SwipeCardProps) {
  return (
    <div {...cardProps}>
      <div className="swipe-photo" style={{ backgroundImage: `url(${profile.image})` }}>
        {children}
        <span className="distance-pill">Tőled {profile.distanceLabel}</span>
      </div>
      <div className="swipe-info">
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
      </div>
    </div>
  )
}

export default SwipeDeck
