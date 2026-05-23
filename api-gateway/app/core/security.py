from fastapi import HTTPException, status
from jose import JWTError, jwt

from app.core.config import settings


def decode_token(token: str) -> dict | None:
    """Decode a JWT and return its payload, or None if invalid/expired."""
    try:
        payload = jwt.decode(
            token,
            settings.secret_key,
            algorithms=[settings.algorithm],
        )
        return payload
    except JWTError:
        return None


def get_user_from_token(token: str) -> dict:
    """Extract user_id and role from a JWT payload.

    Raises HTTPException 401 if the token is invalid or missing required claims.
    """
    payload = decode_token(token)
    if payload is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token inválido o expirado",
            headers={"WWW-Authenticate": "Bearer"},
        )

    user_id = payload.get("sub")
    role = payload.get("role")

    if user_id is None or role is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token no contiene los campos requeridos (sub, role)",
            headers={"WWW-Authenticate": "Bearer"},
        )

    return {"user_id": str(user_id), "role": str(role)}
