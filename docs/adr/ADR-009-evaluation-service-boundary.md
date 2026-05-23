# ADR-009 — Límite del evaluation-service

| Campo | Valor |
| :--- | :--- |
| **Estado** | Aceptado |
| **Fecha** | 2026-05-23 |
| **Contexto** | SRS Caso 13 — Sistema de Gestión de Prácticas |

---

## Decisión arquitectónica:
Crear un `evaluation-service` dedicado para desempeño, informe y acta final.

### Alternativa A:
Guardar evaluaciones dentro del `internship-service`.

### Descarte:
Se descarta porque el cálculo de notas, ponderaciones y cierre de formularios tiene reglas propias y distintas del registro de prácticas. Mezclarlo crearía un servicio con demasiadas responsabilidades.

### Alternativa B:
Crear un servicio independiente de evaluaciones.

### Selección:
Se selecciona la alternativa B.

### Justificación:
Las evaluaciones cambian juntas y comparten reglas de cálculo, pero no forman parte del registro de práctica en sí. Separarlas mejora cohesión y permite modificar ponderaciones o formularios sin afectar el resto del flujo.

---

## Impacto

- Permite evolucionar el cálculo de notas de forma aislada.
- Evita mezclar evaluación con registro de práctica.
- Facilita validar acta final sin tocar otros dominios.
