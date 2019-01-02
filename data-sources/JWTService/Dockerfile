FROM node:10.13.0-alpine
WORKDIR /server/
COPY certs certs
COPY package.json package.json
COPY package-lock.json package-lock.json
COPY server.js server.js

RUN npm ci

CMD node server.js
