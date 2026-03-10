// screens/HelpScreen.js
export function HelpScreen() {
  const el = document.createElement('div')
  el.className = 'screen'
  el.innerHTML = `
    <div class="screen-placeholder">
      <div class="icon">🆘</div>
      <h2>Hilfe & Krisenanlaufstellen</h2>
      <p>Krisenchat, JugendNotmail, Psychotherapie</p>
      <p style="font-size:12px;margin-top:8px;color:#aaa">→ screens/HelpScreen.js</p>
    </div>
  `
  return el
}
