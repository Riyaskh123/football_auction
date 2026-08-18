import { useState, useMemo } from 'react'
import { useAuctionData } from '../hooks/useAuctionData'
import { useFixtures, computeStandings, computeTopScorers } from '../hooks/useFixtures'

const tabs = [
  { key: 'fixtures', label: 'Fixtures' },
  { key: 'table', label: 'Table' },
  { key: 'scorers', label: 'Top Scorers' }
]

function FixtureRow({ fixture, teamById }) {
  const a = teamById[fixture.teamA]
  const b = teamById[fixture.teamB]
  return (
    <div className="rounded-xl border border-pitch-line bg-pitch-800/40 p-4 flex flex-wrap items-center justify-between gap-3">
      <div className="flex items-center gap-3 min-w-0">
        {a && <img src={a.logoUrl} alt={a.name} className="w-9 h-9 rounded-full shrink-0" />}
        <span className="text-sm font-semibold truncate w-28 text-right">{a?.name ?? '—'}</span>
        {fixture.status === 'completed' ? (
          <span className="font-mono text-gold tabular text-lg px-2">
            {fixture.scoreA} – {fixture.scoreB}
          </span>
        ) : (
          <span
            className={`text-xs px-3 py-1 rounded-full border ${
              fixture.status === 'live'
                ? 'border-live/50 text-live animate-glow-pulse'
                : 'border-pitch-line text-floodlight/40'
            }`}
          >
            {fixture.status === 'live' ? 'LIVE' : 'vs'}
          </span>
        )}
        <span className="text-sm font-semibold truncate w-28">{b?.name ?? '—'}</span>
        {b && <img src={b.logoUrl} alt={b.name} className="w-9 h-9 rounded-full shrink-0" />}
      </div>
      <div className="text-xs text-floodlight/40 flex items-center gap-2 shrink-0">
        {fixture.round && <span>{fixture.round}</span>}
        {fixture.date && <span>{fixture.date}</span>}
        {fixture.time && <span>{fixture.time}</span>}
        {fixture.venue && <span>· {fixture.venue}</span>}
      </div>
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
                  <FixtureRow key={f.id} fixture={f} teamById={teamById} />
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
                  <FixtureRow key={f.id} fixture={f} teamById={teamById} />
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
                  <FixtureRow key={f.id} fixture={f} teamById={teamById} />
                ))}
              </div>
            )}
          </section>
        </div>
      )}

      {tab === 'table' && (
        <div className="rounded-2xl border border-pitch-line bg-pitch-800/40 overflow-x-auto">
          <table className="w-full text-sm min-w-[560px]">
            <thead>
              <tr className="text-left text-floodlight/40 text-xs border-b border-pitch-line">
                <th className="py-3 pl-4 pr-2">#</th>
                <th className="py-3 pr-2">Team</th>
                <th className="py-3 pr-2 text-center">P</th>
                <th className="py-3 pr-2 text-center">W</th>
                <th className="py-3 pr-2 text-center">D</th>
                <th className="py-3 pr-2 text-center">L</th>
                <th className="py-3 pr-2 text-center">GF</th>
                <th className="py-3 pr-2 text-center">GA</th>
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
                      <span className="font-semibold">{row.team.name}</span>
                    </div>
                  </td>
                  <td className="py-3 pr-2 text-center font-mono tabular">{row.played}</td>
                  <td className="py-3 pr-2 text-center font-mono tabular">{row.won}</td>
                  <td className="py-3 pr-2 text-center font-mono tabular">{row.drawn}</td>
                  <td className="py-3 pr-2 text-center font-mono tabular">{row.lost}</td>
                  <td className="py-3 pr-2 text-center font-mono tabular">{row.gf}</td>
                  <td className="py-3 pr-2 text-center font-mono tabular">{row.ga}</td>
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
