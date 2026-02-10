---
title: Otimização de Custos
---

# Otimização de Custos

Este guia apresenta práticas para reduzir e controlar gastos na AWS e na Cloudflare.

## 1. Monitoramento de Custos
- Configure orçamentos no AWS Cost Explorer com alertas por e-mail.
- Use tags de custo em recursos (ambiente, serviço, equipe).
- Analise relatórios mensais de uso por serviço e região.

## 2. Direitos de Recursos
- **EC2 & ECS**: 
  - Faça *rightsizing* baseado em métricas de CPU/RAM.
  - Utilize instâncias Spot para workloads tolerantes a interrupções.
- **RDS**:
  - Avalie instâncias reservadas ou Savings Plans.
  - Ajuste IOPS conforme necessidade.
- **Lambda & Fargate**:
  - Defina timeout e memória mínimos adequados.
  - Monitore invocações e duração média.

## 3. Armazenamento
- **S3**:
  - Habilite lifecycle rules para mover dados antigos para classes Glacier.
  - Use versionamento apenas quando necessário.
- **EBS**:
  - Delete volumes não utilizados.
  - Confira snapshots antigos e remova os obsoletos.

## 4. Rede e CDN
- **CloudFront**:
  - Ajuste TTL de cache para reduzir origin fetch.
  - Use políticas de compressão e minificação.
- **Cloudflare**:
  - Habilite cache Padrão e Regras de Página para ativos estáticos.
  - Utilize plano gratuito/profissional conforme tráfego.

## 5. Automação e Revisão
- Revise mensalmente os relatórios de custos.
- Automatize desligamento de ambientes dev/staging fora do horário de trabalho.
- Use scripts (ex: `aws ec2 stop-instances`) via AWS Lambda programado.