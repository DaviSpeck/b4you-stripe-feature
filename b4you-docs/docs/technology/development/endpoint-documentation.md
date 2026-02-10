---
title: Guia de Documentação Swagger
---

# Guia de Documentação Swagger

Este guia explica como expandir e manter a documentação Swagger da API de forma modular e organizada.

---

## Visão Geral

A documentação Swagger está organizada de forma modular para facilitar a manutenção e expansão. Cada módulo tem sua própria estrutura de arquivos, permitindo que diferentes desenvolvedores trabalhem em paralelo.

## Estrutura de Arquivos

```
docs/
├── openapi.yaml                    # Arquivo principal (NÃO EDITAR DIRETAMENTE)
├── paths.yaml                      # Gerado automaticamente (NÃO EDITAR)
├── bundle.json                     # Gerado automaticamente (NÃO EDITAR)
├── bundle.yaml                     # Gerado automaticamente (NÃO EDITAR)
├── components/                     # Componentes globais
│   ├── common-schemas.yaml        # Schemas compartilhados
│   ├── common-responses.yaml      # Respostas padrão
│   ├── parameters.yaml            # Parâmetros comuns
│   └── security.yaml              # Configurações de segurança
└── modulos/                       # Módulos da aplicação
    ├── dashboard/
    │   ├── auth/                  # Módulo de autenticação
    │   │   ├── schemas.yaml       # Schemas específicos
    │   │   └── paths.yaml         # Endpoints específicos
    │   └── balance/               # Módulo de saldo
    │       ├── schemas.yaml
    │       └── paths.yaml
    └── sales/                     # Módulo de vendas
        ├── schemas.yaml
        └── paths.yaml
```

## Como Adicionar um Novo Módulo

### Passo 1: Criar a Estrutura de Diretórios

```bash
# Criar diretório para o novo módulo
mkdir -p docs/modulos/dashboard/novo-modulo

# Ou para módulos fora do dashboard
mkdir -p docs/modulos/novo-modulo
```

### Passo 2: Criar o Arquivo de Schemas

Crie `docs/modulos/dashboard/novo-modulo/schemas.yaml`:

```yaml
components:
  schemas:
    NovoModuloRequest:
      type: object
      required:
        - campo_obrigatorio
      properties:
        campo_obrigatorio:
          type: string
          example: "valor exemplo"
          description: "Descrição do campo"
        campo_opcional:
          type: integer
          example: 123
          description: "Campo opcional"
    
    NovoModuloResponse:
      type: object
      properties:
        id:
          type: integer
          example: 1
        status:
          type: string
          example: "success"
        data:
          type: object
          properties:
            resultado:
              type: string
              example: "Operação realizada com sucesso"
```

### Passo 3: Criar o Arquivo de Paths

Crie `docs/modulos/dashboard/novo-modulo/paths.yaml`:

