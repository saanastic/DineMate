from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.api.v1.auth import router as auth_router, router_admin as admin_auth_router
from app.api.v1.dashboard import router as dashboard_router
from app.api.v1.tables import router as tables_router
from app.api.v1.menu_public import router as menu_router
from app.api.v1.orders_public import router as orders_router
from app.api.v1.admin_dining import router as admin_router
from app.api.v1.assistant import router as assistant_router
from app.api.v1.ws import router as ws_router
from app.services import order_service
from app.database.session import SessionLocal
import logging

logger = logging.getLogger(__name__)

app = FastAPI(title="DineMate AI Backend", version="0.2.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.BACKEND_CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router, prefix="/api/v1/auth", tags=["auth"])
app.include_router(admin_auth_router, prefix="/api/v1/admin", tags=["admin-auth"])
app.include_router(dashboard_router, prefix="/api/v1/dashboard", tags=["dashboard"])
app.include_router(tables_router, prefix="/api/v1/tables", tags=["tables"])
app.include_router(menu_router, prefix="/api/v1/menu", tags=["menu"])
app.include_router(orders_router, prefix="/api/v1/orders", tags=["orders"])
app.include_router(admin_router, prefix="/api/v1/admin", tags=["admin"])
app.include_router(assistant_router, prefix="/api/v1/assistant", tags=["assistant"])
app.include_router(ws_router, prefix="/api/v1/ws", tags=["websocket"])


@app.post("/api/v1/webhooks/stripe")
async def stripe_webhook_root(request: Request):
    payload = await request.body()
    sig = request.headers.get("stripe-signature", "")
    db = SessionLocal()
    try:
        if not order_service.handle_stripe_webhook(db, payload, sig):
            from fastapi import HTTPException
            raise HTTPException(status_code=400, detail="Webhook error")
        return {"received": True}
    finally:
        db.close()


@app.get("/")
def root():
    return {"message": "Welcome to DineMate AI backend"}


@app.on_event("startup")
async def on_startup():
    logger.info("Starting DineMate AI backend...")


@app.on_event("shutdown")
async def on_shutdown():
    logger.info("Shutting down DineMate AI backend...")
