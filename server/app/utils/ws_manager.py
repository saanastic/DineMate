import json
from typing import Any

from fastapi import WebSocket


class ConnectionManager:
    def __init__(self):
        self._admin: set[WebSocket] = set()
        self._tables: dict[int, set[WebSocket]] = {}

    async def connect_admin(self, ws: WebSocket):
        await ws.accept()
        self._admin.add(ws)

    async def connect_table(self, ws: WebSocket, table_id: int):
        await ws.accept()
        self._tables.setdefault(table_id, set()).add(ws)

    def disconnect_admin(self, ws: WebSocket):
        self._admin.discard(ws)

    def disconnect_table(self, ws: WebSocket, table_id: int):
        room = self._tables.get(table_id)
        if room:
            room.discard(ws)
            if not room:
                del self._tables[table_id]

    async def _broadcast(self, connections: set[WebSocket], event: str, data: dict):
        dead: list[WebSocket] = []
        payload = json.dumps({"event": event, "data": data})
        for ws in connections:
            try:
                await ws.send_text(payload)
            except Exception:
                dead.append(ws)
        for ws in dead:
            connections.discard(ws)

    async def notify_admin(self, event: str, data: dict):
        await self._broadcast(self._admin, event, data)

    async def notify_table(self, table_id: int, event: str, data: dict):
        room = self._tables.get(table_id, set())
        await self._broadcast(room, event, data)


ws_manager = ConnectionManager()