```yaml
/novo-modulo:
  get:
    tags:
      - Novo Módulo
    summary: Listar itens do novo módulo
    description: Retorna uma lista de itens do novo módulo
    security:
      - BearerAuth: []
    responses:
      '200':
        description: Lista obtida com sucesso
        content:
          application/json:
            schema:
              $ref: "./schemas.yaml#/components/schemas/NovoModuloResponse"
            example:
              id: 1
              status: "success"
              data:
                resultado: "Operação realizada com sucesso"
      '401':
        description: Não autorizado
        content:
          application/json:
            $ref: "../../../components/common-responses.yaml#/components/responses/UnauthorizedError"
      '500':
        description: Erro interno do servidor
        content:
          application/json:
            $ref: "../../../components/common-responses.yaml#/components/responses/InternalServerError"

  post:
    tags:
      - Novo Módulo
    summary: Criar novo item
    description: Cria um novo item no módulo
    security:
      - BearerAuth: []
    requestBody:
      required: true
      content:
        application/json:
          schema:
            $ref: "./schemas.yaml#/components/schemas/NovoModuloRequest"
          example:
            campo_obrigatorio: "valor exemplo"
            campo_opcional: 123
    responses:
      '201':
        description: Item criado com sucesso
        content:
          application/json:
            schema:
              $ref: "./schemas.yaml#/components/schemas/NovoModuloResponse"
      '400':
        description: Dados inválidos
        content:
          application/json:
            $ref: "../../../components/common-responses.yaml#/components/responses/BadRequest"
      '401':
        description: Não autorizado
        content:
          application/json:
            $ref: "../../../components/common-responses.yaml#/components/responses/UnauthorizedError"
      '500':
        description: Erro interno do servidor
        content:
          application/json:
            $ref: "../../../components/common-responses.yaml#/components/responses/InternalServerError"

/novo-modulo/{id}:
  get:
    tags:
      - Novo Módulo
    summary: Obter item por ID
    description: Retorna um item específico do módulo
    security:
      - BearerAuth: []
    parameters:
      - name: id
        in: path
        required: true
        schema:
          type: integer
        example: 1
        description: ID do item
    responses:
      '200':
        description: Item obtido com sucesso
        content:
          application/json:
            schema:
              $ref: "./schemas.yaml#/components/schemas/NovoModuloResponse"
      '404':
        description: Item não encontrado
        content:
          application/json:
            $ref: "../../../components/common-responses.yaml#/components/responses/NotFound"
      '401':
        description: Não autorizado
        content:
          application/json:
            $ref: "../../../components/common-responses.yaml#/components/responses/UnauthorizedError"
      '500':
        description: Erro interno do servidor
        content:
          application/json:
            $ref: "../../../components/common-responses.yaml#/components/responses/InternalServerError"
```

### Passo 4: Adicionar Schemas no openapi.yaml

Edite `docs/openapi.yaml` e adicione os novos schemas na seção `components/schemas`:

```yaml
components:
  schemas:
    # ... schemas existentes ...
    
    # Schemas do novo módulo
    NovoModuloRequest:
      $ref: "./modulos/dashboard/novo-modulo/schemas.yaml#/components/schemas/NovoModuloRequest"
    NovoModuloResponse:
      $ref: "./modulos/dashboard/novo-modulo/schemas.yaml#/components/schemas/NovoModuloResponse"
```

### Passo 5: Adicionar Tag no openapi.yaml

Adicione a nova tag na seção `tags` do `docs/openapi.yaml`:

```yaml
tags:
  - name: Autenticação
    description: Endpoints para autenticação, login, logout e gerenciamento de senhas
  - name: Vendas
    description: Endpoints para gerenciamento de vendas, assinaturas e códigos de cliente
  - name: Saldo
    description: Endpoints para consulta de saldo, comissões e informações bancárias
  - name: Novo Módulo
    description: Descrição do novo módulo
```

### Passo 6: Gerar a Documentação

Execute o comando para gerar a documentação atualizada:

```bash
yarn swagger:generate
```

## Comandos Disponíveis

```bash
# Gerar apenas paths.yaml (mais rápido para testes)
yarn swagger:paths

# Gerar documentação completa (paths + bundle)
yarn swagger:generate

# Comando alternativo
yarn swagger:bundle
```

## Boas Práticas

### 2. Estrutura de Schemas
```yaml
components:
  schemas:
    NomeDoSchema:
      type: object
      required:                    # Campos obrigatórios
        - campo1
        - campo2
      properties:
        campo1:
          type: string
          example: "exemplo"       # SEMPRE inclua exemplos
          description: "Descrição" # SEMPRE inclua descrições
        campo2:
          type: integer
          example: 123
          description: "Descrição"
```

### 3. Estrutura de Paths
```yaml
/endpoint:
  metodo_http:
    tags:
      - Nome da Tag
    summary: Resumo curto
    description: Descrição detalhada
    security:
      - BearerAuth: []            # Se requer autenticação
    parameters:                   # Se houver parâmetros
      - name: param1
        in: path                  # path, query, header
        required: true
        schema:
          type: string
        example: "exemplo"
    requestBody:                  # Se houver body
      required: true
      content:
        application/json:
          schema:
            $ref: "./schemas.yaml#/components/schemas/SchemaName"
          example:
            campo: "valor"
    responses:
      '200':
        description: Sucesso
        content:
          application/json:
            schema:
              $ref: "./schemas.yaml#/components/schemas/ResponseSchema"
            example:
              resultado: "sucesso"
```

