// screens/HomeScreen.js
// Titelscreen – Start führt IMMER über Disclaimer (Hilfebedürftigkeitsabfrage).

export function HomeScreen() {
  const el = document.createElement('div')
  el.className = 'screen home-screen'

  el.innerHTML = `
    <div class="home-content">
      <div class="home-hero">
        <h1 class="home-title">Kopfsachen</h1>
        <p class="home-tagline">Dein Kurs für mentale Stärke</p>
      </div>
      <div class="home-actions">
        <button class="btn-primary home-start" type="button">Start</button>
        <button class="btn-secondary home-help" type="button">Hilfe</button>
      </div>
    </div>
  `

  // Start geht IMMER über Disclaimer (Hilfebedürftigkeitsabfrage)
  el.querySelector('.home-start').addEventListener('click', () => {
    window.location.hash = '#/disclaimer'
  })

  el.querySelector('.home-help').addEventListener('click', () => {
    window.location.hash = '#/help'
  })

  return el
}
