#!/usr/bin/env bash
# infra/setup-server.sh
#
# Einmaliges Setup-Script für einen frischen Hetzner-VPS.
# Voraussetzung: NixOS ISO beim Erstellen des Servers gewählt.
#
# Ausführen als root auf dem frischen Server:
#   bash setup-server.sh

set -euo pipefail

echo "==> Kopfsachen Server Setup"

# 1. NixOS-Konfiguration aus dem Repo holen
REPO_URL="https://github.com/DEIN_USERNAME/kopfsachen.git"  # Anpassen!

if [ ! -d "/etc/nixos/.git" ]; then
  echo "==> Klone Repo nach /etc/nixos ..."
  git clone "$REPO_URL" /tmp/kopfsachen
  cp -r /tmp/kopfsachen/infra/nixos/* /etc/nixos/
else
  echo "==> Repo bereits vorhanden, update ..."
  cd /etc/nixos && git pull
fi

# 2. Flakes aktivieren (falls noch nicht)
if ! grep -q "experimental-features" /etc/nixos/configuration.nix 2>/dev/null; then
  cat >> /etc/nixos/configuration.nix << 'EOF'
  nix.settings.experimental-features = [ "nix-command" "flakes" ];
EOF
fi

# 3. Sudo-Rechte für deploy-User einrichten (für nixos-rebuild)
cat > /etc/sudoers.d/deploy << 'EOF'
deploy ALL=(root) NOPASSWD: /run/current-system/sw/bin/nixos-rebuild
EOF
chmod 440 /etc/sudoers.d/deploy

# 4. NixOS bauen
echo "==> Baue NixOS-Konfiguration ..."
nixos-rebuild switch --flake /etc/nixos#kopfsachen

echo ""
echo "✅ Server-Setup abgeschlossen."
echo ""
echo "Nächste Schritte:"
echo "  1. SSH Public Key des GitHub Actions Runners in configuration.nix eintragen"
echo "  2. Domain in configuration.nix anpassen (kopfsachen.example.com)"
echo "  3. E-Mail für ACME/Let's Encrypt anpassen"
echo "  4. nixos-rebuild switch erneut ausführen"
