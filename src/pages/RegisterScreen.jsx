import { useState } from 'react'
import { useRegistrations } from '../hooks/useRegistrations'
import { uploadToCloudinary } from '../utils/cloudinary'

const positions = ['GK', 'DEF', 'MID', 'FWD']

export default function RegisterScreen() {
  const { actions } = useRegistrations()
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [position, setPosition] = useState('MID')
  const [jerseyNo, setJerseyNo] = useState('')
  const [photoFile, setPhotoFile] = useState(null)
  const [photoPreview, setPhotoPreview] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)

  const handlePhotoChange = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setPhotoFile(file)
    setPhotoPreview(URL.createObjectURL(file))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (!name.trim()) {
      setError('Please enter your name.')
      return
    }
    setSubmitting(true)
    try {
      let photoUrl = null
      if (photoFile) {
        setUploading(true)
        photoUrl = await uploadToCloudinary(photoFile)
        setUploading(false)
      }
      await actions.submitRegistration({ name, phone, position, jerseyNo, photoUrl })
      setDone(true)
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.')
    } finally {
      setSubmitting(false)
      setUploading(false)
    }
  }

  if (done) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 px-6 text-center">
        <div className="w-16 h-16 rounded-full bg-gold/10 border border-gold/50 flex items-center justify-center text-gold text-3xl">
          ✓
        </div>
        <h1 className="font-display text-3xl tracking-wide">YOU'RE REGISTERED</h1>
        <p className="text-floodlight/50 max-w-sm">
          Your details have been submitted for review. You'll appear in the auction pool once
          the organizers approve your registration.
        </p>
        <button
          onClick={() => {
            setDone(false)
            setName('')
            setPhone('')
            setPosition('MID')
            setJerseyNo('')
            setPhotoFile(null)
            setPhotoPreview(null)
          }}
          className="text-sm text-gold underline underline-offset-4"
        >
          Register another player
        </button>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-10">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md rounded-2xl border border-pitch-line bg-pitch-800/60 p-6 flex flex-col gap-5"
      >
        <div className="text-center mb-1">
          <p className="tracking-[0.3em] text-gold text-xs font-semibold mb-2">MATCH DAY</p>
          <h1 className="font-display text-3xl tracking-wide">PLAYER REGISTRATION</h1>
          <p className="text-floodlight/50 text-sm mt-2">
            Fill in your details to join the auction pool.
          </p>
        </div>

        {/* photo */}
        <div className="flex flex-col items-center gap-3">
          <label
            htmlFor="photo"
            className="w-28 h-28 rounded-full bg-pitch-950 border border-dashed border-pitch-line flex items-center justify-center overflow-hidden cursor-pointer hover:border-gold/50 transition-colors"
          >
            {photoPreview ? (
              <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
            ) : (
              <span className="text-floodlight/30 text-xs text-center px-2">Add photo</span>
            )}
          </label>
          <input id="photo" type="file" accept="image/*" onChange={handlePhotoChange} className="hidden" />
          {uploading && <span className="text-xs text-gold">Uploading photo…</span>}
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs text-floodlight/50">Full name *</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Mohammed Al Amri"
            className="px-3 py-2.5 rounded-lg bg-pitch-950 border border-pitch-line outline-none focus:border-gold/60"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs text-floodlight/50">Phone number</label>
          <input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+971 5xx xxx xxx"
            className="px-3 py-2.5 rounded-lg bg-pitch-950 border border-pitch-line outline-none focus:border-gold/60"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-floodlight/50">Position</label>
            <select
              value={position}
              onChange={(e) => setPosition(e.target.value)}
              className="px-3 py-2.5 rounded-lg bg-pitch-950 border border-pitch-line outline-none focus:border-gold/60"
            >
              {positions.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-floodlight/50">Preferred jersey #</label>
            <input
              type="number"
              value={jerseyNo}
              onChange={(e) => setJerseyNo(e.target.value)}
              placeholder="Optional"
              className="px-3 py-2.5 rounded-lg bg-pitch-950 border border-pitch-line outline-none focus:border-gold/60"
            />
          </div>
        </div>

        {error && <p className="text-sm text-live">{error}</p>}

        <button
          type="submit"
          disabled={submitting}
          className="mt-2 px-5 py-3 rounded-xl bg-gold text-pitch-950 font-semibold disabled:opacity-40 hover:bg-gold-light transition-colors"
        >
          {submitting ? 'Submitting…' : 'Submit registration'}
        </button>
        <p className="text-xs text-floodlight/30 text-center">
          Base price is set by the organizers after your registration is reviewed.
        </p>
      </form>
    </div>
  )
}
