---
title: Mapeamento GitHub ⇄ AWS
---

# Mapeamento GitHub ⇄ AWS

Este documento mapeia os diretórios do repositório `b4you-lambdas` com os respectivos serviços implantados na AWS.

| **Diretório (GitHub)** | **Serviço AWS** |
| --- | --- |
| js/abandonedCart/ | b4you-sandbox-abandoned-cart, b4you-production-abandoned-cart (Lambda) |
| js/abandonedCartOnly/ | b4you-production-abandonedCartOnly (Lambda) |
| js/abandonedCartSale/ | b4you-production-abandonedCartSale (Lambda) |
| js/affiliateInvite/ | b4you-sandbox-affiliateUserInvite, b4you-production-affiliateUserInvite (Lambda) |
| js/affiliateMarket/ | b4you-sandbox-affiliate-market, b4you-production-affiliate-market (Lambda) |
| js/apiGatewayMerlin/ | production-api-merlin (API Gateway) |
| js/approvedPaymentNotifications/ | b4you-sandbox-ApprovedPaymentNotifications, b4you-production-ApprovedPaymentNotifications (Lambda) |
| js/arcoTracking/ | production-api-arco-tracking (API Gateway) |
| js/blingInvoices/ | b4you-production-blingInvoicesNF (Lambda) |
| js/blingShipping/ | b4you-sandbox-blingShipping, b4you-production-blingShipping (Lambda) |
| js/blingShippingAttracione/ | b4you-production-blingShippingAttracione (Lambda) |
| js/blingTracking/ | b4you-production-blingTracking (Lambda) |
| js/callbackWithdrawals/ | b4you-sandbox-callbacks, b4you-production-callbacks (Lambda) / api-callbacks (API Gateway) |
| js/callbacksCard/ | b4you-sandbox-callbacksCard, b4you-production-callbacksCard (Lambda) |
| js/chargePix/ | b4you-production-chargePix (Lambda) |
| js/chargeSubscriptions/ | b4you-production-chargeSubscriptions (Lambda) |
| js/collaboratorsActivity/ | b4you-sandbox-collaboratorsActivity, b4you-production-collaboratorsActivity (Lambda) |
| js/confirmSplits/ | b4you-sandbox-confirmSplits, b4you-production-confirmSplits (Lambda) |
| js/enotas/ | b4you-sandbox-enotas, b4you-production-enotas (Lambda) |
| js/exportSales/ | b4you-sandbox-exportSales, b4you-production-exportSales (Lambda)? |
| js/exportSalesLambda/ | b4you-sandbox-exportSales, b4you-production-exportSales (Lambda)? |
| js/exportSalesShipping/ | b4you-sandbox-exportSalesShipping, b4you-production-exportSalesShipping (Lambda) |
| js/generatedNotifications/ | b4you-sandbox-generateNotifications, b4you-production-generateNotifications (Lambda) |
| js/getPagarmeBalances/ | b4you-production-getPagarmeBalances (Lambda) |
| js/groupSales/ | b4you-sandbox-groupSales, b4you-production-groupSales (Lambda) |
| js/importSalesShipping/ | b4you-sandbox-importSalesShipping, b4you-production-importSalesShipping (Lambda) |
| js/integrations/ | b4you-sandbox-integrations, b4you-production-integrations (Lambda) |
| js/invision/ | b4you-production-invision (Lambda) |
| js/metricsHourly/ | b4you-sandbox-sales-metrics-hourly, b4you-production-sales-metrics-hourly (Lambda) |
| js/notazz/ | b4you-sandbox-notazz, b4you-production-notazz (Lambda) |
| js/notazzLuatonina/ | b4you-production-notazz-luatonina (Lambda) |
| js/notazzTracking/ | b4you-sandbox-notazzTracking (Lambda), sandbox-api-notazz-tracking (API Gateway) |
| js/notifySubscriptionsPix/ | b4you-production-notifySubscriptionPix (Lambda) |
| js/pagarmeCreateSeller/ | b4you-sandbox-create-seller-pagarme, b4you-production-create-seller-pagarme (Lambda) |
| js/pagarmePaidCharge/ | b4you-production-pagarmePaidCharge (Lambda) |
| js/payCommissions/ | b4you-production-payCommissions (Lambda) |
| js/pendingPaymentEmail/ | b4you-production-pendingPaymentEmail (Lambda) |
| js/referralCommission/ | b4you-sandbox-referralCommission, b4you-production-referralCommission (Lambda) |
| js/refunds/ | b4you-production-refunds (Lambda) |
| js/requestWithdrawal/ | b4you-sandbox-requestWithdrawal, b4you-production-requestWithdrawal (Lambda) |
| js/splitCommissions/ | b4you-sandbox-splitCommissions, b4you-production-splitCommissions (Lambda) |
| js/studentApprovedPaymentEmails/ | b4you-sandbox-studentApprovedPaymentEmails, b4you-production-studentApprovedPaymentEmails (Lambda) |
| js/userMetrics/ | ? |
| js/usersRevenue/ | b4you-sandbox-usersRevenue, b4you-production-usersRevenue (Lambda) |
| js/webhookEvent/ | b4you-sandbox-webhookEvent, b4you-production-webhookEvent (Lambda) |
| go/payReferralCommissions/ | b4you-sandbox-payReferralCommissions, b4you-production-payReferralCommissions (Lambda) |
