# ADR-013 — Estrategia sin Herencia de Modelos

| Campo | Valor |
| :--- | :--- |
| **Estado** | Aceptado |
| **Fecha** | 2026-05-23 |
| **Contexto** | SRS Caso 13 — Sistema de Gestión de Prácticas |

---

## Decisión arquitectónica:
No usar herencia para roles de usuario ni para evaluaciones.

### Alternativa A:
Modelar `Alumno`, `Docente`, `Coordinador`, etc. como subclases de `User` y `Evaluacion` como base común.

### Descarte:
Se descarta porque la herencia ORM añade complejidad sin resolver una necesidad real del dominio. También puede introducir tablas y consultas más difíciles de mantener.

### Alternativa B:
Usar `User` con campo `rol` y entidades separadas para evaluaciones.

### Selección:
Se selecciona la alternativa B.

### Justificación:
El rol expresa el comportamiento sin dividir artificialmente la identidad. Las evaluaciones, por su parte, tienen flujos distintos y se entienden mejor como entidades separadas. Esto reduce acoplamiento y simplifica la persistencia.

---

## Impacto

- Evita *table-per-hierarchy* innecesario.
- Mejora claridad del dominio.
- Reduce complejidad de autenticación y evaluación.
