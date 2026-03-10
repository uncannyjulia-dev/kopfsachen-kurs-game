// screens/JournalScreen.js
// Doppelseiten-Journal mit 6 Templates.

import { getJournal } from '../api.js'
import { getProgress } from '../store.js'
import { openSideMenu } from '../components/SideMenu.js'

const DEMO_PAGES = [
  {
    id: 1,
    pageNumber: 1,
    template: 'text_only',
    title: 'Willkommen in deinem Tagebuch',
    text: 'Hier hält Noen alles für dich fest, was auf eurer Reise passiert. Du kannst jederzeit hierher zurückkommen und nachlesen.',
    stickers: [],
  },
  {
    id: 2,
    pageNumber: 2,
    template: 'text_only',
    text: 'Toni hat dir erzählt, dass dieser Kurs 8 Einheiten hat. Jede dauert ungefähr 45 Minuten. Du machst das in deinem Tempo.',
    stickers: [],
  },
  {
    id: 3,
    pageNumber: 3,
    template: 'exercise_embed',
    title: 'Deine erste Übung',
    text: 'Probier mal diese kurze Atemübung aus.',
    exerciseId: 1,
    stickerLabel: 'Atemübung',
    stickers: [{ x: 72, y: 35, scale: 0.8, rotation: 12, zIndex: 2, emoji: '🌬️' }],
  },
  {
    id: 4,
    pageNumber: 4,
    template: 'text_only',
    text: 'Toll gemacht! Noen ist stolz auf dich. Blätter weiter, wann immer du bereit bist.',
    stickers: [],
  },
]

