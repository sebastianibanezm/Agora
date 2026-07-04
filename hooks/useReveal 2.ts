import { useEffect, useRef } from 'react'

/**
 * Sets data-visible="true" on the element when it enters the viewport,
 * letting the CSS stagger system (globals.css) animate children.
 * Unlike useFadeIn it applies no inline styles, so content stays visible
 * without JS and prefers-reduced-motion is fully respected by the CSS.
 */
export function useReveal<T extends HTMLElement = HTMLElement>(threshold = 0.12) {
  const ref = useRef<T>(null)

  useEffect(() => {
    const el = ref.current
    if (!el || typeof IntersectionObserver === 'undefined') return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          el.dataset.visible = 'true'
          observer.disconnect()
        }
      },
      { threshold }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [threshold])

  return ref
}
