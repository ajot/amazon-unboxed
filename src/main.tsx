import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

// Plausible analytics - only if configured via env var
const plausibleSrc = import.meta.env.VITE_PLAUSIBLE_SRC
if (plausibleSrc) {
  // Load the Plausible script
  const script = document.createElement('script')
  script.async = true
  script.src = plausibleSrc
  document.head.appendChild(script)

  // Initialize Plausible
  type PlausibleFn = {
    (...args: unknown[]): void
    q?: unknown[]
    init?: (i?: unknown) => void
    o?: unknown
  }
  const w = window as unknown as { plausible: PlausibleFn }
  w.plausible = w.plausible || function (...args: unknown[]) {
    (w.plausible.q = w.plausible.q || []).push(args)
  }
  w.plausible.init = w.plausible.init || function (i?: unknown) {
    w.plausible.o = i || {}
  }
  w.plausible.init()
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
