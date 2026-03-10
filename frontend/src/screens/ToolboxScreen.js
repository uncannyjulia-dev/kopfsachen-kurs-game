// screens/ToolboxScreen.js
export function ToolboxScreen() {
  const el = document.createElement('div')
  el.className = 'screen'
  el.innerHTML = `
    <div class="screen-placeholder">
      <div class="icon">🧰</div>
      <h2>Schachtel / Toolbox</h2>
      <p>Übungs-Bibliothek nach Kategorien</p>
      <p style="font-size:12px;margin-top:8px;color:#aaa">→ screens/ToolboxScreen.js</p>
    </div>
  `
  return el
}
