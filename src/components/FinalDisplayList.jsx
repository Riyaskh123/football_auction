import { useMemo } from 'react'
import { useAuctionData } from '../hooks/useAuctionData'

export default function DisplayFinalScreen() {
    const { teams, players, loading } = useAuctionData()

    const squads = useMemo(
        () =>
            teams.map((team) => ({
                team,
                players: players
                    .filter((p) => p.soldTo === team.id)
                    .sort((a, b) => (b.soldPrice || 0) - (a.soldPrice || 0))
            })),
        [teams, players]
    )

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center text-floodlight/40">
                Connecting…
            </div>
        )
    }

    return (
        <div className="min-h-[90vh] max-h-[90vh] w-full px-2 md:px-4 py-5 overflow-scroll">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
                {squads.map(({ team, players: squad }, teamIdx) => {
                    const remaining = team.budget - (team.spent || 0)
                    return (
                        <div
                            key={team.id}
                            className="relative rounded-[15px] bg-pitch-800/50 backdrop-blur-[2px] border border-pitch-line overflow-hidden animate-card-in"
                            style={{ animationDelay: `${teamIdx * 1000}ms` }}
                        >
                            <div className="absolute -inset-1 rounded-[26px] bg-gradient-to-b from-gold/20 via-transparent to-transparent blur-xl opacity-60 pointer-events-none" />

                            {/* team header */}
                            <div className="relative flex items-center gap-3 px-5 pt-5 pb-4 border-b border-pitch-line">
                                <img
                                    src={team.logoUrl}
                                    alt={team.name}
                                    className="w-14 h-14 rounded-full ring-2 ring-gold/60"
                                />
                                <div className="flex-1 min-w-0">
                                    <h2 className="font-display text-xl tracking-wide leading-tight truncate">
                                        {team.name}
                                    </h2>
                                    <p className="text-xs font-mono text-floodlight/40 tabular mt-0.5">
                                        {squad.length} players <br /> {remaining.toLocaleString()} left
                                    </p>
                                </div>
                            </div>

                            {/* squad list */}
                            <div className="relative px-3 py-4 flex flex-col gap-1 max-h-[420px] overflow-y-auto no-scrollbar">
                                {squad.length === 0 ? (
                                    <p className="text-floodlight/30 text-sm py-6 text-center">No players yet</p>
                                ) : (
                                    squad.map((player, i) => (
                                        <div
                                            key={player.id}
                                            className="flex items-center gap-2 rounded-lg bg-pitch-950/60 border border-pitch-line/60 opacity-0 animate-fade-up overflow-hidden"
                                            style={{ animationDelay: `${teamIdx * 1000 + 250 + i * 300}ms` }}
                                        >
                                            <img src={player.photoUrl} className='w-12' />
                                            <div className="flex flex-col min-w-0 px-2">
                                                <span className="text-sm truncate">{player.name}</span>
                                                <div className='flex gap-2 items-center'>
                                                    <span className="text-[10px] tracking-wide text-floodlight/40 shrink-0">
                                                        {player.position}
                                                    </span>
                                                    <span className="font-mono text-sm text-gold tabular shrink-0">
                                                        {player.soldPrice?.toLocaleString()}
                                                    </span>
                                                </div>
                                            </div>

                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}