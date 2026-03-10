// screens/CaveScreen.js
export function CaveScreen() {
  const el = document.createElement('div')
  el.className = 'screen'
  el.innerHTML = `
    <div class="screen-placeholder">
      <div class="icon">🌿</div>
      <h2>Innerer sicherer Ort (Cave)</h2>
      <p>Hintergründe, Sticker, Atmo – Customizer</p>
      <p style="font-size:12px;margin-top:8px;color:#aaa">→ screens/CaveScreen.js</p>
    </div>
  `
  return el
}
