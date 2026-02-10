---
title: Deploy Manual de Lambdas via Shell Script
---

# Deploy Manual de Lambdas via Shell Script

Este documento descreve o **processo oficial e atual de deploy de Lambdas na B4You**, realizado exclusivamente via **shell script**.

⚠️ **Não existe CI/CD automatizado no momento.**  
Este script é a **única forma suportada de deploy**.

---

## 1. Quando usar este script

Este script deve ser utilizado **sempre que for necessário realizar deploy de uma Lambda**, seja para:

- Nova funcionalidade
- Correção de bug
- Ajuste operacional
- Manutenção emergencial

---

## 2. Pré-requisitos

Antes de executar o script, verifique:

- Node.js instalado
- AWS CLI instalada
- Credenciais AWS configuradas
- Permissão para `lambda:UpdateFunctionCode`
- Acesso ao repositório da Lambda

---

## 3. Permissão de Execução

Conceda permissão de execução ao script:

```bash
chmod +x deploy.sh
```

---

## 4. Uso do Script

### 4.1 Sintaxe

```bash
./deploy.sh [--env production|sandbox] [--region sa-east-1] [--profile default]
```

---

### 4.2 Parâmetros Suportados

| Parâmetro   | Descrição                                             | Default     |
|------------|---------------------------------------------------------|-------------|
| `--env`     | Ambiente alvo (`production` ou `sandbox`)              | production  |
| `--region`  | Região AWS                                             | sa-east-1   |
| `--profile` | Perfil AWS CLI (opcional)                              | padrão      |

---

## 5. Mapeamento de Ambientes

| Ambiente   | Nome da Função AWS                          |
|-----------|----------------------------------------------|
| production | `b4you-production-sales-metrics-hourly`      |
| sandbox    | `b4you-sandbox-sales-metrics-hourly`         |

Ambientes inválidos interrompem o script imediatamente.

---

## 6. O que o script executa

### Fluxo interno:

1. Limpa artefatos antigos
2. Instala dependências de produção
3. Gera o pacote ZIP da Lambda
4. Remove arquivos desnecessários
5. Atualiza o código da função
6. Aguarda finalização do deploy
7. Exibe resumo do processo

---

## 7. Boas Práticas Obrigatórias

- Executar primeiro em **sandbox**
- Validar logs no CloudWatch
- Não pular etapas
- Não alterar manualmente o código no console AWS
- Registrar o deploy no ticket ou PR

---

## 8. Troubleshooting

### Erro: AccessDeniedException
- Verifique permissões IAM
- Confirme o profile AWS ativo

### Erro: ResourceNotFoundException
- Verifique o nome da função
- Confirme o ambiente informado

### Deploy aparentemente bem-sucedido, mas sem efeito
- Confirme conteúdo do ZIP
- Verifique se o código foi alterado
- Analise logs da Lambda

---

## 9. Observações Finais

- O script utiliza `set -euo pipefail`
- Qualquer erro aborta o deploy
- Não há rollback automático

🚧 **Rollback deve ser feito manualmente** (novo deploy com código anterior).

---

> ⚠️ Deploy em produção deve ser feito com extrema cautela.  
> Até a implementação do CI/CD, este processo é crítico.