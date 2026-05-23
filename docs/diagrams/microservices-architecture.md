# Arquitectura de Microservicios — Sistema de Gestión de Prácticas

> **Stack:** Python · FastAPI · PostgreSQL · Docker  
> **Nivel:** No industrial / académico — prioridad en simplicidad y extensibilidad.  
> **Base:** SRS Caso 13 — Sistema de Gestión de Prácticas Laborales y Profesionales.

---

## Documentos relacionados

| Documento | Contenido |
| :--- | :--- |
| [`class-diagram.md`](./class-diagram.md) | Topología de servicios y diagramas de clases |
| [`relationships.md`](./relationships.md) | Composición, asociaciones y decisión de herencia |
| [`microservice-structure.md`](./microservice-structure.md) | Estructura de directorios y capas internas |
| [`../adr/ADR-001-microservices-decomposition.md`](../adr/ADR-001-microservices-decomposition.md) | Decisión: descomposición en microservicios |
| [`../adr/ADR-002-api-gateway.md`](../adr/ADR-002-api-gateway.md) | Decisión: API Gateway |
| [`../adr/ADR-003-database-per-service.md`](../adr/ADR-003-database-per-service.md) | Decisión: base de datos por servicio |
| [`../adr/ADR-004-inter-service-communication.md`](../adr/ADR-004-inter-service-communication.md) | Decisión: comunicación inter-servicio |
| [`../adr/ADR-005-rubric-justification.md`](../adr/ADR-005-rubric-justification.md) | Índice de ADRs de justificación |
| [`../adr/ADR-006-auth-service-boundary.md`](../adr/ADR-006-auth-service-boundary.md) | Justificación de `auth-service` |
| [`../adr/ADR-007-academic-service-boundary.md`](../adr/ADR-007-academic-service-boundary.md) | Justificación de `academic-service` |
| [`../adr/ADR-008-internship-service-boundary.md`](../adr/ADR-008-internship-service-boundary.md) | Justificación de `internship-service` |
| [`../adr/ADR-009-evaluation-service-boundary.md`](../adr/ADR-009-evaluation-service-boundary.md) | Justificación de `evaluation-service` |
| [`../adr/ADR-010-document-service-boundary.md`](../adr/ADR-010-document-service-boundary.md) | Justificación de `document-service` |
| [`../adr/ADR-011-notification-service-boundary.md`](../adr/ADR-011-notification-service-boundary.md) | Justificación de `notification-service` |
| [`../adr/ADR-012-service-layering.md`](../adr/ADR-012-service-layering.md) | Estructura interna en capas |
| [`../adr/ADR-013-no-inheritance-strategy.md`](../adr/ADR-013-no-inheritance-strategy.md) | Estrategia sin herencia |

---

### Trazabilidad SRS → Servicio

| Requisito SRS | Servicio responsable |
| :--- | :--- |
| RF.1 Autenticación · CU1 | `auth-service` |
| RF.2 Administrar usuarios · CU3 | `auth-service` |
| RF.3 Sedes y Carreras · CU2 | `academic-service` |
| RF.4 Registrar práctica · CU5 | `internship-service` |
| RF.5 Calcular fecha término | `internship-service` |
| RF.6 Administrar práctica | `internship-service` |
| RF.5[sic] Repositorio documentos · CU8 | `document-service` |
| RF.6[sic] Formularios evaluación · CU7 | `evaluation-service` |
| RF.7 Consultas históricas | `internship-service` |
| RF.11, RF.12 Alertas automáticas · CU10 | `notification-service` |
| RS.4 Repositorio informes | `document-service` |
| RS.6 Registro centros de práctica | `academic-service` |
| RS.10 Validar formato/peso archivos | `document-service` |

---

## Alta Cohesión de Microservicios

Cada servicio agrupa funcionalidades que **cambian juntas y por la misma razón** (Principio de Responsabilidad Única aplicado a nivel de servicio).

| Servicio | Evidencia de cohesión |
| :--- | :--- |
| `auth-service` | Todo lo relacionado con identidad: login, tokens, usuarios y roles. Si cambia el modelo de autenticación (e.g., se añade MFA), sólo este servicio se modifica. Ninguna lógica de práctica vive aquí. |
| `academic-service` | Sedes, carreras y centros de práctica son el catálogo estructural del sistema. Cambian cuando la institución actualiza su oferta académica o sus parámetros de horas de práctica (RF.3). |
| `internship-service` | Concentra el flujo de negocio principal: inscripción → asignación de docente → seguimiento → cambios de estado. Es el corazón del sistema (RF.4, RF.5, RF.6, RF.9). |
| `evaluation-service` | Todas las evaluaciones, sus ítems, ponderaciones y el acta final responden a la misma pregunta: *¿cómo se evalúa una práctica?*. Si el modelo evaluativo cambia, sólo este servicio cambia. |
| `document-service` | Responsable del ciclo de vida de archivos: subida, validación de formato (PDF, ≤1MB), descarga y organización por práctica o carrera (RS.10). Independiente de cómo se evalúa o registra. |
| `notification-service` | Centraliza todos los canales de comunicación (correo hoy, push/SMS mañana). Si se cambia el proveedor SMTP, o se añade un canal nuevo, sólo este servicio se toca (RF.11, RF.12, RS.1–RS.3). |

---

## Bajo Acoplamiento de Microservicios

### Mecanismos aplicados

| Mecanismo | Descripción |
| :--- | :--- |
| **Base de datos propia por servicio** | Ningún servicio comparte schema SQL con otro. Cambiar el modelo interno de un servicio no rompe a los demás. |
| **Comunicación sólo por HTTP/REST** | Los servicios no comparten código ORM ni modelos Python entre sí. Solo consumen APIs con contratos JSON bien definidos. |
| **Referencia por UUID** | Las relaciones cross-service se expresan como UUIDs opacos. Ningún servicio necesita conocer la estructura interna del modelo del otro. |
| **JWT autónomo** | Cada servicio verifica el token JWT de forma independiente usando la clave secreta compartida via variable de entorno. No se llama a `auth-service` en cada request, solo cuando se necesitan datos frescos del usuario. |
| **Contrato de notificaciones genérico** | Los servicios disparan `POST /notify` con `{tipo, user_id, context}`. No saben ni cómo ni a quién se notifica exactamente; ese conocimiento reside en `notification-service`. |
| **Sin librerías compartidas entre servicios** | Cada servicio tiene sus propios `schemas/` y `models/`. No existe un paquete `common/` que acople servicios entre sí. |
