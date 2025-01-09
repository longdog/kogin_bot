FROM node:18.12.0
ENV NODE_ENV=production \
    NPM_CONFIG_LOGLEVEL=warn
RUN apt-get -qq update && apt-get -qq -y upgrade
RUN apt-get install -y curl git python3

WORKDIR /app/
COPY ./package.json ./yarn.lock ./
RUN yarn config set network-timeout 600000 -g
RUN yarn
COPY . .
CMD ["node", "index.js"]