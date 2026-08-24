import { useAuctionData } from '../hooks/useAuctionData'
import PlayerCard from '../components/PlayerCard.jsx'
import Scoreboard from '../components/Scoreboard.jsx'
import TeamStrip from '../components/TeamStrip.jsx'
import SoldOverlay from '../components/SoldOverlay.jsx'
import logo from '../assets/logo.png';
import video from '../assets/bg.webm';
import FinalDisplayList from '../components/FinalDisplayList.jsx'
import IntroOverlay from '../components/IntroOverlay.jsx'
import { useIntroOnPlayerChange } from '../hooks/useIntroOnPlayerChange'
import introVideo from '../assets/intro.webm'

export default function DisplayScreen() {
  const { teams, players, auction, loading } = useAuctionData()
  const { showIntro, finishIntro } = useIntroOnPlayerChange(auction.currentPlayerId)

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-floodlight/40">
        Connecting…
      </div>
    )
  }

  const currentPlayer = players.find((p) => p.id === auction.currentPlayerId) || null
  const leadingTeam = teams.find((t) => t.id === auction.currentBidTeamId) || null
  const soldTeam = auction.status === 'sold' ? leadingTeam : null

  const soldCount = players.filter((p) => p.status === 'sold').length
  const remainingCount = players.filter((p) => p.status === 'available').length

  const availableCount = players.filter((p) => p.status === 'available').length

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden">
      <video src={video} autoPlay loop muted className="absolute z-0 top-0 left-0 w-full h-full object-cover opacity-25" />
      <img src={logo} alt="logo" className={`absolute top-[20%] w-[150px] translate-x-[-50%]  md:top-[50%] ${availableCount === 0 ? 'md:left-[50%] md:translate-x-[-50%] md:translate-y-[-50%] md:w-[300px] opacity-50' : 'left-[150px] w-[200px]'} translate-y-[-50%]`} />

      {availableCount === 0 &&
        <div className='absolute top-20 left-0 md:left-4 z-50 w-full overflow-auto'>
          <FinalDisplayList />
        </div>
      }

      {/* header */}
      <header className="flex items-center justify-between px-8 md:px-14 pt-4 relative z-10">
        <div>
          <p className="tracking-[0.3em] text-gold text-xs font-semibold">{availableCount > 0 ? 'KPL ' : 'FINAL SQUADS'}</p>
          <h1 className="font-display text-3xl md:text-4xl tracking-wide">AUCTION ROOM</h1>
        </div>
        <div className="text-right font-mono text-sm text-floodlight/50 tabular">
          <div>SOLD {soldCount}</div>
          <div>LEFT {remainingCount}</div>
        </div>
      </header>

      {availableCount !=0 && <IntroOverlay show={showIntro} onFinish={finishIntro} videoSrc={introVideo} maxDuration={10000} />}

      {
        availableCount != 0 &&
        <main className="flex-1 flex flex-col items-center justify-center gap-6 px-6 py-8">
          {currentPlayer ? (
            <div>
              <PlayerCard player={currentPlayer} animationDelay={8750} />
              <Scoreboard amount={auction.currentBid} leadingTeam={leadingTeam} />
            </div>
          ) : (
            <div className="text-center animate-float-slow">
              <p className="font-display text-4xl md:text-5xl tracking-wide text-floodlight/70">
                WAITING FOR PLAYER
              </p>
              <p className="text-floodlight/40 mt-3">Auctioneer will call the player shortly</p>
            </div>
          )}
        </main>
      }

      {
        availableCount != 0 &&
        <div className=" md:fixed right-2 bottom-0">
          <TeamStrip teams={teams} leadingTeamId={auction.currentBidTeamId} />
        </div>
      }

      {availableCount != 0 && <SoldOverlay status={auction.status} player={currentPlayer} team={soldTeam} />}

    </div>
  )
}
