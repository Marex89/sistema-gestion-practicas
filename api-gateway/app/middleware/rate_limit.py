import asyncio
import time

from fastapi import Depends, HTTPException, status

from app.middleware.auth import verify_jwt_middleware

MAX_REQUESTS: int = 100
WINDOW_SECONDS: int = 60

# In-memory store: { user_id: [request_count, window_start_timestamp] }
_rate_limit_store: dict[str, list[int | float]] = {}
_store_lock = asyncio.Lock()


async def rate_limit_middleware(
    user_claims: dict = Depends(verify_jwt_middleware),
) -> dict:
    """FastAPI dependency that enforces a per-user rate limit.

    Allows up to MAX_REQUESTS per WINDOW_SECONDS for each authenticated user.
    Raises HTTP 429 when the limit is exceeded.
    """
    user_id: str = user_claims["user_id"]
    now = time.monotonic()

    async with _store_lock:
        if user_id not in _rate_limit_store:
            _rate_limit_store[user_id] = [1, now]
            return user_claims

        count, window_start = _rate_limit_store[user_id]

        if now - window_start >= WINDOW_SECONDS:
            _rate_limit_store[user_id] = [1, now]
            return user_claims

        if count >= MAX_REQUESTS:
            retry_after = int(WINDOW_SECONDS - (now - window_start)) + 1
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail=f"Límite de solicitudes excedido. Intente de nuevo en {retry_after} segundos.",
                headers={"Retry-After": str(retry_after)},
            )

        _rate_limit_store[user_id][0] = count + 1

    return user_claims
