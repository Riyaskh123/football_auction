import { useRef, useState } from 'react'
import { useTeamRegistrations } from '../hooks/useTeamRegistrations'
import Header from '../components/header'

function TeamReviewCard({ registration, onApprove, onReject, onUpdate, onDelete, isRejected, isApproved }) {
  const [budget, setBudget] = useState('10000')
  const [busy, setBusy] = useState(false)
  const [editing, setEditing] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)

  const [name, setName] = useState(registration.name)
  const [shortName, setShortName] = useState(registration.shortName)
  const [ownerName, setOwnerName] = useState(registration.ownerName || '')
  const [phone, setPhone] = useState(registration.phone || '')

  const fileInputRef = useRef(null);

  const saveEdit = async () => {
    setBusy(true)
    await onUpdate(registration.id, {
      name,
      shortName: shortName.slice(0, 4),
      ownerName: ownerName || null,
      phone: phone || null
    })
    setBusy(false)
    setEditing(false)
  }

  const handleFileChange = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    setBusy(true)
    await onUpdate(registration.id, { logoUrl: file })
    setBusy(false)
  }

  return (
    <div className={`rounded-xl border border-pitch-line p-4 flex flex-col gap-3 ${isApproved ? 'bg-pitch-800/50 border-2 border-gold' : isRejected ? 'border-2 bg-red-900/20  border-live' : ''}`}>
      <div className="flex items-center gap-3">
        <div className="w-14 h-14 rounded-full bg-pitch-950 border border-pitch-line overflow-hidden flex items-center justify-center shrink-0"
          onClick={() => {
            if (editing) {
              fileInputRef.current.click()
            }
          }
          }
        >
          {registration.logoUrl ? (
            <img src={registration.logoUrl} alt={registration.name} className="w-full h-full object-cover" />
          ) : (
            <span className="text-floodlight/30 text-xs">No logo</span>
          )}
        </div>
        <input
          ref={fileInputRef}
          type="file"
          onChange={handleFileChange}
          style={{ display: "none" }}
        />
        <div className="flex-1 min-w-0">
          <div className="font-semibold truncate">{registration.name}</div>
          <div className="text-xs text-floodlight/50">
            {registration.shortName}
            {registration.ownerName ? ` · ${registration.ownerName}` : ''}
            {registration.phone ? ` · ${registration.phone}` : ''}
          </div>
          {registration.status === 'approved' && (
            <div className="text-xs text-floodlight/50">
              {registration.budget}
            </div>
          )}
        </div>
        <button onClick={() => setEditing((v) => !v)} className="text-xs text-gold shrink-0">
          {editing ? 'Cancel' : 'Edit'}
        </button>
      </div>

      {editing && (
        <div className="flex flex-col gap-2 p-3 rounded-lg bg-pitch-950/60 border border-pitch-line">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Team name"
            className="px-3 py-2 rounded-lg bg-pitch-900 border border-pitch-line text-sm"
          />
          <input
            value={shortName}
            onChange={(e) => setShortName(e.target.value.slice(0, 4))}
            placeholder="Short code"
            maxLength={4}
            className="px-3 py-2 rounded-lg bg-pitch-900 border border-pitch-line text-sm uppercase"
          />
          <input
            value={ownerName}
            onChange={(e) => setOwnerName(e.target.value)}
            placeholder="Owner / captain"
            className="px-3 py-2 rounded-lg bg-pitch-900 border border-pitch-line text-sm"
          />
          <input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="Phone"
            className="px-3 py-2 rounded-lg bg-pitch-900 border border-pitch-line text-sm"
          />
          <button
            disabled={busy || !name.trim() || !shortName.trim()}
            onClick={saveEdit}
            className="px-3 py-2 rounded-lg bg-gold text-pitch-950 text-sm font-semibold disabled:opacity-40"
          >
            Save changes
          </button>
        </div>
      )}

      {!isApproved && (

        <div className="flex items-center gap-2">
          <label className="text-xs text-floodlight/50 shrink-0">Budget</label>
          <input
            type="number"
            value={budget}
            onChange={(e) => setBudget(e.target.value)}
            className="w-full px-3 py-2 rounded-lg bg-pitch-950 border border-pitch-line text-sm outline-none focus:border-gold/60"
          />
        </div>
      )}

      {!isApproved && !isRejected && (
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
              await onReject(registration)
              setBusy(false)
            }}
            className="px-4 py-2 rounded-lg border border-live/50 text-live text-sm hover:bg-live/10 transition-colors"
          >
            Reject
          </button>
        </div>
      )}

      {
        isRejected && (
          <div className="flex w-full gap-2 justify-between items-center">
            <span className='inline-flex items-center rounded-md bg-red-400/10 px-2 py-1 text-xs font-medium text-red-400 inset-ring inset-ring-red-400/20'>Rejected</span>
            <button
              disabled={busy}
              onClick={async () => {
                setBusy(true)
                await onApprove(registration, budget)
                setBusy(false)
              }}
              className="px-4 py-2 rounded-lg border bg-green-900/60 border-green-900 text-green text-sm hover:bg-live/10 transition-colors"
            >
              Make Available
            </button>
          </div>
        )
      }

      {
        isApproved && (
          <div className="flex w-full gap-2 justify-between items-center">
            <span className='inline-flex items-center rounded-md bg-green-400/10 px-2 py-1 text-xs font-medium text-green-400 inset-ring inset-ring-green-400/20'>Approved</span>
            {/* <button
              disabled={busy}
              onClick={async () => {
                setBusy(true)
                await onReject(registration)
                setBusy(false)
              }}
              className="px-4 py-2 rounded-lg border bg-red-900/60 border-red-900 text-red text-sm hover:bg-live/10 transition-colors"
            >
              Reject
            </button> */}
          </div>
        )
      }

      {confirmDelete ? (
        <div className="flex items-center gap-2 text-xs">
          <span className="text-live flex-1">Delete this team registration permanently?</span>
          <button
            disabled={busy}
            onClick={async () => {
              setBusy(true)
              await onDelete(registration.id)
            }}
            className="px-3 py-1.5 rounded-lg bg-live text-white font-semibold"
          >
            Confirm
          </button>
          <button
            onClick={() => setConfirmDelete(false)}
            className="px-3 py-1.5 rounded-lg border border-pitch-line"
          >
            Cancel
          </button>
        </div>
      ) : (
        <button
          onClick={() => setConfirmDelete(true)}
          className="text-[11px] text-floodlight/30 hover:text-live transition-colors self-end"
        >
          Delete registration
        </button>
      )}
    </div>
  )
}

