from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.api.v1.auth import router as auth_router
from app.api.v1.dashboard import router as dashboard_router
import logging

logger = logging.getLogger(__name__)

app = FastAPI(title="DineMate AI Backend", version="0.1.0")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.BACKEND_CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API routers
app.include_router(auth_router, prefix="/api/v1/auth", tags=["auth"])
app.include_router(dashboard_router, prefix="/api/v1/dashboard", tags=["dashboard"])


@app.get("/")
def root():
    return {"message": "Welcome to DineMate AI backend"}


@app.on_event("startup")
async def on_startup():
    logger.info("Starting DineMate AI backend...")


@app.on_event("shutdown")
async def on_shutdown():
    logger.info("Shutting down DineMate AI backend...")
