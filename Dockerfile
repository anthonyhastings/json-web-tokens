FROM node:13.2.0-alpine
LABEL maintainer="Anthony Hastings <ar.hastings@gmail.com>"

WORKDIR /json-web-tokens

RUN apk add --no-cache openssl
ENV DOCKERIZE_VERSION v0.6.1
RUN wget https://github.com/jwilder/dockerize/releases/download/$DOCKERIZE_VERSION/dockerize-alpine-linux-amd64-$DOCKERIZE_VERSION.tar.gz \
  && tar -C /usr/local/bin -xzvf dockerize-alpine-linux-amd64-$DOCKERIZE_VERSION.tar.gz \
  && rm dockerize-alpine-linux-amd64-$DOCKERIZE_VERSION.tar.gz

RUN apk add --no-cache bash

COPY package.json package-lock.json ./

RUN npm install

COPY . ./

CMD npm run auth-service
