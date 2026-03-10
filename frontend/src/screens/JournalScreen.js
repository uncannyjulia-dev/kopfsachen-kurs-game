// screens/JournalScreen.js
export function JournalScreen() {
  const el = document.createElement('div')
  el.className = 'screen'
  el.innerHTML = `
    <div class="screen-placeholder">
      <div class="icon">📖</div>
      <h2>Notizbuch / Journal</h2>
      <p>Doppelseite, blätterbar, Noens Texte</p>
      <p style="font-size:12px;margin-top:8px;color:#aaa">→ screens/JournalScreen.js</p>
    </div>
  `
  return el
}
