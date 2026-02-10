---
title: Configuração de Checkout Transparente
---

# Configuração de Checkout Transparente

Este documento descreve o **processo completo de configuração** do Checkout Transparente, desde DNS e certificados até ajustes em back-end, front-end e segurança.

---

## 1. Visão Geral

O Checkout Transparente permite que o pagamento seja realizado em um **subdomínio do produtor**, mantendo toda a lógica e processamento sob responsabilidade da B4You.

Exemplo:
```
https://seguro.seudominio.com.br
```

---

## 2. Checkout Atual (CloudFront + React)

### 2.1 Configuração de DNS (Produtor)

#### Registro 1 – Validação de Certificado (ACM)

- Tipo: CNAME  
- Nome: `_hash.seudominio.com.br`
- Valor: `_hash.acm-validations.aws`
- Proxy: DESATIVADO

📌 **Observação (print recomendado):**  
Print do painel de DNS do cliente com o registro de validação corretamente configurado.

![Painel DNS – Validação de Certificado ACM](/img/transparent-checkout/painel-dns-checkout-transparente-cliente-ACM.jpeg)

---

#### Registro 2 – Apontamento para o Checkout

- Tipo: CNAME  
- Nome: `seguro`
- Valor: `d2azl1blw0n9f7.cloudfront.net`
- Proxy: DESATIVADO

📌 **Observação (print recomendado):**  
Print do CNAME `seguro` apontando para o CloudFront.

![Painel DNS – Configuração do subdomínio](/img/transparent-checkout/painel-dns-checkout-transparente-cliente-SEGURO.jpeg)

---

### 2.2 Certificado SSL (AWS ACM)

- Região obrigatória: **us-east-1**
- O novo certificado deve conter:
  - Todos os domínios existentes
  - + o novo domínio transparente

📌 **Observações (prints recomendados):**
- Região selecionada no ACM
- Certificado base
- Novo domínio com status “Validação pendente”
- Certificado validado com status “Êxito”

![Região selecionada no ACM](/img/transparent-checkout/regiao-us-east-1-aws.png)
![Certificado base no ACM](/img/transparent-checkout/certificado-base-acm-aws.png)
![Novo domínio com status “Validação pendente”](/img/transparent-checkout/novos-dominios-com-status-pendente.png)
![Certificado validado com status “Êxito”](/img/transparent-checkout/dominios-antigos-com-status-exito.png)

---

### 2.3 CloudFront

- Adicionar o novo domínio como **Alternate Domain Name**
- Identificar corretamente qual das distribuições será utilizada

📌 **Observação (print recomendado):**  
Print da distribuição CloudFront com o domínio listado.

![Distribuição CloudFront na AWS](/img/transparent-checkout/distribuicao-cloudfront-aws.png)

---

### 2.4 Back-end – api-checkout

#### 2.4.1 CORS

- Adicionar o domínio transparente nos domínios autorizados

📌 **Observação (print opcional):**  
Print do arquivo `cors.js` com o domínio incluído.

```js
const allowedOrigins = [
  ...
  'https://seguro.nandaintimus.com.br',
  'https://seguro.sejaziva.com.br'
];
```

---

#### 2.4.2 Cloudflare Turnstile

- Existe limite de **10 hostnames por chave**
- Alguns domínios utilizam a **chave 2**

Arquivos afetados:
- `offers.js`
- `sales.js`

📌 **Observações (prints recomendados):**
- Print do array de domínios da chave 2
- Print da chave Turnstile no Cloudflare com o domínio configurado

```js
    const turnstileKey2Domains = [
      ...
      'seguro.nandaintimus.com.br',
      'seguro.sejaziva.com.br',
    ];

    const isTurnstileKey2Domain = turnstileKey2Domains.some((domain) =>
      requestDomain.includes(domain),
    );

    const site_key =
      process.env.ENVIRONMENT === 'PRODUCTION' && isTurnstileKey2Domain
        ? process.env.TURNSTILE_SITE_KEY_2
        : process.env.TURNSTILE_SITE_KEY;
```

```js
      const turnstileKey2Domains = [
        ...
        "seguro.nandaintimus.com.br",
        "seguro.sejaziva.com.br",
      ];

      const isTurnstileKey2Domain = turnstileKey2Domains.some((domain) =>
        requestDomain.includes(domain),
      );

      const secret = isTurnstileKey2Domain
        ? process.env.TURNSTILE_SECRET_KEY_2
        : process.env.TURNSTILE_SECRET_KEY;

      const response = await axios.post(
        'https://challenges.cloudflare.com/turnstile/v0/siteverify',
        {
          secret,
          response: token,
          remoteip: req.ip,
        },
      );
```

