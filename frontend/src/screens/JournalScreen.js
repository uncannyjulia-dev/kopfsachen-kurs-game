// screens/JournalScreen.js
// Doppelseiten-Journal mit 6 Templates. Rendert Strapi Dynamic Zone.

import { getJournal } from '../api.js'
import { getProgress } from '../store.js'
import { openSideMenu } from '../components/SideMenu.js'

// ── Strapi-URL für Bilder ────────────────────────────────────
const env = import.meta.env || {}
const STRAPI_URL = env.VITE_STRAPI_URL || ''

function mediaUrl(media) {
  if (!media) return null
  const url = media.url || (media.data && media.data.url)
  if (!url) return null
  // Strapi Cloud liefert absolute URLs, lokales Strapi relative
  return url.startsWith('http') ? url : `${STRAPI_URL}${url}`
}

// ── YouTube embed URL ────────────────────────────────────────
function youtubeEmbedUrl(url) {
  if (!url) return null
  const match = url.match(/(?:v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/)
  return match ? `https://www.youtube-nocookie.com/embed/${match[1]}` : url
}

// ── Demo-Daten (Fallback) ────────────────────────────────────
const DEMO_PAGES = [
  {
    pageOrder: 1,
    template: 'text_only',
    content: [{
      __component: 'journal.text-only',
      text: 'Liebes Tagebuch,\n\nheute war so ein komischer Tag. Ich saß in der Bahn und auf einmal wurde mir ganz eng in der Brust.\n\nSpäter habe ich gelesen, dass das Angst war. Einfach so, ohne Grund.',
      author: 'noen',
      showLines: true,
    }],
    rightPageText: 'Angst ist eine ganz normale Reaktion deines Körpers.',
  },
  {
    pageOrder: 2,
    template: 'image_layout_a',
    content: [{
      __component: 'journal.image-layout-a',
      imageCaption: 'So fühlt sich Angst im Körper an',
      imageRotation: -3,
      text: 'Wenn Angst kommt, passiert viel in deinem Körper:\n\n❤️ Herz schlägt schneller\n💨 Atmung wird flach\n🤲 Hände schwitzen\n🧠 Gedanken rasen\n\nDu kannst deinem Körper zeigen, dass alles okay ist.',
    }],
    rightPageText: 'Noen hat aufgemalt, wo Angst im Körper spürbar ist.',
  },
  {
    pageOrder: 3,
    template: 'image_layout_b',
    content: [{
      __component: 'journal.image-layout-b',
      overlayOpacity: 0.4,
      text: '"Atmen ist die Fernbedienung für dein Nervensystem."\n\nWenn du langsam atmest, sendest du ein Signal an dein Gehirn: Alles ist sicher.',
      textPosition: 'center',
    }],
  },
  {
    pageOrder: 4,
    template: 'exercise_embed',
    content: [{
      __component: 'journal.exercise-embed',
      introText: 'Noen hat eine Atemübung in die Schachtel gelegt. Probier sie aus!',
      stickerLabel: '4-7-8 Atemübung starten',
      stickerX: 50,
      stickerY: 55,
      afterText: 'Diese Übung findest du jetzt auch in deiner Übungsschachtel.',
      exercise: { id: 1, documentId: 'demo', slug: 'atem-4-7-8' },
    }],
  },
  {
    pageOrder: 5,
    template: 'audio_player',
    content: [{
      __component: 'journal.audio-player',
      introText: 'Mach es dir bequem und hör einfach zu.',
      audioTitle: 'Noens Entspannungsreise',
      duration: 120,
      subtitle: 'Schließe deine Augen und stell dir vor, du bist an einem sicheren Ort…',
      afterText: 'Manchmal reichen zwei Minuten, um wieder klarer zu denken.',
      showWaveform: true,
    }],
  },
  {
    pageOrder: 6,
    template: 'video',
    content: [{
      __component: 'journal.video',
      introText: 'Noen hat dieses Video eingeklebt.',
      videoSource: 'youtube',
      videoUrl: 'https://www.youtube.com/watch?v=KYJdekjiAog',
      caption: 'Was passiert bei Angst im Gehirn?',
      afterText: 'Angst ist ein uraltes Schutzprogramm.',
    }],
  },
]

// ── Screen ───────────────────────────────────────────────────

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
      <div class="journal journal--single">
        <div class="journal-page journal-page--current"></div>
      </div>
      <div class="journal-page-indicator"></div>
    </div>
    <div class="journal-nav">
      <button class="btn-secondary journal-prev" type="button" disabled>Zurück</button>
      <button class="btn-secondary journal-next" type="button">Weiter</button>
    </div>
    <div class="side-tabs">
      <button class="side-tab side-tab--purple" type="button" data-action="novel" title="Zurück zur Story">&#128172;</button>
      <button class="side-tab side-tab--green" type="button" data-action="cave" title="Sicherer Ort">&#127807;</button>
      <button class="side-tab side-tab--orange" type="button" data-action="toolbox" title="Schachtel">&#129520;</button>
      <button class="side-tab" style="background:var(--border)" type="button" data-action="menu" title="Menü">&#9776;</button>
    </div>
    <div class="journal-loading">Lade Tagebuch …</div>
  `

  el.querySelectorAll('.side-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      const action = tab.dataset.action
      if (action === 'novel') history.back()
      else if (action === 'cave') window.location.hash = '#/cave'
      else if (action === 'toolbox') window.location.hash = '#/toolbox'
      else if (action === 'menu') openSideMenu()
    })
  })

  const currentPage = el.querySelector('.journal-page--current')
  const prevBtn = el.querySelector('.journal-prev')
  const nextBtn = el.querySelector('.journal-next')
  const indicator = el.querySelector('.journal-page-indicator')
  const loadingEl = el.querySelector('.journal-loading')
  const containerEl = el.querySelector('.journal-container')
  const navEl = el.querySelector('.journal-nav')

  let pages = []
  let pageIdx = 0

  el.querySelector('.journal-back').addEventListener('click', () => history.back())

  // ── Einzelne Seite rendern ───────────────────────────────

  function renderPage(pageEl, page) {
    if (!page) { pageEl.innerHTML = ''; return }

    const comp = (page.content && page.content[0]) || {}
    let html = ''

    switch (page.template) {
      case 'text_only':
        html = renderTextOnly(comp, page)
        break
      case 'image_layout_a':
        html = renderImageA(comp, page)
        break
      case 'image_layout_b':
        html = renderImageB(comp, page)
        break
      case 'exercise_embed':
        html = renderExerciseEmbed(comp, page)
        break
      case 'audio_player':
        html = renderAudioPlayer(comp, page)
        break
      case 'video':
        html = renderVideo(comp, page)
        break
      default:
        html = `<p class="journal-page-text">${comp.text || ''}</p>`
    }

    // Sticker overlay
    if (page.stickers && page.stickers.length > 0) {
      html += page.stickers.map(s => {
        const img = s.asset ? mediaUrl(s.asset.file || s.asset) : null
        const content = img
          ? `<img src="${img}" alt="" style="width:100%;height:100%">`
          : (s.emoji || '✨')
        return `<span class="journal-sticker" style="
          position: absolute;
          left: ${s.x}%;
          top: ${s.y}%;
          transform: scale(${s.scale || 1}) rotate(${s.rotation || 0}deg);
          z-index: ${s.zIndex || 1};
          font-size: 2rem;
        ">${content}</span>`
      }).join('')
    }

    pageEl.innerHTML = html
    pageEl.style.position = 'relative'

    // Exercise button
    const exBtn = pageEl.querySelector('.journal-exercise-btn')
    if (exBtn) {
      exBtn.addEventListener('click', () => {
        const id = exBtn.dataset.exerciseId
        window.location.hash = id ? `#/exercise/${id}` : '#/exercise'
      })
    }
  }

  // ── Template Renderers ───────────────────────────────────

  function nl2br(text) {
    return (text || '').replace(/\n/g, '<br>')
  }

  function renderTextOnly(comp, page) {
    const authorClass = comp.author === 'noen' ? 'journal-handwriting' : ''
    const lines = comp.showLines ? 'journal-lined' : ''
    return `
      <div class="journal-text-only ${authorClass} ${lines}">
        <p class="journal-page-text">${nl2br(comp.text)}</p>
      </div>
      ${page.rightPageText ? `<p class="journal-right-hint">${nl2br(page.rightPageText)}</p>` : ''}
    `
  }

  function renderImageA(comp, page) {
    const imgSrc = mediaUrl(comp.image)
    const rotation = comp.imageRotation || 0
    return `
      <div class="journal-img-text">
        <div class="journal-img-wrap" style="transform: rotate(${rotation}deg)">
          ${imgSrc
            ? `<img src="${imgSrc}" alt="" class="journal-img">`
            : '<div class="journal-img-placeholder">📷</div>'}
          ${comp.imageCaption ? `<span class="journal-img-caption">${comp.imageCaption}</span>` : ''}
        </div>
        <div class="journal-img-text-body">
          <p class="journal-page-text">${nl2br(comp.text)}</p>
        </div>
      </div>
      ${page.rightPageText ? `<p class="journal-right-hint">${nl2br(page.rightPageText)}</p>` : ''}
    `
  }

  function renderImageB(comp) {
    const bgSrc = mediaUrl(comp.backgroundImage)
    const opacity = comp.overlayOpacity ?? 0.3
    const pos = comp.textPosition || 'center'
    const posClass = `journal-overlay--${pos}`
    return `
      <div class="journal-fullbg" ${bgSrc ? `style="background-image:url(${bgSrc})"` : ''}>
        <div class="journal-overlay" style="background:rgba(255,255,255,${opacity})"></div>
        <div class="journal-overlay-text ${posClass}">
          <p class="journal-page-text">${nl2br(comp.text)}</p>
        </div>
      </div>
    `
  }

  function renderExerciseEmbed(comp) {
    const exerciseRef = comp.exercise
    const exerciseId = exerciseRef?.documentId || exerciseRef?.id || ''
    return `
      <div class="journal-exercise-page">
        ${comp.introText ? `<p class="journal-page-text">${nl2br(comp.introText)}</p>` : ''}
        <div class="journal-exercise-sticker" style="text-align:center; margin: var(--space-lg) 0">
          <button class="btn-primary journal-exercise-btn" data-exercise-id="${exerciseId}" type="button">
            ${comp.stickerLabel || 'Übung starten'}
          </button>
        </div>
        ${comp.afterText ? `<p class="journal-page-text journal-after-text">${nl2br(comp.afterText)}</p>` : ''}
      </div>
    `
  }

  function renderAudioPlayer(comp) {
    return `
      <div class="journal-audio-page">
        ${comp.introText ? `<p class="journal-page-text">${nl2br(comp.introText)}</p>` : ''}
        <div class="audio-player">
          <p class="audio-title">${comp.audioTitle || 'Audio'}</p>
          ${comp.duration ? `<p class="audio-duration">${Math.floor(comp.duration / 60)}:${String(comp.duration % 60).padStart(2, '0')}</p>` : ''}
          <input type="range" class="audio-seek" min="0" max="100" value="0">
          <div class="audio-controls">
            <button class="audio-btn" type="button">-10s</button>
            <button class="audio-btn audio-btn--play" type="button">&#9654;</button>
            <button class="audio-btn" type="button">+10s</button>
          </div>
          ${comp.subtitle ? `<p class="audio-subtitle">${nl2br(comp.subtitle)}</p>` : ''}
        </div>
        ${comp.afterText ? `<p class="journal-page-text journal-after-text">${nl2br(comp.afterText)}</p>` : ''}
      </div>
    `
  }

  function renderVideo(comp) {
    let videoHtml = ''
    if (comp.videoSource === 'youtube' && comp.videoUrl) {
      const embedUrl = youtubeEmbedUrl(comp.videoUrl)
      videoHtml = `<iframe src="${embedUrl}" class="journal-video-iframe" allowfullscreen frameborder="0"></iframe>`
    } else if (comp.videoSource === 'vimeo' && comp.videoUrl) {
      const vimeoId = comp.videoUrl.match(/vimeo\.com\/(\d+)/)?.[1]
      videoHtml = vimeoId
        ? `<iframe src="https://player.vimeo.com/video/${vimeoId}" class="journal-video-iframe" allowfullscreen frameborder="0"></iframe>`
        : '<div class="journal-video-placeholder">Video nicht verfügbar</div>'
    } else if (comp.videoFile) {
      const src = mediaUrl(comp.videoFile)
      const poster = mediaUrl(comp.videoPoster)
      videoHtml = `<video src="${src}" ${poster ? `poster="${poster}"` : ''} controls class="journal-video"></video>`
    } else {
      videoHtml = '<div class="journal-video-placeholder">Video</div>'
    }

    return `
      <div class="journal-video-page">
        ${comp.introText ? `<p class="journal-page-text">${nl2br(comp.introText)}</p>` : ''}
        <div class="journal-video-container">${videoHtml}</div>
        ${comp.caption ? `<p class="journal-video-caption">${comp.caption}</p>` : ''}
        ${comp.afterText ? `<p class="journal-page-text journal-after-text">${nl2br(comp.afterText)}</p>` : ''}
      </div>
    `
  }

  // ── Page Navigation ──────────────────────────────────────

  function renderCurrentPage() {
    renderPage(currentPage, pages[pageIdx] || null)

    prevBtn.disabled = pageIdx === 0
    nextBtn.disabled = pageIdx >= pages.length - 1

    indicator.textContent = `${pageIdx + 1} / ${pages.length}`
  }

  prevBtn.addEventListener('click', () => {
    if (pageIdx > 0) { pageIdx--; renderCurrentPage() }
  })

  nextBtn.addEventListener('click', () => {
    if (pageIdx < pages.length - 1) { pageIdx++; renderCurrentPage() }
  })

  // ── Init ─────────────────────────────────────────────────

  async function init() {
    const progress = await getProgress()
    const slug = progress.currentChapter || 'intro'
    let loadedPages = null

    try {
      const result = await getJournal(slug)
      if (result && result.length > 0) loadedPages = result
    } catch (e) {
      console.warn('Strapi nicht erreichbar, nutze Demo-Daten:', e.message)
    }

    pages = loadedPages || DEMO_PAGES
    loadingEl.style.display = 'none'
    containerEl.style.display = ''
    navEl.style.display = ''
    renderCurrentPage()
  }

  containerEl.style.display = 'none'
  navEl.style.display = 'none'
  init()

  return el
}
