FROM node:16

WORKDIR  /usr/src/app

COPY package*json ./
#RUN npm ci --only=production

RUN npm install
COPY . .

EXPOSE 3001

CMD ["node", "app.js"]