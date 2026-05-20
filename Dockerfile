FROM node:20-bookworm-slim

RUN apt-get update && apt-get install -y \
    python3 \
    python3-venv \
    && rm -rf /var/lib/apt/lists/*

COPY --from=ghcr.io/astral-sh/uv:latest /uv /uvx /bin/

ENV VIRTUAL_ENV=/opt/venv
RUN uv venv $VIRTUAL_ENV
ENV PATH="$VIRTUAL_ENV/bin:$PATH"

WORKDIR /app


COPY pyproject.toml uv.lock ./
RUN uv sync --frozen

COPY dashboard/package*.json ./dashboard/
WORKDIR /app/dashboard
RUN npm ci

WORKDIR /app
COPY dashboard/ ./dashboard/
COPY src/ ./src/
COPY config.py ./config.py

WORKDIR /app/dashboard
RUN npm run build

EXPOSE 3001

CMD ["npm", "run", "start"]