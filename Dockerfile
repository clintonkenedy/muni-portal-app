# Build stage
FROM node:22-alpine AS builder
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
# Public build-time settings (see .env.example). Pass them as build args, or
# provide a .env / .env.prod file in the build context instead.
ARG API_CORE_URL
ARG OIDC_AUTHORITY
ARG OIDC_CLIENT_ID
ARG OIDC_REDIRECT_URI
ARG OIDC_POST_LOGOUT_REDIRECT_URI
ARG OIDC_SCOPE
# An empty build arg is unset, so it never hides a value from a .env file that the
# platform (e.g. Dokploy "Environment") wrote into the build context.
RUN for v in API_CORE_URL OIDC_AUTHORITY OIDC_CLIENT_ID OIDC_REDIRECT_URI \
        OIDC_POST_LOGOUT_REDIRECT_URI OIDC_SCOPE; do \
        [ -n "$(printenv "$v")" ] || unset "$v"; \
    done; \
    npx quasar build

# Production stage
FROM nginx:alpine
RUN rm -rf /usr/share/nginx/html/*
COPY --from=builder /app/dist/spa /usr/share/nginx/html
# SPA fallback (history mode)
COPY ./nginx/default.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
