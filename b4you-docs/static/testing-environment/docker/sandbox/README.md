# 1) O que você precisa **uma vez só**

1. **Pacotes & permissões**

```bash
sudo apt update && sudo apt install -y git docker.io docker-compose nginx
sudo usermod -aG docker $USER
newgrp docker
```

2. **Segurança do EC2**

* Security Group deve permitir **80/TCP** (HTTP) de `0.0.0.0/0`.

  > (Não precisa 443, o TLS termina no Cloudflare.)

3. **Cloudflare (seu domínio novo)**

* Em **DNS → Records**, crie um **A** para cada subdomínio que quiser expor:

  * `feat-upsell.sandbox.seudominio.com` → **IP público da EC2**
  * `fix-login.sandbox.seudominio.com` → **IP público da EC2**
* Ative a **nuvem laranja (Proxy)** nesses A-records.
* Em **SSL/TLS → Overview**:

  * Se **não** for instalar certificado de origem no NGINX: selecione **Flexible**.
  * (Opcional, mais seguro) Se quiser criptografia até a origem, gere um **Cloudflare Origin Cert** e use **Full (strict)** mais tarde.

---

# 2) Scripts (na raiz do repo)

## 2.1 `scripts/sandbox.sh` - sobe/atualiza/derruba a branch

> Congela o código em uma imagem por branch e usa portas estáveis por branch (derivadas do nome).

```bash
#!/bin/bash
set -euo pipefail

# Caminhos
REPO_ROOT="$(git rev-parse --show-toplevel)"
COMPOSE_FILE="$REPO_ROOT/docker/sandbox/docker-compose.yml"
DOCKERFILE="$REPO_ROOT/docker/sandbox/Dockerfile.sandbox"

# Descobre a branch atual (sanitiza / -> -)
BRANCH_NAME="$(git rev-parse --abbrev-ref HEAD | tr '/' '-' | tr '[:upper:]' '[:lower:]')"

# Gera portas estáveis por branch (base + hash % 1000)
HASH="$(echo -n "$BRANCH_NAME" | cksum | cut -f1 -d' ')"
API_PORT=$((5500 + (HASH % 1000)))
REDIS_PORT=6380

cmd="${1:-up}"  # up | rebuild | stop | rm | logs | ps | redis

echo "Branch: $BRANCH_NAME"
echo "API_PORT:  $API_PORT"
echo "REDIS_PORT:$REDIS_PORT"
echo "Comando: $cmd"

PROJECT="sixbase-${BRANCH_NAME}"

case "$cmd" in
  up|rebuild)
    # Build imagem única por branch
    docker build -f "$DOCKERFILE" -t "sixbase-api:$BRANCH_NAME" "$REPO_ROOT"

    # Sobe/atualiza containers dessa branch (apenas API, sem Redis)
    BRANCH_NAME="$BRANCH_NAME" PORT="$API_PORT" REDIS_PORT="$REDIS_PORT" \
      docker compose -p "$PROJECT" -f "$COMPOSE_FILE" up -d --build api
    ;;

  stop)
    BRANCH_NAME="$BRANCH_NAME" PORT="$API_PORT" REDIS_PORT="$REDIS_PORT" \
      docker compose -p "$PROJECT" -f "$COMPOSE_FILE" down
    ;;

  rm)
    BRANCH_NAME="$BRANCH_NAME" PORT="$API_PORT" REDIS_PORT="$REDIS_PORT" \
      docker compose -p "$PROJECT" -f "$COMPOSE_FILE" down --rmi local --volumes
    docker rmi -f "sixbase-api:$BRANCH_NAME" || true
    ;;

  logs)
    docker compose -p "$PROJECT" -f "$COMPOSE_FILE" logs -f api
    ;;

  ps)
    docker compose -p "$PROJECT" -f "$COMPOSE_FILE" ps
    ;;

  redis)
    echo "🔗 Criando rede compartilhada sixbase-net (se não existir)..."
    docker network create sixbase-net || true

    echo "🚀 Subindo Redis global na porta $REDIS_PORT..."
    docker rm -f sixbase-redis 2>/dev/null || true
    docker run -d \
        --name sixbase-redis \
        --network sixbase-net \
        -p ${REDIS_PORT}:${REDIS_PORT} \
        redis:7-alpine redis-server --port ${REDIS_PORT}
    ;;

  *)
    echo "Uso: $0 [up|rebuild|stop|rm|logs|ps|redis]"
    exit 1
    ;;
esac

echo "✅ Done."
```

