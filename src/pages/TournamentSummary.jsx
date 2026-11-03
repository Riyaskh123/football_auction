import { useMemo, useState } from 'react'
import { useAuctionData } from '../hooks/useAuctionData'
import { useFixtures, computeStandings, computeTopScorers, computeTopAssists } from '../hooks/useFixtures'
import { Link } from 'react-router-dom'

function StatCard({ label, value, accent }) {
    return (
        <div className="rounded-xl border border-pitch-line bg-pitch-800/50 p-4 flex flex-col items-center gap-1 text-center">
            <span className={`font-display text-3xl tracking-wide ${accent ? 'text-gold' : ''}`}>{value}</span>
            <span className="text-[11px] tracking-widest text-floodlight/40 uppercase">{label}</span>
        </div>
    )
}

function BarRow({ photoUrl, logoUrl, label, sublabel, value, max }) {
    const pct = max > 0 ? Math.max(4, (value / max) * 100) : 0
    return (
        <div className="flex items-center gap-3">
            <img
                src={photoUrl || logoUrl}
                alt={label}
                className="w-8 h-8 rounded-lg object-cover border border-pitch-line shrink-0"
            />
            <div className="flex-1 min-w-0">
                <div className="flex items-baseline justify-between gap-2">
                    <span className="text-sm font-semibold truncate">{label}</span>
                    <span className="font-mono text-gold tabular text-sm font-bold shrink-0">{value}</span>
                </div>
                {sublabel && <span className="text-[11px] text-floodlight/40">{sublabel}</span>}
                <div className="h-1.5 rounded-full bg-pitch-950 overflow-hidden mt-1">
                    <div className="h-full bg-gold rounded-full transition-all duration-700" style={{ width: `${pct}%` }} />
                </div>
            </div>
        </div>
    )
}

function FixtureCard({ fixture, teamById, onOpen }) {
    const a = teamById[fixture.teamA]
    const b = teamById[fixture.teamB]
    const played = fixture.status === 'completed' || fixture.status === 'live'

    return (
        <button
            onClick={() => onOpen(fixture)}
            className="w-full text-left rounded-xl border border-pitch-line bg-pitch-800/40 hover:border-gold/40 hover:bg-pitch-800 transition-colors p-3 sm:p-4 flex items-center gap-3"
        >
            <div className="flex-1 min-w-0 flex items-center justify-end gap-2">
                <span className="text-xs sm:text-sm font-semibold truncate text-right">{a?.name ?? '—'}</span>
                {a && <img src={a.logoUrl} alt={a.name} className="w-7 h-7 sm:w-8 sm:h-8 rounded-full shrink-0 object-cover" />}
            </div>

            <div className="flex flex-col items-center shrink-0 w-16 gap-0.5">
                {played ? (
                    <span className="font-mono text-gold tabular text-sm sm:text-base font-bold">
                        {fixture.scoreA} – {fixture.scoreB}
                    </span>
                ) : (
                    <span className="text-floodlight/30 text-xs">vs</span>
                )}
                {fixture.status === 'live' && (
                    <span className="text-[9px] px-1.5 py-0.5 rounded-full border border-live/50 text-live animate-glow-pulse uppercase">
                        Live
                    </span>
                )}
            </div>

            <div className="flex-1 min-w-0 flex items-center gap-2">
                {b && <img src={b.logoUrl} alt={b.name} className="w-7 h-7 sm:w-8 sm:h-8 rounded-full shrink-0 object-cover" />}
                <span className="text-xs sm:text-sm font-semibold truncate">{b?.name ?? '—'}</span>
            </div>
        </button>
    )
}

