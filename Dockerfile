FROM python:3.11-slim AS python-builder

ENV PYTHONUNBUFFERED=1
ENV PYTHONDONTWRITEBYTECODE=1

WORKDIR /app

    curl \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

ADD https://astral.sh/uv/install.sh /uv-installer.sh
RUN sh /uv-installer.sh && rm /uv-installer.sh
ENV PATH="/root/.local/bin/:$PATH"

COPY pyproject.toml uv.lock ./

RUN uv venv .venv && \
    uv pip install --python .venv/bin/python -r pyproject.toml


FROM node:20-slim AS node-builder

ENV NEXT_TELEMETRY_DISABLED=1
WORKDIR /app/dashboard

COPY dashboard/package.json dashboard/package-lock.json ./
RUN npm ci

COPY dashboard/ ./
RUN npm run build


FROM python:3.11-slim AS runner

ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"
ENV NEXT_TELEMETRY_DISABLED=1
FROM python:3.11-slim AS runner

ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"
ENV NEXT_TELEMETRY_DISABLED=1

RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    ca-certificates \
    && curl -fsSL https://deb.nodesource.com/setup_20.x | bash - \
    && apt-get install -y nodejs \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY --from=python-builder /app/.venv /app/.venv

COPY config.py ./
COPY src/ ./src/
COPY dataset/ ./dataset/

WORKDIR /app/dashboard
COPY --from=node-builder /app/dashboard/package.json ./package.json
COPY --from=node-builder /app/dashboard/node_modules ./node_modules
COPY --from=node-builder /app/dashboard/.next ./.next
COPY --from=node-builder /app/dashboard/public ./public

RUN groupadd -g 10001 appgroup && \
    useradd -u 10000 -g appgroup -m -s /bin/bash appuser && \
    chown -R appuser:appgroup /app

USER appuser

EXPOSE 3000

CMD ["npm", "run", "start"]
