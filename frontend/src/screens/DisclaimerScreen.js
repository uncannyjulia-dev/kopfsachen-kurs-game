// screens/DisclaimerScreen.js
// Hilfebedürftigkeitsabfrage – stellt sicher, dass User in Krise Hilfe finden.

import { saveSettings } from '../store.js'

export function DisclaimerScreen() {
  const el = document.createElement('div')
  el.className = 'screen disclaimer-screen'

  el.innerHTML = `
    <div class="disclaimer-content">
      <h1 class="disclaimer-title">Bevor es losgeht</h1>
      <div class="disclaimer-card">
        <p>
          Dieses Angebot ersetzt keine Therapie.
        </p>
        <p>
          Wenn du dich gerade in einer akuten Krise befindest und
          dich sehr stark überfordert fühlst, findest du hier Hilfe.
        </p>
      </div>
      <div class="disclaimer-actions">
        <button class="btn-secondary disclaimer-help" type="button">
          Wo finde ich professionelle Hilfe?
        </button>
        <button class="btn-primary disclaimer-start" type="button">
          Ich möchte starten
        </button>
      </div>
    </div>
  `

  el.querySelector('.disclaimer-help').addEventListener('click', () => {
    window.location.hash = '#/help'
  })

  el.querySelector('.disclaimer-start').addEventListener('click', async () => {
    await saveSettings({ onboardingDone: true })
    window.location.hash = '#/chapters'
  })

  return el
}
