import { Link, useNavigate } from 'react-router-dom'

export default function Home() {
  const navigate = useNavigate()

  if (!localStorage.getItem('islogged')) {
    navigate('/')
  }
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-10 px-6">
      <button className="absolute top-6 right-6 px-4 py-2 rounded-xl bg-pitch-800/60 border border-pitch-line hover:border-gold/40 transition-colors text-center" onClick={() => {
        localStorage.removeItem('islogged')
        navigate('/')
      }}>Logout</button>
      <div className="text-center">
        <p className="tracking-[0.3em] text-gold text-sm mb-3 font-semibold">MATCH DAY</p>
        <h1 className="font-display text-6xl md:text-7xl tracking-wide">AUCTION ROOM</h1>
        <p className="text-floodlight/60 mt-4 max-w-md mx-auto">
          Open <span className="text-gold">Display</span> on the projector, and{' '}
          <span className="text-gold">Control</span> on the auctioneer's device.
        </p>
      </div>
      <div className="flex flex-col sm:flex-row gap-5">
        <Link
          to="/display"
          className="px-8 py-4 rounded-xl bg-pitch-700 border border-pitch-line hover:border-gold/60 transition-colors text-center"
          target='_blank'
        >
          <div className="font-display text-2xl tracking-wide">DISPLAY</div>
          <div className="text-sm text-floodlight/50 mt-1">Projector / big screen</div>
        </Link>
        <Link
          to="/control"
          className="px-8 py-4 rounded-xl bg-gold text-pitch-950 hover:bg-gold-light transition-colors text-center font-semibold"
        >
          <div className="font-display text-2xl tracking-wide">CONTROL</div>
          <div className="text-sm text-pitch-950/70 mt-1">Auctioneer panel</div>
        </Link>
      </div>

      <div className="flex flex-col sm:flex-row flex-wrap justify-center gap-4 text-sm max-w-2xl">
        <Link
          to="/register"
          className="px-6 py-3 rounded-xl bg-pitch-800/60 border border-pitch-line hover:border-gold/40 transition-colors text-center"
        >
          <div className="font-semibold">Player registration</div>
          <div className="text-floodlight/40 text-xs mt-0.5">Share this link with players</div>
        </Link>
        <Link
          to="/register/team"
          className="px-6 py-3 rounded-xl bg-pitch-800/60 border border-pitch-line hover:border-gold/40 transition-colors text-center"
        >
          <div className="font-semibold">Team registration</div>
          <div className="text-floodlight/40 text-xs mt-0.5">Share this link with team owners</div>
        </Link>
        <Link
          to="/admin/registrations"
          className="px-6 py-3 rounded-xl bg-pitch-800/60 border border-pitch-line hover:border-gold/40 transition-colors text-center"
        >
          <div className="font-semibold">Review registrations</div>
          <div className="text-floodlight/40 text-xs mt-0.5">Admin only — approve players</div>
        </Link>
        <Link
          to="/admin/team-registrations"
          className="px-6 py-3 rounded-xl bg-pitch-800/60 border border-pitch-line hover:border-gold/40 transition-colors text-center"
        >
          <div className="font-semibold">Review teams</div>
          <div className="text-floodlight/40 text-xs mt-0.5">Admin only — approve teams</div>
        </Link>
        <Link
          to="/players"
          className="px-6 py-3 rounded-xl bg-pitch-800/60 border border-pitch-line hover:border-gold/40 transition-colors text-center"
        >
          <div className="font-semibold">Player List</div>
          <div className="text-floodlight/40 text-xs mt-0.5">All Players List</div>
        </Link>
        <Link
          to="/results"
          className="px-6 py-3 rounded-xl bg-pitch-800/60 border border-pitch-line hover:border-gold/40 transition-colors text-center"
        >
          <div className="font-semibold">Final squads</div>
          <div className="text-floodlight/40 text-xs mt-0.5">Results by team, printable</div>
        </Link>
      </div>
    </div>
  )
}