export default function AdminTeamRegistrations() {
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
          Edit details, set a budget, and approve to add a team to the auction.
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
                onUpdate={actions.updateTeamRegistration}
                onDelete={actions.deleteTeamRegistration}
              />
            ))}
          </div>
        )}
      </section>

      {reviewed.length > 0 && (
        <section>
          <p className="text-xs tracking-widest text-floodlight/40 mb-3">REVIEWED ({reviewed.length})</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {reviewed.map((r) => (

              <TeamReviewCard
                isRejected={r.status === 'rejected'}
                isApproved={r.status === 'approved'}
                key={r.id}
                registration={r}
                onApprove={actions.approveTeamRegistration}
                onReject={actions.rejectTeamRegistration}
                onUpdate={actions.updateTeamRegistration}
                onDelete={actions.deleteTeamRegistration}
              />
              // <div
              //   key={r.id}
              //   className={`flex items-center justify-between px-3 py-2 rounded-lg text-sm border ${
              //     r.status === 'approved'
              //       ? 'border-gold/30 bg-gold/5 text-floodlight/60'
              //       : 'border-live/30 bg-live/5 text-floodlight/60'
              //   }`}
              // >
              //   <span>{r.name}</span>
              //   <span className="text-xs uppercase tracking-wide">{r.status}</span>
              // </div>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}