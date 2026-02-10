---
title: AWS
---

# AWS - Visão Geral

Resumo dos principais serviços da AWS utilizados pela B4YOU e suas finalidades.

### 🔧 Execução

| Serviço | Uso principal |
| --- | --- |
| **ECS (Fargate)** | Backend containerizado (`sixbase-api`, `api-checkout`) |
| **AWS Lambda** | Workers assíncronos (ex: reembolso, carrinho) |
| **EC2 / Lightsail** | Serviços auxiliares ou legados |

---

### 🌐 Front-end e CDN

| Serviço | Uso principal |
| --- | --- |
| **S3 + CloudFront** | Sites estáticos e entrega de assets via CDN |
| **AWS Amplify** | Deploy automático do front integrado ao Git |
| **Route 53 + ACM** | DNS e certificados SSL |

---

### 📨 Filas e Mensageria

| Serviço | Uso principal |
| --- | --- |
| **Amazon SQS** | Comunicação assíncrona entre serviços |

---

### 📩 Dados e Cache

| Serviço | Uso principal |
| --- | --- |
| **Aurora (MySQL)** | Banco relacional principal |
| **DynamoDB** | Dados auxiliares de leitura rápida (se aplicável) |
| **ElastiCache (Redis)** | Cache para sessões e autenticação |

---

### 🔐 Segurança e Variáveis

| Serviço | Uso principal |
| --- | --- |
| **Secrets Manager** | Tokens e credenciais sensíveis |
| **IAM** | Permissões entre serviços |

---

### 📈 Monitoramento

| Serviço | Uso principal |
| --- | --- |
| **CloudWatch** | Tokens e credenciais sensíveis |
| **(Futuro) Prometheus/Grafana** | Observabilidade mais avançada |