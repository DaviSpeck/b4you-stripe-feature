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
API_PORT="${API_PORT:-$((5500 + (HASH % 1000)))}"
REDIS_PORT="${REDIS_PORT:-6380}"

cmd="${1:-up}"  # up | rebuild | stop | rm | logs | ps | redis

echo "Branch: $BRANCH_NAME"
echo "API_PORT:  $API_PORT"
echo "REDIS_PORT:$REDIS_PORT"
echo "Comando: $cmd"

# Aqui deve mudar o sixbase se for um projeto diferente
PROJECT="sixbase-${BRANCH_NAME}"

case "$cmd" in
  up|rebuild)
    # Build imagem única por branch (o sixbase-api deve mudar para projeto diferente e seguir o mesmo inserido em docker-compose.yml)
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
    # O sixbase-api deve mudar para projeto diferente e seguir o mesmo inserido em docker-compose.yml
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