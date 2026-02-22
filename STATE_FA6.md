# STATE_FA6 — FASE 6 (Backoffice: Governança Internacional / Stripe)

## 1) Estado Atual da FASE 6

### 1.1 Implementações concluídas

#### Backoffice API (`backoffice-repositories/sixbase-api-backoffice`)
- Foram publicados os endpoints de governança internacional:
  - `GET /users/:userUuid/international-governance`
  - `PATCH /users/:userUuid/international-governance`.
- As rotas estão registradas com validação de schema no `PATCH`.
- O controller de `GET` retorna os campos de governança internacional do produtor.
- O controller de `PATCH` persiste os campos de governança (`status`, `stripe_enabled`, `rules`, `updated_at`, `updated_by`) e grava auditoria em `logs_backoffice` com:
  - motivo (`reason`),
  - estado anterior,
  - estado novo,
  - actor (`id_user_backoffice`),
  - tipo de evento (`international-governance-enabled|blocked`).
- O schema de validação exige:
  - `status` em `enabled|blocked`,
  - `international_stripe_enabled` boolean,
  - `reason` obrigatório (min/max),
  - `rules` como objeto.

#### Dashboard API (`dashboard-repositories/sixbase-api`)
- O use case `CreateProduct` foi estendido para receber e persistir:
  - `operation_scope` (`national|international`),
  - `currency_code`,
  - `acquirer_key`,
  - `conversion_context`.
- Foi implementado gate backend para criação internacional:
  - se `operation_scope === international`, consulta produtor,
  - exige `international_status === enabled` e `international_stripe_enabled === true`,
  - em caso contrário retorna `403`.
- Fluxo nacional permanece permitido sem dependência do status internacional.

#### Banco de dados / modelos
- Existem migrations para inclusão dos novos campos em `users` e `products` nos dois serviços (Backoffice API e Dashboard API).
- Modelos Sequelize de `Users` e `Products` já refletem os novos campos de governança e escopo internacional.

#### Documentação
- A documentação da FASE 6 foi criada e descreve os limites de escopo (sem checkout, sem FASE 7) e a regra de governança centralizada no backoffice.

### 1.2 O que ainda falta implementar (FASE 6 para encerramento real)
- Cobertura de integração HTTP real no Backoffice API (não apenas invocação direta de controller com mocks).
- Estabilização do ambiente de testes do Backoffice API (erro de bootstrap ORM).
- Integração Back + Front mínima:
  - Backoffice front para visualizar e atualizar governança internacional do produtor.
  - Dashboard front para seleção de `operation_scope` e tratamento explícito de bloqueio `403` para internacional.
- Padronização de scripts de teste para execução em lote da FASE 6 (back + front) no nível de repositório raiz.

---

## 2) Gaps Identificados

### 2.1 Gap crítico de testes no Backoffice API
**Sintoma reportado:** ao rodar testes ocorre bootstrap do ORM com erro `model.init is not a function`.

**Causa técnica provável (confirmada pelo desenho atual de imports/mocks):**
- O teste de governança (`tests/integration/internationalGovernance.spec.js`) mocka `../../database/models/Users` com um objeto simples (`findOne`, `update`).
- O `controllers/users.js` importa também `../database/models` (index de bootstrap global).
- O `database/models/index.js` faz leitura automática dos models e executa `model.init(this.sequelize)` para cada arquivo.
- Como o módulo `Users` foi mockado com objeto sem método `init`, o bootstrap quebra ao tentar iniciar esse model.

### 2.2 Gaps de cobertura (Backoffice)
- O teste atual classificado como "integration" não cobre camada HTTP/rota/middleware completo; ele testa função de controller isolada.
- Não há teste de integração com Supertest exercitando:
  - rota `PATCH` com validação de schema,
  - retorno `400` para payload inválido,
  - retorno `404/400` para produtor inexistente,
  - persistência + auditoria em cenário real do endpoint.

### 2.3 Gaps de cobertura (Dashboard)
- Cobertura existente está concentrada em use case (`CreateProduct`) com dublês.
- Falta teste de integração de controller/rota para validar:
  - resposta HTTP e payload de erro de bloqueio internacional (`403`),
  - regressão do fluxo nacional via endpoint real.
- Falta contrato explícito da mensagem de erro para o front consumir de forma determinística.

### 2.4 Gaps de integração Back + Front
- Não há contrato de integração documentado (erro/mensagem/código) para o front da Dashboard exibir bloqueio internacional.
- Não há fluxo mínimo fechado com os dois frontends consumindo os endpoints/erros já existentes.

---

## 3) Plano de Trabalho Detalhado

## 3.1 Corrigir bootstrap de models no ambiente de testes do Backoffice

