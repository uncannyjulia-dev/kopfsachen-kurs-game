// screens/HomeScreen.js
export function HomeScreen() {
  const el = document.createElement('div')
  el.className = 'screen'
  el.innerHTML = `
    <div class="screen-placeholder">
      <div class="icon">🏠</div>
      <h2>Home / Titelscreen</h2>
      <p>Start-Button, Hilfe-Link</p>
      <p style="font-size:12px;margin-top:8px;color:#aaa">→ screens/HomeScreen.js</p>
    </div>
  `
  return el
}
