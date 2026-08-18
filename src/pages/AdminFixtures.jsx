import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuctionData } from '../hooks/useAuctionData'
import { useFixtures } from '../hooks/useFixtures'

function ResultEditor({ fixture, teamA, teamB, players, onSave, onCancel }) {
  if (!localStorage.getItem('islogged')) {
    navigate('/')
  }
  
  const [scoreA, setScoreA] = useState(fixture.scoreA ?? 0)
  const [scoreB, setScoreB] = useState(fixture.scoreB ?? 0)
  const [scorers, setScorers] = useState(fixture.scorers || [])

  const squadA = players.filter((p) => p.soldTo === teamA?.id)
  const squadB = players.filter((p) => p.soldTo === teamB?.id)

  const addScorer = (side) => {
    const squad = side === 'A' ? squadA : squadB
    if (squad.length === 0) return
    setScorers((prev) => [...prev, { playerId: squad[0].id, team: side, goals: 1 }])
  }
  const updateScorer = (idx, patch) => {
    setScorers((prev) => prev.map((s, i) => (i === idx ? { ...s, ...patch } : s)))
  }
  const removeScorer = (idx) => {
    setScorers((prev) => prev.filter((_, i) => i !== idx))
  }

  return (
    <div className="mt-3 p-3 rounded-lg bg-pitch-950/60 border border-pitch-line flex flex-col gap-4">
      <div className="flex items-center justify-center gap-4">
        <span className="text-sm w-28 text-right truncate">{teamA?.name}</span>
        <input
          type="number"
          value={scoreA}
          onChange={(e) => setScoreA(e.target.value)}
          className="w-16 px-2 py-1.5 rounded-lg bg-pitch-900 border border-pitch-line text-center font-mono"
        />
        <span className="text-floodlight/30">–</span>
        <input
          type="number"
          value={scoreB}
          onChange={(e) => setScoreB(e.target.value)}
          className="w-16 px-2 py-1.5 rounded-lg bg-pitch-900 border border-pitch-line text-center font-mono"
        />
        <span className="text-sm w-28 truncate">{teamB?.name}</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {[
          { side: 'A', team: teamA, squad: squadA },
          { side: 'B', team: teamB, squad: squadB }
        ].map(({ side, team, squad }) => (
          <div key={side} className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-floodlight/50">{team?.name} scorers</span>
              <button
                onClick={() => addScorer(side)}
                disabled={squad.length === 0}
                className="text-xs text-gold disabled:opacity-30"
              >
                + Add scorer
              </button>
            </div>
            {scorers
              .map((s, idx) => ({ ...s, idx }))
              .filter((s) => s.team === side)
              .map((s) => (
                <div key={s.idx} className="flex items-center gap-2">
                  <select
                    value={s.playerId}
                    onChange={(e) => updateScorer(s.idx, { playerId: e.target.value })}
                    className="flex-1 px-2 py-1.5 rounded-lg bg-pitch-900 border border-pitch-line text-xs"
                  >
                    {squad.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                  <input
                    type="number"
                    min="1"
                    value={s.goals}
                    onChange={(e) => updateScorer(s.idx, { goals: e.target.value })}
                    className="w-14 px-2 py-1.5 rounded-lg bg-pitch-900 border border-pitch-line text-xs text-center"
                  />
                  <button onClick={() => removeScorer(s.idx)} className="text-live text-xs">
                    ✕
                  </button>
                </div>
              ))}
          </div>
        ))}
      </div>

      <div className="flex justify-end gap-2">
        <button onClick={onCancel} className="px-4 py-2 rounded-lg border border-pitch-line text-sm">
          Cancel
        </button>
        <button
          onClick={() => onSave({ scoreA, scoreB, scorers })}
          className="px-4 py-2 rounded-lg bg-gold text-pitch-950 text-sm font-semibold hover:bg-gold-light transition-colors"
        >
          Save result
        </button>
      </div>
    </div>
  )
}

export default function AdminFixtures() {
  const { teams, players, loading: dataLoading } = useAuctionData()
  const { fixtures, loading: fixturesLoading, actions } = useFixtures()
  const [teamA, setTeamA] = useState('')
  const [teamB, setTeamB] = useState('')
  const [round, setRound] = useState('')
  const [date, setDate] = useState('')
  const [time, setTime] = useState('')
  const [venue, setVenue] = useState('')
  const [editingId, setEditingId] = useState(null)

  const loading = dataLoading || fixturesLoading
  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-floodlight/40">Connecting…</div>
  }

  const teamById = Object.fromEntries(teams.map((t) => [t.id, t]))

  const handleCreate = async () => {
    if (!teamA || !teamB || teamA === teamB) return
    await actions.createFixture({ teamA, teamB, round, date, time, venue })
    setTeamA('')
    setTeamB('')
    setRound('')
    setDate('')
    setTime('')
    setVenue('')
  }

  const sorted = [...fixtures].sort((a, b) => (a.date || '').localeCompare(b.date || ''))

  return (
    <div className="min-h-screen px-4 md:px-8 py-6 max-w-4xl mx-auto flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="tracking-[0.3em] text-gold text-xs font-semibold">AUCTIONEER</p>
          <h1 className="font-display text-2xl md:text-3xl tracking-wide">FIXTURES SETUP</h1>
        </div>
        <div className="flex gap-3">
          <Link
            to="/control"
            className="px-4 py-2 rounded-lg border border-pitch-line text-sm hover:border-gold/50 transition-colors"
          >
            Back to control
          </Link>
          <Link
            to="/fixtures"
            className="px-4 py-2 rounded-lg bg-gold text-pitch-950 text-sm font-semibold hover:bg-gold-light transition-colors"
          >
            View public page
          </Link>
        </div>
      </div>

      {/* create fixture */}
      <div className="rounded-2xl border border-pitch-line bg-pitch-800/50 p-5 flex flex-col gap-3">
        <p className="text-xs tracking-widest text-floodlight/40">NEW FIXTURE</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <select
            value={teamA}
            onChange={(e) => setTeamA(e.target.value)}
            className="px-3 py-2.5 rounded-lg bg-pitch-950 border border-pitch-line text-sm"
          >
            <option value="">Team A</option>
            {teams.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
          <select
            value={teamB}
            onChange={(e) => setTeamB(e.target.value)}
            className="px-3 py-2.5 rounded-lg bg-pitch-950 border border-pitch-line text-sm"
          >
            <option value="">Team B</option>
            {teams
              .filter((t) => t.id !== teamA)
              .map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
          </select>
          <input
            value={round}
            onChange={(e) => setRound(e.target.value)}
            placeholder="Round / matchday (optional)"
            className="px-3 py-2.5 rounded-lg bg-pitch-950 border border-pitch-line text-sm"
          />
          <input
            value={venue}
            onChange={(e) => setVenue(e.target.value)}
            placeholder="Venue (optional)"
            className="px-3 py-2.5 rounded-lg bg-pitch-950 border border-pitch-line text-sm"
          />
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="px-3 py-2.5 rounded-lg bg-pitch-950 border border-pitch-line text-sm"
          />
          <input
            type="time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            className="px-3 py-2.5 rounded-lg bg-pitch-950 border border-pitch-line text-sm"
          />
        </div>
        <button
          onClick={handleCreate}
          disabled={!teamA || !teamB || teamA === teamB}
          className="self-start px-5 py-2.5 rounded-xl bg-gold text-pitch-950 text-sm font-semibold disabled:opacity-40 hover:bg-gold-light transition-colors"
        >
          Add fixture
        </button>
      </div>

      {/* fixture list */}
      <div className="flex flex-col gap-3">
        {sorted.length === 0 && (
          <p className="text-floodlight/30 text-sm text-center py-8">No fixtures yet. Add one above.</p>
        )}
        {sorted.map((f) => {
          const a = teamById[f.teamA]
          const b = teamById[f.teamB]
          return (
            <div key={f.id} className="rounded-xl border border-pitch-line bg-pitch-800/40 p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  {a && <img src={a.logoUrl} alt={a.name} className="w-8 h-8 rounded-full shrink-0" />}
                  <span className="text-sm font-semibold truncate">{a?.name ?? '—'}</span>
                  <span className="font-mono text-gold tabular text-sm">
                    {f.status === 'completed' ? `${f.scoreA} – ${f.scoreB}` : 'vs'}
                  </span>
                  <span className="text-sm font-semibold truncate">{b?.name ?? '—'}</span>
                  {b && <img src={b.logoUrl} alt={b.name} className="w-8 h-8 rounded-full shrink-0" />}
                </div>
                <div className="flex items-center gap-2 text-xs text-floodlight/40">
                  {f.round && <span>{f.round}</span>}
                  {f.date && <span>{f.date}</span>}
                  {f.time && <span>{f.time}</span>}
                  <span
                    className={`px-2 py-0.5 rounded-full border text-[10px] uppercase tracking-wide ${
                      f.status === 'completed'
                        ? 'border-gold/40 text-gold'
                        : f.status === 'live'
                        ? 'border-live/40 text-live'
                        : 'border-pitch-line text-floodlight/40'
                    }`}
                  >
                    {f.status}
                  </span>
                </div>
              </div>

              <div className="flex flex-wrap gap-3 mt-3">
                {f.status !== 'live' && f.status !== 'completed' && (
                  <button
                    onClick={() => actions.setStatus(f.id, 'live')}
                    className="text-xs px-3 py-1.5 rounded-lg border border-live/50 text-live"
                  >
                    Mark live
                  </button>
                )}
                <button
                  onClick={() => setEditingId(editingId === f.id ? null : f.id)}
                  className="text-xs px-3 py-1.5 rounded-lg border border-pitch-line hover:border-gold/50 transition-colors"
                >
                  {f.status === 'completed' ? 'Edit result' : 'Enter result'}
                </button>
                <button
                  onClick={() => actions.deleteFixture(f.id)}
                  className="text-xs px-3 py-1.5 rounded-lg border border-live/40 text-live/80"
                >
                  Delete
                </button>
              </div>

              {editingId === f.id && (
                <ResultEditor
                  fixture={f}
                  teamA={a}
                  teamB={b}
                  players={players}
                  onCancel={() => setEditingId(null)}
                  onSave={async (result) => {
                    await actions.saveResult(f.id, result)
                    setEditingId(null)
                  }}
                />
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
