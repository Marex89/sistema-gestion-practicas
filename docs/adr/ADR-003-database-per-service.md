# ADR-003 — Estrategia de Base de Datos por Servicio

| Campo | Valor |
| :--- | :--- |
| **Estado** | Aceptado |
| **Fecha** | 2026-05-22 |
| **Contexto** | SRS Caso 13 — Sistema de Gestión de Prácticas |

---

## Contexto

La arquitectura de microservicios requiere una estrategia de persistencia que permita a cada servicio evolucionar su modelo de datos de forma independiente. La elección del patrón de base de datos impacta directamente en el acoplamiento entre servicios y en la complejidad operacional.

## Decisión

**Una base de datos PostgreSQL por servicio, dentro de una misma instancia PostgreSQL** (bases de datos separadas, no schemas).

- Cada servicio tiene su propia base de datos: `auth_db`, `academic_db`, `internship_db`, `evaluation_db`, `document_db`, `notification_db`.
- Cada servicio gestiona sus propias migraciones con **Alembic**, sin coordinación con otros servicios.
- La instancia PostgreSQL es compartida solo a nivel de infraestructura (un contenedor Docker), no a nivel de datos.
- Las relaciones entre datos de diferentes servicios se resuelven vía API HTTP, no mediante joins SQL.

## Consecuencias positivas

- Cumple el principio de *database per service* sin requerir 6 instancias Docker de PostgreSQL.
- Los schemas son completamente independientes; un cambio de modelo en un servicio no requiere coordinación con otros.
- Si en el futuro se necesita escalar un servicio de forma independiente, su base de datos puede migrarse a otra instancia sin cambiar código.
- Alembic por servicio permite rollback y migraciones independientes.

## Consecuencias negativas / riesgos

- No hay integridad referencial entre servicios a nivel de base de datos; la consistencia es responsabilidad de la capa de aplicación.
- Las consultas que cruzan dominios (e.g., listar prácticas con datos de usuario) requieren múltiples llamadas HTTP.
- Backup y monitoreo de 6 bases de datos en lugar de 1.

## Alternativas descartadas

**Base de datos compartida (shared database):** Anti-patrón de microservicios. Crea acoplamiento estructural entre servicios: un cambio de schema en un servicio puede romper a otro, haciendo imposible el despliegue independiente.

**Schemas separados en la misma base de datos:** Similar a la opción elegida pero con un riesgo mayor de acoplamiento accidental (un servicio podría acceder al schema de otro con un JOIN directo). Bases de datos separadas establecen un límite más fuerte.

**Una instancia PostgreSQL por servicio (6 contenedores):** Correcto para producción de alta disponibilidad. Para el alcance no industrial de este proyecto, consume recursos innecesarios y complejiza el `docker-compose.yml` sin beneficio observable.

**MongoDB:** Los datos del sistema son relacionales (prácticas → usuarios, evaluaciones → prácticas). PostgreSQL con columnas JSON satisface los casos de estructura flexible (ítems de evaluación) sin abandonar las garantías ACID de una base relacional.
