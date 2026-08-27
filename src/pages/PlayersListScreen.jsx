import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuctionData } from '../hooks/useAuctionData'

const statusFilters = [
  { key: 'all', label: 'All' },
  { key: 'available', label: 'Available' },
  { key: 'sold', label: 'Sold' },
  { key: 'unsold', label: 'Unsold' }
]

export default function PlayersListScreen() {
  const { teams, players, loading } = useAuctionData()
  const [statusFilter, setStatusFilter] = useState('all')
  const [search, setSearch] = useState('')

  const teamById = useMemo(() => Object.fromEntries(teams.map((t) => [t.id, t])), [teams])

  const filtered = useMemo(() => {
    return players
      .filter((p) => (statusFilter === 'all' ? true : p.status === statusFilter))
      .filter((p) => p.name.toLowerCase().includes(search.trim().toLowerCase()))
      .sort((a, b) => {
        const valA = a.jerseyNo;
        const valB = b.jerseyNo;
        const hasA = valA !== null && valA !== undefined && valA !== '';
        const hasB = valB !== null && valB !== undefined && valB !== '';
        
        if (!hasA && !hasB) return 0;
        if (!hasA) return 1;
        if (!hasB) return -1;
        
        return String(valA).localeCompare(String(valB), undefined, { numeric: true, sensitivity: 'base' });
      })
  }, [players, statusFilter, search])

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-floodlight/40">Connecting…</div>
  }

  return (
    <div className="min-h-screen px-4 md:px-8 py-6 max-w-5xl mx-auto print:px-0 print:py-0 print:max-w-none print:bg-white print:text-black">
      {/* on-screen header, hidden when printing */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6 print:hidden">
        <div>
          <h1 className="font-display text-2xl md:text-3xl tracking-wide">PLAYER LIST</h1>
        </div>
        <div className="flex gap-3">
          <Link
            to="/dashboard"
            className="px-4 py-2 rounded-lg border border-pitch-line text-sm hover:border-gold/50 transition-colors"
          >
            Back to Home
          </Link>
          <button
            onClick={() => window.print()}
            className="px-4 py-2 rounded-lg bg-gold text-pitch-950 text-sm font-semibold hover:bg-gold-light transition-colors"
          >
            Print
          </button>
        </div>
      </div>

      {/* filters, hidden when printing */}
      <div className="flex flex-wrap items-center gap-3 mb-5 print:hidden">
        {statusFilters.map((f) => (
          <button
            key={f.key}
            onClick={() => setStatusFilter(f.key)}
            className={`px-3 py-1.5 rounded-lg text-sm border transition-colors ${
              statusFilter === f.key
                ? 'border-gold text-gold bg-gold/10'
                : 'border-pitch-line text-floodlight/60 hover:border-floodlight/30'
            }`}
          >
            {f.label}
          </button>
        ))}
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name…"
          className="ml-auto px-3 py-1.5 rounded-lg bg-pitch-950 border border-pitch-line text-sm outline-none focus:border-gold/60 w-48"
        />
      </div>

      {/* print-only header */}
      <div className="hidden print:block mb-4">
        <h1 className="text-2xl font-bold">Player List</h1>
        <p className="text-sm text-gray-500">{filtered.length} players</p>
      </div>

      {/* screen: card grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 print:hidden">
        {filtered.map((p) => {
          const team = p.soldTo ? teamById[p.soldTo] : null
          return (
            <div
              key={p.id}
              className="flex items-center gap-3 p-3 rounded-xl border border-pitch-line bg-pitch-800/50"
            >
              <img
                src={p.photoUrl}
                alt={p.name}
                className="w-14 h-14 rounded-lg object-cover border border-pitch-line shrink-0"
              />
              <div className="flex-1 min-w-0">
                <div className="font-semibold truncate">
                  {p.jerseyNo ? `#${p.jerseyNo} ` : ''}
                  {p.name} 
                  {p.isMarquee ? <span className="text-gold text-[10px] ml-1">(MARQEE)</span> : null}
                </div>
                <div className="text-xs text-floodlight/50">
                  {p.position} · base {p.basePrice}
                </div>
                {p.status === 'sold' && team && (
                  <div className="text-xs text-gold mt-0.5">
                    {team.name} · {p.soldPrice?.toLocaleString()}
                  </div>
                )}
                {p.status === 'unsold' && <div className="text-xs text-live mt-0.5">Unsold</div>}
                {p.status === 'available' && (
                  <div className="text-xs text-floodlight/30 mt-0.5">Available</div>
                )}
              </div>
            </div>
          )
        })}
        {filtered.length === 0 && (
          <p className="text-floodlight/30 text-sm col-span-full text-center py-10">No players match.</p>
        )}
      </div>

      {/* print: table layout, one row per player, includes photo */}
      <table className="hidden print:table w-full text-sm border-collapse">
        <thead>
          <tr className="border-b-2 border-black text-left">
            <th className="py-2 pr-2 w-14">Photo</th>
            <th className="py-2 pr-2">#</th>
            <th className="py-2 pr-2">Name</th>
            <th className="py-2 pr-2">Position</th>
            <th className="py-2 pr-2">Base</th>
            <th className="py-2 pr-2">Status</th>
            <th className="py-2 pr-2">Team</th>
            <th className="py-2 pr-2">Sold price</th>
          </tr>
        </thead>
        <tbody>
          {filtered.map((p) => {
            const team = p.soldTo ? teamById[p.soldTo] : null
            return (
              <tr key={p.id} className="border-b border-gray-300 break-inside-avoid">
                <td className="py-1.5 pr-2">
                  <img src={p.photoUrl} alt={p.name} className="w-10 h-10 rounded object-cover" />
                </td>
                <td className="py-1.5 pr-2">{p.jerseyNo ?? ''}</td>
                <td className="py-1.5 pr-2">
                  {p.name}
                  {p.isMarquee ? <span className="text-gold ml-1">(M)</span> : null}
                </td>
                <td className="py-1.5 pr-2">{p.position}</td>
                <td className="py-1.5 pr-2">{p.basePrice}</td>
                <td className="py-1.5 pr-2 capitalize">{p.status}</td>
                <td className="py-1.5 pr-2">{team ? team.name : ''}</td>
                <td className="py-1.5 pr-2">{p.soldPrice ?? ''}</td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}