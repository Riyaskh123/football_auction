import { useEffect, useState, useCallback } from 'react'
import {
  collection,
  doc,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  runTransaction,
  serverTimestamp
} from 'firebase/firestore'
import { db } from '../firebase'

const REGISTRATIONS_COL = collection(db, 'registrations')

export function useRegistrations() {
  const [registrations, setRegistrations] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsub = onSnapshot(REGISTRATIONS_COL, (snap) => {
      setRegistrations(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
      setLoading(false)
    })
    return () => unsub()
  }, [])

  const submitRegistration = useCallback(async ({ name, phone, position, jerseyNo, photoUrl }) => {
    await addDoc(REGISTRATIONS_COL, {
      name,
      phone: phone || null,
      position,
      jerseyNo: jerseyNo ? Number(jerseyNo) : null,
      photoUrl: photoUrl || null,
      status: 'pending',
      createdAt: serverTimestamp()
    })
  }, [])

  // Edit a pending registration's details before approving it.
  const updateRegistration = useCallback(async (id, patch) => {
    await updateDoc(doc(db, 'registrations', id), patch)
  }, [])

  // Remove a registration entirely (e.g. duplicate or no-show) — does not
  // touch the players collection, only relevant before it's been approved.
  const deleteRegistration = useCallback(async (id) => {
    await deleteDoc(doc(db, 'registrations', id))
  }, [])

  const approveRegistration = useCallback(async (registration, basePrice) => {
    const regRef = doc(db, 'registrations', registration.id)
    const playerRef = doc(collection(db, 'players'))
    await runTransaction(db, async (tx) => {
      tx.set(playerRef, {
        name: registration.name,
        jerseyNo: registration.jerseyNo || null,
        position: registration.position,
        basePrice: Number(basePrice),
        photoUrl: registration.photoUrl || 'https://api.dicebear.com/7.x/personas/svg?seed=' + registration.id,
        status: 'available',
        soldTo: null,
        soldPrice: null
      })
      tx.update(regRef, { status: 'approved', playerId: playerRef.id })
    })
  }, [])

  const rejectRegistration = useCallback(async (registrationId) => {
    const playerId = doc(db, 'registrations', registrationId).playerId
    if(playerId){
      await deleteDoc(doc(db, 'players', playerId))
    }
    await updateDoc(doc(db, 'registrations', registrationId), { status: 'rejected' })
  }, [])

  return {
    registrations,
    loading,
    actions: {
      submitRegistration,
      updateRegistration,
      deleteRegistration,
      approveRegistration,
      rejectRegistration
    }
  }
}