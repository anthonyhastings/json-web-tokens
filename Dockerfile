FROM node:14.17.0-alpine

LABEL maintainer="Anthony Hastings <ar.hastings@gmail.com>"

RUN apk add --no-cache openssl

ENV DOCKERIZE_VERSION v0.6.1
RUN wget https://github.com/jwilder/dockerize/releases/download/$DOCKERIZE_VERSION/dockerize-alpine-linux-amd64-$DOCKERIZE_VERSION.tar.gz \
  && tar -C /usr/local/bin -xzvf dockerize-alpine-linux-amd64-$DOCKERIZE_VERSION.tar.gz \
  && rm dockerize-alpine-linux-amd64-$DOCKERIZE_VERSION.tar.gz

RUN apk add --no-cache bash

USER node

WORKDIR /home/node

COPY --chown=node package.json package-lock.json ./

RUN npm install

COPY --chown=node . ./

CMD npm run auth-service
