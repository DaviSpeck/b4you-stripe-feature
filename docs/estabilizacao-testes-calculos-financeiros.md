# Estabilização de testes de cálculos financeiros

## Contexto
Após uma sequência de ajustes, apenas o teste de integração
`tests/integration/creditCardFees.test.js` continuou falhando no cenário
“juros pagos pelo aluno”. O erro era um delta fixo de R$ 0,04 entre o
`price_total` esperado (`134.16`) e o obtido (`134.20`), surgido após
alterações recentes na política de arredondamento de juros.

## Causa raiz
O cálculo de juros do cartão usa `PMT` e arredonda a parcela mensal. Para
itens individuais, o arredondamento em `0,1` foi necessário para manter
compatibilidade com o cenário de item único (`salesFees.test.js`). Porém,
quando existem múltiplos itens, a soma dos arredondamentos individuais
gera um desvio acumulado (R$ 0,04), levando o total dos itens a não
bater com o total global calculado pelo fluxo principal.

## Solução adotada
Foi aplicada uma correção mínima no cálculo por item:

1. **Mantemos o arredondamento por item em 0,1** para preservar o cenário
   de item único (já validado na suite).
2. **Reconciliamos o total em cenários com múltiplos itens**: ao final do
   loop, ajustamos o último item com o delta para que a soma dos itens
   seja exatamente igual ao total calculado para a venda.
3. **Recalculamos métricas derivadas do item ajustado** (juros, receita,
   impostos e spreads) para evitar inconsistências internas.

Essa abordagem mantém a regra de negócio vigente e elimina o erro de
arredondamento sem afrouxar a asserção do teste.

## Riscos evitados
- **Não alteramos a expectativa do teste** nem relaxamos tolerâncias.
- **Não introduzimos dependências novas**.
- **Não mudamos a política de cálculo global**, apenas reconciliação
  aritmética local para evitar drift em múltiplos itens.

## Diretriz futura
- Sempre calcular valores financeiros em centavos quando possível.
- Se houver arredondamento por item, garantir reconciliação do total com
  o valor agregado (diferença no último item ou ajuste centralizado).
- Evitar arredondamentos em pontos diferentes para o mesmo fluxo
  financeiro.

## Como reproduzir
```bash
yarn test tests/integration/creditCardFees.test.js
# ou
jest tests/integration/creditCardFees.test.js -t "should calculate credit card fees with interests on student"
```

## Como validar
```bash
yarn test
```
