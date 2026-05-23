# ADR-002 — API Gateway

| Campo | Valor |
| :--- | :--- |
| **Estado** | Aceptado |
| **Fecha** | 2026-05-22 |
| **Contexto** | SRS Caso 13 — Sistema de Gestión de Prácticas |

---

## Contexto

Con 6 servicios internos, el cliente web necesita un punto de entrada único que:
1. Centralice la verificación de autenticación (JWT) sin duplicar lógica en cada servicio.
2. Gestione el ruteo por prefijo de ruta (`/auth/**`, `/internships/**`, etc.).
3. Maneje preocupaciones transversales: CORS, rate-limiting, logging de acceso.

El API Gateway es un componente **obligatorio** en esta arquitectura.

## Decisión

Se implementa un **API Gateway en FastAPI** con `httpx` como cliente HTTP asíncrono para el proxy inverso.

**Responsabilidades concretas:**
- Verificar la firma del JWT en cada request (excepto `POST /auth/login`).
- Inyectar los claims del usuario (`user_id`, `rol`) como headers hacia los servicios destino.
- Proxy transparente: no transforma los cuerpos de request/response.
- Rate limiting simple por `user_id` (configurable por variable de entorno).

**Lo que NO hace el gateway:**
- No genera tokens (responsabilidad del `auth-service`).
- No tiene lógica de negocio ni acceso a base de datos.
- No maneja lógica de autorización a nivel de recurso (eso lo hace cada servicio).

## Consecuencias positivas

- Un único punto de cambio para políticas de seguridad perimetral.
- Los servicios internos confían en los headers inyectados por el gateway; no necesitan implementar verificación de JWT independiente en cada endpoint (solo necesitan leer los headers).
- Facilita añadir nuevos servicios sin cambiar la configuración del cliente.

## Consecuencias negativas / riesgos

- El gateway es un single point of failure; si cae, todo el sistema queda inaccesible.
- Añade un salto de red adicional a cada request.
- Implementar el proxy con `httpx` requiere manejo cuidadoso de errores y timeouts.

## Alternativas descartadas

**Nginx puro:** Más eficiente en throughput, pero la validación de JWT requiere el módulo `ngx_http_auth_request_module` más un servicio auxiliar, o scripting Lua. Complejidad de configuración desproporcionada para el alcance del proyecto.

**Kong Gateway:** Solución madura con plugins para JWT, rate-limiting y logging. Descartada por curva de aprendizaje alta, configuración declarativa compleja (base de datos propia o modo DB-less) y overhead innecesario para 6 servicios.

**Traefik:** Excelente para descubrimiento de servicios dinámico en Kubernetes. Para Docker Compose con rutas estáticas conocidas, añade una capa de abstracción sin ventaja real.

**AWS API Gateway / Azure APIM:** Dependencia de proveedor cloud y costos variables; fuera del stack definido.
