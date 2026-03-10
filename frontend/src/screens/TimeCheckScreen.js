// screens/TimeCheckScreen.js
// Fragt ob der User 45 Minuten Zeit hat. Ab Kapitel 2: Schachtel-Verweis.

import { getProgress } from '../store.js'

export function TimeCheckScreen(path) {
  const slug = path?.replace('/timecheck/', '') || ''
  const el = document.createElement('div')
  el.className = 'screen timecheck-screen'

  el.innerHTML = `
    <div class="timecheck-content">
      <h1 class="timecheck-title">Bevor du beginnst</h1>
      <p class="timecheck-text">
        Hast du gerade <strong>45 Minuten</strong> Zeit, um das Kapitel
        in Ruhe durchzugehen?
      </p>
      <div class="timecheck-actions">
        <button class="btn-primary timecheck-yes" type="button">Ja klar. Lass uns loslegen!</button>
        <button class="btn-secondary timecheck-no" type="button">Jetzt gerade nicht</button>
      </div>
      <div class="timecheck-later" style="display:none">
        <p class="timecheck-later-text">
          Dann plane dir am besten jetzt einen Zeitpunkt in den nächsten
          3 Tagen ein, zu dem du 45 Minuten Zeit hast.
        </p>
        <div class="timecheck-later-actions">
          <button class="btn-primary timecheck-ok" type="button">Okay</button>
          <button class="btn-secondary timecheck-toolbox" type="button" style="display:none">
            Übung aus der Schachtel machen
          </button>
        </div>
      </div>
    </div>
  `

  const actionsEl = el.querySelector('.timecheck-actions')
  const laterEl = el.querySelector('.timecheck-later')
  const toolboxBtn = el.querySelector('.timecheck-toolbox')

  el.querySelector('.timecheck-yes').addEventListener('click', () => {
    window.location.hash = `#/novel/${slug}`
  })

  el.querySelector('.timecheck-no').addEventListener('click', async () => {
    actionsEl.style.display = 'none'
    laterEl.style.display = ''

    // Ab Kapitel 2: Schachtel-Option anbieten
    const progress = await getProgress()
    if (progress.completedChapters && progress.completedChapters.length >= 1) {
      toolboxBtn.style.display = ''
    }
  })

  el.querySelector('.timecheck-ok').addEventListener('click', () => {
    window.location.hash = '#/chapters'
  })

  toolboxBtn.addEventListener('click', () => {
    window.location.hash = '#/toolbox'
  })

  return el
}
