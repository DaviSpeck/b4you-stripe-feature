#!/bin/bash

# usar primeiro -> chmod +x deploy.sh
# depois -> ./deploy.sh --env production|sandbox

set -euo pipefail

ZIP_FILE="exportSalesShipping.zip"
AWS_REGION="sa-east-1"
AWS_PROFILE=""
ENVIRONMENT="production"

usage() {
  cat <<'EOF'
Uso: ./deploy.sh [--env production|sandbox] [--region sa-east-1] [--profile default]

  --env       Ambiente alvo do deploy (production ou sandbox). Default: production
  --region    Região AWS. Default: sa-east-1
  --profile   Perfil de credenciais AWS (opcional)
  -h, --help  Mostra esta ajuda
EOF
}

while [[ $# -gt 0 ]]; do
  case "$1" in
    --env)
      shift
      ENVIRONMENT="${1:-}"
      ;;
    --region)
      shift
      AWS_REGION="${1:-}"
      ;;
    --profile)
      shift
      AWS_PROFILE="--profile ${1:-}"
      ;;
    -h|--help)
      usage
      exit 0
      ;;
    *)
      echo "Argumento desconhecido: $1"
      usage
      exit 1
      ;;
  esac
  shift
done

case "$ENVIRONMENT" in
  production|prod)
    FUNCTION_NAME="b4you-production-exportSalesShipping"
    ;;
  sandbox|sbx|staging)
    FUNCTION_NAME="b4you-sandbox-exportSalesShipping"
    ;;
  *)
    echo "Ambiente inválido: $ENVIRONMENT"
    echo "Use --env production ou --env sandbox"
    exit 1
    ;;
esac

echo "=========================================="
echo "Deploy do Lambda exportSalesShipping ($ENVIRONMENT)"
echo "=========================================="

echo ""
echo "1 - Limpando arquivos anteriores..."
rm -f "$ZIP_FILE"

echo ""
echo "2 - Instalando dependências de produção..."
npm ci --production --ignore-scripts

echo ""
echo "3 - Criando arquivo ZIP..."
zip -r "$ZIP_FILE" . \
  -x "*.git*" \
  -x "deploy.sh" \
  -x "*.zip" \
  -x "Dockerfile" \
  -x "*.md" \
  -x "*.backup"

echo ""
echo "4 - Fazendo upload do código para a Lambda..."
aws lambda update-function-code \
  --function-name "$FUNCTION_NAME" \
  --zip-file "fileb://$ZIP_FILE" \
  --region "$AWS_REGION" \
  $AWS_PROFILE

echo ""
echo "5 - Aguardando a função ser atualizada..."
aws lambda wait function-updated \
  --function-name "$FUNCTION_NAME" \
  --region "$AWS_REGION" \
  $AWS_PROFILE

echo ""
echo "=========================================="
echo "✓ Deploy concluído com sucesso!"
echo "=========================================="
echo ""
echo "Função: $FUNCTION_NAME"
echo "Ambiente: $ENVIRONMENT"
echo "Região: $AWS_REGION"
echo "Arquivo: $ZIP_FILE"
echo ""

