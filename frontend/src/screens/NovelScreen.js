// screens/NovelScreen.js
// Dialog-Engine: Sprechblasen, Choices, Likert-Inline, Character-Wechsel, Spielstand.

import { getDialogScene } from '../api.js'
import { getProgress, saveProgress, saveQuestionnaire, getSettings, saveSettings } from '../store.js'
import { openSideMenu } from '../components/SideMenu.js'

// ── Demo-Daten: Intro inkl. Prä-Fragebogen (aus Konzept) ──────
const DEMO_NODES = [
  // -- Intro: Toni trifft User --
  {
    nodeId: 1,
    speaker: 'toni',
    text: 'Noen? … Bist du Noen?',
    emotion: 'surprised',
    nextNodeId: null,
    choices: [
      { text: 'Ähm … nein?', nextNodeId: 3 },
      { text: 'Sorry, falsche Person.', nextNodeId: 3 },
    ],
  },
  {
    nodeId: 3,
    speaker: 'toni',
    text: 'Oh … sorry … ich dachte kurz … egal.',
    emotion: 'sad',
    nextNodeId: 4,
    choices: [],
  },
  {
    nodeId: 4,
    speaker: 'toni',
    text: 'Wer bist du?',
    emotion: 'neutral',
    nextNodeId: 5,
    choices: [],
  },
  {
    nodeId: 5,
    speaker: 'user',
    text: '(Dein Name)',
    emotion: null,
    nextNodeId: 6,
    choices: [],
    inputType: 'text',
    inputPlaceholder: 'Dein Name …',
  },
  {
    nodeId: 6,
    speaker: 'toni',
    text: 'Hi [Username], freut mich dich zu treffen!',
    emotion: 'happy',
    nextNodeId: 7,
    choices: [],
  },
  {
    nodeId: 7,
    speaker: 'toni',
    text: 'Ich suche eigentlich jemand anderen. Noen. Noen ist mein best Friend. … oder war mein best Friend? … Ach keine Ahnung.',
    emotion: 'thinking',
    nextNodeId: 8,
    choices: [],
  },
  {
    nodeId: 8,
    speaker: 'toni',
    text: 'Mit Noen hat sich immer alles so leicht angefühlt.',
    emotion: 'sad',
    nextNodeId: 9,
    choices: [],
  },
  {
    nodeId: 9,
    speaker: 'toni',
    text: 'Jetzt ist Noen weg.',
    emotion: 'sad',
    nextNodeId: 10,
    choices: [],
  },
  {
    nodeId: 10,
    speaker: 'narrator',
    text: 'Toni blickt kurz nach unten.',
    emotion: null,
    nextNodeId: 11,
    choices: [],
  },
  {
    nodeId: 11,
    speaker: 'toni',
    text: 'Vielleicht klingt das komisch. … Aber ich weiß irgendwie echt nicht, wie ich ohne Noen klar kommen soll.',
    emotion: 'sad',
    nextNodeId: 20,
    choices: [],
  },

  // -- Prä-Fragebogen: Toni fragt --
  {
    nodeId: 20,
    speaker: 'toni',
    text: 'Aber genug von mir.',
    emotion: 'neutral',
    nextNodeId: 21,
    choices: [],
  },
  {
    nodeId: 21,
    speaker: 'toni',
    text: 'Wie geht es dir eigentlich?',
    emotion: 'neutral',
    nextNodeId: null,
    choices: [],
    likert: {
      questionId: 'stimmung',
      questionText: 'Wie geht es dir?',
      emojis: ['😟', '😕', '😐', '🙂', '😊'],
      labels: ['Gar nicht gut', 'Nicht so', 'Geht so', 'Gut', 'Sehr gut'],
      nextNodeId: 22,
    },
  },
  {
    nodeId: 22,
    speaker: 'toni',
    text: 'Das hier ist ja ein Kurs zum Thema Mentale Gesundheit. Daher muss ich dir jetzt zu Beginn ein paar Fragen stellen.',
    emotion: 'neutral',
    nextNodeId: 23,
    choices: [],
  },
  {
    nodeId: 23,
    speaker: 'toni',
    text: 'Ich bitte dich, ganz spontan, offen und ehrlich auf die Fragen zu antworten. Deine Antworten werden anonym gespeichert.',
    emotion: 'neutral',
    nextNodeId: 24,
    choices: [],
  },
  {
    nodeId: 24,
    speaker: 'toni',
    text: 'Weißt du, was dir hilft, wenn du einen schlechten Tag hast?',
    emotion: 'thinking',
    nextNodeId: null,
    choices: [],
    likert: {
      questionId: 'selfcare',
      questionText: 'Weißt du, was dir hilft, wenn du einen schlechten Tag hast?',
      emojis: ['😟', '😕', '😐', '🙂', '😊'],
      labels: ['Überhaupt nicht', 'Eher nein', 'Teilweise', 'Eher ja', 'Ja voll'],
      nextNodeId: 25,
    },
  },
  {
    nodeId: 25,
    speaker: 'toni',
    text: 'Manche Menschen sprechen mit anderen über ihre psychische Gesundheit. Andere machen das eher weniger. Wie ist das bei dir?',
    emotion: 'neutral',
    nextNodeId: 26,
    choices: [],
  },
  {
    nodeId: 26,
    speaker: 'toni',
    text: 'Kannst du mit Personen, die dir nahe stehen, über deine psychische Gesundheit sprechen?',
    emotion: 'neutral',
    nextNodeId: null,
    choices: [],
    likert: {
      questionId: 'openness_self_disclosure',
      questionText: 'Kannst du mit nahestehenden Personen über deine psychische Gesundheit sprechen?',
      emojis: ['😟', '😕', '😐', '🙂', '😊'],
      labels: ['Überhaupt nicht', 'Eher nein', 'Teilweise', 'Eher ja', 'Ja voll'],
      nextNodeId: 27,
    },
  },
  {
    nodeId: 27,
    speaker: 'toni',
    text: 'Manchmal fühlen sich Menschen ja über längere Zeit echt mies. Manche Menschen erleben auch psychische Störungen.',
    emotion: 'thinking',
    nextNodeId: 28,
    choices: [],
  },
  {
    nodeId: 28,
    speaker: 'toni',
    text: 'Denkst du, Menschen mit psychischen Störungen sind selbst daran schuld?',
    emotion: 'neutral',
    nextNodeId: null,
    choices: [],
    likert: {
      questionId: 'stigma',
      questionText: 'Denkst du, Menschen mit psychischen Störungen sind selbst daran schuld?',
      emojis: ['😟', '😕', '😐', '🙂', '😊'],
      labels: ['Überhaupt nicht', 'Eher nein', 'Teilweise', 'Eher ja', 'Ja voll'],
      nextNodeId: 29,
    },
  },
  {
    nodeId: 29,
    speaker: 'toni',
    text: 'Es gibt in Deutschland ja die Möglichkeit Psychotherapie zu bekommen. Kannst du dir vorstellen, irgendwann in deinem Leben eine Psychotherapie zu machen?',
    emotion: 'neutral',
    nextNodeId: null,
    choices: [],
    likert: {
      questionId: 'openness_professional_help',
      questionText: 'Kannst du dir vorstellen, irgendwann Psychotherapie zu machen?',
      emojis: ['😟', '😕', '😐', '🙂', '😊'],
      labels: ['Überhaupt nicht', 'Eher nein', 'Teilweise', 'Eher ja', 'Ja voll'],
      nextNodeId: 30,
    },
  },
  {
    nodeId: 30,
    speaker: 'toni',
    text: 'Ich habe selbst noch nie Psychotherapie gemacht, aber kann mir schon vorstellen, das auch mal zu machen.',
    emotion: 'thinking',
    nextNodeId: 31,
    choices: [],
  },
  {
    nodeId: 31,
    speaker: 'toni',
    text: 'Ich hab noch ein paar Fragen dazu, wie du so mit deinen Gefühlen und Gefühlen Anderer umgehst.',
    emotion: 'neutral',
    nextNodeId: 32,
    choices: [],
  },
  {
    nodeId: 32,
    speaker: 'toni',
    text: 'Wenn du dich gestresst fühlst, weißt du, wie du deine Gefühle beeinflussen kannst?',
    emotion: 'neutral',
    nextNodeId: null,
    choices: [],
    likert: {
      questionId: 'negative_gefuehle',
      questionText: 'Weißt du, wie du deine Gefühle beeinflussen kannst, wenn du gestresst bist?',
      emojis: ['😟', '😕', '😐', '🙂', '😊'],
      labels: ['Überhaupt nicht', 'Eher nein', 'Teilweise', 'Eher ja', 'Ja voll'],
      nextNodeId: 33,
    },
  },
  {
    nodeId: 33,
    speaker: 'toni',
    text: 'Kannst du erkennen, wenn du dich unglücklich oder wütend fühlst? Und wenn du dich unglücklich fühlst, weißt du dann auch, warum?',
    emotion: 'neutral',
    nextNodeId: null,
    choices: [],
    likert: {
      questionId: 'gefuehle_verstehen',
      questionText: 'Kannst du deine Gefühle erkennen und verstehen, warum du sie hast?',
      emojis: ['😟', '😕', '😐', '🙂', '😊'],
      labels: ['Überhaupt nicht', 'Eher nein', 'Teilweise', 'Eher ja', 'Ja voll'],
      nextNodeId: 34,
    },
  },
  {
    nodeId: 34,
    speaker: 'toni',
    text: 'Weißt du, wie man jemanden aufmuntert, wenn er oder sie sich unglücklich fühlt?',
    emotion: 'neutral',
    nextNodeId: null,
    choices: [],
    likert: {
      questionId: 'gefuehle_anderer',
      questionText: 'Weißt du, wie man jemanden aufmuntert?',
      emojis: ['😟', '😕', '😐', '🙂', '😊'],
      labels: ['Überhaupt nicht', 'Eher nein', 'Teilweise', 'Eher ja', 'Ja voll'],
      nextNodeId: 35,
    },
  },
  {
    nodeId: 35,
    speaker: 'toni',
    text: 'Danke für das Beantworten der ganzen Fragen. Ich hoffe, das hat sich nicht wie ein Verhör angefühlt.',
    emotion: 'happy',
    nextNodeId: 36,
    choices: [],
  },
  {
    nodeId: 36,
    speaker: 'toni',
    text: 'Ich hab jetzt noch eine letzte Frage:',
    emotion: 'neutral',
    nextNodeId: 37,
    choices: [],
  },
  {
    nodeId: 37,
    speaker: 'toni',
    text: 'Kennst du Anlaufstellen, an die man sich mit psychischen Problemen wenden kann, wie z.B. Beratungsstellen, Krisen-Hotline oder Hilfe-Chat?',
    emotion: 'neutral',
    nextNodeId: null,
    choices: [],
    likert: {
      questionId: 'kenntnis_anlaufstellen',
      questionText: 'Kennst du Anlaufstellen für psychische Probleme?',
      emojis: ['😟', '😕', '😐', '🙂', '😊'],
      labels: ['Überhaupt nicht', 'Eher nein', 'Teilweise', 'Eher ja', 'Ja voll'],
      nextNodeId: 38,
    },
  },
  {
    nodeId: 38,
    speaker: 'toni',
    text: 'Wollen wir mal zusammen schauen, wo man hingehen könnte, um Hilfe zu bekommen? Klick einfach auf den Hilfe-Button.',
    emotion: 'neutral',
    nextNodeId: 40,
    choices: [],
    triggerAction: 'open_help',
  },

  // -- Nach Hilfe: Spielziel --
  // (User kommt per Back zurück, dann geht Dialog ab Node 40 weiter)
  {
    nodeId: 40,
    speaker: 'toni',
    text: 'Über das Menü kannst du jederzeit zum Hilfe-Screen zurückkehren.',
    emotion: 'neutral',
    nextNodeId: 41,
    choices: [],
  },
  {
    nodeId: 41,
    speaker: 'toni',
    text: 'Weißt du, meine krasseste Unterstützung war immer Noen.',
    emotion: 'thinking',
    nextNodeId: 42,
    choices: [],
  },
  {
    nodeId: 42,
    speaker: 'toni',
    text: 'Noen wusste so viel und irgendwie immer was zu tun ist. Egal wie schlecht es mir ging, Noen wusste immer eine Lösung.',
    emotion: 'sad',
    nextNodeId: 43,
    choices: [],
  },
  {
    nodeId: 43,
    speaker: 'toni',
    text: 'Ich weiß echt nicht, wie ich jetzt ohne Noen klar kommen soll. Ich bin völlig lost.',
    emotion: 'sad',
    nextNodeId: 44,
    choices: [],
  },
  {
    nodeId: 44,
    speaker: 'toni',
    text: 'Kannst du mir helfen, Noen zu finden?',
    emotion: 'neutral',
    nextNodeId: null,
    choices: [
      { text: 'Ja klar! Los geht\'s!', nextNodeId: 45 },
      { text: 'Ich versuch\'s', nextNodeId: 45 },
    ],
  },
  {
    nodeId: 45,
    speaker: 'toni',
    text: 'Cool, danke!',
    emotion: 'happy',
    nextNodeId: 50,
    choices: [],
  },

  // -- Schachtel + Innerer sicherer Ort Intro --
  {
    nodeId: 50,
    speaker: 'narrator',
    text: 'Plötzlich fällt Toni eine Schachtel auf den Kopf. Sie trägt die Gravur: "N".',
    emotion: null,
    nextNodeId: 51,
    choices: [],
  },
  {
    nodeId: 51,
    speaker: 'toni',
    text: 'Aua! … Mmh … was ist das denn?',
    emotion: 'surprised',
    nextNodeId: 52,
    choices: [],
  },
  {
    nodeId: 52,
    speaker: 'narrator',
    text: 'Toni öffnet die Schachtel. Da drin liegt ein Zettel mit der Darstellung eines inneren sicheren Ortes.',
    emotion: null,
    nextNodeId: 53,
    choices: [],
  },
  {
    nodeId: 53,
    speaker: 'toni',
    text: 'Das Bild kommt mir bekannt vor. Das hat doch Noen gemalt.',
    emotion: 'thinking',
    nextNodeId: 54,
    choices: [],
  },
  {
    nodeId: 54,
    speaker: 'toni',
    text: 'Noen hatte mir mal ein Notizbuch geschenkt und da war dieses Bild auch drin. Es zeigt den Ort, wo Noen immer hingeht, wenn es Noen nicht gut geht.',
    emotion: 'thinking',
    nextNodeId: 55,
    choices: [],
  },
  {
    nodeId: 55,
    speaker: 'toni',
    text: 'Wenn alles zu viel wurde, dann konnte Noen dort wohl immer runterkommen.',
    emotion: 'neutral',
    nextNodeId: 56,
    choices: [],
  },
  {
    nodeId: 56,
    speaker: 'user',
    text: '',
    emotion: null,
    nextNodeId: null,
    choices: [
      { text: 'Vielleicht ist Noen ja da!', nextNodeId: 57 },
      { text: 'Ich will diesen Ort auch kennenlernen!', nextNodeId: 57 },
    ],
  },
  {
    nodeId: 57,
    speaker: 'toni',
    text: 'Jaa, vielleicht finden wir Noen dort?! Wo habe ich bloß dieses Notizbuch hingepackt?',
    emotion: 'happy',
    nextNodeId: 58,
    choices: [],
  },
  {
    nodeId: 58,
    speaker: 'toni',
    text: 'Ah, da ist es. Lass uns mal zusammen reinschauen! Klicke dafür auf das Notizbuch-Icon an der Seite.',
    emotion: 'happy',
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
      <div class="novel-likert" style="display:none"></div>
      <div class="novel-choices"></div>
      <div class="novel-input" style="display:none">
        <input type="text" class="novel-name-input" placeholder="Dein Name …" maxlength="30" autocomplete="off" />
        <button class="btn-primary novel-input-submit" type="button">OK</button>
      </div>
      <button class="novel-continue btn-primary" type="button">Weiter</button>
    </div>
    <div class="side-tabs">
      <button class="side-tab side-tab--green" type="button" data-action="journal" title="Tagebuch" style="display:none">&#128214;</button>
      <button class="side-tab side-tab--purple" type="button" data-action="cave" title="Sicherer Ort" style="display:none">&#127807;</button>
      <button class="side-tab side-tab--orange" type="button" data-action="toolbox" title="Schachtel" style="display:none">&#129520;</button>
      <button class="side-tab" style="background:var(--border);display:none" type="button" data-action="menu" title="Menü">&#9776;</button>
    </div>
    <div class="novel-loading">
      <p>Lade Dialog …</p>
    </div>
  `

  el.querySelectorAll('.side-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      const action = tab.dataset.action
      if (action === 'journal') window.location.hash = '#/journal'
      else if (action === 'cave') window.location.hash = '#/cave'
      else if (action === 'toolbox') window.location.hash = '#/toolbox'
      else if (action === 'menu') openSideMenu()
    })
  })

  const bubbleArea   = el.querySelector('.novel-bubble-area')
  const bubble       = el.querySelector('.novel-bubble')
  const speakerLabel = el.querySelector('.novel-speaker-label')
  const choicesEl    = el.querySelector('.novel-choices')
  const likertEl     = el.querySelector('.novel-likert')
  const continueBtn  = el.querySelector('.novel-continue')
  const loadingEl    = el.querySelector('.novel-loading')
  const contentEl    = el.querySelector('.novel-content')
  const nameInputEl  = el.querySelector('.novel-input')
  const nameInput    = el.querySelector('.novel-name-input')
  const nameSubmit   = el.querySelector('.novel-input-submit')

  // Side-tab elements for progressive reveal
  const tabJournal = el.querySelector('[data-action="journal"]')
  const tabCave    = el.querySelector('[data-action="cave"]')
  const tabToolbox = el.querySelector('[data-action="toolbox"]')
  const tabMenu    = el.querySelector('[data-action="menu"]')

  let nodes = []
  let currentNode = null
  let likertAnswers = [] // Collect all inline Likert answers
  let username = null    // Loaded from settings or entered by user

  // Reveal a side-tab
  function showTab(tab) { if (tab) tab.style.display = '' }

  // Reveal tabs based on which nodes the user has already passed
  function revealTabsForNode(nodeId) {
    if (nodeId >= 40) showTab(tabMenu)
    if (nodeId >= 50) showTab(tabToolbox)
    if (nodeId >= 52) showTab(tabCave)
    if (nodeId >= 58) showTab(tabJournal)
  }

  // ── Node rendern ─────────────────────────────────────────

  function renderNode(node) {
    currentNode = node
    if (!node) return handleSceneEnd()

    // Progressive tab reveal
    revealTabsForNode(node.nodeId)

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

    // Interpolate [Username] in text
    const displayText = username
      ? (node.text || '').replace(/\[Username\]/g, username)
      : (node.text || '')

    // Text mit Typewriter-Effekt
    typeText(bubble, displayText)

    // Emotion als Data-Attribut (für späteres Character-Bild)
    el.dataset.emotion = node.emotion || 'neutral'
    el.dataset.speaker = node.speaker

    // Reset UI
    likertEl.style.display = 'none'
    likertEl.innerHTML = ''
    nameInputEl.style.display = 'none'

    // Text input (e.g. name entry)
    if (node.inputType === 'text') {
      continueBtn.style.display = 'none'
      choicesEl.innerHTML = ''
      choicesEl.style.display = 'none'
      nameInputEl.style.display = ''
      nameInput.placeholder = node.inputPlaceholder || 'Eingabe …'
      nameInput.value = username || ''
      nameInput.focus()
      return
    }

    // Inline-Likert (Fragebogen im Dialog)
    if (node.likert) {
      continueBtn.style.display = 'none'
      choicesEl.innerHTML = ''
      choicesEl.style.display = 'none'
      renderInlineLikert(node.likert)
      return
    }

    // Choices oder Weiter-Button
    const hasChoices = node.choices && node.choices.length > 0

    if (hasChoices) {
      continueBtn.style.display = 'none'
      renderChoices(node.choices)
    } else if (node.nextNodeId !== null && node.nextNodeId !== undefined) {
      continueBtn.textContent = 'Weiter'
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

  // ── Inline-Likert (Fragebogen im Dialog) ────────────────

  function renderInlineLikert(likert) {
    likertEl.style.display = ''
    likertEl.innerHTML = ''

    const scale = document.createElement('div')
    scale.className = 'likert'

    likert.emojis.forEach((emoji, i) => {
      const item = document.createElement('div')
      item.className = 'likert-item'
      item.innerHTML = `
        <div class="likert-emoji">${emoji}</div>
        <span class="likert-label">${likert.labels[i] || ''}</span>
      `
      item.addEventListener('click', () => {
        scale.querySelectorAll('.likert-item').forEach(it => it.classList.remove('selected'))
        item.classList.add('selected')

        // Save answer and advance
        likertAnswers.push({
          questionId: likert.questionId,
          questionText: likert.questionText,
          value: i + 1,
        })

        // Short delay so user sees selection
        setTimeout(() => {
          likertEl.style.display = 'none'
          goToNode(likert.nextNodeId)
        }, 400)
      })
      scale.appendChild(item)
    })

    likertEl.appendChild(scale)
  }

  // ── Name input handler ──────────────────────────────────

  function submitName() {
    const name = nameInput.value.trim()
    if (!name) return
    username = name
    saveSettings({ username: name })
    nameInputEl.style.display = 'none'
    goToNode(currentNode.nextNodeId)
  }

  nameSubmit.addEventListener('click', submitName)
  nameInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') submitName()
  })

  // ── Typewriter ───────────────────────────────────────────

  let typeTimer = null

  function typeText(target, text) {
    clearInterval(typeTimer)
    target.textContent = ''
    if (!text) { target.textContent = ''; return }
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
    // Save questionnaire answers if we collected any before navigating
    if (likertAnswers.length > 0) {
      saveQuestionnaire('prae_fragebogen', [...likertAnswers])
      likertAnswers = []
    }

    // Save progress to NEXT node so returning doesn't re-trigger
    if (currentNode?.nextNodeId) {
      saveProgress({ currentChapter: slug, currentNodeId: currentNode.nextNodeId })
    } else {
      // No next node — save current node so we resume here (not restart from 0)
      saveProgress({ currentChapter: slug, currentNodeId: currentNode.nodeId })
    }

    const routes = {
      open_journal:       '#/journal',
      open_cave:          '#/cave',
      open_exercise:      '#/exercise',
      open_help:          '#/help',
      open_toolbox:       '#/toolbox',
      open_questionnaire: '#/questionnaire',
    }
    const route = routes[action]
    if (route) window.location.hash = route
  }

  function handleSceneEnd() {
    // Save collected questionnaire answers
    if (likertAnswers.length > 0) {
      saveQuestionnaire('prae_fragebogen', [...likertAnswers])
      likertAnswers = []
    }

    bubble.textContent = 'Szene beendet.'
    speakerLabel.style.display = 'none'
    choicesEl.innerHTML = ''
    choicesEl.style.display = 'none'
    likertEl.style.display = 'none'
    continueBtn.textContent = 'Zurück zur Übersicht'
    continueBtn.style.display = ''
    continueBtn.onclick = () => {
      window.location.hash = '#/chapters'
    }
  }

  function actionLabel(action) {
    const labels = {
      open_journal:       'Tagebuch öffnen',
      open_cave:          'Höhle öffnen',
      open_exercise:      'Übung starten',
      open_help:          'Hilfe anzeigen',
      open_toolbox:       'Schachtel öffnen',
      open_questionnaire: 'Fragebogen',
    }
    return labels[action] || 'Weiter'
  }

  // ── Init ─────────────────────────────────────────────────

  async function init() {
    let loadedNodes = null

    try {
      const scenes = await getDialogScene(slug)
      if (scenes && scenes.length > 0) {
        const scene = scenes[0]
        loadedNodes = scene.nodes
      }
    } catch (e) {
      console.warn('Strapi nicht erreichbar, nutze Demo-Daten:', e.message)
    }

    nodes = loadedNodes || DEMO_NODES
    loadingEl.style.display = 'none'
    contentEl.style.display = ''

    // Load username from settings
    const settings = await getSettings()
    if (settings.username) username = settings.username

    // Fortschritt laden → ggf. an letzter Stelle weitermachen
    const progress = await getProgress()
    const startId = (progress.currentChapter === slug && progress.currentNodeId > 0)
      ? progress.currentNodeId
      : nodes[0]?.nodeId || 1

    // Reveal tabs for all nodes up to the start point
    revealTabsForNode(startId)

    goToNode(startId)
  }

  contentEl.style.display = 'none'
  init()

  return el
}
