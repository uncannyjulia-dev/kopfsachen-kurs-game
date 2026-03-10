// screens/ExerciseScreen.js
// Audio-Player mit ±10s, Untertitel, Abschluss-Bewertung.

import { getExercise } from '../api.js'
import { saveQuestionnaire } from '../store.js'

const DEMO_EXERCISE = {
  id: 1,
  title: 'Atemübung: 4-7-8',
  description: 'Eine einfache Atemtechnik, die dir hilft, dich zu beruhigen.',
  category: 'Atemübung',
  duration: '5 Min',
  audioUrl: null,
  subtitles: [
    { time: 0, text: 'Setz dich bequem hin und schließe die Augen.' },
    { time: 5, text: 'Atme durch die Nase ein und zähle bis 4.' },
    { time: 12, text: 'Halte den Atem an und zähle bis 7.' },
    { time: 20, text: 'Atme langsam durch den Mund aus und zähle bis 8.' },
    { time: 30, text: 'Wiederhole das Ganze noch zweimal.' },
  ],
}

export function ExerciseScreen(path) {
  const id = path?.replace('/exercise/', '') || ''
  const el = document.createElement('div')
  el.className = 'screen exercise-screen'

  el.innerHTML = `
    <div class="topbar">
      <button class="btn-menu exercise-back" type="button">&#8592;</button>
      <h1 class="exercise-heading">Übung</h1>
      <div style="width:44px"></div>
    </div>
    <div class="exercise-content" style="display:none">
      <h2 class="exercise-title"></h2>
      <p class="exercise-desc"></p>
      <div class="exercise-subtitle-box">
        <p class="exercise-subtitle"></p>
      </div>
      <div class="audio-player">
        <div class="audio-time-row">
          <span class="audio-time audio-current">0:00</span>
          <span class="audio-time audio-duration">0:00</span>
        </div>
        <input type="range" class="audio-seek" min="0" max="100" value="0">
        <div class="audio-controls">
          <button class="audio-btn exercise-back-10" type="button">-10s</button>
          <button class="audio-btn audio-btn--play exercise-play" type="button">&#9654;</button>
          <button class="audio-btn exercise-fwd-10" type="button">+10s</button>
        </div>
      </div>
      <div class="exercise-rating" style="display:none">
        <h3 class="exercise-rating-title">Wie hat dir die Übung gefallen?</h3>
        <div class="likert">
          <div class="likert-item" data-value="1">
            <div class="likert-emoji">😟</div>
            <span class="likert-label">Gar nicht</span>
          </div>
          <div class="likert-item" data-value="2">
            <div class="likert-emoji">😐</div>
            <span class="likert-label">Wenig</span>
          </div>
          <div class="likert-item" data-value="3">
            <div class="likert-emoji">🙂</div>
            <span class="likert-label">Okay</span>
          </div>
          <div class="likert-item" data-value="4">
            <div class="likert-emoji">😊</div>
            <span class="likert-label">Gut</span>
          </div>
          <div class="likert-item" data-value="5">
            <div class="likert-emoji">🤩</div>
            <span class="likert-label">Super</span>
          </div>
        </div>
        <button class="btn-primary exercise-done" type="button" disabled>Fertig</button>
      </div>
    </div>
    <div class="exercise-loading">Lade Übung …</div>
  `

  const contentEl = el.querySelector('.exercise-content')
  const loadingEl = el.querySelector('.exercise-loading')
  const titleEl = el.querySelector('.exercise-title')
  const descEl = el.querySelector('.exercise-desc')
  const subtitleEl = el.querySelector('.exercise-subtitle')
  const seekEl = el.querySelector('.audio-seek')
  const currentTimeEl = el.querySelector('.audio-current')
  const durationEl = el.querySelector('.audio-duration')
  const playBtn = el.querySelector('.exercise-play')
  const ratingEl = el.querySelector('.exercise-rating')
  const doneBtn = el.querySelector('.exercise-done')

  let audio = null
  let exercise = null
  let selectedRating = null

  el.querySelector('.exercise-back').addEventListener('click', () => {
    if (audio) { audio.pause(); audio.src = '' }
    history.back()
  })

  function formatTime(s) {
    const m = Math.floor(s / 60)
    const sec = Math.floor(s % 60)
    return `${m}:${sec.toString().padStart(2, '0')}`
  }

  function updateSubtitle(time) {
    if (!exercise?.subtitles?.length) return
    const subs = exercise.subtitles
    let current = subs[0]?.text || ''
    for (const s of subs) {
      if (time >= s.time) current = s.text
    }
    subtitleEl.textContent = current
  }

  function setupAudio(ex) {
    // Use real audio if available, otherwise simulate
    if (ex.audioUrl) {
      audio = new Audio(ex.audioUrl)
    } else {
      // Simulated audio for demo
      audio = { currentTime: 0, duration: 45, paused: true, _interval: null,
        play() {
          this.paused = false
          this._interval = setInterval(() => {
            this.currentTime += 0.25
            if (this.currentTime >= this.duration) {
              this.currentTime = this.duration
              this.paused = true
              clearInterval(this._interval)
              if (this.onended) this.onended()
            }
            if (this.ontimeupdate) this.ontimeupdate()
          }, 250)
        },
        pause() { this.paused = true; clearInterval(this._interval) },
        set src(_) {},
      }
    }

    durationEl.textContent = formatTime(audio.duration || 45)

    const update = () => {
      const ct = audio.currentTime || 0
      const dur = audio.duration || 45
      currentTimeEl.textContent = formatTime(ct)
      seekEl.value = dur ? (ct / dur * 100) : 0
      updateSubtitle(ct)
    }

    if (audio instanceof Audio) {
      audio.addEventListener('timeupdate', update)
      audio.addEventListener('loadedmetadata', () => {
        durationEl.textContent = formatTime(audio.duration)
      })
      audio.addEventListener('ended', showRating)
    } else {
      audio.ontimeupdate = update
      audio.onended = showRating
    }

    playBtn.addEventListener('click', () => {
      if (audio.paused) {
        audio.play()
        playBtn.innerHTML = '&#10074;&#10074;'
      } else {
        audio.pause()
        playBtn.innerHTML = '&#9654;'
      }
    })

    seekEl.addEventListener('input', () => {
      const dur = audio.duration || 45
      audio.currentTime = (seekEl.value / 100) * dur
    })

    el.querySelector('.exercise-back-10').addEventListener('click', () => {
      audio.currentTime = Math.max(0, audio.currentTime - 10)
    })

    el.querySelector('.exercise-fwd-10').addEventListener('click', () => {
      const dur = audio.duration || 45
      audio.currentTime = Math.min(dur, audio.currentTime + 10)
    })
  }

  function showRating() {
    playBtn.innerHTML = '&#9654;'
    ratingEl.style.display = ''

    el.querySelectorAll('.likert-item').forEach(item => {
      item.addEventListener('click', () => {
        el.querySelectorAll('.likert-item').forEach(i => i.classList.remove('selected'))
        item.classList.add('selected')
        selectedRating = parseInt(item.dataset.value)
        doneBtn.disabled = false
      })
    })

    doneBtn.addEventListener('click', async () => {
      if (selectedRating) {
        await saveQuestionnaire('exercise_rating', [
          { exerciseId: exercise?.id || id, rating: selectedRating }
        ])
      }
      if (audio && audio instanceof Audio) { audio.pause(); audio.src = '' }
      history.back()
    })
  }

  async function init() {
    let loaded = null
    try {
      if (id && id !== 'exercise') {
        loaded = await getExercise(id)
      }
    } catch (e) {
      console.warn('Strapi nicht erreichbar, nutze Demo-Daten:', e.message)
    }

    exercise = loaded || DEMO_EXERCISE
    loadingEl.style.display = 'none'
    contentEl.style.display = ''

    titleEl.textContent = exercise.title
    descEl.textContent = exercise.description || ''
    setupAudio(exercise)
    updateSubtitle(0)
  }

  init()
  return el
}
