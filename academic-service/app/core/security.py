from fastapi import Depends, Header, HTTPException, status


async def get_current_user(
    x_user_id: str = Header(..., alias="X-User-Id"),
    x_user_role: str = Header(..., alias="X-User-Role"),
) -> dict:
    """Extrae el usuario autenticado desde los headers inyectados por el API Gateway."""
    return {"user_id": x_user_id, "role": x_user_role}


def require_roles(*roles: str):
    """Factoría de dependencias que valida que el rol del usuario esté en la lista permitida."""

    async def checker(user: dict = Depends(get_current_user)) -> dict:
        if user["role"] not in roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Permiso insuficiente",
            )
        return user

    return checker