```bash
chmod +x scripts/sandbox.sh
```

## 2.2 `scripts/expose-branch.sh` - cria/atualiza o host no NGINX (sem Certbot)

> Recebe o **domínio que você já criou no Cloudflare** e aponta para a porta da branch.

```bash
#!/bin/bash
set -euo pipefail

DOMAIN="${1:-}"
if [[ -z "$DOMAIN" ]]; then
  echo "Uso: $0 <dominio>   ex.: $0 feat-upsell.sandbox.seudominio.com"
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
```

```bash
chmod +x scripts/expose-branch.sh
```

## 2.3 (Opcional) `scripts/unexpose-branch.sh` - remover host do NGINX

```bash
#!/bin/bash
set -euo pipefail
DOMAIN="${1:-}"
if [[ -z "$DOMAIN" ]]; then echo "Uso: $0 <dominio>"; exit 1; fi
sudo rm -f "/etc/nginx/sites-enabled/${DOMAIN}.conf"
sudo rm -f "/etc/nginx/sites-available/${DOMAIN}.conf"
sudo nginx -t
sudo systemctl reload nginx
echo "Removido ${DOMAIN}."
```

```bash
chmod +x scripts/unexpose-branch.sh
```

---

# 3) Operação do dia-a-dia

## 3.1 Subir **uma branch** (primeira vez)

```bash
git checkout <sua-branch>
git pull
./scripts/sandbox.sh up
./scripts/expose-branch.sh <subdominio-no-cloudflare>   # ex.: feat-upsell.sandbox.seudominio.com
```

* A API dessa branch ficará acessível em:
  `https://<subdominio-no-cloudflare>` (TLS no Cloudflare → origem HTTP:80)

## 3.2 Atualizar a **mesma branch** (novos commits)

```bash
git checkout <sua-branch>
git pull
./scripts/sandbox.sh rebuild
# (NGINX não muda: a porta da branch é estável pelo hash)
```

## 3.3 Subir **várias branches em paralelo**

Repita o 3.1 para cada branch, usando **subdomínios diferentes** no Cloudflare.

* Ex.:

  * `feat-upsell.sandbox.seudominio.com` → porta 56xx-A
  * `fix-login.sandbox.seudominio.com` → porta 56xx-B

## 3.4 Ver status / logs

```bash
./scripts/sandbox.sh ps
./scripts/sandbox.sh logs
```

## 3.5 Desligar **uma branch**

* **Parar** (mantém imagem/volumes):

```bash
git checkout <sua-branch>
./scripts/sandbox.sh stop
```

* **Remover tudo** (containers, volumes e imagem):

```bash
git checkout <sua-branch>
./scripts/sandbox.sh rm
```

* **Remover host do NGINX** (se não for mais expor o domínio):

```bash
./scripts/unexpose-branch.sh <subdominio-no-cloudflare>
```

---

# 4) Notas importantes

* **Nada de Certbot aqui**: o Cloudflare termina o TLS. O NGINX só precisa responder em **80**.
* **CORS**: garanta que seu backend permita `Origin` dos domínios de preview da Vercel e dos subdomínios do seu sandbox.
* **Real IP (opcional)**: se quiser IP real do cliente nos logs, configure `real_ip_header CF-Connecting-IP` + `set_real_ip_from` para os ranges do Cloudflare (pode ser feito depois).
* **Redis**: não precisa expor porta externamente; o compose já isola a rede.

Pronto. Com isso você tem um fluxo enxuto: **Cloudflare cuida do HTTPS e DNS**, e você só **sobe/atualiza/desliga** ambientes por branch com dois scripts e um NGINX simples.
