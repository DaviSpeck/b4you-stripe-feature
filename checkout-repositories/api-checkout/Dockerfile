FROM node:22-alpine AS builder
WORKDIR /usr/app
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile --production=false
COPY . .

FROM node:22-alpine AS production
WORKDIR /usr/app
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile --production=true && yarn cache clean
COPY . .
EXPOSE 5500
CMD ["node", "server.js"]
