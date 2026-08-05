import time
from app.core.config import settings

_redis = None
_memory_store: dict[str, tuple[str, float]] = {}


class _MemoryRedis:
    """Fallback cache when Redis is unavailable (local dev without Docker)."""

    def setex(self, key: str, seconds: int, value: str):
        _memory_store[key] = (str(value), time.time() + seconds)

    def get(self, key: str):
        entry = _memory_store.get(key)
        if not entry:
            return None
        value, expires_at = entry
        if time.time() > expires_at:
            _memory_store.pop(key, None)
            return None
        return value

    def delete(self, key: str):
        _memory_store.pop(key, None)


def get_redis():
    global _redis
    if _redis is not None:
        return _redis

    try:
        import redis

        client = redis.from_url(settings.REDIS_URL, decode_responses=True)
        client.ping()
        _redis = client
    except Exception:
        _redis = _MemoryRedis()

    return _redis
