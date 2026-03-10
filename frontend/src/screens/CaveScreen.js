// screens/CaveScreen.js
// Innerer sicherer Ort – Hintergrund, Sticker, Sound wählen.

import { getCaveAssets } from '../api.js'
import { getCave, saveCave } from '../store.js'
import { openSideMenu } from '../components/SideMenu.js'

const DEMO_ASSETS = {
  backgrounds: [
    { key: 'forest', label: 'Wald', color: '#2D5016' },
    { key: 'beach', label: 'Strand', color: '#0EA5E9' },
    { key: 'mountain', label: 'Berge', color: '#6B7280' },
    { key: 'space', label: 'Weltraum', color: '#1E1B4B' },
  ],
  stickers: [
    { key: 'candle', emoji: '🕯️', label: 'Kerze' },
    { key: 'plant', emoji: '🪴', label: 'Pflanze' },
    { key: 'cat', emoji: '🐱', label: 'Katze' },
    { key: 'star', emoji: '⭐', label: 'Stern' },
    { key: 'book', emoji: '📖', label: 'Buch' },
    { key: 'blanket', emoji: '🧶', label: 'Decke' },
  ],
  sounds: [
    { key: 'rain', label: 'Regen' },
    { key: 'fire', label: 'Kaminfeuer' },
    { key: 'ocean', label: 'Meeresrauschen' },
    { key: 'birds', label: 'Vogelgezwitscher' },
  ],
}

export function CaveScreen() {
  const el = document.createElement('div')
  el.className = 'screen cave-screen'

  el.innerHTML = `
    <div class="topbar">
      <button class="btn-menu cave-back" type="button">&#8592;</button>
      <h1 class="cave-heading">Dein sicherer Ort</h1>
      <div style="width:44px"></div>
    </div>
    <div class="cave-preview"></div>
    <div class="cave-sections">
      <div class="cave-section">
        <h3 class="cave-section-title">Hintergrund</h3>
        <div class="cave-carousel cave-backgrounds"></div>
      </div>
      <div class="cave-section">
        <h3 class="cave-section-title">Sticker</h3>
        <div class="cave-carousel cave-stickers"></div>
      </div>
      <div class="cave-section">
        <h3 class="cave-section-title">Klang</h3>
        <div class="cave-carousel cave-sounds"></div>
      </div>
    </div>
    <button class="btn-primary cave-save" type="button">Speichern</button>
    <div class="side-tabs">
      <button class="side-tab side-tab--purple" type="button" data-action="novel" title="Zurück zur Story">&#128172;</button>
      <button class="side-tab side-tab--orange" type="button" data-action="menu" title="Menü">&#9776;</button>
    </div>
  `

  el.querySelectorAll('.side-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      const action = tab.dataset.action
      if (action === 'novel') history.back()
      else if (action === 'menu') openSideMenu()
    })
  })

  const previewEl = el.querySelector('.cave-preview')
  const bgCarousel = el.querySelector('.cave-backgrounds')
  const stickerCarousel = el.querySelector('.cave-stickers')
  const soundCarousel = el.querySelector('.cave-sounds')

  let selectedBg = null
  let selectedStickers = []
  let selectedSound = null

  el.querySelector('.cave-back').addEventListener('click', () => {
    history.back()
  })

  function updatePreview() {
    const bgAsset = (DEMO_ASSETS.backgrounds).find(b => b.key === selectedBg)
    previewEl.style.background = bgAsset ? bgAsset.color : 'var(--accent-light)'

    const stickerHtml = selectedStickers.map(key => {
      const s = DEMO_ASSETS.stickers.find(st => st.key === key)
      return s ? `<span class="cave-preview-sticker">${s.emoji}</span>` : ''
    }).join('')

    previewEl.innerHTML = stickerHtml || '<span class="cave-preview-empty">Wähle Elemente aus</span>'
  }

  function renderCarousels(assets, saved) {
    // Backgrounds
    bgCarousel.innerHTML = ''
    assets.backgrounds.forEach(bg => {
      const btn = document.createElement('button')
      btn.className = 'cave-item'
      if (selectedBg === bg.key) btn.classList.add('cave-item--selected')
      btn.innerHTML = `<span class="cave-item-swatch" style="background:${bg.color}"></span><span>${bg.label}</span>`
      btn.addEventListener('click', () => {
        selectedBg = bg.key
        renderCarousels(assets, saved)
        updatePreview()
      })
      bgCarousel.appendChild(btn)
    })

    // Stickers (multi-select)
    stickerCarousel.innerHTML = ''
    assets.stickers.forEach(s => {
      const btn = document.createElement('button')
      btn.className = 'cave-item'
      if (selectedStickers.includes(s.key)) btn.classList.add('cave-item--selected')
      btn.innerHTML = `<span class="cave-item-emoji">${s.emoji}</span><span>${s.label}</span>`
      btn.addEventListener('click', () => {
        if (selectedStickers.includes(s.key)) {
          selectedStickers = selectedStickers.filter(k => k !== s.key)
        } else {
          selectedStickers = [...selectedStickers, s.key]
        }
        renderCarousels(assets, saved)
        updatePreview()
      })
      stickerCarousel.appendChild(btn)
    })

    // Sounds
    soundCarousel.innerHTML = ''
    assets.sounds.forEach(snd => {
      const btn = document.createElement('button')
      btn.className = 'cave-item'
      if (selectedSound === snd.key) btn.classList.add('cave-item--selected')
      btn.innerHTML = `<span>${snd.label}</span>`
      btn.addEventListener('click', () => {
        selectedSound = selectedSound === snd.key ? null : snd.key
        renderCarousels(assets, saved)
      })
      soundCarousel.appendChild(btn)
    })
  }

  el.querySelector('.cave-save').addEventListener('click', async () => {
    await saveCave({ backgroundKey: selectedBg, stickerKeys: selectedStickers, soundKey: selectedSound })
    history.back()
  })

  async function init() {
    const saved = await getCave()
    selectedBg = saved.backgroundKey
    selectedStickers = saved.stickerKeys || []
    selectedSound = saved.soundKey

    let assets = null
    try {
      assets = await getCaveAssets()
    } catch (e) {
      console.warn('Strapi nicht erreichbar, nutze Demo-Daten:', e.message)
    }

    // Normalize Strapi response or use demo
    if (!assets || !assets.backgrounds) {
      assets = DEMO_ASSETS
    }

    renderCarousels(assets, saved)
    updatePreview()
  }

  init()
  return el
}
