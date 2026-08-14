import { useState } from 'react'
import { useRegistrations } from '../hooks/useRegistrations'
import Header from '../components/header'
import { useNavigate } from 'react-router-dom'

function ReviewCard({ registration, onApprove, onReject }) {
  const [basePrice, setBasePrice] = useState('100')
  const [busy, setBusy] = useState(false)

  return (
    <div className="rounded-xl border border-pitch-line bg-pitch-800/50 p-4 flex flex-col gap-3">
      <div className="flex items-center gap-3">
        <div className="w-14 h-14 rounded-full bg-pitch-950 border border-pitch-line overflow-hidden flex items-center justify-center shrink-0">
          {registration.photoUrl ? (
            <img src={registration.photoUrl} alt={registration.name} className="w-full h-full object-cover" />
          ) : (
            <span className="text-floodlight/30 text-xs">No photo</span>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-semibold truncate">{registration.name}</div>
          <div className="text-xs text-floodlight/50">
            {registration.position}
            {registration.jerseyNo ? ` · #${registration.jerseyNo}` : ''}
            {registration.phone ? ` · ${registration.phone}` : ''}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <label className="text-xs text-floodlight/50 shrink-0">Base price</label>
        <input
          type="number"
          value={basePrice}
          onChange={(e) => setBasePrice(e.target.value)}
          className="w-full px-3 py-2 rounded-lg bg-pitch-950 border border-pitch-line text-sm outline-none focus:border-gold/60"
        />
      </div>

      <div className="flex gap-2">
        <button
          disabled={busy || !basePrice}
          onClick={async () => {
            setBusy(true)
            await onApprove(registration, basePrice)
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

export default function AdminRegistrations() {
  const navigate = useNavigate()

  if (!localStorage.getItem('islogged')) {
    navigate('/')
  }
  const { registrations, loading, actions } = useRegistrations()

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-floodlight/40">Connecting…</div>
  }

  const pending = registrations.filter((r) => r.status === 'pending')
  const approved = registrations.filter((r) => r.status === 'approved')
  const rejected = registrations.filter((r) => r.status === 'rejected')

  return (
    <div className="min-h-screen px-4 md:px-8 py-6 flex flex-col gap-6 max-w-5xl mx-auto">
      <Header />
      <div>
        <p className="tracking-[0.3em] text-gold text-xs font-semibold">AUCTIONEER</p>
        <h1 className="font-display text-2xl md:text-3xl tracking-wide">REVIEW REGISTRATIONS</h1>
        <p className="text-floodlight/50 text-sm mt-1">
          Set a base price and approve to add a player to the auction pool.
        </p>
      </div>

      <section>
        <p className="text-xs tracking-widest text-floodlight/40 mb-3">
          PENDING ({pending.length})
        </p>
        {pending.length === 0 ? (
          <p className="text-floodlight/30 text-sm">No pending registrations right now.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {pending.map((r) => (
              <ReviewCard
                key={r.id}
                registration={r}
                onApprove={actions.approveRegistration}
                onReject={actions.rejectRegistration}
              />
            ))}
          </div>
        )}
      </section>

      {(approved.length > 0 || rejected.length > 0) && (
        <section>
          <p className="text-xs tracking-widest text-floodlight/40 mb-3">
            REVIEWED ({approved.length + rejected.length})
          </p>
          <div className="flex flex-col gap-2">
            {[...approved, ...rejected].map((r) => (
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
