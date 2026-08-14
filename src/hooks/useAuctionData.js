import { useEffect, useState, useCallback } from 'react'
import {
  collection,
  doc,
  onSnapshot,
  getDocs,
  writeBatch,
  runTransaction,
  serverTimestamp
} from 'firebase/firestore'
import { db } from '../firebase'
import { sampleTeams, samplePlayers, defaultAuctionState } from '../data/sampleData'

const AUCTION_DOC = doc(db, 'auction', 'live')
const TEAMS_COL = collection(db, 'teams')
const PLAYERS_COL = collection(db, 'players')

export function useAuctionData() {
  const [teams, setTeams] = useState([])
  const [players, setPlayers] = useState([])
  const [auction, setAuction] = useState(defaultAuctionState)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsub1 = onSnapshot(TEAMS_COL, (snap) => {
      setTeams(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
    })
    const unsub2 = onSnapshot(PLAYERS_COL, (snap) => {
      setPlayers(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
    })
    const unsub3 = onSnapshot(AUCTION_DOC, (snap) => {
      if (snap.exists()) setAuction({ ...defaultAuctionState, ...snap.data() })
      setLoading(false)
    })
    return () => {
      unsub1()
      unsub2()
      unsub3()
    }
  }, [])

  // One-time helper: writes sample teams/players if the DB is empty.
  const seedIfEmpty = useCallback(async () => {
    const existing = await getDocs(PLAYERS_COL)
    if (!existing.empty) return false
    const batch = writeBatch(db)
    sampleTeams.forEach((t) => batch.set(doc(db, 'teams', t.id), t))
    samplePlayers.forEach((p) => batch.set(doc(db, 'players', p.id), p))
    batch.set(AUCTION_DOC, { ...defaultAuctionState, updatedAt: serverTimestamp() })
    await batch.commit()
    return true
  }, [])

  const nextPlayer = useCallback(async () => {
    const available = players.filter((p) => p.status === 'available')
    if (available.length === 0) return { ok: false, reason: 'no-players' }
    const pick = available[Math.floor(Math.random() * available.length)]
    await runTransaction(db, async (tx) => {
      tx.set(AUCTION_DOC, {
        currentPlayerId: pick.id,
        currentBid: pick.basePrice,
        currentBidTeamId: null,
        status: 'bidding',
        bidStep: auction.bidStep || 50,
        updatedAt: serverTimestamp()
      })
    })
    return { ok: true, player: pick }
  }, [players, auction.bidStep])

  const placeBid = useCallback(
    async (teamId, customAmount) => {
      const team = teams.find((t) => t.id === teamId)
      if (!team) return
      const step = auction.bidStep || 50
      const nextBid = customAmount ?? auction.currentBid + step
      const remaining = team.budget - team.spent
      if (nextBid > remaining) return { ok: false, reason: 'over-budget' }
      await runTransaction(db, async (tx) => {
        tx.update(AUCTION_DOC, {
          currentBid: nextBid,
          currentBidTeamId: teamId,
          status: 'bidding',
          updatedAt: serverTimestamp()
        })
      })
      return { ok: true }
    },
    [teams, auction.currentBid, auction.bidStep]
  )

  const setBidStep = useCallback(async (step) => {
    await runTransaction(db, async (tx) => {
      tx.update(AUCTION_DOC, { bidStep: step })
    })
  }, [])

  const resetBid = useCallback(async () => {
    const player = players.find((p) => p.id === auction.currentPlayerId)
    if (!player) return
    await runTransaction(db, async (tx) => {
      tx.update(AUCTION_DOC, {
        currentBid: player.basePrice,
        currentBidTeamId: null,
        status: 'bidding',
        updatedAt: serverTimestamp()
      })
    })
  }, [players, auction.currentPlayerId])

  const markSold = useCallback(async () => {
    if (!auction.currentPlayerId || !auction.currentBidTeamId) return { ok: false }
    const playerRef = doc(db, 'players', auction.currentPlayerId)
    const teamRef = doc(db, 'teams', auction.currentBidTeamId)
    await runTransaction(db, async (tx) => {
      const teamSnap = await tx.get(teamRef)
      const teamData = teamSnap.data()
      tx.update(playerRef, {
        status: 'sold',
        soldTo: auction.currentBidTeamId,
        soldPrice: auction.currentBid
      })
      tx.update(teamRef, { spent: (teamData.spent || 0) + auction.currentBid })
      tx.update(AUCTION_DOC, { status: 'sold', updatedAt: serverTimestamp() })
    })
    return { ok: true }
  }, [auction.currentPlayerId, auction.currentBidTeamId, auction.currentBid])

  const markUnsold = useCallback(async () => {
    if (!auction.currentPlayerId) return { ok: false }
    const playerRef = doc(db, 'players', auction.currentPlayerId)
    await runTransaction(db, async (tx) => {
      tx.update(playerRef, { status: 'unsold', soldTo: null, soldPrice: null })
      tx.update(AUCTION_DOC, { status: 'unsold', updatedAt: serverTimestamp() })
    })
    return { ok: true }
  }, [auction.currentPlayerId])

  const clearBoard = useCallback(async () => {
    await runTransaction(db, async (tx) => {
      tx.update(AUCTION_DOC, {
        currentPlayerId: null,
        currentBid: 0,
        currentBidTeamId: null,
        status: 'idle',
        updatedAt: serverTimestamp()
      })
    })
  }, [])

  const fullReset = useCallback(async () => {
    const batch = writeBatch(db)
    players.forEach((p) =>
      batch.update(doc(db, 'players', p.id), { status: 'available', soldTo: null, soldPrice: null })
    )
    teams.forEach((t) => batch.update(doc(db, 'teams', t.id), { spent: 0 }))
    batch.update(AUCTION_DOC, {
      currentPlayerId: null,
      currentBid: 0,
      currentBidTeamId: null,
      status: 'idle',
      updatedAt: serverTimestamp()
    })
    await batch.commit()
  }, [players, teams])

  return {
    teams,
    players,
    auction,
    loading,
    actions: {
      seedIfEmpty,
      nextPlayer,
      placeBid,
      setBidStep,
      resetBid,
      markSold,
      markUnsold,
      clearBoard,
      fullReset
    }
  }
}
