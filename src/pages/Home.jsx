import { Link, useNavigate } from 'react-router-dom'
import registration from '../assets/registration.png';
import team from '../assets/team.png';
import teamreview from '../assets/team-review.png';
import playerreview from '../assets/player-review.png';
import squad from '../assets/squad.png';
import playerlist from '../assets/player-list.png';
import fixture from '../assets/fixture.png';
import score from '../assets/score.png';




export default function Home() {
  const navigate = useNavigate()
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-10 px-6">
      <div className="text-center">
        <p className="tracking-[0.3em] text-gold text-sm mb-3 font-semibold">Kodikuthumala Premier League</p>
        <h1 className="font-display text-6xl md:text-7xl tracking-wide">AUCTION ROOM</h1>
        <p className="text-floodlight/60 mt-4 max-w-md mx-auto">
          Open <span className="text-gold">Display</span> on the projector, and{' '}
          <span className="text-gold">Control</span> on the auctioneer's device.
        </p>
        <button className='absolute right-5 text-red top-5 cursor-pointer' onClick={() =>{
          localStorage.removeItem('islogged')
          navigate('/')
        }}>Logout</button>
      </div>
      <div className="flex flex-col sm:flex-row gap-5">
        <Link
        target='_blank'
          to="/display"
          className="px-8 py-4 rounded-xl bg-pitch-700 border border-pitch-line hover:border-gold/60 transition-colors text-center"
        >
          <div className="font-display text-2xl tracking-wide">DISPLAY</div>
          <div className="text-sm text-floodlight/50 mt-1">Projector/Big screen/Live Auction</div>
        </Link>
        <Link
          to="/control"
          className="px-8 py-4 rounded-xl bg-gold text-pitch-950 hover:bg-gold-light transition-colors text-center font-semibold"
        >
          <div className="font-display text-2xl tracking-wide">CONTROL</div>
          <div className="text-sm text-pitch-950/70 mt-1">Auctioneer panel</div>
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-6xl">
        <Link
          to="/register"
          className="px-6 py-3 rounded-xl bg-pitch-800/60 border border-pitch-line hover:border-gold/40 transition-colors text-center flex flex-col items-center justify-center"
        >
          <img src={registration} alt="" className='w-[80px]'/>
          <div className="font-semibold">Player registration</div>
          <div className="text-floodlight/40 text-xs mt-0.5">Share this link with players</div>
        </Link>
        <Link
          to="/register/team"
          className="px-6 py-3 rounded-xl bg-pitch-800/60 border border-pitch-line hover:border-gold/40 transition-colors text-center flex flex-col items-center justify-center"
        >
          <img src={team} alt="" className='w-[80px]'/>
          <div className="font-semibold">Team registration</div>
          <div className="text-floodlight/40 text-xs mt-0.5">Share this link with team owners</div>
        </Link>
        <Link
          to="/admin/registrations"
          className="px-6 py-3 rounded-xl bg-pitch-800/60 border border-pitch-line hover:border-gold/40 transition-colors text-center flex flex-col items-center justify-center"
        >
          <img src={teamreview} alt="" className='w-[80px]'/>
          <div className="font-semibold">Review registrations</div>
          <div className="text-floodlight/40 text-xs mt-0.5">Admin only — approve players</div>
        </Link>
        <Link
          to="/admin/team-registrations"
          className="px-6 py-3 rounded-xl bg-pitch-800/60 border border-pitch-line hover:border-gold/40 transition-colors text-center flex flex-col items-center justify-center"
        >
          <img src={playerreview} alt="" className='w-[80px]'/>
          <div className="font-semibold">Review teams</div>
          <div className="text-floodlight/40 text-xs mt-0.5">Admin only — approve teams</div>
        </Link>
        <Link
          to="/results"
          className="px-6 py-3 rounded-xl bg-pitch-800/60 border border-pitch-line hover:border-gold/40 transition-colors text-center flex flex-col items-center justify-center"
        >
          <img src={squad} alt="" className='w-[80px]'/>
          <div className="font-semibold">Final squads</div>
          <div className="text-floodlight/40 text-xs mt-0.5">Results by team, printable</div>
        </Link>
        <Link
          to="/players"
          className="px-6 py-3 rounded-xl bg-pitch-800/60 border border-pitch-line hover:border-gold/40 transition-colors text-center flex flex-col items-center justify-center"
        >
          <img src={playerlist} alt="" className='w-[80px]'/>
          <div className="font-semibold">Player list</div>
          <div className="text-floodlight/40 text-xs mt-0.5">Full roster with photos, printable</div>
        </Link>
        <Link
          to="/admin/fixtures"
          className="px-6 py-3 rounded-xl bg-pitch-800/60 border border-pitch-line hover:border-gold/40 transition-colors text-center flex flex-col items-center justify-center"
        >
          <img src={fixture} alt="" className='w-[80px]'/>
          <div className="font-semibold">Fixtures setup</div>
          <div className="text-floodlight/40 text-xs mt-0.5">Admin only — schedule matches, enter results</div>
        </Link>
        <Link
          to="/fixtures"
          className="px-6 py-3 rounded-xl bg-pitch-800/60 border border-pitch-line hover:border-gold/40 transition-colors text-center flex flex-col items-center justify-center"
        >
          <img src={score} alt="" className='w-[80px]'/>
          <div className="font-semibold">League centre</div>
          <div className="text-floodlight/40 text-xs mt-0.5">Fixtures, table & top scorers — share this link</div>
        </Link>
      </div>
    </div>
  )
}
