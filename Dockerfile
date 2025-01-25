FROM node:20-slim

WORKDIR /app

COPY . .

RUN npm install

RUN npm run build

ENV PORT=3000
ENV NODE_ENV=production

EXPOSE 3000

CMD [ "npm", "start" ]