### 4. Referências de Arquivos
- **Schemas locais**: `./schemas.yaml#/components/schemas/NomeSchema`
- **Componentes globais**: `../../../components/common-responses.yaml#/components/responses/ErrorName`
- **Outros módulos**: `../outro-modulo/schemas.yaml#/components/schemas/NomeSchema`

### 5. Códigos de Status HTTP
Use sempre os códigos apropriados:
- `200`: Sucesso (GET, PUT, PATCH)
- `201`: Criado (POST)
- `204`: Sem conteúdo (DELETE)
- `400`: Dados inválidos
- `401`: Não autorizado
- `403`: Proibido
- `404`: Não encontrado
- `409`: Conflito
- `422`: Entidade não processável
- `429`: Muitas requisições
- `500`: Erro interno

## Exemplos de Schemas Comuns

### Schema de Lista Paginada
```yaml
PaginatedResponse:
  type: object
  properties:
    data:
      type: array
      items:
        $ref: "#/components/schemas/ItemSchema"
    pagination:
      type: object
      properties:
        page:
          type: integer
          example: 1
        limit:
          type: integer
          example: 10
        total:
          type: integer
          example: 100
        totalPages:
          type: integer
          example: 10
```

### Schema de Erro Detalhado
```yaml
DetailedError:
  type: object
  properties:
    error:
      type: string
      example: "VALIDATION_ERROR"
    message:
      type: string
      example: "Dados inválidos fornecidos"
    details:
      type: array
      items:
        type: object
        properties:
          field:
            type: string
            example: "email"
          message:
            type: string
            example: "Email é obrigatório"
```

## Verificação e Testes

### 1. Validar YAML
```bash
# Verificar se o YAML está válido
yarn swagger:generate

# Se houver erros, eles aparecerão no console
```

### 2. Testar no Swagger UI
1. Acesse: `http://localhost:5501/docs`
2. Verifique se o novo módulo aparece
3. Teste os endpoints
4. Verifique se os exemplos estão corretos

### 3. Verificar Bundle
```bash
# Verificar se os schemas foram incluídos
grep -c "NomeDoSchema" docs/bundle.json

# Verificar se as rotas foram incluídas
grep -c "/nova-rota" docs/bundle.json
```

## Problemas Comuns e Soluções

### Erro: "Token does not exist"
- **Causa**: Referência incorreta no `$ref`
- **Solução**: Verificar se o caminho está correto e se o arquivo existe

### Erro: "ENOENT: no such file or directory"
- **Causa**: Arquivo referenciado não existe
- **Solução**: Verificar se todos os arquivos referenciados existem

### Schemas não aparecem no Swagger UI
- **Causa**: Bundle não foi gerado ou está desatualizado
- **Solução**: Executar `yarn swagger:generate`

### Exemplos não aparecem
- **Causa**: Bundle não foi resolvido completamente
- **Solução**: Verificar se o comando inclui a flag `-r` (resolve)

## Recursos Adicionais

- [OpenAPI Specification](https://swagger.io/specification/)
- [Swagger Editor](https://editor.swagger.io/)
- [OpenAPI Examples](https://github.com/OAI/OpenAPI-Specification/tree/master/examples)
- [Passo a passo em vídeo](https://drive.google.com/file/d/1JWhQ1BNOwsrbqIn6akzJNxIrNY7Wjd6d/view?usp=sharing)

## Contribuindo

1. Siga as boas práticas listadas acima
2. Sempre inclua exemplos e descrições
3. Teste a documentação antes de fazer commit
4. Use nomes descritivos para schemas e endpoints
5. Mantenha a consistência com o padrão existente