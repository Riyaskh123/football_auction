const confettiColors = ['#E8B923', '#F4D35E', '#E63946', '#F5F3EA', '#2A4535']

function Confetti() {
  const pieces = Array.from({ length: 60 })
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {pieces.map((_, i) => {
        const left = Math.random() * 100
        const delay = Math.random() * 0.6
        const duration = 2.4 + Math.random() * 1.6
        const size = 6 + Math.random() * 8
        const color = confettiColors[i % confettiColors.length]
        return (
          <span
            key={i}
            className="absolute top-0 animate-confetti-fall"
            style={{
              left: `${left}%`,
              width: size,
              height: size * 0.4,
              backgroundColor: color,
              animationDelay: `${delay}s`,
              animationDuration: `${duration}s`
            }}
          />
        )
      })}
    </div>
  )
}

export default function SoldOverlay({ status, player, team }) {
  if (status !== 'sold' && status !== 'unsold') return null
  const isSold = status === 'sold'

  return (
    <div className="absolute inset-0 z-30 flex items-center justify-center bg-pitch-950/80 backdrop-blur-sm">
      {isSold && <Confetti />}
      <div className="relative flex flex-col items-center gap-6 animate-stamp-in">
        <div
          className={`px-14 py-5 rounded-2xl border-4 font-display text-6xl md:text-7xl tracking-widest ${
            isSold
              ? 'border-gold text-gold bg-pitch-900/80'
              : 'border-live text-live bg-pitch-900/80'
          }`}
        >
          {isSold ? 'SOLD' : 'UNSOLD'}
        </div>
        {isSold && team && (
          <div className="flex items-center gap-3 bg-pitch-900/80 border border-gold/40 rounded-full pl-2 pr-6 py-2">
            <img src={team.logoUrl} alt={team.name} className="w-10 h-10 rounded-full" />
            <span className="font-semibold">{team.name}</span>
            <span className="font-mono text-gold tabular">
              {player?.soldPrice?.toLocaleString?.() ?? ''}
            </span>
          </div>
        )}
        {player && (
          <p className="text-floodlight/60 text-lg">{player.name}</p>
        )}
      </div>
    </div>
  )
}