function FixtureModal({ fixture, teamById, players, onClose }) {
    if (!fixture) return null
    const a = teamById[fixture.teamA]
    const b = teamById[fixture.teamB]
    const played = fixture.status === 'completed' || fixture.status === 'live'

    const scorersA = (fixture.scorers || []).filter((s) => s.team === 'A')
    const scorersB = (fixture.scorers || []).filter((s) => s.team === 'B')
    const assistsA = (fixture.assists || []).filter((x) => x.team === 'A')
    const assistsB = (fixture.assists || []).filter((x) => x.team === 'B')
    const playerName = (id) => players.find((p) => p.id === id)?.name ?? '—'

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-pitch-950/85 backdrop-blur-sm"
            onClick={onClose}
        >
            <div
                className="w-full max-w-md rounded-2xl border border-gold/30 bg-pitch-900 p-6 flex flex-col gap-5 animate-card-in max-h-[85vh] overflow-y-auto no-scrollbar"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex justify-between items-start">
                    <div className="flex flex-col gap-1">
                        {fixture.round && <span className="text-xs text-gold tracking-wide">{fixture.round}</span>}
                        <span className="text-[11px] text-floodlight/40">
                            {[fixture.date, fixture.time, fixture.venue].filter(Boolean).join(' · ') || 'Date TBC'}
                        </span>
                    </div>
                    <button onClick={onClose} className="text-floodlight/40 hover:text-live text-sm shrink-0">
                        ✕
                    </button>
                </div>

                <div className="flex items-center justify-center gap-5">
                    <div className="flex flex-col items-center gap-2 flex-1">
                        {a && <img src={a.logoUrl} alt={a.name} className="w-14 h-14 rounded-full" />}
                        <span className="text-sm font-semibold text-center">{a?.name ?? '—'}</span>
                    </div>
                    <div className="flex flex-col items-center gap-1 shrink-0">
                        {played ? (
                            <span className="font-mono text-gold tabular text-3xl font-bold">
                                {fixture.scoreA} – {fixture.scoreB}
                            </span>
                        ) : (
                            <span className="text-floodlight/30 text-sm">vs</span>
                        )}
                        <span className="text-[10px] uppercase tracking-wide text-floodlight/40">{fixture.status}</span>
                    </div>
                    <div className="flex flex-col items-center gap-2 flex-1">
                        {b && <img src={b.logoUrl} alt={b.name} className="w-14 h-14 rounded-full" />}
                        <span className="text-sm font-semibold text-center">{b?.name ?? '—'}</span>
                    </div>
                </div>

                {played && (scorersA.length || scorersB.length || assistsA.length || assistsB.length) ? (
                    <div className="grid grid-cols-2 gap-4 pt-3 border-t border-pitch-line">
                        <div className="flex flex-col gap-2">
                            {scorersA.length > 0 && (
                                <div>
                                    <p className="text-[10px] tracking-wide text-floodlight/30 mb-1">GOALS</p>
                                    {scorersA.map((s, i) => (
                                        <p key={i} className="text-xs">
                                            {playerName(s.playerId)} {s.goals > 1 && <span className="text-gold">×{s.goals}</span>}
                                        </p>
                                    ))}
                                </div>
                            )}
                            {assistsA.length > 0 && (
                                <div>
                                    <p className="text-[10px] tracking-wide text-floodlight/30 mb-1">ASSISTS</p>
                                    {assistsA.map((x, i) => (
                                        <p key={i} className="text-xs text-floodlight/60">
                                            ↪ {playerName(x.playerId)} {x.assists > 1 && <span>×{x.assists}</span>}
                                        </p>
                                    ))}
                                </div>
                            )}
                        </div>
                        <div className="flex flex-col gap-2">
                            {scorersB.length > 0 && (
                                <div>
                                    <p className="text-[10px] tracking-wide text-floodlight/30 mb-1">GOALS</p>
                                    {scorersB.map((s, i) => (
                                        <p key={i} className="text-xs">
                                            {playerName(s.playerId)} {s.goals > 1 && <span className="text-gold">×{s.goals}</span>}
                                        </p>
                                    ))}
                                </div>
                            )}
                            {assistsB.length > 0 && (
                                <div>
                                    <p className="text-[10px] tracking-wide text-floodlight/30 mb-1">ASSISTS</p>
                                    {assistsB.map((x, i) => (
                                        <p key={i} className="text-xs text-floodlight/60">
                                            ↪ {playerName(x.playerId)} {x.assists > 1 && <span>×{x.assists}</span>}
                                        </p>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                ) : (
                    <p className="text-center text-floodlight/30 text-xs pt-2 border-t border-pitch-line">
                        {played ? 'No scorers recorded.' : 'Match not played yet.'}
                    </p>
                )}
            </div>
        </div>
    )
}

export default function TournamentSummary() {
    const { teams, players, loading: dataLoading } = useAuctionData()
    const { fixtures, loading: fixturesLoading } = useFixtures()
    const [selectedFixture, setSelectedFixture] = useState(null)

    const teamById = useMemo(() => Object.fromEntries(teams.map((t) => [t.id, t])), [teams])
    const standings = useMemo(() => computeStandings(teams, fixtures), [teams, fixtures])
    const topScorers = useMemo(() => computeTopScorers(players, fixtures).slice(0, 8), [players, fixtures])
    const topAssists = useMemo(() => computeTopAssists(players, fixtures).slice(0, 8), [players, fixtures])

    const loading = dataLoading || fixturesLoading
    if (loading) {
        return <div className="min-h-screen flex items-center justify-center text-floodlight/40">Connecting…</div>
    }

    const completed = fixtures.filter((f) => f.status === 'completed')
    const totalGoals = completed.reduce((sum, f) => sum + (f.scoreA || 0) + (f.scoreB || 0), 0)
    const maxScorerGoals = Math.max(1, ...topScorers.map((r) => r.goals))
    const maxAssists = Math.max(1, ...topAssists.map((r) => r.assists))

    // group fixtures by round for the full list; fixtures without a round
    // land in a single "Fixtures" bucket
    const grouped = {}
        ;[...fixtures]
            .sort((a, b) => (a.date || '').localeCompare(b.date || ''))
            .forEach((f) => {
                const key = f.round || 'Fixtures'
                if (!grouped[key]) grouped[key] = []
                grouped[key].push(f)
            })

    return (
        <div className="min-h-screen px-4 md:px-8 py-10 max-w-5xl mx-auto flex flex-col gap-10">
            <div className="flex items-center justify-between">
                <div>
                    <p className="tracking-[0.3em] text-gold text-xs font-semibold">KPL</p>
                    <h1 className="font-display text-2xl md:text-3xl tracking-wide">LEAGUE SUMMARY</h1>
                </div>
                <div className="flex gap-3">

                    <Link
                        to="/dashboard"
                        className="px-4 py-2 rounded-lg border border-pitch-line text-sm hover:border-gold/50 transition-colors"
                    >
                        Home
                    </Link>
                </div>
            </div>

            {/* stat cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <StatCard label="Teams" value={teams.length} />
                <StatCard label="Matches played" value={completed.length} />
                <StatCard label="Total goals" value={totalGoals} accent />
                <StatCard label="Fixtures" value={fixtures.length} />
            </div>

            {/* scorers + assists */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <section className="rounded-2xl border border-pitch-line bg-pitch-800/40 p-5">
                    <p className="text-xs tracking-widest text-gold mb-4">TOP SCORERS</p>
                    {topScorers.length === 0 ? (
                        <p className="text-floodlight/30 text-sm">No goals recorded yet.</p>
                    ) : (
                        <div className="flex flex-col gap-3">
                            {topScorers.map((row) => {
                                const team = row.player.soldTo ? teamById[row.player.soldTo] : null
                                return (
                                    <BarRow
                                        key={row.player.id}
                                        photoUrl={row.player.photoUrl}
                                        label={row.player.name}
                                        sublabel={team?.name}
                                        value={row.goals}
                                        max={maxScorerGoals}
                                    />
                                )
                            })}
                        </div>
                    )}
                </section>

                <section className="rounded-2xl border border-pitch-line bg-pitch-800/40 p-5">
                    <p className="text-xs tracking-widest text-gold mb-4">TOP ASSISTS</p>
                    {topAssists.length === 0 ? (
                        <p className="text-floodlight/30 text-sm">No assists recorded yet.</p>
                    ) : (
                        <div className="flex flex-col gap-3">
                            {topAssists.map((row) => {
                                const team = row.player.soldTo ? teamById[row.player.soldTo] : null
                                return (
                                    <BarRow
                                        key={row.player.id}
                                        photoUrl={row.player.photoUrl}
                                        label={row.player.name}
                                        sublabel={team?.name}
                                        value={row.assists}
                                        max={maxAssists}
                                    />
                                )
                            })}
                        </div>
                    )}
                </section>
            </div>

            {/* points table */}
            <section>
                <p className="text-xs tracking-widest text-floodlight/40 mb-3">POINTS TABLE</p>
                <div className="rounded-2xl border border-pitch-line bg-pitch-800/40 overflow-x-auto">
                    <table className="w-full text-sm min-w-[520px]">
                        <thead>
                            <tr className="text-left text-floodlight/40 text-xs border-b border-pitch-line">
                                <th className="py-3 pl-4 pr-2">#</th>
                                <th className="py-3 pr-2">Team</th>
                                <th className="py-3 pr-2 text-center">P</th>
                                <th className="py-3 pr-2 text-center">W</th>
                                <th className="py-3 pr-2 text-center">D</th>
                                <th className="py-3 pr-2 text-center">L</th>
                                <th className="py-3 pr-2 text-center">GD</th>
                                <th className="py-3 pr-4 text-center">Pts</th>
                            </tr>
                        </thead>
                        <tbody>
                            {standings.map((row, i) => (
                                <tr key={row.team.id} className="border-b border-pitch-line/50 last:border-0">
                                    <td className="py-2.5 pl-4 pr-2 text-floodlight/40 font-mono">{i + 1}</td>
                                    <td className="py-2.5 pr-2">
                                        <div className="flex items-center gap-2">
                                            <img src={row.team.logoUrl} alt={row.team.name} className="w-6 h-6 rounded-full" />
                                            <span className="font-semibold">{row.team.name}</span>
                                        </div>
                                    </td>
                                    <td className="py-2.5 pr-2 text-center font-mono tabular">{row.played}</td>
                                    <td className="py-2.5 pr-2 text-center font-mono tabular">{row.won}</td>
                                    <td className="py-2.5 pr-2 text-center font-mono tabular">{row.drawn}</td>
                                    <td className="py-2.5 pr-2 text-center font-mono tabular">{row.lost}</td>
                                    <td className="py-2.5 pr-2 text-center font-mono tabular">{row.gd}</td>
                                    <td className="py-2.5 pr-4 text-center font-mono tabular text-gold font-bold">{row.points}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </section>

            {/* all fixtures, grouped by round, click any for details */}
            <section className="flex flex-col gap-6">
                <p className="text-xs tracking-widest text-floodlight/40">ALL FIXTURES</p>
                {fixtures.length === 0 ? (
                    <p className="text-floodlight/30 text-sm text-center py-8">No fixtures scheduled yet.</p>
                ) : (
                    Object.entries(grouped).map(([roundLabel, roundFixtures]) => (
                        <div key={roundLabel} className="flex flex-col gap-2">
                            <p className="text-[11px] tracking-wide text-gold/80">{roundLabel}</p>
                            <div className="flex flex-col gap-2">
                                {roundFixtures.map((f) => (
                                    <FixtureCard key={f.id} fixture={f} teamById={teamById} onOpen={setSelectedFixture} />
                                ))}
                            </div>
                        </div>
                    ))
                )}
            </section>

            <FixtureModal
                fixture={selectedFixture}
                teamById={teamById}
                players={players}
                onClose={() => setSelectedFixture(null)}
            />
        </div>
    )
}