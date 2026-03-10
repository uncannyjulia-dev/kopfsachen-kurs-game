// screens/NovelScreen.js
export function NovelScreen() {
  const el = document.createElement('div')
  el.className = 'screen'
  el.innerHTML = `
    <div class="screen-placeholder">
      <div class="icon">💬</div>
      <h2>Novel Screen</h2>
      <p>Toni + Sprechblase + Hintergrund + Dialoge</p>
      <p style="font-size:12px;margin-top:8px;color:#aaa">→ screens/NovelScreen.js</p>
    </div>
  `
  return el
}
