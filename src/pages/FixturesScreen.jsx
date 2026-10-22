import { useState, useMemo } from 'react'
import { useAuctionData } from '../hooks/useAuctionData'
import { useFixtures, computeStandings, computeTopScorers } from '../hooks/useFixtures'

const tabs = [
  { key: 'fixtures', label: 'Fixtures' },
  { key: 'table', label: 'Table' },
  { key: 'scorers', label: 'Top Scorers' }
]

function formatTime12H(timeStr) {
  if (!timeStr) return ''
  const trimmed = String(timeStr).trim()
  if (/am|pm/i.test(trimmed)) return trimmed

  const match = trimmed.match(/^(\d{1,2}):(\d{2})(?::\d{2})?$/)
  if (!match) return trimmed

  let hours = parseInt(match[1], 10)
  const minutes = match[2]
  if (isNaN(hours) || hours < 0 || hours > 23) return trimmed

  const period = hours >= 12 ? 'PM' : 'AM'
  hours = hours % 12 || 12

  return `${hours}:${minutes} ${period}`
}

function ScorerLine({ scorer, players }) {
  const player = players.find((p) => p.id === scorer.playerId)
  if (!player) return null
  return (
    <span className="text-[11px] text-floodlight/50 leading-tight">
      {player.name}
      {scorer.goals > 1 && <span className="text-gold font-mono ml-1">×{scorer.goals}</span>}
    </span>
  )
}

function FixtureRow({ fixture, teamById, players }) {
  const a = teamById[fixture.teamA]
  const b = teamById[fixture.teamB]
  const isLive = fixture.status === 'live'
  const isCompleted = fixture.status === 'completed'
  const hasScore = (isLive || isCompleted) && fixture.scoreA !== null && fixture.scoreA !== undefined

  const scorersA = (fixture.scorers || []).filter((s) => s.team === 'A')
  const scorersB = (fixture.scorers || []).filter((s) => s.team === 'B')

  return (
    <div className="rounded-xl border border-pitch-line bg-pitch-800/40 p-3 sm:p-4 flex flex-col gap-3">
      {/* teams + score */}
      <div className="flex items-center gap-2 sm:gap-3">
        <div className="flex-1 min-w-0 flex items-center justify-end gap-2 sm:gap-3">
          <span className="text-xs sm:text-sm font-semibold truncate text-right">{a?.name ?? '—'}</span>
          {a && (
            <img
              src={a.logoUrl}
              alt={a.name}
              className="w-8 h-8 sm:w-9 sm:h-9 rounded-full shrink-0 object-cover"
            />
          )}
        </div>

        <div className="flex flex-col items-center shrink-0 gap-1 px-1 w-16">
          {hasScore ? (
            <span className="font-mono text-gold tabular text-base sm:text-lg font-bold">
              {fixture.scoreA} – {fixture.scoreB}
            </span>
          ) : (
            <span className="text-floodlight/30 text-xs">vs</span>
          )}
          {isLive && (
            <span className="text-[9px] sm:text-[10px] px-2 py-0.5 rounded-full border border-live/50 text-live animate-glow-pulse uppercase tracking-wide">
              Live
            </span>
          )}
        </div>

        <div className="flex-1 min-w-0 flex items-center gap-2 sm:gap-3">
          {b && (
            <img
              src={b.logoUrl}
              alt={b.name}
              className="w-8 h-8 sm:w-9 sm:h-9 rounded-full shrink-0 object-cover"
            />
          )}
          <span className="text-xs sm:text-sm font-semibold truncate">{b?.name ?? '—'}</span>
        </div>
      </div>

      {/* scorers — shown once a live or completed match has any recorded */}
      {(isLive || isCompleted) && (scorersA.length > 0 || scorersB.length > 0) && (
        <div className="flex items-start gap-2">
          <div className="flex-1 flex flex-col items-end gap-0.5">
            {scorersA.map((s, i) => (
              <ScorerLine key={i} scorer={s} players={players} />
            ))}
          </div>
          <span className="w-16 shrink-0" />
          <div className="flex-1 flex flex-col items-start gap-0.5">
            {scorersB.map((s, i) => (
              <ScorerLine key={i} scorer={s} players={players} />
            ))}
          </div>
        </div>
      )}

      {/* meta */}
      {(fixture.round || fixture.date || fixture.time || fixture.venue) && (
        <div className="text-[11px] text-floodlight/40 flex flex-wrap items-center justify-center gap-x-2 gap-y-1 pt-2 border-t border-pitch-line/50">
          {fixture.round && <span>{fixture.round}</span>}
          {fixture.date && <span>{fixture.date}</span>}
          {fixture.time && <span>{formatTime12H(fixture.time)}</span>}
          {fixture.venue && <span>· {fixture.venue}</span>}
        </div>
      )}
    </div>
  )
}

