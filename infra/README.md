# Infra – Setup-Anleitung

## Architektur

```
GitHub (main branch)
    │
    │  git push → GitHub Actions
    ▼
┌─────────────────────────────────┐
│  Build Job (ubuntu-latest)      │
│  • npm ci                       │
│  • vite build                   │
│    (mit STRAPI_URL + TOKEN)      │
└────────────┬────────────────────┘
             │ rsync /dist
             ▼
┌─────────────────────────────────┐
│  Hetzner VPS (NixOS)            │
│  • Nginx → /var/www/kopfsachen  │
│  • Let's Encrypt (ACME)         │
│  • SPA-Routing (try_files)      │
└─────────────────────────────────┘
             ▲ API-Calls (HTTPS)
             │
┌─────────────────────────────────┐
│  Strapi Cloud                   │
│  • Content API (read-only Token)│
│  • Media-Uploads (Assets)       │
│  • Admin für Organisation       │
└─────────────────────────────────┘
```

## Erstmaliges Server-Setup (einmalig)

### 1. Hetzner VPS erstellen
- Typ: **CX21** (2 vCPU, 4 GB RAM, ~6 €/Monat) reicht für den PoC
- OS: **NixOS 24.11** (im Hetzner-Marketplace verfügbar)
- SSH-Key beim Erstellen hinterlegen

### 2. Setup-Script ausführen
```bash
ssh root@DEINE_SERVER_IP
bash <(curl -s https://raw.githubusercontent.com/DEIN_USERNAME/kopfsachen/main/infra/setup-server.sh)
```

### 3. GitHub Actions SSH-Key generieren
```bash
# Lokal ausführen:
ssh-keygen -t ed25519 -C "github-actions-kopfsachen" -f ~/.ssh/kopfsachen_deploy

# Public Key anzeigen und in infra/nixos/configuration.nix eintragen:
cat ~/.ssh/kopfsachen_deploy.pub

# Private Key als GitHub Secret hinterlegen:
# → GitHub Repo → Settings → Secrets → SSH_PRIVATE_KEY
```

### 4. GitHub Secrets anlegen
Im GitHub-Repo unter **Settings → Secrets and variables → Actions**:

| Secret | Wert |
|--------|------|
| `SSH_PRIVATE_KEY` | Inhalt von `~/.ssh/kopfsachen_deploy` |
| `SERVER_HOST` | IP oder Hostname des VPS |
| `SERVER_USER` | `deploy` |
| `VITE_STRAPI_URL` | z.B. `https://kopfsachen.strapiapp.com` |
| `VITE_STRAPI_TOKEN` | Read-only API Token aus Strapi Cloud |

### 5. Domain einrichten
- DNS A-Record auf die VPS-IP zeigen lassen
- `kopfsachen.example.com` in `configuration.nix` ersetzen
- Commit pushen mit Nachricht `[nixos]` → löst NixOS-Rebuild aus

## Deployment-Workflow (täglich)

```bash
# Normales Frontend-Deployment:
git push origin main
# → GitHub Actions baut & deployed automatisch (~2-3 min)

# Mit NixOS-Config-Änderung:
git commit -m "feat: update nginx headers [nixos]"
git push origin main
# → Baut Frontend UND führt nixos-rebuild switch aus
```

## Lokale Entwicklung

```bash
# Frontend (Port 3000):
cd frontend && npm run dev

# Strapi lokal (Port 1337):
cd cms && npm run develop

# .env.local anlegen:
cp frontend/.env.example frontend/.env.local
# VITE_STRAPI_URL=http://localhost:1337 eintragen
```

## Strapi Cloud Setup

1. Account auf [cloud.strapi.io](https://cloud.strapi.io) anlegen
2. Neues Projekt aus dem `cms/` Ordner deployen
3. Read-only API Token generieren: **Settings → API Tokens → Create**
4. Token als `VITE_STRAPI_TOKEN` in GitHub Secrets hinterlegen
