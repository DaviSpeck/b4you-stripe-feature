---
title: Bling
---

# Bling

## 1. Visão Geral

A integração com a Bling na plataforma B4You é responsável por enviar e sincronizar pedidos do nosso sistema para o ERP do cliente. Os problemas mais comuns incluem:

* **Pedidos não chegando** na Bling (faltando `id_order_bling`).
* **Dados inconsistentes** (endereço, telefone, CEP...).
* **Pedidos travados** por erros de configuração ou validação na Bling.
* **Erros intermitentes** da API (timeouts, falhas 500).

## 2. Objetivo

Criar um roteiro de análise e correção que permita a qualquer desenvolvedor resolver, de forma consistente, tickets relacionados à integração com a Bling.

## 3. Plano de Ação

1. **Validar integração ativa**
   * Consulte a tabela `plugins` para confirmar que existe um registro ativo (`true`) com `id_plugin` correspondente à Bling.
2. **Identificar pedidos pendentes**
   * Execute a query abaixo para listar vendas sem `id_order_bling` geradas após a data de interesse.
3. **Analisar logs da Lambda**
   * No CloudWatch, filtre pelos `id_sale` ou `id_user` retornados e verifique mensagens de erro na função `b4you-production-blingShipping`.
4. **Corrigir dados e reenfileirar**
   * Ajuste qualquer dado incorreto (CEP, cidade, telefone).
   * Envie novamente para a fila de disparo da Lambda.

## 4. Ferramentas de Diagnóstico

### 4.1 Query de Pedidos Abertos

```sql
select
	DISTINCT 
	s.id,
	s.email as 'email cliente',
	s.id_order_bling as 'id bling',
	si.paid_at,
	usr.email as 'producer',
	s.id_user,
	s.address,
	s.whatsapp,
	s.full_name,
	s.document_number
from
	sales s
join sales_items si on
	si.id_sale = s.id
join plugins p on
	p.id_user = s.id_user
join products pr on
	pr.id = si.id_product
	join users usr on usr.id = s.id_user
where	
	s.id_order_bling is  null
	and s.created_at > "2025-07-04 00:00:00"
	and si.id_status = 2
	and p.active = true
	and pr.id_type = 4
	and ( p.id_plugin = 16
		or p.id_plugin = 11)
		and p.created_at < si.paid_at and p.id_user != 158777
```

> **Nota:** se `id_order_bling` não for preenchido em até 1 minuto após `paid_at`, o pedido deve estar pendente.

### 4.2 Logs da Lambda

* Acesse o CloudWatch da função `b4you-production-blingShipping`.
* Filtre por campo `id_sale` para encontrar exceções ou status HTTP ≥ 400.

## 5. Critérios de Validação

* **Preenchimento do `id_order_bling`:** após reprocessar, o pedido deve aparecer com o campo populado.
* **Ausência de duplicação:** certifique‑se de que não há registros duplicados na Bling para o mesmo `sale_id` antes de efetuar redisparo.
* **Erros de API resolvidos:** não deve haver retornos 500, 429 (rate limit) ou problemas de autenticação.

## 6. Pontos de Atenção

* **CEP e cidade:** valide o CEP e o nome da cidade usando a API dos Correios para garantir consistência e evitar erros de rotulagem.
* **Token de acesso do Bling:** confirme que o token do cliente está ativo e dentro do prazo de validade.
* **Erros registrados:** antes de analisar mais profundamente, consulte a tabela `bling_errors` para identificar se o problema do ticket está ali e decidir se uma nova tentativa é necessária, até para evitar duplicação de pedidos.
* **Acesso via dashboard:** a depender do cenário, informe ao produtor que ele pode verificar e corrigir erros diretamente pelo botão disponível na dashboard.
* **Mecanismo de retry:** já existe política de retries exponenciais para tratar falhas temporárias na API da Bling, evitando sobrecarga e respeitando limites de taxa.

> **Observação:** Confirme todos os passos antes de mover o ticket para **Concluído**.