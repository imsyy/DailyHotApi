FROM node:16-alpine
WORKDIR /app

COPY package*.json ./
RUN npm install --production

COPY . .

EXPOSE 6688
CMD ["npm", "start"]