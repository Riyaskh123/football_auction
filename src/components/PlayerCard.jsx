export default function PlayerCard({ player, animationDelay = 0 }) {
  if (!player) return null
  return (
    <div
      key={player.id}
      className="relative w-[240px] md:w-[380px] animate-zoom-in"
      style={{ animationDelay: `${animationDelay}ms` }}

    >
      <div className="relative rounded-[24px] bg-pitch-800/30 border border-pitch-line/50 overflow-hidden animate-glow-pulse">
        {/* photo */}
        <div className="relative h-[225px] md:h-[350px] bg-pitch-700/30 overflow-hidden">
          <img
            src={player.photoUrl}
            alt={player.name}
            className="w-full h-full object-contain animate-float-slow"
          />
          <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-pitch-900 to-transparent" />
          <div className="absolute top-4 right-4 px-3 py-1 rounded-full bg-pitch-950/80 border border-pitch-line text-sm tracking-widest font-semibold">
            {player.position}
          </div>
          <div className="absolute top-4 left-4 px-3 py-1 rounded-full bg-pitch-950/80 border border-pitch-line text-sm tracking-widest font-semibold">
            {player.jerseyNo}
          </div>
        </div>

        {/* details */}
        <div className="px-6 py-3">
          <h2 className="font-display text-xl md:text-2xl tracking-wide leading-tight">
            {player.name}
          </h2>
          <div className="mt-3 flex items-center justify-between">
            <span className="text-xs tracking-[0.25em] text-floodlight/50">BASE PRICE</span>
            <span className="font-mono text-xl text-gold tabular">
              {player.basePrice.toLocaleString()}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
