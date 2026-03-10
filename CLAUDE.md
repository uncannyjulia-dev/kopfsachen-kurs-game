# CLAUDE.md – Kopfsachen

Psychosoziale Präventions-App für Jugendliche (ab 16).
Verhaltenstherapeutische Übungen, emotionale Selbstwirksamkeit, 8 Einheiten à 45 min.

---

## Stack

| Was | Technologie |
|-----|-------------|
| Frontend | Vanilla JS + Vite (kein Framework) |
| CMS | Strapi Cloud (Schemas im Repo unter `cms/`) |
| Spielstand | IndexedDB via `src/store.js` (kein localStorage) |
| Styling | Reines CSS, Custom Properties in `styles/main.css` |
| Routing | Hash-Router in `src/router.js` |
| Hosting | Hetzner VPS (NixOS), Deploy via GitHub Actions |

---

## Projektstruktur

```
frontend/
├── index.html
├── vite.config.js
├── styles/main.css          ← Alle CSS-Variablen & globale Komponenten
└── src/
    ├── app.js               ← Einstiegspunkt, Router-Setup
    ├── router.js            ← Hash-basierter Router
    ├── api.js               ← Strapi Cloud Client (import.meta.env)
    ├── store.js             ← IndexedDB: Spielstand, Cave, Questionnaire
    └── screens/             ← Ein Screen = eine Datei
        ├── NovelScreen.js
        ├── JournalScreen.js
        ├── CaveScreen.js
        ├── ExerciseScreen.js
        └── ...

cms/src/
├── api/                     ← Strapi Content-Type Schemas (nicht anfassen)
└── components/              ← Strapi Komponenten-Schemas (nicht anfassen)
```

---

## Coding-Regeln

**Vanilla JS – kein Framework.**
Kein React, kein Vue, kein jQuery. Jeder Screen ist eine Funktion die ein `HTMLElement` zurückgibt.

```js
// ✅ Richtig
export function MyScreen() {
  const el = document.createElement('div')
  el.className = 'screen'
  el.innerHTML = `...`
  return el
}

// ❌ Falsch – kein JSX, keine Komponenten-Bibliotheken
```

**CSS Custom Properties verwenden.**
Farben, Abstände und Radii immer über Variablen aus `styles/main.css`:
```css
/* ✅ */
color: var(--accent);
padding: var(--space-md);

/* ❌ */
color: #7C3AED;
padding: 16px;
```

**Kein direktes DOM-Schreiben von Spielstand.**
Immer über `store.js`:
```js
import { saveProgress, getProgress } from '../store.js'
```

**API-Calls immer über `api.js`.**
Nie direkt `fetch()` mit Strapi-URL aufrufen.

---

## Screens

Jeder Screen:
- exportiert eine Funktion `export function XyzScreen()`
- gibt ein `div.screen` Element zurück
- ist in `src/screens/XyzScreen.js` definiert
- wird in `src/app.js` registriert

Aktuelle Screens und ihre Routes:

| Screen | Route | Status |
|--------|-------|--------|
| SplashScreen | `#/` | Stub |
| HomeScreen | `#/home` | Stub |
| ChaptersScreen | `#/chapters` | Stub |
| TimeCheckScreen | `#/timecheck` | Stub |
| NovelScreen | `#/novel` | Stub → als nächstes |
| JournalScreen | `#/journal` | Stub |
| CaveScreen | `#/cave` | Stub |
| ExerciseScreen | `#/exercise` | Stub |
| ToolboxScreen | `#/toolbox` | Stub |
| HelpScreen | `#/help` | Stub |
| QuestionnaireScreen | `#/questionnaire` | Stub |

---

## Dialog-Engine (NovelScreen)

Dialoge kommen als `DialogNode[]` aus Strapi. Jeder Node:

```js
{
  nodeId: 1,
  speaker: 'toni',        // toni | user | narrator | noen | furi
  text: 'Bist du Noen?',
  emotion: 'neutral',     // neutral | happy | sad | surprised | thinking
  nextNodeId: 2,          // null = Ende der Szene
  choices: [              // nur bei Verzweigungen
    { text: 'Ja!', nextNodeId: 3 },
    { text: 'Nein', nextNodeId: 4 }
  ]
}
```

