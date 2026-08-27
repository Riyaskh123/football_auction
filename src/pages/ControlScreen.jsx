import { useState, useMemo, useRef, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuctionData } from '../hooks/useAuctionData'
import { useRegistrations } from '../hooks/useRegistrations'

export default function ControlScreen() {
  const navigate = useNavigate()

  if (!localStorage.getItem('islogged')) {
    navigate('/')
  }

  const { teams, players, auction, loading, actions } = useAuctionData()
  const { registrations } = useRegistrations()
  const pendingCount = registrations.filter((r) => r.status === 'pending').length
  const [manualAmount, setManualAmount] = useState('')
  const [confirmReset, setConfirmReset] = useState(false)
  const [minSquadSize, setMinSquadSize] = useState(auction.minSquadSize)
  const [reserveAmount, setReserveAmount] = useState(auction.reserveAmount)
  const manualInputRef = useRef(null)

  const currentPlayer = useMemo(
    () => players.find((p) => p.id === auction.currentPlayerId) || null,
    [players, auction.currentPlayerId]
  )
  const leadingTeam = teams.find((t) => t.id === auction.currentBidTeamId) || null
  const availableCount = players.filter((p) => (p.status === 'available' || p.status === 'unsold')).length
  const soldCount = players.filter((p) => p.status === 'sold').length
  const unsoldCount = players.filter((p) => p.status === 'unsold').length

  const isEmpty = !loading && teams.length === 0 && players.length === 0
  const isIdleState = auction.status === 'idle' || auction.status === 'sold' || auction.status === 'unsold'

  const submitManualBid = () => {
    if (!manualAmount || !leadingTeam) return
    actions.placeBid(leadingTeam.id, Number(manualAmount))
    setManualAmount('')
  }

  // Type a digit anywhere on the page to jump straight into the manual
  // amount field (no need to click it first), keep typing to build the
  // number, Backspace to correct it, Enter to submit to the leading team.
  useEffect(() => {
    if (!(currentPlayer && auction.status === 'bidding')) return

    const handleKeyDown = (e) => {
      if (e.ctrlKey || e.metaKey || e.altKey) return

      const active = document.activeElement
      const isTypingElsewhere =
        active &&
        (active.tagName === 'INPUT' || active.tagName === 'TEXTAREA') &&
        active !== manualInputRef.current
      if (isTypingElsewhere) return

      if (e.key >= '0' && e.key <= '9') {
        e.preventDefault()
        manualInputRef.current?.focus()
        setManualAmount((prev) => prev + e.key)
      } else if (e.key === 'Backspace') {
        e.preventDefault()
        manualInputRef.current?.focus()
        setManualAmount((prev) => prev.slice(0, -1))
      } else if (e.key === 'Enter') {
        e.preventDefault()
        submitManualBid()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [currentPlayer, auction.status, manualAmount, leadingTeam, actions])

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-floodlight/40">Connecting…</div>
  }

  // if (isEmpty) {
  //   return (
  //     <div className="min-h-screen flex flex-col items-center justify-center gap-4 px-6 text-center">
  //       <h1 className="font-display text-3xl tracking-wide">NO DATA YET</h1>
  //       <p className="text-floodlight/50 max-w-sm">
  //         Your Firestore database is empty. Load the built-in sample teams and players to try the app,
  //         then replace them with your real roster in the Firebase console.
  //       </p>
  //       <button
  //         onClick={() => actions.seedIfEmpty()}
  //         className="px-6 py-3 rounded-xl bg-gold text-pitch-950 font-semibold hover:bg-gold-light transition-colors"
  //       >
  //         Load sample data
  //       </button>
  //     </div>
  //   )
  // }

  if (isEmpty) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 px-6 text-center">
        <h1 className="font-display text-3xl tracking-wide">NO TEAMS REGISTERED </h1>
        <p className="text-floodlight/50 max-w-sm">
          Please register teams to proceed to the auction.
        </p>
      </div>
    )
  }

  return (
    <div className="min-h-screen px-4 md:px-8 py-6 flex flex-col gap-6">
      {/* header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="tracking-[0.3em] text-gold text-xs font-semibold">AUCTIONEER</p>
          <h1 className="font-display text-2xl md:text-3xl tracking-wide">CONTROL PANEL</h1>
        </div>
        <div className="flex items-center gap-4">
          <Link
            to="/dashboard"
            className="px-4 py-2 rounded-lg border border-pitch-line text-xs hover:border-gold/50 transition-colors"
          >
            Home
          </Link>
          <Link
            to="/results"
            className="px-4 py-2 rounded-lg border border-pitch-line text-xs hover:border-gold/50 transition-colors"
          >
            Final squads
          </Link>
          <Link
            to="/players"
            className="px-4 py-2 rounded-lg border border-pitch-line text-xs hover:border-gold/50 transition-colors"
          >
            Player list
          </Link>
          <Link
            to="/admin/fixtures"
            className="px-4 py-2 rounded-lg border border-pitch-line text-xs hover:border-gold/50 transition-colors"
          >
            Fixtures
          </Link>
          <Link
            to="/admin/team-registrations"
            className="relative px-4 py-2 rounded-lg border border-pitch-line text-xs hover:border-gold/50 transition-colors"
          >
            Teams
          </Link>
          <Link
            to="/admin/registrations"
            className="relative px-4 py-2 rounded-lg border border-pitch-line text-xs hover:border-gold/50 transition-colors"
          >
            Registrations
          </Link>
          <div className="font-mono text-xs text-floodlight/50 tabular text-right">
            <div>AVAILABLE {availableCount}</div>
            <div>SOLD {soldCount} · UNSOLD {unsoldCount}</div>
          </div>
        </div>
      </div>

      {/* squad size / reserve settings */}
      <div className="flex flex-wrap items-center gap-3 justify-end">
        <span className="text-xs text-floodlight/50">MIN SQUAD SIZE</span>
        <input
          type="number"
          value={minSquadSize}
          onChange={(e) => setMinSquadSize(e.target.value)}
          className="w-16 px-2 py-1.5 rounded-lg bg-pitch-950 border border-pitch-line text-sm text-center"
        />
        <span className="text-xs text-floodlight/50 ml-4">RESERVE PER SLOT</span>
        <input
          type="number"
          value={reserveAmount}
          onChange={(e) => setReserveAmount(e.target.value)}
          className="w-20 px-2 py-1.5 rounded-lg bg-pitch-950 border border-pitch-line text-sm text-center"
        />
      </div>

      {/* current player + primary actions */}
      <div className="rounded-2xl border border-pitch-line bg-pitch-800/60 p-5 flex flex-col gap-4">
        {currentPlayer ? (
          <div className="flex items-center gap-4">
            <img
              src={currentPlayer.photoUrl}
              alt={currentPlayer.name}
              className="w-16 h-16 rounded-xl object-cover border border-pitch-line"
            />
            <div className="flex-1">
              <div className="font-display text-xl tracking-wide">{currentPlayer.name}</div>
              <div className="text-sm text-floodlight/50">
                #{currentPlayer.jerseyNo} · {currentPlayer.position} · base {currentPlayer.basePrice}
              </div>
            </div>
            <div className="text-right">
              <div className="text-xs text-floodlight/40">CURRENT BID</div>
              <div className="font-mono text-2xl text-gold tabular">{auction.currentBid.toLocaleString()}</div>
              <div className="text-xs text-floodlight/50">{leadingTeam ? leadingTeam.name : '—'}</div>
            </div>
          </div>
        ) : (
          <p className="text-floodlight/50">No player on the block. Call the next player to begin.</p>
        )}

        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => actions.nextPlayer(minSquadSize,reserveAmount)}
            disabled={availableCount === 0}
            className="px-5 py-3 rounded-xl bg-gold text-pitch-950 font-semibold disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gold-light transition-colors"
          >
            {isIdleState ? 'Call next player' : 'Skip to next player'}
          </button>

          {currentPlayer && auction.status === 'bidding' && (
            <>
              <button
                onClick={() => actions.markSold()}
                disabled={!leadingTeam}
                className="px-5 py-3 rounded-xl bg-pitch-700 border border-gold/50 text-gold font-semibold disabled:opacity-30 hover:bg-pitch-600 transition-colors"
              >
                Mark SOLD
              </button>
              <button
                onClick={() => actions.markUnsold()}
                className="px-5 py-3 rounded-xl bg-pitch-700 border border-live/50 text-live font-semibold hover:bg-pitch-600 transition-colors"
              >
                Mark UNSOLD
              </button>
              <button
                onClick={() => actions.resetBid()}
                className="px-5 py-3 rounded-xl bg-pitch-700 border border-pitch-line text-floodlight/70 hover:bg-pitch-600 transition-colors"
              >
                Reset bid
              </button>
            </>
          )}
        </div>
      </div>

      {/* bid step + manual amount */}
      {currentPlayer && auction.status === 'bidding' && (
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-xs text-floodlight/50">BID STEP</span>
          {[50, 100].map((step) => (
            <button
              key={step}
              onClick={() => actions.setBidStep(step)}
              className={`px-3 py-1.5 rounded-lg text-sm border transition-colors ${auction.bidStep === step
                ? 'border-gold text-gold bg-gold/10'
                : 'border-pitch-line text-floodlight/60 hover:border-floodlight/30'
                }`}
            >
              +{step}
            </button>
          ))}
          <div className="flex items-center gap-2 ml-auto">
            <input
              ref={manualInputRef}
              type="number"
              value={manualAmount}
              onChange={(e) => setManualAmount(e.target.value)}
              placeholder="Manual amount"
              className="w-36 px-3 py-1.5 rounded-lg bg-pitch-950 border border-pitch-line text-sm outline-none focus:border-gold/60"
            />
            <button
              onClick={submitManualBid}
              disabled={!manualAmount || !leadingTeam}
              className="px-3 py-1.5 rounded-lg bg-pitch-700 border border-pitch-line text-sm disabled:opacity-30 hover:bg-pitch-600 transition-colors"
            >
              Set
            </button>
          </div>
        </div>
      )}

      {/* team bid buttons */}
      {currentPlayer && auction.status === 'bidding' && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {teams.map((team) => {
            const remaining = team.budget - team.spent
            const isLeading = team.id === auction.currentBidTeamId
            const squadCount = players.filter((p) => p.soldTo === team.id && p.status === 'sold').length
            const slotsStillNeeded = Math.max(0, (auction.minSquadSize || 0) - (squadCount + 1))
            const reserveNeeded = slotsStillNeeded * (auction.reserveAmount || 0)
            const nextBid = auction.currentBid + (auction.bidStep || 100)
            const wouldExceed = nextBid > remaining
            const wouldBreakReserve = reserveNeeded > (remaining - auction.currentBid)
            const disabled = (wouldExceed || wouldBreakReserve || squadCount == auction.minSquadSize) && !isLeading
            
            return (
              <button
                key={team.id}
                onClick={() => {
                  !isLeading && actions.placeBid(team.id)}
                }
                disabled={disabled}
                title={wouldBreakReserve && !wouldExceed ? `Needs to keep ${reserveNeeded} reserved for ${slotsStillNeeded} more player(s)` : ''}
                className={`flex flex-col items-center gap-2 p-3 rounded-xl border transition-colors ${isLeading ? 'border-gold bg-gold/10' : 'border-pitch-line bg-pitch-800/50 hover:border-floodlight/30'
                  } disabled:opacity-30 disabled:cursor-not-allowed`}
              >
                <img src={team.logoUrl} alt={team.name} className="w-10 h-10 rounded-full" />
                <span className="text-xs font-semibold text-center">{team.name}</span>
                <span className="text-[11px] font-mono text-floodlight/40 tabular">{remaining.toLocaleString()} left</span>
                <span className="text-[10px] font-mono text-floodlight/30 tabular">
                  {squadCount}/{auction.minSquadSize} squad
                </span>
              </button>
            )
          })}
        </div>
      )}

      {/* player queue */}
      <div className="rounded-2xl border border-pitch-line bg-pitch-800/40 p-4 flex-1 overflow-auto">
        <p className="text-xs tracking-widest text-floodlight/40 mb-3">PLAYER QUEUE</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-2">
          {players.map((p) => (
            <div
              key={p.id}
              className={`flex items-center justify-between px-3 py-2 rounded-lg text-sm border ${p.status === 'sold'
                ? 'border-gold/30 bg-gold/5 text-floodlight/50'
                : p.status === 'unsold'
                  ? 'border-live/30 bg-live/5 text-floodlight/50'
                  : 'border-pitch-line text-floodlight/80'
                }`}
            >
              <div className="flex items-center gap-1">
                <img src={p.photoUrl} alt={p.name} className="w-10 h-10 rounded-full bg-white object-cover" />
                <div className='flex flex-col gap-0'>
                  <span className='text-white font-semibold'>{p.name}</span>
                  <span className='text-[11px] text-floodlight/60'>#{p.jerseyNo} | {p.position}</span>
                </div>
              </div>
              <span className="font-mono text-xs tabular">
                {p.status === 'sold' ? p.soldPrice : p.status === 'unsold' ? 'UNSOLD' : p.basePrice}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* danger zone */}
      <div className="flex justify-end gap-3">
        {confirmReset ? (
          <>
            <span className="text-sm text-live self-center">Reset all sales? This can't be undone.</span>
            <button
              onClick={() => {
                actions.fullReset()
                setConfirmReset(false)
              }}
              className="px-4 py-2 rounded-lg bg-live text-white text-sm font-semibold"
            >
              Confirm reset
            </button>
            <button
              onClick={() => setConfirmReset(false)}
              className="px-4 py-2 rounded-lg border border-pitch-line text-sm"
            >
              Cancel
            </button>
          </>
        ) : (
          <button
            onClick={() => setConfirmReset(true)}
            className="text-xs text-floodlight/30 hover:text-live transition-colors"
          >
            Reset entire auction
          </button>
        )}
      </div>
    </div>
  )
}