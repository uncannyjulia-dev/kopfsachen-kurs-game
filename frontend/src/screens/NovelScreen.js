// screens/NovelScreen.js
// Dialog-Engine: Sprechblasen, Choices, Character-Wechsel, Spielstand.

import { getDialogScene } from '../api.js'
import { getProgress, saveProgress } from '../store.js'

// ── Demo-Daten (solange Strapi nicht läuft) ──────────────────
const DEMO_NODES = [
  {
    nodeId: 1,
    speaker: 'toni',
    text: 'Hey! Schön, dass du da bist. Ich bin Toni.',
    emotion: 'happy',
    nextNodeId: 2,
    choices: [],
  },
  {
    nodeId: 2,
    speaker: 'toni',
    text: 'Hier lernst du ein paar Tricks, die dir im Alltag helfen können. Bist du bereit?',
    emotion: 'neutral',
    nextNodeId: null,
    choices: [
      { text: 'Ja, los gehts!', nextNodeId: 3 },
      { text: 'Erzähl mir mehr', nextNodeId: 4 },
    ],
  },
  {
    nodeId: 3,
    speaker: 'toni',
    text: 'Super! Dann lass uns direkt loslegen. 💪',
    emotion: 'happy',
    nextNodeId: 5,
    choices: [],
  },
  {
    nodeId: 4,
    speaker: 'toni',
    text: 'Klar! Wir machen zusammen 8 Einheiten – mit Übungen, einem Tagebuch und deiner eigenen Wohlfühl-Höhle.',
    emotion: 'thinking',
    nextNodeId: 5,
    choices: [],
  },
  {
    nodeId: 5,
    speaker: 'narrator',
    text: 'Toni lächelt dich aufmunternd an.',
    emotion: null,
    nextNodeId: 6,
    choices: [],
  },
  {
    nodeId: 6,
    speaker: 'user',
    text: 'Was machen wir als erstes?',
    emotion: null,
    nextNodeId: 7,
    choices: [],
  },
  {
    nodeId: 7,
    speaker: 'toni',
    text: 'Als erstes zeig ich dir dein Tagebuch. Da hält Noen alles für dich fest.',
    emotion: 'neutral',
    nextNodeId: null,
    choices: [],
    triggerAction: 'open_journal',
  },
]

const SPEAKER_CONFIG = {
  toni:     { label: 'Toni',     color: 'var(--accent)' },
  noen:     { label: 'Noen',     color: '#4ADE80' },
  furi:     { label: 'Furi',     color: '#FB923C' },
  user:     { label: 'Du',       color: 'var(--text-muted)' },
  narrator: { label: '',         color: 'var(--text-muted)' },
}

// ── Screen ───────────────────────────────────────────────────

