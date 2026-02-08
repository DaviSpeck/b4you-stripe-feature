# B4You Lambdas

[![Tests](https://img.shields.io/badge/tests-81%20passing-brightgreen)](.)
[![Vitest](https://img.shields.io/badge/vitest-1.6.1-green)](https://vitest.dev/)
[![Node](https://img.shields.io/badge/node-%3E%3D18.x-brightgreen)](https://nodejs.org/)
[![License](https://img.shields.io/badge/license-ISC-blue)](.)

Este repositório contém funções AWS Lambda para a plataforma B4You, organizadas por linguagem (JavaScript e Go).

### 📊 Estatísticas do Projeto

- 🎯 **55+ Lambdas** JavaScript
- 🧪 **81 Testes** automatizados
- ⚡ **~1.2s** tempo médio de execução dos testes
- 🔄 **100%** dos testes passando

## 📑 Índice

- [Tecnologias Utilizadas](#-tecnologias-utilizadas)
- [Quick Start](#-quick-start)
- [Estrutura do Projeto](#estrutura-do-projeto)
- [Configuração do Ambiente](#️-configuração-do-ambiente-de-desenvolvimento)
- [Testes](#-testes)
- [Práticas de Desenvolvimento](#práticas-de-desenvolvimento)
- [Scripts Disponíveis](#-scripts-disponíveis)
- [Variáveis de Ambiente](#variáveis-de-ambiente)
- [Deploy](#deploy)
- [Contribuindo](#contribuindo)

## ⚡ Quick Start

```bash
# 1. Clone e instale
git clone https://github.com/sixbasebr/b4you-lambdas.git
cd b4you-lambdas
npm install

# 2. Rode os testes
npm test

# 3. Desenvolva!
cd js/sua-lambda
npm test
```

## 🚀 Tecnologias Utilizadas

### JavaScript
- **Node.js** - Runtime JavaScript
- **Sequelize** - ORM para banco de dados
- **MySQL** - Banco de dados relacional
- **Axios** - Cliente HTTP
- **Moment.js** - Manipulação de datas
- **AWS SDK** - Integração com serviços AWS

### Ferramentas de Desenvolvimento
- **Vitest** - Framework de testes (instalado globalmente)
- **Biome** - Linter e formatador de código
- **Husky** - Git hooks
- **Lint-staged** - Executa linters em arquivos staged

### Go
- **Go 1.x** - Linguagem de programação
- **golangci-lint** - Linter para Go

### Infrastructure
- **AWS Lambda** - Computação serverless
- **AWS DynamoDB** - Banco de dados NoSQL (alguns casos)
- **AWS SQS** - Filas de mensagens

## Estrutura do Projeto

```
.
├── js/                  # Lambdas em JavaScript
│   ├── exportSales/     # Exemplo de lambda
│   │   ├── index.mjs    # Handler principal
│   │   ├── test.mjs     # Arquivo de teste local
│   │   └── ...          # Outros arquivos
│   └── ...              # Outras lambdas
├── go/                  # Lambdas em Go
├── scripts/             # Scripts de desenvolvimento
└── ...                  # Arquivos de configuração
```

## ⚙️ Configuração do Ambiente de Desenvolvimento

### Pré-requisitos

- **Node.js** 18.x ou superior
- **npm** ou **yarn**
- **Go** 1.x (para lambdas Go)
- **MySQL** (para desenvolvimento local)

### Instalação

1. Clone o repositório:

```bash
git clone https://github.com/sixbasebr/b4you-lambdas.git
cd b4you-lambdas
```

2. Instale as dependências:

```bash
npm install
# ou
yarn install
```

Isso instalará:
- ✅ Vitest (framework de testes)
- ✅ Biome (linter e formatter)
- ✅ Husky (git hooks)
- ✅ Todas as dependências compartilhadas

3. Configure as ferramentas Go (se estiver trabalhando com lambdas Go):

```bash
./scripts/setup-go-tools.sh
```

4. Configure os git hooks:

```bash
npm run prepare
```

Isso configura os hooks que rodam automaticamente:
- **Pre-commit**: Formata código e roda testes

### Verificando a Instalação

```bash
# Verifica se os testes funcionam
npm test

# Deve mostrar: ✓ 81 testes passando
```

## Práticas de Desenvolvimento

### Estilo de Código

- Arquivos JavaScript usam Biome para formatação e linting
- Arquivos Go usam gofmt e golangci-lint
- O código é formatado e verificado automaticamente no commit

### Fluxo de Trabalho com Git

1. Crie uma nova branch para sua feature/correção
2. Faça suas alterações
3. Execute os testes localmente
4. Faça commit das alterações (a verificação será executada automaticamente)
5. Crie um pull request

### Mensagens de Commit

Siga este formato:

```
tipo(escopo): descrição

[corpo opcional]

[rodapé opcional]
```

Tipos:

- `feat`: Nova funcionalidade
- `fix`: Correção de bug
- `docs`: Alterações na documentação
- `style`: Alterações de estilo de código (formatação, etc.)
- `refactor`: Alterações de código que não corrigem bugs nem adicionam funcionalidades
- `test`: Adição ou modificação de testes
- `chore`: Alterações no processo de build ou ferramentas auxiliares

Exemplo:

```
feat(exportSales): adiciona novo formato de exportação

- Adicionada opção de exportação CSV
- Atualizada documentação

Resolve #123
```

## 🧪 Testes

Este projeto utiliza **Vitest** como framework de testes, instalado globalmente na raiz e compartilhado por todas as lambdas.

### Arquitetura de Testes

- ✅ **Vitest instalado uma vez** na raiz (sem duplicação)
- ✅ **Configuração base compartilhada** entre todas as lambdas
- ✅ **Testes unitários e de integração**
- ✅ **Execução automática** no pre-commit

### Executando Testes

#### 📊 Todos os Testes (da raiz)

```bash
# Roda todos os testes de todas as lambdas
npm test

# Modo watch (re-executa ao salvar)
npm run test:watch

# Com relatório de cobertura
npm run test:coverage
```

**Resultado esperado**: ~81 testes em ~1.2 segundos ⚡

#### 🎯 Lambda Específica

```bash
# Entre na lambda
cd js/requestWithdrawal

# Roda apenas os testes desta lambda
npm test

# Modo watch
npm run test:watch

# Com cobertura
npm run test:coverage

# Apenas testes unitários
npm run test:unit

# Apenas testes de integração
npm run test:integration
```

### Estrutura de Testes

```
js/sua-lambda/
├── __tests__/              # Pasta de testes
│   ├── setup.mjs           # Configuração inicial
│   ├── unit/               # Testes unitários
│   │   └── *.test.mjs
│   └── integration/        # Testes de integração
│       └── *.test.mjs
├── vitest.config.mjs       # Config local (estende a base)
└── package.json            # Scripts de teste
```

### Criando Testes

#### Teste Unitário

```javascript
// __tests__/unit/MyModule.test.mjs
import { describe, it, expect } from 'vitest';
import { myFunction } from '../../MyModule.mjs';

describe('MyModule', () => {
  it('deve retornar resultado esperado', () => {
    const result = myFunction(10);
    expect(result).toBe(20);
  });
});
```

#### Teste de Integração

```javascript
// __tests__/integration/flow.test.mjs
import { describe, it, expect, beforeEach } from 'vitest';
import { handler } from '../../index.mjs';

describe('Handler Integration', () => {
  beforeEach(() => {
    // Setup antes de cada teste
  });

  it('deve processar evento completo', async () => {
    const event = { /* mock event */ };
    const result = await handler(event);
    expect(result.statusCode).toBe(200);
  });
});
```

### Testes Locais (Sem Vitest)

Algumas lambdas ainda possuem arquivos `test.mjs` para testes manuais rápidos:

```bash
cd js/sua-lambda
node test.mjs
```

### 🪝 Testes Automáticos no Commit

Os testes rodam automaticamente antes de cada commit via Husky:

```bash
git commit -m "feat: nova funcionalidade"
# 🔥 Pre-commit hook rodando!
# 🎨 Formatando código...
# 🧪 Rodando testes...
# ✅ Testes passaram!
# ✓ Commit criado!
```

**Se os testes falharem**, o commit é abortado automaticamente.

Para pular em emergências (não recomendado):
```bash
git commit --no-verify -m "mensagem"
```

### 📚 Documentação de Testes

Para mais detalhes, consulte:
- **[TESTING.md](TESTING.md)** - Guia completo de testes e boas práticas
- **[VITEST_SETUP.md](VITEST_SETUP.md)** - Setup rápido para novas lambdas
- **[GIT_HOOKS.md](GIT_HOOKS.md)** - Documentação dos git hooks

## 📜 Scripts Disponíveis

### Testes
- `npm test` - Executa todos os testes
- `npm run test:watch` - Modo watch (re-executa ao salvar)
- `npm run test:coverage` - Gera relatório de cobertura
- `npm run test:lambda <nome>` - Testa lambda específica

### Qualidade de Código
- `npm run format` - Formata todos os arquivos
- `npm run lint` - Verifica problemas de código
- `npm run check` - Verifica e corrige problemas automaticamente

### Desenvolvimento
- `npm run dev` - Inicia o servidor de desenvolvimento (se disponível)

## Variáveis de Ambiente

Cada lambda deve documentar suas variáveis de ambiente necessárias no arquivo `test.mjs`. Variáveis comuns incluem:

- `DATABASE_URL`: String de conexão com o banco de dados
- `API_KEY`: Chave de autenticação da API
- `AWS_REGION`: Região AWS
- `STAGE`: Ambiente de deploy (dev, prod, etc.)

## 📦 Lambdas Disponíveis

### Pagamentos e Transações
- `requestWithdrawal` - Solicitação de saques ✅ *Com testes*
- `chargePix` - Cobrança PIX
- `chargeSubscriptions` - Cobrança de assinaturas
- `callbacksCard` - Callbacks de pagamentos com cartão
- `callbackWithdrawals` - Callbacks de saques
- `pagarmePaidCharge` - Processamento de cobranças pagas

### Webhooks e Eventos
- `webhookEvent` - Processamento de eventos webhook ✅ *Com testes*
- `webhookNotazzBalancer` - Balanceador de webhooks Notazz
- `generatedNotifications` - Geração de notificações

### Emails e Notificações
- `approvedPaymentNotifications` - Notificações de pagamentos aprovados
- `studentApprovedPaymentEmails` - Emails de pagamentos aprovados
- `pendingPaymentEmail` - Emails de pagamentos pendentes
- `notifySubscriptionsPix` - Notificações de assinaturas PIX

### Exportações
- `exportSales` - Exportação de vendas
- `exportSalesShipping` - Exportação de vendas com envio
- `exportPendingAffiliate` - Exportação de afiliados pendentes
- `exportRankingAffiliate` - Ranking de afiliados

### Integrações
- `integrations` - Integrações gerais
- `blingShipping` - Integração Bling (envios)
- `blingInvoices` - Integração Bling (notas fiscais)
- `blingTracking` - Integração Bling (rastreamento)
- `tinyShipping` - Integração Tiny
- `notazz` - Integração Notazz
- `enotas` - Integração eNotas
- `zoppy` - Integração Zoppy
- `invision` - Integração Invision

### Afiliados
- `affiliateInvite` - Convite de afiliados
- `affiliateMarket` - Marketplace de afiliados
- `referralCommission` - Comissões de indicação

### Outros
- `antifraud` - Sistema antifraude
- `splitCommissions` - Divisão de comissões
- `confirmSplits` - Confirmação de splits
- `metricsHourly` - Métricas horárias
- `userMetrics` - Métricas de usuários
- `usersRevenue` - Receita de usuários

✅ = Lambda com testes automatizados

## 🚀 Deploy

TBD: Adicionar instruções de deploy específicas para sua configuração AWS

## 🤝 Contribuindo

1. Faça um fork do repositório
2. Crie sua branch de feature
3. Faça commit das suas alterações
4. Envie para a branch
5. Crie um Pull Request

## Licença

ISC
