FROM node:alpine

RUN mkdir -p /app
WORKDIR /app

COPY . /app/
RUN npm install

ENTRYPOINT /bin/sh
