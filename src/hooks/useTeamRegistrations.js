import { useEffect, useState, useCallback } from 'react'
import {
  collection,
  doc,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  runTransaction,
  serverTimestamp,
  getDoc
} from 'firebase/firestore'
import { db } from '../firebase'

const TEAM_REGISTRATIONS_COL = collection(db, 'teamRegistrations')

export function useTeamRegistrations() {
  const [teamRegistrations, setTeamRegistrations] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsub = onSnapshot(TEAM_REGISTRATIONS_COL, (snap) => {
      setTeamRegistrations(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
      setLoading(false)
    })
    return () => unsub()
  }, [])

  const submitTeamRegistration = useCallback(async ({ name, shortName, ownerName, phone, logoUrl }) => {
    await addDoc(TEAM_REGISTRATIONS_COL, {
      name,
      shortName: shortName.toUpperCase(),
      ownerName: ownerName || null,
      phone: phone || null,
      logoUrl: logoUrl || null,
      status: 'pending',
      createdAt: serverTimestamp()
    })
  }, [])

  // Edit a pending team's details before approving it.
  const updateTeamRegistration = useCallback(async (id, patch) => {
    const cleaned = { ...patch }
    if (cleaned.shortName) cleaned.shortName = cleaned.shortName.toUpperCase()
    await updateDoc(doc(db, 'teamRegistrations', id), cleaned)
  }, [])

  // Remove a team registration entirely (e.g. duplicate submission).
  const deleteTeamRegistration = useCallback(async (id) => {
    const registration = await getDoc(doc(db, 'teamRegistrations', id))
    await deleteDoc(doc(db, 'teams', registration.data().teamId))
    await deleteDoc(doc(db, 'teamRegistrations', id))
  }, [])

  const approveTeamRegistration = useCallback(async (registration, budget) => {
    const regRef = doc(db, 'teamRegistrations', registration.id)
    const teamRef = doc(collection(db, 'teams'))
    await runTransaction(db, async (tx) => {
      tx.set(teamRef, {
        name: registration.name,
        shortName: registration.shortName,
        logoUrl:
          registration.logoUrl ||
          `https://ui-avatars.com/api/?name=${encodeURIComponent(registration.shortName)}&background=1E3A2C&color=fff`,
        budget: Number(budget),
        spent: 0,
        color: '1E3A2C'
      })
      tx.update(regRef, { status: 'approved', teamId: teamRef.id })
    })
  }, [])

  const rejectTeamRegistration = useCallback(async (registrationId) => {
    await updateDoc(doc(db, 'teamRegistrations', registrationId), { status: 'rejected' })
  }, [])

  return {
    teamRegistrations,
    loading,
    actions: {
      submitTeamRegistration,
      updateTeamRegistration,
      deleteTeamRegistration,
      approveTeamRegistration,
      rejectTeamRegistration
    }
  }
}