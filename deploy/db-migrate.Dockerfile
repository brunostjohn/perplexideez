FROM node:20-slim AS base
RUN mkdir /app && chown node:node /app
RUN apt-get update -y && apt-get install -y openssl
RUN npm i -g prisma@^5.21.1
USER node
WORKDIR /app
COPY ./package.json /app
COPY ./prisma /app/prisma

CMD [ "npx", "prisma", "migrate", "deploy" ]