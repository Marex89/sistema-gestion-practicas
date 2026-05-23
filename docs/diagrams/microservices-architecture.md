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

---

## Separación de Responsabilidades

Cada microservicio tiene un **único contexto de dominio** y no conoce la lógica interna de los demás.

| Servicio | Responsabilidad única | Entidades propias | Depende de |
| :--- | :--- | :--- | :--- |
| `api-gateway` | Punto de entrada único: ruteo, verificación JWT, rate-limiting | — | `auth-service` (validar token) |
| `auth-service` | Identidad y acceso: autenticación, gestión de usuarios y roles | `User`, `RolEnum` | Ninguno |
| `academic-service` | Catálogo estructural: sedes, carreras y sus parámetros, centros de práctica | `Sede`, `Carrera`, `CentroPractica` | Ninguno |
| `internship-service` | Núcleo de negocio: registro, flujo de estados y seguimiento de prácticas | `Practica`, `Acta1` | `auth-service`, `academic-service` |
| `evaluation-service` | Evaluaciones y calificaciones: formularios, cálculo de notas, ponderaciones, acta final | `EvaluacionDesempeno`, `EvaluacionInforme`, `ActaFinal`, `ParametroEvaluacion` | `internship-service` |
| `document-service` | Gestión de archivos: informes, actas, material de apoyo, validación de formato/peso | `Documento` | `internship-service` |
| `notification-service` | Comunicaciones: correos automáticos, alertas manuales, historial de alertas | `Notificacion`, `AlertaManual` | `auth-service` |

### Reglas de separación aplicadas

1. **Ningún servicio accede directamente a la BD de otro.** Todo pasa por la API.
2. **La lógica de negocio de un dominio no vive en otro servicio.** El cálculo de la fecha de término de práctica (RF.5) vive solo en `internship-service`; el cálculo de nota final vive solo en `evaluation-service`.
3. **El gateway no tiene lógica de negocio.** Solo rutea y valida tokens.
4. **Las notificaciones son responsabilidad exclusiva del `notification-service`.** Los demás servicios disparan `POST /notify` pero no saben cómo ni por qué canal se entrega el mensaje.

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

### Matriz de dependencias

|  | api-gw | auth | academic | internship | evaluation | document | notification |
| --- | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| **api-gateway** | — | ✅ | — | — | — | — | — |
| **auth-service** | — | — | — | — | — | — | — |
| **academic-service** | — | — | — | — | — | — | — |
| **internship-service** | — | ✅ | ✅ | — | — | — | ✅ |
| **evaluation-service** | — | — | — | ✅ | — | — | ✅ |
| **document-service** | — | — | — | ✅ | — | — | ✅ |
| **notification-service** | — | ✅ | — | — | — | — | — |

> `auth-service` y `academic-service` no dependen de ningún otro servicio → son los **más estables** del sistema y los primeros en implementarse.

---

## Justificación (Elección, Descarte y Decisión)

### Descomposición en microservicios

**Decisión:** 6 microservicios de dominio + 1 API Gateway.

**Contexto del SRS:** El sistema gestiona múltiples actores (alumno, docente, coordinador, empleador, jefe de carrera) con flujos de trabajo semi-independientes. Los dominios identificados tienen baja interdependencia: se puede cambiar la lógica de evaluación sin tocar el registro de prácticas, o cambiar el almacenamiento de archivos sin tocar la autenticación.

| Alternativa | Motivo de descarte |
| :--- | :--- |
| **Monolito modular** | Arquitectura válida para este alcance; descartada porque el enunciado requiere microservicios y porque la separación de dominios es natural y no introduce overhead excesivo con Docker Compose. |
| **Microservicios ultra-granulares (12+ servicios)** | Separar `user-service` de `auth-service`, o crear un `acta-service` aparte del `internship-service` añadiría complejidad de red, despliegue y debugging sin beneficio real dado el tamaño del equipo y el alcance no industrial. |
| **Serverless (AWS Lambda / GCP Functions)** | Agrega dependencia a proveedor cloud, complejidad de cold starts y costos variables; incompatible con el stack Python + Docker declarado. |

---

### API Gateway (obligatorio)

