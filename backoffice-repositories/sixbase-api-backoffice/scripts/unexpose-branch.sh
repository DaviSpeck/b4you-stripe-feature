#!/bin/bash
set -euo pipefail
DOMAIN="${1:-}"
if [[ -z "$DOMAIN" ]]; then echo "Uso: $0 <dominio>"; exit 1; fi
sudo rm -f "/etc/nginx/sites-enabled/${DOMAIN}.conf"
sudo rm -f "/etc/nginx/sites-available/${DOMAIN}.conf"
sudo nginx -t
sudo systemctl reload nginx
echo "Removido ${DOMAIN}."