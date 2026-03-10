// app.js
// Einstiegspunkt. Registriert alle Routes und startet den Router.

import { Router }              from './router.js'
import { SplashScreen }        from './screens/SplashScreen.js'
import { HomeScreen }          from './screens/HomeScreen.js'
import { DisclaimerScreen }    from './screens/DisclaimerScreen.js'
import { ChaptersScreen }      from './screens/ChaptersScreen.js'
import { TimeCheckScreen }     from './screens/TimeCheckScreen.js'
import { NovelScreen }         from './screens/NovelScreen.js'
import { JournalScreen }       from './screens/JournalScreen.js'
import { CaveScreen }          from './screens/CaveScreen.js'
import { ExerciseScreen }      from './screens/ExerciseScreen.js'
import { ToolboxScreen }       from './screens/ToolboxScreen.js'
import { HelpScreen }          from './screens/HelpScreen.js'
import { QuestionnaireScreen } from './screens/QuestionnaireScreen.js'

const app    = document.getElementById('app')
const router = new Router(app)

router
  .on('/',               () => SplashScreen())
  .on('/home',           () => HomeScreen())
  .on('/disclaimer',     () => DisclaimerScreen())
  .on('/chapters',       () => ChaptersScreen())
  .on('/timecheck',      (path) => TimeCheckScreen(path))
  .on('/novel',          (path) => NovelScreen(path))
  .on('/journal',        (path) => JournalScreen(path))
  .on('/cave',           () => CaveScreen())
  .on('/exercise',       (path) => ExerciseScreen(path))
  .on('/toolbox',        () => ToolboxScreen())
  .on('/help',           () => HelpScreen())
  .on('/questionnaire',  (path) => QuestionnaireScreen(path))

// Dev-Navigationsleiste (nur in Entwicklung sichtbar)
if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
  mountDevNav(app, router)
}

router.start()

// ── Dev-Navigation ────────────────────────────────────────────
// Nur lokal sichtbar – zum schnellen Zwischen-Screens-Wechseln.
function mountDevNav(app, router) {
  const routes = [
    ['/', 'Splash'],
    ['/home', 'Home'],
    ['/disclaimer', 'Disclaimer'],
    ['/chapters', 'Kapitel'],
    ['/timecheck/intro', 'Zeit'],
    ['/novel/intro', 'Novel'],
    ['/journal', 'Journal'],
    ['/cave', 'Cave'],
    ['/exercise/1', 'Übung'],
    ['/toolbox', 'Schachtel'],
    ['/help', 'Hilfe'],
    ['/questionnaire', 'Fragebogen'],
  ]

  const nav = document.createElement('div')
  nav.style.cssText = `
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    background: rgba(28,25,23,0.95);
    display: flex;
    overflow-x: auto;
    gap: 2px;
    padding: 6px;
    z-index: 9999;
    -webkit-overflow-scrolling: touch;
  `

  routes.forEach(([path, label]) => {
    const btn = document.createElement('button')
    btn.textContent = label
    btn.style.cssText = `
      flex-shrink: 0;
      background: #374151;
      color: #fff;
      border: none;
      border-radius: 6px;
      padding: 4px 10px;
      font-size: 11px;
      cursor: pointer;
      white-space: nowrap;
    `
    btn.onclick = () => router.go(path)
    nav.appendChild(btn)
  })

  app.appendChild(nav)

  // Hauptbereich nach oben schieben damit Nav nicht überlappt
  app.style.paddingBottom = '40px'
}
