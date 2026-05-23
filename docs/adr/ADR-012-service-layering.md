# ADR-012 — Estructura en Capas de los Microservicios

| Campo | Valor |
| :--- | :--- |
| **Estado** | Aceptado |
| **Fecha** | 2026-05-23 |
| **Contexto** | SRS Caso 13 — Sistema de Gestión de Prácticas |

---

## Decisión arquitectónica:
Usar una estructura interna en capas: `api -> services -> crud -> models/schemas`.

### Alternativa A:
Resolver validación, negocio y persistencia en un único módulo por endpoint.

### Descarte:
Se descarta porque mezcla responsabilidades, dificulta pruebas y hace que FastAPI quede acoplado al ORM y a la lógica de negocio.

### Alternativa B:
Separar entrada HTTP, lógica de negocio, acceso a datos y contratos.

### Selección:
Se selecciona la alternativa B.

### Justificación:
La capa de API recibe y valida; `services` contiene la lógica; `crud` persiste; `models` y `schemas` aíslan el esquema interno y el contrato externo. Esa separación mejora mantenibilidad y evolución.

---

## Impacto

- Facilita pruebas unitarias por capa.
- Hace más clara la responsabilidad de cada archivo.
- Reduce el acoplamiento entre FastAPI y PostgreSQL.
