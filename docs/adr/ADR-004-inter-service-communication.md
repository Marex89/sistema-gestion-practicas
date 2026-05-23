# ADR-004 — Comunicación Inter-Servicio

| Campo | Valor |
| :--- | :--- |
| **Estado** | Aceptado |
| **Fecha** | 2026-05-22 |
| **Contexto** | SRS Caso 13 — Sistema de Gestión de Prácticas |

---

## Contexto

Los servicios necesitan intercambiar datos entre sí (e.g., `internship-service` valida usuarios contra `auth-service`; los servicios disparan notificaciones hacia `notification-service`). Se requiere elegir un mecanismo de comunicación que sea simple, debuggeable y acorde al alcance no industrial del sistema.

## Decisión

**HTTP/REST síncrono con `httpx` (cliente async de Python). Sin message broker.**

- Todas las llamadas inter-servicio son HTTP REST con `httpx.AsyncClient`.
- Los "eventos" (notificaciones disparadas por cambios de estado) se implementan como llamadas HTTP directas a `notification-service` con `POST /notify`.
- Se aplica un timeout configurable en todas las llamadas inter-servicio para evitar bloqueos en cascada.
- Los servicios que llaman a otros manejan el caso de error (servicio no disponible) con respuestas degradadas o errores 503 claros al cliente.

### Patrón de llamada

```
InternshipService.services.practica_service
    → httpx.AsyncClient.get("http://auth-service/users/{id}")
    → retorna UserDTO (solo los campos necesarios)
```

Los DTOs de respuesta entre servicios son mínimos (solo los campos requeridos por el consumidor), no se reutilizan los schemas internos de cada servicio.

## Consecuencias positivas

- Simple de implementar y de razonar: un request HTTP es trazable en logs estándar.
- Sin infraestructura adicional (no hay broker que desplegar ni configurar).
- FastAPI + httpx async mantiene el modelo de concurrencia consistente en todo el stack.
- Fácil de probar: los servicios downstream se mockean con `pytest` + `respx`.

## Consecuencias negativas / riesgos

- Acoplamiento temporal: si `auth-service` está caído, `internship-service` no puede validar usuarios.
- Las llamadas síncronas encadenadas pueden aumentar la latencia percibida.
- Sin reintentos automáticos (se acepta esta limitación para mantener simplicidad; se puede agregar `tenacity` si se necesita).

## Alternativas descartadas

**RabbitMQ / Kafka (comunicación asíncrona con broker):** Permite desacoplamiento temporal fuerte y mayor resiliencia. Descartado porque el volumen de tráfico inter-servicio es bajo, el sistema no tiene requerimientos de alta disponibilidad, y añade un componente de infraestructura adicional (broker + consumers) que aumenta la complejidad operacional más allá del beneficio para este alcance.

**gRPC:** Protocolo más eficiente que REST con tipado fuerte via protobuf. Descartado porque requiere compilar schemas `.proto`, herramientas adicionales y tiene una curva de aprendizaje mayor. No hay justificación de performance para este sistema.

**GraphQL Federation:** Requiere un gateway especializado y schema stitching entre servicios. Añade complejidad de configuración y nuevas herramientas sin ventaja para el tipo de consultas del sistema.

**Llamadas directas a BD (acceso cross-service a BD ajena):** Anti-patrón. Rompe la independencia de cada servicio y crea acoplamiento estructural severo. Descartado inmediatamente.
