import uuid

from fastapi import APIRouter, Depends, Header, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.crud import user as user_crud
from app.db.session import get_db
from app.schemas.user import UserCreate, UserList, UserResponse, UserUpdate

router = APIRouter(prefix="/users", tags=["users"])

# Jerarquía de roles (mayor índice = mayor privilegio)
ROLE_HIERARCHY = {
    "EMPLEADOR": 0,
    "ALUMNO": 1,
    "DOCENTE": 2,
    "COORDINADOR": 3,
    "JEFE_CARRERA": 4,
    "SUPER_ADMIN": 5,
}


class CurrentUser:
    def __init__(self, user_id: str, role: str):
        self.user_id = user_id
        self.role = role


def get_current_user(
    x_user_id: str = Header(..., alias="X-User-Id"),
    x_user_role: str = Header(..., alias="X-User-Role"),
) -> CurrentUser:
    """
    Lee los headers X-User-Id y X-User-Role inyectados por el API Gateway
    tras validar el JWT. No verifica el token directamente.
    """
    if x_user_role not in ROLE_HIERARCHY:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"Rol desconocido: {x_user_role}",
        )
    return CurrentUser(user_id=x_user_id, role=x_user_role)


def require_role(minimum_role: str):
    """Factoría de dependencias que exige un rol mínimo en la jerarquía."""

    def checker(current_user: CurrentUser = Depends(get_current_user)) -> CurrentUser:
        if ROLE_HIERARCHY.get(current_user.role, -1) < ROLE_HIERARCHY[minimum_role]:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Se requiere rol {minimum_role} o superior",
            )
        return current_user

    return checker


# ---------------------------------------------------------------------------
# Endpoints
# ---------------------------------------------------------------------------


@router.post("/", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def create_user(
    data: UserCreate,
    db: Session = Depends(get_db),
    _: CurrentUser = Depends(require_role("COORDINADOR")),
) -> UserResponse:
    """Crea un nuevo usuario. Requiere rol COORDINADOR o superior."""
    if user_crud.get_user_by_rut(db, data.rut):
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Ya existe un usuario con RUT {data.rut}",
        )
    if user_crud.get_user_by_email(db, data.email):
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Ya existe un usuario con email {data.email}",
        )
    return user_crud.create_user(db, data)


@router.get("/", response_model=UserList)
def list_users(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=200),
    rol: str | None = Query(None),
    db: Session = Depends(get_db),
    _: CurrentUser = Depends(require_role("COORDINADOR")),
) -> UserList:
    """Lista usuarios con paginación. Requiere rol COORDINADOR o superior."""
    users = user_crud.list_users(db, skip=skip, limit=limit, rol=rol)
    return UserList(total=len(users), skip=skip, limit=limit, items=users)


@router.get("/{user_id}", response_model=UserResponse)
def get_user(
    user_id: uuid.UUID,
    db: Session = Depends(get_db),
    _: CurrentUser = Depends(get_current_user),
) -> UserResponse:
    """Obtiene un usuario por su ID."""
    user = user_crud.get_user_by_id(db, user_id)
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Usuario {user_id} no encontrado",
        )
    return user


@router.patch("/{user_id}", response_model=UserResponse)
def update_user(
    user_id: uuid.UUID,
    data: UserUpdate,
    db: Session = Depends(get_db),
    _: CurrentUser = Depends(require_role("COORDINADOR")),
) -> UserResponse:
    """Actualiza campos de un usuario. Requiere rol COORDINADOR o superior."""
    user = user_crud.get_user_by_id(db, user_id)
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Usuario {user_id} no encontrado",
        )
    return user_crud.update_user(db, user, data)


@router.patch("/{user_id}/deactivate", response_model=UserResponse)
def deactivate_user(
    user_id: uuid.UUID,
    db: Session = Depends(get_db),
    _: CurrentUser = Depends(require_role("JEFE_CARRERA")),
) -> UserResponse:
    """Desactiva un usuario. Requiere rol JEFE_CARRERA o superior."""
    user = user_crud.get_user_by_id(db, user_id)
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Usuario {user_id} no encontrado",
        )
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="El usuario ya está inactivo",
        )
    return user_crud.deactivate_user(db, user)
