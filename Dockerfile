FROM node:10.15.0-alpine

WORKDIR /app
COPY package-lock.json .
COPY package.json .

RUN apk --no-cache add \
      ca-certificates \
      lz4-dev \
      musl-dev \
      cyrus-sasl-dev \
      openssl-dev \
      python \
  && \
    apk add --no-cache --virtual .build-deps \
      bash \
      g++ \
      gcc \
      zlib-dev \
      libc-dev \
      make \
      bsd-compat-headers \
      py-setuptools \
      bash \
  && \
    npm ci \
  && \
    apk del .build-deps

COPY .babelrc .
COPY src src

RUN npm run build

CMD npm start