export default function FixturesScreen() {
  const { teams, players, loading: dataLoading } = useAuctionData()
  const { fixtures, loading: fixturesLoading } = useFixtures()
  const [tab, setTab] = useState('fixtures')

  const teamById = useMemo(() => Object.fromEntries(teams.map((t) => [t.id, t])), [teams])
  const standings = useMemo(() => computeStandings(teams, fixtures), [teams, fixtures])
  const scorers = useMemo(() => computeTopScorers(players, fixtures), [players, fixtures])

  const loading = dataLoading || fixturesLoading
  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-floodlight/40">Connecting…</div>
  }

  const sortedFixtures = [...fixtures].sort((a, b) => (a.date || '').localeCompare(b.date || ''))
  const live = sortedFixtures.filter((f) => f.status === 'live')
  const upcoming = sortedFixtures.filter((f) => f.status === 'scheduled')
  const completed = sortedFixtures.filter((f) => f.status === 'completed')

  return (
    <div className="min-h-screen px-4 md:px-8 py-8 max-w-4xl mx-auto">
      <header className="text-center mb-8">
        <p className="tracking-[0.35em] text-gold text-xs font-semibold mb-2">MATCH DAY</p>
        <h1 className="font-display text-4xl md:text-5xl tracking-wide">LEAGUE CENTRE</h1>
      </header>

      <div className="flex justify-center gap-2 mb-8">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-5 py-2 rounded-full text-sm border transition-colors ${
              tab === t.key
                ? 'border-gold text-gold bg-gold/10'
                : 'border-pitch-line text-floodlight/60 hover:border-floodlight/30'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'fixtures' && (
        <div className="flex flex-col gap-8">
          {live.length > 0 && (
            <section>
              <p className="text-xs tracking-widest text-live/70 mb-3">LIVE NOW</p>
              <div className="flex flex-col gap-3">
                {live.map((f) => (
                  <FixtureRow key={f.id} fixture={f} teamById={teamById} players={players}/>
                ))}
              </div>
            </section>
          )}
          <section>
            <p className="text-xs tracking-widest text-floodlight/40 mb-3">UPCOMING</p>
            {upcoming.length === 0 ? (
              <p className="text-floodlight/30 text-sm">No upcoming fixtures.</p>
            ) : (
              <div className="flex flex-col gap-3">
                {upcoming.map((f) => (
                  <FixtureRow key={f.id} fixture={f} teamById={teamById} players={players} />
                ))}
              </div>
            )}
          </section>
          <section>
            <p className="text-xs tracking-widest text-floodlight/40 mb-3">RESULTS</p>
            {completed.length === 0 ? (
              <p className="text-floodlight/30 text-sm">No results yet.</p>
            ) : (
              <div className="flex flex-col gap-3">
                {completed.map((f) => (
                  <FixtureRow key={f.id} fixture={f} teamById={teamById} players={players} />
                ))}
              </div>
            )}
          </section>
        </div>
      )}

      {tab === 'table' && (
        <div className="rounded-2xl border border-pitch-line bg-pitch-800/40 overflow-x-auto">
          <table className="w-full text-sm min-w-[200px]">
            <thead>
              <tr className="text-left text-floodlight/40 text-xs border-b border-pitch-line">
                <th className="py-3 pl-4 pr-2">#</th>
                <th className="py-3 pr-2">Team</th>
                <th className="py-3 pr-2 text-center">P</th>
                <th className="py-3 pr-2 text-center">W</th>
                <th className="py-3 pr-2 text-center">D</th>
                <th className="py-3 pr-2 text-center">L</th>
                <th className="py-3 pr-2 text-center hidden md:table-cell">GF</th>
                <th className="py-3 pr-2 text-center hidden md:table-cell">GA</th>
                <th className="py-3 pr-2 text-center">GD</th>
                <th className="py-3 pr-4 text-center">Pts</th>
              </tr>
            </thead>
            <tbody>
              {standings.map((row, i) => (
                <tr key={row.team.id} className="border-b border-pitch-line/50 last:border-0">
                  <td className="py-3 pl-4 pr-2 text-floodlight/40 font-mono">{i + 1}</td>
                  <td className="py-3 pr-2">
                    <div className="flex items-center gap-2">
                      <img src={row.team.logoUrl} alt={row.team.name} className="w-6 h-6 rounded-full" />
                      <span className="font-semibold hidden md:block">{row.team.name}</span>
                      <span className="font-semibold md:hidden">{row.team.shortName}</span>

                    </div>
                  </td>
                  <td className="py-3 pr-2 text-center font-mono tabular">{row.played}</td>
                  <td className="py-3 pr-2 text-center font-mono tabular">{row.won}</td>
                  <td className="py-3 pr-2 text-center font-mono tabular">{row.drawn}</td>
                  <td className="py-3 pr-2 text-center font-mono tabular">{row.lost}</td>
                  <td className="py-3 pr-2 text-center font-mono tabular hidden md:table-cell">{row.gf}</td>
                  <td className="py-3 pr-2 text-center font-mono tabular hidden md:table-cell">{row.ga}</td>
                  <td className="py-3 pr-2 text-center font-mono tabular">{row.gd}</td>
                  <td className="py-3 pr-4 text-center font-mono tabular text-gold font-bold">{row.points}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === 'scorers' && (
        <div className="flex flex-col gap-2">
          {scorers.length === 0 && (
            <p className="text-floodlight/30 text-sm text-center py-8">No goals recorded yet.</p>
          )}
          {scorers.map((row, i) => {
            const team = row.player.soldTo ? teamById[row.player.soldTo] : null
            return (
              <div
                key={row.player.id}
                className="flex items-center gap-3 p-3 rounded-xl border border-pitch-line bg-pitch-800/40"
              >
                <span className="w-6 text-center font-mono text-floodlight/40">{i + 1}</span>
                <img
                  src={row.player.photoUrl}
                  alt={row.player.name}
                  className="w-10 h-10 rounded-lg object-cover border border-pitch-line"
                />
                <div className="flex-1 min-w-0">
                  <div className="font-semibold truncate">{row.player.name}</div>
                  <div className="text-xs text-floodlight/40 flex items-center gap-1">
                    {team && <img src={team.logoUrl} alt={team.name} className="w-3.5 h-3.5 rounded-full" />}
                    {team?.name ?? 'Unassigned'}
                  </div>
                </div>
                <span className="font-mono text-gold tabular text-lg font-bold">{row.goals}</span>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
