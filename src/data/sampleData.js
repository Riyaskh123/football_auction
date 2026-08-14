// Sample data used to seed Firestore for local testing.
// Replace photoUrl / logoUrl with real Firebase Storage or Cloudinary URLs later --
// these placeholders are generated on the fly so the app works out of the box.

export const sampleTeams = [
  { id: 'team-falcons', name: 'Desert Falcons', shortName: 'DFC', color: '1E3A2C', budget: 10000, spent: 0 },
  { id: 'team-lions', name: 'Al Nasr Lions', shortName: 'ANL', color: 'A8820F', budget: 10000, spent: 0 },
  { id: 'team-sharks', name: 'Marina Sharks', shortName: 'MSK', color: '1D3557', budget: 10000, spent: 0 },
  { id: 'team-eagles', name: 'Sky Eagles', shortName: 'SKE', color: '6D1E1E', budget: 10000, spent: 0 },
  { id: 'team-titans', name: 'Bay Titans', shortName: 'BTN', color: '3A2E5C', budget: 10000, spent: 0 },
  { id: 'team-wolves', name: 'Dune Wolves', shortName: 'DWL', color: '2A2A2A', budget: 10000, spent: 0 }
].map((t) => ({
  ...t,
  logoUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(t.shortName)}&background=${t.color}&color=fff&size=256&bold=true&font-size=0.42`
}))

const positions = ['GK', 'DEF', 'MID', 'FWD']

export const samplePlayers = Array.from({ length: 24 }).map((_, i) => {
  const n = i + 1
  return {
    id: `player-${n}`,
    name: `Player ${n}`,
    jerseyNo: n,
    position: positions[n % positions.length],
    basePrice: 100 + (n % 5) * 50,
    photoUrl: `https://api.dicebear.com/7.x/personas/svg?seed=player${n}`,
    status: 'available', // available | sold | unsold
    soldTo: null,
    soldPrice: null
  }
})

export const defaultAuctionState = {
  currentPlayerId: null,
  currentBid: 0,
  currentBidTeamId: null,
  status: 'idle', // idle | bidding | sold | unsold
  bidStep: 50,
  updatedAt: null
}