### Estratégia recomendada (ordem de menor risco)
1. **Isolar bootstrap em teste de controller**
   - Antes de importar `controllers/users`, mockar `../../database/models` para evitar init global do Sequelize.
2. **Alternativa complementar**
   - Substituir o mock de `Users` por classe fake compatível com interface esperada no bootstrap (`init`, `associate`, `findOne`, `update`) quando o teste exigir carregar `database/models/index`.
3. **Hardening opcional no `database/models/index.js`**
   - Tornar bootstrap defensivo em ambiente de teste, ignorando entradas sem `init` e logando warning (sem impactar prod).

### Arquivos-alvo (Backoffice)
- `backoffice-repositories/sixbase-api-backoffice/tests/integration/internationalGovernance.spec.js`
- `backoffice-repositories/sixbase-api-backoffice/database/models/index.js` (apenas se necessário)
- `backoffice-repositories/sixbase-api-backoffice/controllers/users.js` (opcional: reduzir import global não usado)

### Exemplo de correção de teste (mock do index de models)
```js
jest.mock('../../database/models', () => ({
  sequelize: { models: {} },
}));

jest.mock('../../database/models/Users', () => ({
  init: jest.fn(() => ({ associate: jest.fn() })),
  associate: jest.fn(),
  findOne: jest.fn(),
  update: jest.fn(),
}));
```

### Exemplo de hardening opcional no bootstrap
```js
init() {
  models
    .filter((model) => typeof model.init === 'function')
    .map((model) => model.init(this.sequelize))
    .map((model) => model.associate && model.associate(this.sequelize.models));
}
```

> Observação: aplicar somente se não houver impacto em convenções internas. Preferência é resolver no teste primeiro.

---

## 3.2 Adicionar testes de integração FASE 6 (Backoffice + Dashboard)

### Backoffice API (integração HTTP mínima)
**Objetivo:** garantir contrato real das rotas de governança.

#### Cenários obrigatórios
1. `PATCH` válido retorna `200` e chama persistência.
2. `PATCH` inválido (status fora do enum / reason curto) retorna `400`.
3. `GET` retorna campos de governança esperados.
4. `PATCH` para `userUuid` inexistente retorna erro de negócio.

#### Arquivos sugeridos
- `backoffice-repositories/sixbase-api-backoffice/tests/integration/internationalGovernance.http.spec.js`
- `backoffice-repositories/sixbase-api-backoffice/tests/setup/httpTestApp.js` (separar app de teste)

### Dashboard API (integração HTTP mínima)
**Objetivo:** validar gate internacional no endpoint real de criação.

#### Cenários obrigatórios
1. `operation_scope=international` + produtor bloqueado => `403`.
2. `operation_scope=international` + produtor habilitado => `200`.
3. `operation_scope=national` + produtor bloqueado => `200` (não regressão).

#### Arquivos sugeridos
- `dashboard-repositories/sixbase-api/tests/integration/createProduct.http.spec.js`
- `dashboard-repositories/sixbase-api/tests/fixtures/products.fixtures.js` (payloads reutilizáveis)

### Contramedidas de não-regressão (fluxo nacional)
- Incluir teste explícito de criação nacional em ambos os níveis:
  - use case (já existe no dashboard, manter),
  - endpoint HTTP (novo).
- Garantir defaults preservados:
  - `operation_scope = national`,
  - `currency_code = BRL`,
  - `acquirer_key = pagarme`.
- Validar que nenhuma regra de governança internacional interfere no caminho nacional.

---

## 3.3 Scripts de teste a adicionar/padronizar

## Repositório raiz (`/workspace/b4you-stripe-feature/package.json`)
Criar um orquestrador de execução FASE 6 (se ainda não existir package raiz):
```json
{
  "scripts": {
    "test:fa6:back": "npm --prefix backoffice-repositories/sixbase-api-backoffice run test:integration && npm --prefix dashboard-repositories/sixbase-api run test:integration",
    "test:fa6:front": "npm --prefix backoffice-repositories/sixbase-backoffice run test:front && npm --prefix dashboard-repositories/sixbase-dashboard run test:front",
    "test:fa6": "npm run test:fa6:back && npm run test:fa6:front"
  }
}
```

## Ajustes locais por pacote
- **Backoffice API**: manter `test:integration` apontando para suíte de governança + suíte HTTP nova.
- **Dashboard API**: incluir suíte HTTP junto da suíte de use case.
- **Fronts**: manter `test:front` como alias das suítes de integração mínimas.

---

## 3.4 Preparação da base para front mínimo (sem inventar UX)

### Backoffice Front (mínimo)
**Meta:** card simples de governança internacional no detalhe do produtor.

