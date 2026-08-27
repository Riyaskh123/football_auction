import { useRef, useState } from 'react'
import { useTeamRegistrations } from '../hooks/useTeamRegistrations'
import { useAuctionData } from '../hooks/useAuctionData'
import Header from '../components/header'

function TeamReviewCard({
  registration,
  team,
  availablePlayers,
  marqueePlayers,
  onApprove,
  onReject,
  onUpdate,
  onDelete,
  onAssignMarquee,
  onRemoveMarquee,
  isRejected,
  isApproved
}) {
  const [budget, setBudget] = useState('10000')
  const [busy, setBusy] = useState(false)
  const [editing, setEditing] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)

  const [name, setName] = useState(registration.name)
  const [shortName, setShortName] = useState(registration.shortName)
  const [ownerName, setOwnerName] = useState(registration.ownerName || '')
  const [phone, setPhone] = useState(registration.phone || '')

  const [marqueePlayerId, setMarqueePlayerId] = useState('')
  const [marqueePrice, setMarqueePrice] = useState('')
  const [marqueeError, setMarqueeError] = useState('')

  const fileInputRef = useRef(null)

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

  const handleAssignMarquee = async () => {
    setMarqueeError('')
    setBusy(true)
    try {
      await onAssignMarquee(marqueePlayerId, team.id, marqueePrice)
      setMarqueePlayerId('')
      setMarqueePrice('')
    } catch (err) {
      setMarqueeError(err.message || 'Could not assign player')
    }
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

      {isApproved && (
        <div className="flex flex-col gap-3">
          <div className="flex w-full gap-2 justify-between items-center">
            <span className='inline-flex items-center rounded-md bg-green-400/10 px-2 py-1 text-xs font-medium text-green-400 inset-ring inset-ring-green-400/20'>Approved</span>
            {team && (
              <span className="text-[11px] text-floodlight/50 font-mono tabular">
                {(team.budget - (team.spent || 0)).toLocaleString()} left of {team.budget?.toLocaleString()}
              </span>
            )}
          </div>

          {/* marquee player assignment */}
          {team && (
            <div className="p-3 rounded-lg bg-pitch-950/60 border border-pitch-line flex flex-col gap-2">
              <p className="text-xs text-floodlight/50">Assign marquee player</p>
              <div className="flex gap-2">
                <select
                  value={marqueePlayerId}
                  onChange={(e) => setMarqueePlayerId(e.target.value)}
                  className="flex-1 px-2 py-1.5 rounded-lg bg-pitch-900 border border-pitch-line text-xs"
                >
                  <option value="">Select player</option>
                  {availablePlayers.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
                <input
                  type="number"
                  value={marqueePrice}
                  onChange={(e) => setMarqueePrice(e.target.value)}
                  placeholder="Price"
                  className="w-24 px-2 py-1.5 rounded-lg bg-pitch-900 border border-pitch-line text-xs"
                />
              </div>
              <button
                disabled={busy || !marqueePlayerId || !marqueePrice}
                onClick={handleAssignMarquee}
                className="px-3 py-1.5 rounded-lg bg-gold text-pitch-950 text-xs font-semibold disabled:opacity-40 hover:bg-gold-light transition-colors self-start"
              >
                Add as Marquee player
              </button>
              {marqueeError && <p className="text-[11px] text-live">{marqueeError}</p>}
            </div>
          )}

          {/* current marquee picks for this team */}
          {marqueePlayers.length > 0 && (
            <div className="flex flex-col gap-1.5">
              <p className="text-[11px] tracking-wide text-floodlight/40">MARQUEE PICKS</p>
              {marqueePlayers.map((p) => (
                <div
                  key={p.id}
                  className="flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-pitch-950/40 border border-pitch-line/60 text-xs"
                >
                  <span>
                    {p.name} <span className="text-gold font-mono ml-1">{p.soldPrice?.toLocaleString()}</span>
                  </span>
                  <button
                    disabled={busy}
                    onClick={async () => {
                      setBusy(true)
                      await onRemoveMarquee(p.id, team.id, p.soldPrice)
                      setBusy(false)
                    }}
                    className="text-live text-[11px]"
                  >
                    Undo
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

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
  const { teamRegistrations, loading: regsLoading, actions } = useTeamRegistrations()
  const { teams, players, loading: dataLoading, actions: auctionActions } = useAuctionData()

  const loading = regsLoading || dataLoading
  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-floodlight/40">Connecting…</div>
  }

  const teamById = Object.fromEntries(teams.map((t) => [t.id, t]))
  const availablePlayers = players.filter((p) => p.status === 'available')

  const pending = teamRegistrations.filter((r) => r.status === 'pending')
  const reviewed = teamRegistrations.filter((r) => r.status !== 'pending')

  const cardProps = (r) => ({
    registration: r,
    team: r.teamId ? teamById[r.teamId] : null,
    availablePlayers,
    marqueePlayers: r.teamId
      ? players.filter((p) => p.soldTo === r.teamId && p.isMarquee)
      : [],
    onApprove: actions.approveTeamRegistration,
    onReject: actions.rejectTeamRegistration,
    onUpdate: actions.updateTeamRegistration,
    onDelete: actions.deleteTeamRegistration,
    onAssignMarquee: auctionActions.assignMarqueePlayer,
    onRemoveMarquee: auctionActions.removeMarqueePlayer
  })

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
              <TeamReviewCard key={r.id} {...cardProps(r)} />
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
                key={r.id}
                isRejected={r.status === 'rejected'}
                isApproved={r.status === 'approved'}
                {...cardProps(r)}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}