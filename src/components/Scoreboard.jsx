export default function Scoreboard({ amount, leadingTeam }) {
  return (
    <div className="flex flex-col items-center gap-2">
      <span className="text-xs tracking-[0.35em] text-floodlight/50">CURRENT BID</span>
      <div className="relative px-7 py-3 rounded-2xl bg-pitch-950 border-2 border-gold/40 shadow-[0_0_50px_rgba(232,185,35,0.15)]">
        <span className="font-mono text-3xl md:text-5xl text-gold tabular tracking-wider">
          {amount ? amount.toLocaleString() : '0'}
        </span>
      </div>
      <div className="h-8 flex items-center gap-2">
        {leadingTeam ? (
          <>
            <img
              src={leadingTeam.logoUrl}
              alt={leadingTeam.name}
              className="w-6 h-6 rounded-full border border-gold/60"
            />
            <span className="text-sm text-floodlight/80 font-semibold">{leadingTeam.name}</span>
          </>
        ) : (
          <span className="text-sm text-floodlight/40">Waiting for first bid…</span>
        )}
      </div>
    </div>
  )
}
