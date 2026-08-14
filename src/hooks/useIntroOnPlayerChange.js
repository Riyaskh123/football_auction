import { useEffect, useRef, useState } from 'react'

// Fires `showIntro = true` only when currentPlayerId actually changes to a
// new, non-null value — so it plays on "Call next player" but not when
// the same player is just marked sold/unsold, and not on first page load.
export function useIntroOnPlayerChange(currentPlayerId) {
  const [showIntro, setShowIntro] = useState(false)
  const prevId = useRef(currentPlayerId)

  useEffect(() => {
    if (currentPlayerId !== prevId.current) {
      prevId.current = currentPlayerId
      if (currentPlayerId) setShowIntro(true)
    }
  }, [currentPlayerId])

  return { showIntro, finishIntro: () => setShowIntro(false) }
}