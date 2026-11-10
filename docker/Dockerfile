# Build from the repository root with -f docker/Dockerfile.
# Mount deployment settings over /usr/share/nginx/html/config.js at runtime.
FROM node:24-bookworm AS build

WORKDIR /app
# Enforce the build toolchain required by package.json.
RUN chown node:node /app && \
    npm install --global npm@12 && \
    test "$(node --version | cut -d. -f1)" = "v24" && \
    test "$(npm --version | cut -d. -f1)" = "12"

# Cache dependencies independently of application source changes.
COPY --chown=node:node package.json package-lock.json ./
USER node
# PCIC component libraries are direct Git dependencies.
RUN npm ci --allow-git=root
COPY --chown=node:node . .

ARG REACT_APP_VERSION
RUN npm run build

FROM nginx/nginx-unprivileged:stable-alpine AS runtime

COPY --from=build /app/build /usr/share/nginx/html
COPY docker/frontend.conf /etc/nginx/conf.d/default.conf

USER nginx
EXPOSE 3000