- `speaker === 'user'` ohne `choices` → Weiter-Button
- `speaker === 'user'` mit `choices` → mehrere Buttons
- `nextNodeId === null` → Szene beendet, nächste Aktion auslösen

---

## Journal-Page Templates

JournalPages haben eine Dynamic Zone mit 6 Templates:

| Template-Key | Beschreibung |
|---|---|
| `text_only` | Nur Text (Noens Tagebuch) |
| `image_layout_a` | Bild links, Text rechts |
| `image_layout_b` | Vollbild-Hintergrund, Text oben |
| `exercise_embed` | Sticker → Übung starten |
| `audio_player` | Audio direkt im Buch |
| `video` | Video im Buch |

Der `JournalScreen` rendert je nach `page.template` das passende Layout.

---

## Sticker-Positionierung

Sticker auf Journal-Seiten nutzen Prozent-Koordinaten:

```js
// Aus Strapi:
{ x: 72, y: 35, scale: 0.8, rotation: 12, zIndex: 2 }

// CSS:
el.style.cssText = `
  position: absolute;
  left: ${sticker.x}%;
  top: ${sticker.y}%;
  transform: scale(${sticker.scale}) rotate(${sticker.rotation}deg);
  z-index: ${sticker.zIndex};
`
```

---

## Spielstand (IndexedDB)

```js
import { getProgress, saveProgress, getCave, saveCave } from '../store.js'

// Lesen
const progress = await getProgress()

// Schreiben
await saveProgress({
  currentChapter: 'kapitel-1',
  currentNodeId: 5,
  completedChapters: ['intro']
})
```

---

## Lokale Entwicklung

```bash
cd frontend
cp .env.example .env.local
# VITE_STRAPI_URL=http://localhost:1337 eintragen
npm install
npm run dev    # localhost:3000
```

Im Browser ist bei `localhost` eine Dev-Navigationsleiste sichtbar (alle Screens direkt anklickbar).

---

## Deployment

```bash
git push origin main
# → GitHub Actions baut Vite und deployt via rsync auf Hetzner
# → NixOS-Rebuild nur wenn Commit "[nixos]" enthält
```

---

## Infrastruktur (NixOS)

```
infra/
├── nixos/
│   ├── configuration.nix   ← Nginx, ACME/Let's Encrypt, deploy-User, Firewall
│   └── flake.nix           ← NixOS 24.11 Flake
├── setup-server.sh         ← Einmaliges Setup auf frischem Hetzner VPS
└── README.md               ← Schritt-für-Schritt Anleitung
```

**Einmaliges Server-Setup:**
```bash
ssh root@HETZNER_IP
bash <(curl -s https://raw.githubusercontent.com/DEIN_USERNAME/kopfsachen/main/infra/setup-server.sh)
```

**NixOS-Config ändern:**
```bash
# Änderung committen mit [nixos] im Message:
git commit -m "feat: update nginx headers [nixos]"
git push
# → GitHub Actions führt nixos-rebuild switch aus
```

**Wichtige Anpassungen vor erstem Deploy** (in `infra/nixos/configuration.nix`):
- Domain ersetzen: `kopfsachen.example.com` → echte Domain
- E-Mail für ACME: `deine@email.de` → echte E-Mail
- SSH Public Key des GitHub Actions Runners eintragen

---

## Was noch fehlt / Prioritäten

1. **NovelScreen** – Dialog-Engine implementieren (höchste Priorität)
2. **JournalScreen** – 6 Templates rendern
3. **CaveScreen** – Asset-Karussell + Spielstand speichern
4. **ExerciseScreen** – Audio-Player mit ±10s
5. **ChaptersScreen** – Kapitel laden, Freischalten, Fortschritt
6. **SplashScreen / HomeScreen** – Onboarding-Flow
7. **QuestionnaireScreen** – Likert-Skala, in Dialog eingebettet
