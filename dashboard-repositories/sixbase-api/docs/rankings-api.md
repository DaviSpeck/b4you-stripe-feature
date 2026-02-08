# Rankings API

## Base path

```
/rankings
```

### Observação importante (ATUALIZADA)

* O router aplica `session` antes de `/rankings`
* **Os endpoints públicos (`/weekly`, `/monthly`, `/all-time`, `/custom`) NÃO exigem autenticação**
* O usuário (`req.user`) é **opcional** nesses endpoints:

  * Quando presente, o campo `me` é calculado
  * Quando ausente, `me` retorna `null` e `isCurrentUser` será sempre `false`
* **Apenas o endpoint `/rankings/me` exige autenticação (`auth`)**

---

## Endpoints

---

## 1) GET `/rankings/weekly`

Retorna o ranking da **semana atual (ISO week)**.

### Query params

* `page` (number, default `0`) — página (0-based)
* `size` (number, default `10`) — itens por página
* `input` (string, opcional) — filtro por `full_name` ou `email` (LIKE)

### Resposta 200

```json
{
  "top10": [
    {
      "userId": 123,
      "name": "Fulano",
      "avatarUrl": "https://...",
      "revenue": 1200.5,
      "salesCount": 15,
      "position": 1,
      "isCurrentUser": false
    }
  ],
  "results": [
    {
      "userId": 123,
      "name": "Fulano",
      "avatarUrl": "https://...",
      "revenue": 1200.5,
      "salesCount": 15,
      "position": 11,
      "isCurrentUser": false
    }
  ],
  "me": {
    "userId": 999,
    "name": "Eu",
    "avatarUrl": "https://...",
    "revenue": 300.0,
    "salesCount": 2,
    "position": 58,
    "isCurrentUser": true
  },
  "pagination": {
    "page": 0,
    "limit": 10,
    "total": 250,
    "pages": 25
  },
  "period": {
    "startDate": "2025-12-15 03:00:00",
    "endDate": "2025-12-21 23:59:59"
  }
}
```

> Se o usuário **não estiver autenticado**, o campo `me` será `null`.

---

### Regras relevantes (comportamento)

* Ordenação:

  1. `revenue` DESC
  2. `salesCount` DESC
  3. `created_at` ASC
* Exclui usuários presentes em `leaderboard_winners` com `scope IN ('weekly', 'monthly')`
* Exclui usuários que tiveram transações nos **últimos 30 dias** com `id_role = producer`
* Apenas usuários com:

  * `SUM(users_revenue.total) > 0`
  * `onboarding.user_type = 'creator'`

---

### Exemplo

```bash
curl -X GET 'https://api.seudominio.com/rankings/weekly?page=0&size=10&input=joao' \
  -H 'Cookie: session=...'
```

---

## 2) GET `/rankings/monthly`

Ranking do **mês atual**.

### Query params

* `page` (default `0`)
* `size` (default `10`)
* `input` (opcional)

### Resposta 200

Mesma estrutura do endpoint `/weekly`.

---

### Exemplo

```bash
curl -X GET 'https://api.seudominio.com/rankings/monthly?page=0&size=20' \
  -H 'Cookie: session=...'
```

---

## 3) GET `/rankings/all-time`

Ranking **geral** (de `2000-01-01` até hoje).

### Query params

* `page` (default `0`)
* `size` (default `10`)
* `input` (opcional)

### Resposta 200

Mesma estrutura do endpoint `/weekly`.

---

### Exemplo

```bash
curl -X GET 'https://api.seudominio.com/rankings/all-time?page=1&size=10' \
  -H 'Cookie: session=...'
```

---

## 4) GET `/rankings/custom`

Ranking por **intervalo customizado**.

### Query params

* `page` (default `0`)
* `size` (default `10`)
* `input` (opcional)
* `startDate` (**obrigatório**) — formato `YYYY-MM-DD`
* `endDate` (**obrigatório**) — formato `YYYY-MM-DD`

### Validações (400 Bad Request)

* Ausência de datas:

  ```
  Parâmetros obrigatórios: startDate e endDate (formato YYYY-MM-DD)
  ```
* Formato inválido:

  ```
  Formato de data inválido. Use YYYY-MM-DD (ex: 2025-01-01)
  ```
* `startDate > endDate`:

  ```
  startDate não pode ser posterior a endDate
  ```

### Resposta 200

Mesma estrutura do endpoint `/weekly`.

---

### Exemplo

```bash
curl -X GET 'https://api.seudominio.com/rankings/custom?startDate=2025-11-01&endDate=2025-11-30&page=0&size=10' \
  -H 'Cookie: session=...'
```

---

## 5) GET `/rankings/me` (com auth)

Retorna **apenas os dados do usuário autenticado**, baseado em um `scope`.

### Auth

* **Obrigatório**
* Requer middleware `auth`
* Retorna `401` se não autenticado

---

### Query params

* `scope` (**obrigatório**)
  Valores: `weekly | monthly | all-time | custom`
* `startDate` e `endDate`
  Obrigatórios apenas quando `scope = custom`

---

### Validações (400 Bad Request)

* Sem `scope`:

  ```
  Parâmetro obrigatório: scope (weekly|monthly|all-time|custom)
  ```
* `scope` inválido:

  ```
  Scope inválido. Use um dos seguintes: weekly, monthly, all-time, custom
  ```
* `scope=custom` sem datas:

  ```
  Para scope "custom", parâmetros obrigatórios: startDate e endDate (formato YYYY-MM-DD)
  ```
* Datas inválidas ou `startDate > endDate`:

  * Mesmas mensagens do endpoint `/custom`

---

### Resposta 200

```json
{
  "me": {
    "userId": 999,
    "name": "Eu",
    "avatarUrl": "https://...",
    "revenue": 300.0,
    "salesCount": 2,
    "position": 58,
    "isCurrentUser": true
  },
  "period": {
    "startDate": "2025-12-15 03:00:00",
    "endDate": "2025-12-21 23:59:59"
  }
}
```

### Observação

* O endpoint `/me` executa os rankings internamente com:

  * `page = 0`
  * `size = 1`
* Apenas os campos `me` e `period` são retornados

---

### Exemplos

```bash
curl -X GET 'https://api.seudominio.com/rankings/me?scope=weekly' \
  -H 'Authorization: Bearer <token>'
```

```bash
curl -X GET 'https://api.seudominio.com/rankings/me?scope=custom&startDate=2025-11-01&endDate=2025-11-30' \
  -H 'Authorization: Bearer <token>'
```

---

## Campos do retorno (referência rápida)

* `top10[]`
  Top 10 do período (`position` de 1 a 10)

* `results[]`
  Lista paginada com posição real:

  ```
  position = offset + index + 1
  ```

* `me`
  Dados do usuário autenticado no ranking
  Retorna `null` se:

  * não autenticado (endpoints públicos)
  * usuário não elegível no período

* `pagination`

  * `page`: página atual
  * `limit`: tamanho da página
  * `total`: total de usuários elegíveis
  * `pages`: `ceil(total / limit)`

* `period`

  * `startDate`
  * `endDate`