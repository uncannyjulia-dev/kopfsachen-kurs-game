// screens/ExerciseScreen.js
export function ExerciseScreen() {
  const el = document.createElement('div')
  el.className = 'screen'
  el.innerHTML = `
    <div class="screen-placeholder">
      <div class="icon">🎧</div>
      <h2>Übung</h2>
      <p>Audio-Player, ±10s, Abschluss-Bewertung</p>
      <p style="font-size:12px;margin-top:8px;color:#aaa">→ screens/ExerciseScreen.js</p>
    </div>
  `
  return el
}
