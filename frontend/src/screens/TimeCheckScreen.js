// screens/TimeCheckScreen.js
export function TimeCheckScreen() {
  const el = document.createElement('div')
  el.className = 'screen'
  el.innerHTML = `
    <div class="screen-placeholder">
      <div class="icon">⏱️</div>
      <h2>Zeitabfrage</h2>
      <p>Hast du jetzt 45 Minuten Zeit?</p>
      <p style="font-size:12px;margin-top:8px;color:#aaa">→ screens/TimeCheckScreen.js</p>
    </div>
  `
  return el
}
