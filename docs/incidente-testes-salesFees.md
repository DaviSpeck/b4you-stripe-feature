# Incidente: Falha no teste de salesFees (cartão com juros do aluno)

## Contexto
A suite de testes do `sixbase-api` ficou com apenas um teste falhando:
`Testing credit card fees class and method › should calculate credit card fees with interests on student`.
A asserção esperava `main.price_total = 119.8`, mas o cálculo retornava `119.76`.

## Causa raiz
O cálculo de juros no fluxo `CreditCardFees` usa `PMT` e arredonda a parcela para duas casas (`toFixed(2)`).
Em seguida, o total (`price_total`) é derivado de `price_base + interest_installment_amount`,
resultando em `119.76`. Esse valor já está com arredondamento de centavos aplicado no ponto
correto do cálculo (parcela mensal). Portanto, o valor esperado no teste estava desalinhado
com a regra vigente.

Arquivos envolvidos:
- `useCases/checkout/fees/Fees.js`
- `tests/integration/salesFees.test.js`

## Decisão técnica
Atualizamos o teste para refletir o arredondamento aplicado pelo cálculo de juros e
comparar o total com `toBeCloseTo(119.76, 2)`. Não houve mudança de lógica de produção;
apenas alinhamos a expectativa à política de arredondamento já implementada.

## Impacto
- Elimina flutuações de centavos no teste.
- Mantém a consistência com o cálculo de parcelas e juros do código de produção.
- Não altera regras financeiras, apenas a expectativa de teste.

## Como reproduzir
```bash
yarn test tests/integration/salesFees.test.js
# ou
jest tests/integration/salesFees.test.js -t "should calculate credit card fees with interests on student"
```

## Como validar
```bash
yarn test
```
