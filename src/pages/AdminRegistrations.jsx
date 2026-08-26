import { useRef, useState } from 'react'
import { useRegistrations } from '../hooks/useRegistrations'
import Header from '../components/header'

const positions = ['GK', 'DEF', 'MID', 'FWD']

function ReviewCard({ registration, onApprove, onReject, onUpdate, onDelete, isApproved, isRejected }) {
  const [basePrice, setBasePrice] = useState('100')
  const [busy, setBusy] = useState(false)
  const [editing, setEditing] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)

  // local draft fields, only used while editing
  const [name, setName] = useState(registration.name)
  const [phone, setPhone] = useState(registration.phone || '')
  const [position, setPosition] = useState(registration.position)
  const [jerseyNo, setJerseyNo] = useState(registration.jerseyNo ?? '')

  const fileInputRef = useRef(null);

  const saveEdit = async () => {
    setBusy(true)
    await onUpdate(registration.id, {
      name,
      phone: phone || null,
      position,
      jerseyNo: jerseyNo ? Number(jerseyNo) : null
    })
    setBusy(false)
    setEditing(false)
  }

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        onUpdate(registration.id, { photoUrl: reader.result })
      }
      reader.readAsDataURL(file)
    }
  }

  return (
    <div className={`rounded-xl border border-pitch-line p-4 flex flex-col gap-3 ${isApproved ? 'bg-pitch-800/50 border-2 border-gold' : isRejected ? 'border-2 bg-red-900/20  border-live' : ''}`}>
      <div className="flex items-center gap-3">
        <div className={`w-14 h-14 rounded-full bg-pitch-700 border border-pitch-line overflow-hidden flex items-center justify-center shrink-0 relative ${editing ? 'cursor-pointer' : ''}`}
          onClick={() => {
            if (editing) {
              fileInputRef.current.click()
            }
          }}
        >
          <span className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-pitch-950/50 rounded-full p-1 text-[7px] ${editing ? 'opacity-100' : 'hidden group-hover:opacity-100 '}`}>Change</span>
          <input
            ref={fileInputRef}
            type="file"
            onChange={handleFileChange}
            style={{ display: "none" }}
          />
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
        <button
          onClick={() => setEditing((v) => !v)}
          className="text-xs text-gold shrink-0"
        >
          {editing ? 'Cancel' : 'Edit'}
        </button>
      </div>

      {editing && (
        <div className="flex flex-col gap-2 p-3 rounded-lg bg-pitch-950/60 border border-pitch-line">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Name"
            className="px-3 py-2 rounded-lg bg-pitch-900 border border-pitch-line text-sm"
          />
          <div className="grid grid-cols-2 gap-2">
            <select
              value={position}
              onChange={(e) => setPosition(e.target.value)}
              className="px-3 py-2 rounded-lg bg-pitch-900 border border-pitch-line text-sm"
            >
              {positions.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
            <input
              type="text"
              value={jerseyNo}
              onChange={(e) => setJerseyNo(e.target.value)}
              placeholder="Reg No."
              className="px-3 py-2 rounded-lg bg-pitch-900 border border-pitch-line text-sm"
            />
          </div>
          <input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="Phone"
            className="px-3 py-2 rounded-lg bg-pitch-900 border border-pitch-line text-sm"
          />
          <button
            disabled={busy || !name.trim()}
            onClick={saveEdit}
            className="px-3 py-2 rounded-lg bg-gold text-pitch-950 text-sm font-semibold disabled:opacity-40"
          >
            Save changes
          </button>
        </div>
      )}

      {!isApproved && !isRejected && (
        <div className="flex items-center gap-2">
          <label className="text-xs text-floodlight/50 shrink-0">Base price</label>
          <input
            type="number"
            value={basePrice}
            onChange={(e) => setBasePrice(e.target.value)}
            className="w-full px-3 py-2 rounded-lg bg-pitch-950 border border-pitch-line text-sm outline-none focus:border-gold/60"
          />
        </div>
      )}

      {!isApproved && !isRejected && (
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
      )}

      {
        isRejected && (
          <div className="flex w-full gap-2 justify-between items-center">
            <span className='inline-flex items-center rounded-md bg-red-400/10 px-2 py-1 text-xs font-medium text-red-400 inset-ring inset-ring-red-400/20'>Rejected</span>
            <button
              disabled={busy || !basePrice}
              onClick={async () => {
                setBusy(true)
                await onApprove(registration, basePrice)
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
              disabled={busy || !basePrice}
              onClick={async () => {
                setBusy(true)
                await onReject(registration.id)
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
          <span className="text-live flex-1">Delete this registration permanently?</span>
          <button
            disabled={busy}
            onClick={async () => {
              setBusy(true)
              await onDelete(registration.id,registration.playerId)
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

export default function AdminRegistrations() {
  const { registrations, loading, actions } = useRegistrations()

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-floodlight/40">Connecting…</div>
  }

  const pending = registrations.filter((r) => r.status === 'pending')
  const approved = registrations.filter((r) => r.status === 'approved')
  const rejected = registrations.filter((r) => r.status === 'rejected')

  return (
    <div className="min-h-screen px-4 md:px-8 py-6 flex flex-col gap-6 max-w-5xl mx-auto">
      <Header/>
      <div>
        <p className="tracking-[0.3em] text-gold text-xs font-semibold">AUCTIONEER</p>
        <h1 className="font-display text-2xl md:text-3xl tracking-wide">REVIEW REGISTRATIONS</h1>
        <p className="text-floodlight/50 text-sm mt-1">
          Edit details, set a base price, and approve to add a player to the auction pool.
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
                onUpdate={actions.updateRegistration}
                onDelete={actions.deleteRegistration}
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {[...approved, ...rejected].map((r) => (
              <ReviewCard
                isApproved={r.status === 'approved'}
                isRejected={r.status === 'rejected'}
                key={r.id}
                registration={r}
                onApprove={actions.approveRegistration}
                onReject={actions.rejectRegistration}
                onUpdate={actions.updateRegistration}
                onDelete={actions.deleteRegistration}
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