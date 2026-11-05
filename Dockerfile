FROM node:22-alpine AS build

WORKDIR /src

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

ARG VITE_API_BASE_URL=/api/v1
ARG BASE_PATH=/
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
ENV BASE_PATH=$BASE_PATH

RUN npm run build

FROM nginx:1.28-alpine

COPY nginx.conf.template /etc/nginx/templates/default.conf.template
COPY --from=build /src/dist /usr/share/nginx/html

ENV API_UPSTREAM=server:8080
ENV NGINX_ENVSUBST_FILTER=API_UPSTREAM

EXPOSE 80
