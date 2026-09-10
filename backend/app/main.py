import logging
from contextlib import asynccontextmanager
from pathlib import Path

from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, JSONResponse
from fastapi.staticfiles import StaticFiles

from .config import get_settings
from .db import connect, disconnect
from .routers import admin, public

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(name)s — %(message)s")

settings = get_settings()
STATIC_DIR = Path(__file__).resolve().parent.parent / "static"


@asynccontextmanager
async def lifespan(_: FastAPI):
    await connect()
    yield
    await disconnect()


app = FastAPI(
    title="Dialogue with Future Entrepreneurs",
    description="Submission and insight platform for the Office of Academics, JAIN (Deemed-to-be University).",
    version="2.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list,
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(public.router, prefix="/api")
app.include_router(admin.router, prefix="/api")


@app.exception_handler(RequestValidationError)
async def validation_handler(_: Request, exc: RequestValidationError) -> JSONResponse:
    """Return field-keyed messages the forms can attach to the right input."""
    fields: dict[str, str] = {}
    for err in exc.errors():
        path = [str(p) for p in err["loc"] if p not in ("body",)]
        fields[".".join(path) or "form"] = err["msg"].replace("Value error, ", "")
    return JSONResponse(
        status_code=422,
        content={"detail": "Some answers need attention before this can be saved.", "fields": fields},
    )


@app.get("/api/health")
async def health() -> dict:
    return {"status": "ok"}


# ---------------------------------------------------------------------------
# Serve the built React app (production single-service deployment).
# In development the frontend runs on Vite at :5173 and this block is inert.
# ---------------------------------------------------------------------------
if STATIC_DIR.is_dir():
    app.mount("/assets", StaticFiles(directory=STATIC_DIR / "assets"), name="assets")

    @app.get("/{full_path:path}", include_in_schema=False)
    async def spa(full_path: str) -> FileResponse:
        candidate = STATIC_DIR / full_path
        if full_path and candidate.is_file():
            return FileResponse(candidate)
        return FileResponse(STATIC_DIR / "index.html")
