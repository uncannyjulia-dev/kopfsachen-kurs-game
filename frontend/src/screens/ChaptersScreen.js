// screens/ChaptersScreen.js
export function ChaptersScreen() {
  const el = document.createElement('div')
  el.className = 'screen'
  el.innerHTML = `
    <div class="screen-placeholder">
      <div class="icon">📚</div>
      <h2>Kapitelauswahl</h2>
      <p>Linearer Kursverlauf, Freischalten, Fortschritt</p>
      <p style="font-size:12px;margin-top:8px;color:#aaa">→ screens/ChaptersScreen.js</p>
    </div>
  `
  return el
}
