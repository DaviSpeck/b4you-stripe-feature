#!/bin/bash

# usar primeiro -> chmod +x deploy.sh
# depois -> ./deploy.sh
# nao esquecer de subir o lambda primeiro 

set -e  # Para o script falhar se algum comando falhar

echo "1 - Construindo a imagem Docker..."
docker build -t blingtracking -f Dockerfile . --no-cache

echo "2 - Tagging da imagem..."
docker tag blingtracking:latest 493067706051.dkr.ecr.sa-east-1.amazonaws.com/blingtracking:latest

echo "3 - Realizando login no ECR..."
aws ecr get-login-password --region sa-east-1 | docker login --username AWS --password-stdin 493067706051.dkr.ecr.sa-east-1.amazonaws.com

echo "4 - Enviando a imagem para o ECR..."
docker push 493067706051.dkr.ecr.sa-east-1.amazonaws.com/blingtracking:latest

echo "Implantação concluída com sucesso!"
