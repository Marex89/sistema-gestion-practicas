# ADR-008 — Límite del internship-service

| Campo | Valor |
| :--- | :--- |
| **Estado** | Aceptado |
| **Fecha** | 2026-05-23 |
| **Contexto** | SRS Caso 13 — Sistema de Gestión de Prácticas |

---

## Decisión arquitectónica:
Crear un `internship-service` como núcleo del proceso de práctica.

### Alternativa A:
Fusionar registro de práctica, Acta 1 y evaluaciones en un solo servicio grande.

### Descarte:
Se descarta porque mezclaría seguimiento de práctica con evaluación académica y documental, produciendo un servicio más difícil de mantener y con fronteras confusas.

### Alternativa B:
Mantener `internship-service` sólo para registro, estados, Acta 1 y coordinación del proceso.

### Selección:
Se selecciona la alternativa B.

### Justificación:
El flujo de práctica es el corazón del sistema y necesita un dueño claro. Con esta separación, el servicio concentra la lógica de inscripción, asignación de docente y cambio de estado sin absorber reglas de evaluación ni de almacenamiento documental.

---

## Impacto

- Alta cohesión alrededor del ciclo de vida de la práctica.
- Bajo acoplamiento con evaluación y documentos.
- Reglas de negocio más fáciles de probar y extender.
