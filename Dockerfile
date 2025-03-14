FROM hub.hamdocker.ir/node:22.13.1 AS base

RUN apt update && \
    apt install -y --no-install-recommends \
    software-properties-common \
    ca-certificates && \
    apt update



RUN  apt install wait-for-it -y

WORKDIR /app

COPY package.json ./
COPY package-lock.json ./

RUN npm install -g npm@latest

RUN npm install

RUN npm cache verify


COPY . .
COPY docker-entrypoint.sh /docker-entrypoint.sh

RUN chmod +x /docker-entrypoint.sh


FROM base AS dev

ENV NODE_ENV=DEV

RUN npm -g add @nestjs/cli

CMD ["/docker-entrypoint.sh"]


FROM base AS prod

ENV NODE_ENV=PROD
RUN npm prune --production

RUN npm install pm2 -g

RUN npm cache clean --force && rm -rf /tmp/*

CMD ["/docker-entrypoint.sh"]
