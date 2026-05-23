# ADR-011 — Límite del notification-service

| Campo | Valor |
| :--- | :--- |
| **Estado** | Aceptado |
| **Fecha** | 2026-05-23 |
| **Contexto** | SRS Caso 13 — Sistema de Gestión de Prácticas |

---

## Decisión arquitectónica:
Crear un `notification-service` dedicado para correos, alertas y historial.

### Alternativa A:
Enviar correos desde cada microservicio de forma directa.

### Descarte:
Se descarta porque duplicaría plantillas, transporte SMTP y almacenamiento de historial. También haría más difícil cambiar el canal o registrar eventos.

### Alternativa B:
Crear un servicio especializado de notificaciones.

### Selección:
Se selecciona la alternativa B.

### Justificación:
Las notificaciones son una capacidad transversal que debe centralizarse. Un servicio dedicado mantiene alta cohesión del canal de comunicación y reduce el acoplamiento del resto del sistema con SMTP u otros proveedores.

---

## Impacto

- Centraliza historial y envío.
- Facilita agregar canales futuros.
- Evita que cada servicio conozca detalles de entrega.
