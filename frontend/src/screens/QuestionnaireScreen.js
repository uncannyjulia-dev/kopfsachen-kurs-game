// screens/QuestionnaireScreen.js
// Likert-Skala Fragebogen mit mehreren Fragen.

import { saveQuestionnaire } from '../store.js'

const DEMO_QUESTIONS = [
  { id: 1, text: 'Wie geht es dir gerade?', emoji: ['😟', '😕', '😐', '🙂', '😊'] },
  { id: 2, text: 'Wie gut kannst du dich gerade konzentrieren?', emoji: ['😟', '😕', '😐', '🙂', '😊'] },
  { id: 3, text: 'Wie sicher fühlst du dich gerade?', emoji: ['😟', '😕', '😐', '🙂', '😊'] },
]

const LABELS = ['Gar nicht', 'Wenig', 'Mittel', 'Gut', 'Sehr gut']

export function QuestionnaireScreen(path) {
  const type = path?.replace('/questionnaire/', '') || 'check-in'
  const el = document.createElement('div')
  el.className = 'screen questionnaire-screen'

  el.innerHTML = `
    <div class="topbar">
      <button class="btn-menu questionnaire-back" type="button">&#8592;</button>
      <h1 class="questionnaire-heading">Fragebogen</h1>
      <div style="width:44px"></div>
    </div>
    <div class="questionnaire-content">
      <div class="questionnaire-progress"></div>
      <h2 class="questionnaire-question"></h2>
      <div class="likert"></div>
      <div class="questionnaire-nav">
        <button class="btn-secondary questionnaire-prev" type="button" disabled>Zurück</button>
        <button class="btn-primary questionnaire-next" type="button">Weiter</button>
      </div>
    </div>
  `

  const questionEl = el.querySelector('.questionnaire-question')
  const likertEl = el.querySelector('.likert')
  const progressEl = el.querySelector('.questionnaire-progress')
  const prevBtn = el.querySelector('.questionnaire-prev')
  const nextBtn = el.querySelector('.questionnaire-next')

  const questions = DEMO_QUESTIONS
  const answers = new Array(questions.length).fill(null)
  let currentIdx = 0

  el.querySelector('.questionnaire-back').addEventListener('click', () => {
    history.back()
  })

  function renderQuestion() {
    const q = questions[currentIdx]
    progressEl.textContent = `Frage ${currentIdx + 1} von ${questions.length}`
    questionEl.textContent = q.text

    likertEl.innerHTML = ''
    q.emoji.forEach((em, i) => {
      const item = document.createElement('div')
      item.className = 'likert-item'
      if (answers[currentIdx] === i + 1) item.classList.add('selected')
      item.dataset.value = i + 1
      item.innerHTML = `
        <div class="likert-emoji">${em}</div>
        <span class="likert-label">${LABELS[i]}</span>
      `
      item.addEventListener('click', () => {
        answers[currentIdx] = i + 1
        renderQuestion()
      })
      likertEl.appendChild(item)
    })

    prevBtn.disabled = currentIdx === 0
    const isLast = currentIdx === questions.length - 1
    nextBtn.textContent = isLast ? 'Abschließen' : 'Weiter'
    nextBtn.disabled = answers[currentIdx] === null
  }

  prevBtn.addEventListener('click', () => {
    if (currentIdx > 0) { currentIdx--; renderQuestion() }
  })

  nextBtn.addEventListener('click', async () => {
    if (answers[currentIdx] === null) return

    if (currentIdx < questions.length - 1) {
      currentIdx++
      renderQuestion()
    } else {
      // Save and go back
      const formatted = questions.map((q, i) => ({
        questionId: q.id,
        questionText: q.text,
        value: answers[i],
      }))
      await saveQuestionnaire(type, formatted)
      history.back()
    }
  })

  renderQuestion()
  return el
}
