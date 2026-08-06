import os
import time
from collections import defaultdict
from typing import Any

from anthropic import Anthropic
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.services import menu_service
from app.utils.cache import get_redis
from app.utils.menu_cache import MENU_CACHE_KEY

router = APIRouter()

MAX_CONVERSATION_TURNS = 6
MAX_INPUT_LENGTH = 220
MAX_TOKENS = 120
RATE_LIMIT_WINDOW_SECONDS = 60
RATE_LIMIT_MAX_MESSAGES = 8


class AssistantChatInput(BaseModel):
    tableId: int | None = None
    message: str = Field(min_length=1, max_length=MAX_INPUT_LENGTH)
    conversationHistory: list[dict[str, str]] | None = None


class AssistantChatOutput(BaseModel):
    reply: str
    usedFallback: bool


_rate_limit_store: dict[str, list[float]] = defaultdict(list)


def _build_menu_context(db: Session) -> str:
    menu = menu_service.get_public_menu(db)
    lines: list[str] = []
    for category in menu:
        available_items = [item for item in category.get("items", []) if item.get("is_available")]
        if not available_items:
            continue
        lines.append(f"{category['name']}:")
        for item in available_items:
            parts = [item["name"], f"${item['price']}"]
            if item.get("description"):
                description = str(item["description"]).strip()
                if len(description) > 90:
                    description = description[:87] + "..."
                parts.append(description)
            if item.get("allergens"):
                parts.append("allergens: " + ", ".join(item["allergens"]))
            lines.append("- " + " | ".join(parts))
    return "\n".join(lines)


def _get_cached_context(db: Session) -> str:
    cache = get_redis()
    cached = cache.get("assistant:menu-context")
    if cached:
        return cached
    context = _build_menu_context(db)
    cache.setex("assistant:menu-context", 120, context)
    return context


def _check_rate_limit(key: str) -> bool:
    now = time.time()
    window = _rate_limit_store[key]
    window[:] = [ts for ts in window if now - ts < RATE_LIMIT_WINDOW_SECONDS]
    if len(window) >= RATE_LIMIT_MAX_MESSAGES:
        return False
    window.append(now)
    return True


@router.post("/chat", response_model=AssistantChatOutput)
def chat(payload: AssistantChatInput, db: Session = Depends(get_db)):
    if not payload.message.strip():
        raise HTTPException(status_code=400, detail="Message is required")

    session_key = f"table:{payload.tableId or 0}"
    if not _check_rate_limit(session_key):
        return AssistantChatOutput(reply="I’m taking a short pause so the assistant stays responsive. Please try again in a moment.", usedFallback=True)

    context = _get_cached_context(db)
    history = (payload.conversationHistory or [])[-MAX_CONVERSATION_TURNS:]
    history_text = ""
    for turn in history:
        role = turn.get("role", "user")
        content = str(turn.get("content", "")).strip()
        if content:
            history_text += f"{role}: {content}\n"

    system_prompt = (
        "You are a friendly menu assistant for this restaurant. "
        "Only recommend or describe items from the menu list provided below — never invent dishes, prices, or ingredients. "
        "If asked about something not on the menu, say it isn't available. Keep answers to 2–3 short sentences.\n\n"
        f"Menu context:\n{context or 'No items available.'}"
    )

    user_prompt = f"Conversation history:\n{history_text}\nUser: {payload.message.strip()}"

    api_key = os.getenv("ANTHROPIC_API_KEY", "").strip()
    if not api_key:
        return AssistantChatOutput(reply="The assistant is temporarily unavailable. Please ask us directly for menu guidance.", usedFallback=True)

    try:
        client = Anthropic(api_key=api_key)
        response = client.messages.create(
            model="claude-haiku-4-5-20251001",
            max_tokens=MAX_TOKENS,
            system=system_prompt,
            messages=[{"role": "user", "content": user_prompt}],
        )
        reply = "".join(block.text for block in response.content if getattr(block, "type", None) == "text")
        if not reply.strip():
            raise RuntimeError("empty response")
        return AssistantChatOutput(reply=reply.strip(), usedFallback=False)
    except Exception:
        return AssistantChatOutput(reply="I can help with the menu right now, but I’m unable to access the assistant service. Please ask about the items currently listed on the menu.", usedFallback=True)
