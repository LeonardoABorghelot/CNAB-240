# Frontend
FROM node:20-buster AS build-frontend

WORKDIR /frontend
COPY cnab-front/package*.json ./
RUN npm install

COPY cnab-front/ ./
RUN npm run build

# Backend
FROM node:20-buster

WORKDIR /app

COPY cnab-banrisul/package*.json ./
RUN npm install

COPY cnab-banrisul/ ./
RUN npm run build

COPY --from=build-frontend /frontend/dist ./cnab-front/dist

EXPOSE 90

CMD ["node", "dist/server.js"]
