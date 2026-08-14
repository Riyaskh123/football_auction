import { useEffect, useRef } from 'react'

export default function IntroOverlay({ show, onFinish, videoSrc, maxDuration = 6000 }) {
  const videoRef = useRef(null)

  useEffect(() => {
    if (!show) return
    // Safety net: if the video fails to load or 'ended' never fires,
    // don't leave the screen stuck on the intro forever.
    const timeout = setTimeout(onFinish, maxDuration)
    videoRef.current?.play?.().catch(() => {})
    return () => clearTimeout(timeout)
  }, [show, onFinish, maxDuration])

  if (!show) return null

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center animate-fade-up">
      <video
        ref={videoRef}
        src={videoSrc}
        autoPlay
        muted
        playsInline
        onEnded={onFinish}
        className="w-full h-full object-cover"
      />
      {/* <img src={videoSrc} className='w-full h-full object-cover' /> */}
    </div>
  )
}