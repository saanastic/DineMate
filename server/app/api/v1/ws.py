from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Query
from jose import JWTError, jwt

from app.core.config import settings
from app.utils.ws_manager import ws_manager

router = APIRouter()


def _decode_token(token: str) -> dict | None:
    try:
        return jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
    except JWTError:
        return None


@router.websocket("/admin")
async def ws_admin(websocket: WebSocket, token: str = Query(...)):
    payload = _decode_token(token)
    if not payload or payload.get("role") not in ("admin", "manager", "waiter", "chef"):
        await websocket.close(code=4401)
        return
    await ws_manager.connect_admin(websocket)
    try:
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        ws_manager.disconnect_admin(websocket)


@router.websocket("/table/{table_id}")
async def ws_table(websocket: WebSocket, table_id: int):
    await ws_manager.connect_table(websocket, table_id)
    try:
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        ws_manager.disconnect_table(websocket, table_id)
