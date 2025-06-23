# Stage 1: build Next.js frontend
FROM node:20-alpine AS frontend
WORKDIR /app
COPY package.json ./
# install dependencies
RUN npm install
# copy source
COPY . .
RUN npm run build

# Stage 2: run FastAPI backend
FROM python:3.11-slim as backend
WORKDIR /app

# install python dependencies
COPY python-backend/requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

# copy backend source
COPY python-backend ./python-backend

# copy built frontend from previous stage
COPY --from=frontend /app/.next ./frontend/.next
COPY --from=frontend /app/public ./frontend/public
COPY --from=frontend /app/next.config.js ./frontend/next.config.js

EXPOSE 8000
CMD ["uvicorn", "main:app", "--app-dir", "python-backend", "--host", "0.0.0.0", "--port", "8000"]
