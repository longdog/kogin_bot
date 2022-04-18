FROM node:16.13.0

RUN npm install pm2 -g

WORKDIR /app/
COPY . .

RUN yarn config set network-timeout 600000 -g

RUN yarn

CMD ["pm2-runtime",  "process.json"]