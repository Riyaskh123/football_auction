export default function TeamStrip({ teams, leadingTeamId }) {
  return (
    <div className="md:absolute left-0 bottom-0 w-full no-scrollbar p-2 ">
      <div className="grid grid-cols-2 justify-between gap-2 px-2 py-2 w-full">
        {teams.map((team,ind) => {
          const remaining = team.budget - team.spent
          const isLeading = team.id === leadingTeamId
          return (
            <div
              key={team.id}
              className={`flex items-center gap-2 h-full md:h-auto px-3 py-1.5 rounded-2xl border transition-all duration-300 md:w-[200px] ${ind % 2 === 0 ? 'md:justify-self-start' : 'md:justify-self-end flex-row-reverse'} ${isLeading
                ? 'border-gold bg-gold/10 scale-110 md:w-[250px] animate-glow-pulse'
                : 'border-pitch-line bg-pitch-800/60'
                }`}
            >
              <img
                src={team.logoUrl}
                alt={team.name}
                className={`w-10 h-10 md:w-12 md:h-12 rounded-full object-cover`}
              />
              <div className={`flex flex-col ${ind % 2 === 0 ? 'items-start' : 'items-end'}`}>
                <span className="text-sm font-semibold tracking-wide text-floodlight/80">
                  {team.name}
                </span>
                <span className="text-[14px] font-mono text-gold tabular">
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
