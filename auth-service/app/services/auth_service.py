from sqlalchemy.orm import Session

from app.core.security import create_access_token, verify_password
from app.crud.user import get_user_by_rut
from app.models.user import User
from app.schemas.token import TokenResponse


def authenticate_user(db: Session, rut: str, password: str) -> User | None:
    user = get_user_by_rut(db, rut)
    if user is None:
        return None
    if not user.is_active:
        return None
    if not verify_password(password, user.password_hash):
        return None
    return user


def login(db: Session, rut: str, password: str) -> TokenResponse | None:
    user = authenticate_user(db, rut, password)
    if user is None:
        return None  # El endpoint manejará el 401
    token = create_access_token({"sub": str(user.id), "role": user.rol})
    return TokenResponse(access_token=token)
