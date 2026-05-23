# ADR-006 — Límite del auth-service

| Campo | Valor |
| :--- | :--- |
| **Estado** | Aceptado |
| **Fecha** | 2026-05-23 |
| **Contexto** | SRS Caso 13 — Sistema de Gestión de Prácticas |

---

## Decisión arquitectónica:
Crear un `auth-service` dedicado para autenticación, usuarios y roles.

### Alternativa A:
Incluir autenticación y usuarios dentro del API Gateway o del `internship-service`.

### Descarte:
Se descarta porque mezclaría identidad con negocio o con infraestructura perimetral. Eso incrementa el acoplamiento y dificulta evolucionar reglas de acceso sin tocar práctica, evaluación o ruteo.

### Alternativa B:
Crear un servicio independiente de autenticación.

### Selección:
Se selecciona la alternativa B.

### Justificación:
La identidad cambia por razones distintas al dominio de prácticas. Un servicio propio mantiene alta cohesión, permite reusar JWT y roles en todo el sistema y evita duplicar la lógica de usuarios en otros servicios.

---

## Impacto

- Reduce acoplamiento entre seguridad y negocio.
- Centraliza login, validación y ciclo de vida de usuarios.
- Permite que los demás servicios solo consuman claims del token.