![Dashboard turnstile na Cloudflare](/img/transparent-checkout/dashboard-turnstile-cloudflare.png)

---

### 2.5 Front-end – sixbase-checkout

Arquivo: `api.js`

- O endpoint da API é resolvido com base no `window.location.host`
- O novo domínio deve ser incluído manualmente

📌 **Observação (print opcional):**  
Print do bloco condicional com o novo domínio.

```js
unction getBaseUrl() {
  try {
    // eslint-disable-next-line no-undef
    return process?.env?.REACT_APP_BASE_URL;
  } catch {
    return 'http://localhost:5501';
  }
}

if (getBaseUrl()) {
  endpoint = getBaseUrl();
}else if (host.includes('sandbox')) {
  endpoint = 'https://api-checkout-sandbox.b4you.com.br';
} else if (
  host.includes('checkout.b4you.com.br') ||
  host.includes('seguro.nandaintimus.com.br') ||
  host.includes('seguro.sejaziva.com.br')
) {
  endpoint = 'https://api-checkout.b4you.com.br';
} else {
  endpoint = 'https://api-checkout-sandbox.b4you.com.br';
}

const api = axios.create({
  baseURL: `${endpoint}/api/checkout`,
  withCredentials: true,
});
```

---

### 2.6 Cloudflare – B4You

- O domínio deve ser adicionado a uma chave Turnstile válida
- Solicitação deve ser encaminhada ao responsável pela conta

📌 **Observação (print recomendado):**  
Print do painel do Cloudflare confirmando o hostname ativo.

![Dashboard turnstile na Cloudflare](/img/transparent-checkout/dashboard-turnstile-cloudflare.png)

---

## 3. Novo Checkout (Vercel + Next.js)

### 3.1 Configuração de Domínio

- Domínio configurado diretamente no projeto da Vercel
- Registros padrão:
  - TXT
  - CNAME

📌 **Observações (prints recomendados):**
- Aba Domains do projeto
- Instruções de DNS geradas pela Vercel


![Registros na configuração de domínio CNAME](/img/transparent-checkout/configuracao-dominio-vercel.png)
![Registros na configuração de domínio TXT](/img/transparent-checkout/configuracao-dominio-vercel-TXT.png)
![Aba de domínios na Vercel](/img/transparent-checkout/aba-dominios-vercel.png)

---

### 3.2 Middleware (CORS + CSP)

Arquivo: `middleware.ts`

Responsável por:
- CORS
- Content-Security-Policy
- Compatibilidade com Cloudflare Turnstile

⚠️ Regras importantes:
- Não utilizar `X-Frame-Options`
- CSP varia conforme ambiente e protocolo

📌 **Observação (print opcional):**  
Print dos blocos de CSP para produção e ambiente local.

```js
function Cors(req: NextRequest): { allowedOrigin: boolean } {
  const allowedOrigins = [
    env.NEXT_PUBLIC_REACT_APP_BASE_URL,
    env.NEXT_PUBLIC_REACT_APP_BASE_URL_INTERNAL,
  ].map((o) => o.replace(/^https?:\/\//, "").toLowerCase());

  const originHeader = req.headers.get("origin")?.toLowerCase();
  const forwardedProto = req.headers.get("x-forwarded-proto") || "http";
  const forwardedHost = req.headers.get("x-forwarded-host") || "";

  const host = `${forwardedProto}://${forwardedHost}`
    .replace(/^https?:\/\//, "")
    .toLowerCase();

  const isValidOrigin = originHeader
    ? allowedOrigins.includes(originHeader.replace(/^https?:\/\//, ""))
    : true;

  const isValidHost = host ? allowedOrigins.includes(host) : true;

  return { allowedOrigin: isValidOrigin && isValidHost };
}
```

---

## 4. Checklist Final

- [ ] DNS configurado corretamente
- [ ] Certificado validado
- [ ] Domínio no CloudFront
- [ ] CORS atualizado
- [ ] Turnstile configurado
- [ ] Front-end ajustado
- [ ] Teste de pagamento concluído

---

## 5. Observação – Multiadquirência

🚧 Em implementação (Dezembro/2025)

Quando o serviço de multiadquirência estiver ativo, este documento deve ser revisado para validar se novas configurações serão necessárias para checkout transparente.

---

> ⚠️ Qualquer erro nessa configuração pode gerar falha de pagamento sem feedback visual ao usuário final.  
> Sempre validar em sandbox antes de produção.