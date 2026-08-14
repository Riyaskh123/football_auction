import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useAuctionData } from '../hooks/useAuctionData'

function downloadCsv(teams, players) {
  const rows = [['Team', 'Player', 'Jersey #', 'Position', 'Sold Price']]
  teams.forEach((team) => {
    players
      .filter((p) => p.soldTo === team.id)
      .forEach((p) => rows.push([team.name, p.name, p.jerseyNo ?? '', p.position, p.soldPrice ?? '']))
  })
  const unsold = players.filter((p) => p.status === 'unsold')
  unsold.forEach((p) => rows.push(['UNSOLD', p.name, p.jerseyNo ?? '', p.position, '']))

  const csv = rows.map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'auction-results.csv'
  a.click()
  URL.revokeObjectURL(url)
}

export default function ResultsScreen() {
  const { teams, players, loading } = useAuctionData()

  const squads = useMemo(
    () =>
      teams.map((team) => ({
        team,
        players: players
          .filter((p) => p.soldTo === team.id)
          .sort((a, b) => (b.soldPrice || 0) - (a.soldPrice || 0))
      })),
    [teams, players]
  )
  const unsold = players.filter((p) => p.status === 'unsold')
  const stillAvailable = players.filter((p) => p.status === 'available')

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-floodlight/40">Connecting…</div>
  }

  return (
    <div className="min-h-screen px-4 md:px-8 py-6 max-w-6xl mx-auto">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6 print:hidden">
        <div>
          <p className="tracking-[0.3em] text-gold text-xs font-semibold">MATCH DAY</p>
          <h1 className="font-display text-2xl md:text-3xl tracking-wide">FINAL SQUADS</h1>
        </div>
        <div className="flex gap-3">
          <Link
            to="/control"
            className="px-4 py-2 rounded-lg border border-pitch-line text-sm hover:border-gold/50 transition-colors"
          >
            Back to control
          </Link>
          <button
            onClick={() => downloadCsv(teams, players)}
            className="px-4 py-2 rounded-lg border border-pitch-line text-sm hover:border-gold/50 transition-colors"
          >
            Download CSV
          </button>
          <button
            onClick={() => window.print()}
            className="px-4 py-2 rounded-lg bg-gold text-pitch-950 text-sm font-semibold hover:bg-gold-light transition-colors"
          >
            Print
          </button>
        </div>
      </div>

      {stillAvailable.length > 0 && (
        <p className="text-sm text-live/80 mb-4 print:hidden">
          Heads up — {stillAvailable.length} player{stillAvailable.length > 1 ? 's are' : ' is'} still
          marked "available" (auction not finished yet). This page shows results so far.
        </p>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-8">
        {squads.map(({ team, players: squad }) => {
          const spent = team.spent || 0
          const remaining = team.budget - spent
          return (
            <div key={team.id} className="rounded-2xl border border-pitch-line bg-pitch-800/50 p-5 break-inside-avoid">
              <div className="flex items-center gap-3 mb-4">
                <img src={team.logoUrl} alt={team.name} className="w-12 h-12 rounded-full border border-pitch-line" />
                <div className="flex-1">
                  <div className="font-display text-xl tracking-wide">{team.name}</div>
                  <div className="text-xs text-floodlight/50 font-mono tabular">
                    Spent {spent.toLocaleString()} · Left {remaining.toLocaleString()} · {squad.length} players
                  </div>
                </div>
              </div>

              {squad.length === 0 ? (
                <p className="text-sm text-floodlight/30">No players won yet.</p>
              ) : (
                <div className="flex flex-col gap-2">
                  {squad.map((p) => (
                    <div
                      key={p.id}
                      className="flex items-center justify-between px-3 py-2 rounded-lg bg-pitch-950/60 border border-pitch-line/60 text-sm"
                    >
                      <span>
                        {p.jerseyNo ? `#${p.jerseyNo} ` : ''}
                        {p.name}
                        <span className="text-floodlight/40 text-xs ml-2">{p.position}</span>
                      </span>
                      <span className="font-mono text-gold tabular">{p.soldPrice?.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {unsold.length > 0 && (
        <div className="rounded-2xl border border-live/30 bg-live/5 p-5 break-inside-avoid">
          <p className="text-xs tracking-widest text-live/70 mb-3">UNSOLD ({unsold.length})</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {unsold.map((p) => (
              <div key={p.id} className="px-3 py-2 rounded-lg bg-pitch-950/40 text-sm text-floodlight/60">
                {p.jerseyNo ? `#${p.jerseyNo} ` : ''}
                {p.name} <span className="text-floodlight/30 text-xs">{p.position}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
