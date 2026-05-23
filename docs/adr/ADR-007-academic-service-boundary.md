# ADR-007 — Límite del academic-service

| Campo | Valor |
| :--- | :--- |
| **Estado** | Aceptado |
| **Fecha** | 2026-05-23 |
| **Contexto** | SRS Caso 13 — Sistema de Gestión de Prácticas |

---

## Decisión arquitectónica:
Crear un `academic-service` dedicado para sedes, carreras y centros de práctica.

### Alternativa A:
Guardar sedes, carreras y centros dentro del `internship-service`.

### Descarte:
Se descarta porque el catálogo académico cambia por motivos institucionales y no por el flujo de práctica. Mezclarlo con prácticas aumentaría el tamaño del servicio principal y lo haría menos cohesivo.

### Alternativa B:
Crear un servicio académico independiente.

### Selección:
Se selecciona la alternativa B.

### Justificación:
Las sedes, carreras y centros forman un catálogo estable y propio. Separarlo permite evolucionar horas, parámetros y registros de centros sin afectar el ciclo de vida de la práctica.

---

## Impacto

- Mejora la cohesión del catálogo académico.
- Reduce cambios colaterales en el núcleo de prácticas.
- Facilita reutilizar la información académica desde otros servicios.
