// screens/ChaptersScreen.js
// Kapitelauswahl mit Fortschrittsanzeige.

import { getChapters } from '../api.js'
import { getProgress } from '../store.js'

// Demo-Daten falls Strapi nicht erreichbar
const DEMO_CHAPTERS = [
  { id: 1, slug: 'intro', title: 'Einführung', description: 'Lerne Toni kennen und erfahre, was dich erwartet.', order: 1 },
  { id: 2, slug: 'kapitel-1', title: 'Gefühle erkennen', description: 'Wie Gefühle entstehen und was sie dir sagen.', order: 2 },
  { id: 3, slug: 'kapitel-2', title: 'Gedanken hinterfragen', description: 'Grübelschleifen erkennen und durchbrechen.', order: 3 },
  { id: 4, slug: 'kapitel-3', title: 'Stress bewältigen', description: 'Strategien für stressige Situationen im Alltag.', order: 4 },
  { id: 5, slug: 'kapitel-4', title: 'Selbstwert stärken', description: 'Deine Stärken entdecken und nutzen.', order: 5 },
  { id: 6, slug: 'kapitel-5', title: 'Beziehungen pflegen', description: 'Kommunikation und Grenzen setzen.', order: 6 },
  { id: 7, slug: 'kapitel-6', title: 'Krisen meistern', description: 'Was tun, wenn alles zu viel wird?', order: 7 },
  { id: 8, slug: 'abschluss', title: 'Abschluss', description: 'Rückblick und dein persönlicher Plan.', order: 8 },
]

export function ChaptersScreen() {
  const el = document.createElement('div')
  el.className = 'screen chapters-screen'

  el.innerHTML = `
    <div class="topbar">
      <h1 class="chapters-heading">Kapitel</h1>
      <button class="btn-menu chapters-menu" type="button">&#8942;</button>
    </div>
    <div class="chapters-list"></div>
    <div class="chapters-loading">Lade Kapitel …</div>
  `

  const listEl = el.querySelector('.chapters-list')
  const loadingEl = el.querySelector('.chapters-loading')

  el.querySelector('.chapters-menu').addEventListener('click', () => {
    window.location.hash = '#/home'
  })

  async function init() {
    let chapters = null
    try {
      chapters = await getChapters()
    } catch (e) {
      console.warn('Strapi nicht erreichbar, nutze Demo-Daten:', e.message)
    }

    chapters = chapters || DEMO_CHAPTERS
    const progress = await getProgress()
    const completed = progress.completedChapters || []

    loadingEl.style.display = 'none'

    // Erstes nicht-abgeschlossenes Kapitel bestimmen
    const currentIndex = chapters.findIndex(ch => !completed.includes(ch.slug))

    chapters.forEach((ch, i) => {
      const isCompleted = completed.includes(ch.slug)
      const isCurrent = i === currentIndex
      const isLocked = i > currentIndex && currentIndex >= 0

      const card = document.createElement('button')
      card.className = 'chapter-card'
      if (isCompleted) card.classList.add('chapter-card--done')
      if (isCurrent) card.classList.add('chapter-card--current')
      if (isLocked) card.classList.add('chapter-card--locked')
      card.disabled = isLocked

      card.innerHTML = `
        <span class="chapter-number">${i + 1}</span>
        <div class="chapter-info">
          <span class="chapter-title">${ch.title}</span>
          <span class="chapter-desc">${ch.description || ''}</span>
        </div>
        <span class="chapter-status">${isCompleted ? '&#10003;' : isLocked ? '&#128274;' : ''}</span>
      `

      if (!isLocked) {
        card.addEventListener('click', () => {
          window.location.hash = `#/timecheck/${ch.slug}`
        })
      }

      listEl.appendChild(card)
    })
  }

  init()
  return el
}
