import os
import time
from collections import defaultdict
from typing import Any

import httpx
try:
    from anthropic import Anthropic
except Exception:
    Anthropic = None

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.services import menu_service, order_service
from app.utils.cache import get_redis
from app.utils.menu_cache import MENU_CACHE_KEY

router = APIRouter()

MAX_CONVERSATION_TURNS = 6
MAX_INPUT_LENGTH = 220
MAX_TOKENS = 400
RATE_LIMIT_WINDOW_SECONDS = 60
RATE_LIMIT_MAX_MESSAGES = 8


class AssistantChatInput(BaseModel):
    tableId: int | None = None
    message: str = Field(min_length=1, max_length=MAX_INPUT_LENGTH)
    conversationHistory: list[dict[str, str]] | None = None


class AssistantChatOutput(BaseModel):
    reply: str
    usedFallback: bool = False


_rate_limit_store: dict[str, list[float]] = defaultdict(list)


def _build_menu_context(db: Session) -> str:
    menu = menu_service.get_public_menu(db)
    lines: list[str] = []
    for category in menu:
        available_items = [item for item in category.get("items", []) if item.get("is_available")]
        if not available_items:
            continue
        lines.append(f"{category.get('name', 'Category')}:")
        for item in available_items:
            price = item.get("price")
            # price may be string in DB
            lines.append(f"- {item.get('name')} — ₹{price} — {item.get('description','')}")
    return "\n".join(lines)


def _get_cached_context(db: Session) -> str:
    try:
        redis = get_redis()
    except Exception:
        redis = None

    if redis:
        cached = redis.get(MENU_CACHE_KEY)
        if cached:
            try:
                return cached.decode("utf-8")
            except Exception:
                pass

    ctx = _build_menu_context(db)
    if redis:
        try:
            redis.set(MENU_CACHE_KEY, ctx, ex=60 * 5)
        except Exception:
            pass
    return ctx


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
        return AssistantChatOutput(reply="Rate limit: try again shortly.", usedFallback=True)

    context = _get_cached_context(db)
    history = (payload.conversationHistory or [])[-MAX_CONVERSATION_TURNS:]
    history_text = ""
    for turn in history:
        role = turn.get("role", "user")
        content = str(turn.get("content", "")).strip()
        if content:
            history_text += f"{role}: {content}\n"

    system_prompt = (
        "You are a helpful restaurant assistant. Answer concisely and only about items present in the provided menu context. "
        "If asked about unavailable items, say so. Keep replies short and neutral.\n\n"
        f"Menu context:\n{context or 'No menu items available.'}"
    )

    user_prompt = f"Conversation history:\n{history_text}\nUser: {payload.message.strip()}"

    # Try OpenAI Chat Completions
    openai_key = os.getenv("OPENAI_API_KEY", "").strip()
    if openai_key:
        try:
            headers = {"Authorization": f"Bearer {openai_key}", "Content-Type": "application/json"}
            body = {
                "model": os.getenv("OPENAI_MODEL", "gpt-4o-mini") if os.getenv("OPENAI_MODEL") else "gpt-3.5-turbo",
                "messages": [
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt},
                ],
                "max_tokens": MAX_TOKENS,
                "temperature": 0.2,
            }
            r = httpx.post("https://api.openai.com/v1/chat/completions", json=body, headers=headers, timeout=15)
            r.raise_for_status()
            data = r.json()
            reply = data.get("choices", [])[0].get("message", {}).get("content", "").strip()
            if reply:
                return AssistantChatOutput(reply=reply, usedFallback=False)
        except Exception:
            pass

    # Try Anthropic if available
    anthropic_key = os.getenv("ANTHROPIC_API_KEY", "").strip()
    if anthropic_key and Anthropic is not None:
        try:
            client = Anthropic(api_key=anthropic_key)
            response = client.messages.create(
                model=os.getenv("ANTHROPIC_MODEL", "claude-2.1"),
                max_tokens=MAX_TOKENS,
                system=system_prompt,
                messages=[{"role": "user", "content": user_prompt}],
            )
            # extract text
            reply = ""
            if hasattr(response, "content"):
                for block in getattr(response, "content", []):
                    if getattr(block, "type", None) == "text":
                        reply += block.text
            if not reply:
                reply = str(response)
            return AssistantChatOutput(reply=reply.strip(), usedFallback=False)
        except Exception:
            pass

    # Local fallback: derive from analytics and menu
    try:
        analytics = None
        try:
            analytics = order_service.get_analytics_summary(db)
        except Exception:
            analytics = None

        q = payload.message.strip().lower()
        if "sales" in q or "revenue" in q:
            if analytics:
                rev = analytics.get("today_revenue") or analytics.get("today_revenue", 0)
                orders = analytics.get("today_orders", 0)
                return AssistantChatOutput(reply=f"Demo: Today's revenue ₹{rev} across {orders} orders.", usedFallback=True)
            return AssistantChatOutput(reply="No sales data available in demo mode.", usedFallback=True)

        if "top" in q or "popular" in q or "best" in q:
            if analytics and analytics.get("top_items"):
                tops = analytics.get("top_items")
                text = ", ".join([f"{t['name']} ({t['quantity']})" for t in tops[:5]])
                return AssistantChatOutput(reply=f"Top demo items: {text}", usedFallback=True)
            return AssistantChatOutput(reply="No top-items data in demo.", usedFallback=True)

        if "menu" in q or "dish" in q:
            sample = (context or "").split("\n")[:6]
            return AssistantChatOutput(reply="Menu snapshot:\n" + "\n".join(sample), usedFallback=True)

        # generic helpful fallback
        return AssistantChatOutput(reply="The assistant is offline; ask about menu items, sales, or top dishes.", usedFallback=True)
    except Exception:
        return AssistantChatOutput(reply="The assistant is temporarily unavailable.", usedFallback=True)
