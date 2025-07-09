# ---------- Build stage ----------
FROM python:3.11-slim AS builder
WORKDIR /app
ENV POETRY_VERSION=1.8.2 \
    POETRY_HOME=/opt/poetry \
    PATH="/opt/poetry/bin:$PATH"
RUN pip install --no-cache-dir poetry==$POETRY_VERSION

COPY backend/pyproject.toml backend/poetry.lock* /app/
RUN poetry install --no-root --no-dev

# ---------- Runtime stage ----------
FROM python:3.11-slim
WORKDIR /app
COPY --from=builder /root/.cache /root/.cache
COPY --from=builder /app /app
ENV PYTHONUNBUFFERED=1
CMD ["poetry", "run", "uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