#### Itens
- Exibir:
  - `international_status`,
  - `international_stripe_enabled`,
  - `international_rules`,
  - `international_status_updated_at`,
  - `international_status_updated_by`.
- Form mínimo com:
  - select status,
  - toggle `stripe_enabled`,
  - textarea `reason` (obrigatório),
  - JSON textarea `rules` (opcional).
- Salvar via `PATCH /users/:uuid/international-governance`.

#### Arquivos prováveis
- `backoffice-repositories/sixbase-backoffice/src/views/producers/...` (container/página)
- `backoffice-repositories/sixbase-backoffice/src/services/api/...` (cliente HTTP)
- `backoffice-repositories/sixbase-backoffice/src/views/producers/components/InternationalGovernanceCard.jsx`
- `backoffice-repositories/sixbase-backoffice/src/views/producers/components/InternationalGovernanceCard.test.jsx`

### Dashboard Front (mínimo)
**Meta:** permitir `operation_scope` e tratar bloqueio internacional.

#### Itens
- Incluir campo `Operação` em criação de produto (`national|international`).
- Quando backend responder `403` em internacional, exibir mensagem:
  - `Seu produtor não está habilitado para criar produto internacional.`
- Não alterar fluxo nacional.

#### Arquivos prováveis
- `dashboard-repositories/sixbase-dashboard/src/modules/products/...` (form de criação)
- `dashboard-repositories/sixbase-dashboard/src/services/api/...` (tratamento erro)
- `dashboard-repositories/sixbase-dashboard/src/modules/products/list-products.test.jsx` (ou novo spec focado em create modal)

---

## 4) Tarefas Executáveis (checklist)

## T1 — Estabilizar teste Backoffice (erro `model.init`)
- [ ] Ajustar mocks em `tests/integration/internationalGovernance.spec.js` para não quebrar bootstrap.
- [ ] Validar execução de `npm run test:integration` no pacote.

## T2 — Cobertura de integração HTTP Backoffice
- [ ] Criar spec com supertest para GET/PATCH governança.
- [ ] Validar cenários 200/400 de schema e negócio.

## T3 — Cobertura de integração HTTP Dashboard
- [ ] Criar spec HTTP para create product com `operation_scope`.
- [ ] Garantir cenários 403 internacional bloqueado / 200 internacional habilitado / 200 nacional.

## T4 — Padronização de scripts FASE 6
- [ ] Adicionar scripts agregadores na raiz (`test:fa6:*`).
- [ ] Incluir novas suítes nos scripts dos pacotes.

## T5 — Preparação Front mínima Backoffice
- [ ] Garantir consumo GET/PATCH governança no detalhe do produtor.
- [ ] Cobrir fluxo com teste de integração de componente.

## T6 — Preparação Front mínima Dashboard
- [ ] Expor `operation_scope` no form de criação.
- [ ] Tratar erro 403 internacional com mensagem fixa.
- [ ] Garantir não-regressão do nacional.

---

## 5) Dependências necessárias

### Técnicas
- `jest` + `supertest` (já presentes em dashboard; confirmar em backoffice).
- Banco de teste (ou mocks de repositório) com configuração estável de ambiente.
- `cross-env` para scripts multiplataforma (já usado em alguns pacotes front).

### Funcionais
- Usuário backoffice autenticado (para teste de rota protegida, quando aplicável).
- Produtor de fixture com status internacional habilitado e bloqueado.

---

## 6) Como rodar e validar localmente

### 6.1 Backoffice API
```bash
cd backoffice-repositories/sixbase-api-backoffice
npm install
npm run test:integration
```

### 6.2 Dashboard API
```bash
cd dashboard-repositories/sixbase-api
npm install
npm run test:integration
```

### 6.3 Fronts (mínimo)
```bash
cd backoffice-repositories/sixbase-backoffice && npm install && npm run test:front
cd dashboard-repositories/sixbase-dashboard && npm install && npm run test:front
```

### 6.4 Orquestrado (após scripts de raiz)
```bash
npm run test:fa6
```

---

## 7) Critérios de aceite para encerrar de fato a FASE 6

1. **Governança Backoffice funcional e auditável**
   - GET e PATCH estáveis, com schema e auditoria.
2. **Bloqueio internacional na Dashboard validado via endpoint real**
   - `403` quando bloqueado;
   - `200` quando habilitado.
3. **Não regressão nacional comprovada**
   - criação nacional continua `200` independente da governança internacional.
4. **Scripts de teste FASE 6 disponíveis**
   - execução simples para back + front.
5. **Front mínimo operacional**
   - Backoffice gerencia governança;
   - Dashboard respeita governança na criação internacional.
6. **Sem expansão indevida de escopo**
   - sem FASE 7 completa,
   - sem alterações de checkout,
   - sem mudanças fora de governança internacional.
