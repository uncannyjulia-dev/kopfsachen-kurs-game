// screens/SplashScreen.js
export function SplashScreen() {
  const el = document.createElement('div')
  el.className = 'screen'
  el.innerHTML = `
    <div class="screen-placeholder">
      <div class="icon">🐱</div>
      <h2>Splash / Ladescreen</h2>
      <p>Erster App-Start, Logo, Animations</p>
      <p style="font-size:12px;margin-top:8px;color:#aaa">→ screens/SplashScreen.js</p>
    </div>
  `
  return el
}