export function NovelScreen(path) {
  const el = document.createElement('div')
  el.className = 'screen novel-screen'

  // Chapter-Slug aus Route extrahieren (z.B. /novel/kapitel-1)
  const slug = path?.replace('/novel/', '') || 'intro'

  el.innerHTML = `
    <div class="novel-bg"></div>
    <div class="novel-content">
      <div class="novel-speaker-label"></div>
      <div class="novel-bubble-area">
        <div class="speech-bubble novel-bubble"></div>
      </div>
      <div class="novel-choices"></div>
      <button class="novel-continue btn-primary" type="button">Weiter</button>
    </div>
    <div class="novel-loading">
      <p>Lade Dialog …</p>
    </div>
  `

  const bubbleArea   = el.querySelector('.novel-bubble-area')
  const bubble       = el.querySelector('.novel-bubble')
  const speakerLabel = el.querySelector('.novel-speaker-label')
  const choicesEl    = el.querySelector('.novel-choices')
  const continueBtn  = el.querySelector('.novel-continue')
  const loadingEl    = el.querySelector('.novel-loading')
  const contentEl    = el.querySelector('.novel-content')

  let nodes = []
  let currentNode = null

  // ── Node rendern ─────────────────────────────────────────

  function renderNode(node) {
    currentNode = node
    if (!node) return handleSceneEnd()

    const config = SPEAKER_CONFIG[node.speaker] || SPEAKER_CONFIG.narrator

    // Speaker-Label
    if (node.speaker === 'narrator') {
      speakerLabel.textContent = ''
      speakerLabel.style.display = 'none'
    } else {
      speakerLabel.textContent = config.label
      speakerLabel.style.display = ''
      speakerLabel.style.color = config.color
    }

    // Bubble-Styling je nach Speaker
    bubbleArea.className = 'novel-bubble-area'
    bubbleArea.classList.add(`novel-bubble--${node.speaker}`)

    // Bubble-Border-Farbe
    bubble.style.borderColor = config.color
    bubble.style.color = node.speaker === 'narrator' ? 'var(--text-muted)' : 'var(--text)'

    // Text mit Typewriter-Effekt
    typeText(bubble, node.text)

    // Emotion als Data-Attribut (für späteres Character-Bild)
    el.dataset.emotion = node.emotion || 'neutral'
    el.dataset.speaker = node.speaker

    // Choices oder Weiter-Button
    const hasChoices = node.choices && node.choices.length > 0

    if (hasChoices) {
      continueBtn.style.display = 'none'
      renderChoices(node.choices)
    } else if (node.nextNodeId !== null && node.nextNodeId !== undefined) {
      continueBtn.style.display = ''
      choicesEl.innerHTML = ''
      choicesEl.style.display = 'none'
    } else {
      // Ende der Szene oder triggerAction
      if (node.triggerAction && node.triggerAction !== 'none') {
        continueBtn.textContent = actionLabel(node.triggerAction)
        continueBtn.style.display = ''
      } else {
        continueBtn.textContent = 'Szene beenden'
        continueBtn.style.display = ''
      }
      choicesEl.innerHTML = ''
      choicesEl.style.display = 'none'
    }
  }

  function renderChoices(choices) {
    choicesEl.style.display = ''
    choicesEl.innerHTML = ''
    choices.forEach(choice => {
      const btn = document.createElement('button')
      btn.className = 'btn-secondary novel-choice'
      btn.textContent = choice.text
      btn.addEventListener('click', () => {
        goToNode(choice.nextNodeId)
      })
      choicesEl.appendChild(btn)
    })
  }

  // ── Typewriter ───────────────────────────────────────────

  let typeTimer = null

  function typeText(target, text) {
    clearInterval(typeTimer)
    target.textContent = ''
    let i = 0
    typeTimer = setInterval(() => {
      if (i < text.length) {
        target.textContent += text[i]
        i++
      } else {
        clearInterval(typeTimer)
        typeTimer = null
      }
    }, 25)

    // Tap auf Bubble = sofort komplett anzeigen
    target.onclick = () => {
      if (typeTimer) {
        clearInterval(typeTimer)
        typeTimer = null
        target.textContent = text
      }
    }
  }

  // ── Navigation ───────────────────────────────────────────

  function goToNode(nodeId) {
    const node = nodes.find(n => n.nodeId === nodeId)
    if (node) {
      renderNode(node)
      saveProgress({ currentChapter: slug, currentNodeId: nodeId })
    } else {
      handleSceneEnd()
    }
  }

  continueBtn.addEventListener('click', () => {
    if (!currentNode) return

    // TriggerAction am Ende
    if ((currentNode.nextNodeId === null || currentNode.nextNodeId === undefined) &&
        currentNode.triggerAction && currentNode.triggerAction !== 'none') {
      handleTrigger(currentNode.triggerAction)
      return
    }

    // Ende ohne Action
    if (currentNode.nextNodeId === null || currentNode.nextNodeId === undefined) {
      handleSceneEnd()
      return
    }

    goToNode(currentNode.nextNodeId)
  })

  function handleTrigger(action) {
    const routes = {
      open_journal:  '#/journal',
      open_cave:     '#/cave',
      open_exercise: '#/exercise',
      open_help:     '#/help',
    }
    const route = routes[action]
    if (route) window.location.hash = route
  }

  function handleSceneEnd() {
    bubble.textContent = 'Szene beendet.'
    speakerLabel.style.display = 'none'
    choicesEl.innerHTML = ''
    choicesEl.style.display = 'none'
    continueBtn.textContent = 'Zurück zur Übersicht'
    continueBtn.style.display = ''
    continueBtn.onclick = () => {
      window.location.hash = '#/chapters'
    }
  }

  function actionLabel(action) {
    const labels = {
      open_journal:  'Tagebuch öffnen 📖',
      open_cave:     'Höhle öffnen 🌿',
      open_exercise: 'Übung starten 🎧',
      open_help:     'Hilfe anzeigen 🆘',
    }
    return labels[action] || 'Weiter'
  }

  // ── Init ─────────────────────────────────────────────────

  async function init() {
    let loadedNodes = null

    try {
      const scenes = await getDialogScene(slug)
      if (scenes && scenes.length > 0) {
        // Erste Szene nehmen, nach sceneOrder sortiert
        const scene = Array.isArray(scenes)
          ? scenes.sort((a, b) => (a.sceneOrder || 0) - (b.sceneOrder || 0))[0]
          : scenes
        loadedNodes = scene.nodes || scene.attributes?.nodes?.data?.map(n => n.attributes)
      }
    } catch {
      // Strapi nicht erreichbar → Demo-Daten
    }

    nodes = loadedNodes || DEMO_NODES
    loadingEl.style.display = 'none'
    contentEl.style.display = ''

    // Fortschritt laden → ggf. an letzter Stelle weitermachen
    const progress = await getProgress()
    const startId = (progress.currentChapter === slug && progress.currentNodeId > 0)
      ? progress.currentNodeId
      : nodes[0]?.nodeId || 1

    goToNode(startId)
  }

  contentEl.style.display = 'none'
  init()

  return el
}
