# ── Stage 1: Build React frontend ──────────────────────────────────────────
FROM node:20-alpine AS frontend-build

WORKDIR /app/frontend

# Firebase frontend config — these are intentionally public (baked into every user's JS bundle).
# Defaults are set here so the build works without any external build args.
ARG VITE_FIREBASE_API_KEY=AIzaSyAetCxgaGLfplSt8zQuG5Rq1Tu6WGhAk20
ARG VITE_FIREBASE_AUTH_DOMAIN=asks-docs.firebaseapp.com
ARG VITE_FIREBASE_PROJECT_ID=asks-docs
ARG VITE_FIREBASE_STORAGE_BUCKET=asks-docs.firebasestorage.app
ARG VITE_FIREBASE_MESSAGING_SENDER_ID=378230753937
ARG VITE_FIREBASE_APP_ID=1:378230753937:web:f54af6a045ebef61c0cd30

ENV VITE_FIREBASE_API_KEY=$VITE_FIREBASE_API_KEY
ENV VITE_FIREBASE_AUTH_DOMAIN=$VITE_FIREBASE_AUTH_DOMAIN
ENV VITE_FIREBASE_PROJECT_ID=$VITE_FIREBASE_PROJECT_ID
ENV VITE_FIREBASE_STORAGE_BUCKET=$VITE_FIREBASE_STORAGE_BUCKET
ENV VITE_FIREBASE_MESSAGING_SENDER_ID=$VITE_FIREBASE_MESSAGING_SENDER_ID
ENV VITE_FIREBASE_APP_ID=$VITE_FIREBASE_APP_ID

COPY frontend/package*.json ./
RUN npm ci --legacy-peer-deps
COPY frontend/ ./
# Give Node extra heap for building the large pdfjs-dist / tesseract bundles
RUN NODE_OPTIONS=--max-old-space-size=1024 npm run build

# ── Stage 2: Production Express server ─────────────────────────────────────
FROM node:20-alpine AS production

WORKDIR /app

COPY server/package*.json ./server/
RUN cd server && npm ci --omit=dev

COPY server/ ./server/

COPY --from=frontend-build /app/frontend/dist ./frontend/dist

RUN mkdir -p server/uploads server/vector_db server/data/uploads

RUN chown -R 1000:1000 /app && chmod -R 777 /app/server/data /app/server/uploads /app/server/vector_db

USER 1000

EXPOSE 7860

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s \
  CMD wget -qO- http://localhost:7860/health || exit 1

ENV NODE_ENV=production
ENV PORT=7860
ENV DATA_DIR=/app/server/data
# Increase heap for embedding large documents in production
ENV NODE_OPTIONS=--max-old-space-size=512

WORKDIR /app/server
CMD ["node", "index.js"]