export function JournalScreen(path) {
  const el = document.createElement('div')
  el.className = 'screen journal-screen'

  el.innerHTML = `
    <div class="topbar">
      <button class="btn-menu journal-back" type="button">&#8592;</button>
      <h1 class="journal-heading">Tagebuch</h1>
      <div style="width:44px"></div>
    </div>
    <div class="journal-container">
      <div class="journal">
        <div class="journal-page journal-page--left"></div>
        <div class="journal-spine"></div>
        <div class="journal-page journal-page--right"></div>
      </div>
      <div class="journal-page-indicator"></div>
    </div>
    <div class="journal-nav">
      <button class="btn-secondary journal-prev" type="button" disabled>Zurück</button>
      <button class="btn-secondary journal-next" type="button">Weiter</button>
    </div>
    <div class="side-tabs">
      <button class="side-tab side-tab--purple" type="button" data-action="novel" title="Zurück zur Story">&#128172;</button>
      <button class="side-tab side-tab--orange" type="button" data-action="menu" title="Menü">&#9776;</button>
    </div>
    <div class="journal-loading">Lade Tagebuch …</div>
  `

  el.querySelectorAll('.side-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      const action = tab.dataset.action
      if (action === 'novel') history.back()
      else if (action === 'menu') openSideMenu()
    })
  })

  const leftPage = el.querySelector('.journal-page--left')
  const rightPage = el.querySelector('.journal-page--right')
  const prevBtn = el.querySelector('.journal-prev')
  const nextBtn = el.querySelector('.journal-next')
  const indicator = el.querySelector('.journal-page-indicator')
  const loadingEl = el.querySelector('.journal-loading')
  const containerEl = el.querySelector('.journal-container')
  const navEl = el.querySelector('.journal-nav')

  let pages = []
  let spread = 0 // Current spread index (each spread = 2 pages)

  el.querySelector('.journal-back').addEventListener('click', () => {
    history.back()
  })

  function renderPage(pageEl, page) {
    if (!page) {
      pageEl.innerHTML = ''
      return
    }

    let html = ''

    switch (page.template) {
      case 'text_only':
        html = `
          ${page.title ? `<h3 class="journal-page-title">${page.title}</h3>` : ''}
          <p class="journal-page-text">${page.text || ''}</p>
        `
        break

      case 'image_layout_a':
        html = `
          <div class="journal-img-text">
            ${page.imageUrl ? `<img src="${page.imageUrl}" alt="" class="journal-img">` : '<div class="journal-img-placeholder"></div>'}
            <div>
              ${page.title ? `<h3 class="journal-page-title">${page.title}</h3>` : ''}
              <p class="journal-page-text">${page.text || ''}</p>
            </div>
          </div>
        `
        break

      case 'image_layout_b':
        html = `
          <div class="journal-fullbg" ${page.imageUrl ? `style="background-image:url(${page.imageUrl})"` : ''}>
            <div class="journal-overlay-text">
              ${page.title ? `<h3 class="journal-page-title">${page.title}</h3>` : ''}
              <p class="journal-page-text">${page.text || ''}</p>
            </div>
          </div>
        `
        break

      case 'exercise_embed':
        html = `
          ${page.title ? `<h3 class="journal-page-title">${page.title}</h3>` : ''}
          <p class="journal-page-text">${page.text || ''}</p>
          <button class="btn-primary journal-exercise-btn" data-exercise-id="${page.exerciseId || ''}" type="button">
            ${page.stickerLabel || 'Übung starten'}
          </button>
        `
        break

      case 'audio_player':
        html = `
          ${page.title ? `<h3 class="journal-page-title">${page.title}</h3>` : ''}
          <p class="journal-page-text">${page.text || ''}</p>
          <div class="audio-player">
            <input type="range" class="audio-seek" min="0" max="100" value="0">
            <div class="audio-controls">
              <button class="audio-btn" type="button">-10s</button>
              <button class="audio-btn audio-btn--play" type="button">&#9654;</button>
              <button class="audio-btn" type="button">+10s</button>
            </div>
          </div>
        `
        break

      case 'video':
        html = `
          ${page.title ? `<h3 class="journal-page-title">${page.title}</h3>` : ''}
          <div class="journal-video-container">
            ${page.videoUrl ? `<video src="${page.videoUrl}" controls class="journal-video"></video>` : '<div class="journal-video-placeholder">Video</div>'}
          </div>
          <p class="journal-page-text">${page.text || ''}</p>
        `
        break

      default:
        html = `<p class="journal-page-text">${page.text || ''}</p>`
    }

    // Sticker overlay
    if (page.stickers && page.stickers.length > 0) {
      html += page.stickers.map(s => `
        <span class="journal-sticker" style="
          position: absolute;
          left: ${s.x}%;
          top: ${s.y}%;
          transform: scale(${s.scale || 1}) rotate(${s.rotation || 0}deg);
          z-index: ${s.zIndex || 1};
          font-size: 32px;
        ">${s.emoji || ''}</span>
      `).join('')
    }

    pageEl.innerHTML = html
    pageEl.style.position = 'relative'

    // Exercise button click handler
    const exBtn = pageEl.querySelector('.journal-exercise-btn')
    if (exBtn) {
      exBtn.addEventListener('click', () => {
        const id = exBtn.dataset.exerciseId
        window.location.hash = id ? `#/exercise/${id}` : '#/exercise'
      })
    }
  }

  function renderSpread() {
    const leftIdx = spread * 2
    const rightIdx = spread * 2 + 1

    renderPage(leftPage, pages[leftIdx] || null)
    renderPage(rightPage, pages[rightIdx] || null)

    prevBtn.disabled = spread === 0
    const maxSpread = Math.ceil(pages.length / 2) - 1
    nextBtn.disabled = spread >= maxSpread

    indicator.textContent = `${leftIdx + 1}–${Math.min(rightIdx + 1, pages.length)} / ${pages.length}`
  }

  prevBtn.addEventListener('click', () => {
    if (spread > 0) { spread--; renderSpread() }
  })

  nextBtn.addEventListener('click', () => {
    const maxSpread = Math.ceil(pages.length / 2) - 1
    if (spread < maxSpread) { spread++; renderSpread() }
  })

  async function init() {
    const progress = await getProgress()
    const slug = progress.currentChapter || 'intro'
    let loadedPages = null

    try {
      loadedPages = await getJournal(slug)
    } catch (e) {
      console.warn('Strapi nicht erreichbar, nutze Demo-Daten:', e.message)
    }

    pages = loadedPages || DEMO_PAGES
    loadingEl.style.display = 'none'
    containerEl.style.display = ''
    navEl.style.display = ''
    renderSpread()
  }

  containerEl.style.display = 'none'
  navEl.style.display = 'none'
  init()

  return el
}
