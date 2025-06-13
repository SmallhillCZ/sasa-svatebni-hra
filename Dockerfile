# FRONTEND
FROM node:22-alpine AS fe

WORKDIR /app

COPY ./frontend/package.json ./frontend/package-lock.json ./
RUN npm ci

COPY ./frontend .
RUN npm run build


# BACKEND
FROM node:22-alpine AS be

WORKDIR /app

COPY ./backend/package.json ./backend/package-lock.json ./
RUN npm ci

COPY ./backend .
RUN npm run build

ENV NODE_ENV=production
RUN npm prune

COPY --from=fe /app/dist/browser /app/public

ENV PORT=3000
ENV HOST=0.0.0.0

EXPOSE 3000

CMD ["npm","start"]