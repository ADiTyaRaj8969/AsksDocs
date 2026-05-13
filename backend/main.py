import os
from pathlib import Path

from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse

from routers import query, upload

load_dotenv()

gemini_key = os.getenv("GEMINI_API_KEY")
if not gemini_key:
    raise RuntimeError("GEMINI_API_KEY is not set. Create a .env file with the key.")

os.environ["GEMINI_API_KEY"] = gemini_key

app = FastAPI(
    title="AskDocs API",
    description="Privacy-first Intelligent Document Query System (RAG-based IDP)",
    version="1.0.0",
)

# CORS — allow local dev origins; in production the frontend is served by FastAPI itself
origins = os.getenv("ALLOWED_ORIGINS", "http://localhost:5173,http://localhost:3000").split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[o.strip() for o in origins],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(upload.router, prefix="/api")
app.include_router(query.router, prefix="/api")


@app.get("/health", tags=["health"])
def health():
    return {"status": "ok", "version": "1.0.0"}


# ── Serve built React frontend (for production deployment) ──────────────────
STATIC_DIR = Path(__file__).parent.parent / "frontend" / "dist"

if STATIC_DIR.exists():
    app.mount("/assets", StaticFiles(directory=str(STATIC_DIR / "assets")), name="assets")

    @app.get("/", include_in_schema=False)
    @app.get("/{full_path:path}", include_in_schema=False)
    def serve_spa(full_path: str = ""):
        # Don't intercept /api routes
        if full_path.startswith("api/"):
            from fastapi import HTTPException
            raise HTTPException(status_code=404)
        index = STATIC_DIR / "index.html"
        if index.exists():
            return FileResponse(str(index))
        return {"status": "ok", "message": "AskDocs API — frontend not built yet."}
else:
    @app.get("/", tags=["health"])
    def root():
        return {"status": "ok", "message": "AskDocs API is running. Frontend not built."}
