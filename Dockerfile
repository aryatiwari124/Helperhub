FROM node:20-alpine AS client-build

WORKDIR /app/client
COPY client/package*.json ./
RUN npm install
COPY client .

ARG VITE_API_URL=/api/v1
ARG VITE_GOOGLE_CLIENT_ID
ENV VITE_API_URL=$VITE_API_URL
ENV VITE_GOOGLE_CLIENT_ID=$VITE_GOOGLE_CLIENT_ID
RUN npm run build

FROM node:20-alpine

WORKDIR /app
COPY server/package*.json ./server/
RUN npm install --prefix server --omit=dev
COPY server ./server
COPY --from=client-build /app/client/dist ./client/dist

ENV NODE_ENV=production
EXPOSE 10000
CMD ["npm", "start", "--prefix", "server"]