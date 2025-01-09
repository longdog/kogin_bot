FROM keymetrics/pm2:18-slim
ENV NODE_ENV=production \
    NPM_CONFIG_LOGLEVEL=warn
RUN apt-get -qq update && apt-get -qq -y upgrade
RUN apt-get install -y curl git python3

WORKDIR /app/
COPY ./package.json ./yarn.lock ./
RUN yarn config set network-timeout 600000 -g
RUN yarn
COPY . .
CMD ["pm2-runtime",  "process.json"]