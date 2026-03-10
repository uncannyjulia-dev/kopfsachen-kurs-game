// screens/HelpScreen.js
// Hilfe & Krisenanlaufstellen.

import { getHelpResources } from '../api.js'

const DEMO_RESOURCES = [
  {
    id: 1,
    name: 'Krisenchat',
    description: 'Kostenlose Krisenberatung per Chat für junge Menschen unter 25.',
    availability: '24/7',
    phone: null,
    url: 'https://krisenchat.de',
  },
  {
    id: 2,
    name: 'Telefonseelsorge',
    description: 'Telefonische Beratung bei Sorgen, Krisen und Suizidgedanken.',
    availability: '24/7',
    phone: '0800 111 0 111',
    url: 'https://online.telefonseelsorge.de',
  },
  {
    id: 3,
    name: 'JugendNotmail',
    description: 'Online-Beratung per E-Mail für Kinder und Jugendliche.',
    availability: 'Mo–Fr',
    phone: null,
    url: 'https://www.jugendnotmail.de',
  },
  {
    id: 4,
    name: 'Nummer gegen Kummer',
    description: 'Beratung für Kinder, Jugendliche und Eltern.',
    availability: 'Mo–Sa 14–20 Uhr',
    phone: '116 111',
    url: 'https://www.nummergegenkummer.de',
  },
]

export function HelpScreen() {
  const el = document.createElement('div')
  el.className = 'screen help-screen'

  el.innerHTML = `
    <div class="topbar">
      <button class="btn-menu help-back" type="button">&#8592;</button>
      <h1 class="help-heading">Hilfe</h1>
      <div style="width:44px"></div>
    </div>
    <div class="help-intro">
      <p>Du bist nicht allein. Hier findest du Anlaufstellen, die dir weiterhelfen können.</p>
    </div>
    <div class="help-list"></div>
    <div class="help-loading">Lade Anlaufstellen …</div>
  `

  const listEl = el.querySelector('.help-list')
  const loadingEl = el.querySelector('.help-loading')

  el.querySelector('.help-back').addEventListener('click', () => {
    history.back()
  })

  async function init() {
    let resources = null
    try {
      resources = await getHelpResources()
    } catch (e) {
      console.warn('Strapi nicht erreichbar, nutze Demo-Daten:', e.message)
    }

    resources = resources || DEMO_RESOURCES
    loadingEl.style.display = 'none'

    resources.forEach(r => {
      const card = document.createElement('div')
      card.className = 'help-card'

      card.innerHTML = `
        <h3 class="help-card-name">${r.name}</h3>
        <p class="help-card-desc">${r.description}</p>
        ${r.availability ? `<span class="help-card-avail">${r.availability}</span>` : ''}
        <div class="help-card-actions">
          ${r.phone ? `<a href="tel:${r.phone.replace(/\s/g, '')}" class="btn-primary help-card-phone">${r.phone}</a>` : ''}
          ${r.url ? `<a href="${r.url}" target="_blank" rel="noopener" class="btn-secondary help-card-link">Website</a>` : ''}
        </div>
      `

      listEl.appendChild(card)
    })
  }

  init()
  return el
}
