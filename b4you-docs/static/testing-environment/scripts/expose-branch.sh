#!/bin/bash
set -euo pipefail

DOMAIN="${1:-}"
if [[ -z "$DOMAIN" ]]; then
  echo "Uso: $0 <dominio>   ex.: $0 feat-upsell.b4you-sandbox.com.br"
  exit 1
fi

BRANCH_NAME="$(git rev-parse --abbrev-ref HEAD | tr '/' '-')"
HASH="$(echo -n "$BRANCH_NAME" | cksum | cut -f1 -d' ')"
API_PORT=$((5500 + (HASH % 1000)))

CONF_PATH="/etc/nginx/sites-available/${DOMAIN}.conf"
LINK_PATH="/etc/nginx/sites-enabled/${DOMAIN}.conf"

echo "Expondo '$BRANCH_NAME' em '${DOMAIN}' → 127.0.0.1:${API_PORT}"

sudo tee "$CONF_PATH" >/dev/null <<EOF
server {
    listen 80;
    server_name ${DOMAIN};

    # Opcional: se precisar upload maior
    # client_max_body_size 20m;

    location / {
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_pass http://127.0.0.1:${API_PORT};
    }

    # Healthcheck útil para CLB/Cloudflare checks (se tiver rota)
    location /healthcheck {
        proxy_pass http://127.0.0.1:${API_PORT}/healthcheck;
    }
}
EOF

sudo ln -sf "$CONF_PATH" "$LINK_PATH"
sudo nginx -t
sudo systemctl reload nginx

echo "OK: ${DOMAIN} ativo (Cloudflare faz HTTPS → origem HTTP:80)."