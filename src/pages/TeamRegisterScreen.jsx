import { useState } from 'react'
import { useTeamRegistrations } from '../hooks/useTeamRegistrations'
import { uploadToCloudinary } from '../utils/cloudinary'
import Header from '../components/header'

export default function TeamRegisterScreen() {
  const { actions } = useTeamRegistrations()
  const [name, setName] = useState('')
  const [shortName, setShortName] = useState('')
  const [ownerName, setOwnerName] = useState('')
  const [phone, setPhone] = useState('')
  const [logoFile, setLogoFile] = useState(null)
  const [logoPreview, setLogoPreview] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)

  const handleLogoChange = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setLogoFile(file)
    setLogoPreview(URL.createObjectURL(file))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (!name.trim()) {
      setError('Please enter the team name.')
      return
    }
    if (!shortName.trim()) {
      setError('Please enter a short code (e.g. DFC).')
      return
    }
    setSubmitting(true)
    try {
      let logoUrl = null
      if (logoFile) {
        setUploading(true)
        logoUrl = await uploadToCloudinary(logoFile)
        setUploading(false)
      }
      await actions.submitTeamRegistration({ name, shortName, ownerName, phone, logoUrl })
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
        <h1 className="font-display text-3xl tracking-wide">TEAM SUBMITTED</h1>
        <p className="text-floodlight/50 max-w-sm">
          Your team has been submitted for review. Once the organizers approve it and set your
          budget, you'll be ready to bid on auction day.
        </p>
        <button
          onClick={() => {
            setDone(false)
            setName('')
            setShortName('')
            setOwnerName('')
            setPhone('')
            setLogoFile(null)
            setLogoPreview(null)
          }}
          className="text-sm text-gold underline underline-offset-4"
        >
          Register another team
        </button>
      </div>
    )
  }

  return (
    <div className="container">
      <Header />
      <div className="min-h-screen flex items-center justify-center px-4 py-10">
        <form
          onSubmit={handleSubmit}
          className="w-full max-w-md rounded-2xl border border-pitch-line bg-pitch-800/60 p-6 flex flex-col gap-5"
        >
          <div className="text-center mb-1">
            <p className="tracking-[0.3em] text-gold text-xs font-semibold mb-2"></p>
            <h1 className="font-display text-3xl tracking-wide">TEAM REGISTRATION</h1>
            <p className="text-floodlight/50 text-sm mt-2">
              Register your team to take part in the auction.
            </p>
          </div>

          {/* logo */}
          <div className="flex flex-col items-center gap-3">
            <label
              htmlFor="logo"
              className="w-28 h-28 rounded-full bg-pitch-950 border border-dashed border-pitch-line flex items-center justify-center overflow-hidden cursor-pointer hover:border-gold/50 transition-colors"
            >
              {logoPreview ? (
                <img src={logoPreview} alt="Preview" className="w-full h-full object-cover" />
              ) : (
                <span className="text-floodlight/30 text-xs text-center px-2">Add logo</span>
              )}
            </label>
            <input id="logo" type="file" accept="image/*" onChange={handleLogoChange} className="hidden" />
            {uploading && <span className="text-xs text-gold">Uploading logo…</span>}
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-floodlight/50">Team name *</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Desert Falcons"
              className="px-3 py-2.5 rounded-lg bg-pitch-950 border border-pitch-line outline-none focus:border-gold/60"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-floodlight/50">Short code * (shown on screen)</label>
            <input
              value={shortName}
              onChange={(e) => setShortName(e.target.value.slice(0, 4))}
              placeholder="e.g. DFC"
              maxLength={4}
              className="px-3 py-2.5 rounded-lg bg-pitch-950 border border-pitch-line outline-none focus:border-gold/60 uppercase"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-floodlight/50">Owner / captain name</label>
            <input
              value={ownerName}
              onChange={(e) => setOwnerName(e.target.value)}
              placeholder="Who's bidding for this team"
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

          {error && <p className="text-sm text-live">{error}</p>}

          <button
            type="submit"
            disabled={submitting}
            className="mt-2 px-5 py-3 rounded-xl bg-gold text-pitch-950 font-semibold disabled:opacity-40 hover:bg-gold-light transition-colors"
          >
            {submitting ? 'Submitting…' : 'Submit team'}
          </button>
          <p className="text-xs text-floodlight/30 text-center">
            Auction budget is set by the organizers after your team is reviewed.
          </p>
        </form>
      </div>
    </div>
  )
}
