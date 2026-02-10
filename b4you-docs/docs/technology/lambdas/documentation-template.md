---
title: Template da Documentação
---

# MODELO: Nome do Lambda

Breve explicação da função do Lambda e o que ele processa.

## 🗂️ Localização

- **Repositório GitHub:** `b4you-lambdas`
- **Diretório:** `lambdas/js/NOME_DO_LAMBDA`
- **Serviço AWS:** Nome no AWS Lambda ou API Gateway
- **Invocação:** Manual, agendada, por fila SQS, API Gateway...

---

## 🧱 Principais Arquivos e Pastas

| **Arquivo/Pasta** | **Função** |
| --- | --- |
| index.mjs | Entrada principal da função Lambda |
| config/ | Configurações específicas (opcional) |
| queues/aws.mjs | Integração com SQS para eventos assíncronos |
| database/ | Modelos Sequelize utilizados (como `Cart`, `Affiliates`) |

---

## 🔁 Fluxo de Execução

1. Conecta ao banco de dados MySQL
2. Busca carrinhos criados há mais de 1h que ainda não foram marcados como abandonados
3. Valida se houve tentativa de compra (com ou sem pagamento)
4. Marca como abandonadoMarca como abandonado
5. Publica dados em:
    - 🧩 Fila `integrations` para geração de eventos
    - 🧩 Fila `webhookEvent` para webhooks e afiliados

---

## 🧪 Dependências

| **Variável** | **Descrição** |
| --- | --- |
| MYSQL_DATABASE | Nome do banco |
| MYSQL_HOST | Host do banco |
| MYSQL_USERNAME | Usuário do banco |
| MYSQL_PASSWORD | Senha do banco |
| MYSQL_PORT | Porta do banco |

---

## **🧵 Fila(s) Utilizadas**

- `integrations`
- `webhookEvent`

---

## **📄 Observações Técnicas**

- Cartões com `charges` são tratados de forma especial, considerando o `next_business_day`
- Integrações com afiliados utilizam modelo `Affiliates`
- Usa o helper `DateHelper()` para manipulação de datas (wrapper do dayjs/moment)

---

**✅ Exemplo gerado: `abandonedCart`**

Agora, a ideia é replicar esse padrão em outras páginas (um por Lambda) dentro de um espaço "Catálogo de Lambdas" ou "Referência de Funções". Como esse é um exemplo, ainda não reflete a realidade.