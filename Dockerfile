FROM node:20-alpine

WORKDIR /app
COPY client/package*.json ./client/
COPY server/package*.json ./server/
RUN npm install --prefix client && npm install --prefix server
COPY client ./client
COPY server ./server

EXPOSE 5000 5173
CMD ["sh", "-c", "npm start --prefix server & npm run dev --prefix client -- --host 0.0.0.0"]