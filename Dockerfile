FROM node:18 AS deps
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci --omit=dev

FROM node:18 AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

FROM node:18-slim AS runtime
WORKDIR /app
RUN apt-get update && apt-get install -y python3 python3-pip && rm -rf /var/lib/apt/lists/*
COPY python-backend ./python-backend
COPY python-backend/requirements.txt ./python-backend/requirements.txt
RUN pip3 install --no-cache-dir -r python-backend/requirements.txt
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/next.config.js ./next.config.js
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
EXPOSE 3000 8000
CMD uvicorn python-backend.main:app --host 0.0.0.0 --port 8000 & npm start
