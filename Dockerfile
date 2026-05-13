# ── Stage 1: Build React frontend ──────────────────────────────────────────
FROM node:20-alpine AS frontend-build

WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm ci --legacy-peer-deps
COPY frontend/ ./
RUN npm run build

# ── Stage 2: Production Express server ─────────────────────────────────────
FROM node:20-alpine AS production

WORKDIR /app

# Copy server
COPY server/package*.json ./server/
RUN cd server && npm ci --omit=dev

COPY server/ ./server/

# Copy built frontend into place (server serves it as static files)
COPY --from=frontend-build /app/frontend/dist ./frontend/dist

# Create local fallback runtime directories
RUN mkdir -p server/uploads server/vector_db server/data/uploads

# Hugging Face Spaces require running as a non-root user (uid 1000)
# We give full permissions to the app directory so the user can write to it
RUN chown -R 1000:1000 /app && chmod -R 777 /app/server/data /app/server/uploads /app/server/vector_db

USER 1000

# Expose port 7860 (required by Hugging Face)
EXPOSE 7860

# Health check
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s \
  CMD wget -qO- http://localhost:7860/health || exit 1

ENV NODE_ENV=production
ENV PORT=7860
ENV DATA_DIR=/app/server/data

WORKDIR /app/server
CMD ["node", "index.js"]
