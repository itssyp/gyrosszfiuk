import type { CSSProperties } from 'react'
import { useEffect, useState } from 'react'

const prepDurationMs = 6000
const tickMs = 100

const steps = [
  { label: 'Rendelés fogadva', ingredient: '🧾' },
  { label: 'Hús szeletelése', ingredient: '🥩' },
  { label: 'Zöldség bepakolás', ingredient: '🥬' },
  { label: 'Hagyma, paradicsom', ingredient: '🍅' },
  { label: 'Szósz rálocsolva', ingredient: '🌶️' },
  { label: 'Pita feltekerve', ingredient: '🧄' },
]

function ChefFigure() {
  return (
    <svg className="tracker-chef" viewBox="0 0 120 170" aria-hidden="true">
      {/* sapka */}
      <path d="M38 38 Q30 14 50 16 Q58 2 72 14 Q92 10 84 38 Z" fill="#fff" stroke="#2a1717" strokeWidth="3" />
      <rect x="40" y="34" width="42" height="10" rx="3" fill="#fff" stroke="#2a1717" strokeWidth="3" />
      {/* fej */}
      <circle cx="61" cy="62" r="19" fill="#ffd9b8" stroke="#2a1717" strokeWidth="3" />
      <circle cx="54" cy="60" r="2.5" fill="#2a1717" />
      <circle cx="68" cy="60" r="2.5" fill="#2a1717" />
      <path d="M53 70 Q61 77 69 70" fill="none" stroke="#2a1717" strokeWidth="3" strokeLinecap="round" />
      <path d="M49 67 Q61 74 73 67" fill="none" stroke="#2a1717" strokeWidth="2" opacity=".35" />
      {/* test és kötény */}
      <path d="M38 88 Q61 80 84 88 L88 140 L34 140 Z" fill="#721d28" stroke="#2a1717" strokeWidth="3" />
      <path d="M48 96 L74 96 L78 140 L44 140 Z" fill="#f8f3ed" stroke="#2a1717" strokeWidth="2.5" />
      <text x="61" y="122" textAnchor="middle" fontSize="13" fontWeight="700" fill="#721d28">GY</text>
      {/* lábak */}
      <path d="M48 140 L46 162 M74 140 L76 162" stroke="#2a1717" strokeWidth="6" strokeLinecap="round" />
      {/* bal kar */}
      <path d="M40 94 Q26 112 34 126" fill="none" stroke="#2a1717" strokeWidth="6" strokeLinecap="round" />
      {/* dobó kar */}
      <g className="tracker-chef-arm">
        <path d="M82 94 Q102 96 108 80" fill="none" stroke="#2a1717" strokeWidth="6" strokeLinecap="round" />
        <circle cx="108" cy="78" r="5" fill="#ffd9b8" stroke="#2a1717" strokeWidth="2.5" />
      </g>
    </svg>
  )
}

type OrderTrackerProps = {
  onReady?: () => void
}

function OrderTracker({ onReady }: OrderTrackerProps) {
  const [elapsed, setElapsed] = useState(0)
  const progress = Math.min(1, elapsed / prepDurationMs)
  const isReady = progress >= 1
  const stepIndex = Math.min(steps.length - 1, Math.floor(progress * steps.length))

  useEffect(() => {
    const startedAt = Date.now()
    const intervalId = window.setInterval(() => {
      const nextElapsed = Date.now() - startedAt
      setElapsed(nextElapsed)

      if (nextElapsed >= prepDurationMs) {
        window.clearInterval(intervalId)
      }
    }, tickMs)

    return () => window.clearInterval(intervalId)
  }, [])

  useEffect(() => {
    if (isReady) {
      onReady?.()
    }
  }, [isReady, onReady])

  return (
    <div className={`tracker ${isReady ? 'is-ready' : ''}`}>
      <div className="tracker-scene" aria-hidden="true">
        <ChefFigure />
        {!isReady && (
          <span className="tracker-ingredient" key={stepIndex}>{steps[stepIndex].ingredient}</span>
        )}
        <span className="tracker-gyros" style={{ '--fill': progress } as CSSProperties}>🥙</span>
      </div>

      <p className="tracker-status" aria-live="polite">
        {isReady ? 'Kész a gyrosod! 🎉' : `${steps[stepIndex].label}…`}
      </p>

      <div
        className="tracker-track"
        role="progressbar"
        aria-label="Gyros készültsége"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(progress * 100)}
      >
        <i style={{ width: `${progress * 100}%` }} />
        <span className="tracker-marker" style={{ left: `${progress * 100}%` }}>🥙</span>
      </div>

      <ol className="tracker-steps">
        {steps.map((step, index) => (
          <li
            key={step.label}
            className={index < stepIndex || isReady ? 'done' : index === stepIndex ? 'current' : ''}
          >
            {step.label}
          </li>
        ))}
      </ol>
    </div>
  )
}

export default OrderTracker
