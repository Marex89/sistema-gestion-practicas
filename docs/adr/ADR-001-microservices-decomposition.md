# ADR-001 — Descomposición en Microservicios

| Campo | Valor |
| :--- | :--- |
| **Estado** | Aceptado |
| **Fecha** | 2026-05-22 |
| **Contexto** | SRS Caso 13 — Sistema de Gestión de Prácticas |

---

## Contexto

El sistema debe gestionar múltiples actores con flujos semi-independientes: alumnos, docentes, coordinadores, empleadores y jefes de carrera. El SRS identifica al menos 8 casos de uso principales distribuidos en dominios con baja interdependencia (autenticación, gestión académica, prácticas, evaluaciones, documentos, notificaciones).

El proyecto tiene alcance no industrial y debe mantenerse simple pero extensible. El stack definido (Python + FastAPI + Docker) es compatible con múltiples estilos arquitectónicos.

## Decisión

Se adopta una arquitectura de **microservicios con 6 servicios de dominio + 1 API Gateway**:

| Servicio | Dominio |
| :--- | :--- |
| `api-gateway` | Ruteo y seguridad perimetral |
| `auth-service` | Identidad y acceso |
| `academic-service` | Catálogo académico |
| `internship-service` | Gestión de prácticas (núcleo) |
| `evaluation-service` | Evaluaciones y calificaciones |
| `document-service` | Gestión de archivos |
| `notification-service` | Alertas y comunicaciones |

## Consecuencias positivas

- Cada servicio puede desarrollarse, desplegarse y probarse de forma independiente.
- Los dominios tienen límites claros derivados del SRS; el cambio en uno no impacta a los demás.
- Facilita la distribución del trabajo en equipo por servicio.

## Consecuencias negativas / riesgos

- Mayor overhead de infraestructura respecto a un monolito.
- Las llamadas entre servicios añaden latencia de red y puntos de fallo adicionales.
- Requiere estrategia de consistencia eventual para relaciones cross-service.

## Alternativas descartadas

**Monolito modular:** Técnicamente adecuado para el alcance. Descartado porque el enunciado requiere microservicios explícitamente y porque la separación de dominios es suficientemente clara para justificar el overhead.

**Microservicios ultra-granulares (>10 servicios):** Separar `user-service` de `auth-service`, o crear un `acta-service` independiente, añadiría complejidad de red y despliegue sin beneficio observable para el equipo y el alcance del proyecto.

**Serverless:** Dependencia de proveedor cloud y costos variables; incompatible con el stack Docker declarado.
