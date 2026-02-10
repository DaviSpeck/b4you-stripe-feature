---
title: Sandbox por Branch
---

# Sandbox por Branch

Este documento descreve o funcionamento do **Sandbox por Branch**, uma estratégia que permite subir **múltiplas versões da API simultaneamente**, cada uma associada a uma branch específica, sem conflito entre desenvolvedores ou fluxos de QA.

---

## Visão Geral

O sandbox por branch permite:

- Associar cada branch a uma **porta fixa**
- Expor a API via **subdomínio**
- Testar múltiplas features em paralelo
- Evitar conflitos entre desenvolvedores
- Integrar facilmente com **Vercel Preview**

---

## Arquitetura Resumida

```
Cloudflare (DNS + TLS)
        ↓
      EC2
        ↓
     NGINX
        ↓
 Docker Containers (1 por branch)
```

Cada branch ativa corresponde a **um container Docker** rodando em uma porta dedicada.

---

## Pré-requisitos

- EC2 configurada
- Docker e Docker Compose instalados
- NGINX configurado como proxy reverso
- Cloudflare configurado para o domínio sandbox
- Acesso SSH à instância

---

## Conceito de Porta por Branch

Cada branch gera uma **porta estável**, normalmente derivada de um hash do nome da branch.

Exemplo:

```
feature/BT-432-checkout → porta 18043
```

Essa porta é utilizada pelo container Docker e mapeada pelo NGINX.

---

## Scripts Oficiais

Os scripts abaixo são a **fonte da verdade** e vivem no repositório da API.

📁 Localização no projeto:
```
./static/testing-environment/scripts/
├── sandbox.sh
├── expose-branch.sh
└── unexpose-branch.sh
```

### `sandbox.sh`
Responsável por:
- Criar e subir containers Docker
- Definir a porta da branch
- Carregar variáveis de ambiente do sandbox

### `expose-branch.sh`
Responsável por:
- Criar regra no NGINX
- Expor a API via subdomínio
- Atualizar o proxy reverso

### `unexpose-branch.sh`
Responsável por:
- Remover regra do NGINX
- Derrubar exposição externa
- Limpar configurações antigas

📌 **Sempre consulte o código atualizado no repositório**, não copie scripts para fora dele.

---

## Docker Sandbox

A configuração Docker do sandbox está centralizada em:

📁 Localização no projeto:
```
./static/testing-environment/docker/sandbox/
├── Dockerfile.sandbox
├── docker-compose.yml
└── README.md
```

O `README.md` dessa pasta contém:
- Como subir manualmente
- Como rebuildar
- Variáveis esperadas
- Boas práticas de operação

---

## Variáveis de Ambiente

As variáveis de ambiente **não devem ser versionadas**.

Arquivo de exemplo:
```
.env.sandbox.example
```

Arquivo real (ignorado pelo Git):
```
.env.sandbox
```

⚠️ Nunca versionar:
- AWS keys
- JWT private key
- Tokens de terceiros (Pagar.me, OneSignal, etc.)

---

## Fluxo de Uso no Dia a Dia

1. Criar ou atualizar a branch
2. Executar `sandbox.sh`
3. Executar `expose-branch.sh`
4. Apontar subdomínio no Cloudflare
5. Consumir a API pelo front (Vercel Preview)
6. Validar logs e comportamento
7. Executar `unexpose-branch.sh` ao finalizar

---

## Integração com Vercel

O front-end em preview deve apontar para:

```
https://api-<branch>.b4you-sandbox.com.br
```

Esse domínio é resolvido pelo Cloudflare e roteado pelo NGINX para a porta correta.

---

## Troubleshooting

### Domínio não responde
- Verifique DNS no Cloudflare
- Confirme regra do NGINX
- Verifique se o container está rodando

### Porta não responde
- Verifique conflitos de porta
- Confirme mapeamento no Docker
- Reinicie o container

### Código não atualizou
- Rebuild do container
- Limpe cache
- Confirme se a branch correta está ativa

---

## Observações Importantes

- Nunca reutilize portas manualmente
- Derrube sandboxes antigas
- Documente branches expostas
- Utilize apenas dados de teste

---

> ⚠️ Ambientes sandbox não possuem garantia de disponibilidade.  
> Utilizar apenas para testes e validações internas.