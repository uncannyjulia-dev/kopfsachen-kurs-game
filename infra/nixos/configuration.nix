# infra/nixos/configuration.nix
#
# NixOS-Konfiguration für den Kopfsachen-Frontend-Server (Hetzner VPS).
# Nginx served den statischen React-Build.
# Strapi läuft extern auf Strapi Cloud.
#
# Deployment: GitHub Actions kopiert den Build via rsync und führt
# nixos-rebuild switch --flake .#kopfsachen aus.

{ config, pkgs, ... }:

{
  # ── System ──────────────────────────────────────────────────────────
  system.stateVersion = "24.11";
  networking.hostName = "kopfsachen";
  time.timeZone = "Europe/Berlin";
  i18n.defaultLocale = "de_DE.UTF-8";

  # ── Netzwerk ────────────────────────────────────────────────────────
  networking.firewall = {
    enable = true;
    allowedTCPPorts = [ 22 80 443 ];
  };

  # ── SSH ─────────────────────────────────────────────────────────────
  services.openssh = {
    enable = true;
    settings = {
      PasswordAuthentication = false;
      PermitRootLogin = "no";
    };
  };

  # Deploy-User – GitHub Actions deployed als dieser User
  users.users.deploy = {
    isNormalUser = true;
    extraGroups = [ "nginx" ];
    openssh.authorizedKeys.keys = [
      # GitHub Actions SSH Public Key hier eintragen:
      # "ssh-ed25519 AAAAC3... github-actions-kopfsachen"
    ];
  };

  # ── Nginx ────────────────────────────────────────────────────────────
  services.nginx = {
    enable = true;

    recommendedGzipSettings  = true;
    recommendedOptimisation  = true;
    recommendedProxySettings = true;
    recommendedTlsSettings   = true;

    virtualHosts."kopfsachen.example.com" = {
      # ACME / Let's Encrypt – Domain anpassen
      enableACME = true;
      forceSSL   = true;

      root = "/var/www/kopfsachen";

      # SPA-Routing: alle Pfade → index.html
      locations."/" = {
        tryFiles = "$uri $uri/ /index.html";
        extraConfig = ''
          # Cache statische Assets aggressiv
          location ~* \.(js|css|woff2|png|jpg|svg|ico)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
          }
        '';
      };

      # Security Headers
      extraConfig = ''
        add_header X-Frame-Options "SAMEORIGIN" always;
        add_header X-Content-Type-Options "nosniff" always;
        add_header Referrer-Policy "strict-origin-when-cross-origin" always;
        add_header Permissions-Policy "camera=(), microphone=(), geolocation=()" always;
        add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https://*.strapiapp.com;" always;
      '';
    };
  };

  # ACME-Zertifikate
  security.acme = {
    acceptTerms = true;
    defaults.email = "deine@email.de";  # Anpassen
  };

  # Web-Root: GitHub Actions legt hier den React-Build ab
  systemd.tmpfiles.rules = [
    "d /var/www/kopfsachen 0755 deploy nginx -"
  ];

  # ── Packages ─────────────────────────────────────────────────────────
  environment.systemPackages = with pkgs; [
    git
    rsync
    curl
    htop
  ];
}
