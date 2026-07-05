import httpx
from fastapi import APIRouter, Depends, Request, Response
from fastapi.responses import JSONResponse

from app.core.config import settings
from app.middleware.auth import verify_jwt_middleware

router = APIRouter()

# ---------------------------------------------------------------------------
# Helper
# ---------------------------------------------------------------------------


def _build_headers(request: Request, user: dict) -> dict:
    """Clone the incoming headers, strip hop-by-hop ones, and inject user claims."""
    # Headers that must not be forwarded to upstream services
    HOP_BY_HOP = {
        "host",
        "connection",
        "keep-alive",
        "proxy-authenticate",
        "proxy-authorization",
        "te",
        "trailers",
        "transfer-encoding",
        "upgrade",
    }
    headers = {k: v for k, v in request.headers.items() if k.lower() not in HOP_BY_HOP}
    headers["X-User-Id"] = user["user_id"]
    headers["X-User-Role"] = user["role"]
    return headers


async def _proxy_request(
    request: Request,
    base_url: str,
    path: str,
    user: dict,
) -> Response:
    """Forward the incoming request to *base_url/path* and return the upstream response."""
    target_url = f"{base_url.rstrip('/')}/{path}"
    if request.url.query:
        target_url = f"{target_url}?{request.url.query}"

    headers = _build_headers(request, user)
    body = await request.body()

    client: httpx.AsyncClient = request.app.state.http_client

    try:
        upstream = await client.request(
            method=request.method,
            url=target_url,
            headers=headers,
            content=body,
            follow_redirects=True,
        )
    except httpx.ConnectError:
        return JSONResponse(
            status_code=503,
            content={"detail": f"Servicio no disponible: {base_url}"},
        )
    except httpx.TimeoutException:
        return JSONResponse(
            status_code=504,
            content={"detail": "El servicio tardó demasiado en responder"},
        )

    return Response(
        content=upstream.content,
        status_code=upstream.status_code,
        headers=dict(upstream.headers),
        media_type=upstream.headers.get("content-type"),
    )


# ---------------------------------------------------------------------------
# Bypass routes (no JWT required)
# ---------------------------------------------------------------------------


@router.post("/auth/login")
async def proxy_auth_login(request: Request) -> Response:
    """Login endpoint — forwarded without JWT verification."""
    return await _proxy_request(
        request,
        settings.auth_service_url,
        "api/v1/auth/login",
        user={"user_id": "", "role": ""},
    )


# ---------------------------------------------------------------------------
# Protected proxy routes (JWT required)
# ---------------------------------------------------------------------------


@router.api_route(
    "/auth/{path:path}",
    methods=["GET", "POST", "PUT", "PATCH", "DELETE"],
)
async def proxy_auth(
    request: Request,
    path: str,
    user: dict = Depends(verify_jwt_middleware),
) -> Response:
    return await _proxy_request(
        request, settings.auth_service_url, f"api/v1/auth/{path}", user
    )


@router.api_route(
    "/users/{path:path}",
    methods=["GET", "POST", "PUT", "PATCH", "DELETE"],
)
async def proxy_users(
    request: Request,
    path: str,
    user: dict = Depends(verify_jwt_middleware),
) -> Response:
    """Los usuarios viven en auth-service, pero el frontend los consume en /users
    (sin el prefijo /auth) por lo que necesitan su propia ruta de proxy."""
    return await _proxy_request(
        request, settings.auth_service_url, f"api/v1/users/{path}", user
    )


@router.api_route(
    "/academic/{path:path}",
    methods=["GET", "POST", "PUT", "PATCH", "DELETE"],
)
async def proxy_academic(
    request: Request,
    path: str,
    user: dict = Depends(verify_jwt_middleware),
) -> Response:
    return await _proxy_request(
        request, settings.academic_service_url, f"api/v1/academic/{path}", user
    )


@router.api_route(
    "/internships/{path:path}",
    methods=["GET", "POST", "PUT", "PATCH", "DELETE"],
)
async def proxy_internships(
    request: Request,
    path: str,
    user: dict = Depends(verify_jwt_middleware),
) -> Response:
    return await _proxy_request(
        request, settings.internship_service_url, f"api/v1/internships/{path}", user
    )


@router.api_route(
    "/evaluations/{path:path}",
    methods=["GET", "POST", "PUT", "PATCH", "DELETE"],
)
async def proxy_evaluations(
    request: Request,
    path: str,
    user: dict = Depends(verify_jwt_middleware),
) -> Response:
    return await _proxy_request(
        request, settings.evaluation_service_url, f"api/v1/evaluations/{path}", user
    )


@router.api_route(
    "/documents/{path:path}",
    methods=["GET", "POST", "PUT", "PATCH", "DELETE"],
)
async def proxy_documents(
    request: Request,
    path: str,
    user: dict = Depends(verify_jwt_middleware),
) -> Response:
    return await _proxy_request(
        request, settings.document_service_url, f"api/v1/documents/{path}", user
    )


@router.api_route(
    "/notifications/{path:path}",
    methods=["GET", "POST", "PUT", "PATCH", "DELETE"],
)
async def proxy_notifications(
    request: Request,
    path: str,
    user: dict = Depends(verify_jwt_middleware),
) -> Response:
    return await _proxy_request(
        request, settings.notification_service_url, f"api/v1/notifications/{path}", user
    )
