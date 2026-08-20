export default function TeamStrip({ teams, leadingTeamId }) {
  return (
    <div className="w-full no-scrollbar">
      <div className="grid grid-cols-2 md:flex md:flex-col items-center justify-center gap-1 md:gap-1 px-2 py-2">
        {teams.map((team) => {
          const remaining = team.budget - team.spent
          const isLeading = team.id === leadingTeamId
          return (
            <div
              key={team.id}
              className={`flex w-full items-center gap-2 px-3 py-1.5 rounded-2xl border transition-all duration-300 ${isLeading
                ? 'border-gold bg-gold/10 scale-105 md:scale-110 animate-glow-pulse'
                : 'border-pitch-line bg-pitch-800/60'
                }`}
            >
              <img
                src={team.logoUrl}
                alt={team.name}
                className={`w-10 h-10 md:w-12 md:h-12 rounded-full ${isLeading ? 'ring-2 ring-gold' : 'ring-1 ring-pitch-line'}`}
              />
              <div className="flex flex-col">
                <span className="text-sm font-semibold tracking-wide text-floodlight/80">
                  {team.name}
                </span>
                <span className="text-[12px] font-mono text-floodlight/40 tabular">
                  {remaining.toLocaleString()}
                </span>
              </div>

            </div>
          )
        })}
      </div>
    </div>
  )
}
