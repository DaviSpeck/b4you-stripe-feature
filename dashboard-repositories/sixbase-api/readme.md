# Sixbase-Api

Nesse repositório encontra-se a API para controle interno da aplicação.

## Requerimentos

- [Node](https://nodejs.org/en/)
- [Redis](https://redis.io/)
- [Mysql](https://www.mysql.com/)
- [Npm](https://www.npmjs.com/)
- [Yarn](https://yarnpkg.com/)
- [Git](https://git-scm.com/)

## Instalação e Configuração

Baixar repositório

```bash
$ git clone git@github.com:sixbasebr/sixbase-api.git
```

Instalar dependências do projeto

```bash
$ yarn
```

Criar arquivo com variáveis de ambiente e na sequencia preencher as configurações da sua máquina de desenvolvimento. As chaves necessárias estão no arquivo ".env-example"

```bash
$ touch .env.dev
```

Rodar migrations

```bash
$ yarn migrate:dev
```

Rodar seeds

```bash
$ yarn seed:dev
```

## Iniciar projeto

```bash
$ yarn start
```

## Comandos adicionais

Criar migration

```bash
$ yarn migrate:create update-product
```

Desfazer última migration

```bash
$ yarn migrate:dev:undo
```

Rodar testes

```bash
$ yarn test
```

Limpar área de trabalho local e instalar dependências novamente

```bash
$ yarn clean:workspace
```

## Contribuintes do projeto

https://github.com/lorexp

https://github.com/danilodemaria

https://github.com/danielmenegasso

https://github.com/palmaxp

## License

[MIT](https://choosealicense.com/licenses/mit/)
