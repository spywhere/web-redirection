FROM node:17-alpine AS build

ARG NODE_ENV=production
ENV NODE_ENV $NODE_ENV

RUN apk add --no-cache tzdata python3 make bash dumb-init

RUN cp /usr/share/zoneinfo/Asia/Bangkok /etc/localtime && \
echo "Asia/Bangkok" > /etc/timezone && \
apk del tzdata

SHELL ["/bin/bash", "-o", "pipefail", "-c"]

RUN mkdir /opt/app && chown -R node:node /opt/app
WORKDIR /opt/app
USER node

EXPOSE 8000

FROM build AS base
COPY --chown=node:node package*.json ./
RUN npm ci --only=production && npm cache clean --force

FROM base AS source
COPY --chown=node:node ./ /opt/app/

FROM source AS prod
ENV NODE_ENV=production

ENTRYPOINT ["dumb-init", "--"]
CMD ["sh", "-c", "npm start"]
