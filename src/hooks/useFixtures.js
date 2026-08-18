import { useEffect, useState, useCallback } from 'react'
import {
  collection,
  doc,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp
} from 'firebase/firestore'
import { db } from '../firebase'

const FIXTURES_COL = collection(db, 'fixtures')

export function useFixtures() {
  const [fixtures, setFixtures] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsub = onSnapshot(FIXTURES_COL, (snap) => {
      setFixtures(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
      setLoading(false)
    })
    return () => unsub()
  }, [])

  const createFixture = useCallback(async ({ teamA, teamB, round, date, time, venue }) => {
    await addDoc(FIXTURES_COL, {
      teamA,
      teamB,
      round: round || '',
      date: date || '',
      time: time || '',
      venue: venue || '',
      status: 'scheduled', // scheduled | live | completed
      scoreA: null,
      scoreB: null,
      scorers: [], // [{ playerId, team: 'A' | 'B', goals }]
      createdAt: serverTimestamp()
    })
  }, [])

  const updateFixture = useCallback(async (id, data) => {
    await updateDoc(doc(db, 'fixtures', id), data)
  }, [])

  const setStatus = useCallback(async (id, status) => {
    await updateDoc(doc(db, 'fixtures', id), { status })
  }, [])

  const saveResult = useCallback(async (id, { scoreA, scoreB, scorers }) => {
    await updateDoc(doc(db, 'fixtures', id), {
      scoreA: Number(scoreA),
      scoreB: Number(scoreB),
      scorers,
      status: 'completed'
    })
  }, [])

  const deleteFixture = useCallback(async (id) => {
    await deleteDoc(doc(db, 'fixtures', id))
  }, [])

  return {
    fixtures,
    loading,
    actions: { createFixture, updateFixture, setStatus, saveResult, deleteFixture }
  }
}

// Standard 3/1/0 points table, computed from completed fixtures only.
export function computeStandings(teams, fixtures) {
  const table = Object.fromEntries(
    teams.map((t) => [
      t.id,
      { team: t, played: 0, won: 0, drawn: 0, lost: 0, gf: 0, ga: 0, points: 0 }
    ])
  )

  fixtures
    .filter((f) => f.status === 'completed' && f.scoreA !== null && f.scoreB !== null)
    .forEach((f) => {
      const a = table[f.teamA]
      const b = table[f.teamB]
      if (!a || !b) return
      a.played += 1
      b.played += 1
      a.gf += f.scoreA
      a.ga += f.scoreB
      b.gf += f.scoreB
      b.ga += f.scoreA
      if (f.scoreA > f.scoreB) {
        a.won += 1
        a.points += 3
        b.lost += 1
      } else if (f.scoreA < f.scoreB) {
        b.won += 1
        b.points += 3
        a.lost += 1
      } else {
        a.drawn += 1
        b.drawn += 1
        a.points += 1
        b.points += 1
      }
    })

  return Object.values(table)
    .map((row) => ({ ...row, gd: row.gf - row.ga }))
    .sort((a, b) => b.points - a.points || b.gd - a.gd || b.gf - a.gf)
}

// Aggregates goals per player across all completed fixtures.
export function computeTopScorers(players, fixtures) {
  const goalsByPlayer = {}
  fixtures.forEach((f) => {
    ; (f.scorers || []).forEach((s) => {
      goalsByPlayer[s.playerId] = (goalsByPlayer[s.playerId] || 0) + Number(s.goals || 0)
    })
  })
  return Object.entries(goalsByPlayer)
    .map(([playerId, goals]) => ({ player: players.find((p) => p.id === playerId), goals }))
    .filter((row) => row.player)
    .sort((a, b) => b.goals - a.goals)
}
