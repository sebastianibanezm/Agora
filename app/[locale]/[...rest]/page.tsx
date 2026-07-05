import { notFound } from 'next/navigation'

// Catch-all for unknown routes within a locale: delegates to the custom
// 404 (app/[locale]/not-found.tsx) with a proper 404 status.
export default function CatchAllNotFound() {
  notFound()
}
