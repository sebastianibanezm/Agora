import { useEffect, useState } from 'react'

export function useCountUp(target: number, duration = 1200, enabled = false) {
  const [count, setCount] = useState(0)

  useEffect(() => {
    if (!enabled) return
    let raf: number
    let startTime: number | null = null
    const easeOut = (t: number) => 1 - Math.pow(1 - t, 3)

    function tick(now: number) {
      if (startTime === null) startTime = now
      const progress = Math.min((now - startTime) / duration, 1)
      setCount(Math.round(easeOut(progress) * target))
      if (progress < 1) raf = requestAnimationFrame(tick)
    }

    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [target, duration, enabled])

  return count
}
