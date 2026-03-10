// screens/ToolboxScreen.js
// Übungs-Bibliothek, gruppiert nach Kategorie.

import { getExercises } from '../api.js'

const DEMO_EXERCISES = [
  { id: 1, title: 'Atemübung: 4-7-8', category: 'Atemübung', duration: '5 Min' },
  { id: 2, title: 'Body Scan', category: 'Achtsamkeit', duration: '10 Min' },
  { id: 3, title: 'Gedanken beobachten', category: 'Achtsamkeit', duration: '7 Min' },
  { id: 4, title: 'Muskelentspannung', category: 'Entspannung', duration: '8 Min' },
  { id: 5, title: 'Dankbarkeits-Check', category: 'Selbstwert', duration: '5 Min' },
  { id: 6, title: 'Bauchatmung', category: 'Atemübung', duration: '4 Min' },
]

export function ToolboxScreen() {
  const el = document.createElement('div')
  el.className = 'screen toolbox-screen'

  el.innerHTML = `
    <div class="topbar">
      <button class="btn-menu toolbox-back" type="button">&#8592;</button>
      <h1 class="toolbox-heading">Übungsschachtel</h1>
      <div style="width:44px"></div>
    </div>
    <div class="toolbox-list"></div>
    <div class="toolbox-loading">Lade Übungen …</div>
  `

  const listEl = el.querySelector('.toolbox-list')
  const loadingEl = el.querySelector('.toolbox-loading')

  el.querySelector('.toolbox-back').addEventListener('click', () => {
    history.back()
  })

  async function init() {
    let exercises = null
    try {
      exercises = await getExercises()
    } catch (e) {
      console.warn('Strapi nicht erreichbar, nutze Demo-Daten:', e.message)
    }

    exercises = exercises || DEMO_EXERCISES
    loadingEl.style.display = 'none'

    // Group by category
    const groups = {}
    exercises.forEach(ex => {
      const cat = ex.category || 'Sonstige'
      if (!groups[cat]) groups[cat] = []
      groups[cat].push(ex)
    })

    Object.entries(groups).forEach(([category, items]) => {
      const section = document.createElement('div')
      section.className = 'toolbox-group'
      section.innerHTML = `<h3 class="toolbox-group-title">${category}</h3>`

      items.forEach(ex => {
        const card = document.createElement('button')
        card.className = 'toolbox-card'
        card.innerHTML = `
          <span class="toolbox-card-title">${ex.title}</span>
          <span class="toolbox-card-duration">${ex.duration || ''}</span>
        `
        card.addEventListener('click', () => {
          window.location.hash = `#/exercise/${ex.id}`
        })
        section.appendChild(card)
      })

      listEl.appendChild(section)
    })
  }

  init()
  return el
}
