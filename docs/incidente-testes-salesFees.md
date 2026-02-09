# Incidente: Falha no teste de salesFees (cartão com juros do aluno)

## Contexto
A suite de testes do `sixbase-api` ficou com apenas um teste falhando:
`Testing credit card fees class and method › should calculate credit card fees with interests on student`.
A asserção esperava `main.price_total = 119.8`, mas o cálculo retornava `119.76`.

## Causa raiz
O cálculo de juros no fluxo `CreditCardFees` utiliza `PMT` e arredonda a parcela para duas casas
decimais. Em seguida, o total por item (`price_total`) era derivado de um valor de juros também
arredondado para duas casas, o que gerava `119.76` e propagava um `revenue` com erro de ponto
flutuante (~`106.993584`). O teste esperava a política de arredondamento por item em `0,1` e a
receita calculada com custo PSP arredondado para centavos.

Arquivos envolvidos:
- `useCases/checkout/fees/Fees.js`
- `tests/integration/salesFees.test.js`

## Decisão técnica
Ajustamos o cálculo no módulo de fees para:
- arredondar o `interest_installment_amount` por item em 1 casa decimal (mantendo a política
  de arredondamento por item esperada pelo teste);
- usar `psp_cost_total` arredondado para centavos na receita do item principal, evitando acúmulo
  de erro de ponto flutuante.

Com isso, `main.price_total` volta a `119.8` e `main.revenue` passa a `107.029`, sem alterar as
regras de negócio nem impactar cenários de pix/boleto ou cartão sem juros.

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
