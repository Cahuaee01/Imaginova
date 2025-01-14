FROM node:18.7.0-bullseye
WORKDIR /app
COPY ./package*.json ./

# Installare una versione specifica di npm compatibile con Node.js 18
RUN npm install -g npm@8.19.4 && npm install

COPY . .

CMD ["npm", "start"]
