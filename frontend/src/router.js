// router.js
// Einfacher Hash-basierter Router.
// Navigation: router.go('/novel') oder <a href="#/novel">
// Kein Build-Step, keine Abhängigkeiten.

export class Router {
  #routes = {}
  #currentScreen = null
  #app = null

  constructor(appElement) {
    this.#app = appElement
    window.addEventListener('hashchange', () => this.#resolve())
  }


  // Route registrieren: router.on('/novel', NovelScreen)
  on(path, screenFn) {
    this.#routes[path] = screenFn
    return this
  }

  // Programmatisch navigieren
  go(path) {
    window.location.hash = path
  }

  // Zurück
  back() {
    history.back()
  }

  // Initialen Route auflösen
  start() {
    this.#resolve()
  }

  #resolve() {
    const hash = window.location.hash.replace('#', '') || '/'
    
    // Exakter Match zuerst
    let screenFn = this.#routes[hash]

    // Dann Prefix-Match (z.B. /chapter/1 → /chapter/:id)
    if (!screenFn) {
      for (const [pattern, fn] of Object.entries(this.#routes)) {
        if (hash.startsWith(pattern) && pattern !== '/') {
          screenFn = fn
          break
        }
      }
    }

    // Fallback: 404 → Home
    if (!screenFn) {
      screenFn = this.#routes['/'] || (() => '<div class="screen"><p>404</p></div>')
    }

    this.#render(screenFn, hash)
  }

  #render(screenFn, path) {
    // Alten Screen entfernen
    if (this.#currentScreen) {
      this.#currentScreen.remove()
    }

    // Neuen Screen mounten
    const el = screenFn(path)
    el.classList.add('screen-enter')
    this.#app.appendChild(el)
    this.#currentScreen = el
  }
}