**Decisión:** FastAPI personalizado como `api-gateway`, usando `httpx` como cliente HTTP para el proxy inverso.

**Justificación:**
- Punto de entrada único → simplifica la configuración del cliente y los CORS.
- Centraliza la verificación JWT para que ningún servicio interno implemente lógica de seguridad perimetral duplicada.
- Permite añadir rate-limiting, logging centralizado y headers de seguridad en un solo lugar.
- Al estar en Python, el equipo usa el mismo lenguaje y paradigma que el resto del sistema.

| Alternativa | Motivo de descarte |
| :--- | :--- |
| **Nginx puro** | Más eficiente, pero validar JWT requiere el módulo `ngx_http_auth_request_module` con un servicio auxiliar o Lua, añadiendo complejidad que supera el beneficio para este alcance. |
| **Kong Gateway** | Potente pero con curva de aprendizaje alta, configuración declarativa compleja y overhead innecesario para 6 servicios. |
| **Traefik** | Adecuado para routing dinámico en Kubernetes. Para un Docker Compose estático, añade una capa de configuración sin ventaja clara. |
| **AWS API Gateway / Azure APIM** | Dependencia de proveedor cloud, costo y configuración fuera del stack declarado. |

---

### Base de datos por servicio

**Decisión:** Una base de datos PostgreSQL por servicio dentro de una misma instancia PostgreSQL (bases de datos separadas, no schemas).

**Justificación:**
- Cumple el principio de *database per service* sin requerir múltiples contenedores PostgreSQL en desarrollo.
- Cada servicio gestiona sus propias migraciones (Alembic) de forma independiente.
- Si en el futuro se requiere escalar un servicio individualmente, basta mover su BD a otra instancia sin cambiar código.

| Alternativa | Motivo de descarte |
| :--- | :--- |
| **Base de datos compartida** | Anti-patrón de microservicios. Crea acoplamiento estructural que hace imposible desplegar servicios de forma independiente. |
| **Una instancia PostgreSQL por servicio** | Correcto para producción; innecesario para este alcance. Consume más recursos y añade complejidad de Docker Compose sin beneficio real. |
| **MongoDB por servicio** | Los datos del sistema son relacionales. PostgreSQL con JSON columns satisface los casos donde se necesita flexibilidad (ítems de evaluación). |

---

### Comunicación inter-servicio

**Decisión:** HTTP/REST síncrono con `httpx` (cliente async). Sin message broker.

**Justificación:**
- Simple de implementar, debuggear y razonar sobre el flujo.
- El volumen de tráfico inter-servicio es bajo: consultas puntuales de datos.
- Los "eventos" (notificaciones) se implementan como llamadas HTTP directas a `notification-service`, suficiente para este alcance.

| Alternativa | Motivo de descarte |
| :--- | :--- |
| **RabbitMQ / Kafka** | Añaden un broker como infraestructura adicional, consumers y lógica de reintentos. Overkill para este sistema académico. |
| **gRPC** | Más eficiente que REST, pero requiere protobuf y compilación de schemas. No hay justificación de performance para este sistema. |
| **GraphQL Federation** | Añade complejidad de schema stitching y un gateway especializado. REST es suficiente y más familiar. |

---

### Resumen de decisiones

| Tema | Elegido | Principal descartado | Razón clave |
| :--- | :--- | :--- | :--- |
| Arquitectura | Microservicios (6 + gateway) | Monolito modular | Requerimiento del proyecto; dominios bien separados |
| API Gateway | FastAPI custom + httpx | Nginx puro | Validación JWT nativa sin módulos adicionales |
| Base de datos | PostgreSQL multi-DB (1 instancia) | BD compartida | Independencia de schema; anti-patrón evitado |
| Comunicación | HTTP REST síncrono (httpx async) | RabbitMQ / Kafka | Simplicidad; volumen bajo; sin broker adicional |
| Contenerización | Docker + Docker Compose | Kubernetes | Scope no industrial; Compose es suficiente |
| Autenticación | JWT (PyJWT) stateless | Sessions con Redis | Sin estado en servicios; más simple de escalar |
| Herencia de modelos | Sin herencia (polimorfismo por rol) | Table-per-hierarchy ORM | Evita complejidad de ORM sin beneficio real |
