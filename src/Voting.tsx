import { useState } from 'react'

type Candidate = {
  id: string
  name: string
  age: number
  image: string
  tags: string[]
  attributes: string[]
  joke: string
}

type VoteCounts = Record<string, number>

const city = 'Velence'

const candidates: Candidate[] = [
  {
    id: 'tanar',
    name: 'Tanár Úr',
    age: 40,
    image: '/jeloltek/tanar-ur.jpg',
    tags: ['késművész', 'lila szósz'],
    attributes: ['2x lock in', 'ex-étterem boss', 'mexikói hagymás', 'hajrá Újpest'],
    joke: 'Kétszer mondja ki, hogy „lock in”, és a gyroskés már magától forog. A hagymát mexikóiul kérdezi meg, a csípőset úgyis ráteszi.',
  },
  {
    id: 'bozsi',
    name: 'Bözsi',
    age: 20,
    image: '/jeloltek/bozsi.jpg',
    tags: ['tiki-taka pita', 'zöld mamusz'],
    attributes: ['44,5-ös láb', 'Villa-gyors kiszállítás', 'Iniesta-passz minőség', 'piaci érték: 100M €'],
    joke: 'Úgy adja át a gyrost, mint Iniesta a labdát: pontosan, és mindig a csípős szósz felé. Rick és Morty mamuszban szállít, ezért nem hallod, amikor odaér.',
  },
  {
    id: 'csoke',
    name: 'Csőke',
    age: 21,
    image: '/jeloltek/csoke.jpg',
    tags: ['habtest', 'melegen tartó'],
    attributes: ['gólyatábor veterán', 'Y que fue lock in', 'piaci érték: 6 967 €', 'Harvard-diploma (állítólag)'],
    joke: 'A habtestével tartja melegen a gyrost, a többi ötletét nem spoilerezi. A diplomáján ugyan Jordan Thompson neve áll, de a pitát ő tekeri.',
  },
  {
    id: 'rabo',
    name: 'Rabó',
    age: 19,
    image: '/jeloltek/bohoc.svg',
    tags: ['tortipita', 'Csupi!'],
    attributes: ['mexikói-gyros fúzió', 'pénzügyi agy', 'csak élő bemutató', 'ciánkék szalvéta'],
    joke: 'Csupi! Pénzügyes múltja miatt a gyros árát fejben forintra, pesóra és tevére is átváltja. A tortillát és a pitát egyszerre tekeri, és a végén ciánkék szalvétát ad hozzá.',
  },
  {
    id: 'szewald',
    name: 'Széwald',
    age: 20,
    image: '/jeloltek/szewald.jpg',
    tags: ['élménygasztro', 'pókgyros'],
    attributes: ['nem zabálás, hanem étkezés', 'nagy erő, nagy pita', 'süti-ablak ötletgazda', 'kedvenc szín: KÉKK'],
    joke: 'Nála nem zabálsz, és nem is eszel, hanem ÉTKEZEL. Ben bácsi óta tudja, hogy a nagy pitával nagy felelősség jár.',
  },
  {
    id: 'soltesz',
    name: 'Soltész',
    age: 21,
    image: '/jeloltek/soltesz.jpg',
    tags: ['gyroskard', 'megamenü'],
    attributes: ['50+ gyros egy A7V-n', 'heti 3 edzés', 'piaci érték: 73 teve', 'példakép: Polgár Jenő'],
    joke: 'Heti háromszor edz, hogy elbírja a gyroskardot. A piaci értéke 73 teve, de egy dupla húsos pitáért alkuképes.',
  },
]

const votedKey = 'gyros-vote'
const localCountsKey = 'gyros-vote-counts'

function readStorage(key: string) {
  try {
    return window.localStorage.getItem(key)
  } catch {
    return null
  }
}

function writeStorage(key: string, value: string) {
  try {
    window.localStorage.setItem(key, value)
  } catch {
    // Blocked storage: the vote still counts, it just isn't remembered.
  }
}

function readLocalCounts(): VoteCounts {
  try {
    return JSON.parse(readStorage(localCountsKey) ?? '{}') as VoteCounts
  } catch {
    return {}
  }
}

function Voting() {
  const [counts, setCounts] = useState<VoteCounts>(readLocalCounts)
  const [votedFor, setVotedFor] = useState(() => readStorage(votedKey))

  // Votes are only counted in this browser; nothing is sent anywhere.
  function vote(candidateId: string) {
    if (votedFor) {
      return
    }

    const nextCounts = { ...counts, [candidateId]: (counts[candidateId] ?? 0) + 1 }
    setVotedFor(candidateId)
    setCounts(nextCounts)
    writeStorage(votedKey, candidateId)
    writeStorage(localCountsKey, JSON.stringify(nextCounts))
  }

  const totalVotes = candidates.reduce((sum, candidate) => sum + (counts[candidate.id] ?? 0), 0)
  const topVotes = Math.max(0, ...candidates.map((candidate) => counts[candidate.id] ?? 0))

  return (
    <section className="listing vote-section" id="szavazas">
      <div className="section-heading">
        <div>
          <p className="kicker dark">JELÖLTEK · {city.toUpperCase()}</p>
          <h2>Ki legyen a jövő gyros fiúja?</h2>
        </div>
        <p><strong>{totalVotes}</strong> leadott szavazat · egy böngészőből egy szavazat</p>
      </div>

      <div className="vote-grid">
        {candidates.map((candidate) => {
          const candidateVotes = counts[candidate.id] ?? 0
          const share = totalVotes ? Math.round((candidateVotes / totalVotes) * 100) : 0
          const isLeader = topVotes > 0 && candidateVotes === topVotes
          const isMine = votedFor === candidate.id

          return (
            <article className={`profile-card vote-card ${isMine ? 'is-mine' : ''}`} key={candidate.id}>
              <div className="profile-image vote-image" style={{ backgroundImage: `url(${candidate.image})` }}>
                {isLeader && <span className="featured">👑 VEZET</span>}
                <span className="distance-pill">⌖ {city}</span>
              </div>
              <div className="profile-body">
                <div className="profile-title">
                  <div>
                    <h3>{candidate.name}, <span>{candidate.age}</span></h3>
                  </div>
                </div>
                <div className="tags">
                  {candidate.tags.map((tag) => <span key={tag}>{tag}</span>)}
                </div>
                <div className="attribute-list">
                  {candidate.attributes.map((attribute) => <span key={attribute}>{attribute}</span>)}
                </div>
                <p className="vote-joke">{candidate.joke}</p>
                <div className="vote-bar" aria-label={`${candidate.name}: ${candidateVotes} szavazat`}>
                  <i style={{ width: `${share}%` }} />
                </div>
                <div className="card-footer">
                  <small>{candidateVotes} szavazat · {share}%</small>
                  <button
                    type="button"
                    className="vote-button"
                    disabled={Boolean(votedFor)}
                    onClick={() => vote(candidate.id)}
                  >
                    {isMine ? 'Rá szavaztál ✓' : 'Rá szavazok'}
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

export default Voting
