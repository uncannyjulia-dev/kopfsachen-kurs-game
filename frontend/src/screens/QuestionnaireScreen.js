// screens/QuestionnaireScreen.js
export function QuestionnaireScreen() {
  const el = document.createElement('div')
  el.className = 'screen'
  el.innerHTML = `
    <div class="screen-placeholder">
      <div class="icon">📋</div>
      <h2>Fragebogen</h2>
      <p>Prä/Post, Likert-Skala, Toni-Dialog</p>
      <p style="font-size:12px;margin-top:8px;color:#aaa">→ screens/QuestionnaireScreen.js</p>
    </div>
  `
  return el
}
