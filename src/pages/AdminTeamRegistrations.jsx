import { useState } from 'react'
import { useTeamRegistrations } from '../hooks/useTeamRegistrations'
import Header from '../components/header'
import { useNavigate } from 'react-router-dom'

function TeamReviewCard({ registration, onApprove, onReject }) {
  const [budget, setBudget] = useState('10000')
  const [busy, setBusy] = useState(false)

  return (
    <div className="rounded-xl border border-pitch-line bg-pitch-800/50 p-4 flex flex-col gap-3">
      <div className="flex items-center gap-3">
        <div className="w-14 h-14 rounded-full bg-pitch-950 border border-pitch-line overflow-hidden flex items-center justify-center shrink-0">
          {registration.logoUrl ? (
            <img src={registration.logoUrl} alt={registration.name} className="w-full h-full object-cover" />
          ) : (
            <span className="text-floodlight/30 text-xs">No logo</span>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-semibold truncate">{registration.name}</div>
          <div className="text-xs text-floodlight/50">
            {registration.shortName}
            {registration.ownerName ? ` · ${registration.ownerName}` : ''}
            {registration.phone ? ` · ${registration.phone}` : ''}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <label className="text-xs text-floodlight/50 shrink-0">Budget</label>
        <input
          type="number"
          value={budget}
          onChange={(e) => setBudget(e.target.value)}
          className="w-full px-3 py-2 rounded-lg bg-pitch-950 border border-pitch-line text-sm outline-none focus:border-gold/60"
        />
      </div>

      <div className="flex gap-2">
        <button
          disabled={busy || !budget}
          onClick={async () => {
            setBusy(true)
            await onApprove(registration, budget)
            setBusy(false)
          }}
          className="flex-1 px-4 py-2 rounded-lg bg-gold text-pitch-950 text-sm font-semibold disabled:opacity-40 hover:bg-gold-light transition-colors"
        >
          Approve
        </button>
        <button
          disabled={busy}
          onClick={async () => {
            setBusy(true)
            await onReject(registration.id)
            setBusy(false)
          }}
          className="px-4 py-2 rounded-lg border border-live/50 text-live text-sm hover:bg-live/10 transition-colors"
        >
          Reject
        </button>
      </div>
    </div>
  )
}

export default function AdminTeamRegistrations() {
  const navigate = useNavigate()

  if (!localStorage.getItem('islogged')) {
    navigate('/')
  }
  const { teamRegistrations, loading, actions } = useTeamRegistrations()

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-floodlight/40">Connecting…</div>
  }

  const pending = teamRegistrations.filter((r) => r.status === 'pending')
  const reviewed = teamRegistrations.filter((r) => r.status !== 'pending')

  return (
    <div className="min-h-screen px-4 md:px-8 py-6 flex flex-col gap-6 max-w-5xl mx-auto">
      <Header />
      <div>
        <p className="tracking-[0.3em] text-gold text-xs font-semibold">AUCTIONEER</p>
        <h1 className="font-display text-2xl md:text-3xl tracking-wide">REVIEW TEAMS</h1>
        <p className="text-floodlight/50 text-sm mt-1">
          Set a budget and approve to add a team to the auction.
        </p>
      </div>

      <section>
        <p className="text-xs tracking-widest text-floodlight/40 mb-3">
          PENDING ({pending.length})
        </p>
        {pending.length === 0 ? (
          <p className="text-floodlight/30 text-sm">No pending team registrations right now.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {pending.map((r) => (
              <TeamReviewCard
                key={r.id}
                registration={r}
                onApprove={actions.approveTeamRegistration}
                onReject={actions.rejectTeamRegistration}
              />
            ))}
          </div>
        )}
      </section>

      {reviewed.length > 0 && (
        <section>
          <p className="text-xs tracking-widest text-floodlight/40 mb-3">REVIEWED ({reviewed.length})</p>
          <div className="flex flex-col gap-2">
            {reviewed.map((r) => (
              <div
                key={r.id}
                className={`flex items-center justify-between px-3 py-2 rounded-lg text-sm border ${r.status === 'approved'
                    ? 'border-gold/30 bg-gold/5 text-floodlight/60'
                    : 'border-live/30 bg-live/5 text-floodlight/60'
                  }`}
              >
                <span>{r.name}</span>
                <span className="text-xs uppercase tracking-wide">{r.status}</span>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
