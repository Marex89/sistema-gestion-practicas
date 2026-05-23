import uuid

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.security import hash_password
from app.models.user import User
from app.schemas.user import UserCreate, UserUpdate


def get_user_by_id(db: Session, user_id: uuid.UUID) -> User | None:
    return db.execute(select(User).where(User.id == user_id)).scalar_one_or_none()


def get_user_by_rut(db: Session, rut: str) -> User | None:
    return db.execute(select(User).where(User.rut == rut)).scalar_one_or_none()


def get_user_by_email(db: Session, email: str) -> User | None:
    return db.execute(select(User).where(User.email == email)).scalar_one_or_none()


def create_user(db: Session, data: UserCreate) -> User:
    user = User(
        rut=data.rut,
        nombre=data.nombre,
        apellido=data.apellido,
        email=data.email,
        password_hash=hash_password(data.password),
        rol=data.rol,
        carrera_id=data.carrera_id,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


def update_user(db: Session, user: User, data: UserUpdate) -> User:
    update_data = data.model_dump(exclude_unset=True)
    # Si se actualiza la password, hashearla antes de guardar
    if "password" in update_data:
        update_data["password_hash"] = hash_password(update_data.pop("password"))
    for field, value in update_data.items():
        setattr(user, field, value)
    db.commit()
    db.refresh(user)
    return user


def deactivate_user(db: Session, user: User) -> User:
    user.is_active = False
    db.commit()
    db.refresh(user)
    return user


def list_users(
    db: Session, skip: int = 0, limit: int = 50, rol: str | None = None
) -> list[User]:
    stmt = select(User)
    if rol is not None:
        stmt = stmt.where(User.rol == rol)
    stmt = stmt.offset(skip).limit(limit)
    return list(db.execute(stmt).scalars().all())
