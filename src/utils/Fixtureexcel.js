import * as XLSX from 'xlsx'

// Downloads a ready-to-fill .xlsx: a "Fixtures" sheet with the right columns
// (pre-filled with real team names as an example if any teams exist yet),
// and a "Team Names" sheet listing every valid name to copy from exactly.
export function downloadFixtureTemplate(teams) {
  const sampleRows =
    teams.length >= 2
      ? [
          {
            'Team A': teams[0].name,
            'Team B': teams[1].name,
            Round: 'Matchday 1',
            Date: '2026-12-01',
            Time: '16:00',
            Venue: ''
          },
          ...(teams.length >= 4
            ? [
                {
                  'Team A': teams[2].name,
                  'Team B': teams[3].name,
                  Round: 'Matchday 1',
                  Date: '2026-12-01',
                  Time: '18:00',
                  Venue: ''
                }
              ]
            : [])
        ]
      : [
          {
            'Team A': 'Team name exactly as registered',
            'Team B': 'Another registered team name',
            Round: 'Matchday 1',
            Date: '2026-12-01',
            Time: '16:00',
            Venue: 'Optional'
          }
        ]

  const fixturesSheet = XLSX.utils.json_to_sheet(sampleRows)
  fixturesSheet['!cols'] = [{ wch: 24 }, { wch: 24 }, { wch: 16 }, { wch: 12 }, { wch: 8 }, { wch: 18 }]

  const teamNameRows = teams.length
    ? teams.map((t) => ({ 'Registered team names (copy exactly)': t.name }))
    : [{ 'Registered team names (copy exactly)': '(no teams approved yet)' }]
  const teamsSheet = XLSX.utils.json_to_sheet(teamNameRows)
  teamsSheet['!cols'] = [{ wch: 34 }]

  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, fixturesSheet, 'Fixtures')
  XLSX.utils.book_append_sheet(wb, teamsSheet, 'Team Names')
  XLSX.writeFile(wb, 'fixture-template.xlsx')
}

function excelDateToString(value) {
  if (!value) return ''
  if (typeof value === 'number') {
    // Excel serial date (happens when the cell is formatted as a date,
    // even if the admin typed something that looks like plain text)
    const parsed = XLSX.SSF.parse_date_code(value)
    if (!parsed) return ''
    const mm = String(parsed.m).padStart(2, '0')
    const dd = String(parsed.d).padStart(2, '0')
    return `${parsed.y}-${mm}-${dd}`
  }
  return String(value).trim()
}

function excelTimetoString(value) {
  if (!value) return ''
  if (typeof value === 'number') {
    // Excel serial time (happens when the cell is formatted as a time,
    // even if the admin typed something that looks like plain text)
    const parsed = XLSX.SSF.parse_date_code(value)
    if (!parsed) return ''
    const hh = String(parsed.H).padStart(2, '0')
    const mm = String(parsed.M).padStart(2, '0')
    return `${hh}:${mm}`
  }
  return String(value).trim()
}
// Reads an uploaded .xlsx File, matches each row's Team A / Team B against
// the real team list by name (case-insensitive, also checks shortName),
// and returns { fixtures, errors } — errors are per-row, human-readable,
// so the admin can fix and re-upload instead of guessing what failed.
export function parseFixtureExcel(file, teams) {
  const byName = new Map(teams.map((t) => [t.name.trim().toLowerCase(), t]))
  const byShort = new Map(
    teams.filter((t) => t.shortName).map((t) => [t.shortName.trim().toLowerCase(), t])
  )
  const resolveTeam = (raw) => {
    const key = String(raw || '').trim().toLowerCase()
    if (!key) return null
    return byName.get(key) || byShort.get(key) || null
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result)
        const wb = XLSX.read(data, { type: 'array' })
        const sheet = wb.Sheets[wb.SheetNames[0]]
        const rows = XLSX.utils.sheet_to_json(sheet, { defval: '' })

        const fixtures = []
        const errors = []

        rows.forEach((row, i) => {
          const rowNum = i + 2 // +1 for header, +1 for 1-indexing
          const aRaw = row['Team A']
          const bRaw = row['Team B']
          if (!aRaw || !bRaw) {
            errors.push(`Row ${rowNum}: missing Team A or Team B`)
            return
          }
          const teamA = resolveTeam(aRaw)
          const teamB = resolveTeam(bRaw)
          if (!teamA) {
            errors.push(`Row ${rowNum}: "${aRaw}" doesn't match any registered team`)
            return
          }
          if (!teamB) {
            errors.push(`Row ${rowNum}: "${bRaw}" doesn't match any registered team`)
            return
          }
          if (teamA.id === teamB.id) {
            errors.push(`Row ${rowNum}: Team A and Team B can't be the same team`)
            return
          }
          fixtures.push({
            teamA: teamA.id,
            teamB: teamB.id,
            round: String(row['Round'] || '').trim(),
            date: excelDateToString(row['Date']),
            time: excelTimetoString(row['Time']),
            venue: String(row['Venue'] || '').trim()
          })
        })

        resolve({ fixtures, errors })
      } catch (err) {
        reject(err)
      }
    }
    reader.onerror = () => reject(new Error('Could not read the file'))
    reader.readAsArrayBuffer(file)
  })
}