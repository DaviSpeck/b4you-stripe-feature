FROM node:22-alpine
ENV TZ="America/Sao_Paulo"
WORKDIR /usr/app

COPY package*.json ./
RUN yarn install --frozen-lockfile && yarn cache clean --all

COPY . .
EXPOSE 5000

CMD ["yarn", "start"]