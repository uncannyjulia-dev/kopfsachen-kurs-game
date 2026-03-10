// screens/SplashScreen.js
// Logo-Animation, dann Weiterleitung zu Home oder Chapters.

import { getProgress } from '../store.js'

export function SplashScreen() {
  const el = document.createElement('div')
  el.className = 'screen splash-screen'

  el.innerHTML = `
    <div class="splash-content">
      <div class="splash-logo">
        <span class="splash-title">Kopfsachen</span>
        <span class="splash-subtitle">Dein Kurs für mentale Stärke</span>
      </div>
    </div>
  `

  // Nach 2s weiterleiten
  setTimeout(async () => {
    try {
      const progress = await getProgress()
      if (progress.completedChapters.length > 0 || progress.currentNodeId > 0) {
        window.location.hash = '#/chapters'
      } else {
        window.location.hash = '#/home'
      }
    } catch {
      window.location.hash = '#/home'
    }
  }, 2000)

  return el
}
